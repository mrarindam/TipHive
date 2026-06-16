'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Wallet, Loader2, AlertCircle } from 'lucide-react';

type WalletSignInPromptProps = {
  open: boolean;
  isSigning: boolean;
  error: string | null;
  onSignIn: () => void;
  onCancel: () => void;
};

export default function WalletSignInPrompt({
  open,
  isSigning,
  error,
  onSignIn,
  onCancel,
}: WalletSignInPromptProps) {
  return (
    <AnimatePresence>
      {open && (
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
                <Wallet className="h-10 w-10 text-amber-400" />
              </div>

              <h2 className="mb-2 font-outfit text-3xl font-black uppercase tracking-tighter text-white">
                Sign In to TipHive
              </h2>
              <p className="mb-8 text-sm font-medium text-slate-400">
                Please sign the message with your wallet to verify ownership
                and access your account.
              </p>

              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-left">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  <p className="text-xs font-medium leading-relaxed text-red-300">
                    {error}
                  </p>
                </div>
              )}

              <motion.button
                whileHover={isSigning ? undefined : { scale: 1.03 }}
                whileTap={isSigning ? undefined : { scale: 0.97 }}
                onClick={onSignIn}
                disabled={isSigning}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#F7931A] py-4 text-sm font-black uppercase tracking-widest text-black shadow-[0_8px_32px_rgba(247,147,26,0.35)] transition-all hover:bg-amber-400 hover:shadow-[0_8px_52px_rgba(247,147,26,0.52)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSigning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Waiting for Signature...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    {error ? 'Try Again' : 'Sign In'}
                  </>
                )}
              </motion.button>

              <button
                type="button"
                onClick={onCancel}
                disabled={isSigning}
                className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 transition-colors hover:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel & Disconnect Wallet
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
