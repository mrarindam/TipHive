'use client';

import { useDashboard } from './layout';

import { motion } from 'framer-motion';
import { User, DollarSign, Loader2, Copy, Check, TrendingUp, History, Globe, Wallet } from 'lucide-react';
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
