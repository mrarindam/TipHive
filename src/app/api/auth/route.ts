import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

const WALLET_REGEX = /^0x[a-fA-F0-9]{40}$/;
const ADJECTIVES = ['neon', 'pixel', 'cosmic', 'hyper', 'mint', 'nova', 'sonic', 'glow', 'lucky', 'prime'];
const NOUNS = ['maker', 'coder', 'fan', 'spark', 'pilot', 'vault', 'hive', 'stack', 'rider', 'byte'];

function avatarFor(wallet: string) {
  return `https://api.dicebear.com/9.x/shapes/svg?seed=${wallet}`;
}

async function generateProfileDefaults(supabase: ReturnType<typeof createServerSupabase>, wallet: string) {
  const seed = wallet.slice(2, 8);
  const a = parseInt(wallet.slice(2, 4), 16) % ADJECTIVES.length;
  const n = parseInt(wallet.slice(4, 6), 16) % NOUNS.length;
  const displayName = `${ADJECTIVES[a]} ${NOUNS[n]}`.replace(/\b\w/g, (letter) => letter.toUpperCase());
  const baseUsername = `${ADJECTIVES[a]}_${NOUNS[n]}_${seed}`.toLowerCase();
  let username = baseUsername;

  for (let index = 0; index < 5; index += 1) {
    const { data } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (!data) return { displayName, username };
    username = `${baseUsername}_${index + 1}`;
  }

  return { displayName, username: `${baseUsername}_${Date.now().toString(36)}` };
}

export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get('wallet');

    if (!wallet || !WALLET_REGEX.test(wallet)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    const normalizedWallet = wallet.toLowerCase();
    const supabase = createServerSupabase();

    const { data: existingUser, error: existingError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', normalizedWallet)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existingUser) {
      if (!existingUser.username || !existingUser.display_name || !existingUser.avatar_url) {
        const defaults = await generateProfileDefaults(supabase, normalizedWallet);
        const { data: repairedUser, error: repairError } = await supabase
          .from('user_profiles')
          .update({
            username: existingUser.username || defaults.username,
            display_name: existingUser.display_name || defaults.displayName,
            avatar_url: existingUser.avatar_url || avatarFor(normalizedWallet),
            updated_at: new Date().toISOString(),
          })
          .eq('wallet_address', normalizedWallet)
          .select()
          .single();

        if (repairError) throw repairError;
        return NextResponse.json({ user: repairedUser, isNewUser: false });
      }

      return NextResponse.json({ user: existingUser, isNewUser: false });
    }

    const defaults = await generateProfileDefaults(supabase, normalizedWallet);
    const { data: newUser, error } = await supabase
      .from('user_profiles')
      .insert({
        wallet_address: normalizedWallet,
        username: defaults.username,
        display_name: defaults.displayName,
        bio: '',
        avatar_url: avatarFor(normalizedWallet),
        is_creator: false,
        verified_on_chain: true,
      })
      .select()
      .single();

    if (error) throw error;

    // Create welcome notification
    await supabase.from('notifications').insert({
      user_address: normalizedWallet,
      type: 'welcome',
      content: 'Welcome to TipHive! Your Web3 creator economy starts here. 🚀',
    });

    return NextResponse.json({ user: newUser, isNewUser: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load wallet profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
