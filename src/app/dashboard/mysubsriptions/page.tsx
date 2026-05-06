'use client';

import MySubscriptions from '@/components/dashboard/MySubscriptions';

export default function MySubscriptionsPage() {
  return (
    <div className="space-y-8">
      <div className="px-4 md:px-0 mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1.5 w-12 bg-[#F7931A] rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F7931A]">Supporter Suite</span>
        </div>
        <h1 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-4 font-outfit">
          MY <span className="text-[#F7931A]">SUBSCRIPTIONS</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl">
          Manage the creators you are currently supporting and explore their exclusive content.
        </p>
      </div>
      <MySubscriptions />
    </div>
  );
}
