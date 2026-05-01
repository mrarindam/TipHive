import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

const WALLET_REGEX = /^0x[a-fA-F0-9]{40}$/;
const USERNAME_REGEX = /^[a-z0-9_]{3,24}$/;

export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get('wallet');

    if (!wallet || !WALLET_REGEX.test(wallet)) {
      return NextResponse.json({ error: 'Valid wallet required' }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const normalizedWallet = wallet.toLowerCase();

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', normalizedWallet)
      .maybeSingle();

    if (error) throw error;
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
    const wallet = body.wallet_address;

    if (!wallet || !WALLET_REGEX.test(wallet)) {
      return NextResponse.json({ error: 'Valid wallet required' }, { status: 400 });
    }

    const socialLinks = {
      twitter: body.social_links?.twitter || '',
      discord: body.social_links?.discord || '',
      website: body.social_links?.website || '',
    };
    const normalizedWallet = wallet.toLowerCase();
    const username = String(body.username || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json({ error: 'Username must be 3-24 characters: lowercase letters, numbers, underscore' }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { data: usernameOwner, error: usernameError } = await supabase
      .from('user_profiles')
      .select('wallet_address')
      .eq('username', username)
      .neq('wallet_address', normalizedWallet)
      .maybeSingle();

    if (usernameError) throw usernameError;
    if (usernameOwner) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
    }

    const enableCreator = Boolean(body.enable_creator);
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        username,
        display_name: String(body.display_name || '').slice(0, 80),
        bio: String(body.bio || '').slice(0, 280),
        avatar_url: body.avatar_url || undefined,
        social_links: socialLinks,
        is_creator: enableCreator || undefined,
        creator_category: enableCreator ? String(body.creator_category || 'Creator').slice(0, 80) : undefined,
        creator_description: enableCreator ? String(body.creator_description || '').slice(0, 500) : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('wallet_address', normalizedWallet)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ profile: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
