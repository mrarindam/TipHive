'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft } from 'lucide-react';

export default function WalletSwitchGuard({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
  const { ready, authenticated, logout } = usePrivy();
  const [linkedWallet, setLinkedWallet] = useState<string | undefined>(undefined);
  const [walletSwitched, setWalletSwitched] = useState(false);
  const [switchedToAddress, setSwitchedToAddress] = useState<string | undefined>(undefined);

  // Load the linked wallet from the user's TipHive profile once after login
  useEffect(() => {
    if (!ready || !authenticated || !address) return;
    // Only record the first address we see after login — that's the "canonical" account wallet
    if (!linkedWallet) {
      setLinkedWallet(address.toLowerCase());
    }
  }, [ready, authenticated, address, linkedWallet]);

  // Detect mismatch between active wallet and the one recorded at login
  useEffect(() => {
    if (!linkedWallet || !address) {
      setWalletSwitched(false);
      return;
    }
    const active = address.toLowerCase();
    if (active !== linkedWallet) {
      setWalletSwitched(true);
      setSwitchedToAddress(address);
    } else {
      setWalletSwitched(false);
      setSwitchedToAddress(undefined);
    }
  }, [address, linkedWallet]);

  const handleSignOutAndSwitch = async () => {
    setWalletSwitched(false);
    setLinkedWallet(undefined);
    setSwitchedToAddress(undefined);
    await logout();
  };

  return (
    <>
      {children}

      {/* GLOBAL WALLET SWITCH BLOCKING MODAL - renders on top of everything */}
      <AnimatePresence>
        {walletSwitched && switchedToAddress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
            style={{
              backdropFilter: 'blur(40px) saturate(0.3) brightness(0.4)',
              background: 'rgba(0,0,0,0.94)',
              pointerEvents: 'all',
            }}
          >
            {/* Block all clicks on background */}
            <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} />

            {/* Ambient glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-amber-500/8 blur-[160px] animate-pulse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-orange-600/8 blur-[100px]" />
              {/* Top & bottom edge lines */}
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />
            </div>

            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 40 }}
              transition={{ type: 'spring', bounce: 0.28, duration: 0.55 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/20 bg-[#07070a] shadow-[0_60px_120px_rgba(0,0,0,1),0_0_100px_rgba(247,147,26,0.08)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top accent bar */}
              <div className="h-[3px] w-full bg-gradient-to-r from-amber-700 via-amber-400 to-orange-500" />

              <div className="p-10 text-center">
                {/* Animated icon */}
                <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-500/10 border border-amber-500/20 shadow-[0_0_50px_rgba(247,147,26,0.12)]">
                  <motion.div
                    animate={{ rotate: [0, -18, 18, -12, 12, 0] }}
                    transition={{ duration: 0.75, delay: 0.5, repeat: Infinity, repeatDelay: 3.5 }}
                  >
                    <ArrowRightLeft className="h-10 w-10 text-amber-400" />
                  </motion.div>
                </div>

                {/* Title */}
                <h2 className="mb-2 font-outfit text-3xl font-black uppercase tracking-tighter text-white">
                  Wallet Switched
                </h2>
                <p className="mb-1 text-sm font-medium text-slate-400">
                  A different wallet was detected in your wallet manager.
                </p>

                {/* New wallet address pill */}
                <div className="mx-auto mb-6 mt-5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-5 py-2.5">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                  <span className="font-mono text-sm font-black text-amber-300">
                    {switchedToAddress.slice(0, 10)}...{switchedToAddress.slice(-8)}
                  </span>
                </div>

                <p className="mb-10 text-xs font-medium leading-relaxed text-slate-500">
                  This wallet may belong to a{' '}
                  <span className="font-bold text-amber-400">different TipHive account</span>.{' '}
                  Switch back to your original wallet to continue, or sign out and log in with this wallet.
                </p>

                {/* Single CTA */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSignOutAndSwitch}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-amber-500 py-4 text-sm font-black uppercase tracking-widest text-black shadow-[0_8px_32px_rgba(247,147,26,0.35)] transition-all hover:bg-amber-400 hover:shadow-[0_8px_52px_rgba(247,147,26,0.52)]"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Sign Out &amp; Switch Account
                </motion.button>

                <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                  Or switch back to your original wallet to continue
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
