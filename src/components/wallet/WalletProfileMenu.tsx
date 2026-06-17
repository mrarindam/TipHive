'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useWalletAuth } from '@/lib/wallet-auth-shim';
import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import {
  BadgeCheck,
  Bitcoin,
  ExternalLink,
  LogOut,
  User,
  UserPen,
  Wallet,
} from 'lucide-react';
import { BTC_TOKEN_ADDRESS, ERC20_ABI } from '@/lib/contracts';
import MUSDLogo from '@/components/ui/MUSDLogo';
import { mezoTestnet, mezoMainnet } from '@/components/providers/WalletProviderWrapper';
import { useNetworkConfig } from '@/lib/hooks/useNetworkConfig';

const ZERO = BigInt(0);

export interface WalletProfile {
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
  const { ready, authenticated, logout, user, login } = useWalletAuth();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
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

  useEffect(() => {
    let cancelled = false;

    if (!ready) return;

    if (!authenticated || !address) {
      setProfile(null);
      return;
    }

    const loadProfile = async () => {
      const walletToQuery = address;

      if (!walletToQuery) return;
      try {
        const res = await fetch(`/api/auth?wallet=${walletToQuery}&t=${Date.now()}`);
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

      if (matchAddress) {
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
  }, [address, authenticated, ready]);



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
        className="relative h-12 w-12 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black transition-all active:scale-95 shadow-sm"
        aria-label="Open wallet profile"
      >
        <img src={avatar} alt="" className="h-full w-full object-cover" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed left-1/2 top-20 z-[120] w-[95vw] -translate-x-1/2 overflow-hidden rounded-b-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#070707] text-slate-900 dark:text-white shadow-xl md:absolute md:left-auto md:right-0 md:top-16 md:w-[400px] md:translate-x-0 md:rounded-[2rem] transform-gpu transition-all duration-300"
          >
            {/* Minimal top border */}
            <div className="absolute inset-x-0 top-0 h-px bg-slate-200 dark:bg-white/10" />
            <div className="relative overflow-hidden p-5">
              <motion.div
                key="main"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative flex items-center gap-4 pt-2">
                  <img src={avatar} alt="" className="h-14 w-14 rounded-2xl border border-[#F7931A]/30 object-cover shadow-sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        {displayName}
                      </h3>
                      <BadgeCheck className="h-5 w-5 shrink-0 fill-cyan-400 text-black dark:text-cyan-400" />
                    </div>
                    <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-[#F7931A]">{username}</p>
                  </div>
                </div>

                <div className="relative mt-6 space-y-2">
                  <Link
                    href="/editprofile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 w-full p-3 rounded-xl bg-slate-50 dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.1] transition-all border border-slate-200 dark:border-white/5 group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 group-hover:scale-105 transition-transform">
                      <UserPen className="h-5 w-5" />
                    </div>
                    <span className="font-black text-slate-800 dark:text-white">Edit Profile</span>
                  </Link>

                  <Link
                    href={profile?.username ? `/${profile.username}` : '#'}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 w-full p-3 rounded-xl bg-slate-50 dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.1] transition-all border border-slate-200 dark:border-white/5 group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500 group-hover:scale-105 transition-transform">
                      <User className="h-5 w-5" />
                    </div>
                    <span className="font-black text-slate-800 dark:text-white">Profile</span>
                  </Link>
                </div>

                {!address ? (
                  <div className="relative mt-6 border-y border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] -mx-5 px-5 py-5 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Login with Wallet</h3>
                    <p className="mb-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Select a wallet, connect, and sign to use TipHive.
                    </p>
                    <button
                      onClick={login}
                      className="w-full btn-primary py-3 px-4 flex items-center justify-center gap-2 group text-sm"
                    >
                      <Wallet className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Login
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Network Warning if not on supported Mezo network */}
                    {isConnected && chain?.id !== mezoTestnet.id && chain?.id !== mezoMainnet.id && (
                      <div className="relative mt-6 border border-red-500/30 bg-red-500/5 -mx-5 px-5 py-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                            <Wallet className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Wrong Network</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Switch to Mezo</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            window.dispatchEvent(new Event('open-network-switcher'));
                          }}
                          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.1em] rounded-lg border border-red-500/20 transition-all"
                        >
                          FIX NOW
                        </button>
                      </div>
                    )}

                    <div className="relative mt-4 grid grid-cols-1">
                      <MenuAction
                        href={`${networkConfig.explorerUrl}/address/${address}`}
                        icon={<ExternalLink className="h-4 w-4" />}
                        label="View on Explorer"
                        external
                      />
                    </div>

                    <div className="relative mt-6 border-y border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] -mx-5 px-5 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-[#F7931A]">
                            <Wallet className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white">Connected Wallet</p>
                            <p className="font-mono text-sm text-slate-500">{shortAddress(address)}</p>
                          </div>
                        </div>
                        <BadgeCheck className="h-5 w-5 text-lime-600 dark:text-lime-500" />
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

                <div className="relative flex items-center justify-center border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/40 -mx-5 mt-4 px-5 py-4">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    type="button"
                    className="flex items-center gap-2 rounded-xl px-2 py-1 text-sm font-black text-slate-800 dark:text-white hover:text-red-600 dark:hover:text-red-500 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
  const className = 'flex items-center justify-center gap-2 rounded-2xl bg-slate-100 dark:bg-white/10 px-4 py-3 text-sm font-black text-slate-800 dark:text-white transition-all hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-white/5';

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
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${orange ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white'}`}>
          {icon}
        </div>
        <div>
          <p className={`${strong ? 'text-lg' : 'text-base'} font-black leading-tight text-slate-900 dark:text-white`}>{title}</p>
          <p className="text-sm font-medium leading-tight text-slate-500">{subtitle}</p>
        </div>
      </div>
      <p className={`${strong ? 'text-lg' : 'text-base'} shrink-0 font-black text-slate-900 dark:text-white`}>{value}</p>
    </div>
  );
}

