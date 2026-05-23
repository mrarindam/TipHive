'use client';

import { useDashboard } from './layout';

import { motion } from 'framer-motion';
import {
  User, DollarSign, Loader2, Copy, Check, TrendingUp, History, Globe, Wallet,
  Bitcoin, Sparkles, Share2, Heart, Calendar, Edit3, ArrowRight, Palette,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import MUSDLogo from '@/components/ui/MUSDLogo';

function shortAddress(address?: string) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function DashboardPage() {
  const { 
    creatorProfile, loading, onChainBalanceFormatted, totalOnChainBalance, 
    isAnyWithdrawing, handleWithdraw, address, totalSent, totalEarned, linkWallet 
  } = useDashboard();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  const displayAddress = address || creatorProfile?.address;

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const copyAddress = () => {
    if (!displayAddress) return;
    navigator.clipboard.writeText(displayAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyPageLink = () => {
    if (!creatorProfile?.username) return;
    navigator.clipboard.writeText(`${origin}/${creatorProfile.username}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  if (loading) return <div className="animate-pulse space-y-8"><div className="h-40 bg-white/5 rounded-3xl" /><div className="grid grid-cols-3 gap-6"><div className="h-32 bg-white/5 rounded-3xl" /><div className="h-32 bg-white/5 rounded-3xl" /><div className="h-32 bg-white/5 rounded-3xl" /></div></div>;

  return (
    <div className="space-y-12">
      {/* PAGE HEADER */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="px-4 md:px-0 space-y-3"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-1 bg-[#f7931a] rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f7931a]">Creator Suite</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.85] flex flex-wrap gap-x-4">
          <span>My</span>
          <span className="text-[#f7931a]">Hive</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
          Welcome, {creatorProfile?.name || 'Creator'}. This is your main hive for tracking earnings and managing your hive.
        </p>
      </motion.div>
      {/* CREATOR HEADER */}
      <div className="bg-[#0f0f14] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f7931a]/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-white/10 bg-black shrink-0">
            {creatorProfile?.avatar_url ? (
              <img src={creatorProfile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-full h-full p-4 text-slate-800" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{creatorProfile?.name || 'Creator'}</h1>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-bold text-[#f7931a]">@{creatorProfile?.username}</span>
              <span className="text-slate-600">•</span>
              <button onClick={copyAddress} className="text-slate-400 font-mono flex items-center gap-1 hover:text-white transition-colors">
                {shortAddress(displayAddress)} {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 relative z-10">
          {address ? (
            <button
              onClick={handleWithdraw}
              disabled={isAnyWithdrawing || totalOnChainBalance <= 0}
              className="flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-black transition-all hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnyWithdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
              Withdraw Earnings
            </button>
          ) : (
            <button
              onClick={linkWallet}
              className="flex items-center justify-center gap-2 bg-[#f7931a] text-white px-6 py-3 rounded-xl font-black transition-all hover:bg-[#e08215]"
            >
              <Wallet className="w-4 h-4" />
              Link Wallet
            </button>
          )}
          <Link href="/editprofile" className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-bold transition-all hover:bg-white/10">
            Edit Profile
          </Link>
        </div>
      </div>

      {/* LIVE PAGE LINK */}
      <div className="bg-[#f7931a]/10 border border-[#f7931a]/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-[#f7931a] animate-pulse" />
          <span className="text-slate-400">Your page is live:</span>
          <a href={`/${creatorProfile?.username}`} target="_blank" rel="noreferrer" className="text-white hover:text-[#f7931a] hover:underline font-bold transition-colors">
            {origin}/{creatorProfile?.username}
          </a>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href={`/${creatorProfile?.username}`}
            target="_blank"
            className="text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-white border border-white/10 group"
          >
            <Globe className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" /> Go to Page
          </Link>
          <button onClick={copyPageLink} className="text-[10px] font-black uppercase tracking-widest text-[#f7931a] hover:text-white transition-colors flex items-center gap-2 group">
            {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />}
            {linkCopied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* EARNINGS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          icon={<DollarSign className="w-5 h-5 text-orange-500" />}
          label="Total Earnings"
          value={totalEarned.toString()}
          subtitle="Tips + Subscriptions"
        />
        <DashboardCard
          icon={<TrendingUp className="w-5 h-5 text-green-500" />}
          label="Claimable Funds"
          value={displayAddress ? onChainBalanceFormatted : "0"}
          subtitle="Ready for Withdrawal"
          highlight={displayAddress ? true : false}
        />
        <DashboardCard
          icon={<History className="w-5 h-5 text-blue-400" />}
          label="Sent By You"
          value={displayAddress ? totalSent.toString() : "0"}
          subtitle="Your Contributions"
        />
      </div>

      {/* FEATURE SHOWCASE — what you can do with TipHive */}
      <FeatureShowcase username={creatorProfile?.username} />
    </div>
  );
}

interface DashboardCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
  highlight?: boolean;
}

function DashboardCard({ icon, label, value, subtitle, highlight }: DashboardCardProps) {
  return (
    <div className={`bg-[#0f0f14] border rounded-[2rem] p-8 relative overflow-hidden group transition-all hover:scale-[1.02] ${highlight ? 'border-[#f7931a]/30 shadow-[0_0_40px_rgba(247,147,26,0.1)]' : 'border-white/5 shadow-xl'}`}>
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
        {icon}
      </div>

      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">{label}</p>

      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-white">{value}</h3>
        <MUSDLogo className="w-8 h-8" />
      </div>

      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{subtitle}</p>
    </div>
  );
}

interface Feature {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  desc: string;
  href: string;
  cta: string;
  accent: string;
  glow: string;
  external?: boolean;
  span?: string;
}

function FeatureShowcase({ username }: { username?: string }) {
  const features: Feature[] = [
    {
      icon: <Bitcoin className="w-7 h-7" />,
      eyebrow: 'DeFi · BTC-Backed',
      title: 'Borrow MUSD against your BTC',
      desc: 'Lock BTC, mint USD-pegged MUSD instantly. No interest, no expiry — pay creators, spend on Mezo, or earn yield with what you borrow.',
      href: '/dashboard/borrow-musd',
      cta: 'Open Vault',
      accent: '#f7931a',
      glow: 'rgba(247,147,26,0.22)',
      span: 'md:col-span-2 lg:col-span-2',
    },
    {
      icon: <Palette className="w-6 h-6" />,
      eyebrow: 'Customize',
      title: 'Build your own toolkit',
      desc: 'Design your creator page your way — layouts, colors, sections.',
      href: '/dashboard/visual-toolkit',
      cta: 'Customize Page',
      accent: '#a855f7',
      glow: 'rgba(168,85,247,0.20)',
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      eyebrow: 'Share Anywhere',
      title: 'One link, infinite reach',
      desc: 'Drop your TipHive page on socials and start collecting tips, subs, and support — instantly.',
      href: username ? `/${username}` : '/',
      cta: 'View Public Page',
      external: true,
      accent: '#06b6d4',
      glow: 'rgba(6,182,212,0.20)',
    },
    {
      icon: <Heart className="w-6 h-6" />,
      eyebrow: 'Receive',
      title: 'Get tipped instantly',
      desc: 'Fans send BTC, MUSD or supported tokens straight to your wallet.',
      href: '/dashboard/tipcircle',
      cta: 'Open Tip Circles',
      accent: '#ec4899',
      glow: 'rgba(236,72,153,0.20)',
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      eyebrow: 'Recurring',
      title: 'Run subscriptions',
      desc: 'Set monthly tiers — earn on autopilot, every cycle.',
      href: '/dashboard/subscriptions',
      cta: 'Manage Tiers',
      accent: '#3b82f6',
      glow: 'rgba(59,130,246,0.20)',
    },
    {
      icon: <Edit3 className="w-6 h-6" />,
      eyebrow: 'Create',
      title: 'Post & publish',
      desc: 'Behind-the-scenes drops, exclusive posts, paywalled content.',
      href: '/dashboard/posts',
      cta: 'Start Posting',
      accent: '#eab308',
      glow: 'rgba(234,179,8,0.20)',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      eyebrow: 'Insights',
      title: 'Track your earnings',
      desc: 'Trends, top supporters, growth — visualised in one place.',
      href: '/dashboard/earninganalysis',
      cta: 'View Analytics',
      accent: '#22c55e',
      glow: 'rgba(34,197,94,0.20)',
    },
  ];

  return (
    <section className="relative pt-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.4 }}
        className="mb-8 space-y-3"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-[#f7931a]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f7931a]">Your Toolkit</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-[0.9]">
          Everything you need to{' '}
          <span className="bg-gradient-to-r from-[#f7931a] via-[#ffae42] to-[#ffd166] bg-clip-text text-transparent">
            monetize
          </span>
          .
        </h2>
        <p className="text-slate-400 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
          One link, one wallet, infinite ways to earn. Borrow against BTC, post content, collect tips, run subscriptions — all from your Hive.
        </p>
      </motion.div>

      {/* Cards grid — hero spans 2 cols on lg */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f, i) => (
          <FeatureCard key={i} {...f} delay={i * 0.06} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  icon, eyebrow, title, desc, href, cta, accent, glow, external, span, delay,
}: Feature & { delay: number }) {
  const Inner = (
    <>
      {/* glow blob */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: glow }}
      />
      {/* subtle accent bar at top */}
      <div
        className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
          style={{
            background: `${accent}1f`,
            color: accent,
            border: `1px solid ${accent}55`,
            boxShadow: `0 0 0 0 ${accent}00`,
          }}
        >
          {icon}
        </div>
        <div
          className="text-[10px] font-black uppercase tracking-[0.25em] mb-2"
          style={{ color: accent }}
        >
          {eyebrow}
        </div>
        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight mb-2">
          {title}
        </h3>
        <p className="text-slate-400 text-sm font-medium leading-relaxed mb-5 flex-1">
          {desc}
        </p>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
          <span>{cta}</span>
          <ArrowRight
            size={12}
            className="transition-transform duration-300 group-hover:translate-x-1"
            style={{ color: accent }}
          />
        </div>
      </div>
    </>
  );

  const cardClass =
    'group relative block rounded-3xl bg-[#0f0f14] border border-white/5 p-6 md:p-7 overflow-hidden transition-all duration-300 hover:border-white/15 hover:-translate-y-1 hover:shadow-2xl h-full';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      className={span}
    >
      {external ? (
        <a href={href} target="_blank" rel="noreferrer" className={cardClass}>
          {Inner}
        </a>
      ) : (
        <Link href={href} className={cardClass}>
          {Inner}
        </Link>
      )}
    </motion.div>
  );
}
