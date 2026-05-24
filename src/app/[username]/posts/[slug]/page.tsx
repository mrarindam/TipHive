import { Metadata } from 'next';
import { getPostBundle } from '@/lib/post-fetcher';
import PostDetailClient from './PostDetailClient';

type Props = {
  params: Promise<{ username: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const { username, slug } = resolvedParams;

    const bundle = await getPostBundle(username, slug);

    if (!bundle) {
      return { title: 'Post Not Found | TipHive' };
    }

    const { creator, post } = bundle;
    const pageTitle = `${post.title} - ${creator.display_name} (@${creator.username})`;
    const plainTextDescription = post.content
      ? post.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...'
      : `Check out this post by ${creator.display_name} on TipHive`;

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
    return { title: 'Post | TipHive' };
  }
}

export default async function Page() {
  return <PostDetailClient />;
}
