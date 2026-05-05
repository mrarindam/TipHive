'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ExternalLink, Zap, AlertCircle, RefreshCw, XCircle, Loader2, CheckCircle2 } from 'lucide-react';
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
  const [activeSubId, setActiveSubId] = useState<string | null>(null);

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
          subscription_plans(name, price, chain_plan_id, description, perks, duration)
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

  const handleCancel = async (sub: Subscription) => {
    if (!sub.subscription_plans?.chain_plan_id && sub.subscription_plans?.chain_plan_id !== 0) return;

    setActionStatus('processing');
    setActiveSubId(sub.id);

    try {
      writeContract({
        address: SUBSCRIPTION_CONTRACT,
        abi: SUBSCRIPTION_ABI,
        functionName: 'cancelSubscription',
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

        // If it was a renewal, update the end_date in DB
        // In a real app, we'd fetch the actual end date from contract or increment by duration
        // For simplicity, let's just refresh data

        await fetchSubscriptions();
        setActionStatus('success');
        setTimeout(() => setActionStatus('idle'), 3000);
      };
      updateDb();
    }
  }, [isConfirmed, actionStatus, activeSubId, subscriptions, fetchSubscriptions]);

  if (loading) return <div className="py-20 text-center animate-pulse text-slate-500 font-outfit">Loading Your Subscriptions...</div>;

  return (
    <div className="space-y-6">
      {subscriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subscriptions.map((sub) => {
            const isExpired = new Date(sub.end_date) < new Date();
            const isProcessing = actionStatus === 'processing' && activeSubId === sub.id;

            return (
              <div key={sub.id} className="glass-card p-6 border-white/5 hover:border-[#F7931A]/30 transition-all group relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F7931A]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#F7931A]/10 transition-all" />

                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <Image
                    src={sub.creators?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.creators?.name || 'C')}&background=random`}
                    alt={sub.creators?.name || 'Creator'}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-white/5"
                    unoptimized
                  />
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight font-outfit">{sub.creators?.name}</h3>
                    <Link
                      href={`/profile/${sub.creators?.username || sub.creator_address}`}
                      className="text-xs text-[#F7931A] font-bold hover:underline"
                    >
                      @{sub.creators?.username || sub.creator_address.slice(0, 6)}
                    </Link>
                  </div>
                  <div className="ml-auto text-right">
                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${!isExpired ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                      {!isExpired ? 'Active' : 'Expired'}
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5 group-hover:border-white/5 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Selected Plan</span>
                    <span className="text-sm font-black text-white uppercase tracking-tight">{sub.subscription_plans?.name}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rate</span>
                    <span className="text-sm font-black text-[#F7931A] flex items-center gap-1">
                      {sub.subscription_plans?.price} <MUSDLogo className="w-4 h-4" />
                    </span>
                  </div>
                  {sub.subscription_plans?.duration && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Access</span>
                      <span className="text-xs font-bold text-slate-300">{sub.subscription_plans.duration / 86400} Days</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {sub.subscription_plans?.description && (
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">{sub.subscription_plans.description}</p>
                )}

                {/* Perks */}
                {sub.subscription_plans?.perks && sub.subscription_plans.perks.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Included Perks</p>
                    <div className="space-y-1.5">
                      {sub.subscription_plans.perks.map((perk, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <Zap className="w-3 h-3 text-[#F7931A] shrink-0" />
                          {perk}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <Clock className="w-4 h-4 text-[#F7931A]" />
                    <span>{isExpired ? 'Expired on' : 'Renews on'} {new Date(sub.end_date).toLocaleDateString()}</span>
                  </div>
                  <a
                    href={`https://explorer.test.mezo.org/tx/${sub.tx_hash}`}
                    target="_blank"
                    className="flex items-center gap-2 text-[10px] text-slate-600 hover:text-white uppercase tracking-widest font-black transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on Explorer
                  </a>
                </div>

                <div className="flex gap-2 relative z-10">
                  {!isExpired && sub.active ? (
                    <button
                      disabled
                      className="flex-1 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-[10px] font-black text-green-400 uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Current Plan Live
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRenew(sub)}
                      disabled={isProcessing}
                      className="flex-1 py-3 bg-white/5 hover:bg-[#F7931A]/10 border border-white/5 hover:border-[#F7931A]/50 rounded-xl text-[10px] font-black text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      {isProcessing && actionStatus === 'processing' ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3 text-[#F7931A]" />}
                      Renew
                    </button>
                  )}
                  <button
                    onClick={() => handleCancel(sub)}
                    disabled={isProcessing || isExpired}
                    className="py-3 px-4 bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/50 rounded-xl text-[10px] font-black text-slate-400 hover:text-red-500 transition-all uppercase tracking-widest"
                    title="Cancel Auto-renew"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>

                {/* Success Overlay */}
                <AnimatePresence>
                  {actionStatus === 'success' && activeSubId === sub.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center"
                    >
                      <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
                      <p className="text-white font-black uppercase text-xs tracking-tighter">Updated Successfully!</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
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
