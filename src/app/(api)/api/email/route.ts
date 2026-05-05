import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_address, email } = body;

    if (!wallet_address || !email) {
      return NextResponse.json({ error: 'wallet_address and email are required' }, { status: 400 });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const normalizedWallet = wallet_address.toLowerCase();

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        notification_email: email.toLowerCase().trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('wallet_address', normalizedWallet)
      .select('wallet_address, notification_email')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, profile: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save email';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get('wallet');
    if (!wallet) return NextResponse.json({ error: 'wallet required' }, { status: 400 });

    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('notification_email')
      .eq('wallet_address', wallet.toLowerCase())
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ email: data?.notification_email || '' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch email';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
