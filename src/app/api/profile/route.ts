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

    const socialLinks = Array.isArray(body.social_links) ? body.social_links : [];
    const normalizedWallet = wallet.toLowerCase();
    const supabase = createServerSupabase();
    const username = String(body.username || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    interface ProfileUpdate {
      updated_at: string;
      username?: string;
      display_name?: string;
      bio?: string;
      avatar_url?: string;
      banner_url?: string;
      social_links?: string[];
      is_creator?: boolean;
      creator_category?: string;
      creator_description?: string;
      location?: string;
      button_text?: string;
      thank_you_message?: string;
      suggested_amounts?: number[];
    }

    const updateData: ProfileUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (body.username) {
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('wallet_address', normalizedWallet)
        .single();

      if (currentProfile?.username !== username) {
        if (!USERNAME_REGEX.test(username)) {
          return NextResponse.json({ error: 'Username must be 3-24 characters: lowercase letters, numbers, underscore' }, { status: 400 });
        }

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
        updateData.username = username;
      }
    }

    if (body.display_name !== undefined) updateData.display_name = String(body.display_name).slice(0, 80);
    if (body.bio !== undefined) updateData.bio = String(body.bio).slice(0, 280);
    if (body.avatar_url !== undefined) updateData.avatar_url = body.avatar_url;
    if (body.banner_url !== undefined) updateData.banner_url = body.banner_url;
    if (body.social_links !== undefined) updateData.social_links = socialLinks;
    if (body.is_creator !== undefined) updateData.is_creator = Boolean(body.is_creator);
    if (body.creator_category !== undefined) updateData.creator_category = String(body.creator_category).slice(0, 80);
    if (body.creator_description !== undefined) updateData.creator_description = String(body.creator_description).slice(0, 500);
    if (body.location !== undefined) updateData.location = String(body.location).slice(0, 100);
    if (body.button_text !== undefined) updateData.button_text = body.button_text;
    if (body.thank_you_message !== undefined) updateData.thank_you_message = body.thank_you_message;
    if (body.suggested_amounts !== undefined) updateData.suggested_amounts = body.suggested_amounts;

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('wallet_address', normalizedWallet)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ profile: data });
  } catch (error) {
    console.error('Profile update error:', error);
    const message = error instanceof Error ? error.message : 'Unable to update profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
