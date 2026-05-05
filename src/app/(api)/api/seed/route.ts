import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST() {
  try {
    const testCreators = [
      {
        address: '0x1234567890123456789012345678901234567890',
        name: 'Satoshi Nakamoto',
        bio: 'Creating the future of money. Now accepting MUSD tips for my new whitepapers.',
        avatar_url: 'https://ui-avatars.com/api/?name=Satoshi+Nakamoto&background=random',
        category: 'Developer',
        total_earned: 150,
      },
      {
        address: '0x0987654321098765432109876543210987654321',
        name: 'Alice Wonders',
        bio: 'Digital artist exploring the intersection of Bitcoin and Art.',
        avatar_url: 'https://ui-avatars.com/api/?name=Alice+Wonders&background=random',
        category: 'Artist',
        total_earned: 85,
      }
    ];

    const { error } = await supabase
      .from('creators')
      .upsert(testCreators, { onConflict: 'address' });

    if (error) throw error;

    return NextResponse.json({ message: 'Data seeded successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
