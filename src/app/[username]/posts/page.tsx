import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import PostsClient from './PostsClient';

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { username } = await params;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('display_name, username')
      .ilike('username', username)
      .single();

    if (!profile) {
      return {
        title: 'Posts | TipHive',
      };
    }

    const title = `Posts by ${profile.display_name} (@${profile.username}) | TipHive`;
    const description = `Explore all posts, videos, and exclusive content from ${profile.display_name} on TipHive.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
    };
  } catch (error) {
    console.error('Error generating posts metadata:', error);
    return {
      title: 'Posts | TipHive',
    };
  }
}

export default async function Page() {
  return <PostsClient />;
}
