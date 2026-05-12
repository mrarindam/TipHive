'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Zap,
  Clock,
  LayoutGrid,
  X,
  Loader2,
  CheckCircle2,
  Power,
  PowerOff,
  Users as UsersIcon,
  ExternalLink,
  SlidersHorizontal
} from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { SUBSCRIPTION_ABI, SUBSCRIPTION_CONTRACT } from '@/lib/contracts';
import { supabase } from '@/lib/supabase';
import CelebrationModal from '@/components/ui/CelebrationModal';
import MUSDLogo from '@/components/ui/MUSDLogo';

type ViewMode = 'manage' | 'create' | 'members';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  perks: string[];
  active: boolean;
  chain_plan_id: number;
  welcome_note?: string;
}

interface FanProfile {
  wallet_address: string;
  display_name: string;
  username: string;
  avatar_url: string;
}

interface Subscriber {
  id: string;
  fan_address: string;
  creator_address: string;
  plan_id: string;
  created_at: string;
  end_date: string;
  active: boolean;
  total_paid: number;
  tx_hash: string;
  fan?: FanProfile | null;
  plan?: Plan | null;
}



export default function SubscriptionManager() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<ViewMode>('manage');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [memberPage, setMemberPage] = useState(1);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [notification, setNotification] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastCreatedTier, setLastCreatedTier] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    durationDays: '30',
    description: '',
    perks: [
      { id: '1', text: 'Unlock exclusive posts & updates' },
      { id: '2', text: 'Access members-only content' },
      { id: '3', text: 'Get early access to new posts' }
    ],
    welcome_note: 'Thank you for joining my membership! 🎉'
  });

  const { writeContract, data: hash, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const processedHashes = React.useRef<Set<string>>(new Set());

  // Error listener
  useEffect(() => {
    if (writeError) {
      console.error("Write Contract Error:", writeError);
      const msg = writeError.message.includes('User rejected')
        ? "Transaction rejected by user ❌"
        : writeError.message.split('\n')[0] || "Transaction failed";
      setNotification({ message: msg, type: 'error' });
      setCreating(false);
      setActiveActionId(null);

      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [writeError]);

  // Read current plan counter from contract
  const { data: planCounter, refetch: refetchCounter } = useReadContract({
    address: SUBSCRIPTION_CONTRACT,
    abi: SUBSCRIPTION_ABI,
    functionName: 'planCounter',
  });

  // Read earnings from contract
  // const { data: contractEarnings } = useReadContract({
  //   address: SUBSCRIPTION_CONTRACT,
  //   abi: SUBSCRIPTION_ABI,
  //   functionName: 'getCreatorEarnings',
  //   args: [address as `0x${string}`],
  // });

  const fetchPlans = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      // Step 1: Fetch plans
      const { data } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('creator_address', address.toLowerCase())
        .order('created_at', { ascending: false });

      if (data) setPlans(data as Plan[]);

      // Step 2: Fetch subscriptions (simple query, no join)
      const { data: rawSubs, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .or(`creator_address.eq.${address},creator_address.eq.${address.toLowerCase()}`)
        .order('created_at', { ascending: false });

      if (subsError) {
        console.error('Subscriptions fetch error:', subsError);
      }

      if (rawSubs && rawSubs.length > 0) {
        // Step 3: Get unique fan addresses
        const fanAddresses = [...new Set(rawSubs.map((s: Subscriber) => s.fan_address?.toLowerCase()).filter(Boolean))];

        // Step 4: Fetch fan profiles separately
        const { data: fanProfiles } = await supabase
          .from('user_profiles')
          .select('wallet_address, display_name, username, avatar_url')
          .in('wallet_address', fanAddresses);

        const profileMap = new Map((fanProfiles || []).map((p: FanProfile) => [p.wallet_address?.toLowerCase(), p]));

        // Step 5: Get plan names
        const planIds = [...new Set(rawSubs.map((s: Subscriber) => s.plan_id).filter(Boolean))];
        const { data: planData } = planIds.length > 0 ? await supabase
          .from('subscription_plans')
          .select('*')
          .in('id', planIds) : { data: [] };

        const planMap = new Map((planData || []).map((p: Plan) => [p.id, p]));

        // Step 6: Merge all data
        const enriched = rawSubs.map((s: Subscriber) => ({
          ...s,
          fan: profileMap.get(s.fan_address?.toLowerCase()) || null,
          plan: planMap.get(s.plan_id) || null,
        }));

        setSubscribers(enriched);
      } else {
        setSubscribers([]);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchPlans();
  }, [address, fetchPlans]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      setNotification({ message: "Please connect your wallet first! 🔌", type: 'error' });
      return;
    }

    if (!formData.price || isNaN(parseFloat(formData.price))) {
      setNotification({ message: "Please enter a valid price. 💰", type: 'error' });
      return;
    }

    const activePlansCount = plans.filter(p => p.active).length;
    if (activePlansCount >= 3) {
      setNotification({ message: "Maximum 3 active tiers allowed. Deactivate one first! 🛡️", type: 'error' });
      return;
    }

    setCreating(true);
    console.log("Creating plan with:", formData);

    try {
      const priceWei = parseEther(formData.price);
      const durationSeconds = BigInt(parseInt(formData.durationDays) * 86400);

      writeContract({
        address: SUBSCRIPTION_CONTRACT,
        abi: SUBSCRIPTION_ABI,
        functionName: 'createPlan',
        args: [formData.name, priceWei, durationSeconds],
      });
    } catch (err) {
      console.error("Transaction failed:", err);
      setNotification({ message: "Transaction failed to initiate ❌", type: 'error' });
      setCreating(false);
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    if (!plan.active && plans.filter(p => p.active).length >= 3) {
      setNotification({ message: "Maximum 3 active tiers allowed. Deactivate one first! 🛡️", type: 'error' });
      return;
    }

    setActiveActionId(plan.id);
    try {
      const priceWei = parseEther(plan.price.toString());
      writeContract({
        address: SUBSCRIPTION_CONTRACT,
        abi: SUBSCRIPTION_ABI,
        functionName: 'updatePlan',
        args: [BigInt(plan.chain_plan_id), plan.name, priceWei, !plan.active],
      });
    } catch (err) {
      console.error(err);
      setActiveActionId(null);
    }
  };

  useEffect(() => {
    if (isConfirmed && hash && address && creating) {
      if (processedHashes.current.has(hash)) return;
      processedHashes.current.add(hash);

      const saveToDb = async () => {
        try {
          const { data: updatedCounter } = await refetchCounter();
          let chainId = 0;
          if (updatedCounter !== undefined) {
            chainId = Number(updatedCounter) - 1;
          }

          await supabase.from('subscription_plans').insert({
            creator_address: address.toLowerCase(),
            name: formData.name,
            price: parseFloat(formData.price),
            duration: parseInt(formData.durationDays) * 86400,
            description: formData.description,
            perks: formData.perks.map(p => p.text),
            welcome_note: formData.welcome_note,
            active: true,
            chain_plan_id: chainId >= 0 ? chainId : 0
          });

          setNotification({ message: "Subscription Tier Live! 🎉", type: 'success' });
          setLastCreatedTier(formData.name);
          setShowCelebration(true);
          setCreating(false);
          setActiveTab('manage');
          fetchPlans();
          setFormData({
            name: '',
            price: '',
            durationDays: '30',
            description: '',
            perks: [
              { id: '1', text: 'Unlock exclusive posts & updates' },
              { id: '2', text: 'Access members-only content' },
              { id: '3', text: 'Get early access to new posts' }
            ],
            welcome_note: 'Thank you for joining my membership! 🎉'
          });
        } catch (err) {
          console.error("DB Save Error:", err);
        }
      };
      saveToDb();
    } else if (isConfirmed && hash && activeActionId) {
      if (processedHashes.current.has(hash)) return;
      processedHashes.current.add(hash);

      const updateDb = async () => {
        const plan = plans.find(p => p.id === activeActionId);
        if (!plan) return;

        await supabase
          .from('subscription_plans')
          .update({ active: !plan.active })
          .eq('id', plan.id);

        setNotification({
          message: `Tier "${plan.name}" ${!plan.active ? 'is now Live! 🚀' : 'has been Deactivated. 🛡️'}`,
          type: 'success'
        });
        setActiveActionId(null);
        fetchPlans();
        refetchCounter();
      };
      updateDb();
    }
  }, [isConfirmed, hash, creating, activeActionId, address, planCounter, refetchCounter, fetchPlans, formData, plans]);

  if (loading) return <div className="py-20 text-center animate-pulse text-slate-500 font-outfit uppercase tracking-widest font-black">Syncing Tiers with Mezo...</div>;

  return (
    <div className="space-y-8 relative">
      {/* Custom Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-[200] flex items-center gap-3 bg-[#1a1a1f] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notification.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
              }`}>
              {notification.type === 'error' ? <X className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-black text-white uppercase tracking-tight">{notification.message}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Subscription Manager</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 p-1 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'manage' ? 'bg-[#F7931A] text-black shadow-lg shadow-orange-500/20' : 'bg-white/5 text-slate-500 hover:bg-white/10'
              }`}
          >
            Manage Tiers
          </button>
          <button
            disabled={plans.filter(p => p.active).length >= 3 && activeTab !== 'create'}
            onClick={() => setActiveTab('create')}
            className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'create' ? 'bg-[#F7931A] text-black shadow-lg shadow-orange-500/20' : 'bg-white/5 text-slate-500 hover:bg-white/10'
              } ${plans.filter(p => p.active).length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Create New Tier
            {plans.filter(p => p.active).length >= 3 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" title="Limit Reached" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'members' ? 'bg-[#F7931A] text-black shadow-lg shadow-orange-500/20' : 'bg-white/5 text-slate-500 hover:bg-white/10'
              }`}
          >
            Members Zone
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'manage' ? (
          <motion.div
            key="manage"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Filter UI */}
            <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-2 rounded-2xl">
              <div className="flex items-center gap-1.5 p-1">
                <button
                  onClick={() => setFilter('active')}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === 'active' ? 'bg-[#F7931A] text-black shadow-lg shadow-orange-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${filter === 'active' ? 'bg-black' : 'bg-green-500'}`} />
                  Live Tiers
                </button>
                <button
                  onClick={() => setFilter('inactive')}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === 'inactive' ? 'bg-[#F7931A] text-black shadow-lg shadow-orange-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${filter === 'inactive' ? 'bg-black' : 'bg-red-500'}`} />
                  Inactive
                </button>
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === 'all' ? 'bg-[#F7931A] text-black shadow-lg shadow-orange-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  All Tiers
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans
                .filter(p => {
                  if (filter === 'active') return p.active;
                  if (filter === 'inactive') return !p.active;
                  return true;
                })
                .length > 0 ? plans
                  .filter(p => {
                    if (filter === 'active') return p.active;
                    if (filter === 'inactive') return !p.active;
                    return true;
                  })
                  .map((plan) => {
                    const isProcessing = activeActionId === plan.id;
                    return (
                      <div key={plan.id} className="glass-card p-6 border-white/5 bg-white/[0.03] group transition-all hover:bg-white/[0.05] relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${plan.active ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                            {plan.active ? 'Live' : 'Inactive'}
                          </span>
                          <div className="flex items-center gap-1.5 text-[#F7931A] font-black text-xl">
                            <span>{plan.price}</span>
                            <MUSDLogo className="w-5 h-5" />
                          </div>
                        </div>

                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 leading-none">{plan.name}</h3>
                        <p className="text-slate-500 text-sm font-medium mb-6 line-clamp-2">{plan.description}</p>

                        <div className="space-y-3 mb-8">
                          <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                            <Clock className="w-3.5 h-3.5 text-[#F7931A]" />
                            {plan.duration / 86400} Days Access
                          </div>
                          <div className="space-y-2 mt-4">
                            {plan.perks?.slice(0, 5).map((perk, i) => (
                              <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <div className="w-4 h-4 rounded bg-[#F7931A]/10 flex items-center justify-center text-[#F7931A]">
                                  <Zap size={10} />
                                </div>
                                <span className="truncate">{perk}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 flex gap-3">
                          <button
                            onClick={() => handleToggleActive(plan)}
                            disabled={isProcessing}
                            className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${plan.active
                              ? 'bg-white/5 text-slate-300 hover:bg-red-500/10 hover:text-red-500 border border-transparent hover:border-red-500/20'
                              : 'bg-[#F7931A]/10 text-[#F7931A] hover:bg-[#F7931A] hover:text-black'
                              }`}
                          >
                            {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : plan.active ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                            {plan.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    );
                  }) : (
                <div className="col-span-full py-24 text-center glass-card border-dashed border-white/5">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    {filter === 'active' ? <Zap className="w-10 h-10 text-green-500/30" /> : <PowerOff className="w-10 h-10 text-red-500/30" />}
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
                    {filter === 'active' ? 'No Live Tiers' : filter === 'inactive' ? 'No Inactive Tiers' : 'No Tiers Found'}
                  </h3>
                  <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">
                    {filter === 'active'
                      ? 'All your subscription tiers are currently hidden or you haven\'t created any yet.'
                      : 'You don\'t have any deactivated tiers at the moment.'}
                  </p>
                  {filter === 'active' && (
                    <button
                      onClick={() => setActiveTab('create')}
                      className="btn-secondary px-10 py-4 mx-auto"
                    >
                      Set Up Your First Tier
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ) : activeTab === 'members' ? (
          <motion.div
            key="members"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#111116] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <UsersIcon className="w-12 h-12 text-[#F7931A]" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Total Members</p>
                <h3 className="text-4xl font-black text-white">
                  {new Set(subscribers.map(s => s.fan_address.toLowerCase())).size}
                </h3>
                <p className="text-[10px] text-slate-500 font-bold mt-2 flex items-center gap-1 uppercase tracking-widest">
                  Unique Members
                </p>
              </div>

              <div className="bg-[#111116] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Active Members</p>
                <h3 className="text-4xl font-black text-white">
                  {new Set(
                    subscribers
                      .filter(s => s.active === true && new Date(s.end_date) > new Date())
                      .map(s => s.fan_address?.toLowerCase())
                  ).size}
                </h3>
                <div className="text-[10px] text-green-500 font-bold mt-2 flex items-center gap-1 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Currently Live
                </div>
              </div>

              <div className="bg-[#111116] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap className="w-12 h-12 text-[#F7931A]" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Popular Plan</p>
                <h3 className="text-xl font-black text-white truncate">
                  {(() => {
                    const counts: Record<string, number> = {};
                    subscribers.forEach(s => {
                      const name = s.plan?.name || 'Unknown';
                      counts[name] = (counts[name] || 0) + 1;
                    });
                    const top = Object.entries(counts).sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0];
                    return top ? top[0] : 'No data';
                  })()}
                </h3>
                <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-widest">Most subscribed</p>
              </div>

              <div className="bg-[#111116] border border-[#F7931A]/20 rounded-3xl p-6 relative overflow-hidden group shadow-lg shadow-orange-500/5">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <MUSDLogo className="w-12 h-12" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Total Income</p>
                <h3 className="text-4xl font-black text-white flex items-center gap-2">
                  {subscribers.reduce((acc, curr) => acc + (curr.total_paid || 0), 0).toFixed(2)}
                  <MUSDLogo className="w-6 h-6 opacity-50" />
                </h3>
                <p className="text-[10px] text-[#F7931A] font-bold mt-2 uppercase tracking-widest">From Subscriptions</p>
              </div>
            </div>

            {/* Subscriber List with Pagination */}
            {(() => {
              const MEMBERS_PER_PAGE = 10;
              const totalMemberPages = Math.ceil(subscribers.length / MEMBERS_PER_PAGE);
              const pagedSubs = subscribers.slice((memberPage - 1) * MEMBERS_PER_PAGE, memberPage * MEMBERS_PER_PAGE);
              return (
                <div className="bg-[#111116] border border-white/5 rounded-[2rem] overflow-hidden">
                  <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white tracking-tight uppercase">Recent Joins</h3>
                    <span className="text-[10px] font-black bg-white/5 px-3 py-1 rounded-full text-slate-400 uppercase tracking-widest">{subscribers.length} Total</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {pagedSubs.length > 0 ? pagedSubs.map((sub, i) => (
                      <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-white/[0.05] bg-white/[0.02] transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden relative">
                            {sub.fan?.avatar_url ? (
                              <img src={sub.fan.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-700">
                                <UsersIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-sm group-hover:text-[#F7931A] transition-colors">
                              {sub.fan?.display_name || 'Anonymous Fan'}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium">@{sub.fan?.username || sub.fan_address?.slice(0, 10)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 justify-end mb-1">
                            <span className="text-[10px] font-black bg-[#F7931A]/10 text-[#F7931A] px-2 py-0.5 rounded-md uppercase tracking-widest border border-[#F7931A]/10">
                              {sub.plan?.name || 'Standard'}
                            </span>
                            <p className="text-white font-black text-sm">+{sub.total_paid || 0} MUSD</p>
                          </div>
                          <div className="flex items-center justify-end gap-3 mt-1.5">
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                              Joined {new Date(sub.created_at).toLocaleDateString()}
                            </p>
                            {sub.tx_hash && (
                              <a
                                href={`https://explorer.test.mezo.org/tx/${sub.tx_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#F7931A] text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline"
                              >
                                Explorer <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="py-20 text-center">
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active subscribers yet</p>
                      </div>
                    )}
                  </div>
                  {totalMemberPages > 1 && (
                    <div className="flex items-center justify-center gap-2 px-8 py-6 border-t border-white/5">
                      {Array.from({ length: totalMemberPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setMemberPage(i + 1)}
                          className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${memberPage === i + 1
                            ? 'bg-[#F7931A] text-black shadow-[0_0_15px_rgba(247,147,26,0.3)]'
                            : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </motion.div>
        ) : (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            <form onSubmit={handleCreatePlan} className="space-y-6">
              {/* Basic Info Section Card */}
              <div className="glass-card p-6 md:p-8 border-white/5 bg-white/[0.03] space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white tracking-tight">Tier Details</h3>
                  <p className="text-sm text-slate-500">Define the core identity and pricing of your access tier.</p>
                </div>

                <div className="space-y-6 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tier Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Diamond Circle"
                      className="w-full bg-black/20 border border-white/5 rounded-xl py-3.5 px-5 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none font-medium transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Price (MUSD)</label>
                      <div className="relative">
                        <input
                          required
                          type="number"
                          placeholder="10"
                          className="w-full bg-black/20 border border-white/5 rounded-xl py-3.5 px-5 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                        <MUSDLogo className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tier Duration</label>
                      <select
                        className="w-full bg-black/20 border border-white/5 rounded-xl py-3.5 px-5 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none appearance-none font-medium transition-all cursor-pointer"
                        value={formData.durationDays}
                        onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                      >
                        <option value="30" className="bg-[#1a1a1a]">1 Month Access</option>
                        <option value="90" className="bg-[#1a1a1a]">90 Days Access</option>
                        <option value="365" className="bg-[#1a1a1a]">Annual Access</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tier Description</label>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${formData.description.trim().split(/\s+/).filter(Boolean).length >= 40 && formData.description.trim().split(/\s+/).filter(Boolean).length <= 80
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                        {formData.description.trim().split(/\s+/).filter(Boolean).length} / 80 Words
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      placeholder="Describe your tier... (Aim for 40-80 words for best engagement)"
                      className="w-full bg-black/20 border border-white/5 rounded-xl py-3.5 px-5 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none resize-none font-medium transition-all"
                      value={formData.description}
                      onChange={(e) => {
                        const words = e.target.value.trim().split(/\s+/).filter(Boolean);
                        if (words.length <= 80) {
                          setFormData({ ...formData, description: e.target.value });
                        }
                      }}
                    />
                    <p className="text-[10px] text-slate-500 italic">Pro-tip: 40–80 words is the sweet spot for conversion. Max 80 words.</p>
                  </div>
                </div>
              </div>

              {/* Perks Section Card */}
              <div className="glass-card p-6 md:p-8 border-white/5 bg-white/[0.03] space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white tracking-tight">Included Perks ({formData.perks.length}/5)</h3>
                    <p className="text-sm text-slate-500">Add exclusive rewards for your subscribers.</p>
                  </div>
                  {formData.perks.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, perks: [...formData.perks, { id: Math.random().toString(36).substr(2, 9), text: '' }] })}
                      className="text-xs font-black text-[#F7931A] uppercase hover:text-white flex items-center gap-1 transition-colors bg-[#F7931A]/10 px-3 py-1.5 rounded-lg border border-[#F7931A]/20"
                    >
                      <Plus className="w-3 h-3" /> Add Perk
                    </button>
                  )}
                </div>

                <Reorder.Group
                  axis="y"
                  values={formData.perks}
                  onReorder={(newPerks) => setFormData({ ...formData, perks: newPerks })}
                  className="space-y-3"
                >
                  {formData.perks.map((perk, index) => (
                    <Reorder.Item key={perk.id} value={perk} className="flex items-center gap-3 group/perk">
                      <div className="w-10 h-12 rounded-xl bg-black/20 flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing hover:bg-black/40 transition-colors border border-white/5">
                        <LayoutGrid className="w-4 h-4 text-[#F7931A]/40" />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="e.g. Early access to videos"
                          className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none transition-all"
                          value={perk.text}
                          onChange={(e) => {
                            const newPerks = [...formData.perks];
                            newPerks[index] = { ...newPerks[index], text: e.target.value };
                            setFormData({ ...formData, perks: newPerks });
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newPerks = formData.perks.filter((_, i) => i !== index);
                          setFormData({ ...formData, perks: newPerks });
                        }}
                        className="p-3 text-slate-500 hover:text-red-500 transition-colors rounded-xl hover:bg-red-500/10"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>

              {/* Welcome Note Section Card */}
              <div className="glass-card p-6 md:p-8 border-white/5 bg-white/[0.03] space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">Welcome Note</h3>
                    <span className="text-[9px] bg-[#F7931A]/10 text-[#F7931A] px-2 py-0.5 rounded-full border border-[#F7931A]/20 font-black uppercase tracking-widest">
                      Auto-Sent
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">This message is shown to fans immediately after they subscribe.</p>
                </div>

                <div className="bg-black/20 border border-white/5 rounded-xl p-6 space-y-4">
                  <textarea
                    rows={3}
                    placeholder="Thank you for joining my membership! 🎉"
                    className="w-full bg-transparent text-white resize-none outline-none font-medium text-sm placeholder:text-slate-700 leading-relaxed"
                    value={formData.welcome_note}
                    onChange={(e) => setFormData({ ...formData, welcome_note: e.target.value })}
                  />
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <p className="text-[10px] text-slate-500 italic">Included in the welcome email.</p>
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400">
                      <Clock className="w-3 h-3" /> Post-Subscribe
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={creating || isConfirming}
                  className="w-full py-5 bg-[#F7931A] text-black text-xl font-black font-outfit uppercase tracking-tighter flex items-center justify-center gap-3 shadow-2xl shadow-orange-500/40 rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  {creating || isConfirming ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-current" />}
                  {creating ? 'Creating Tier...' : isConfirming ? 'Broadcasting...' : 'Go Live with Tier'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        type="tier_created"
        planName={lastCreatedTier}
      />
    </div>
  );
}
