import { NextRequest } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { cacheGetOrSet, cacheKeys, TTL } from '@/lib/redis';

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cleanColor(value: string) {
  const color = value.replace('#', '');
  return /^[a-fA-F0-9]{3}([a-fA-F0-9]{3})?$/.test(color) ? color : 'f7931a';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  // Get parameters
  const slug = searchParams.get('slug');
  const text = (searchParams.get('text') || 'Support on TipHive').slice(0, 80);
  const emoji = searchParams.get('emoji') || '⚡';
  const color = cleanColor(searchParams.get('color') || 'f7931a');
  const font = (searchParams.get('font') || 'Arial, sans-serif').replace(/[<>"']/g, '').slice(0, 80);
  const showCount = searchParams.get('count') === 'true' || !!searchParams.get('count_val');
  
  let supporterCount = 0;

  // Fetch real count if slug is provided
  if (showCount && slug) {
    try {
      const supabase = createServerSupabase();
      const normalizedSlug = slug.toLowerCase();

      const wallet = await cacheGetOrSet<string | null>(
        cacheKeys.usernameToWallet(normalizedSlug),
        TTL.day,
        async () => {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('wallet_address')
            .ilike('username', normalizedSlug)
            .maybeSingle();
          if (error) {
            console.error('Profile not found for slug:', slug, error);
            return null;
          }
          return data?.wallet_address ?? null;
        },
      );

      if (wallet) {
        const cachedCount = await cacheGetOrSet<number>(
          cacheKeys.buttonCount(wallet),
          TTL.long,
          async () => {
            const [{ data: tips }, { data: subs }] = await Promise.all([
              supabase.from('tips').select('from_address').ilike('to_address', wallet),
              supabase.from('subscriptions').select('fan_address').ilike('creator_address', wallet),
            ]);

            const unique = new Set([
              ...(tips || []).map((t) => t.from_address?.toLowerCase()),
              ...(subs || []).map((s) => s.fan_address?.toLowerCase()),
            ].filter(Boolean));

            return unique.size;
          },
        );
        supporterCount = cachedCount;
      }
    } catch (e) {
      console.error('Error fetching supporter count:', e);
    }
  }

  // If manual count value is provided for preview
  const manualCount = searchParams.get('count_val');
  if (manualCount) supporterCount = Math.max(0, Math.min(999999, parseInt(manualCount, 10) || 0));

  // Calculate dynamic width
  const charWidth = 9.5; 
  const textWidth = text.length * charWidth;
  const emojiWidth = emoji ? 28 : 0;
  const countWidth = showCount ? 55 : 0;
  const padding = 50;
  
  const width = textWidth + emojiWidth + countWidth + padding;
  const height = 54;

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.2"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:white;stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:black;stop-opacity:0.1" />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="25" fill="#${color}" filter="url(#shadow)"/>
      <rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="25" fill="url(#grad)"/>
      
      <text 
        x="${(width - (showCount ? 55 : 0)) / 2}" 
        y="${height / 2 + 2}" 
        dominant-baseline="middle" 
        text-anchor="middle" 
        font-family="'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', '${escapeXml(font)}', sans-serif" 
        font-size="19" 
        font-weight="900" 
        fill="black"
      >
        ${escapeXml(emoji ? emoji + ' ' : '')}${escapeXml(text)}
      </text>

      ${showCount ? `
        <g transform="translate(${width - 65}, ${height / 2})">
          <line x1="0" y1="-12" x2="0" y2="12" stroke="black" stroke-opacity="0.1" stroke-width="2"/>
          <path d="M12 -5C12 -5 11 -6.5 9 -6.5C7 -6.5 6 -5 6 -3.5C6 -1 9 1.5 12 3.5C15 1.5 18 -1 18 -3.5C18 -5 17 -6.5 15 -6.5C13 -6.5 12 -5 12 -5Z" fill="black" fill-opacity="0.6"/>
          <text x="22" y="4" font-family="${escapeXml(font)}, sans-serif" font-size="13" font-weight="900" fill="black" fill-opacity="0.6">${supporterCount}</text>
        </g>
      ` : ''}
    </svg>
  `;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
