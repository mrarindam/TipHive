import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

import { privy } from '@/lib/privy';
import { sendEmail } from '@/lib/brevo';
import { emailUpdateTemplate } from '@/lib/email-templates';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    // --- SECURE AUTH CHECK ---
    const header = request.headers.get('authorization');
    const token = header?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
    let verifiedDid: string;
    try {
      const verified = await privy.utils().auth().verifyAccessToken(token);
      verifiedDid = verified.user_id;
    } catch { return NextResponse.json({ error: 'Invalid session' }, { status: 401 }); }
    // -------------------------

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        notification_email: email.toLowerCase().trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('privy_did', verifiedDid)
      .select('privy_did, notification_email')
      .single();

    if (error) throw error;
    
    // --- BREVO INTEGRATION ---
    try {
      if (email) {
        await sendEmail({
          to: email.toLowerCase().trim(),
          subject: 'Email Notifications Enabled ✅',
          htmlContent: emailUpdateTemplate()
        });
      }
    } catch (emailErr) {
      console.error('Failed to send confirmation email:', emailErr);
    }
    // -------------------------

    return NextResponse.json({ success: true, profile: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save email';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // --- SECURE AUTH CHECK ---
    const header = request.headers.get('authorization');
    const token = header?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
    let verifiedDid: string;
    try {
      const verified = await privy.utils().auth().verifyAccessToken(token);
      verifiedDid = verified.user_id;
    } catch { return NextResponse.json({ error: 'Invalid session' }, { status: 401 }); }
    // -------------------------

    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('notification_email')
      .eq('privy_did', verifiedDid)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ email: data?.notification_email || '' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch email';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
