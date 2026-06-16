'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDashboard, Activity } from '../layout';
import { History, Heart, Calendar, ExternalLink, Bitcoin } from 'lucide-react';
import MUSDLogo from '@/components/ui/MUSDLogo';
import Pagination from '@/components/ui/Pagination';
import { useNetworkConfig } from '@/lib/hooks/useNetworkConfig';

export default function ActivityFeedPage() {
  const { activities, loading } = useDashboard();
  const { explorerUrl } = useNetworkConfig();
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
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-[0.85] flex flex-wrap gap-x-4">
          <span>Activity</span>
          <span className="text-[#f7931a]">Feed</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
          Real-time log of all your on-chain interactions and social movements.
        </p>
      </motion.div>

      <div className="bg-white dark:bg-[#0f0f14] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-6 md:p-10 space-y-4 shadow-sm dark:shadow-2xl">
        {paginatedActivities.length > 0 ? (
          <>
            <div className="space-y-3">
              {paginatedActivities.map((activity: Activity) => {
                const isBorrow = activity.source === 'borrow';
                const borrowLabel =
                  activity.event_type === 'borrow' ? 'Borrowed MUSD' :
                  activity.event_type === 'repay' ? 'Repaid MUSD' :
                  activity.event_type === 'close' ? 'Closed Trove — BTC Released' : 'Borrow Activity';

                return (
                  <div key={activity.id} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] border border-slate-100 dark:border-transparent hover:border-slate-200 dark:hover:border-white/5 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                        isBorrow ? 'bg-[#f7931a]/10 text-[#f7931a]' :
                        activity.type === 'received' ? 'bg-[#f7931a]/10 text-[#f7931a]' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                      }`}>
                        {isBorrow ? <Bitcoin size={22} /> :
                         activity.source === 'tip' ? <Heart size={22} /> : <Calendar size={22} />}
                      </div>
                      <div>
                        <h4 className="text-slate-900 dark:text-white font-bold text-lg leading-tight">
                          {isBorrow ? borrowLabel :
                           activity.source === 'tip' ? (activity.type === 'received' ? 'Tip Received' : 'Support Sent') :
                           (activity.type === 'received' ? 'New Subscriber' : 'Joined Circle')}
                        </h4>
                        {!isBorrow && (
                          <p className="text-slate-500 text-sm font-medium mt-1">
                            {activity.type === 'received' ? 'From' : 'To'}: <span className="text-slate-800 dark:text-white">{activity.to_name || 'Anonymous'}</span>
                          </p>
                        )}
                        {isBorrow && activity.event_type === 'borrow' && activity.btc_amount !== undefined && (
                          <p className="text-slate-500 text-sm font-medium mt-1">
                            Locked <span className="text-slate-800 dark:text-white font-bold tabular-nums">{activity.btc_amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} BTC</span> as collateral
                          </p>
                        )}
                        {isBorrow && activity.event_type === 'close' && activity.btc_amount !== undefined && (
                          <p className="text-slate-500 text-sm font-medium mt-1">
                            Released <span className="text-slate-800 dark:text-white font-bold tabular-nums">{activity.btc_amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} BTC</span> back to wallet
                          </p>
                        )}
                        {isBorrow && activity.event_type === 'repay' && (
                          <p className="text-slate-500 text-sm font-medium mt-1">
                            Partial debt repayment
                          </p>
                        )}
                        {activity.plan_name && (
                          <div className="mt-1 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#f7931a]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#f7931a]">{activity.plan_name}</span>
                          </div>
                        )}
                        <p className="text-slate-500 dark:text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-1">
                          {new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {activity.tx_hash && (
                          <a
                            href={`${explorerUrl}/tx/${activity.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#F7931A] text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-1 hover:underline w-fit"
                          >
                            View on Explorer <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-black flex items-center justify-end gap-2 font-outfit ${
                        isBorrow
                          ? (activity.event_type === 'borrow' ? 'text-[#f7931a]' : 'text-slate-600 dark:text-slate-300')
                          : (activity.type === 'received' ? 'text-[#f7931a]' : 'text-slate-600 dark:text-slate-300')
                      }`}>
                        {isBorrow
                          ? (activity.event_type === 'borrow' ? '+' : '−')
                          : (activity.type === 'received' ? '+' : '-')
                        }
                        {activity.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        <MUSDLogo className="w-5 h-5 opacity-50" />
                      </p>
                      {isBorrow && activity.btc_amount !== undefined && activity.event_type !== 'repay' && (
                        <p className="text-slate-500 text-xs font-bold tabular-nums mt-1 flex items-center justify-end gap-1.5">
                          {activity.event_type === 'borrow' ? '−' : '+'}
                          {activity.btc_amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                          <Bitcoin className="w-3.5 h-3.5 text-[#f7931a]" />
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-6">
              <History className="w-10 h-10 text-slate-400 dark:text-slate-700" />
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No activity recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
