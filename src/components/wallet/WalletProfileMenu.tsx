'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import {
  BadgeCheck,
  Bitcoin,
  ChevronLeft,
  Coins,
  ExternalLink,
  Loader2,
  LogOut,
  Mail,
  Save,
  Settings,
  ShieldCheck,
  User,
  UserPen,
  Wallet,
} from 'lucide-react';
import { BTC_TOKEN_ADDRESS, ERC20_ABI, MUSD_ADDRESS } from '@/lib/contracts';
import MUSDLogo from '@/components/ui/MUSDLogo';

const ZERO = BigInt(0);

interface WalletProfile {
  wallet_address: string;
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
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'main' | 'settings'>('main');
  const [profile, setProfile] = useState<WalletProfile | null>(null);
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [btcUsd, setBtcUsd] = useState(0);
  // const [mezoUsd] = useState(Number(process.env.NEXT_PUBLIC_MEZO_USD_PRICE || 0));

  const { data: btcBalance } = useReadContract({
    address: BTC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: Boolean(isConnected && address && BTC_TOKEN_ADDRESS) },
  });

  const { data: musdBalance } = useReadContract({
    address: MUSD_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: Boolean(isConnected && address && MUSD_ADDRESS) },
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
    if (!address) {
      setTimeout(() => {
        setProfile(null);
      }, 0);
      return;
    }

    let cancelled = false;

    const loadProfile = () => fetch(`/api/auth?wallet=${address}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || data.error) return;
        setProfile(data.user || null);
      })
      .catch(() => undefined);

    loadProfile();

    const handleProfileUpdate = (event: Event) => {
      const detail = (event as CustomEvent<WalletProfile>).detail;
      if (detail?.wallet_address?.toLowerCase() === address.toLowerCase()) {
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
  }, [address]);

  useEffect(() => {
    if (profile?.wallet_address && view === 'settings') {
      fetch(`/api/auth?wallet=${address}`)
        .then(res => res.json())
        .then(data => {
          if (data.user?.notification_email) {
            setEmail(data.user.notification_email);
          }
        });
    }
  }, [view, profile?.wallet_address, address]);

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

  const displayName = profile?.display_name || 'Wallet profile';
  const username = profile?.username ? `@${profile.username}` : shortAddress(address);
  const avatar = profile?.avatar_url || `https://api.dicebear.com/9.x/shapes/svg?seed=${address}`;
  const btcAmount = Number(formatEther((typeof btcBalance === 'bigint' ? btcBalance : ZERO)));
  const musdAmount = Number(formatEther((typeof musdBalance === 'bigint' ? musdBalance : ZERO)));
  // const mezoAmount = Number(formatEther((typeof mezoBalance === 'bigint' ? mezoBalance : ZERO)));
  // const totalAssets = (btcAmount * btcUsd) + musdAmount + (mezoAmount * mezoUsd) + Number(formatEther(claimable));

  const handleSaveEmail = async () => {
    if (!address || !email) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address, email }),
      });
      if (response.ok) {
        setView('main');
      } else {
        alert('Failed to save email');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <ConnectButton.Custom>
      {({ account, chain, mounted, openConnectModal, openChainModal }) => {
        const ready = mounted;
        const connected = ready && account && chain && isConnected;

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              className="btn-primary flex items-center gap-2 px-5 py-3"
              type="button"
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </button>
          );
        }

        if (chain?.unsupported) {
          return (
            <button onClick={openChainModal} type="button" className="btn-primary px-5 py-3">
              Switch Network
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

                            <div className="relative mt-5 grid grid-cols-2 gap-3">
                              <MenuAction 
                                href="https://mezo.org/overview" 
                                external 
                                icon={<Coins className="h-4 w-4" />} 
                                label="BUY MUSD" 
                              />
                              <MenuAction
                                href={`https://explorer.test.mezo.org/address/${address}`}
                                icon={<ExternalLink className="h-4 w-4" />}
                                label="Explorer"
                                external
                              />
                            </div>

                            <div className="relative mt-6 space-y-2">
                              <Link 
                                href="/profile"
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
                                  disconnect();
                                }}
                                type="button"
                                className="flex items-center gap-2 rounded-xl px-2 py-1 text-sm font-black text-white hover:text-red-500"
                              >
                                <LogOut className="h-4 w-4" />
                                Sign out
                              </button>
                            </div>
                          </motion.div>
                        ) : (
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
                                <h3 className="text-3xl font-black text-white font-outfit uppercase tracking-tighter">Settings</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed mt-1">Update your contact information to stay connected.</p>
                              </div>
                            </div>

                            <div className="space-y-6 flex-1">
                              <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email</label>
                                <div className="relative group">
                                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-[#F7931A] transition-colors" />
                                  <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[#F7931A]/50 transition-all placeholder:text-slate-600 font-medium"
                                  />
                                </div>
                              </div>

                              <button
                                onClick={handleSaveEmail}
                                disabled={isSaving || !email}
                                className="w-full btn-primary py-5 text-lg flex items-center justify-center gap-3 group"
                              >
                                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                SAVE EMAIL
                              </button>

                              <p className="text-[11px] text-slate-500 leading-relaxed px-1">
                                By providing your contact information, you agree to receive service notifications and occasional promotional messages. Promotional messages will always include an opt out link. The Privacy Policy is available <span className="text-[#F7931A] cursor-pointer hover:underline">here</span>.
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
      }}
    </ConnectButton.Custom>
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
