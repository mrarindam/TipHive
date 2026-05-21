import { NextResponse } from 'next/server';
import { createNonce } from '@/lib/wallet-session';

export async function GET() {
  try {
    const nonce = await createNonce();
    return NextResponse.json({ nonce });
  } catch (error) {
    console.error('[auth/nonce] Failed to create nonce:', error);
    const message = error instanceof Error ? error.message : 'Unable to generate nonce';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

