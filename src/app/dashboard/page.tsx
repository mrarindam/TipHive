'use client';

import { useDashboard } from './layout';

import { User, CheckCircle2, DollarSign, Loader2, Copy, Check, TrendingUp, History, Globe } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import MUSDLogo from '@/components/ui/MUSDLogo';

function shortAddress(address?: string) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function DashboardPage() {
  const { creatorProfile, loading, onChainBalanceFormatted, totalOnChainBalance, isAnyWithdrawing, handleWithdraw, address, totalSent } = useDashboard();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
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
    <div className="space-y-8">
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
              <span className="text-[10px] font-black uppercase tracking-widest text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verified on Mezo
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-bold text-[#f7931a]">@{creatorProfile?.username}</span>
              <span className="text-slate-600">•</span>
              <button onClick={copyAddress} className="text-slate-400 font-mono flex items-center gap-1 hover:text-white transition-colors">
                {shortAddress(address)} {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 relative z-10">
          <button
            onClick={handleWithdraw}
            disabled={isAnyWithdrawing || totalOnChainBalance <= 0}
            className="flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-black transition-all hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnyWithdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
            Withdraw Earnings
          </button>
          <Link href="/profile" className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-bold transition-all hover:bg-white/10">
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
          value={creatorProfile?.total_earned?.toString() || "0"} 
          subtitle="Lifetime Combined"
        />
        <DashboardCard 
          icon={<TrendingUp className="w-5 h-5 text-green-500" />}
          label="Claimable Funds" 
          value={onChainBalanceFormatted} 
          subtitle="Tips + Subscriptions"
          highlight={true}
        />
        <DashboardCard 
          icon={<History className="w-5 h-5 text-blue-400" />}
          label="Sent By You" 
          value={totalSent.toString()} 
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
