import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import PostDetailClient from './PostDetailClient';

type Props = {
  params: Promise<{ username: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const { username, slug } = resolvedParams;
    const title = decodeURIComponent(slug);

    // Fetch creator profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, display_name, avatar_url, username')
      .ilike('username', username)
      .single();

    if (!profile) {
      return {
        title: 'Post Not Found | TipHive',
      };
    }

    // Fetch post data
    const { data: post } = await supabase
      .from('posts')
      .select('title, content, image_url, visibility')
      .eq('creator_id', profile.id)
      .ilike('title', title)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!post) {
      return {
        title: `Post by @${profile.username} | TipHive`,
      };
    }

    const pageTitle = `${post.title} - ${profile.display_name} (@${profile.username})`;
    // Strip HTML for description
    const plainTextDescription = post.content
      ? post.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...'
      : `Check out this post by ${profile.display_name} on TipHive`;


    return {
      title: pageTitle,
      description: plainTextDescription,
      openGraph: {
        title: pageTitle,
        description: plainTextDescription,
        type: 'article',
        siteName: 'TipHive',
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: plainTextDescription,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Post | TipHive',
    };
  }
}

export default async function Page() {
  return <PostDetailClient />;
}
