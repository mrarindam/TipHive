import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { requireWalletSession } from '@/lib/wallet-session';


export async function GET(request: NextRequest) {
  try {
    let session;
    try {
      session = await requireWalletSession();
    } catch {
      return NextResponse.json({ error: 'Auth required' }, { status: 401 });
    }

    const supabase = createServerSupabase();
    const requestedWallet = request.nextUrl.searchParams.get('wallet')?.toLowerCase();

    if (requestedWallet && requestedWallet !== session.address) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const identifiers = [session.address];

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .in('user_address', identifiers)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

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
    const { wallet, action } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action required' }, { status: 400 });
    }

    const session = await requireWalletSession();

    const supabase = createServerSupabase();

    if (action === 'markAllRead') {
      const identifiers = [session.address];
      const requestedIdentifiers = [wallet?.toLowerCase()].filter((identifier): identifier is string => Boolean(identifier));
      if (requestedIdentifiers.some((identifier) => !identifiers.includes(identifier))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('user_address', identifiers);

      if (error) {
        console.error('Error marking notifications as read:', error);
        throw error;
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'create') {
      const { type, content: manualContent, postTitle } = body;
      const actor = body.actor || session.address;
      
      if (!type) {
        return NextResponse.json({ error: 'Type required' }, { status: 400 });
      }

      const targetIdentifier = wallet ? wallet.toLowerCase() : null;
      if (!targetIdentifier) {
        return NextResponse.json({ error: 'Target wallet required' }, { status: 400 });
      }

      let finalContent = manualContent;

      // If an actor is provided, construct the content automatically
      if (actor) {
        const { data: actorProfile } = await supabase
          .from('user_profiles')
          .select('display_name, username')
          .eq('wallet_address', actor.toLowerCase())
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

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Notification API Error:', error);
    const message = error instanceof Error ? error.message : 'Error updating notifications';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
