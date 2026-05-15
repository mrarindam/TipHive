import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/brevo';
import { notificationTemplate } from '@/lib/email-templates';
import { privy } from '@/lib/privy';

async function getVerifiedDid(request: NextRequest) {
  const header = request.headers.get('authorization');
  const token = header?.replace('Bearer ', '');
  if (!token) return null;

  const verified = await privy.utils().auth().verifyAccessToken(token);
  return verified.user_id;
}

async function getOwnedNotificationIdentifiers(supabase: ReturnType<typeof createServerSupabase>, verifiedDid: string) {
  const identifiers = [verifiedDid];
  const { data: userProfile, error } = await supabase
    .from('user_profiles')
    .select('wallet_address')
    .eq('privy_did', verifiedDid)
    .maybeSingle();

  if (error) throw error;
  if (userProfile?.wallet_address) identifiers.push(userProfile.wallet_address.toLowerCase());
  return identifiers;
}


export async function GET(request: NextRequest) {
  try {
    let verifiedDid: string;
    try {
      const did = await getVerifiedDid(request);
      if (!did) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
      verifiedDid = did;
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const supabase = createServerSupabase();
    const identifiers = await getOwnedNotificationIdentifiers(supabase, verifiedDid);

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .in('user_address', identifiers)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ notifications: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error fetching notifications';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, did, action } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action required' }, { status: 400 });
    }

    let verifiedDid: string;
    try {
      const tokenDid = await getVerifiedDid(request);
      if (!tokenDid) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
      verifiedDid = tokenDid;
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const supabase = createServerSupabase();

    if (action === 'markAllRead') {
      const identifiers = await getOwnedNotificationIdentifiers(supabase, verifiedDid);
      const requestedIdentifiers = [did, wallet?.toLowerCase()].filter((identifier): identifier is string => Boolean(identifier));
      if (requestedIdentifiers.some((identifier) => !identifiers.includes(identifier))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('user_address', identifiers)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking notifications as read:', error);
        throw error;
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'create') {
      const { type, content: manualContent, postTitle } = body;
      const actor = body.actor || verifiedDid;
      
      if (!type) {
        return NextResponse.json({ error: 'Type required' }, { status: 400 });
      }

      const targetIdentifier = wallet ? wallet.toLowerCase() : did;
      if (!targetIdentifier) {
        return NextResponse.json({ error: 'Target identifier (wallet/did) required' }, { status: 400 });
      }

      let finalContent = manualContent;

      // If an actor is provided, construct the content automatically
      if (actor) {
        const { data: actorProfile } = await supabase
          .from('user_profiles')
          .select('display_name, username')
          .or(`wallet_address.eq."${actor.toLowerCase()}",privy_did.eq."${actor}"`)
          .maybeSingle();

        const identifier = actorProfile?.username || 'someone';

        if (type === 'follow') {
          finalContent = `👤 ${identifier} started following you!`;
        } else if (type === 'like') {
          finalContent = `❤️ ${identifier} liked your post${postTitle ? `: "${postTitle}"` : ''}`;
        } else if (type === 'comment') {
          finalContent = `💬 ${identifier} commented on your post${postTitle ? `: "${postTitle}"` : ''}`;
        }
      }

      if (!finalContent) {
        return NextResponse.json({ error: 'Content could not be constructed' }, { status: 400 });
      }

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_address: targetIdentifier,
          type: ['like', 'comment', 'follow'].includes(type) ? 'tip' : type,
          content: finalContent,
          is_read: false
        });

      if (error) {
        console.error('Error creating notification:', error);
        throw error;
      }

      // --- BREVO INTEGRATION ---
      // Try to send email notification if the user has an email set
      try {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('notification_email, username, display_name, email_notifications_enabled, email_notif_likes, email_notif_comments, email_notif_follows')
          .or(`wallet_address.eq."${targetIdentifier.toLowerCase()}",privy_did.eq."${targetIdentifier}"`)
          .maybeSingle();

        if (userProfile?.notification_email) {
          // Check if user has disabled this type of notification or global notifications
          const isEnabled = userProfile.email_notifications_enabled ?? true;
          const prefKey = `email_notif_${type}s` as keyof typeof userProfile;
          const typeEnabled = userProfile[prefKey] ?? true;

          if (isEnabled && typeEnabled) {
            await sendEmail({
              to: userProfile.notification_email,
              subject: `New Notification: ${type.charAt(0).toUpperCase() + type.slice(1)}`,
              htmlContent: notificationTemplate(finalContent, `https://tiphive.xyz/dashboard`)
            });
          }
        }
      } catch (emailErr) {
        console.error('Failed to send notification email:', emailErr);
      }
      // -------------------------

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Notification API Error:', error);
    const message = error instanceof Error ? error.message : 'Error updating notifications';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
