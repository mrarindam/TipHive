import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'TipHive - The Bitcoin-Native Tipping Platform for Creators';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
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
          backgroundColor: '#050505',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Hero Background Image - Mocking the mainhero.webp effect */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
          }}
        >
          {/* We can't easily use a local relative path in ImageResponse without a full URL, 
              but we can use decorative elements to match the aesthetic */}
          <div style={{ position: 'absolute', inset: 0, backgroundColor: '#050505' }} />
          <div style={{ position: 'absolute', top: -200, left: -200, width: 800, height: 800, borderRadius: '400px', background: 'rgba(247, 147, 26, 0.08)', filter: 'blur(100px)' }} />
          <div style={{ position: 'absolute', bottom: -200, right: -200, width: 800, height: 800, borderRadius: '400px', background: 'rgba(138, 43, 226, 0.08)', filter: 'blur(100px)' }} />
          
          {/* Grid pattern */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        {/* Content Wrapper */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10, padding: '0 60px' }}>
          
          {/* Logo */}
          <div style={{ display: 'flex', marginBottom: '28px' }}>
            <img
              src="https://tiphive.xyz/logo.png"
              alt="TipHive Logo"
              style={{
                height: '64px',
                objectFit: 'contain',
              }}
            />
          </div>

          {/* Hero Title */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <span style={{ fontSize: '92px', fontWeight: '900', color: 'white', lineHeight: 0.9, letterSpacing: '-0.05em', textAlign: 'center', textTransform: 'uppercase' }}>
              The Bitcoin
            </span>
            <span style={{ fontSize: '92px', fontWeight: '900', color: '#F7931A', lineHeight: 0.9, letterSpacing: '-0.05em', textAlign: 'center', textTransform: 'uppercase' }}>
              Native Economy
            </span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: '26px',
              color: '#94A3B8',
              textAlign: 'center',
              maxWidth: '900px',
              lineHeight: 1.4,
              fontWeight: '500',
              marginBottom: '32px',
            }}
          >
            Empower your favorite creators with instant, fee-less Bitcoin-native tips on the Mezo L2 network.
          </div>

          {/* Call To Action */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '18px 44px',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, #F7931A 0%, #8A2BE2 100%)',
              fontSize: '28px',
              fontWeight: 800,
              color: 'white',
              letterSpacing: '0.02em',
              boxShadow: '0 12px 40px rgba(247, 147, 26, 0.35)',
            }}
          >
            Start Tipping in Bitcoin →
          </div>
        </div>

        {/* Decorative Bottom Bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '8px', background: 'linear-gradient(to right, #F7931A, #8A2BE2)' }} />
      </div>
    ),
    {
      ...size,
    }
  );
}
