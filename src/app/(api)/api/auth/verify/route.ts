import { NextRequest, NextResponse } from 'next/server';
import { createWalletSession, WalletSessionError } from '@/lib/wallet-session';

export async function POST(request: NextRequest) {
  try {
    const { message, signature } = await request.json();
    if (!message || !signature) {
      return NextResponse.json({ error: 'Message and signature required', reason: 'MISSING_PAYLOAD' }, { status: 400 });
    }

    const session = await createWalletSession(message, signature);
    return NextResponse.json({ ok: true, ...session });
  } catch (error) {
    if (error instanceof WalletSessionError) {
      console.error(`[auth/verify] ${error.reason}: ${error.message}`);
      return NextResponse.json({ error: error.message, reason: error.reason }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : 'Unable to verify wallet';
    console.error('[auth/verify] Unexpected error:', error);
    return NextResponse.json({ error: message, reason: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

