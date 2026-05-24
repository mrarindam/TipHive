import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { cacheGetOrSet, cacheKeys, TTL } from '@/lib/redis';

const WALLET_REGEX = /^0x[a-fA-F0-9]{40}$/;

interface Activity {
  id: string;
  type: 'sent' | 'received';
  source: 'tip' | 'subscription' | 'borrow';
  amount: number;
  to_name?: string;
  created_at: string;
  tx_hash?: string;
  from_address?: string;
  plan_name?: string;
  event_type?: 'borrow' | 'repay' | 'close';
  btc_amount?: number;
}

interface DashboardActivityBundle {
  activities: Activity[];
  totalSent: number;
  totalEarned: number;
}

interface TipRow {
  id: string;
  amount: number;
  from_address: string;
  to_address: string;
  created_at: string;
  tx_hash: string;
}

interface SubRow {
  id: string;
  total_paid: number;
  fan_address: string;
  creator_address: string;
  created_at: string;
  tx_hash: string;
  subscription_plans?: { name: string } | null;
}

interface BorrowRow {
  id: string;
  wallet: string;
  event_type: 'borrow' | 'repay' | 'close';
  musd_amount: number | null;
  btc_amount: number | null;
  tx_hash: string;
  chain_id: number;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const wallet = (request.nextUrl.searchParams.get('wallet') ?? '').toLowerCase();
    const chainIdRaw = request.nextUrl.searchParams.get('chainId') ?? '';

    if (!WALLET_REGEX.test(wallet)) {
      return NextResponse.json({ error: 'Invalid wallet' }, { status: 400 });
    }

    const chainId = parseInt(chainIdRaw, 10);
    if (isNaN(chainId) || chainId <= 0) {
      return NextResponse.json({ error: 'Invalid chainId' }, { status: 400 });
    }

    const bundle = await cacheGetOrSet<DashboardActivityBundle>(
      cacheKeys.dashboardActivity(wallet, chainId),
      TTL.short,
      async () => {
        const supabase = createServerSupabase();

        const [stRes, rtRes, rsRes, ssRes, beRes] = await Promise.all([
          supabase.from('tips').select('*').eq('from_address', wallet).eq('chain_id', chainId),
          supabase.from('tips').select('*').eq('to_address', wallet).eq('chain_id', chainId),
          supabase
            .from('subscriptions')
            .select('*, subscription_plans(name)')
            .eq('creator_address', wallet)
            .eq('chain_id', chainId),
          supabase
            .from('subscriptions')
            .select('*, subscription_plans(name)')
            .eq('fan_address', wallet)
            .eq('chain_id', chainId),
          supabase.from('borrow_events').select('*').eq('wallet', wallet).eq('chain_id', chainId),
        ]);

        const sentTips = (stRes.data || []) as TipRow[];
        const receivedTips = (rtRes.data || []) as TipRow[];
        const receivedSubs = (rsRes.data || []) as SubRow[];
        const sentSubs = (ssRes.data || []) as SubRow[];
        const borrowEvents = (beRes.data || []) as BorrowRow[];

        const totalSent =
          sentTips.reduce((sum, tip) => sum + (Number(tip.amount) || 0), 0) +
          sentSubs.reduce((sum, sub) => sum + (Number(sub.total_paid) || 0), 0);

        const totalEarned =
          receivedTips.reduce((sum, tip) => sum + (Number(tip.amount) || 0), 0) +
          receivedSubs.reduce((sum, sub) => sum + (Number(sub.total_paid) || 0), 0);

        const knownAddresses = Array.from(
          new Set(
            [
              ...sentTips.map((tip) => tip.to_address),
              ...receivedTips.map((tip) => tip.from_address),
              ...receivedSubs.map((sub) => sub.fan_address),
              ...sentSubs.map((sub) => sub.creator_address),
            ]
              .filter(Boolean)
              .map((addr) => addr.toLowerCase()),
          ),
        );

        const profileByAddress = new Map<string, string>();
        if (knownAddresses.length > 0) {
          const { data: knownProfiles } = await supabase
            .from('user_profiles')
            .select('wallet_address, display_name, username')
            .in('wallet_address', knownAddresses);

          for (const p of knownProfiles || []) {
            const label = p.username
              ? `${p.display_name} (@${p.username})`
              : p.display_name;
            profileByAddress.set((p.wallet_address as string).toLowerCase(), label);
          }
        }

        const activities: Activity[] = [];

        for (const s of sentTips) {
          activities.push({
            id: s.id,
            type: 'sent',
            source: 'tip',
            amount: s.amount,
            to_name:
              profileByAddress.get(s.to_address?.toLowerCase()) ||
              s.to_address?.slice(0, 10) ||
              'Anonymous',
            created_at: s.created_at,
            tx_hash: s.tx_hash,
          });
        }

        for (const r of receivedTips) {
          activities.push({
            id: r.id,
            type: 'received',
            source: 'tip',
            amount: r.amount,
            from_address: r.from_address,
            to_name:
              profileByAddress.get(r.from_address?.toLowerCase()) ||
              r.from_address?.slice(0, 10) ||
              'Anonymous',
            created_at: r.created_at,
            tx_hash: r.tx_hash,
          });
        }

        for (const sub of receivedSubs) {
          activities.push({
            id: sub.id,
            type: 'received',
            source: 'subscription',
            amount: sub.total_paid,
            from_address: sub.fan_address,
            to_name:
              profileByAddress.get(sub.fan_address?.toLowerCase()) ||
              sub.fan_address?.slice(0, 10) ||
              'Anonymous',
            created_at: sub.created_at,
            tx_hash: sub.tx_hash,
            plan_name: sub.subscription_plans?.name,
          });
        }

        for (const sub of sentSubs) {
          activities.push({
            id: sub.id,
            type: 'sent',
            source: 'subscription',
            amount: sub.total_paid,
            to_name:
              profileByAddress.get(sub.creator_address?.toLowerCase()) ||
              sub.creator_address?.slice(0, 10) ||
              'Anonymous',
            created_at: sub.created_at,
            tx_hash: sub.tx_hash,
            plan_name: sub.subscription_plans?.name,
          });
        }

        for (const b of borrowEvents) {
          activities.push({
            id: b.id,
            type: b.event_type === 'borrow' ? 'received' : 'sent',
            source: 'borrow',
            amount: Number(b.musd_amount ?? 0),
            btc_amount: b.btc_amount !== null ? Number(b.btc_amount) : undefined,
            event_type: b.event_type,
            created_at: b.created_at,
            tx_hash: b.tx_hash,
          });
        }

        activities.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        return { activities, totalSent, totalEarned };
      },
    );

    return NextResponse.json(bundle);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load activity';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
