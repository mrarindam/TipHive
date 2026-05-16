import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import ProfileHomeClient from './ProfileHomeClient';

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { username } = await params;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('display_name, username, bio, avatar_url, creator_description')
      .ilike('username', username)
      .single();

    if (!profile) {
      return {
        title: 'User Not Found | TipHive',
      };
    }

    const title = `${profile.display_name} (@${profile.username}) | TipHive`;
    const description = profile.bio || profile.creator_description || `Support ${profile.display_name} on TipHive - The ultimate creator monetization platform.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'profile',
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
    };
  } catch (error) {
    console.error('Error generating profile metadata:', error);
    return {
      title: 'Profile | TipHive',
    };
  }
}

export default async function Page() {
  return <ProfileHomeClient />;
}
