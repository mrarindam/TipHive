'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useSwitchChain } from 'wagmi';
import { Globe } from 'lucide-react';
import { mezoTestnet, mezoMainnet } from '@/components/providers/WalletProviderWrapper';
import { useWalletAuth } from '@/lib/wallet-auth-shim';

const NETWORKS = [
  { id: mezoTestnet.id, name: 'Mezo Testnet', desc: 'Test environment' },
  { id: mezoMainnet.id, name: 'Mezo Mainnet', desc: 'Live network' },
];

export default function NetworkSwitcher() {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { ready, authenticated } = useWalletAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Avoid SSR/CSR mismatch: render nothing on the server pass, then decide
  // on the client based on auth state.
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Allow other components (e.g. wrong-network warnings) to open this menu.
  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener('open-network-switcher', open);
    return () => window.removeEventListener('open-network-switcher', open);
  }, []);

  if (!mounted) return null;
  if (!ready) {
    return (
      <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl animate-pulse">
        <div className="w-5 h-5" />
      </div>
    );
  }
  if (!authenticated) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="p-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex items-center justify-center shadow-sm"
        aria-label="Switch network"
      >
        <Globe className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0b10] shadow-2xl backdrop-blur-3xl z-50 overflow-hidden text-slate-900 dark:text-white"
          >
            <div className="px-4 py-3 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Network</p>
            </div>
            <div className="p-2 space-y-1">
              {NETWORKS.map((network) => {
                const active = chain?.id === network.id;
                return (
                  <button
                    key={network.id}
                    type="button"
                    onClick={() => {
                      switchChain?.({ chainId: network.id });
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      active
                        ? 'bg-[#F7931A]/10 border-[#F7931A]/40'
                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <img src="/mezo.png" alt="" className="h-6 w-6" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight truncate">
                          {network.name}
                        </span>
                        {active && <div className="w-1.5 h-1.5 rounded-full bg-[#F7931A] animate-pulse" />}
                      </div>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest truncate">
                        {network.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
