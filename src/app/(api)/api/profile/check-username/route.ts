import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ available: !data });
  } catch (error) {
    console.error('Username check error:', error);
    return NextResponse.json({ error: 'Failed to check username' }, { status: 500 });
  }
}
