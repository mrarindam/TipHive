import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkSchema() {
  const tables = ['posts', 'tips', 'post_likes', 'post_comments', 'followers'];
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error(`Error fetching from ${table}:`, error);
    } else {
      console.log(`Sample from ${table}:`, data[0] || 'No rows');
    }
  }
}

checkSchema();
