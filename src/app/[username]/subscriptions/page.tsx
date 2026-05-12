'use client';

import { motion } from 'framer-motion';
import SubscriptionSection from '@/components/profile/SubscriptionSection';
import { useProfile } from '../layout';
import { Crown } from 'lucide-react';

export default function CreatorSubscriptions() {
  const { creator } = useProfile();


  if (!creator) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="max-w-[1400px] mx-auto space-y-12 px-4">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8A2BE2]/10 border border-[#8A2BE2]/20 rounded-full text-[#D8B4FE] text-xs font-black uppercase tracking-[0.2em] mb-4 shadow-[0_0_20px_rgba(138,43,226,0.2)] animate-pulse">
          <Crown className="w-4 h-4" /> Premium Access
        </div>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter font-outfit">Choose Your Plan</h2>
        <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto italic">Join my membership journey and unlock exclusive content, early access, and more!</p>
      </div>

      <div className="relative">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#8A2BE2]/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#F7931A]/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 space-y-16">


        <SubscriptionSection creatorAddress={creator!.wallet_address as string} creatorName={creator!.display_name as string} />


        </div>
      </div>
    </motion.div>
  );
}
