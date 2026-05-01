'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Compass, LayoutDashboard, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WalletProfileMenu from '@/components/wallet/WalletProfileMenu';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Discover', href: '/discover', icon: <Compass className="w-4 h-4" /> },
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  ];

  return (
    <nav className="fixed top-0 w-full z-[100] border-b border-white/5 bg-black/60 backdrop-blur-2xl">
      <div className="w-full px-[5%] md:px-[8%]">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link 
              href="/" 
              className="flex items-center gap-2 md:gap-3 group"
              onClick={(e) => {
                if (window.innerWidth < 768) {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('toggle-wallet-menu'));
                }
              }}
            >
              <Image 
                src="/logo.png" 
                alt="TipHive" 
                width={40} 
                height={40} 
                className="group-hover:rotate-12 transition-all duration-300 mix-blend-screen w-8 md:w-12"
                style={{ height: 'auto' }}
                unoptimized
              />
              <span className="text-xl md:text-2xl font-black tracking-tighter text-white font-outfit uppercase">
                TIP<span className="text-[#F7931A]">HIVE</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center bg-white/5 border border-white/5 p-1.5 rounded-2xl">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#F7931A] text-white shadow-lg' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Wallet Button, Notifications & Mobile Toggle */}
          <div className="flex items-center gap-2.5 md:gap-4">
            <NotificationBell />
            <WalletProfileMenu />
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2.5 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 transition-all flex items-center justify-center shadow-lg shadow-black/20"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6 text-[#F7931A]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-3xl overflow-hidden"
          >
            <div className="px-4 py-8 space-y-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase tracking-tighter text-xl transition-all ${
                      isActive 
                        ? 'bg-[#F7931A] text-white' 
                        : 'bg-white/5 text-slate-400 border border-white/5'
                    }`}
                  >
                    <div className={`${isActive ? 'text-white' : 'text-[#F7931A]'}`}>
                      {link.icon}
                    </div>
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
