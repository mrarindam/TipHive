'use client';

import MySubscriptions from '@/components/dashboard/MySubscriptions';

export default function MySubscriptionsPage() {
  return (
    <div className="space-y-8">
      <div className="px-4 md:px-0">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">My Subscriptions</h1>
        <p className="text-slate-500 text-sm">Manage the creators you are currently supporting.</p>
      </div>
      <MySubscriptions />
    </div>
  );
}
