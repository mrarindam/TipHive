import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkSchema() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error fetching notifications:', error);
  } else {
    console.log('Sample notification:', data[0]);
  }
}

checkSchema();
