'use client';

import { motion } from 'framer-motion';
import SubscriptionSection from '@/components/profile/SubscriptionSection';
import { useProfile } from '../layout';
import { Crown, Sparkles } from 'lucide-react';

export default function CreatorSubscriptions() {
  const { creator } = useProfile();


  if (!creator) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8A2BE2]/10 border border-[#8A2BE2]/20 rounded-full text-[#D8B4FE] text-xs font-black uppercase tracking-[0.2em] mb-4 shadow-[0_0_20px_rgba(138,43,226,0.2)] animate-pulse">
          <Crown className="w-4 h-4" /> Premium Access
        </div>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter font-outfit">Choose Your Plan</h2>
        <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto italic">Support my creative journey and unlock exclusive content, early access, and more!</p>
      </div>

      <div className="relative">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#8A2BE2]/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#F7931A]/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="bg-[#0a0a0c]/60 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative z-10">
          <div className="grid grid-cols-1 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-[#8A2BE2]/20 rounded-2xl flex items-center justify-center border border-[#8A2BE2]/30">
                  <Sparkles className="w-6 h-6 text-[#D8B4FE]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Membership Tiers</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Select the level of support</p>
                </div>
              </div>
              
              <SubscriptionSection creatorAddress={creator!.wallet_address as string} creatorName={creator!.display_name as string} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-white/5">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-[#8A2BE2]/30 transition-all group">
                <h4 className="font-black text-xs uppercase tracking-widest text-[#8A2BE2] mb-3">Exclusive Content</h4>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">Get access to posts, videos, and updates that are only for members.</p>
              </div>
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-[#8A2BE2]/30 transition-all group">
                <h4 className="font-black text-xs uppercase tracking-widest text-[#F7931A] mb-3">Community Access</h4>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">Join the private discussion and connect directly with the creator.</p>
              </div>
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-[#8A2BE2]/30 transition-all group">
                <h4 className="font-black text-xs uppercase tracking-widest text-emerald-400 mb-3">Direct Support</h4>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">Your subscription helps me continue doing what I love.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
