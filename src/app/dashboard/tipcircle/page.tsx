'use client';

import { useDashboard, Activity, CreatorProfile } from '../layout';
import { useState } from 'react';
import { Zap, Loader2, X, Settings2, Heart, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MUSDLogo from '@/components/ui/MUSDLogo';
import Pagination from '@/components/ui/Pagination';

export default function TipCirclePage() {
  const { activities, creatorProfile, fetchData, loading } = useDashboard();
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
    <div className="space-y-12 relative">
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
          <span>Tip Support</span>
          <span className="text-[#f7931a]">Flow</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
          Every tip is a signal — see who’s backing you and when.
        </p>
      </motion.div>

      <div className="flex items-center gap-8 border-b border-white/5 pb-4">
        <button onClick={() => setActiveTab('stats')} className={`text-xl font-black uppercase tracking-tight transition-colors ${activeTab === 'stats' ? 'text-white underline underline-offset-[16px] decoration-[#f7931a] decoration-4' : 'text-slate-500 hover:text-slate-300'}`}>Tip Circles</button>
        <button onClick={() => setActiveTab('settings')} className={`text-xl font-black uppercase tracking-tight transition-colors ${activeTab === 'settings' ? 'text-white underline underline-offset-[16px] decoration-[#f7931a] decoration-4' : 'text-slate-500 hover:text-slate-300'}`}>Tip Settings</button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'stats' ? (
          <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1a1a24] p-8 rounded-3xl border border-white/5 relative overflow-hidden group shadow-xl">
                  <div className="text-slate-500 text-[10px] font-black mb-3 uppercase tracking-[0.2em]">All Time Support</div>
                  <div className="text-5xl font-black text-white flex items-center gap-3">
                    {totalTips} <MUSDLogo className="w-10 h-10 opacity-80" />
                  </div>
                </div>
                <div className="bg-[#1a1a24] p-8 rounded-3xl border border-white/5 relative overflow-hidden group shadow-xl">
                  <div className="text-slate-500 text-[10px] font-black mb-3 uppercase tracking-[0.2em]">Unique Supporters</div>
                  <div className="text-5xl font-black text-white flex items-center gap-3">
                    {uniqueSupporters} <Heart className="w-10 h-10 text-red-500/50" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#f7931a]" /> Recent Support Logs
                </h3>
                <div className="space-y-4">
                  {paginatedTips.length > 0 ? (
                    <>
                      {paginatedTips.map(t => <ActivityRow key={t.id} activity={t} />)}
                      
                      <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </>
                  ) : (
                    <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/5">
                      <p className="text-slate-500 font-medium">No tips received yet. Share your profile to get started!</p>
                    </div>
                  )}
                </div>
              </div>
          </motion.div>
        ) : (
          <TipSettings creator={creatorProfile} onUpdate={fetchData} onSuccess={() => setShowSuccess(true)} />
        )}
      </AnimatePresence>

      {/* Global Success Popup - Moved to Top Level */}
      <AnimatePresence>
          {showSuccess && (
              <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 50 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] bg-[#1a1a24] border border-green-500/40 p-6 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex items-center gap-6 min-w-[340px] backdrop-blur-2xl"
              >
                  <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-500 shrink-0 shadow-inner">
                      <CheckCircle2 size={32} />
                  </div>
                  <div className="pr-4">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight">Success!</h3>
                      <p className="text-slate-500 font-bold uppercase tracking-[0.1em] text-[10px] mt-1">Settings updated</p>
                  </div>
                  <button onClick={() => setShowSuccess(false)} className="ml-auto w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
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

function ActivityRow({ activity }: { activity: Activity }) {
  return (
    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#f7931a]/10 text-[#f7931a] flex items-center justify-center group-hover:scale-110 transition-transform"><Zap size={24} /></div>
        <div>
          <h4 className="text-white font-bold text-lg">Tip Received</h4>
          <p className="text-slate-500 text-sm">From {activity.to_name || 'Anonymous'} • {new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-black text-[#f7931a] flex items-center gap-2">+{activity.amount} <MUSDLogo className="w-5 h-5 opacity-50" /></p>
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
    const [thankYouMsg, setThankYouMsg] = useState(creator?.thank_you_message || '');
    const [btnText, setBtnText] = useState(creator?.button_text || 'Buy Me a Coffee ☕');
    
    const initialAmounts = (creator?.suggested_amounts || []).map(a => Number(a)).slice(0, 3);
    if (initialAmounts.length === 0) initialAmounts.push(5, 10, 20);
    while(initialAmounts.length < 3) initialAmounts.push(0);
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
        if (!creator) return;
        setSaving(true);
        try {
            const finalAmounts = [Number(amt1), Number(amt2), Number(amt3)].filter(a => a > 0);
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    wallet_address: creator.address,
                    username: creator.username,
                    button_text: btnText,
                    thank_you_message: thankYouMsg,
                    suggested_amounts: finalAmounts
                }),
            });
            if (!res.ok) throw new Error('API Error');
            
            // Trigger the global success popup FIRST
            onSuccess();
            
            // Then update data in background
            await onUpdate();
            
        } catch (e) { 
            console.error(e);
            alert('Error saving settings.'); 
        }
        finally { setSaving(false); }
    };

    return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl space-y-8 bg-[#0f0f14] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative"
        >
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f7931a]/10 flex items-center justify-center text-[#f7931a]">
                    <Settings2 size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Tip Customization</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Set up your tipping preferences</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Button Text Select */}
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block text-center">Button Label</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {buttonOptions.map(opt => (
                            <button
                                key={opt}
                                onClick={() => setBtnText(opt)}
                                className={`px-4 py-4 rounded-2xl border text-sm font-bold transition-all text-center ${btnText === opt ? 'bg-[#f7931a] border-[#f7931a] text-black shadow-lg shadow-[#f7931a]/20' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Suggested Amounts */}
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block text-center">Suggested Amounts (Max 3)</label>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="relative">
                            <input type="number" value={amt1} onChange={e => setAmt1(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white text-center font-black outline-none focus:ring-2 focus:ring-[#f7931a] hide-spinner" placeholder="5" />
                            <MUSDLogo className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                        </div>
                        <div className="relative">
                            <input type="number" value={amt2} onChange={e => setAmt2(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white text-center font-black outline-none focus:ring-2 focus:ring-[#f7931a] hide-spinner" placeholder="10" />
                            <MUSDLogo className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                        </div>
                        <div className="relative">
                            <input type="number" value={amt3} onChange={e => setAmt3(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white text-center font-black outline-none focus:ring-2 focus:ring-[#f7931a] hide-spinner" placeholder="20" />
                            <MUSDLogo className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                        </div>
                    </div>
                </div>

                {/* Thank You Msg */}
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block">Thank You Message</label>
                    <textarea 
                      value={thankYouMsg} 
                      onChange={e => setThankYouMsg(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-[#f7931a] h-32 resize-none transition-all font-medium placeholder:text-slate-800" 
                      placeholder="Write a heartfelt message for your supporters..." 
                    />
                </div>
            </div>

            <button 
              onClick={save} 
              disabled={saving} 
              className="w-full bg-[#f7931a] hover:bg-[#e8850f] text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-[#f7931a]/20 disabled:opacity-50"
            >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
                <span className="uppercase tracking-widest text-sm">Save Tipping Rules</span>
            </button>

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
