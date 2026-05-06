import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get('wallet');
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_address', wallet.toLowerCase())
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
    console.log('Notification POST body:', body);
    const { wallet, action, type, content } = body;

    if (!wallet || !action) {
      return NextResponse.json({ error: 'Wallet and action required' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    if (action === 'markAllRead') {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_address', wallet.toLowerCase())
        .eq('is_read', false);

      if (error) {
        console.error('Error marking notifications as read:', error);
        throw error;
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'create') {
      if (!type || !content) {
        return NextResponse.json({ error: 'Type and content required' }, { status: 400 });
      }

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_address: wallet.toLowerCase(),
          type,
          content,
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
