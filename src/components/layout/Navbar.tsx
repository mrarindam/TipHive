'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, X, Compass, LayoutDashboard, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Discover', href: '/discover', icon: <Compass className="w-4 h-4" /> },
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  ];

  return (
    <nav className="sticky top-0 z-[100] border-b border-white/10 bg-black/60 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-3 group">
              <Image 
                src="/logo.png" 
                alt="TipHive" 
                width={48} 
                height={48} 
                className="group-hover:rotate-12 transition-all duration-300 mix-blend-screen"
                style={{ height: 'auto' }}
                unoptimized
              />
              <span className="text-2xl font-black tracking-tighter text-white font-outfit uppercase">
                TIP<span className="text-[#F7931A]">HIVE</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center bg-white/5 border border-white/10 p-1.5 rounded-2xl">
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

          {/* Wallet Button & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <ConnectButton 
                accountStatus="avatar"
                showBalance={false}
                chainStatus="icon"
              />
            </div>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
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
            <div className="px-4 py-8 space-y-4">
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
              
              <div className="pt-6 sm:hidden border-t border-white/5 flex justify-center">
                <ConnectButton 
                  accountStatus="avatar"
                  showBalance={false}
                  chainStatus="icon"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
