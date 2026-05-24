import { NextRequest, NextResponse } from 'next/server';
import { getPostBundle } from '@/lib/post-fetcher';

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get('username') ?? '';
    const slug = request.nextUrl.searchParams.get('slug') ?? '';

    if (!username || !slug) {
      return NextResponse.json({ error: 'username and slug required' }, { status: 400 });
    }

    const bundle = await getPostBundle(username, slug);

    if (!bundle) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(bundle);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
