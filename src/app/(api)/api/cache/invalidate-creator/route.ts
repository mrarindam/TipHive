import { NextRequest, NextResponse } from 'next/server';
import { cacheDel, cacheDelPattern, cacheKeys } from '@/lib/redis';

const WALLET_REGEX = /^0x[a-fA-F0-9]{40}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const creatorAddress = String(body?.creatorAddress || '').toLowerCase();
    const fanAddress = body?.fanAddress
      ? String(body.fanAddress).toLowerCase()
      : null;

    if (!WALLET_REGEX.test(creatorAddress)) {
      return NextResponse.json(
        { error: 'Invalid creator address' },
        { status: 400 },
      );
    }

    const keysToDelete = [
      cacheKeys.profileByWallet(creatorAddress),
      cacheKeys.userByWallet(creatorAddress),
      cacheKeys.fullProfileByWallet(creatorAddress),
      cacheKeys.buttonCount(creatorAddress),
    ];

    if (fanAddress && WALLET_REGEX.test(fanAddress)) {
      keysToDelete.push(cacheKeys.userAccessBundle(fanAddress));
    }

    await cacheDel(...keysToDelete);

    const dashboardDeleted = await Promise.all([
      cacheDelPattern(cacheKeys.dashboardActivityPattern(creatorAddress)),
      fanAddress && WALLET_REGEX.test(fanAddress)
        ? cacheDelPattern(cacheKeys.dashboardActivityPattern(fanAddress))
        : Promise.resolve(0),
    ]);

    return NextResponse.json({
      ok: true,
      invalidated: keysToDelete.length + dashboardDeleted.reduce((a, b) => a + b, 0),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Cache invalidation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
