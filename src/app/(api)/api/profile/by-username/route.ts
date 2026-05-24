import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { cacheGetOrSet, cacheKeys, TTL } from '@/lib/redis';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{1,32}$/;

interface FullProfileBundle {
  profile: Record<string, unknown>;
  postsCount: number;
  followersCount: number;
  earningsByChain: Record<string, number>;
}

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get('username');

    if (!username || !USERNAME_REGEX.test(username)) {
      return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const normalizedUsername = username.toLowerCase();

    const wallet = await cacheGetOrSet<string | null>(
      cacheKeys.usernameToWallet(normalizedUsername),
      TTL.day,
      async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('wallet_address')
          .ilike('username', normalizedUsername)
          .maybeSingle();
        if (error) throw error;
        return data?.wallet_address ?? null;
      },
    );

    if (!wallet) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const walletLower = wallet.toLowerCase();

    const bundle = await cacheGetOrSet<FullProfileBundle | null>(
      cacheKeys.fullProfileByWallet(walletLower),
      TTL.long,
      async () => {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('wallet_address', walletLower)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profile) return null;

        const [postsRes, followersRes, tipsRes, subsRes] = await Promise.all([
          supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('creator_id', profile.id),
          supabase
            .from('followers')
            .select('*', { count: 'exact', head: true })
            .eq('creator_id', profile.id),
          supabase
            .from('tips')
            .select('amount, chain_id')
            .eq('to_address', walletLower),
          supabase
            .from('subscriptions')
            .select('total_paid, chain_id')
            .eq('creator_address', walletLower),
        ]);

        const earningsByChain: Record<string, number> = {};
        for (const tip of tipsRes.data || []) {
          const chainKey = String(tip.chain_id);
          earningsByChain[chainKey] = (earningsByChain[chainKey] || 0) + (Number(tip.amount) || 0);
        }
        for (const sub of subsRes.data || []) {
          const chainKey = String(sub.chain_id);
          earningsByChain[chainKey] = (earningsByChain[chainKey] || 0) + (Number(sub.total_paid) || 0);
        }

        return {
          profile,
          postsCount: postsRes.count || 0,
          followersCount: followersRes.count || 0,
          earningsByChain,
        };
      },
    );

    if (!bundle) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(bundle);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
