'use client';

import { useDashboard, type Activity, type CreatorProfile } from '@/components/providers/DashboardProvider';
import { useState } from 'react';
import { Zap, Loader2, X, Settings2, Heart, CheckCircle2, ExternalLink, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MUSDLogo from '@/components/ui/MUSDLogo';
import Pagination from '@/components/ui/Pagination';
import { useNetworkConfig } from '@/lib/hooks/useNetworkConfig';

export default function TipCirclePage() {
  const { activities, creatorProfile, fetchData, loading } = useDashboard();
  const { explorerUrl } = useNetworkConfig();
  const [activeTab, setActiveTab] = useState<'stats' | 'settings'>('stats');
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Only show the full page loader on the very first load
  // If we are just refreshing data (loading is true but we already have data), we don't unmount everything
  const isInitialLoading = loading && !creatorProfile;

  if (isInitialLoading) return <div className="animate-pulse py-20 text-center text-slate-500">Loading Tip Circles...</div>;

  const receivedTips = activities.filter(a => a.type === 'received' && a.source === 'tip');
  const totalTips = receivedTips.reduce((acc, curr) => acc + curr.amount, 0);
  const uniqueSupporters = new Set(receivedTips.map(t => t.from_address)).size;

  const totalPages = Math.ceil(receivedTips.length / itemsPerPage);
  const paginatedTips = receivedTips.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8 relative">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 md:px-0 space-y-2"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-[#f7931a] uppercase tracking-wider">
          <span>Creator Suite</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-outfit uppercase">
          Tip Support <span className="text-[#f7931a]">Flow</span>
        </h1>
        <p className="text-slate-550 dark:text-slate-400 text-base max-w-2xl font-medium leading-relaxed">
          Every tip is a signal - see who’s backing you and when.
        </p>
      </motion.div>

      <div className="flex items-center gap-8 border-b border-slate-200 dark:border-white/5">
        <button
          onClick={() => setActiveTab('stats')}
          className={`relative pb-4 text-sm md:text-base font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'stats'
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Tip Circles
          {activeTab === 'stats' && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#f7931a] rounded-full"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`relative pb-4 text-sm md:text-base font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Tip Settings
          {activeTab === 'settings' && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#f7931a] rounded-full"
            />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'stats' ? (
          <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-[#0f0f14] border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 relative overflow-hidden group shadow-md dark:shadow-xl transition-colors duration-300">
                <div className="text-slate-500 dark:text-slate-400 text-[10px] font-bold mb-4 uppercase tracking-wider">All Time Support</div>
                <div className="text-3xl md:text-4xl font-bold tracking-tight text-slate-950 dark:text-white flex items-center gap-3">
                  {totalTips} <MUSDLogo className="w-8 h-8" />
                </div>
              </div>
              <div className="bg-white dark:bg-[#0f0f14] border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 relative overflow-hidden group shadow-md dark:shadow-xl transition-colors duration-300">
                <div className="text-slate-500 dark:text-slate-400 text-[10px] font-bold mb-4 uppercase tracking-wider">Unique Supporters</div>
                <div className="text-3xl md:text-4xl font-bold tracking-tight text-slate-950 dark:text-white flex items-center gap-3">
                  {uniqueSupporters} <Heart className="w-8 h-8 text-red-500 dark:text-red-500/80" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#f7931a]" /> Recent Support Logs
              </h3>
              <div className="space-y-4">
                {paginatedTips.length > 0 ? (
                  <>
                    {paginatedTips.map(t => <ActivityRow key={t.id} activity={t} explorerUrl={explorerUrl} />)}

                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </>
                ) : (
                  <div className="text-center py-20 bg-white dark:bg-[#0f0f14] rounded-3xl border border-dashed border-slate-200 dark:border-white/5">
                    <p className="text-slate-550 dark:text-slate-400 font-medium">No tips received yet. Share your profile to get started!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <TipSettings creator={creatorProfile} onUpdate={fetchData} onSuccess={() => setShowSuccess(true)} />
        )}
      </AnimatePresence>

      {/* Global Success Popup */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] bg-white dark:bg-[#0f0f14] border border-green-500/40 p-6 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex items-center gap-6 min-w-[340px] backdrop-blur-2xl transition-colors duration-300"
          >
            <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-500 shrink-0 shadow-inner">
              <CheckCircle2 size={32} />
            </div>
            <div className="pr-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-tight">Success!</h3>
              <p className="text-slate-550 dark:text-slate-400 font-bold uppercase tracking-[0.1em] text-[10px] mt-1">Settings updated</p>
            </div>
            <button onClick={() => setShowSuccess(false)} className="ml-auto w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer">
              <X size={16} />
            </button>

            {/* Progress bar timer */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 3 }}
              className="absolute bottom-0 left-0 h-1 bg-green-500 rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActivityRow({ activity, explorerUrl }: { activity: Activity; explorerUrl: string }) {
  return (
    <div className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-[#0f0f14] border border-slate-200 dark:border-white/5 shadow-sm hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors duration-300 group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#f7931a]/10 text-[#f7931a] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
          <Zap size={20} />
        </div>
        <div>
          <h4 className="text-slate-900 dark:text-white font-bold text-sm md:text-base">Tip Received</h4>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            From {activity.to_name || 'Anonymous'} • {new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          {activity.tx_hash && (
            <a
              href={`${explorerUrl}/tx/${activity.tx_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#f7931a] text-[10px] font-bold uppercase tracking-wider mt-1.5 inline-flex items-center gap-1 hover:underline"
            >
              View on Explorer <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg md:text-xl font-bold text-[#f7931a] flex items-center gap-2 justify-end">
          +{activity.amount} <MUSDLogo className="w-4 h-4 opacity-75" />
        </p>
      </div>
    </div>
  );
}

interface TipSettingsProps {
  creator: CreatorProfile | null;
  onUpdate: () => void;
  onSuccess: () => void;
}

function TipSettings({ creator, onUpdate, onSuccess }: TipSettingsProps) {
  const { address, linkWallet, getAccessToken } = useDashboard();
  const [thankYouMsg, setThankYouMsg] = useState(creator?.thank_you_message || '');
  const [btnText, setBtnText] = useState(creator?.button_text || 'Buy Me a Coffee ☕');

  const initialAmounts = (creator?.suggested_amounts || []).map(a => Number(a)).slice(0, 3);
  if (initialAmounts.length === 0) initialAmounts.push(5, 10, 20);
  while (initialAmounts.length < 3) initialAmounts.push(0);
  const [amt1, setAmt1] = useState(initialAmounts[0]);
  const [amt2, setAmt2] = useState(initialAmounts[1]);
  const [amt3, setAmt3] = useState(initialAmounts[2]);

  const [saving, setSaving] = useState(false);

  const buttonOptions = [
    "Buy Me a Coffee ☕",
    "Buy Me a Pizza 🍕",
    "Fuel My Work",
    "Keep Me Going",
    "Help Me Grow"
  ];

  const save = async () => {
    if (!creator) {
      console.warn('[tipcircle/save] No creator profile loaded — skipping save.');
      alert('Profile not loaded yet. Refresh the page and try again.');
      return;
    }
    setSaving(true);
    try {
      const finalAmounts = [Number(amt1), Number(amt2), Number(amt3)].filter(a => a > 0);
      let token: string | null = null;
      try {
        token = await getAccessToken();
      } catch (tokenErr) {
        console.warn('[tipcircle/save] getAccessToken failed (continuing with cookie auth):', tokenErr);
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          wallet_address: creator.address,
          username: creator.username,
          button_text: btnText,
          thank_you_message: thankYouMsg,
          suggested_amounts: finalAmounts
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const detail = errBody?.error || `HTTP ${res.status}`;
        console.error(`[tipcircle/save] PATCH /api/profile failed: ${detail}`, errBody);
        throw new Error(detail);
      }

      onSuccess();
      await onUpdate();
    } catch (e) {
      console.error('[tipcircle/save] Error:', e);
      const detail = e instanceof Error ? e.message : 'Unknown error';
      alert(`Error saving settings: ${detail}`);
    }
    finally { setSaving(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl space-y-8 bg-white dark:bg-[#0f0f14] p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-md dark:shadow-2xl relative transition-colors duration-300"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-[#f7931a]/10 flex items-center justify-center text-[#f7931a]">
          <Settings2 size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight font-outfit">Tip Customization</h2>
          <p className="text-xs text-slate-550 dark:text-slate-400 font-bold uppercase tracking-wider">Set up your tipping preferences</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Button Text Select */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 block text-center">Button Label</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {buttonOptions.map(opt => (
              <button
                key={opt}
                onClick={() => setBtnText(opt)}
                className={`px-4 py-4 rounded-2xl border text-sm font-bold transition-all text-center cursor-pointer ${
                  btnText === opt
                    ? 'bg-[#f7931a] border-[#f7931a] text-white dark:text-black shadow-md shadow-[#f7931a]/20'
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Suggested Amounts */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 block text-center">Suggested Amounts (Max 3)</label>
          <div className="grid grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="number"
                value={amt1}
                onChange={e => setAmt1(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-black/20 focus:ring-2 focus:ring-[#f7931a] rounded-2xl px-4 py-4 text-center font-bold outline-none hide-spinner transition-all"
                placeholder="5"
              />
              <MUSDLogo className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
            </div>
            <div className="relative">
              <input
                type="number"
                value={amt2}
                onChange={e => setAmt2(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-black/20 focus:ring-2 focus:ring-[#f7931a] rounded-2xl px-4 py-4 text-center font-bold outline-none hide-spinner transition-all"
                placeholder="10"
              />
              <MUSDLogo className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
            </div>
            <div className="relative">
              <input
                type="number"
                value={amt3}
                onChange={e => setAmt3(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-black/20 focus:ring-2 focus:ring-[#f7931a] rounded-2xl px-4 py-4 text-center font-bold outline-none hide-spinner transition-all"
                placeholder="20"
              />
              <MUSDLogo className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
            </div>
          </div>
        </div>

        {/* Thank You Msg */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">Thank You Message</label>
          <textarea
            value={thankYouMsg}
            onChange={e => setThankYouMsg(e.target.value)}
            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-black/20 focus:ring-2 focus:ring-[#f7931a] rounded-2xl px-5 py-4 outline-none h-32 resize-none transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
            placeholder="Write a heartfelt message for your supporters..."
          />
        </div>
      </div>

      {address ? (
        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-[#f7931a] hover:bg-[#e8850f] text-white dark:text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-md shadow-[#f7931a]/20 disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
          <span className="uppercase tracking-wider text-xs md:text-sm">Save Tipping Rules</span>
        </button>
      ) : (
        <button
          onClick={linkWallet}
          className="w-full bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-[#f7931a]/30 text-[#f7931a] font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] group cursor-pointer"
        >
          <Wallet size={20} className="group-hover:scale-105 transition-transform" />
          <span className="uppercase tracking-wider text-xs md:text-sm">Connect Wallet to Save</span>
        </button>
      )}

      <style jsx>{`
        .hide-spinner::-webkit-inner-spin-button, 
        .hide-spinner::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        .hide-spinner {
          -moz-appearance: textfield;
        }
      `}</style>
    </motion.div>
  );
}
