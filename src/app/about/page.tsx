'use client';

import { motion } from 'framer-motion';
import { 
  Rocket, Zap, Shield, Heart, Users, Globe, Bitcoin, 
  ArrowRight, Sparkles, Target, Eye
} from 'lucide-react';
import Link from 'next/link';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};



export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: 'Trustless & Secure',
      description: 'Every tip flows through audited smart contracts on the Mezo Network. No middlemen, no hidden fees — just pure, transparent Bitcoin-backed transfers.',
      color: '#F7931A'
    },
    {
      icon: Zap,
      title: 'Instant Payouts',
      description: 'Creators receive tips in real-time via MUSD. No waiting periods, no minimum thresholds. Your support reaches creators the moment you click.',
      color: '#FFAB40'
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'We believe creators deserve a fair, open platform. TipHive is built for the community — by someone who understands the creator economy.',
      color: '#F7931A'
    },
    {
      icon: Globe,
      title: 'Borderless Support',
      description: 'Whether you are in Tokyo, Lagos, or Buenos Aires — anyone with a wallet can tip any creator. No banks, no borders, no barriers.',
      color: '#FFAB40'
    },
  ];

  const stats = [
    { label: 'Built On', value: 'Mezo L2', icon: Bitcoin },
    { label: 'Currency', value: 'MUSD', icon: Zap },
    { label: 'Transaction Fees', value: 'Near Zero', icon: Sparkles },
    { label: 'Settlement', value: 'Instant', icon: Rocket },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F7931A]/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#F7931A]/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#F7931A]/10 blur-[100px] rounded-full" />

        <div className="w-full px-[5%] md:px-[8%] relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-[#F7931A]/10 border border-[#F7931A]/20 rounded-full px-5 py-2 mb-8"
            >
              <Heart className="w-4 h-4 text-[#F7931A] fill-[#F7931A]" />
              <span className="text-sm font-bold text-[#F7931A]">Our Story</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 font-outfit uppercase tracking-tighter leading-[0.9]">
              Empowering Creators
              <br />
              <span className="text-[#F7931A]">With Bitcoin</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
              TipHive is a next-generation tipping platform built on the Mezo Network. 
              We make it effortless for fans to support their favorite creators using 
              Bitcoin-backed MUSD — instantly, securely, and without borders.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 relative">
        <div className="w-full px-[5%] md:px-[8%]">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp}>
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/5 rounded-full px-4 py-1.5 mb-6">
                <Target className="w-3.5 h-3.5 text-[#F7931A]" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Our Mission</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 font-outfit uppercase tracking-tighter">
                Tips Should Be <span className="text-[#F7931A]">Simple</span>
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed mb-6">
                The creator economy is broken. Platforms take up to 30% of tips. Payouts take weeks. 
                Cross-border payments are a nightmare. We built TipHive to fix all of that.
              </p>
              <p className="text-lg text-slate-400 leading-relaxed mb-8">
                By leveraging the Mezo Network&apos;s Bitcoin L2 infrastructure and MUSD stablecoin, 
                we created a system where tips are instant, fees are near-zero, and creators keep 
                what they earn. It&apos;s that simple.
              </p>
              <Link 
                href="/discover" 
                className="btn-primary px-8 py-3 inline-flex items-center gap-2"
              >
                Discover Creators <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div 
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="glass-card p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F7931A]/10 blur-[60px] rounded-full" />
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-[#F7931A]/10 rounded-2xl flex items-center justify-center">
                    <Eye className="w-7 h-7 text-[#F7931A]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white font-outfit uppercase tracking-tight">Our Vision</h3>
                    <p className="text-sm text-slate-500 font-bold">Where we&apos;re heading</p>
                  </div>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  We envision a world where every creator — from indie artists to open-source developers — 
                  can receive direct, instant support from their audience without platform lock-in or 
                  excessive fees. TipHive is the first step toward a fully decentralized creator economy 
                  powered by Bitcoin.
                </p>
                <div className="mt-6 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F7931A] flex items-center justify-center">
                      <Rocket className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-white">Building the future of creator support</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F7931A]/3 to-transparent" />
        <div className="w-full px-[5%] md:px-[8%] relative z-10">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 font-outfit uppercase tracking-tighter">
              What We <span className="text-[#F7931A]">Stand For</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Every decision we make is guided by these core principles.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-card p-8 group hover:border-[#F7931A]/30 transition-all"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${value.color}15` }}
                  >
                    <value.icon className="w-7 h-7" style={{ color: value.color }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white mb-2 font-outfit tracking-tight group-hover:text-[#F7931A] transition-colors">
                      {value.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="w-full px-[5%] md:px-[8%]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="glass-card p-6 text-center group hover:border-[#F7931A]/30 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F7931A]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 text-[#F7931A]" />
                </div>
                <p className="text-2xl font-black text-white font-outfit tracking-tight mb-1">{stat.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="w-full px-[5%] md:px-[8%]">
          <motion.div 
            {...fadeUp}
            className="glass-card p-12 text-center relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#F7931A]/10 blur-[80px] rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#F7931A]/5 blur-[80px] rounded-full" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 font-outfit uppercase tracking-tighter">
                Ready to <span className="text-[#F7931A]">Get Started?</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
                Join TipHive today and start receiving Bitcoin-backed tips from your audience worldwide.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard" className="btn-primary px-10 py-4 text-lg inline-flex items-center justify-center gap-2">
                  <Rocket className="w-5 h-5" /> Become a Creator
                </Link>
                <Link href="/discover" className="btn-secondary px-10 py-4 text-lg inline-flex items-center justify-center gap-2">
                  Explore Creators
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
