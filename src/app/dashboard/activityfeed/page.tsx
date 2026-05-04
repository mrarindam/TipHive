'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDashboard, Activity } from '../layout';
import { History, Zap, Star } from 'lucide-react';
import MUSDLogo from '@/components/ui/MUSDLogo';

export default function ActivityFeedPage() {
  const { activities, loading } = useDashboard();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (loading) return <div className="animate-pulse py-20 text-center text-slate-500">Loading Activity Feed...</div>;

  const totalPages = Math.ceil(activities.length / itemsPerPage);
  const paginatedActivities = activities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-12">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="px-4 md:px-0 space-y-3"
      >
        <div className="flex items-center gap-3 mb-2">
           <div className="w-12 h-1 bg-[#f7931a] rounded-full" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f7931a]">Activity Logs</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.85] flex flex-wrap gap-x-4">
          <span>Activity</span>
          <span className="text-[#f7931a]">Feed</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
          Real-time log of all your on-chain interactions and social movements.
        </p>
      </motion.div>

      <div className="bg-[#0f0f14] border border-white/5 rounded-[2.5rem] p-6 md:p-10 space-y-4 shadow-2xl">
        {paginatedActivities.length > 0 ? (
          <>
            <div className="space-y-3">
              {paginatedActivities.map((activity: Activity) => (
                <div key={activity.id} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-transparent hover:border-white/5 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${activity.type === 'received' ? 'bg-[#f7931a]/10 text-[#f7931a]' : 'bg-white/5 text-slate-400'}`}>
                      {activity.source === 'tip' ? <Zap size={22} /> : <Star size={22} />}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg leading-tight">{activity.type === 'received' ? (activity.source === 'tip' ? 'Tip Received' : 'New Subscription') : 'Support Sent'}</h4>
                      <p className="text-slate-500 text-sm font-medium mt-1">{activity.to_name || 'Anonymous'} • {new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-black flex items-center justify-end gap-2 font-outfit ${activity.type === 'received' ? 'text-[#f7931a]' : 'text-slate-300'}`}>
                      {activity.type === 'received' ? '+' : '-'}{activity.amount} <MUSDLogo className="w-5 h-5 opacity-50" />
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-10 border-t border-white/5 mt-6">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                  &lt;
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-12 h-12 rounded-2xl font-black text-sm transition-all ${currentPage === i + 1 ? 'bg-[#f7931a] text-black shadow-[0_0_30px_rgba(247,147,26,0.3)]' : 'bg-white/5 border border-white/10 text-slate-500 hover:bg-white/10'}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                  &gt;
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <History className="w-10 h-10 text-slate-700" />
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No activity recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
