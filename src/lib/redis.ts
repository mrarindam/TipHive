import { Redis } from '@upstash/redis';

let client: Redis | null = null;
let initialized = false;

function getClient(): Redis | null {
  if (initialized) return client;
  initialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('[redis] UPSTASH_REDIS_REST_URL or TOKEN missing — cache disabled');
    return null;
  }

  client = new Redis({ url, token });
  return client;
}

function withJitter(ttlSeconds: number): number {
  return ttlSeconds + Math.floor(ttlSeconds * 0.1 * Math.random());
}

function logEvent(event: 'HIT' | 'MISS' | 'SET' | 'DEL', key: string): void {
  if (process.env.NODE_ENV !== 'production' || process.env.REDIS_DEBUG === '1') {
    console.log(`[redis] ${event} ${key}`);
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const c = getClient();
  if (!c) return null;
  try {
    const value = await c.get<T>(key);
    return value ?? null;
  } catch (err) {
    console.warn(`[redis] GET failed for ${key}:`, err);
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const c = getClient();
  if (!c) return;
  if (value === null || value === undefined) return;
  try {
    await c.set(key, value, { ex: withJitter(ttlSeconds) });
    logEvent('SET', key);
  } catch (err) {
    console.warn(`[redis] SET failed for ${key}:`, err);
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  const c = getClient();
  if (!c || keys.length === 0) return;
  try {
    await c.del(...keys);
    for (const k of keys) logEvent('DEL', k);
  } catch (err) {
    console.warn('[redis] DEL failed:', err);
  }
}

export async function cacheGetOrSet<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    logEvent('HIT', key);
    return cached;
  }
  logEvent('MISS', key);
  const fresh = await fetcher();
  if (fresh !== null && fresh !== undefined) {
    await cacheSet(key, fresh, ttlSeconds);
  }
  return fresh;
}

export async function cacheDelPattern(pattern: string): Promise<number> {
  const c = getClient();
  if (!c) return 0;
  try {
    let cursor = '0';
    const allKeys: string[] = [];
    do {
      const result: [string, string[]] = await c.scan(cursor, { match: pattern, count: 100 });
      cursor = result[0];
      const batch = result[1];
      if (batch && batch.length) allKeys.push(...batch);
    } while (cursor !== '0');

    if (allKeys.length > 0) {
      await c.del(...allKeys);
      logEvent('DEL', `${pattern} (×${allKeys.length})`);
    }
    return allKeys.length;
  } catch (err) {
    console.warn(`[redis] DEL pattern failed for ${pattern}:`, err);
    return 0;
  }
}

export const cacheKeys = {
  profileByWallet: (wallet: string) => `profile:w:${wallet.toLowerCase()}`,
  profileByUsername: (username: string) => `profile:u:${username.toLowerCase()}`,
  fullProfileByWallet: (wallet: string) => `profile:full:w:${wallet.toLowerCase()}`,
  usernameToWallet: (username: string) => `username_to_wallet:${username.toLowerCase()}`,
  buttonCount: (wallet: string) => `button:count:w:${wallet.toLowerCase()}`,
  userByWallet: (wallet: string) => `auth:user:w:${wallet.toLowerCase()}`,
  postsByCreator: (creatorId: string) => `posts:c:${creatorId}`,
  post: (postId: string) => `post:${postId}`,
  postBySlug: (username: string, slug: string) => {
    const slugKey = slug.toLowerCase().slice(0, 100).replace(/\s+/g, '-');
    return `post:detail:u:${username.toLowerCase()}:s:${slugKey}`;
  },
  recentPosts: (page: number) => `explore:recent_posts:p${page}`,
  followersCount: (creatorId: string) => `followers_count:${creatorId}`,
  postsCount: (creatorId: string) => `posts_count:${creatorId}`,
  earnings: (wallet: string, chainId: number) =>
    `earnings:${wallet.toLowerCase()}:${chainId}`,
  embedButton: (slug: string, paramsHash: string) =>
    `embed_button:${slug.toLowerCase()}:${paramsHash}`,
  avatar: (wallet: string) => `avatar:${wallet.toLowerCase()}`,
  userAccessBundle: (wallet: string) => `user:access:${wallet.toLowerCase()}`,
  dashboardActivity: (wallet: string, chainId: number) =>
    `dashboard:activity:${wallet.toLowerCase()}:${chainId}`,
  dashboardActivityPattern: (wallet: string) =>
    `dashboard:activity:${wallet.toLowerCase()}:*`,
  exploreFeed: (page: number, search?: string) => {
    if (search) {
      const slug = search.toLowerCase().trim().slice(0, 50);
      return `explore:search:${slug}:p${page}`;
    }
    return `explore:feed:p${page}`;
  },
  referrals: (wallet: string) => `referrals:${wallet.toLowerCase()}`,
  plansByCreator: (creatorId: string) => `plans:${creatorId}`,
};

export const TTL = {
  short: 60 * 5,
  medium: 60 * 15,
  long: 60 * 30,
  hour: 60 * 60,
  day: 60 * 60 * 24,
  week: 60 * 60 * 24 * 7,
} as const;
