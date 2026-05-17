import { ImageResponse } from 'next/og';
import { supabase } from '@/lib/supabase';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Post Preview';
export const size = {
  width: 1200,
  height: 600,
};

export const contentType = 'image/png';

// Image generation
export default async function Image({ params }: { params: Promise<{ username: string, slug: string }> }) {
  const resolvedParams = await params;
  const { username, slug } = resolvedParams;
  const title = decodeURIComponent(slug);

  // Fetch creator profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, display_name, avatar_url')
    .ilike('username', username)
    .single();

  if (!profile) {
    return new ImageResponse(
      (
        <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0F19', color: 'white' }}>
          User Not Found
        </div>
      ),
      { ...size }
    );
  }

  // Fetch post data
  const { data: post } = await supabase
    .from('posts')
    .select('title, image_url')
    .eq('creator_id', profile.id)
    .ilike('title', title)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const postTitle = post?.title || title;
  const avatarUrl = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name)}`;
  const postImage = post?.image_url;

  if (postImage) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0B0F19',
          }}
        >
          <img
            src={postImage}
            alt={postTitle}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      ),
      {
        ...size,
      }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0B0F19',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #111827 0%, #0B0F19 100%)',
          padding: '60px 80px',
          position: 'relative',
        }}
      >
        {/* Background decorative elements */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '200px', background: 'rgba(138, 43, 226, 0.15)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '200px', background: 'rgba(247, 147, 26, 0.15)', filter: 'blur(80px)' }} />

        {/* Background Grid Pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Post Image if exists (as a subtle background) */}
        {postImage && (
          <img
            src={postImage}
            alt="Post Image"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.2,
            }}
          />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
          {/* Platform Logo */}
          <div style={{ display: 'flex', marginBottom: '50px' }}>
            <img
              src="https://tiphive.xyz/logo.png"
              alt="TipHive Logo"
              style={{
                height: '60px',
                objectFit: 'contain',
              }}
            />
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '68px',
              fontWeight: '900',
              textAlign: 'center',
              color: 'white',
              lineHeight: 1.1,
              marginBottom: '60px',
              maxWidth: '1000px',
              textShadow: '0 4px 30px rgba(0,0,0,0.8)',
            }}
          >
            {postTitle}
          </div>

          {/* User Info */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px 40px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <img
              src={avatarUrl}
              alt={profile.display_name}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '40px',
                border: '4px solid #8A2BE2',
                marginRight: '25px',
                objectFit: 'cover'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>{profile.display_name}</span>
              <span style={{ fontSize: '20px', color: '#8A2BE2', fontWeight: 'bold', marginTop: '4px' }}>@{username}</span>
            </div>
          </div>
        </div>

        {/* Footer Tag */}
        <div style={{ position: 'absolute', bottom: '60px', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '6px', backgroundColor: '#F7931A', marginRight: '15px' }} />
          <span style={{ fontSize: '20px', color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '4px' }}>The Bitcoin-Native Creator Economy</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
