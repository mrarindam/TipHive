'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import MUSDLogo from '@/components/ui/MUSDLogo';
import { useNetworkConfig } from '@/lib/hooks/useNetworkConfig';

interface TopCreator {
  wallet_address: string;
  username: string;
  display_name: string;
  avatar_url: string;
  monthly_earned: number;
}

export default function TopCreatorsBubbles() {
  const { chainId } = useNetworkConfig();
  const [creators, setCreators] = useState<TopCreator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopCreators() {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [tipsRes, subsRes] = await Promise.all([
        supabase
          .from('tips')
          .select('to_address, amount')
          .eq('chain_id', chainId)
          .gt('created_at', thirtyDaysAgo.toISOString()),
        supabase
          .from('subscriptions')
          .select('creator_address, total_paid')
          .eq('chain_id', chainId)
          .gt('created_at', thirtyDaysAgo.toISOString())
      ]);

      if (tipsRes.error || subsRes.error) {
        console.error('Error fetching data:', tipsRes.error || subsRes.error);
        setLoading(false);
        return;
      }

      const earningsMap: Record<string, number> = {};
      
      // Process Tips
      (tipsRes.data || []).forEach(tip => {
        const addr = tip.to_address?.toLowerCase();
        if (addr) earningsMap[addr] = (earningsMap[addr] || 0) + tip.amount;
      });

      // Process Subscriptions
      (subsRes.data || []).forEach(sub => {
        const addr = sub.creator_address?.toLowerCase();
        if (addr) earningsMap[addr] = (earningsMap[addr] || 0) + sub.total_paid;
      });

      // Get top 20 addresses
      const topAddresses = Object.entries(earningsMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([addr]) => addr);

      if (topAddresses.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('wallet_address, username, display_name, avatar_url')
        .in('wallet_address', topAddresses);

      if (profiles) {
        const sortedCreators = topAddresses.map(addr => {
          const profile = profiles.find(p => p.wallet_address?.toLowerCase() === addr);
          if (!profile) return null;
          return {
            ...profile,
            monthly_earned: earningsMap[addr]
          };
        }).filter(c => c && c.username) as TopCreator[];

        setCreators(sortedCreators);
      }
      setLoading(false);
    }

    fetchTopCreators();
  }, [chainId]);

  if (loading || creators.length === 0) return null;

  return (
    <div className="w-full mb-24 relative min-h-[400px]">
      <div className="flex items-center gap-3 mb-16">
        <div className="p-3 bg-[#F7931A]/10 rounded-2xl border border-[#F7931A]/20">
          <Sparkles className="w-6 h-6 text-[#F7931A]" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-white font-outfit">Top Supporters in last 30 Days</h2>
      </div>

      <div className="relative h-[300px] w-full flex flex-wrap items-center justify-center gap-12 md:gap-20">
        {creators.map((creator, i) => (
          <motion.div
            key={creator.wallet_address}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, i % 2 === 0 ? -15 : 15, 0],
              x: [0, i % 3 === 0 ? 10 : -10, 0],
            }}
            transition={{ 
              delay: i * 0.1,
              y: {
                duration: 4 + (i % 4),
                repeat: Infinity,
                ease: "easeInOut"
              },
              x: {
                duration: 5 + (i % 3),
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            className="relative group"
          >
            <Link href={`/${creator.username}`} className="block">
              <div className="relative">
                {/* Background Glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#F7931A] to-[#8A2BE2] rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                
                {/* Rainbow Bubble for Name */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px] opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 shadow-2xl">
                  <div className="bg-black/90 rounded-full px-3 py-0.5">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{creator.display_name}</span>
                  </div>
                </div>

                {/* Larger Avatar Bubble (Circular) */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-1.5 bg-gradient-to-tr from-[#F7931A] via-[#8A2BE2] to-[#F7931A] animate-spin-slow group-hover:rotate-12 transition-transform duration-500 shadow-[0_0_40px_rgba(138,43,226,0.3)]">
                  <div className="w-full h-full rounded-full border-4 border-[#0B0F19] overflow-hidden bg-[#111827] relative">
                    <Image
                      src={creator.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.display_name)}`}
                      alt={creator.display_name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      unoptimized
                    />
                  </div>
                </div>

                {/* Hover Tooltip for Amount */}
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 border border-white/10 px-4 py-2 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-2 whitespace-nowrap shadow-2xl"
                  >
                    <MUSDLogo className="w-4 h-4" />
                    <span className="text-sm font-black text-[#F7931A]">{creator.monthly_earned.toLocaleString()} MUSD</span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
