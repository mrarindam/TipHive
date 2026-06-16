import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testJoin() {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      creator_id,
      user_profiles (
        id,
        wallet_address,
        username,
        display_name,
        avatar_url
      )
    `)
    .limit(1);

  if (error) {
    console.error('Error fetching join:', error);
    // Let's try joining as 'creator' or 'profiles' if 'user_profiles' fails
    const { data: data2, error: error2 } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        creator_id
      `)
      .limit(1);
    console.log('Simple query without join:', data2);
  } else {
    console.log('Join query successful:', data[0]);
  }
}

testJoin();
