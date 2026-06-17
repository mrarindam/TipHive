'use client';

import { useState, useEffect, useCallback, ReactNode, createContext, useContext } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useWalletAuth, type User } from '@/lib/wallet-auth-shim';
import {
  Wallet,
  User as UserIcon,
  DollarSign,
  TrendingUp,
  History,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { TIPPING_ABI, SUBSCRIPTION_ABI } from '@/lib/contracts';
import { useNetworkConfig } from '@/lib/hooks/useNetworkConfig';
import { motion } from 'framer-motion';
import MUSDLogo from '@/components/ui/MUSDLogo';

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
  source: 'tip' | 'subscription' | 'borrow';
  amount: number;
  to_name?: string;
  created_at: string;
  tx_hash?: string;
  from_address?: string;
  plan_name?: string;
  event_type?: 'borrow' | 'repay' | 'close';
  btc_amount?: number;
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
  const { ready, authenticated, user, linkWallet, logout, getAccessToken, login } = useWalletAuth();
  const { contracts, chainId } = useNetworkConfig();
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalSent, setTotalSent] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [walletSwitched, setWalletSwitched] = useState(false);
  const [switchedToAddress, setSwitchedToAddress] = useState<string | undefined>(undefined);

  // Detect wallet mismatch: active wallet vs linked wallet
  useEffect(() => {
    const linkedWallet = creatorProfile?.address?.toLowerCase();
    const activeWallet = address?.toLowerCase();

    if (!linkedWallet || !activeWallet) {
      setWalletSwitched(false);
      setSwitchedToAddress(undefined);
      return;
    }

    if (activeWallet !== linkedWallet) {
      setWalletSwitched(true);
      setSwitchedToAddress(address);
    } else {
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

      if (queryAddr) {
        try {
          const activityRes = await fetch(
            `/api/dashboard/activity?wallet=${encodeURIComponent(queryAddr)}&chainId=${chainId}`,
          );
          if (activityRes.ok) {
            const { activities: activityList, totalSent: ts, totalEarned: te } = await activityRes.json();
            setActivities(activityList || []);
            setTotalSent(ts || 0);
            setTotalEarned(te || 0);
          } else {
            setActivities([]);
            setTotalSent(0);
            setTotalEarned(0);
          }
        } catch (activityErr) {
          console.error('[dashboard] activity fetch failed:', activityErr);
          setActivities([]);
          setTotalSent(0);
          setTotalEarned(0);
        }
      }
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
    return <div className="min-h-screen bg-slate-50 dark:bg-black" />;
  }

  const isCreatePost = pathname?.includes('/dashboard/createposts');

  return (
    <DashboardContext.Provider value={{ creatorProfile, activities, loading, onChainBalanceFormatted, totalOnChainBalance, isAnyWithdrawing, handleWithdraw, fetchData, address, totalSent, totalEarned, linkWallet, walletSwitched, switchedToAddress, dismissWalletSwitch, handleSwitchAccount, user, authenticated, getAccessToken }}>
      {isCreatePost && authenticated ? (
        children
      ) : (
        <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-300 flex">
          {/* Main Content Area */}
          <main className="flex-1 min-h-screen pt-28 pb-12 w-full">
            <div className="max-w-[1700px] w-full mx-auto px-6 md:px-16">
              {!authenticated ? (
                <DashboardPreview login={login} />
              ) : (
                children
              )}
            </div>
          </main>
        </div>
      )}
    </DashboardContext.Provider>
  );
}

function DashboardPreview({ login }: { login: () => void }) {
  return (
    <div className="space-y-8 pb-12">
      {/* PAGE HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 md:px-0 space-y-2"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-[#f7931a] uppercase tracking-wider">
          <span>Creator Suite (Preview)</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          My <span className="text-[#f7931a]">Hive</span>
        </h1>
        <p className="text-slate-550 dark:text-slate-400 text-base max-w-2xl font-medium leading-relaxed">
          Welcome to your creator control center. Connect your wallet to access your earnings, vault, subscribers, and tipping page settings.
        </p>
      </motion.div>

      {/* MOCK CREATOR HEADER */}
      <div className="bg-white/80 dark:bg-[#0f0f14]/80 border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between relative overflow-hidden shadow-md dark:shadow-2xl backdrop-blur-md transition-colors duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f7931a]/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="flex items-center gap-6 relative z-10 filter blur-[1px] opacity-65">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black shrink-0 flex items-center justify-center transition-colors duration-300">
            <UserIcon className="w-10 h-10 text-slate-400 dark:text-slate-700" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Creator Name</h2>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-bold text-[#f7931a]">@username</span>
              <span className="text-slate-300 dark:text-slate-800">•</span>
              <span className="text-slate-550 dark:text-slate-400 font-mono">0x000...0000</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 relative z-20 shrink-0">
          <button
            onClick={login}
            className="flex items-center justify-center gap-2 bg-[#f7931a] text-white px-6 py-3 rounded-xl font-bold transition-all hover:bg-[#e08215] shadow-md hover:scale-102 cursor-pointer"
          >
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </button>
        </div>
      </div>

      {/* GLOWING WALLET CONNECTION CTA PROMPT */}
      <div className="relative border border-slate-200 dark:border-white/5 rounded-[2.5rem] bg-white dark:bg-[#0c0c10]/95 p-8 md:p-12 overflow-hidden shadow-md dark:shadow-2xl flex flex-col items-center text-center max-w-3xl mx-auto border-t-[#f7931a]/20 transition-colors duration-300">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-[#f7931a]/40 to-transparent" />
        <div className="absolute -top-32 w-96 h-96 bg-[#f7931a]/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 flex items-center justify-center mb-8 shadow-inner relative transition-colors duration-300">
          <div className="absolute inset-0 bg-[#f7931a]/10 rounded-3xl animate-ping opacity-75" style={{ animationDuration: '2s' }} />
          <Wallet className="w-8 h-8 text-[#f7931a] relative z-10" />
        </div>

        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
          Unlock Your Creator Suite
        </h3>
        <p className="text-slate-650 dark:text-slate-400 font-medium max-w-lg mb-10 leading-relaxed text-sm md:text-base">
          Sign in with your Ethereum or Bitcoin-L2 wallet to view your real-time analytics, edit your tipping page, manage subscribers, write posts, and claim support tips.
        </p>

        <button
          onClick={login}
          className="px-10 py-4 bg-[#f7931a] text-white rounded-2xl font-bold uppercase tracking-wider text-sm transition-all hover:bg-[#e08215] hover:shadow-[0_0_40px_rgba(247,147,26,0.3)] active:scale-95 cursor-pointer"
        >
          Connect & Sign In
        </button>
      </div>

      {/* BLURRED MOCK EARNINGS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative select-none">
        {/* Overlay blur barrier */}
        <div className="absolute inset-0 bg-white/20 dark:bg-black/10 backdrop-blur-[3px] rounded-3xl z-10 border border-slate-200 dark:border-white/5 flex items-center justify-center pointer-events-none" />

        <div className="bg-white/50 dark:bg-[#0f0f14]/40 border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 relative overflow-hidden transition-colors duration-300">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-8 text-orange-500/50">
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500/50 mb-4">Total Earnings</p>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-950/50 dark:text-white/50">$1,420.00</h3>
            <MUSDLogo className="w-8 h-8 opacity-30" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400/50 dark:text-slate-700">Tips + Subscriptions</p>
        </div>

        <div className="bg-white/50 dark:bg-[#0f0f14]/40 border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 relative overflow-hidden transition-colors duration-300">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-8 text-green-500/50">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500/50 mb-4">Claimable Funds</p>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-950/50 dark:text-white/50">$420.00</h3>
            <MUSDLogo className="w-8 h-8 opacity-30" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400/50 dark:text-slate-700">Ready for Withdrawal</p>
        </div>

        <div className="bg-white/50 dark:bg-[#0f0f14]/40 border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 relative overflow-hidden transition-colors duration-300">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-8 text-blue-400/50">
            <History className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500/50 mb-4">Sent By You</p>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-950/50 dark:text-white/50">$150.00</h3>
            <MUSDLogo className="w-8 h-8 opacity-30" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400/50 dark:text-slate-700">Your Contributions</p>
        </div>
      </div>
    </div>
  );
}

