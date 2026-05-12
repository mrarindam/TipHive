'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ExternalLink, Zap, AlertCircle, RefreshCw, XCircle, Loader2, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import Image from 'next/image';
import Link from 'next/link';
import MUSDLogo from '@/components/ui/MUSDLogo';
import { SUBSCRIPTION_ABI, SUBSCRIPTION_CONTRACT } from '@/lib/contracts';

interface Subscription {
  id: string;
  creator_address: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  active: boolean;
  total_paid: number;
  tx_hash: string;
  subscription_plans: {
    name: string;
    price: number;
    chain_plan_id: number;
    description?: string;
    perks?: string[];
    duration?: number;
    active?: boolean;
  };
  creators: {
    name: string;
    username: string;
    avatar_url: string;
  };
}

export default function MySubscriptions() {
  const { address } = useAccount();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [currentAction, setCurrentAction] = useState<'renew' | 'cancel' | null>(null);
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [centerIndex, setCenterIndex] = useState(0);
  const [showDescModal, setShowDescModal] = useState<string | null>(null);



  const { writeContract, data: hash } = useWriteContract();
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const fetchSubscriptions = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_plans(name, price, chain_plan_id, description, perks, duration, active)
        `)
        .eq('fan_address', address.toLowerCase())
        .order('end_date', { ascending: false });

      if (error) throw error;
      if (data) {
        const creatorAddresses = Array.from(new Set(data.map((sub) => sub.creator_address).filter(Boolean)));
        const { data: profiles } = creatorAddresses.length
          ? await supabase
            .from('user_profiles')
            .select('wallet_address, display_name, username, avatar_url')
            .in('wallet_address', creatorAddresses)
          : { data: [] };

        const profileByAddress = new Map((profiles || []).map((profile) => [
          profile.wallet_address,
          {
            name: profile.display_name,
            username: profile.username,
            avatar_url: profile.avatar_url,
          },
        ]));

        setSubscriptions(data.map((sub) => ({
          ...sub,
          creators: profileByAddress.get(sub.creator_address) || {
            name: sub.creator_address?.slice(0, 8),
            username: sub.creator_address?.slice(0, 8),
            avatar_url: '',
          },
        })) as unknown as Subscription[]);
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchSubscriptions();
  }, [address, fetchSubscriptions]);

  const handleRenew = async (sub: Subscription) => {
    if (!sub.subscription_plans?.chain_plan_id && sub.subscription_plans?.chain_plan_id !== 0) return;

    setActionStatus('processing');
    setCurrentAction('renew');
    setActiveSubId(sub.id);

    try {
      writeContract({
        address: SUBSCRIPTION_CONTRACT,
        abi: SUBSCRIPTION_ABI,
        functionName: 'renewSubscription',
        args: [BigInt(sub.subscription_plans.chain_plan_id)],
      });
    } catch (err) {
      console.error(err);
      setActionStatus('error');
    }
  };

  useEffect(() => {
    if (isConfirmed && actionStatus === 'processing' && activeSubId) {
      const updateDb = async () => {
        const sub = subscriptions.find(s => s.id === activeSubId);
        if (!sub) return;

        try {
          if (currentAction === 'cancel') {
            // This was a CANCELLATION
            await supabase
              .from('subscriptions')
              .update({ active: false })
              .eq('id', activeSubId);

            // Update local state immediately for instant UI feedback
            setSubscriptions(prev => prev.map(s =>
              s.id === activeSubId ? { ...s, active: false } : s
            ));
          } else if (currentAction === 'renew') {
            // This was a RENEWAL
            const duration = sub.subscription_plans?.duration || (30 * 86400);
            const currentEndDate = new Date(sub.end_date);
            const baseDate = currentEndDate > new Date() ? currentEndDate : new Date();
            const newEndDate = new Date(baseDate.getTime() + (duration * 1000));

            await supabase
              .from('subscriptions')
              .update({
                end_date: newEndDate.toISOString(),
                active: true
              })
              .eq('id', activeSubId);

            // Update local state immediately
            setSubscriptions(prev => prev.map(s =>
              s.id === activeSubId ? { ...s, active: true, end_date: newEndDate.toISOString() } : s
            ));
          }

          // Delay the fetch slightly to let indexing settle
          setTimeout(async () => {
            await fetchSubscriptions();
            setActionStatus('success');
            setCurrentAction(null);
            setTimeout(() => setActionStatus('idle'), 2000);
          }, 1000);
        } catch (err) {
          console.error('Error updating DB:', err);
          setActionStatus('error');
          setCurrentAction(null);
        }
      };
      updateDb();
    }
  }, [isConfirmed, actionStatus, activeSubId, subscriptions, fetchSubscriptions, currentAction]);

  const handleNext = () => {
    setCenterIndex((prev) => (prev + 1) % subscriptions.length);
  };

  const handlePrev = () => {
    setCenterIndex((prev) => (prev - 1 + subscriptions.length) % subscriptions.length);
  };


  if (loading) return <div className="py-20 text-center animate-pulse text-slate-500 font-outfit">Loading Your Subscriptions...</div>;

  return (
    <div className="relative w-full py-20 overflow-hidden">
      {subscriptions.length > 0 ? (
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-5xl h-[600px] flex items-center justify-center perspective-1000">
            {/* Navigation Buttons */}
            <button
              onClick={handlePrev}
              className="absolute left-2 md:left-4 top-[55%] -translate-y-1/2 z-50 w-11 h-11 md:w-14 md:h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-[#F7931A] transition-all shadow-2xl"
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 md:right-4 top-[55%] -translate-y-1/2 z-50 w-11 h-11 md:w-14 md:h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-[#F7931A] transition-all shadow-2xl"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            <AnimatePresence initial={false}>
              {subscriptions.map((sub, index) => {
                const isExpired = new Date(sub.end_date) < new Date();
                const isProcessing = actionStatus === 'processing' && activeSubId === sub.id;

                // Calculate relative position
                let position = index - centerIndex;
                if (position > subscriptions.length / 2) position -= subscriptions.length;
                if (position < -subscriptions.length / 2) position += subscriptions.length;

                const isActive = position === 0;

                return (
                  <motion.div
                    key={sub.id}
                    animate={{
                      x: position * 280,
                      scale: isActive ? 1.05 : 0.75,
                      opacity: isActive ? 1 : 0.3,
                      zIndex: isActive ? 40 : 40 - Math.abs(position),
                      rotateY: position * -10,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute w-[280px] md:w-[340px]"
                    onClick={() => setCenterIndex(index)}
                  >


                    <div className={`glass-card p-3 border-2 transition-all duration-500 overflow-hidden group ${isActive ? 'border-[#F7931A] shadow-[0_0_50px_rgba(247,147,26,0.3)]' : 'border-white/5'
                      }`}>
                      {/* Image Thumbnail (Like the reference) */}
                      <div className="relative w-full h-[140px] md:h-[160px] rounded-2xl overflow-hidden mb-4">

                        <Image
                          src={sub.creators?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.creators?.name || 'C')}&background=random`}
                          alt={sub.creators?.name || 'Creator'}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute top-4 left-4 right-4 z-20">
                          {sub.subscription_plans?.active === false ? (
                            <div className="bg-[#F7931A] text-white px-3 py-2 rounded-xl text-[7px] md:text-[8px] font-black uppercase tracking-tight shadow-xl flex items-center gap-2 border border-white/20">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>Creator already canceled the plan but still you get the perk benefit until the plan end time</span>
                            </div>
                          ) : (
                            <div className={`w-fit px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${isExpired
                              ? 'bg-red-500 text-white shadow-red-500/30'
                              : 'bg-green-500 text-white shadow-green-500/30'
                              }`}>
                              {isExpired ? 'Expired' : 'Active'}
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Content Section */}
                      <div className="px-1 pb-2">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-0.5 font-outfit line-clamp-1">{sub.creators?.name}</h3>
                        <p className="text-[11px] text-[#F7931A] font-bold mb-3">@{sub.creators?.username}</p>

                        <div className="flex justify-between items-end mb-4">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Selected Plan</span>
                            <span className="text-base font-black text-white uppercase tracking-tight">{sub.subscription_plans?.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Rate</span>
                            <span className="text-lg font-black text-[#F7931A] flex items-center justify-end gap-1">
                              {sub.subscription_plans?.price} <MUSDLogo className="w-4 h-4" />
                            </span>
                          </div>
                        </div>


                        {/* View Description Link */}
                        {sub.subscription_plans?.description && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowDescModal(sub.id); }}
                            className="flex items-center gap-2 mb-4 text-[9px] font-black text-[#F7931A] hover:text-white uppercase tracking-widest transition-colors group/desc"
                          >
                            <AlertCircle className="w-3 h-3" />
                            View Descriptions
                            <ChevronRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        )}



                        {/* Perks */}
                        {sub.subscription_plans?.perks && sub.subscription_plans.perks.length > 0 && (
                          <div className="mb-4">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Included Perks</p>
                            <div className="space-y-1.5">
                              {sub.subscription_plans.perks.slice(0, 3).map((perk, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
                                  <Zap className="w-2.5 h-2.5 text-[#F7931A] shrink-0" />
                                  {perk}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}


                        {/* Validity Info */}
                        <div className="flex items-center justify-between mb-4 pt-3 border-t border-white/5">
                          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            <Clock className="w-2.5 h-2.5 text-[#F7931A]" />
                            <span>{isExpired ? 'Expired' : 'Valid until'}</span>
                          </div>
                          <span className="text-[9px] font-black text-white">{new Date(sub.end_date).toLocaleDateString()}</span>
                        </div>



                        <div className="flex flex-col gap-3">
                          <div className="flex gap-2">
                            {!isExpired && sub.active ? (
                              <button
                                disabled
                                className="flex-1 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-[10px] font-black text-green-400 uppercase tracking-widest flex items-center justify-center gap-2"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Current Plan Live
                              </button>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRenew(sub); }}
                                disabled={isProcessing || sub.subscription_plans?.active === false}
                                className={`flex-1 py-3 rounded-xl text-[10px] font-black text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg ${sub.subscription_plans?.active === false
                                  ? 'bg-white/5 border border-white/10 text-slate-600 blur-[1px] cursor-not-allowed'
                                  : 'bg-[#F7931A] hover:bg-orange-600'
                                  }`}
                              >
                                {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                {sub.subscription_plans?.active === false ? 'Tier Unavailable' : 'Renew Subscription'}
                              </button>
                            )}
                          </div>

                          <a
                            href={`https://explorer.test.mezo.org/tx/${sub.tx_hash}`}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-center gap-2 text-[9px] text-slate-600 hover:text-[#F7931A] uppercase tracking-widest font-black transition-colors"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            View on Explorer
                          </a>
                        </div>

                      </div>

                      {/* Success Overlay */}
                      <AnimatePresence>
                        {actionStatus === 'success' && activeSubId === sub.id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-20 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center"
                          >
                            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                            <p className="text-white font-black uppercase text-lg tracking-tighter">Plan Updated!</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="flex gap-2 mt-6">
            {subscriptions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCenterIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${centerIndex === i ? 'w-6 bg-[#F7931A]' : 'w-1.5 bg-white/20'
                  }`}
              />
            ))}
          </div>

          {/* Description Modal Overlay */}
          <AnimatePresence>
            {showDescModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                onClick={() => setShowDescModal(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="glass-card w-full max-w-lg p-8 relative border-white/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setShowDescModal(null)}
                    className="absolute top-6 right-6 text-slate-500 hover:text-white"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>

                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-[#F7931A]/10 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-[#F7931A]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#F7931A] uppercase tracking-widest mb-1">Subscription Details</h4>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">
                        {subscriptions.find(s => s.id === showDescModal)?.subscription_plans?.name}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Full Description</p>
                      <p className="text-slate-300 leading-relaxed font-medium">
                        {subscriptions.find(s => s.id === showDescModal)?.subscription_plans?.description}
                      </p>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Creator</span>
                        <span className="text-sm font-bold text-white">
                          {subscriptions.find(s => s.id === showDescModal)?.creators?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowDescModal(null)}
                    className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-all"
                  >
                    Close Preview
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      ) : (
        <div className="py-24 text-center glass-card border-dashed border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F7931A]/5 to-transparent opacity-50" />
          <AlertCircle className="w-12 h-12 text-slate-800 mx-auto mb-6 opacity-50" />
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">No Active Support</h3>
          <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">You haven&apos;t joined any creator circles yet. Start supporting your favorite artists!</p>
          <Link href="/discover" className="btn-primary px-10 py-4 mx-auto inline-flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5" />
            Discover Creators
          </Link>
        </div>
      )}
    </div>
  );
}
