import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

import { privy } from '@/lib/privy';

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
      .select('notification_email, email_notifications_enabled, email_notif_likes, email_notif_comments, email_notif_follows')
      .eq('privy_did', verifiedDid)
      .maybeSingle();

    // If columns are missing, Supabase might return an error. 
    // In that case, we return default settings.
    if (error) {
      console.warn('Notification settings columns might be missing:', error.message);
      return NextResponse.json({ 
        settings: {
          email_notifications_enabled: true,
          email_notif_likes: true,
          email_notif_comments: true,
          email_notif_follows: true,
          notification_email: ''
        } 
      });
    }

    return NextResponse.json({ 
      settings: {
        email_notifications_enabled: data?.email_notifications_enabled ?? true,
        email_notif_likes: data?.email_notif_likes ?? true,
        email_notif_comments: data?.email_notif_comments ?? true,
        email_notif_follows: data?.email_notif_follows ?? true,
        notification_email: data?.notification_email || ''
      } 
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error fetching settings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json({ error: 'Settings required' }, { status: 400 });
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

    const supabase = createServerSupabase();
    
    interface UpdateData {
      email_notifications_enabled: boolean;
      email_notif_likes: boolean;
      email_notif_comments: boolean;
      email_notif_follows: boolean;
      updated_at: string;
      notification_email?: string;
    }

    const updateData: UpdateData = {
      email_notifications_enabled: settings.email_notifications_enabled,
      email_notif_likes: settings.email_notif_likes,
      email_notif_comments: settings.email_notif_comments,
      email_notif_follows: settings.email_notif_follows,
      updated_at: new Date().toISOString(),
    };

    // If they provided a new email in the settings (optional)
    if (settings.notification_email) {
      updateData.notification_email = settings.notification_email.toLowerCase().trim();
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('privy_did', verifiedDid);

    if (error) {
      console.error('Failed to update notification settings:', error);
      // If columns are missing, we might need to tell the user
      if (error.code === '42703') { // undefined_column
        return NextResponse.json({ error: 'Database columns for notification settings are missing. Please add them to user_profiles table.' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error saving settings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
