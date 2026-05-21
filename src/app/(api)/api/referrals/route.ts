import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { requireWalletSession } from '@/lib/wallet-session';

export async function GET() {
  try {
    const session = await requireWalletSession();
    const supabase = createServerSupabase();

    // Fetch users referred by this wallet address
    const { data: referredUsers, error: referralError } = await supabase
      .from('user_profiles')
      .select('id, username, display_name, avatar_url, created_at')
      .eq('referred_by', session.address);

    if (referralError) throw referralError;

    return NextResponse.json({
      referrals: referredUsers || [],
      totalCount: referredUsers?.length || 0,
    });
  } catch (error) {
    console.error('REFERRAL_API_ERROR:', error);
    const message = error instanceof Error ? error.message : 'Unable to load referrals';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
