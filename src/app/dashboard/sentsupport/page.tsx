'use client';

import { useState } from 'react';
import { useDashboard, Activity } from '../layout';
import { Heart, History, ExternalLink } from 'lucide-react';
import MUSDLogo from '@/components/ui/MUSDLogo';
import Pagination from '@/components/ui/Pagination';

export default function SentSupportPage() {
  const { activities, loading } = useDashboard();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (loading) return <div className="animate-pulse py-20 text-center text-slate-500">Loading sent support...</div>;

  const sentSupport = activities.filter((a: Activity) => a.type === 'sent');
  const totalPages = Math.ceil(sentSupport.length / itemsPerPage);
  const paginatedSupport = sentSupport.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8">
      <div className="px-4 md:px-0 mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1.5 w-12 bg-[#F7931A] rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F7931A]">Supporter Suite</span>
        </div>
        <h1 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-4 font-outfit">
          SENT <span className="text-[#F7931A]">SUPPORT</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl">
          Track all the creators you have supported with tips.
        </p>
      </div>

      <div className="bg-[#0f0f14] border border-white/5 rounded-3xl p-6 md:p-8 space-y-4">
        {paginatedSupport.length > 0 ? (
          <>
            <div className="space-y-4">
              {paginatedSupport.map((activity: Activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 text-slate-400 flex items-center justify-center">
                      <Heart size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">Support Sent</h4>
                      <p className="text-slate-500 text-xs">To {activity.to_name || 'Creator'} • {new Date(activity.created_at).toLocaleDateString()}</p>
                      {activity.tx_hash && (
                        <a 
                          href={`https://explorer.test.mezo.org/tx/${activity.tx_hash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#F7931A] text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-1 hover:underline"
                        >
                          View on Explorer <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-300 flex items-center gap-1">
                      -{activity.amount} <MUSDLogo className="w-4 h-4 opacity-50" />
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
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
