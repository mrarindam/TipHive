'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, X, AlertCircle } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

interface RequireWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RequireWalletModal({ isOpen, onClose }: RequireWalletModalProps) {
  const { linkWallet } = usePrivy();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0A0A0A] p-8 shadow-2xl shadow-[#F7931A]/20"
          >
            {/* Background Glows */}
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#F7931A]/20 blur-[60px]" />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-500/20 blur-[60px]" />

            <button
              onClick={onClose}
              className="absolute right-6 top-6 rounded-full bg-white/5 p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-[#F7931A] to-orange-600 shadow-[0_0_40px_rgba(247,147,26,0.3)]">
                <Wallet className="h-10 w-10 text-white" />
              </div>

              <div className="mb-2 flex items-center gap-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Action Required</span>
              </div>

              <h2 className="mb-3 text-3xl font-black uppercase tracking-tight text-white">
                Connect Wallet
              </h2>
              
              <p className="mb-8 text-sm font-medium leading-relaxed text-slate-400">
                To perform on-chain actions like sending tips or subscribing, you must link an external Web3 wallet (e.g. MetaMask, Rabby).
              </p>

              <button
                onClick={() => {
                  onClose();
                  linkWallet();
                }}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#F7931A] px-6 py-4 font-black text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                <Wallet className="h-5 w-5" />
                <span>Link External Wallet</span>
              </button>
              
              <button 
                onClick={onClose}
                className="mt-4 text-sm font-bold text-slate-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
