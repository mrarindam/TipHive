'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Wallet, History, TrendingUp, DollarSign, Edit2, Copy, Check, Loader2, ChevronRight, User, Plus, Upload, CheckCircle2, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import ShareModal from '@/components/ui/ShareModal';
import MUSDLogo from '@/components/ui/MUSDLogo';

const TIPPING_ABI = [
  {
    "name": "getCreatorBalance",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{ "name": "_creator", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }]
  }
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TIPPING_CONTRACT || '0x0000000000000000000000000000000000000000';

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
  amount: number;
  from_address?: string;
  to_address?: string;
  to_name?: string;
  created_at: string;
  tx_hash: string;
}

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'activity' | 'earnings' | 'tips'>('activity');
  const [creatorProfile, setCreatorProfile] = useState<Creator | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Stats
  const [totalTippedByMe, setTotalTippedByMe] = useState(0);

  // Contract Read
  const { data: contractBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TIPPING_ABI,
    functionName: 'getCreatorBalance',
    args: [address as `0x${string}`],
  });

  const { writeContract, data: withdrawHash } = useWriteContract();
  const { isLoading: isWithdrawing, isSuccess: withdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawHash });

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

    // 2. Fetch Sent Tips (for "My Tips" and Stats)
    const { data: sent } = await supabase
      .from('tips')
      .select('*, creators!tips_to_address_fkey(name)')
      .eq('from_address', userAddr)
      .order('created_at', { ascending: false });

    // 3. Fetch Received Tips (for "Earnings")
    const { data: received } = await supabase
      .from('tips')
      .select('*')
      .eq('to_address', userAddr)
      .order('created_at', { ascending: false });

    // Combine for Activity Overview
    const combined: Activity[] = [];
    if (sent) {
      sent.forEach(s => combined.push({
        id: s.id,
        type: 'sent',
        amount: s.amount,
        to_address: s.to_address,
        to_name: s.creators?.name,
        created_at: s.created_at,
        tx_hash: s.tx_hash
      }));
      setTotalTippedByMe(sent.reduce((acc, curr) => acc + curr.amount, 0));
    }
    if (received) {
      received.forEach(r => combined.push({
        id: r.id,
        type: 'received',
        amount: r.amount,
        from_address: r.from_address,
        created_at: r.created_at,
        tx_hash: r.tx_hash
      }));
    }

    setActivities(combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    setLoading(false);
  }, [address]);

  useEffect(() => {
    if (isConnected && address) {
      setTimeout(() => fetchData(), 0);
    }
  }, [address, isConnected, fetchData]);

  useEffect(() => {
    if (withdrawSuccess) {
      setTimeout(() => {
        refetchBalance();
        fetchData();
      }, 0);
    }
  }, [withdrawSuccess, fetchData, refetchBalance]);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = () => {
    if (!contractBalance || Number(contractBalance) === 0) return;
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: [
        {
          "name": "withdraw",
          "type": "function",
          "stateMutability": "nonpayable",
          "inputs": [{ "name": "_amount", "type": "uint256" }],
          "outputs": []
        }
      ],
      functionName: 'withdraw',
      args: [BigInt(contractBalance?.toString() || '0')],
    });
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto py-32 text-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Wallet className="w-20 h-20 text-slate-800 mx-auto mb-8" />
          <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">Connect Wallet</h2>
          <p className="text-slate-500 text-lg mb-12">Connect your wallet to manage your profile and view earnings.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-8">
          {/* Header Profile Section */}
          <div className="glass-card p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#F7931A]/5 blur-[120px] rounded-full -mr-48 -mt-48" />

            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
              <div className="relative group">
                <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-white/5 bg-[#1a1a1a] shadow-2xl">
                  {creatorProfile?.avatar_url ? (
                    <Image 
                      src={creatorProfile.avatar_url} 
                      width={160}
                      height={160}
                      className="w-full h-full object-cover" 
                      alt="Profile" 
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                      <User className="w-16 h-16 text-slate-600" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left pt-2">
                <div className="flex flex-col mb-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter font-outfit">
                      {creatorProfile?.name || 'Anonymous Fan'}
                    </h1>
                    <button
                      onClick={copyAddress}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-slate-400 hover:text-white hover:bg-white/10 transition-all self-center md:self-auto"
                    >
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  {creatorProfile?.username && (
                    <div className="flex justify-center md:justify-start">
                      <span className="text-sm font-bold text-[#F7931A] px-3 py-1 bg-[#F7931A]/10 rounded-full border border-[#F7931A]/20">
                        @{creatorProfile.username}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-slate-400 text-lg mb-8 max-w-2xl font-medium">
                  {creatorProfile?.bio || "You haven&apos;t added a bio yet. Become a creator to share your story!"}
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  {creatorProfile ? (
                    <>
                      <button
                        onClick={handleWithdraw}
                        disabled={isWithdrawing || !contractBalance || Number(contractBalance) === 0}
                        className="btn-secondary px-8 py-3 flex items-center gap-2"
                      >
                        {isWithdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                        {!contractBalance || Number(contractBalance) === 0 ? 'Nothing to withdraw' : 'Withdraw Earnings'}
                      </button>
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="btn-primary px-8 py-3 flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </button>
                      <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="btn-secondary px-8 py-3 flex items-center gap-2"
                      >
                        <Share2 className="w-4 h-4 text-[#F7931A]" />
                        Share Profile
                      </button>
                    </>
                  ) : (
                    <Link href="/register" className="btn-primary px-10 py-4 flex items-center gap-2 text-lg">
                      <Plus className="w-5 h-5" />
                      Become a Creator
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Total Earned"
              value={`${creatorProfile?.total_earned || 0} MUSD`}
              icon={<DollarSign className="w-6 h-6" />}
              color="text-[#F7931A]"
            />
            <StatCard
              label="On-Chain Balance"
              value={`${contractBalance ? (Number(contractBalance) / 1e18).toFixed(1) : '0.0'} MUSD`}
              icon={<TrendingUp className="w-6 h-6" />}
              color="text-green-500"
            />
            <StatCard
              label="Total Tipped By You"
              value={`${totalTippedByMe} MUSD`}
              icon={<History className="w-6 h-6" />}
              color="text-blue-500"
            />
          </div>

          {/* Activity Tabs */}
          <div className="space-y-6 pt-8">
            <div className="flex items-center gap-8 border-b border-white/5 pb-1 overflow-x-auto">
              <TabButton
                label="Activity Overview"
                active={activeTab === 'activity'}
                onClick={() => setActiveTab('activity')}
              />
              {creatorProfile && (
                <TabButton
                  label={`Earnings (${activities.filter(a => a.type === 'received').length})`}
                  active={activeTab === 'earnings'}
                  onClick={() => setActiveTab('earnings')}
                />
              )}
              <TabButton
                label={`My Tips (${activities.filter(a => a.type === 'sent').length})`}
                active={activeTab === 'tips'}
                onClick={() => setActiveTab('tips')}
              />
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  {getFilteredActivities(activeTab, activities).length > 0 ? (
                    getFilteredActivities(activeTab, activities).map(activity => (
                      <ActivityRow key={activity.id} activity={activity} />
                    ))
                  ) : (
                    <div className="py-20 text-center glass-card">
                      <History className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">No recent activity found.</p>
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
          title={`👋 Check out my profile on TipHive! If you enjoy my work, \n\nyou can now support me by tipping via MUSD on the Mezo Network. Every bit helps! 🚀💎`}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="glass-card p-8 group hover:border-white/20 transition-all">
      <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${color}`}>
        {icon}
      </div>
      <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{label}</p>
      <p className="text-3xl font-black text-white tracking-tighter flex items-center gap-2">
        {value.replace(' MUSD', '')} <MUSDLogo className="w-6 h-6" />
      </p>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`pb-4 px-1 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${active ? 'text-[#F7931A]' : 'text-slate-500 hover:text-slate-300'}`}
    >
      {label}
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-1 bg-[#F7931A] rounded-full"
        />
      )}
    </button>
  );
}

function ActivityRow({ activity }: { activity: Activity }) {
  const isReceived = activity.type === 'received';
  const isWithdrawn = activity.type === 'withdrawn';

  return (
    <div className="glass-card p-6 flex items-center justify-between group hover:bg-white/5 transition-all">
      <div className="flex items-center gap-6">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isReceived ? 'bg-green-500/10 text-green-500' :
          isWithdrawn ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'
          }`}>
          {isReceived ? <TrendingUp className="w-5 h-5" /> :
            isWithdrawn ? <DollarSign className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>
        <div>
          <h4 className="text-white font-bold text-lg">
            {isReceived ? `Received tip from ${activity.from_address?.slice(0, 8)}...` :
              isWithdrawn ? 'Withdrew from Smart Contract' : `Sent tip to ${activity.to_name || 'Creator'}`}
          </h4>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">
            {new Date(activity.created_at).toLocaleString()}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-xl font-black flex items-center gap-1 justify-end ${isReceived ? 'text-green-500' : 'text-slate-400'}`}>
          {isReceived ? '+' : '-'}{activity.amount} <MUSDLogo className="w-5 h-5" />
        </p>
        <a
          href={`https://testnet.mezoscan.io/tx/${activity.tx_hash}`}
          target="_blank"
          className="text-[10px] text-slate-600 hover:text-[#F7931A] uppercase tracking-widest mt-2 block font-black"
        >
          View Transaction
        </a>
      </div>
    </div>
  );
}

function EditProfileModal({ profile, onClose, onSuccess }: { profile: Creator | null, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(profile?.avatar_url || '');
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    name: profile?.name || '',
    bio: profile?.bio || '',
    link: profile?.link || '',
    category: profile?.category || 'Developer'
  });

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const checkUsername = async (username: string) => {
    if (!username || username === profile?.username) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    const { data } = await supabase
      .from('creators')
      .select('username')
      .eq('username', username.toLowerCase())
      .single();
    
    setUsernameStatus(data ? 'taken' : 'available');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (usernameStatus === 'taken') return alert('Username is already taken');
    setLoading(true);

    try {
      let avatarUrl = profile.avatar_url;

      // Upload new avatar if selected
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${profile.address}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('tipmusd')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('tipmusd')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      const { error } = await supabase
        .from('creators')
        .update({
          username: formData.username.toLowerCase(),
          name: formData.name,
          bio: formData.bio,
          link: formData.link,
          category: formData.category,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('address', profile.address);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-xl p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4">
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>

        <h2 className="text-3xl font-black text-white mb-8 font-outfit uppercase tracking-tighter">Edit <span className="text-[#F7931A]">Profile</span></h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/10 bg-[#1a1a1a]">
                {previewUrl ? (
                  <Image 
                    src={previewUrl} 
                    width={96}
                    height={96}
                    className="w-full h-full object-cover" 
                    alt="Preview" 
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <User className="w-8 h-8 text-slate-600" />
                  </div>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                <Upload className="w-6 h-6 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
            <div>
              <p className="text-white font-bold">Profile Picture</p>
              <p className="text-xs text-slate-500 mt-1">Click image to change. Max size 5MB.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Username</label>
            <div className="relative">
              <input 
                required
                type="text" 
                placeholder="e.g. satochinakamoto"
                className={`w-full bg-white/5 border ${
                  usernameStatus === 'taken' ? 'border-red-500' : 
                  usernameStatus === 'available' ? 'border-green-500' : 'border-white/10'
                } rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none transition-all`}
                value={formData.username}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                  setFormData({ ...formData, username: val });
                  checkUsername(val);
                }}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {usernameStatus === 'available' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {usernameStatus === 'taken' && <span className="text-[10px] text-red-500 font-bold uppercase">Taken</span>}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Your profile link: http://localhost:3000/profile/{formData.username || 'username'}</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Display Name</label>
            <input
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Bio</label>
            <textarea
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none resize-none"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Category</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Developer" className="bg-[#1a1a1a]">Developer</option>
                <option value="Artist" className="bg-[#1a1a1a]">Artist</option>
                <option value="Writer" className="bg-[#1a1a1a]">Writer</option>
                <option value="Musician" className="bg-[#1a1a1a]">Musician</option>
                <option value="Content Creator" className="bg-[#1a1a1a]">Content Creator</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Social Link</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-64 bg-white/5 rounded-3xl" />
      <div className="grid grid-cols-3 gap-6">
        <div className="h-40 bg-white/5 rounded-3xl" />
        <div className="h-40 bg-white/5 rounded-3xl" />
        <div className="h-40 bg-white/5 rounded-3xl" />
      </div>
      <div className="space-y-4">
        <div className="h-20 bg-white/5 rounded-2xl" />
        <div className="h-20 bg-white/5 rounded-2xl" />
        <div className="h-20 bg-white/5 rounded-2xl" />
      </div>
    </div>
  );
}

function getFilteredActivities(tab: string, activities: Activity[]) {
  if (tab === 'activity') return activities;
  if (tab === 'earnings') return activities.filter(a => a.type === 'received');
  if (tab === 'tips') return activities.filter(a => a.type === 'sent');
  return [];
}
