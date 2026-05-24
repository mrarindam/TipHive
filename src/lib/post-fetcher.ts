import { createServerSupabase } from '@/lib/supabase';
import { cacheGetOrSet, cacheKeys, TTL } from '@/lib/redis';

export interface PostBundleCreator {
  id: string;
  wallet_address: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  suggested_amounts?: string[];
  button_text?: string;
}

export interface PostBundlePost {
  id: string;
  creator_id: string;
  title: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  visibility: string;
  category: string | null;
  created_at: string;
}

export interface PostBundleComment {
  id: string;
  post_id: string;
  user_address: string;
  content: string;
  created_at: string;
  sender?: {
    wallet_address: string;
    username: string;
    display_name: string;
    avatar_url: string;
  } | null;
}

export interface PostBundle {
  creator: PostBundleCreator;
  post: PostBundlePost;
  likesCount: number;
  comments: PostBundleComment[];
}

export async function getPostBundle(
  username: string,
  slug: string,
): Promise<PostBundle | null> {
  return cacheGetOrSet<PostBundle | null>(
    cacheKeys.postBySlug(username, slug),
    TTL.short,
    async () => {
      const supabase = createServerSupabase();
      const decodedTitle = decodeURIComponent(slug);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id, wallet_address, username, display_name, avatar_url, suggested_amounts, button_text')
        .ilike('username', username)
        .maybeSingle();

      if (!profile) return null;

      const { data: post } = await supabase
        .from('posts')
        .select('id, creator_id, title, content, image_url, video_url, visibility, category, created_at')
        .eq('creator_id', profile.id)
        .ilike('title', decodedTitle)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!post) return null;

      const [likesRes, commentsRes] = await Promise.all([
        supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id),
        supabase
          .from('post_comments')
          .select('id, post_id, user_address, content, created_at')
          .eq('post_id', post.id)
          .order('created_at', { ascending: false }),
      ]);

      const commentsRaw = commentsRes.data || [];

      let comments: PostBundleComment[] = [];
      if (commentsRaw.length > 0) {
        const commenterIds = Array.from(
          new Set(commentsRaw.map((c) => c.user_address.toLowerCase())),
        );

        const { data: commenterProfiles } = await supabase
          .from('user_profiles')
          .select('wallet_address, username, display_name, avatar_url')
          .in('wallet_address', commenterIds);

        const profileMap = new Map<string, NonNullable<PostBundleComment['sender']>>();
        for (const p of commenterProfiles || []) {
          if (p.wallet_address) {
            profileMap.set(p.wallet_address.toLowerCase(), {
              wallet_address: p.wallet_address as string,
              username: p.username as string,
              display_name: p.display_name as string,
              avatar_url: p.avatar_url as string,
            });
          }
        }

        comments = commentsRaw.map((c) => ({
          ...c,
          sender: profileMap.get(c.user_address.toLowerCase()) ?? null,
        }));
      }

      return {
        creator: profile as PostBundleCreator,
        post: post as PostBundlePost,
        likesCount: likesRes.count || 0,
        comments,
      };
    },
  );
}
