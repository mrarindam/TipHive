'use client';

import { useDashboard, Activity } from '../layout';
import { Zap, History } from 'lucide-react';
import MUSDLogo from '@/components/ui/MUSDLogo';

export default function SentSupportPage() {
  const { activities, loading } = useDashboard();

  if (loading) return <div className="animate-pulse py-20 text-center text-slate-500">Loading sent support...</div>;

  const sentSupport = activities.filter((a: Activity) => a.type === 'sent');

  return (
    <div className="space-y-8">
      <div className="px-4 md:px-0">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Sent Support</h1>
        <p className="text-slate-500 text-sm">Track all the creators you have supported with tips.</p>
      </div>

      <div className="bg-[#0f0f14] border border-white/5 rounded-3xl p-6 md:p-8 space-y-4">
        {sentSupport.length > 0 ? (
          sentSupport.map((activity: Activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 text-slate-400 flex items-center justify-center">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="text-white font-bold">Support Sent</h4>
                  <p className="text-slate-500 text-xs">To {activity.to_name || 'Creator'} • {new Date(activity.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-slate-300 flex items-center gap-1">
                  -{activity.amount} <MUSDLogo className="w-4 h-4 opacity-50" />
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center flex flex-col items-center">
            <History className="w-12 h-12 text-slate-700 mb-4" />
            <p className="text-slate-500">You haven&apos;t sent any tips yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
