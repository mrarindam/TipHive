export async function invalidateCreatorCache(
  creatorAddress: string,
  fanAddress?: string,
): Promise<void> {
  try {
    await fetch('/api/cache/invalidate-creator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorAddress, fanAddress }),
    });
  } catch {
    // best-effort — TTL will refresh stale data within 15 min worst case
  }
}
