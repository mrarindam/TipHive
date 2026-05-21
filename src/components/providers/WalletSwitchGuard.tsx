'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useWalletAuth } from '@/lib/wallet-auth-shim';

export default function WalletSwitchGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { address } = useAccount();
  const { ready, authenticated, user, logout } = useWalletAuth();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // The wallet baked into the server-issued session cookie — this is the
  // wallet that actually SIWE-signed. We compare ANY currently-active wallet
  // against this, so a mid-session OR cross-browser-restart swap both get
  // caught.
  const sessionWallet = user?.wallet?.address?.toLowerCase();
  const activeWallet = address?.toLowerCase();

  const onDocs = pathname?.startsWith('/docs');
  const mismatch =
    !onDocs &&
    ready &&
    authenticated &&
    sessionWallet &&
    activeWallet &&
    sessionWallet !== activeWallet;

  const switchedToAddress = mismatch ? address : undefined;

  const handleSignOutAndSwitch = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  return (
    <>
      {children}

      <AnimatePresence>
        {!pathname?.startsWith('/docs') && switchedToAddress && (
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
            <div className="absolute inset-0" onClick={(event) => event.stopPropagation()} />

            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/8 blur-[160px] animate-pulse" />
              <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-600/8 blur-[100px]" />
              <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
              <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />
            </div>

            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 40 }}
              transition={{ type: 'spring', bounce: 0.28, duration: 0.55 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/20 bg-[#07070a] shadow-[0_60px_120px_rgba(0,0,0,1),0_0_100px_rgba(247,147,26,0.08)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="h-[3px] w-full bg-gradient-to-r from-amber-700 via-amber-400 to-orange-500" />

              <div className="p-10 text-center">
                <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-3xl border border-amber-500/20 bg-amber-500/10 shadow-[0_0_50px_rgba(247,147,26,0.12)]">
                  <motion.div
                    animate={{ rotate: [0, -18, 18, -12, 12, 0] }}
                    transition={{ duration: 0.75, delay: 0.5, repeat: Infinity, repeatDelay: 3.5 }}
                  >
                    <ArrowRightLeft className="h-10 w-10 text-amber-400" />
                  </motion.div>
                </div>

                <h2 className="mb-2 font-outfit text-3xl font-black uppercase tracking-tighter text-white">
                  Wallet Switched
                </h2>
                <p className="mb-1 text-sm font-medium text-slate-400">
                  A different wallet was detected in your wallet manager.
                </p>

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

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSignOutAndSwitch}
                  disabled={isLoggingOut}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-amber-500 py-4 text-sm font-black uppercase tracking-widest text-black shadow-[0_8px_32px_rgba(247,147,26,0.35)] transition-all hover:bg-amber-400 hover:shadow-[0_8px_52px_rgba(247,147,26,0.52)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  {isLoggingOut ? 'Signing Out...' : 'Sign Out & Switch Account'}
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
