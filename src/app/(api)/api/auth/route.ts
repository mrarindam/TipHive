import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { getWalletSession } from '@/lib/wallet-session';
import { cacheGet, cacheSet, cacheKeys, TTL } from '@/lib/redis';

function generateReferralCode(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function avatarFor(wallet: string) {
  return `https://api.dicebear.com/9.x/shapes/svg?seed=${wallet}`;
}

function tempUsername(wallet: string) {
  return `u_${wallet.slice(2, 14)}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getWalletSession();
    const wallet = (session?.address || request.nextUrl.searchParams.get('wallet') || '').toLowerCase();

    if (!session?.address || !wallet || wallet !== session.address) {
      return NextResponse.json({ error: 'Auth required' }, { status: 401 });
    }

    const cacheKey = cacheKeys.userByWallet(wallet);
    const cached = await cacheGet<Record<string, unknown>>(cacheKey);
    if (cached) {
      return NextResponse.json({ user: cached, isNewUser: false });
    }

    const supabase = createServerSupabase();
    const { data: existingUser, error: existingError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', wallet)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existingUser) {
      if (!existingUser.referral_code) {
        const { data: updatedWithRef } = await supabase
          .from('user_profiles')
          .update({ referral_code: generateReferralCode() })
          .eq('wallet_address', wallet)
          .select()
          .single();
        const finalUser = updatedWithRef || existingUser;
        await cacheSet(cacheKey, finalUser, TTL.medium);
        return NextResponse.json({ user: finalUser, isNewUser: false });
      }
      await cacheSet(cacheKey, existingUser, TTL.medium);
      return NextResponse.json({ user: existingUser, isNewUser: false });
    }

    const username = tempUsername(wallet);
    const { data: newUser, error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        wallet_address: wallet,
        username,
        display_name: username,
        bio: '',
        avatar_url: avatarFor(wallet),
        is_creator: false,
        verified_on_chain: true,
        referral_code: generateReferralCode(),
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        const { data: retryUser } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('wallet_address', wallet)
          .single();
        if (retryUser) {
          await cacheSet(cacheKey, retryUser, TTL.medium);
          return NextResponse.json({ user: retryUser, isNewUser: false });
        }
      }
      throw insertError;
    }

    await supabase.from('notifications').insert({
      user_address: wallet,
      type: 'welcome',
      content: 'Welcome to TipHive! Your Web3 creator economy starts here.',
    });

    await cacheSet(cacheKey, newUser, TTL.medium);
    return NextResponse.json({ user: newUser, isNewUser: true });
  } catch (error) {
    console.error('AUTH_API_ERROR:', error);
    const message = error instanceof Error ? error.message : 'Unable to load wallet profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
