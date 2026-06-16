import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkStats() {
  console.log('--- Stats ---');
  
  // 1. Distinct Chain IDs and total tip amounts
  const { data: chainTips, error: tipErr } = await supabase
    .from('tips')
    .select('chain_id, amount');
  if (tipErr) {
    console.error('Error fetching tips:', tipErr);
  } else {
    const chainsMap: Record<number, { count: number, total: number }> = {};
    for (const t of chainTips || []) {
      const cid = t.chain_id || 0;
      if (!chainsMap[cid]) chainsMap[cid] = { count: 0, total: 0 };
      chainsMap[cid].count++;
      chainsMap[cid].total += t.amount || 0;
    }
    console.log('Tips by Chain ID:', chainsMap);
  }

  // 2. Post count by visibility
  const { data: posts, error: postErr } = await supabase
    .from('posts')
    .select('visibility');
  if (postErr) {
    console.error('Error fetching posts:', postErr);
  } else {
    const visibilityMap: Record<string, number> = {};
    for (const p of posts || []) {
      const v = p.visibility || 'unknown';
      visibilityMap[v] = (visibilityMap[v] || 0) + 1;
    }
    console.log('Posts by visibility:', visibilityMap);
  }

  // 3. Top 5 latest tips
  const { data: latestTips, error: latErr } = await supabase
    .from('tips')
    .select('from_address, to_address, amount, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  console.log('Latest 5 tips:', latestTips);
}

checkStats();
