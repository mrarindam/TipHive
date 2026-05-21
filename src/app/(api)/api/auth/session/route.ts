import { NextResponse } from 'next/server';
import { getWalletSession } from '@/lib/wallet-session';

export async function GET() {
  const session = await getWalletSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    address: session.address,
    chainId: session.chainId,
  });
}

