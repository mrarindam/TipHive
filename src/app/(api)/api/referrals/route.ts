import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { privy } from '@/lib/privy';

export async function GET(request: NextRequest) {
  try {
    const did = request.nextUrl.searchParams.get('did');

    if (!did) {
      return NextResponse.json({ error: 'Missing privy_did' }, { status: 400 });
    }

    // --- SECURE AUTH CHECK ---
    const header = request.headers.get('authorization');
    const token = header?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
    try {
      const { user_id: verifiedDid } = await privy.utils().auth().verifyAccessToken(token);
      if (verifiedDid !== did) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    } catch { return NextResponse.json({ error: 'Invalid session' }, { status: 401 }); }
    // -------------------------

    const supabase = createServerSupabase();

    // Fetch users referred by this DID
    const { data: referredUsers, error: referralError } = await supabase
      .from('user_profiles')
      .select('id, username, display_name, avatar_url, created_at')
      .eq('referred_by', did);

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
