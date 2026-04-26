'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Bitcoin, ShieldCheck, Zap, Rocket, Globe, Heart, Star, CheckCircle2, Wallet, Plus } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative bg-[#050505] overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#F7931A]/10 blur-[150px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] rounded-full -z-10" />

      {/* Floating Icons Decor */}
      <div className="hidden lg:block">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 left-[10%] p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
        >
          <Bitcoin className="w-8 h-8 text-[#F7931A]" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-80 right-[15%] p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
        >
          <Heart className="w-8 h-8 text-red-500" />
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-40 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-bold mb-10 tracking-widest uppercase"
          >
            <Star className="w-4 h-4 text-[#F7931A] fill-[#F7931A]" />
            The Future of Creator Support
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-9xl font-black text-white tracking-tighter mb-8 font-outfit leading-[0.9]"
          >
            Support in <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7931A] via-[#FFAB40] to-[#F7931A] bg-[length:200%_auto] animate-gradient">
              Bitcoin.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto text-xl md:text-2xl text-slate-400 mb-14 leading-relaxed font-medium"
          >
            The world&apos;s first Bitcoin-native tipping platform. Built on Mezo for instant settlement, zero fees, and global reach.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/discover" className="btn-primary px-12 py-5 text-xl flex items-center gap-3 group">
              Start Tipping
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link href="/register" className="btn-secondary px-12 py-5 text-xl">
              Join as Creator
            </Link>
          </motion.div>
        </div>

        {/* Stats Ticker */}
        <div className="border-y border-white/5 py-12 mb-40 overflow-hidden relative w-screen -ml-[max(1rem,calc((100vw-100%)/2))] bg-white/[0.02]">
          <div className="flex items-center w-max animate-marquee">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-10 md:gap-24 px-12">
                <StatItem label="Active Creators" value="1.2k+" />
                <StatItem label="Total Tipped" value="$450k+" />
                <StatItem label="Settlement" value="Instant" />
                <StatItem label="Network" value="Mezo L2" />
                <StatItem label="Platform Fee" value="0%" />
                <StatItem label="Security" value="Bitcoin" />
                <StatItem label="Global Reach" value="24/7" />
                <StatItem label="Asset" value="MUSD" />
                <StatItem label="Payouts" value="Direct" />
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="space-y-20">
          <div className="text-center">
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-4 font-outfit">How it works</h2>
            <p className="text-slate-500 text-lg">Join the economy in three simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              icon={<Wallet className="w-10 h-10 text-[#F7931A]" />}
              title="Connect Wallet"
              description="Connect your Mezo-compatible wallet in one click to get started."
            />
            <StepCard
              number="02"
              icon={<Rocket className="w-10 h-10 text-blue-500" />}
              title="Create Profile"
              description="Set up your unique creator profile and share your link with fans."
            />
            <StepCard
              number="03"
              icon={<Bitcoin className="w-10 h-10 text-green-500" />}
              title="Receive Tips"
              description="Get tipped in MUSD and withdraw to your wallet instantly."
            />
          </div>
        </div>

        {/* Features Showcase */}
        <div className="mt-60 grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <h2 className="text-6xl font-black text-white uppercase tracking-tighter leading-none font-outfit">
              Built for the <br />
              <span className="text-[#F7931A]">Next Billion</span> <br />
              Users.
            </h2>
            <div className="space-y-6">
              <FeatureItem icon={<Zap />} title="Lightning Fast" description="Powered by Mezo's high-performance L2 for sub-second transactions." />
              <FeatureItem icon={<ShieldCheck />} title="Non-Custodial" description="You own your keys. You own your tips. No middleman involved." />
              <FeatureItem icon={<Globe />} title="Global Scale" description="Support anyone, anywhere in the world with the power of Bitcoin." />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#F7931A]/20 to-transparent blur-[100px] rounded-full" />
            <div className="glass-card p-12 relative overflow-hidden border-2 border-white/10 group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Bitcoin className="w-40 h-40" />
              </div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-[#F7931A]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tighter">Verified Creator</h3>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">On-Chain Identity</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-4 bg-white/5 rounded-full w-full" />
                <div className="h-4 bg-white/5 rounded-full w-[80%]" />
                <div className="h-4 bg-white/5 rounded-full w-[60%]" />
              </div>
              <div className="mt-12 flex justify-between items-end">
                <div>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Total Tips</p>
                  <p className="text-4xl font-black text-white tracking-tighter">12,450 MUSD</p>
                </div>
                <div className="px-6 py-2 bg-[#F7931A] rounded-full text-black font-black text-sm uppercase">
                  Live
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 py-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-4 font-outfit">Common Questions</h2>
          <p className="text-slate-500 text-lg">Everything you need to know about TipHive.</p>
        </motion.div>

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
              q: "How do creators withdraw their funds?",
              a: "Creators can withdraw their accumulated tips at any time via their Profile Dashboard. The funds are sent directly to their connected Mezo wallet instantly."
            },
            {
              q: "Is TipHive secure?",
              a: "Yes. TipHive is non-custodial. We never hold your private keys. All tipping logic is handled by verified smart contracts on the Mezo network, ensuring transparency and security."
            }
          ].map((item, i) => (
            <FAQItem key={i} question={item.q} answer={item.a} delay={i * 0.1} />
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-[#F7931A] py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-6xl md:text-7xl font-black text-black uppercase tracking-tighter mb-8 font-outfit">
            Ready to join the <br /> economy?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/register" className="bg-black text-white px-12 py-5 text-xl font-black rounded-2xl hover:scale-105 transition-transform uppercase tracking-tighter">
              Get Started Now
            </Link>
            <Link href="/discover" className="border-4 border-black text-black px-12 py-5 text-xl font-black rounded-2xl hover:bg-black hover:text-[#F7931A] transition-all uppercase tracking-tighter">
              Explore Creators
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-10">
      <span className="text-slate-500 text-xs font-black uppercase tracking-[0.3em]">{label}</span>
      <span className="text-3xl font-black text-white tracking-tighter">{value}</span>
    </div>
  );
}

function StepCard({ number, icon, title, description }: { number: string, icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-card p-10 relative group hover:bg-white/10 transition-all overflow-hidden">
      <div className="absolute -top-4 -right-4 text-8xl font-black text-white/5 select-none">{number}</div>
      <div className="mb-8 relative z-10 p-4 bg-white/5 rounded-2xl inline-block group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter relative z-10">{title}</h3>
      <p className="text-slate-400 font-medium leading-relaxed relative z-10">{description}</p>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="p-3 bg-white/5 rounded-xl text-[#F7931A]">
        {icon}
      </div>
      <div>
        <h4 className="text-xl font-bold text-white mb-1 uppercase tracking-tighter">{title}</h4>
        <p className="text-slate-500 font-medium">{description}</p>
      </div>
    </div>
  );
}

function FAQItem({ question, answer, delay }: { question: string, answer: string, delay: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="glass-card overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <span className="text-xl font-bold text-white uppercase tracking-tighter font-outfit">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          className="text-[#F7931A]"
        >
          <Plus className="w-6 h-6" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5"
          >
            <div className="p-6 text-slate-400 leading-relaxed font-medium">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
