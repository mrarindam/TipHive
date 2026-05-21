'use client';

import { useState, useEffect, useCallback, ReactNode, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useWalletAuth, type User } from '@/lib/wallet-auth-shim';
import {
  Globe, Users, Calendar, Edit3,
  Inbox, Menu, X, LayoutDashboard, Wallet, History, TrendingUp, Settings, Heart, Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { TIPPING_ABI, SUBSCRIPTION_ABI } from '@/lib/contracts';
import { useNetworkConfig } from '@/lib/hooks/useNetworkConfig';

export interface CreatorProfile {
  address: string;
  username: string;
  name: string;
  bio: string;
  avatar_url: string;
  category: string;
  link: string;
  total_earned: number;
  is_creator: boolean;
  social_links: Record<string, string | number | boolean | null>;
  button_text?: string;
  thank_you_message?: string;
  suggested_amounts?: string[];
  referral_code?: string;
}

export interface Activity {
  id: string;
  type: 'sent' | 'received';
  source: 'tip' | 'subscription';
  amount: number;
  to_name?: string;
  created_at: string;
  tx_hash?: string;
  from_address?: string;
  plan_name?: string;
}

export interface DashboardContextType {
  creatorProfile: CreatorProfile | null;
  activities: Activity[];
  loading: boolean;
  onChainBalanceFormatted: string;
  totalOnChainBalance: number;
  isAnyWithdrawing: boolean;
  handleWithdraw: () => void;
  fetchData: () => void;
  address: string | undefined;
  totalSent: number;
  totalEarned: number;
  linkWallet: () => void;
  walletSwitched: boolean;
  switchedToAddress: string | undefined;
  dismissWalletSwitch: () => void;
  handleSwitchAccount: () => void;
  user: User | null;
  authenticated: boolean;
  getAccessToken: () => Promise<string | null>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within a DashboardProvider');
  return context;
};

export default function DashboardLayoutWrapper({ children }: { children: ReactNode }) {
  return <DashboardLayoutInner>{children}</DashboardLayoutInner>;
}

function DashboardLayoutInner({ children }: { children: ReactNode }) {
  const { address } = useAccount();
  const { ready, authenticated, user, linkWallet, logout, getAccessToken } = useWalletAuth();
  const { contracts, chainId } = useNetworkConfig();
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalSent, setTotalSent] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [walletSwitched, setWalletSwitched] = useState(false);
  const [switchedToAddress, setSwitchedToAddress] = useState<string | undefined>(undefined);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Detect wallet mismatch: active wallet in wallet manager vs wallet linked to TipHive account
  // Only show banner if user has a wallet linked to their account AND it's different from the active one
  useEffect(() => {
    const linkedWallet = creatorProfile?.address?.toLowerCase();
    const activeWallet = address?.toLowerCase();

    if (!linkedWallet || !activeWallet) {
      // No linked wallet or no active wallet → no mismatch possible
      setWalletSwitched(false);
      setSwitchedToAddress(undefined);
      return;
    }

    if (activeWallet !== linkedWallet) {
      setWalletSwitched(true);
      setSwitchedToAddress(address);
    } else {
      // User switched back to their TipHive-linked wallet → dismiss banner
      setWalletSwitched(false);
      setSwitchedToAddress(undefined);
    }
  }, [address, creatorProfile?.address]);

  const dismissWalletSwitch = () => setWalletSwitched(false);

  const handleSwitchAccount = async () => {
    await logout();
  };

  // Contract Reads
  const { data: tipBalance, refetch: refetchTipBalance } = useReadContract({
    address: contracts.TIPPING,
    abi: TIPPING_ABI,
    functionName: 'getCreatorBalance',
    args: [address as `0x${string}`],
    query: { enabled: Boolean(address && contracts.TIPPING !== '0x0000000000000000000000000000000000000000') },
  });

  const { data: subEarnings, refetch: refetchSubEarnings } = useReadContract({
    address: contracts.SUBSCRIPTION,
    abi: SUBSCRIPTION_ABI,
    functionName: 'getCreatorEarnings',
    args: [address as `0x${string}`],
    query: { enabled: Boolean(address && contracts.SUBSCRIPTION !== '0x0000000000000000000000000000000000000000') },
  });

  const totalOnChainBalance = (tipBalance ? Number(tipBalance) : 0) + (subEarnings ? Number(subEarnings) : 0);
  const onChainBalanceFormatted = (totalOnChainBalance / 1e18).toFixed(2);

  const { writeContract: withdrawTips, data: tipHash } = useWriteContract();
  const { isLoading: isWithdrawingTips, isSuccess: tipWithdrawSuccess } = useWaitForTransactionReceipt({ hash: tipHash });

  const { writeContract: withdrawSub, data: subHash } = useWriteContract();
  const { isLoading: isWithdrawingSub, isSuccess: subWithdrawSuccess } = useWaitForTransactionReceipt({ hash: subHash });

  const isAnyWithdrawing = isWithdrawingTips || isWithdrawingSub;

  const fetchData = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    const userAddr = address ? address.toLowerCase() : null;
 
    try {
      const authResponse = await fetch(`/api/auth?wallet=${userAddr || ''}&t=${Date.now()}`);
      if (!authResponse.ok) {
        throw new Error(`Auth API failed with status ${authResponse.status}`);
      }
      const authData = await authResponse.json();
      const dbWallet = authData.user?.wallet_address?.toLowerCase();

      if (authData.isNewUser === true || authData.user?.is_creator !== true) {
        router.replace('/onboarding');
        return;
      }
      
      setCreatorProfile(authData.user ? {
        address: authData.user.wallet_address,
        username: authData.user.username,
        name: authData.user.display_name,
        bio: authData.user.creator_description || authData.user.bio,
        avatar_url: authData.user.avatar_url,
        category: authData.user.creator_category || '',
        link: authData.user.social_links?.website || '',
        total_earned: authData.user.total_earned || 0,
        is_creator: authData.user.is_creator,
        social_links: authData.user.social_links || {},
        button_text: authData.user.button_text,
        thank_you_message: authData.user.thank_you_message,
        suggested_amounts: authData.user.suggested_amounts,
        referral_code: authData.user.referral_code,
      } : null);

      const queryAddr = userAddr || dbWallet;

      let sentTips = null, receivedTips = null, receivedSubs = null, sentSubs = null;

      if (queryAddr) {
        const [stRes, rtRes, rsRes, ssRes] = await Promise.all([
          supabase.from('tips').select('*').eq('from_address', queryAddr).eq('chain_id', chainId),
          supabase.from('tips').select('*').eq('to_address', queryAddr).eq('chain_id', chainId),
          supabase.from('subscriptions').select('*, subscription_plans(name)').eq('creator_address', queryAddr).eq('chain_id', chainId),
          supabase.from('subscriptions').select('*, subscription_plans(name)').eq('fan_address', queryAddr).eq('chain_id', chainId)
        ]);
        
        sentTips = stRes.data; 
        receivedTips = rtRes.data; 
        receivedSubs = rsRes.data; 
        sentSubs = ssRes.data;
      }

      let totalSentVal = 0;
      if (sentTips) {
        totalSentVal += sentTips.reduce((sum, tip) => sum + (Number(tip.amount) || 0), 0);
      }
      if (sentSubs) {
        totalSentVal += sentSubs.reduce((sum, sub) => sum + (Number(sub.total_paid) || 0), 0);
      }
      setTotalSent(totalSentVal);

      let totalEarnedVal = 0;
      if (receivedTips) {
        totalEarnedVal += receivedTips.reduce((sum, tip) => sum + (Number(tip.amount) || 0), 0);
      }
      if (receivedSubs) {
        totalEarnedVal += receivedSubs.reduce((sum, sub) => sum + (Number(sub.total_paid) || 0), 0);
      }
      setTotalEarned(totalEarnedVal);

      const combined: Activity[] = [];
      const knownAddresses = Array.from(new Set([
        ...(sentTips || []).map((tip) => tip.to_address),
        ...(receivedTips || []).map((tip) => tip.from_address),
        ...(receivedSubs || []).map((sub) => sub.fan_address),
        ...(sentSubs || []).map((sub) => sub.creator_address),
      ].filter(Boolean).map((item) => item.toLowerCase())));

      const { data: knownProfiles } = knownAddresses.length
        ? await supabase.from('user_profiles').select('wallet_address, display_name, username').in('wallet_address', knownAddresses)
        : { data: [] };

      const profileByAddress = new Map((knownProfiles || []).map((item: { wallet_address: string; display_name: string; username: string }) => [
        item.wallet_address.toLowerCase(),
        item.username ? `${item.display_name} (@${item.username})` : item.display_name,
      ]));

      if (sentTips) sentTips.forEach(s => combined.push({ id: s.id, type: 'sent', source: 'tip', amount: s.amount, to_name: profileByAddress.get(s.to_address?.toLowerCase()) || s.to_address?.slice(0, 10) || 'Anonymous', created_at: s.created_at, tx_hash: s.tx_hash }));
      if (receivedTips) receivedTips.forEach(r => combined.push({ id: r.id, type: 'received', source: 'tip', amount: r.amount, from_address: r.from_address, to_name: profileByAddress.get(r.from_address?.toLowerCase()) || r.from_address?.slice(0, 10) || 'Anonymous', created_at: r.created_at, tx_hash: r.tx_hash }));
      if (receivedSubs) receivedSubs.forEach(sub => combined.push({ id: sub.id, type: 'received', source: 'subscription', amount: sub.total_paid, from_address: sub.fan_address, to_name: profileByAddress.get(sub.fan_address?.toLowerCase()) || sub.fan_address?.slice(0, 10) || 'Anonymous', created_at: sub.created_at, tx_hash: sub.tx_hash, plan_name: sub.subscription_plans?.name }));
      if (sentSubs) sentSubs.forEach(sub => combined.push({ id: sub.id, type: 'sent', source: 'subscription', amount: sub.total_paid, to_name: profileByAddress.get(sub.creator_address?.toLowerCase()) || sub.creator_address?.slice(0, 10) || 'Anonymous', created_at: sub.created_at, tx_hash: sub.tx_hash, plan_name: sub.subscription_plans?.name }));

      setActivities(combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [address, chainId, router]);

  useEffect(() => {
    if (ready && authenticated) fetchData();
  }, [address, authenticated, ready, fetchData]);

  useEffect(() => {
    if (tipWithdrawSuccess || subWithdrawSuccess) {
      refetchTipBalance();
      refetchSubEarnings();
      fetchData();
    }
  }, [tipWithdrawSuccess, subWithdrawSuccess, fetchData, refetchTipBalance, refetchSubEarnings]);

  const handleWithdraw = async () => {
    if (totalOnChainBalance <= 0) return alert('No funds available for withdrawal.');
    if (tipBalance && Number(tipBalance) > 0) {
      withdrawTips({ address: contracts.TIPPING, abi: TIPPING_ABI, functionName: 'withdraw', args: [BigInt(tipBalance.toString())] });
    }
    if (subEarnings && Number(subEarnings) > 0) {
      withdrawSub({ address: contracts.SUBSCRIPTION, abi: SUBSCRIPTION_ABI, functionName: 'withdrawEarnings', args: [BigInt(subEarnings.toString())] });
    }
  };

  if (!ready) {
    return <div className="min-h-screen bg-black" />;
  }

  if (!authenticated) {
    return (
      <div className="w-full min-h-screen bg-[#000] flex flex-col items-center justify-center px-4 text-center">
        <div className="mb-8 h-24 w-24 flex items-center justify-center rounded-[2rem] border border-white/5 bg-[#0f0f14] shadow-2xl">
          <Wallet className="h-10 w-10 text-[#f7931a]" />
        </div>
        <h2 className="text-5xl font-black text-white mb-4 uppercase tracking-tighter">Gateway Locked</h2>
        <p className="text-slate-500 mb-12 max-w-md mx-auto">Please login to access your creator dashboard.</p>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col min-h-full pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,193,7,0.1)] transform hover:rotate-6 transition-transform overflow-hidden border border-white/5 bg-[#0f0f14]">
            <Image
              src="/logo.png"
              alt="TipHive Logo"
              width={56}
              height={56}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          <span className="text-2xl font-black text-white tracking-tighter uppercase leading-none">TipHive</span>
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-1 mb-8">
        <SidebarItem icon={<LayoutDashboard size={20} />} label="Hive" active={pathname === '/dashboard'} href="/dashboard" onClick={() => setIsSidebarOpen(false)} />
        <SidebarItem icon={<Gift size={20} />} label="Referrals" active={pathname === '/dashboard/referrals'} href="/dashboard/referrals" onClick={() => setIsSidebarOpen(false)} />
        <SidebarItem icon={<Globe />} label="My Page" href={`/${creatorProfile?.username || ''}`} external onClick={() => setIsSidebarOpen(false)} />
      </div>
      <div className="mb-8">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-4 mb-3">Earn</div>
        <div className="space-y-1">
          <SidebarItem icon={<Users />} label="Tip Circles" active={pathname === '/dashboard/tipcircle'} href="/dashboard/tipcircle" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem icon={<Calendar size={20} />} label="Subscriptions" active={pathname === '/dashboard/subscriptions'} href="/dashboard/subscriptions" onClick={() => setIsSidebarOpen(false)} />
        </div>
      </div>
      <div className="mb-8">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-4 mb-3">Content</div>
        <div className="space-y-1">
          <SidebarItem icon={<Edit3 />} label="Posting" active={pathname === '/dashboard/posts'} href="/dashboard/posts" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem icon={<Inbox />} label="Inbox" active={pathname === '/dashboard/inbox'} href="/dashboard/inbox" onClick={() => setIsSidebarOpen(false)} />
        </div>
      </div>
      <div className="mb-8">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-4 mb-3">Activity & Logs</div>
        <div className="space-y-1">
          <SidebarItem icon={<History />} label="Activity Feed" active={pathname === '/dashboard/activityfeed'} href="/dashboard/activityfeed" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem icon={<TrendingUp />} label="Analytics" active={pathname === '/dashboard/earninganalysis'} href="/dashboard/earninganalysis" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem icon={<Heart size={18} />} label="Sent Support" active={pathname === '/dashboard/sentsupport'} href="/dashboard/sentsupport" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem icon={<Calendar size={18} />} label="My Subscriptions" active={pathname === '/dashboard/mysubsriptions'} href="/dashboard/mysubsriptions" onClick={() => setIsSidebarOpen(false)} />
        </div>
      </div>

      <div className="mt-auto pt-8 border-t border-white/5">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-4 mb-3">Settings</div>
        <div className="space-y-1">
          <SidebarItem icon={<Settings size={18} />} label="Visual Toolkit" active={pathname === '/dashboard/visual-toolkit'} href="/dashboard/visual-toolkit" onClick={() => setIsSidebarOpen(false)} />
        </div>
      </div>
    </div>
  );

  const isCreatePost = pathname?.includes('/dashboard/createposts');

  if (isCreatePost) {
    return (
      <DashboardContext.Provider value={{ creatorProfile, activities, loading, onChainBalanceFormatted, totalOnChainBalance, isAnyWithdrawing, handleWithdraw, fetchData, address, totalSent, totalEarned, linkWallet, walletSwitched, switchedToAddress, dismissWalletSwitch, handleSwitchAccount, user, authenticated, getAccessToken }}>
        {children}
      </DashboardContext.Provider>
    );
  }

  return (
    <DashboardContext.Provider value={{ creatorProfile, activities, loading, onChainBalanceFormatted, totalOnChainBalance, isAnyWithdrawing, handleWithdraw, fetchData, address, totalSent, totalEarned, linkWallet, walletSwitched, switchedToAddress, dismissWalletSwitch, handleSwitchAccount, user, authenticated, getAccessToken }}>
      <div className="min-h-screen bg-[#000] flex">
        {/* Redesigned Hanging Menu Trigger */}
        <motion.div
          className="fixed md:top-20 md:left-12 top-24 left-0 z-[60] flex flex-col items-center pointer-events-none"
          initial={isMobile ? { rotate: 0 } : { rotate: -4 }}
          animate={isMobile ? { rotate: 0 } : { rotate: 4 }}
          transition={{
            repeat: isMobile ? 0 : Infinity,
            repeatType: "mirror",
            duration: 2.5,
            ease: "easeInOut"
          }}
          style={{ transformOrigin: "top center" }}
        >
          {/* The Rope (Hanging Thread) */}
          <div className="hidden md:block w-[2px] h-32 bg-gradient-to-b from-[#F7931A] via-white/60 to-[#F7931A] shadow-[0_0_12px_rgba(247,147,26,0.3)]" />

          {/* The Circular Hanging Button */}
          <motion.button
            onClick={() => setIsSidebarOpen(true)}
            whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
            whileTap={{ scale: 0.9 }}
            className="md:w-16 md:h-16 w-12 h-12 bg-[#0f0f14] border-2 border-[#F7931A] md:rounded-full rounded-r-2xl rounded-l-none flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(247,147,26,0.2)] text-[#F7931A] hover:text-white hover:bg-[#F7931A] transition-all pointer-events-auto group relative -mt-1"
            title="Open Dashboard Menu"
          >
            <Menu className="md:w-8 md:h-8 w-6 h-6 transition-transform" />

            {/* Decorative Hanging Ring/Hook */}
            <div className="hidden md:block absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 border-2 border-[#F7931A] rounded-full bg-[#0f0f14]" />

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-[#F7931A]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        </motion.div>

        {/* Sidebar Overlay & Blur Effect */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-xl"
              onClick={() => setIsSidebarOpen(false)}
            >
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                className="w-80 h-full bg-[#050507] border-r border-white/5 p-10 overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                {SidebarContent()}
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content with dynamic blur */}
        <main className={`flex-1 min-h-screen pt-28 pb-12 w-full transition-all duration-500 ${isSidebarOpen ? 'blur-md scale-[0.98]' : 'blur-0 scale-100'}`}>
          <div className="max-w-[1700px] w-full mx-auto px-6 md:px-16">
            {children}
          </div>
        </main>
      </div>
    </DashboardContext.Provider>
  );
}

function SidebarItem({ icon, label, active, href, external, onClick, disabled }: { icon: ReactNode, label: string, active?: boolean, href?: string, external?: boolean, onClick?: () => void, disabled?: boolean }) {
  const content = (
    <>
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-[#f7931a] rounded-r-full shadow-[0_0_20px_#f7931a]" />}
      <div className={`w-6 h-6 transition-colors ${active ? 'text-[#f7931a]' : 'text-slate-500 group-hover:text-slate-300'}`}>
        {icon}
      </div>
      <span className={`text-base font-black tracking-tight whitespace-nowrap transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
        {label}
      </span>
      {active && <div className="absolute inset-0 bg-gradient-to-r from-[#f7931a]/10 to-transparent rounded-2xl pointer-events-none" />}
    </>
  );

  const className = `group relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${active ? 'bg-white/5' : 'hover:bg-white/[0.03]'} ${disabled ? 'blur-[1.5px] opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}`;

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={className} target={external ? "_blank" : undefined}>
        {content}
      </Link>
    );
  }
  return <div className={className} onClick={onClick}>{content}</div>;
}
