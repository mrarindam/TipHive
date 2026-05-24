import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { cacheGetOrSet, cacheKeys, TTL } from '@/lib/redis';

const PAGE_LIMIT = 10;
const MAX_PAGE = 100;
const RECENT_POSTS_POOL = 100;

interface ExplorePost {
  id: string;
  title: string;
  content: string;
  image_url?: string | null;
  video_url?: string | null;
  created_at: string;
  creator_id: string;
  visibility: string;
}

interface ExploreCreator {
  id: string;
  wallet_address: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  total_earned: number;
  posts: ExplorePost[];
}

interface ExploreFeedResponse {
  creators: ExploreCreator[];
  hasMore: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const pageRaw = request.nextUrl.searchParams.get('page') ?? '0';
    const search = (request.nextUrl.searchParams.get('search') ?? '').trim();

    const page = parseInt(pageRaw, 10);
    if (isNaN(page) || page < 0 || page > MAX_PAGE) {
      return NextResponse.json({ error: 'Invalid page' }, { status: 400 });
    }

    const cacheKey = cacheKeys.exploreFeed(page, search || undefined);

    const result = await cacheGetOrSet<ExploreFeedResponse>(
      cacheKey,
      TTL.short,
      async () => {
        const supabase = createServerSupabase();
        const from = page * PAGE_LIMIT;
        const to = from + PAGE_LIMIT - 1;

        let profileData: Omit<ExploreCreator, 'posts'>[] = [];

        if (!search) {
          const { data: recentPosts } = await supabase
            .from('posts')
            .select('creator_id, created_at')
            .order('created_at', { ascending: false })
            .limit(RECENT_POSTS_POOL);

          const liveCreatorIds = Array.from(
            new Set((recentPosts || []).map((p) => p.creator_id)),
          );

          const priorityIds = Array.from(new Set([...liveCreatorIds]));
          const batchPriorityIds = priorityIds.slice(from, from + PAGE_LIMIT);

          let currentBatch: Omit<ExploreCreator, 'posts'>[] = [];

          if (batchPriorityIds.length > 0) {
            const { data: priorityData } = await supabase
              .from('user_profiles')
              .select('id, wallet_address, username, display_name, bio, avatar_url, total_earned')
              .in('id', batchPriorityIds);

            if (priorityData) {
              currentBatch = priorityData.sort(
                (a, b) => priorityIds.indexOf(a.id) - priorityIds.indexOf(b.id),
              );
            }
          }

          if (currentBatch.length < PAGE_LIMIT) {
            const othersSkip = Math.max(0, from - priorityIds.length);
            const othersTake = PAGE_LIMIT - currentBatch.length;

            const excludeList = priorityIds.slice(0, 100).join(',');
            const { data: othersData } = await supabase
              .from('user_profiles')
              .select('id, wallet_address, username, display_name, bio, avatar_url, total_earned')
              .eq('is_creator', true)
              .not('id', 'in', `(${excludeList})`)
              .order('total_earned', { ascending: false })
              .range(othersSkip, othersSkip + othersTake - 1);

            if (othersData) {
              currentBatch = [...currentBatch, ...othersData];
            }
          }

          profileData = currentBatch;
        } else {
          const { data } = await supabase
            .from('user_profiles')
            .select('id, wallet_address, username, display_name, bio, avatar_url, total_earned')
            .eq('is_creator', true)
            .or(`display_name.ilike.%${search}%,username.ilike.%${search}%`)
            .order('total_earned', { ascending: false })
            .range(from, to);
          profileData = data || [];
        }

        if (profileData.length === 0) {
          return { creators: [], hasMore: false };
        }

        const hasMore = profileData.length >= PAGE_LIMIT;
        const creatorIds = profileData.map((p) => p.id);

        const { data: postsData } = await supabase
          .from('posts')
          .select('*')
          .in('creator_id', creatorIds)
          .order('created_at', { ascending: false });

        const creators: ExploreCreator[] = profileData
          .map((profile) => ({
            ...profile,
            posts: (postsData || [])
              .filter((p) => p.creator_id === profile.id)
              .slice(0, 3) as ExplorePost[],
          }))
          .filter((c) => c.posts.length > 0);

        return { creators, hasMore };
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load feed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
