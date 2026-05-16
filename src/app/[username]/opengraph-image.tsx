import { ImageResponse } from 'next/og';
import { supabase } from '@/lib/supabase';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Creator Profile Preview';
export const size = {
  width: 1200,
  height: 600,
};

export const contentType = 'image/png';

// Image generation
export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  // Fetch creator profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, display_name, avatar_url, bio, creator_description')
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

  const avatarUrl = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name)}`;
  const description = profile.creator_description || profile.bio || 'Content Creator';

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
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '200px', background: 'rgba(138, 43, 226, 0.2)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '200px', background: 'rgba(247, 147, 26, 0.2)', filter: 'blur(80px)' }} />

        {/* Platform Logo */}
        <div style={{ position: 'absolute', top: '50px', display: 'flex' }}>
          <img
            src="https://tiphive.xyz/logo.png"
            alt="TipHive Logo"
            style={{
              height: '50px',
              objectFit: 'contain',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
          {/* Large Avatar */}
          <div style={{ position: 'relative', marginBottom: '40px', display: 'flex' }}>
            <div style={{ position: 'absolute', inset: -8, borderRadius: '100px', background: 'linear-gradient(to right, #8A2BE2, #F7931A)', opacity: 0.8 }} />
            <img
              src={avatarUrl}
              alt={profile.display_name}
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '90px',
                border: '8px solid #0B0F19',
                objectFit: 'cover',
                position: 'relative'
              }}
            />
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: '900',
              textAlign: 'center',
              color: 'white',
              lineHeight: 1.1,
              marginBottom: '5px',
            }}
          >
            {profile.display_name}
          </div>

          {/* Username */}
          <div style={{ fontSize: '32px', color: '#8A2BE2', fontWeight: 'bold', marginBottom: '30px' }}>
            @{username}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: '28px',
              color: '#94A3B8',
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.4,
            }}
          >
            {description}
          </div>
        </div>

        {/* Action Button Style Callout */}
        <div style={{ position: 'absolute', bottom: '80px', display: 'flex', alignItems: 'center', backgroundColor: '#F7931A', padding: '15px 40px', borderRadius: '50px' }}>
          <span style={{ fontSize: '24px', color: 'black', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>Support this Creator</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
