'use client';

import { motion } from 'framer-motion';
import SubscriptionManager from '@/components/dashboard/SubscriptionManager';

export default function SubscriptionsPage() {
  return (
    <div className="space-y-12">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="px-4 md:px-0 space-y-3"
      >
        <div className="flex items-center gap-3 mb-2">
           <div className="w-12 h-1 bg-[#f7931a] rounded-full" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f7931a]">Creator Suite</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.85] flex flex-wrap gap-x-4">
          <span>Subscription</span>
          <span className="text-[#f7931a]">Engine</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
          Build sustainable revenue with powerful recurring support tools.
        </p>
      </motion.div>
      <SubscriptionManager />
    </div>
  );
}
