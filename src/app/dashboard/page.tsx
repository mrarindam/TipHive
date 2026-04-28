'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Wallet, History, TrendingUp, DollarSign, Edit2, Copy, Check, Loader2, ChevronRight, User, Plus, Upload, CheckCircle2, Share2, Zap, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import ShareModal from '@/components/ui/ShareModal';
import MUSDLogo from '@/components/ui/MUSDLogo';
import SubscriptionManager from '@/components/dashboard/SubscriptionManager';
import MySubscriptions from '@/components/dashboard/MySubscriptions';

import { MUSD_ADDRESS, ERC20_ABI, TIPPING_CONTRACT, TIPPING_ABI, SUBSCRIPTION_CONTRACT, SUBSCRIPTION_ABI } from '@/lib/contracts';

interface Creator {
  address: string;
  username: string;
  name: string;
  bio: string;
  avatar_url: string;
  category: string;
  link: string;
  total_earned: number;
}

interface Activity {
  id: string;
  type: 'received' | 'sent' | 'withdrawn';
  source: 'tip' | 'subscription';
  amount: number;
  from_address?: string;
  to_address?: string;
  to_name?: string;
  created_at: string;
  tx_hash: string;
  plan_name?: string;
}

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'activity' | 'earnings' | 'tips' | 'subscriptions' | 'my_subscriptions'>('activity');
  const [creatorProfile, setCreatorProfile] = useState<Creator | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Stats
  const [totalTippedByMe, setTotalTippedByMe] = useState(0);

  // Contract Reads (Tipping)
  const { data: tipBalance, refetch: refetchTipBalance } = useReadContract({
    address: TIPPING_CONTRACT,
    abi: TIPPING_ABI,
    functionName: 'getCreatorBalance',
    args: [address as `0x${string}`],
  });

  // Contract Reads (Subscription)
  const { data: subEarnings, refetch: refetchSubEarnings } = useReadContract({
    address: SUBSCRIPTION_CONTRACT,
    abi: SUBSCRIPTION_ABI,
    functionName: 'getCreatorEarnings',
    args: [address as `0x${string}`],
  });

  // Read MUSD Wallet Balance
  const { data: musdWalletBalance, refetch: refetchWallet } = useReadContract({
    address: MUSD_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
  });

  // Total balance combining both contract holds
  const totalOnChainBalance = (tipBalance ? Number(tipBalance) : 0) + (subEarnings ? Number(subEarnings) : 0);
  const onChainBalanceFormatted = (totalOnChainBalance / 1e18).toFixed(2);
  const walletLiquidity = musdWalletBalance ? (Number(musdWalletBalance) / 1e18) : 0;

  const { writeContract: withdrawTips, data: tipHash } = useWriteContract();
  const { isLoading: isWithdrawingTips, isSuccess: tipWithdrawSuccess } = useWaitForTransactionReceipt({ hash: tipHash });

  const { writeContract: withdrawSub, data: subHash } = useWriteContract();
  const { isLoading: isWithdrawingSub, isSuccess: subWithdrawSuccess } = useWaitForTransactionReceipt({ hash: subHash });

  const isAnyWithdrawing = isWithdrawingTips || isWithdrawingSub;

  const fetchData = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    const userAddr = address.toLowerCase();

    // 1. Fetch Profile
    const { data: profile } = await supabase
      .from('creators')
      .select('*')
      .eq('address', userAddr)
      .single();

    setCreatorProfile(profile as Creator || null);

    // 2. Fetch Sent Tips
    const { data: sentTips } = await supabase
      .from('tips')
      .select('*, creators!tips_to_address_fkey(name)')
      .eq('from_address', userAddr);

    // 3. Fetch Received Tips
    const { data: receivedTips } = await supabase
      .from('tips')
      .select('*')
      .eq('to_address', userAddr);

    // 4. Fetch Received Subscriptions
    const { data: receivedSubs } = await supabase
      .from('subscriptions')
      .select('*, subscription_plans(name)')
      .eq('creator_address', userAddr);

    // Combine for Activity Overview
    const combined: any[] = [];
    
    if (sentTips) {
      sentTips.forEach(s => combined.push({
        id: s.id,
        type: 'sent',
        source: 'tip',
        amount: s.amount,
        to_name: s.creators?.name,
        created_at: s.created_at,
        tx_hash: s.tx_hash
      }));
      setTotalTippedByMe(sentTips.reduce((acc, curr) => acc + curr.amount, 0));
    }

    if (receivedTips) {
      receivedTips.forEach(r => combined.push({
        id: r.id,
        type: 'received',
        source: 'tip',
        amount: r.amount,
        from_address: r.from_address,
        created_at: r.created_at,
        tx_hash: r.tx_hash
      }));
    }

    if (receivedSubs) {
      receivedSubs.forEach(sub => combined.push({
        id: sub.id,
        type: 'received',
        source: 'subscription',
        amount: sub.total_paid,
        from_address: sub.fan_address,
        created_at: sub.created_at,
        tx_hash: sub.tx_hash,
        plan_name: sub.subscription_plans?.name
      }));
    }

    setActivities(combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    setLoading(false);
  }, [address]);

  useEffect(() => {
    if (isConnected && address) {
      fetchData();
    }
  }, [address, isConnected, fetchData]);

  useEffect(() => {
    if (tipWithdrawSuccess || subWithdrawSuccess) {
      refetchTipBalance();
      refetchSubEarnings();
      refetchWallet();
      fetchData();
    }
  }, [tipWithdrawSuccess, subWithdrawSuccess, fetchData, refetchTipBalance, refetchSubEarnings, refetchWallet]);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = async () => {
    if (totalOnChainBalance <= 0) return alert('No funds available for withdrawal.');
    
    // 1. Withdraw from Tipping if balance exists
    if (tipBalance && Number(tipBalance) > 0) {
      withdrawTips({
        address: TIPPING_CONTRACT,
        abi: TIPPING_ABI,
        functionName: 'withdraw',
        args: [BigInt(tipBalance.toString())],
      });
    }

    // 2. Withdraw from Subscription if earnings exist
    if (subEarnings && Number(subEarnings) > 0) {
      withdrawSub({
        address: SUBSCRIPTION_CONTRACT,
        abi: SUBSCRIPTION_ABI,
        functionName: 'withdrawEarnings',
        args: [BigInt(subEarnings.toString())],
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto py-32 text-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-2xl">
            <Wallet className="w-10 h-10 text-slate-500" />
          </div>
          <h2 className="text-5xl font-black text-white mb-4 uppercase tracking-tighter font-outfit">Gateway Locked</h2>
          <p className="text-slate-500 text-lg mb-12 max-w-md mx-auto">Connect your wallet to access your creator sanctuary and manage your earnings.</p>
          <button className="btn-primary px-12 py-4 text-lg">Connect Mezo Wallet</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-10">
          {/* Header Profile Section */}
          <div className="glass-card p-1 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#F7931A]/20 to-transparent blur-[120px] rounded-full -mr-64 -mt-64 group-hover:from-[#F7931A]/30 transition-all duration-700" />
            
            <div className="p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center md:items-start relative z-10">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-[#F7931A] to-orange-600 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative w-44 h-44 rounded-[2.8rem] overflow-hidden border-4 border-black bg-[#0d0d0d] shadow-2xl">
                  {creatorProfile?.avatar_url ? (
                    <Image 
                      src={creatorProfile.avatar_url} 
                      width={176}
                      height={176}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      alt="Profile" 
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#111]">
                      <User className="w-16 h-16 text-slate-800" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left pt-2">
                <div className="flex flex-col mb-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-6 mb-3">
                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter font-outfit leading-none">
                      {creatorProfile?.name || 'Anonymous Fan'}
                    </h1>
                    <div className="flex items-center gap-3 self-center md:self-auto">
                      <button
                        onClick={copyAddress}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-slate-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
                      >
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <button onClick={() => setIsShareModalOpen(true)} className="p-2.5 bg-[#F7931A]/10 text-[#F7931A] rounded-xl border border-[#F7931A]/20 hover:bg-[#F7931A]/20 transition-all">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {creatorProfile?.username && (
                    <div className="flex justify-center md:justify-start">
                      <span className="text-xs font-black text-[#F7931A] px-4 py-1.5 bg-[#F7931A]/10 rounded-full border border-[#F7931A]/30 uppercase tracking-[0.2em]">
                        @{creatorProfile.username}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-slate-400 text-lg mb-10 max-w-2xl font-medium leading-relaxed">
                  {creatorProfile?.bio || "You haven't added a bio yet. Set up your profile to start receiving support!"}
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  {creatorProfile ? (
                    <>
                      <button
                        onClick={handleWithdraw}
                        disabled={isAnyWithdrawing || totalOnChainBalance <= 0}
                        className="btn-primary px-10 py-4 flex items-center gap-3 shadow-xl shadow-orange-500/20 group overflow-hidden relative"
                      >
                         <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                         {isAnyWithdrawing ? <Loader2 className="w-5 h-5 animate-spin" /> : <DollarSign className="w-5 h-5" />}
                         <span className="relative z-10">{totalOnChainBalance <= 0 ? 'No Funds to Claim' : 'Withdraw All Earnings'}</span>
                      </button>
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="btn-secondary px-8 py-4 flex items-center gap-2 border-white/10 hover:border-white/30"
                      >
                        <Edit2 className="w-4 h-4" />
                        Modify Profile
                      </button>
                    </>
                  ) : (
                    <Link href="/register" className="btn-primary px-12 py-5 flex items-center gap-3 text-xl shadow-2xl shadow-orange-500/30">
                      <Plus className="w-6 h-6" />
                      Enter the Arena
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              label="Total Earnings"
              value={`${creatorProfile?.total_earned || 0}`}
              icon={<DollarSign className="w-6 h-6" />}
              color="text-[#F7931A]"
              subtext="Lifetime Combined"
            />
            <StatCard
              label="Wallet Balance"
              value={`${walletLiquidity.toFixed(2)}`}
              icon={<Wallet className="w-6 h-6" />}
              color="text-blue-400"
              subtext="Ready to Use (Includes Claimed)"
            />
            <StatCard
              label="Claimable Funds"
              value={`${onChainBalanceFormatted}`}
              icon={<TrendingUp className="w-6 h-6" />}
              color="text-green-400"
              subtext="Tips + Subscriptions"
            />
            <StatCard
              label="Sent By You"
              value={`${totalTippedByMe}`}
              icon={<History className="w-6 h-6" />}
              color="text-slate-500"
              subtext="Your Contributions"
            />
          </div>

          {/* Activity Section */}
          <div className="space-y-8 pt-6">
            <div className="flex items-center gap-10 border-b border-white/5 pb-1 overflow-x-auto no-scrollbar">
              <TabButton
                label="Activity Feed"
                active={activeTab === 'activity'}
                onClick={() => setActiveTab('activity')}
              />
              {creatorProfile && (
                <TabButton
                  label={`Revenue Logs`}
                  active={activeTab === 'earnings'}
                  onClick={() => setActiveTab('earnings')}
                />
              )}
              <TabButton
                label="Support Sent"
                active={activeTab === 'tips'}
                onClick={() => setActiveTab('tips')}
              />
              <TabButton
                label="My Subscriptions"
                active={activeTab === 'my_subscriptions'}
                onClick={() => setActiveTab('my_subscriptions')}
              />
              {creatorProfile && (
                <TabButton
                  label="Subscription Tiers"
                  active={activeTab === 'subscriptions'}
                  onClick={() => setActiveTab('subscriptions')}
                />
              )}
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {activeTab === 'subscriptions' ? (
                    <SubscriptionManager />
                  ) : activeTab === 'my_subscriptions' ? (
                    <MySubscriptions />
                  ) : getFilteredActivities(activeTab, activities).length > 0 ? (
                    getFilteredActivities(activeTab, activities).map(activity => (
                      <ActivityRow key={activity.id} activity={activity} />
                    ))
                  ) : (
                    <div className="py-32 text-center glass-card border-dashed border-white/10">
                      <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                         <History className="w-8 h-8 text-slate-800" />
                      </div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">Empty Feed</h3>
                      <p className="text-slate-600 font-medium max-w-xs mx-auto mt-2">No activity records found in this category yet.</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditProfileModal
            profile={creatorProfile}
            onClose={() => setShowEditModal(false)}
            onSuccess={fetchData}
          />
        )}
      </AnimatePresence>

      {creatorProfile && (
        <ShareModal 
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          url={`http://localhost:3000/profile/${creatorProfile.username || creatorProfile.address}`}
          title={`👋 Check out my profile on SuperPay! Support me with MUSD on Mezo Network.`}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color, subtext }: { label: string, value: string, icon: React.ReactNode, color: string, subtext?: string }) {
  return (
    <div className="glass-card p-1 group">
      <div className="p-8 rounded-[1.9rem] bg-black/40 group-hover:bg-black/20 transition-all duration-500">
        <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ${color}`}>
          {icon}
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">{label}</p>
        <div className="flex items-end justify-between">
           <h3 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
             {value} <MUSDLogo className="w-7 h-7" />
           </h3>
        </div>
        {subtext && <p className="text-[10px] text-slate-600 font-bold uppercase mt-4 tracking-widest leading-tight">{subtext}</p>}
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`pb-5 px-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${active ? 'text-[#F7931A]' : 'text-slate-500 hover:text-white'}`}
    >
      {label}
      {active && (
        <motion.div
          layoutId="activeTabUnderline"
          className="absolute bottom-0 left-0 right-0 h-1 bg-[#F7931A] rounded-full shadow-[0_0_15px_rgba(247,147,26,0.5)]"
        />
      )}
    </button>
  );
}

function ActivityRow({ activity }: { activity: any }) {
  const isReceived = activity.type === 'received';
  const isTip = activity.source === 'tip';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card p-5 flex items-center justify-between group hover:border-[#F7931A]/30 transition-all duration-300"
    >
      <div className="flex items-center gap-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
          isReceived 
            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
            : 'bg-white/5 text-slate-400 border-white/5'
        }`}>
          {isTip ? <Zap className="w-5 h-5 fill-current" /> : <Star className="w-5 h-5 fill-current" />}
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
             <h4 className="text-white font-black text-lg uppercase tracking-tight font-outfit">
               {isReceived 
                 ? (isTip ? 'MUSD Tip Received' : `Sub Joined: ${activity.plan_name}`) 
                 : `Tipped ${activity.to_name || 'Creator'}`}
             </h4>
             <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border ${
               isTip 
                 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                 : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
             }`}>
               {isTip ? 'Tip' : 'Subscription'}
             </span>
             {isReceived && !isTip && (
               <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20">
                 Paid Direct to Wallet
               </span>
             )}
          </div>
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            {new Date(activity.created_at).toLocaleDateString()}
            <span className="w-1 h-1 rounded-full bg-slate-800" />
            From: {activity.from_address?.slice(0, 10)}...
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-2xl font-black flex items-center gap-2 justify-end ${isReceived ? 'text-[#F7931A]' : 'text-slate-500'}`}>
          {isReceived ? '+' : '-'}{activity.amount} <MUSDLogo className="w-5 h-5" />
        </p>
        <a
          href={`https://explorer.test.mezo.org/tx/${activity.tx_hash}`}
          target="_blank"
          className="text-[8px] text-slate-700 hover:text-[#F7931A] uppercase tracking-[0.2em] mt-2 block font-black transition-colors"
        >
          Verify on Mezo
        </a>
      </div>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="h-72 bg-white/5 rounded-[3rem]" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="h-52 bg-white/5 rounded-[2rem]" />
        <div className="h-52 bg-white/5 rounded-[2rem]" />
        <div className="h-52 bg-white/5 rounded-[2rem]" />
        <div className="h-52 bg-white/5 rounded-[2rem]" />
      </div>
      <div className="space-y-4">
        <div className="h-24 bg-white/5 rounded-3xl" />
        <div className="h-24 bg-white/5 rounded-3xl" />
        <div className="h-24 bg-white/5 rounded-3xl" />
      </div>
    </div>
  );
}


function EditProfileModal({ profile, onClose, onSuccess }: { profile: any, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    bio: profile?.bio || '',
    category: profile?.category || 'Creative',
    username: profile?.username || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('creators')
        .update({
          name: formData.name,
          bio: formData.bio,
          category: formData.category,
          updated_at: new Date().toISOString(),
        })
        .eq('address', profile.address);

      if (error) throw error;
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card max-w-lg w-full p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#F7931A] to-transparent opacity-50" />
        
        <h3 className="text-3xl font-black text-white font-outfit uppercase tracking-tighter mb-8">Refine Your Identity</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Creator Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#F7931A]/50 transition-all"
              placeholder="Your Stage Name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Biography</label>
            <textarea 
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#F7931A]/50 transition-all h-32 resize-none"
              placeholder="Tell the world your story..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Category</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full bg-[#111] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#F7931A]/50 transition-all appearance-none"
            >
              <option value="Creative">Creative</option>
              <option value="Gaming">Gaming</option>
              <option value="Developer">Developer</option>
              <option value="Musician">Musician</option>
              <option value="Researcher">Researcher</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-[2] btn-primary py-4 text-sm flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function getFilteredActivities(tab: string, activities: any[]) {
  if (tab === 'activity') return activities;
  if (tab === 'earnings') return activities.filter(a => a.type === 'received');
  if (tab === 'tips') return activities.filter(a => a.type === 'sent');
  return [];
}
