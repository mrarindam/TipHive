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

export default function Home() {
  const containerRef = useRef(null);

  return (
    <div ref={containerRef} className="relative w-full bg-[#050505] selection:bg-[#F7931A]/30">
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#F7931A]/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[25%] h-[25%] bg-purple-600/5 blur-[100px] rounded-full animate-float" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] left-[15%] opacity-20 hidden lg:block"
          >
            <Bitcoin className="w-16 h-16 text-[#F7931A]" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 40, 0], rotate: [0, -15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[30%] right-[12%] opacity-20 hidden lg:block"
          >
            <MUSDLogo className="w-14 h-14" />
          </motion.div>
        </div>

        <div className="w-full px-[5%] md:px-[8%] relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/[0.03] border border-white/5 text-slate-300 text-xs font-black mb-12 tracking-[0.3em] uppercase backdrop-blur-xl"
          >
            <Star className="w-4 h-4 text-[#F7931A] fill-[#F7931A]" />
            New Era of Digital Gratitude
            <Star className="w-4 h-4 text-[#F7931A] fill-[#F7931A]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[clamp(3.8rem,18vw,9.5rem)] font-black text-white tracking-tighter mb-6 leading-[0.75] font-outfit"
          >
            The Bitcoin <br />
            <span className="text-[#F7931A]">
              Native Economy.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-4xl mx-auto text-[clamp(1.1rem,4.5vw,1.6rem)] text-slate-300 mb-12 md:mb-16 leading-tight font-medium px-6"
          >
            Empower your favorite creators with <span className="text-white font-bold">instant, fee-less</span> Bitcoin-native tips on the Mezo L2 network. Pure value, zero friction.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 md:gap-10 px-8"
          >
            <Link href="/discover" className="btn-primary group w-full sm:w-auto py-5 md:py-6">
              <span className="relative z-10 flex items-center justify-center gap-3 text-lg font-black uppercase tracking-tighter">
                Explore Creators
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>
            <Link href="/register" className="btn-secondary group w-full sm:w-auto py-5 md:py-6 text-lg font-black uppercase tracking-tighter">
              <span className="relative z-10 flex items-center justify-center gap-3">
                Join as Creator
                <Rocket className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </span>
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
                Traditional <br /> Tipping is <br /> <span className="text-slate-600 line-through">Broken.</span>
              </h2>
              <div className="space-y-4 md:space-y-6 text-base md:text-lg text-slate-400 font-medium">
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
      <section className="relative w-full py-24 md:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(247,147,26,0.05),transparent_70%)]" />
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
              Welcome to the <br /> <span className="text-glow">TipHive Revolution.</span>
            </h2>
            <p className="text-xl text-slate-400 font-medium leading-relaxed">
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
                <p className="text-xl text-slate-400 leading-relaxed max-w-lg">
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
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#F7931A]/20 blur-[100px] rounded-full" />
                  
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
                      className="w-full py-4 bg-white text-black font-black text-center rounded-2xl uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Zap className="w-5 h-5" /> Send Tip Now
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
                <p className="text-xl text-slate-400 leading-relaxed max-w-lg">
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
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-purple-600/20 blur-[100px] rounded-full" />
                  
                  {/* Animated Subscription UI */}
                  <div className="relative z-10 w-[80%] max-w-sm bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 flex items-center justify-between">
                      <div className="text-white font-black text-xl uppercase tracking-wider">Premium Tier</div>
                      <Star className="w-6 h-6 text-white fill-white/50" />
                    </div>
                    <div className="p-6 flex flex-col gap-6">
                      <div className="flex items-end gap-2">
                        <div className="text-5xl font-black text-white tracking-tighter">10.00</div>
                        <div className="text-slate-400 font-medium mb-1">MUSD / mo</div>
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
                        className="w-full py-4 bg-purple-600 hover:bg-purple-500 transition-colors text-white font-black text-center rounded-2xl uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer mt-2"
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
            <div className="hidden lg:block h-px flex-1 bg-gradient-to-r from-[#F7931A]/20 to-transparent mx-10 mb-6" />
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <StepItem 
              number="01" 
              icon={<Wallet className="w-10 h-10" />}
              title="Connect Identity" 
              desc="Link your Mezo wallet. Your address is your unique profile across the Hive."
            />
            <StepItem 
              number="02" 
              icon={<LayoutDashboard className="w-10 h-10" />}
              title="Set Up Page" 
              desc="Customize your creator dashboard and share your tipping link with your fans."
            />
            <StepItem 
              number="03" 
              icon={<Gem className="w-10 h-10" />}
              title="Earn in MUSD" 
              desc="Receive Bitcoin-backed stablecoin tips instantly and withdraw anytime."
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative w-full py-24 md:py-40 px-4 bg-black/30">
        <div className="w-full px-[5%] md:px-[8%]">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter font-outfit">Deep Dive</h2>
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
                q: "Are there any platform fees?",
                a: "Zero. TipHive is built to support the creator economy. We don't take a percentage of your tips. 100% of the MUSD sent goes directly to the creator's contract."
              },
              {
                q: "Is it non-custodial?",
                a: "Yes. TipHive is non-custodial. We never hold your private keys. All tipping logic is handled by verified smart contracts on the Mezo network, ensuring transparency and security."
              }
            ].map((item, i) => (
              <FAQItem key={i} question={item.q} answer={item.a} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative w-full py-24 md:py-60 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[#F7931A]/10 blur-[150px] rounded-full translate-y-1/2 scale-150" />
        <div className="w-full px-[5%] md:px-[8%]">
          <div className="glass-card p-16 md:p-32 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F7931A]/10 via-transparent to-blue-500/10 opacity-50" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10 space-y-12"
            >
              <h2 className="text-6xl md:text-9xl font-black text-white uppercase tracking-[calc(-0.04em)] font-outfit leading-none">
                Ready to join the <br /> <span className="text-[#F7931A]">New Economy?</span>
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
                <Link href="/register" className="btn-primary px-16 py-6 text-2xl min-w-[300px]">
                  Get Started
                </Link>
                <Link href="/discover" className="btn-secondary px-16 py-6 text-2xl min-w-[300px]">
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
    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-red-500/30 transition-all duration-500">
      <div className="mb-6 p-4 bg-white/5 rounded-2xl inline-block group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter font-outfit">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}


function StepItem({ number, icon, title, desc }: { number: string, icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="relative group">
      <div className="absolute -top-10 -left-6 text-[10rem] font-black text-white/[0.03] select-none group-hover:text-[#F7931A]/5 transition-colors duration-500">
        {number}
      </div>
      <div className="relative z-10 pt-10">
        <div className="mb-8 p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] inline-block group-hover:border-[#F7931A]/40 transition-all duration-500 group-hover:-rotate-6">
          <div className="text-[#F7931A]">{icon}</div>
        </div>
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
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
            <div className="pb-8 text-slate-400 text-lg leading-relaxed font-medium">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
