import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { cacheGetOrSet, cacheKeys, TTL } from '@/lib/redis';

const WALLET_REGEX = /^0x[a-fA-F0-9]{40}$/;

interface AccessBundle {
  tipped: string[];
  subscribed: string[];
}

export async function GET(request: NextRequest) {
  try {
    const wallet = (request.nextUrl.searchParams.get('wallet') ?? '').toLowerCase();

    if (!WALLET_REGEX.test(wallet)) {
      return NextResponse.json({ error: 'Invalid wallet' }, { status: 400 });
    }

    const result = await cacheGetOrSet<AccessBundle>(
      cacheKeys.userAccessBundle(wallet),
      TTL.short,
      async () => {
        const supabase = createServerSupabase();

        const [{ data: tips }, { data: subs }] = await Promise.all([
          supabase.from('tips').select('to_address').eq('from_address', wallet),
          supabase
            .from('subscriptions')
            .select('creator_address, end_date')
            .eq('fan_address', wallet)
            .eq('active', true),
        ]);

        const tipped = (tips || [])
          .map((t) => (t.to_address as string)?.toLowerCase())
          .filter(Boolean);

        const now = new Date();
        const subscribed = (subs || [])
          .filter((s) => new Date(s.end_date) > now)
          .map((s) => (s.creator_address as string)?.toLowerCase())
          .filter(Boolean);

        return { tipped, subscribed };
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load access';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
