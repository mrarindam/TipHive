'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePrivy, useLogin } from '@privy-io/react-auth';
import { useAccount, useReadContract, useSwitchChain } from 'wagmi';
import { formatEther } from 'viem';
import {
  BadgeCheck,
  Bitcoin,
  ChevronLeft,
  ExternalLink,
  LogOut,
  Mail,
  Settings,
  ShieldCheck,
  User,
  UserPen,
  Wallet,
  Globe,
  Info,
} from 'lucide-react';
import { BTC_TOKEN_ADDRESS, ERC20_ABI } from '@/lib/contracts';
import MUSDLogo from '@/components/ui/MUSDLogo';
import { mezoTestnet, mezoMainnet } from '@/components/providers/PrivyProviderWrapper';
import { useNetworkConfig } from '@/lib/hooks/useNetworkConfig';

const ZERO = BigInt(0);

export interface WalletProfile {
  privy_did?: string;
  wallet_address: string | null;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_creator: boolean;
  total_earned?: number;
  creator_category?: string | null;
}

function shortAddress(address?: string) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}


export default function WalletProfileMenu() {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { ready, authenticated, logout, user, linkGoogle, linkEmail, linkWallet, getAccessToken } = usePrivy();
  const { login } = useLogin();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'main' | 'settings' | 'network'>('main');
  const [profile, setProfile] = useState<WalletProfile | null>(null);
  const [btcUsd, setBtcUsd] = useState(0);
  const networkConfig = useNetworkConfig();

  const queryTargetAddress = (address || profile?.wallet_address) as `0x${string}`;

  const { data: btcBalance } = useReadContract({
    address: BTC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [queryTargetAddress],
    query: { enabled: Boolean(queryTargetAddress && BTC_TOKEN_ADDRESS) },
  });

  const { data: musdBalance } = useReadContract({
    address: networkConfig.contracts.MUSD,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [queryTargetAddress],
    query: { enabled: Boolean(queryTargetAddress && networkConfig.contracts.MUSD) },
  });

  /*
  const { data: mezoBalance } = useReadContract({
    address: MEZO_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: Boolean(isConnected && address && MEZO_TOKEN_ADDRESS) },
  });
  */

  /*
  const { data: tipBalance } = useReadContract({
    address: TIPPING_CONTRACT,
    abi: TIPPING_ABI,
    functionName: 'getCreatorBalance',
    args: [address as `0x${string}`],
    query: { enabled: Boolean(isConnected && address && TIPPING_CONTRACT) },
  });
  */

  /*
  const { data: subBalance } = useReadContract({
    address: SUBSCRIPTION_CONTRACT,
    abi: SUBSCRIPTION_ABI,
    functionName: 'getCreatorEarnings',
    args: [address as `0x${string}`],
    query: { enabled: Boolean(isConnected && address && SUBSCRIPTION_CONTRACT) },
  });
  */

  useEffect(() => {
    let cancelled = false;

    if (!ready) return;

    const loadProfile = async () => {
      const activeAddress = address;
      const linkedAddress = user?.wallet?.address;
      const walletToQuery = activeAddress || linkedAddress || '';

      if (!user?.id && !walletToQuery) return;
      try {
        const token = await getAccessToken();
        const res = await fetch(`/api/auth?did=${user?.id || ''}&wallet=${walletToQuery}&t=${Date.now()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (cancelled || data.error) return;
        setProfile(data.user || null);
      } catch {
        // Silent fail
      }
    };

    loadProfile();

    const handleProfileUpdate = (event: Event) => {
      const detail = (event as CustomEvent<WalletProfile>).detail;
      const matchAddress = address && detail?.wallet_address && detail.wallet_address.toLowerCase() === address.toLowerCase();
      const matchDid = user?.id && detail?.privy_did && detail.privy_did === user.id;

      if (matchAddress || matchDid) {
        setProfile(detail);
      } else {
        loadProfile();
      }
    };

    window.addEventListener('wallet-profile-updated', handleProfileUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener('wallet-profile-updated', handleProfileUpdate);
    };
  }, [address, user?.id, user?.wallet?.address, ready, getAccessToken]);



  useEffect(() => {
    let cancelled = false;

    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setBtcUsd(Number(data?.bitcoin?.usd || 0));
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);

    const handleToggleEvent = () => setIsOpen((prev) => !prev);
    window.addEventListener('toggle-wallet-menu', handleToggleEvent);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('toggle-wallet-menu', handleToggleEvent);
    };
  }, []);

  /*
  const claimable = useMemo(() => {
    const tipValue = typeof tipBalance === 'bigint' ? tipBalance : ZERO;
    const subValue = typeof subBalance === 'bigint' ? subBalance : ZERO;
    return tipValue + subValue;
  }, [tipBalance, subBalance]);
  */

  const displayName = profile?.display_name || 'User profile';
  const username = profile?.username ? `@${profile.username}` : (address ? shortAddress(address) : 'user');
  const avatar = profile?.avatar_url || `https://api.dicebear.com/9.x/shapes/svg?seed=${address || user?.id}`;
  const btcAmount = Number(formatEther((typeof btcBalance === 'bigint' ? btcBalance : ZERO)));
  const musdAmount = Number(formatEther((typeof musdBalance === 'bigint' ? musdBalance : ZERO)));
  // const mezoAmount = Number(formatEther((typeof mezoBalance === 'bigint' ? mezoBalance : ZERO)));
  // const totalAssets = (btcAmount * btcUsd) + musdAmount + (mezoAmount * mezoUsd) + Number(formatEther(claimable));


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const googleAccount = user?.linkedAccounts?.find((a: any) => a.type === 'google_oauth') as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emailAccount = user?.linkedAccounts?.find((a: any) => a.type === 'email') as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const externalWalletAccount = user?.linkedAccounts?.find((a: any) => a.type === 'wallet' && a.walletClientType !== 'privy') as any;


  if (!ready) {
    return <div className="h-12 w-12 rounded-2xl bg-white/5 animate-pulse" />;
  }

  if (!authenticated) {
    return (
      <button
        onClick={login}
        className="btn-primary flex items-center gap-2 px-5 py-3"
        type="button"
      >
        <Wallet className="h-4 w-4" />
        Login
      </button>
    );
  }

  return (
    <div ref={menuRef} className="relative flex items-center gap-2">
      <button
        onClick={() => setIsOpen((value) => !value)}
        type="button"
        className="relative h-12 w-12 overflow-hidden rounded-2xl border border-[#F7931A]/50 bg-black shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 hover:shadow-orange-500/40"
        aria-label="Open wallet profile"
      >
        <img src={avatar} alt="" className="h-full w-full object-cover" />
        <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-black bg-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.9)]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed left-1/2 top-20 z-[120] w-[95vw] -translate-x-1/2 overflow-hidden rounded-b-[2rem] border border-white/5 bg-[#070707] text-white shadow-2xl shadow-black/60 backdrop-blur-3xl md:absolute md:left-auto md:right-0 md:top-16 md:w-[430px] md:translate-x-0 md:rounded-[2rem]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(247,147,26,0.28),transparent_32%),radial-gradient(circle_at_95%_8%,rgba(34,211,238,0.2),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(236,72,153,0.16),transparent_34%)]" />
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#F7931A] to-transparent" />
            <div className="relative overflow-hidden p-5">
              <AnimatePresence mode="wait">
                {view === 'main' ? (
                  <motion.div
                    key="main"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative flex items-center gap-4 pt-2">
                      <img src={avatar} alt="" className="h-14 w-14 rounded-2xl border-2 border-[#F7931A]/50 object-cover shadow-lg shadow-orange-500/25" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-2xl font-black tracking-tight text-white">
                            {displayName}
                          </h3>
                          <BadgeCheck className="h-5 w-5 shrink-0 fill-cyan-400 text-black" />
                        </div>
                        <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-[#F7931A]">{username}</p>
                      </div>
                    </div>

                    <div className="relative mt-6 space-y-2">
                      <Link
                        href="/editprofile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 w-full p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] transition-all border border-white/5 group"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
                          <UserPen className="h-5 w-5" />
                        </div>
                        <span className="font-black text-white">Edit Profile</span>
                      </Link>

                      <Link
                        href={profile?.username ? `/${profile.username}` : '#'}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 w-full p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] transition-all border border-white/5 group"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                          <User className="h-5 w-5" />
                        </div>
                        <span className="font-black text-white">My Page</span>
                      </Link>
                    </div>

                    {!address && !profile?.wallet_address ? (
                      <div className="relative mt-6 border-y border-white/5 bg-white/[0.03] -mx-5 px-5 py-5 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Wallet className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-lg font-black text-white uppercase tracking-tight">Connect Your Wallet</h3>
                        <p className="mb-4 text-xs text-slate-400 font-medium">
                          Link a Web3 wallet to unlock on-chain features like tipping and subscriptions.
                        </p>
                        <button
                          onClick={linkWallet}
                          className="w-full btn-primary py-3 px-4 flex items-center justify-center gap-2 group text-sm"
                        >
                          <Wallet className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          Link External Wallet
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Show saved but disconnected wallet state */}
                        {!address && profile?.wallet_address && (
                          <div className="relative mt-6 border border-[#F7931A]/30 bg-[#F7931A]/5 -mx-5 px-5 py-4 flex flex-col items-center gap-3">
                            <div className="flex items-center gap-3 w-full">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7931A]/10 text-[#F7931A]">
                                <ShieldCheck className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-white uppercase tracking-tight">Wallet Saved</p>
                                <p className="text-[10px] font-mono text-slate-400 truncate">{profile.wallet_address}</p>
                              </div>
                            </div>
                            <button
                              onClick={linkWallet}
                              className="w-full py-2 bg-[#F7931A] hover:bg-[#F7931A]/90 text-black text-[11px] font-black uppercase tracking-[0.1em] rounded-xl transition-all"
                            >
                              Connect to use
                            </button>
                          </div>
                        )}

                        {/* Network Warning if not on supported Mezo network */}
                        {isConnected && chain?.id !== mezoTestnet.id && chain?.id !== mezoMainnet.id && (
                          <div className="relative mt-6 border border-red-500/30 bg-red-500/5 -mx-5 px-5 py-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                                <ShieldCheck className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-white uppercase tracking-tight">Wrong Network</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Switch to Mezo</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setView('network')}
                              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.1em] rounded-lg border border-red-500/20 transition-all"
                            >
                              FIX NOW
                            </button>
                          </div>
                        )}
                        <div className="relative mt-6 grid grid-cols-2 gap-3">
                          <MenuAction
                            href="/mezo-toolkit"
                            icon={<img src="/mezo.png" alt="" className="h-4 w-4" />}
                            label="MEZO TOOLKIT"
                          />
                          <button
                            onClick={() => setView('network')}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-[#F7931A] hover:shadow-lg hover:shadow-orange-500/20"
                          >
                            <Globe className="h-4 w-4" />
                            NETWORK
                          </button>
                        </div>

                        <div className="relative mt-3 grid grid-cols-1">
                          <MenuAction
                            href={`${networkConfig.explorerUrl}/address/${address}`}
                            icon={<ExternalLink className="h-4 w-4" />}
                            label="View on Explorer"
                            external
                          />
                        </div>

                        <div className="relative mt-6 border-y border-white/5 bg-white/[0.03] -mx-5 px-5 py-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[#F7931A]">
                                <Wallet className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-black text-white">Connected Wallet</p>
                                <p className="font-mono text-sm text-slate-500">{shortAddress(address)}</p>
                              </div>
                            </div>
                            <ShieldCheck className="h-5 w-5 text-lime-500" />
                          </div>
                        </div>

                        <div className="relative pt-4">
                          <AssetRow
                            icon={<Bitcoin className="h-5 w-5" />}
                            title="Bitcoin"
                            subtitle={`${btcAmount.toFixed(5)} BTC`}
                            value={`$${(btcAmount * btcUsd).toFixed(2)}`}
                            orange
                          />
                          <AssetRow
                            icon={<MUSDLogo className="h-5 w-5" />}
                            title="MUSD"
                            subtitle="Wallet balance"
                            value={`$${musdAmount.toFixed(2)}`}
                          />
                        </div>
                      </>
                    )}

                    <div className="relative flex items-center justify-between border-t border-white/5 bg-black/40 -mx-5 mt-4 px-5 py-4">
                      <button
                        onClick={() => setView('settings')}
                        className="flex items-center gap-2 rounded-xl px-2 py-1 text-sm font-black text-white hover:text-[#F7931A]"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </button>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          logout();
                        }}
                        type="button"
                        className="flex items-center gap-2 rounded-xl px-2 py-1 text-sm font-black text-white hover:text-red-500"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                ) : view === 'settings' ? (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-[400px] flex flex-col pt-2"
                  >
                    <button
                      onClick={() => setView('main')}
                      className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 font-bold text-sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </button>

                    <div className="flex items-start gap-4 mb-8">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7931A]/10 text-[#F7931A] border border-[#F7931A]/20">
                        <Mail className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-white font-outfit uppercase tracking-tighter leading-none text-left">Account<br />Settings</h3>
                        <p className="text-slate-500 text-sm font-medium mt-2 text-left">Manage your linked accounts</p>
                      </div>
                    </div>

                    <div className="space-y-4 flex-1 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 pb-4 text-left">
                      {googleAccount ? (
                        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white flex items-center justify-center rounded-full p-1.5">
                              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-white">Google</p>
                              <p className="text-xs text-slate-400 truncate max-w-[150px]">{googleAccount.email || 'Connected'}</p>
                            </div>
                          </div>
                          <BadgeCheck className="w-5 h-5 text-green-500" />
                        </div>
                      ) : (
                        <button
                          onClick={linkGoogle}
                          className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors"
                        >
                          <div className="w-8 h-8 bg-white flex items-center justify-center rounded-full p-1.5 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                          </div>
                          <span className="text-sm font-bold text-white">Link Google Account</span>
                        </button>
                      )}

                      {emailAccount ? (
                        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl mt-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#F7931A] flex items-center justify-center rounded-full">
                              <Mail className="w-4 h-4 text-black" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-white">Email</p>
                              <p className="text-xs text-slate-400 truncate max-w-[150px]">{emailAccount.address || 'Connected'}</p>
                            </div>
                          </div>
                          <BadgeCheck className="w-5 h-5 text-green-500" />
                        </div>
                      ) : (
                        <button
                          onClick={linkEmail}
                          className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors mt-2"
                        >
                          <div className="w-8 h-8 bg-[#F7931A]/20 flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(247,147,26,0.15)]">
                            <Mail className="w-4 h-4 text-[#F7931A]" />
                          </div>
                          <span className="text-sm font-bold text-white">Link Email Address</span>
                        </button>
                      )}

                      {externalWalletAccount ? (
                        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl mt-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500 flex items-center justify-center rounded-full">
                              <Wallet className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-white">External Wallet</p>
                              <p className="text-xs text-slate-400 truncate max-w-[150px]">{shortAddress(externalWalletAccount.address)}</p>
                            </div>
                          </div>
                          <BadgeCheck className="w-5 h-5 text-green-500" />
                        </div>
                      ) : (
                        <button
                          onClick={linkWallet}
                          className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors mt-2"
                        >
                          <div className="w-8 h-8 bg-blue-500/20 flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                            <Wallet className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="text-sm font-bold text-white">Link External Wallet</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="network"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-[400px] flex flex-col pt-2"
                  >
                    <button
                      onClick={() => setView('main')}
                      className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 font-bold text-sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </button>

                    <div className="flex items-start gap-4 mb-8">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7931A]/10 text-[#F7931A] border border-[#F7931A]/20">
                        <Globe className="h-7 w-7" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-3xl font-black text-white font-outfit uppercase tracking-tighter leading-none">Switch<br />Network</h3>
                        <p className="text-slate-500 text-sm font-medium mt-2">Select your Mezo destination</p>
                      </div>
                    </div>

                    <div className="space-y-3 flex-1">
                      <NetworkOption
                        name="Mezo Testnet"
                        description="Test your transactions on Mezo"
                        icon={<img src="/mezo.png" alt="" className="h-5 w-5" />}
                        isActive={chain?.id === mezoTestnet.id}
                        onClick={() => {
                          switchChain?.({ chainId: mezoTestnet.id });
                          setView('main');
                        }}
                      />
                      <NetworkOption
                        name="Mezo Mainnet"
                        description="Real transactions on Mezo"
                        icon={<img src="/mezo.png" alt="" className="h-5 w-5" />}
                        isActive={chain?.id === mezoMainnet.id}
                        onClick={() => {
                          switchChain?.({ chainId: mezoMainnet.id });
                          setView('main');
                        }}
                      />
                    </div>

                    <div className="mt-8 bg-[#F7931A]/5 border border-[#F7931A]/10 rounded-2xl p-4 flex gap-3 items-center">
                      <Info className="w-4 h-4 text-[#F7931A] shrink-0" />
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed text-left">
                        Rabby or Metamask will prompt you to add the selected Mezo network automatically.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NetworkOption({
  name,
  description,
  icon,
  isActive,
  isLocked,
  onClick
}: {
  name: string;
  description: string;
  icon: React.ReactNode;
  isActive?: boolean;
  isLocked?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      disabled={isLocked}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden group ${isLocked
          ? 'bg-white/[0.02] border-white/5 opacity-50 cursor-not-allowed'
          : isActive
            ? 'bg-[#F7931A]/10 border-[#F7931A] shadow-[0_0_20px_rgba(247,147,26,0.1)]'
            : 'bg-white/5 border-white/5 hover:border-[#F7931A]/40'
        }`}
    >
      <div className="flex items-center gap-4 relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isLocked ? 'bg-slate-900' : 'bg-black/40 group-hover:bg-[#F7931A]/20'
          }`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-black text-white uppercase tracking-tight truncate">{name}</span>
            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#F7931A] animate-pulse" />}
          </div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest truncate">{description}</p>
        </div>
      </div>
    </button>
  );
}

function MenuAction({
  href,
  icon,
  label,
  external,
  onClick,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
  external?: boolean;
  onClick?: () => void;
}) {
  const className = 'flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-[#F7931A] hover:shadow-lg hover:shadow-orange-500/20';

  if (href) {
    return (
      <Link href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className={className}>
        {icon}
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {icon}
      {label}
    </button>
  );
}

function AssetRow({
  icon,
  title,
  subtitle,
  value,
  strong,
  orange,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: string;
  strong?: boolean;
  orange?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${orange ? 'bg-orange-500 text-white' : 'bg-white/10 text-white'}`}>
          {icon}
        </div>
        <div>
          <p className={`${strong ? 'text-lg' : 'text-base'} font-black leading-tight text-white`}>{title}</p>
          <p className="text-sm font-medium leading-tight text-slate-500">{subtitle}</p>
        </div>
      </div>
      <p className={`${strong ? 'text-lg' : 'text-base'} shrink-0 font-black text-white`}>{value}</p>
    </div>
  );
}

