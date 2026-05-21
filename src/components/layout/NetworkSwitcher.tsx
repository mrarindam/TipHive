'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useSwitchChain } from 'wagmi';
import { Globe } from 'lucide-react';
import { mezoTestnet, mezoMainnet } from '@/components/providers/WalletProviderWrapper';
import { useWalletAuth } from '@/lib/wallet-auth-shim';

const NETWORKS = [
  { id: mezoMainnet.id, name: 'Mezo Mainnet', desc: 'Live network' },
  { id: mezoTestnet.id, name: 'Mezo Testnet', desc: 'Test environment' },
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

  if (!mounted || !ready || !authenticated) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 transition-all flex items-center justify-center shadow-lg shadow-black/20"
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
            className="absolute right-0 mt-2 w-72 rounded-2xl border border-white/10 bg-[#0b0b10] shadow-2xl backdrop-blur-3xl z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-white/5">
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
                        : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <img src="/mezo.png" alt="" className="h-6 w-6" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-sm uppercase tracking-tight truncate">
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
