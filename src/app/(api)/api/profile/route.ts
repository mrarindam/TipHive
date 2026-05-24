import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { requireWalletSession } from '@/lib/wallet-session';
import { cacheGetOrSet, cacheDel, cacheKeys, TTL } from '@/lib/redis';

const WALLET_REGEX = /^0x[a-fA-F0-9]{40}$/;
const USERNAME_REGEX = /^[a-z0-9_]{3,24}$/;
const PUBLIC_PROFILE_FIELDS = [
  'id',
  'wallet_address',
  'username',
  'display_name',
  'bio',
  'avatar_url',
  'banner_url',
  'social_links',
  'is_creator',
  'creator_category',
  'creator_description',
  'location',
  'button_text',
  'thank_you_message',
  'suggested_amounts',
  'verified_on_chain',
  'total_earned',
  'created_at',
  'updated_at',
].join(', ');

export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'wallet required' }, { status: 400 });
    }

    if (!WALLET_REGEX.test(wallet)) {
      return NextResponse.json({ error: 'Invalid identifiers' }, { status: 400 });
    }

    const walletLower = wallet.toLowerCase();

    const profile = await cacheGetOrSet(
      cacheKeys.profileByWallet(walletLower),
      TTL.long,
      async () => {
        const supabase = createServerSupabase();
        const { data, error } = await supabase
          .from('user_profiles')
          .select(PUBLIC_PROFILE_FIELDS)
          .eq('wallet_address', walletLower)
          .maybeSingle();

        if (error) throw error;
        return data;
      },
    );

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const session = await requireWalletSession();

    const socialLinks = body.social_links !== undefined ? body.social_links : undefined;
    const supabase = createServerSupabase();
    const username = String(body.username || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    interface ProfileUpdate {
      updated_at: string;
      username?: string;
      display_name?: string;
      bio?: string;
      avatar_url?: string;
      banner_url?: string;
      social_links?: Record<string, string | number | boolean | null>;
      is_creator?: boolean;
      creator_category?: string;
      creator_description?: string;
      location?: string;
      button_text?: string;
      thank_you_message?: string;
      suggested_amounts?: number[];
      referred_by?: string;
    }

    const updateData: ProfileUpdate = {
      updated_at: new Date().toISOString(),
    };

    let oldUsername: string | null = null;

    if (body.username) {
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('wallet_address', session.address)
        .single();

      oldUsername = currentProfile?.username ?? null;

      if (currentProfile?.username !== username) {
        if (!USERNAME_REGEX.test(username)) {
          return NextResponse.json({ error: 'Username must be 3-24 characters: lowercase letters, numbers, underscore' }, { status: 400 });
        }

        const usernameQuery = supabase
          .from('user_profiles')
          .select('wallet_address')
          .eq('username', username)
          .neq('wallet_address', session.address);
        
        const { data: usernameOwner, error: usernameError } = await usernameQuery.maybeSingle();

        if (usernameError) throw usernameError;
        if (usernameOwner) {
          return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
        }
        updateData.username = username;
      }
    }

    if (body.display_name !== undefined) updateData.display_name = String(body.display_name).slice(0, 80);
    if (body.bio !== undefined) updateData.bio = String(body.bio).slice(0, 280);
    if (body.avatar_url !== undefined) updateData.avatar_url = body.avatar_url;
    if (body.banner_url !== undefined) updateData.banner_url = body.banner_url;
    if (body.social_links !== undefined) updateData.social_links = socialLinks;
    if (body.is_creator !== undefined || body.enable_creator !== undefined) {
      updateData.is_creator = Boolean(body.is_creator ?? body.enable_creator);
    }
    if (body.creator_category !== undefined) updateData.creator_category = String(body.creator_category).slice(0, 80);
    if (body.creator_description !== undefined) updateData.creator_description = String(body.creator_description).slice(0, 500);
    if (body.location !== undefined) updateData.location = String(body.location).slice(0, 100);
    if (body.button_text !== undefined) updateData.button_text = body.button_text;
    if (body.thank_you_message !== undefined) updateData.thank_you_message = body.thank_you_message;
    if (body.suggested_amounts !== undefined) updateData.suggested_amounts = body.suggested_amounts;

    if (body.referred_by_code) {
      const { data: referrer } = await supabase
        .from('user_profiles')
        .select('wallet_address')
        .eq('referral_code', body.referred_by_code)
        .maybeSingle();
      
      if (referrer) {
        updateData.referred_by = referrer.wallet_address;
      }
    }

    let updateQuery = supabase.from('user_profiles').update(updateData);

    updateQuery = updateQuery.eq('wallet_address', session.address);

    const { data, error } = await updateQuery.select().single();

    if (error) throw error;

    const invalidationKeys = [
      cacheKeys.profileByWallet(session.address),
      cacheKeys.userByWallet(session.address),
      cacheKeys.fullProfileByWallet(session.address),
    ];
    if (oldUsername) {
      invalidationKeys.push(cacheKeys.profileByUsername(oldUsername));
      invalidationKeys.push(cacheKeys.usernameToWallet(oldUsername));
    }
    if (updateData.username && updateData.username !== oldUsername) {
      invalidationKeys.push(cacheKeys.profileByUsername(updateData.username));
      invalidationKeys.push(cacheKeys.usernameToWallet(updateData.username));
    }
    await cacheDel(...invalidationKeys);

    return NextResponse.json({ profile: data });
  } catch (error) {
    console.error('Profile update error:', error);
    const message = error instanceof Error ? error.message : 'Unable to update profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
