'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Bitcoin,
  ShieldCheck,
  Zap,
  Rocket,
  Globe,
  Star,
  CheckCircle2,
  Wallet,
  Plus,
  ChevronDown,
  LayoutDashboard,
  Coins,
  Gem,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import MUSDLogo from '@/components/ui/MUSDLogo';

export default function HomePageClient() {
  const containerRef = useRef(null);

  return (
    <div ref={containerRef} className="relative w-full bg-slate-50 dark:bg-[#050505] selection:bg-[#F7931A]/30 transition-colors duration-300">
      {/* Hero Section */}
      <section
        className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 overflow-hidden bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-300"
      >
        <div className="w-full px-[5%] md:px-[8%] relative z-10 text-center">

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[clamp(3.5rem,15vw,8.5rem)] font-black text-slate-900 dark:text-white tracking-tighter mb-6 leading-[0.8] font-outfit uppercase"
          >
            The Multi-Chain <br />
            <span className="text-[#F7931A]">
              Creator Economy
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-4xl mx-auto text-[clamp(1.1rem,4vw,1.4rem)] text-slate-600 dark:text-slate-300 mb-8 md:mb-12 leading-normal font-medium px-6"
          >
            Empower your favorite creators with <span className="text-slate-900 dark:text-white font-bold">instant, direct</span> tipping and subscriptions across Bitcoin L2, EVM chains, and Solana. Safe, non-custodial, and 100% borderless.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-6 px-4"
          >
            {/* Card 1: Direct Tipping */}
            <Link href="/explore" className="group relative block p-8 rounded-[2rem] bg-slate-100/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/5 hover:border-[#F7931A]/40 transition-all duration-300 overflow-hidden text-left shadow-sm">
              <div className="mb-6 p-4 bg-slate-200/50 dark:bg-white/[0.03] border border-slate-300 dark:border-white/5 rounded-2xl inline-block text-[#F7931A] group-hover:scale-105 transition-all duration-300">
                <Coins className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tighter font-outfit flex items-center gap-2">
                Direct Tipping
                <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[#F7931A]" />
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                Support creators instantly with Bitcoin, Ethereum, Solana, or stablecoins. No cuts, zero friction.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#F7931A] bg-[#F7931A]/10 px-3 py-1 rounded-full border border-[#F7931A]/20">Multi-Chain</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Instant</span>
              </div>
            </Link>

            {/* Card 2: Memberships */}
            <Link href="/dashboard" className="group relative block p-8 rounded-[2rem] bg-slate-100/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/5 hover:border-purple-500/40 transition-all duration-300 overflow-hidden text-left shadow-sm">
              <div className="mb-6 p-4 bg-slate-200/50 dark:bg-white/[0.03] border border-slate-300 dark:border-white/5 rounded-2xl inline-block text-purple-500 dark:text-purple-400 group-hover:scale-105 transition-all duration-300">
                <Gem className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tighter font-outfit flex items-center gap-2">
                Memberships
                <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-purple-500 dark:text-purple-400" />
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                Unlock exclusive recurring tiers and premium perks backed by audited, secure smart contracts.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-500 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">Smart Contracts</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Recurring</span>
              </div>
            </Link>

            {/* Card 3: Exclusive Drops */}
            <Link href="/explore" className="group relative block p-8 rounded-[2rem] bg-slate-100/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/5 hover:border-emerald-500/40 transition-all duration-300 overflow-hidden text-left shadow-sm">
              <div className="mb-6 p-4 bg-slate-200/50 dark:bg-white/[0.03] border border-slate-300 dark:border-white/5 rounded-2xl inline-block text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-all duration-300">
                <Rocket className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tighter font-outfit flex items-center gap-2">
                Content Drops
                <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-emerald-600 dark:text-emerald-400" />
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                Access creators' premium files, drops, and posts. Unlock direct support models for digital assets.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Drops</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Unlockable</span>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Scroll Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-slate-500"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Scroll to Explore</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6 text-[#F7931A]" />
          </motion.div>
        </motion.div>
      </section>

      {/* Problem Section */}
      <section className="relative w-full py-24 md:py-40 bg-black/50 overflow-hidden">
        <div className="w-full px-[5%] md:px-[8%]">
          {/* Header matching image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-10%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="flex items-center gap-6 mb-24 w-full"
          >
            <h2 className="text-3xl md:text-4xl text-slate-300 font-medium whitespace-nowrap tracking-wide">The Problem</h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
              className="h-px bg-slate-600 flex-1 origin-left"
            />
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 md:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6 md:space-y-8"
            >
              <h2 className="text-4xl md:text-7xl font-black text-white font-outfit leading-tight tracking-tighter uppercase">
                Traditional <br /> Tipping is <br /> <span className="text-slate-400 text-slate-600 line-through">Broken.</span>
              </h2>
              <div className="space-y-4 md:space-y-6 text-base md:text-lg text-slate-400 text-slate-400 text-slate-400 font-medium">
                <p>Hidden fees, 30% platform cuts, and delayed payouts are strangling the creator economy.</p>
                <p>Creators deserve better than centralized gatekeepers taking their hard-earned support.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <PainPointCard
                icon={<Coins className="w-8 h-8 text-red-400" />}
                title="Insane Fees"
                desc="Up to 40% of every tip is lost to processing and platform fees."
              />
              <PainPointCard
                icon={<Clock className="w-8 h-8 text-orange-400" />}
                title="Slow Payouts"
                desc="Wait weeks to access your funds through complex banking systems."
              />
              <PainPointCard
                icon={<ShieldCheck className="w-8 h-8 text-yellow-400" />}
                title="Censorship"
                desc="Platforms can freeze your assets or ban you without warning."
              />
              <PainPointCard
                icon={<Globe className="w-8 h-8 text-blue-400" />}
                title="Bordered"
                desc="Global fans struggle with local payment restrictions."
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="relative w-full py-24 md:py-40 overflow-hidden bg-[#050505]">
        <div className="w-full px-[5%] md:px-[8%] relative z-10">

          {/* Header matching image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-10%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="flex items-center gap-6 mb-24 w-full"
          >
            <h2 className="text-3xl md:text-4xl text-slate-300 font-medium whitespace-nowrap tracking-wide">The Solutions</h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
              className="h-px bg-slate-600 flex-1 origin-left"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-10%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center space-y-10 max-w-4xl mx-auto mb-32"
          >
            <h2 className="text-5xl md:text-7xl font-black text-white font-outfit uppercase tracking-tighter leading-none">
              Welcome to the <br /> <span>TipHive Revolution.</span>
            </h2>
            <p className="text-xl text-slate-400 text-slate-400 text-slate-400 font-medium leading-relaxed">
              We leverage the power of Mezo Bitcoin L2 to create a borderless, permissionless, and fee-less economy for everyone.
            </p>
          </motion.div>

          {/* Graphic Features - Tipping & Subscribing */}
          <div className="space-y-32">
            {/* Tipping Feature */}
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col lg:flex-row items-center gap-16"
            >
              <div className="flex-1 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F7931A]/10 text-[#F7931A] font-bold text-sm uppercase tracking-wider border border-[#F7931A]/20">
                  <Zap className="w-4 h-4" /> Direct Support
                </div>
                <h3 className="text-5xl md:text-6xl font-black text-white font-outfit uppercase tracking-tighter leading-none">
                  Tip Creators <br /> Instantly
                </h3>
                <p className="text-xl text-slate-400 text-slate-400 text-slate-400 leading-relaxed max-w-lg">
                  Send value directly to your favorite creators. No middlemen, no waiting periods. 100% of your tip goes straight into the creator&apos;s wallet in real-time using Bitcoin-backed stablecoins.
                </p>
                <ul className="space-y-4">
                  {[
                    "Zero platform fees",
                    "Instant cross-border settlement",
                    "Complete privacy and control"
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false }}
                      transition={{ delay: 0.4 + (i * 0.1) }}
                      className="flex items-center gap-3 text-slate-300 font-medium"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#F7931A]" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full relative">
                <div className="w-full aspect-square md:aspect-[4/3] rounded-[2.5rem] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/5 relative overflow-hidden flex items-center justify-center shadow-2xl">
                  {/* Decorative background grid */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

                  {/* Animated Tipping UI */}
                  <div className="relative z-10 w-[80%] max-w-sm bg-[#111] border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#F7931A] to-orange-400 flex items-center justify-center shadow-lg">
                        <Bitcoin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-lg">Alex Dev</div>
                        <div className="text-slate-500 text-sm">@alex_dev</div>
                      </div>
                    </div>
                    <div className="text-center py-4">
                      <div className="text-5xl font-black text-white tracking-tighter mb-2">50.00</div>
                      <div className="text-[#F7931A] font-bold text-sm tracking-widest uppercase">MUSD Tip</div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-4 bg-[#F7931A] text-black font-black text-center rounded-2xl uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(247,147,26,0.3)]"
                    >
                      <Zap className="w-5 h-5 fill-black" /> Send Tip Now
                    </motion.div>
                  </div>

                  {/* Floating Elements */}
                  <motion.div
                    animate={{ y: [-15, 15, -15], rotate: [-5, 5, -5] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[15%] right-[10%] w-16 h-16 bg-[#1a1a1a] border border-white/5 rounded-2xl flex items-center justify-center shadow-xl"
                  >
                    <MUSDLogo className="w-8 h-8" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [15, -15, 15], rotate: [5, -5, 5] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[20%] left-[5%] w-14 h-14 bg-[#1a1a1a] border border-white/5 rounded-2xl flex items-center justify-center shadow-xl"
                  >
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500/20" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Subscribing Feature */}
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col lg:flex-row-reverse items-center gap-16"
            >
              <div className="flex-1 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 font-bold text-sm uppercase tracking-wider border border-purple-500/20">
                  <Gem className="w-4 h-4" /> Recurring Value
                </div>
                <h3 className="text-5xl md:text-6xl font-black text-white font-outfit uppercase tracking-tighter leading-none">
                  Subscribe & <br /> Unlock
                </h3>
                <p className="text-xl text-slate-400 text-slate-400 text-slate-400 leading-relaxed max-w-lg">
                  Join a creator&apos;s inner circle. Subscriptions are powered by immutable smart contracts, giving you total transparency and ensuring creators retain full ownership of their audience.
                </p>
                <ul className="space-y-4">
                  {[
                    "Unstoppable recurring payments",
                    "Exclusive content access",
                    "Direct creator-to-fan relationship"
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false }}
                      transition={{ delay: 0.4 + (i * 0.1) }}
                      className="flex items-center gap-3 text-slate-300 font-medium"
                    >
                      <CheckCircle2 className="w-5 h-5 text-purple-400" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full relative">
                <div className="w-full aspect-square md:aspect-[4/3] rounded-[2.5rem] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/5 relative overflow-hidden flex items-center justify-center shadow-2xl">
                  {/* Decorative background grid */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

                  {/* Animated Subscription UI */}
                  <div className="relative z-10 w-[80%] max-w-sm bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 flex items-center justify-between">
                      <div className="text-white font-black text-xl uppercase tracking-wider">Premium Tier</div>
                      <Star className="w-6 h-6 text-white fill-white/50" />
                    </div>
                    <div className="p-6 flex flex-col gap-6">
                      <div className="flex items-end gap-2">
                        <div className="text-5xl font-black text-white tracking-tighter">10.00</div>
                        <div className="text-slate-400 text-slate-400 text-slate-400 font-medium mb-1">MUSD / mo</div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-purple-400" /> Exclusive Discord Role
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-purple-400" /> Early Video Access
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-purple-400" /> Monthly Q&A
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-4 bg-purple-600 hover:bg-purple-500 transition-colors text-white font-black text-center rounded-2xl uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer mt-2 shadow-lg shadow-purple-500/20"
                      >
                        Subscribe
                      </motion.div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <motion.div
                    animate={{ y: [-10, 10, -10], rotate: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[20%] left-[10%] w-16 h-16 bg-[#1a1a1a] border border-white/5 rounded-2xl flex items-center justify-center shadow-xl"
                  >
                    <ShieldCheck className="w-8 h-8 text-purple-400" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [10, -10, 10], rotate: [0, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute bottom-[15%] right-[5%] w-14 h-14 bg-[#1a1a1a] border border-white/5 rounded-2xl flex items-center justify-center shadow-xl"
                  >
                    <Gem className="w-6 h-6 text-blue-400" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Posting to Earn Feature */}
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col lg:flex-row items-center gap-16"
            >
              <div className="flex-1 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-sm uppercase tracking-wider border border-emerald-500/20">
                  <Rocket className="w-4 h-4" /> Content Economy
                </div>
                <h3 className="text-5xl md:text-6xl font-black text-white font-outfit uppercase tracking-tighter leading-none">
                  Post to <br /> Earn
                </h3>
                <p className="text-xl text-slate-400 text-slate-400 text-slate-400 leading-relaxed max-w-lg">
                  Share exclusive &quot;Drops&quot; with your inner circle. Whether it&apos;s art, music, or updates, your followers and subscribers can support you directly for every piece of content you create.
                </p>
                <ul className="space-y-4">
                  {[
                    "Monetize exclusive content drops",
                    "Public feeds for discovery",
                    "Direct fan-to-creator engagement"
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false }}
                      transition={{ delay: 0.4 + (i * 0.1) }}
                      className="flex items-center gap-3 text-slate-300 font-medium"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full relative">
                <div className="w-full aspect-square md:aspect-[4/3] rounded-[2.5rem] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/5 relative overflow-hidden flex items-center justify-center shadow-2xl">
                  {/* Decorative background grid */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

                  {/* Animated Posting UI */}
                  <div className="relative z-10 w-[80%] max-w-sm bg-[#111] border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Rocket className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="text-white font-bold">New Drop</div>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                        Exclusive
                      </div>
                    </div>
                    <div className="h-24 w-full bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col gap-2">
                      <div className="w-3/4 h-2 bg-white/10 rounded-full" />
                      <div className="w-1/2 h-2 bg-white/10 rounded-full" />
                      <div className="w-2/3 h-2 bg-white/10 rounded-full" />
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 transition-colors text-white text-black font-black text-center rounded-2xl uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Share with Fans
                    </motion.div>
                  </div>

                  {/* Floating Elements */}
                  <motion.div
                    animate={{ y: [-15, 15, -15], scale: [1, 1.1, 1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[15%] right-[10%] w-16 h-16 bg-[#1a1a1a] border border-white/5 rounded-2xl flex items-center justify-center shadow-xl"
                  >
                    <Plus className="w-8 h-8 text-emerald-400" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [15, -15, 15], rotate: [-10, 10, -10] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute bottom-[20%] left-[5%] w-14 h-14 bg-[#1a1a1a] border border-white/5 rounded-2xl flex items-center justify-center shadow-xl"
                  >
                    <Star className="w-6 h-6 text-emerald-500 fill-emerald-500/20" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

          </div>

        </div>
      </section>



      {/* How it Works */}
      <section className="relative w-full py-24 md:py-60 px-4">
        <div className="w-full px-[5%] md:px-[8%]">
          <div className="flex flex-col lg:flex-row items-end justify-between gap-10 mb-24">
            <div className="max-w-2xl space-y-6">
              <h2 className="text-6xl font-black text-white uppercase tracking-tighter font-outfit">How it works</h2>
              <p className="text-xl text-slate-500 font-medium">Three steps to join the future of the creator economy.</p>
            </div>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block h-px flex-1 bg-gradient-to-r from-[#F7931A]/40 to-transparent mx-10 mb-6 origin-left"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <StepItem
              number="01"
              index={0}
              icon={<Wallet className="w-10 h-10" />}
              title="Connect Identity"
              desc="Link your Mezo wallet. Your address is your unique profile across the Hive."
            />
            <StepItem
              number="02"
              index={1}
              icon={<LayoutDashboard className="w-10 h-10" />}
              title="Set Up Page"
              desc="Customize your creator dashboard and share your tipping link with your fans."
            />
            <StepItem
              number="03"
              index={2}
              icon={<Gem className="w-10 h-10" />}
              title="Earn in MUSD"
              desc="Receive Bitcoin-backed stablecoin tips instantly and withdraw anytime."
            />
          </div>
        </div>
      </section>

      {/* Trusted Platform Section */}
      <section className="relative w-full py-24 md:py-40 px-4 overflow-hidden bg-[#050505]">
        <div className="w-full px-[5%] md:px-[8%] text-center space-y-12 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-10%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white uppercase tracking-tighter font-outfit leading-tight"
          >
            Why is TipHive the Trusted Platform for <br className="hidden lg:block" /> <span className="text-[#F7931A]">Modern Creators?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-10%" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl md:text-2xl text-slate-400 text-slate-400 text-slate-400 font-medium leading-relaxed max-w-4xl mx-auto"
          >
            We&apos;re more than a creator platform. Built on Mezo, TipHive helps creators turn their audience into thriving communities through memberships, exclusive content and seamless supporter experiences.
          </motion.p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative w-full py-24 md:py-40 px-4 bg-black/30">
        <div className="w-full px-[5%] md:px-[8%]">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter font-outfit">FAQ</h2>
            <p className="text-slate-500 text-lg font-medium">Everything you need to know about TipHive.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What is Mezo and why use it?",
                a: "Mezo is a Bitcoin economic layer. It allows for instant, low-cost transactions while being secured by the Bitcoin network. TipHive uses Mezo to ensure your tips settle in seconds, not hours."
              },
              {
                q: "What is MUSD?",
                a: "MUSD is a Bitcoin-backed stablecoin used on the Mezo network. It maintains a 1:1 value with the US Dollar, allowing creators to receive stable payments without worrying about Bitcoin's volatility."
              },
              {
                q: "How secure is TipHive for users?",
                a: "Security is our top priority. All interactions are governed by audited smart contracts on the Mezo network. Because we are non-custodial, we never have access to your private keys or funds—you remain in 100% control, protected by the security of the Bitcoin network."
              },
              {
                q: "Are there any platform fees?",
                a: "Zero. TipHive is built to support the creator economy. We don't take a percentage of your tips. 100% of the MUSD sent goes directly to the creator's contract."
              },
              {
                q: "Is it non-custodial?",
                a: "Yes. TipHive is non-custodial. We never hold your private keys. All tipping logic is handled by verified smart contracts on the Mezo network, ensuring transparency and security."
              }
            ].map((item, i) => (
              <FAQItem key={i} question={item.q} answer={item.a} delay={i * 0.15} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative w-full py-24 md:py-60 px-4 overflow-hidden">
        <div className="w-full px-[5%] md:px-[8%]">
          <div
            className="p-16 md:p-32 text-center relative overflow-hidden group rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10 space-y-12"
            >
              <h2 className="text-6xl md:text-9xl font-black text-slate-900 dark:text-white uppercase tracking-[calc(-0.04em)] font-outfit leading-none">
                Ready to join the <br /> <span className="text-[#F7931A]">New Economy?</span>
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
                <Link href="/dashboard" className="btn-primary px-16 py-6 text-2xl min-w-[300px]">
                  Get Started
                </Link>
                <Link href="/explore" className="btn-secondary px-16 py-6 text-2xl min-w-[300px]">
                  Browse Feed
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}


function PainPointCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 bg-white/50 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-red-500/30 transition-all duration-500">
      <div className="mb-6 p-4 bg-white/5 rounded-2xl inline-block group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter font-outfit">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}


function StepItem({ number, icon, title, desc, index }: { number: string, icon: React.ReactNode, title: string, desc: string, index: number }) {
  return (
    <div className="relative group">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: -20 }}
        whileInView={{ opacity: 1, scale: 1, x: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 1, delay: (index * 0.1) + 0.2, ease: "easeOut" }}
        className="absolute -top-10 -left-6 text-[10rem] font-black text-white/[0.03] select-none group-hover:text-[#F7931A]/5 transition-colors duration-500"
      >
        {number}
      </motion.div>
      <div className="relative z-10 pt-10">
        <motion.div
          initial={{ rotate: 12, scale: 0.8, opacity: 0 }}
          whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
          viewport={{ once: false }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: (index * 0.1) + 0.3
          }}
          className="mb-8 p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] inline-block group-hover:border-[#F7931A]/40 transition-all duration-500 group-hover:-rotate-6"
        >
          <div className="text-[#F7931A]">{icon}</div>
        </motion.div>
        <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter font-outfit">{title}</h3>
        <p className="text-slate-500 font-medium leading-relaxed text-lg">{desc}</p>
      </div>
    </div>
  );
}

function FAQItem({ question, answer, delay }: { question: string, answer: string, delay: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="border-b border-white/5"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 text-left flex items-center justify-between group transition-all"
      >
        <span className={`text-2xl font-black uppercase tracking-tighter font-outfit transition-colors ${isOpen ? 'text-[#F7931A]' : 'text-white'}`}>
          {question}
        </span>
        <div className={`transition-transform duration-500 ${isOpen ? 'rotate-45' : ''}`}>
          <Plus className={`w-8 h-8 ${isOpen ? 'text-[#F7931A]' : 'text-slate-600'}`} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-8 text-slate-400 text-slate-400 text-slate-400 text-lg leading-relaxed font-medium">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
