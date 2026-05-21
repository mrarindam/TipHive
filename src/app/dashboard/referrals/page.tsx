'use client';

import { useDashboard } from '../layout';
import { motion } from 'framer-motion';
import { 
  Users, Gift, Copy, Check, Share2, 
  Send, MessageCircle, ArrowRight, TrendingUp, 
  Star, Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ReferredUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  created_at: string;
}

export default function ReferralsPage() {
  const { creatorProfile, loading, user, getAccessToken } = useDashboard();
  const [copied, setCopied] = useState(false);
  const [referralData, setReferralData] = useState<{ referrals: ReferredUser[], totalCount: number }>({ referrals: [], totalCount: 0 });
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!user?.id) return;
      try {
        const token = await getAccessToken();
        const res = await fetch('/api/referrals', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setReferralData(data);
      } catch (err) {
        console.error('Failed to fetch referrals:', err);
      } finally {
        setIsStatsLoading(false);
      }
    };

    if (user?.id) fetchReferrals();
  }, [user?.id, getAccessToken]);

  const referralCode = creatorProfile?.social_links?.referral_code || creatorProfile?.referral_code || '';
  const referralLink = `${origin}/onboarding?ref=${referralCode}`;

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    const text = `Join me on TipHive and start earning from your content! Use my link to join the hive: ${referralLink}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) return (
    <div className="animate-pulse space-y-8">
      <div className="h-40 bg-white/5 rounded-[2.5rem]" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-white/5 rounded-3xl" />
        <div className="h-32 bg-white/5 rounded-3xl" />
        <div className="h-32 bg-white/5 rounded-3xl" />
      </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      {/* HEADER SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-1 bg-[#f7931a] rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f7931a]">Grow the Hive</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.85] mb-6">
          Invite Your <br />
          <span className="text-[#f7931a]">Hive Members</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
          Share your unique referral link and help others join the creator economy on TipHive. 
          Build your community and earn rewards together.
        </p>

        {/* Decorative element */}
        <div className="absolute -top-10 -right-20 w-64 h-64 bg-[#f7931a]/10 blur-[100px] rounded-full pointer-events-none" />
      </motion.div>

      {/* REFERRAL LINK CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-[#0f0f14] border border-white/5 rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-0 right-0 w-96 h-96 bg-[#f7931a]/20 blur-[100px] rounded-full" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tight">Your Referral Link</h2>
              <p className="text-slate-500 font-medium">Copy this link and send it to your friends.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-4">
              <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-4 group transition-all focus-within:border-[#f7931a]/50">
                <Gift className="w-5 h-5 text-[#f7931a]" />
                <span className="text-white font-bold truncate flex-1">
                  {referralLink}
                </span>
              </div>
              <button
                onClick={copyLink}
                className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black transition-all ${
                  copied 
                    ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]' 
                    : 'bg-[#f7931a] text-white hover:bg-[#e08215] shadow-[0_15px_30px_rgba(247,147,26,0.2)]'
                }`}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500 mr-2">Share via:</span>
              <button onClick={shareOnTwitter} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-400/30 transition-all group">
                <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
              <button className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500/30 transition-all group">
                <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
              <button className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-green-500 hover:border-green-500/30 transition-all group">
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <div className="w-64 h-64 rounded-[3rem] bg-[#f7931a]/10 border border-[#f7931a]/20 flex items-center justify-center relative z-10 overflow-hidden">
                <Image src="/logo.png" alt="Logo" width={120} height={120} className="opacity-80 grayscale brightness-200" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#f7931a]/5 to-transparent animate-pulse" />
              </div>
              {/* Decorative rings */}
              <div className="absolute -inset-4 border border-white/5 rounded-[3.5rem] animate-[spin_20s_linear_infinite]" />
              <div className="absolute -inset-8 border border-white/5 rounded-[4rem] animate-[spin_30s_linear_infinite_reverse]" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Users className="w-6 h-6 text-orange-500" />}
          label="Total Referrals"
          value={isStatsLoading ? "..." : referralData.totalCount.toString()}
          description="Members joined via link"
          delay={0.2}
        />
        <StatCard
          icon={<Star className="w-6 h-6 text-purple-500" />}
          label="Reward Level"
          value="Bronze"
          description="Refer 5 more for Silver"
          delay={0.3}
        />
        <StatCard
          icon={<Zap className="w-6 h-6 text-blue-500" />}
          label="Potential Earnings"
          value="Soon"
          description="Upcoming rewards program"
          delay={0.4}
        />
      </div>

      {/* RECENT REFERRALS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-[#0f0f14] border border-white/5 rounded-[2.5rem] overflow-hidden"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#f7931a]" />
            </div>
            <h3 className="text-xl font-black text-white">Recent Joins</h3>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {referralData.totalCount} Members
          </span>
        </div>

        <div className="p-4">
          {isStatsLoading ? (
             <div className="p-8 space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />)}
             </div>
          ) : referralData.referrals.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {referralData.referrals.map((ref) => (
                <div key={ref.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-black">
                      {ref.avatar_url ? (
                        <img src={ref.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-900 font-bold">
                          {ref.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-white font-bold group-hover:text-[#f7931a] transition-colors">{ref.display_name}</h4>
                      <p className="text-slate-500 text-xs font-medium">@{ref.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Joined</p>
                    <p className="text-slate-600 text-[10px]">{new Date(ref.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Share2 className="w-10 h-10 text-slate-800" />
              </div>
              <h3 className="text-xl font-bold text-white">No referrals yet</h3>
              <p className="text-slate-500 max-w-xs">Start sharing your link to grow your community and unlock rewards.</p>
              <button onClick={copyLink} className="flex items-center gap-2 text-[#f7931a] font-black uppercase tracking-widest text-xs hover:text-white transition-colors">
                Share Link <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ icon, label, value, description, delay }: { icon: React.ReactNode, label: string, value: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#0f0f14] border border-white/5 rounded-[2.5rem] p-8 hover:border-[#f7931a]/30 transition-all group shadow-xl"
    >
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{label}</p>
      <h3 className="text-4xl font-black text-white tracking-tighter mb-2">{value}</h3>
      <p className="text-xs font-medium text-slate-600">{description}</p>
    </motion.div>
  );
}
