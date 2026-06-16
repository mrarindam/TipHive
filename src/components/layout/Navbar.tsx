'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WalletProfileMenu from '@/components/wallet/WalletProfileMenu';
import NotificationBell from './NotificationBell';
import NetworkSwitcher from './NetworkSwitcher';
import GlobalSearch from './GlobalSearch';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  if (pathname?.includes('/dashboard/createposts') || pathname?.startsWith('/docs')) return null;

  return (
    <nav className="fixed top-0 left-0 lg:left-[76px] w-full lg:w-[calc(100%-76px)] z-[100] border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#050508]/85 backdrop-blur-2xl transition-all duration-300">
      <div className="w-full px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/"
              className="flex items-center gap-2 md:gap-3 group"
            >
              <Image
                src="/logo.png"
                alt="TipHive"
                width={40}
                height={40}
                className="group-hover:rotate-12 transition-all duration-300 w-8 md:w-12"
                style={{ height: 'auto' }}
                unoptimized
              />
              <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-800 dark:text-white font-outfit uppercase">
                TIP<span className="text-[#F7931A]">HIVE</span>
              </span>
            </Link>
          </div>

          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-x-0 top-0 h-20 bg-white/95 dark:bg-black/95 backdrop-blur-3xl z-50 flex items-center px-4 md:hidden border-b border-slate-200 dark:border-white/10 shadow-2xl"
              >
                <div className="flex-1">
                  <GlobalSearch isMobile onSelect={() => setIsSearchOpen(false)} />
                </div>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="ml-2 p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <GlobalSearch />

          {/* Wallet Button, Notifications & Other Header Elements */}
          <div className="flex items-center gap-2.5 md:gap-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex items-center justify-center shadow-md"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <ThemeToggle />
            <NotificationBell />
            <NetworkSwitcher />
            <WalletProfileMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
