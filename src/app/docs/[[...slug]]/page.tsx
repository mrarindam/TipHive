'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  ChevronRight, 
  ArrowRight,
  Search,
  Menu,
  X,
  ChevronLeft,
  Info,
  AlertCircle,
  Check,
  Lock,
  DollarSign,
  Shield,
  Code,
  Database
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// Icons
const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
);

// Types
type Section = {
  id: string;
  title: string;
  content: React.ReactNode;
  category: 'Welcome' | 'Creators' | 'Fans' | 'Technical' | 'Architecture';
};

// Components
const Callout = ({ type, title, children }: { type: 'info' | 'warning' | 'check' | 'success'; title: string; children: React.ReactNode }) => {
  const styles = {
    info: { icon: <Info className="w-5 h-5" />, bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
    warning: { icon: <AlertCircle className="w-5 h-5" />, bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400' },
    check: { icon: <Check className="w-5 h-5" />, bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400' },
    success: { icon: <Check className="w-5 h-5" />, bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  };

  return (
    <div className={`p-6 rounded-2xl border ${styles[type].border} ${styles[type].bg} my-8`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={styles[type].text}>{styles[type].icon}</div>
        <h4 className={`font-black uppercase tracking-widest text-xs ${styles[type].text}`}>{title}</h4>
      </div>
      <div className="text-slate-300 leading-relaxed text-sm font-medium">
        {children}
      </div>
    </div>
  );
};

const Step = ({ number, title, children }: { number: string; title: string; children: React.ReactNode }) => (
  <div className="relative pl-12 pb-12 last:pb-0">
    <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-white/5 last:hidden" />
    <div className="absolute left-0 top-0 w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center z-10">
      <span className="text-[10px] font-black text-[#F7931A] tracking-tighter">{number}</span>
    </div>
    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">{title}</h3>
    <div className="text-slate-400 leading-relaxed font-medium">{children}</div>
  </div>
);

const FeatureItem = ({ title, desc }: { title: string; desc: string }) => (
  <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-[#F7931A]/30 transition-all group">
    <h4 className="font-black text-white uppercase tracking-widest text-[10px] mb-2 group-hover:text-[#F7931A] transition-colors">{title}</h4>
    <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
  </div>
);

const FeatureCard = ({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) => (
  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/8 transition-all">
    <div className="flex items-start gap-4">
      <Icon className="w-6 h-6 text-[#F7931A] shrink-0 mt-1" />
      <div>
        <h4 className="font-bold text-white mb-2">{title}</h4>
        <p className="text-sm text-slate-400">{desc}</p>
      </div>
    </div>
  </div>
);

export default function DocsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string[] | undefined;
  const urlSection = slug ? slug[0] : 'welcome';

  const [activeSection, setActiveSection] = useState('welcome');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const handleSectionChange = useCallback((id: string) => {
    setActiveSection(id);
    router.push(`/docs/${id === 'welcome' ? '' : id}`);
    setIsSidebarOpen(false);
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }, [router]);

  const sections: Section[] = useMemo(() => [
    {
      id: 'welcome',
      category: 'Welcome',
      title: 'Welcome',
      content: (
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-[#F7931A]/20 border border-[#F7931A]/40">
              <span className="text-[#F7931A] text-sm font-bold">🚀 Welcome to TipHive</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black font-outfit tracking-tighter uppercase">
              The Future of<br />Creator<span className="text-[#F7931A]"> Economics</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed font-medium">
              Direct support. Zero platform fees. Bitcoin-native tipping for creators, powered by Mezo L2. Say goodbye to middlemen and hello to true creator ownership.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 pt-8">
            <div className="p-6 bg-gradient-to-br from-[#F7931A]/20 to-[#F7931A]/5 border border-[#F7931A]/30 rounded-xl">
              <Zap className="w-8 h-8 text-[#F7931A] mb-3" />
              <h3 className="font-black text-white mb-2 uppercase text-sm">Instant Settlements</h3>
              <p className="text-xs text-slate-400">Get paid in seconds, not weeks</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 rounded-xl">
              <DollarSign className="w-8 h-8 text-cyan-400 mb-3" />
              <h3 className="font-black text-white mb-2 uppercase text-sm">0% Platform Fees</h3>
              <p className="text-xs text-slate-400">Keep 100% of your earnings</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 rounded-xl">
              <Lock className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="font-black text-white mb-2 uppercase text-sm">Full Ownership</h3>
              <p className="text-xs text-slate-400">Self-custodial & permissionless</p>
            </div>
          </div>

          <div className="flex gap-4 pt-8">
            <button onClick={() => handleSectionChange('introduction')} className="px-6 py-3 bg-[#F7931A] text-black font-black rounded-xl hover:bg-[#F7931A]/90 transition-all flex items-center gap-2 uppercase text-xs tracking-widest">
              Read Docs <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'introduction',
      category: 'Welcome',
      title: 'What is TipHive?',
      content: (
        <div className="space-y-12">
          <section className="space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-[#F7931A]/20 border border-[#F7931A]/40">
              <span className="text-[#F7931A] text-sm font-bold">Introduction</span>
            </div>
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase">
              Reimagining Creator<br />Monetization
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-3xl font-medium">
              TipHive is a Bitcoin-native tipping and subscription platform that enables creators to monetize directly from their audience. Built on Mezo L2, it combines the security of Bitcoin with the speed and affordability of modern Layer 2 technology.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">The Problem We Solve</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 border border-red-500/30 bg-red-500/5 rounded-2xl">
                <h4 className="text-red-400 font-black uppercase tracking-widest text-xs mb-4">❌ Traditional Platforms</h4>
                <ul className="space-y-3 text-slate-400 text-sm font-medium">
                  <li className="flex gap-2"><span>•</span> <span>Take 30-50% of creator earnings</span></li>
                  <li className="flex gap-2"><span>•</span> <span>Slow payouts (7-30 days)</span></li>
                  <li className="flex gap-2"><span>•</span> <span>Can freeze accounts anytime</span></li>
                  <li className="flex gap-2"><span>•</span> <span>Centralized control & censorship</span></li>
                </ul>
              </div>
              <div className="p-6 border border-emerald-500/30 bg-emerald-500/5 rounded-2xl">
                <h4 className="text-emerald-400 font-black uppercase tracking-widest text-xs mb-4">✅ TipHive Solution</h4>
                <ul className="space-y-3 text-slate-400 text-sm font-medium">
                  <li className="flex gap-2"><span>•</span> <span>0% platform fees forever</span></li>
                  <li className="flex gap-2"><span>•</span> <span>Instant settlement (&lt;5s)</span></li>
                  <li className="flex gap-2"><span>•</span> <span>Non-custodial ownership</span></li>
                  <li className="flex gap-2"><span>•</span> <span>Permissionless & trustless</span></li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">Core Principles</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <FeatureItem title="Permissionless" desc="No bank approvals. No waiting periods. Just pure P2P support." />
              <FeatureItem title="Stable Earnings" desc="MUSD ensures your income isn&apos;t affected by market volatility." />
              <FeatureItem title="Web3 Identity" desc="Your wallet is your profile. No email or password needed." />
            </div>
          </section>
        </div>
      )
    },
    {
      id: 'how-it-works',
      category: 'Welcome',
      title: 'How It Works',
      content: (
        <div className="space-y-12">
          <section className="space-y-6">
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase">
              How <span className="text-[#F7931A]">TipHive</span> Works
            </h1>
            <p className="text-xl text-slate-400 font-medium">Three simple interactions. Total transparency. Zero friction.</p>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">For Creators: Setup & Earning</h2>
            <Step number="01" title="Connect Your Wallet">
              Link any Mezo-compatible wallet (Rainbow, MetaMask, etc.). Your wallet address becomes your identity—no email, password, or KYC needed.
            </Step>
            <Step number="02" title="Create Your Profile">
              Set your username, add your bio, links, and profile image. Customize your appearance on your TipHive page.
            </Step>
            <Step number="03" title="Share & Start Earning">
              Share your unique TipHive link on Twitter, Discord, Twitch, or anywhere. Fans can tip you with a single click.
            </Step>
            <Step number="04" title="Receive MUSD Instantly">
              Every tip is settled on-chain instantly. Money goes directly to your wallet. No middleman, no waiting.
            </Step>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">Behind the Scenes: Smart Contracts</h2>
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-slate-400 mb-4 font-medium">Every transaction on TipHive is governed by audited smart contracts deployed on Mezo L2. This means:</p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-slate-400 font-medium">No middleman can take your money</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-slate-400 font-medium">Subscriptions auto-execute on schedule</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-slate-400 font-medium">All transactions are transparent & auditable</span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      )
    },
    {
      id: 'creator-setup',
      category: 'Creators',
      title: 'Creator Quick Start',
      content: (
        <div className="space-y-8">
          <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase">Creator Setup</h1>
          <p className="text-lg text-slate-400 leading-relaxed font-medium">
            Becoming a TipHive creator is a simple process that lives entirely on the blockchain. Follow these steps to claim your identity.
          </p>
          
          <div className="space-y-12 mt-8">
            <Step number="01" title="Connect & Claim">
              Connect your Mezo-compatible wallet and choose a unique username. This username becomes your public URL.
            </Step>
            <Step number="02" title="Define Your Brand">
              Add your bio, social links (Twitter, Discord, Website), and select your primary category. This helps fans find you.
            </Step>
            <Step number="03" title="Go Live">
               Once your profile is set up, share your link across your socials to start receiving instant MUSD tips. 
            </Step>
          </div>

          <Callout type="info" title="Ready for more?">
            After setting up your profile, you can unlock recurring revenue by configuring your Subscription Tiers.
          </Callout>
        </div>
      )
    },
    {
      id: 'subscriptions-payouts',
      category: 'Creators',
      title: 'Tiers & Payouts',
      content: (
        <div className="space-y-12">
          <section className="space-y-6">
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase">Subscriptions <span className="text-[#F7931A]">& Payouts</span></h1>
            <p className="text-lg text-slate-400 leading-relaxed font-medium">
              Subscriptions are the engine of recurring growth on TipHive. They allow your most loyal fans to support you continuously while unlocking exclusive benefits.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">The Tier Concept</h2>
            <p className="text-slate-400 leading-relaxed font-medium">
              Creators can define up to three tiers (e.g., Bronze, Silver, Gold), each with its own monthly MUSD price and set of perks.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <h4 className="font-black text-white uppercase tracking-widest text-xs mb-2">On-chain Enforcement</h4>
                <p className="text-sm text-slate-500 font-medium">Every subscription is a direct agreement between you and the fan, managed by smart contracts.</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <h4 className="font-black text-white uppercase tracking-widest text-xs mb-2">Flexible Perks</h4>
                <p className="text-sm text-slate-500 font-medium">You decide what each tier gets: early access, private Discord roles, or exclusive content.</p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">Withdrawing Your Funds</h2>
            <p className="text-slate-400 leading-relaxed font-medium">
              Earnings on TipHive are not locked behind waiting periods. 
            </p>
            <div className="space-y-4">
              <Step number="01" title="Visit your Dashboard">
                Navigate to the **Earnings** tab in your creator dashboard to see your current balance.
              </Step>
              <Step number="02" title="Trigger Payout">
                Click the **Withdraw** button to transfer the MUSD from the smart contract directly to your wallet.
              </Step>
              <Step number="03" title="Instant Settlement">
                Once confirmed on the Mezo Network, your funds are available in your wallet to spend, swap, or bridge.
              </Step>
            </div>
          </section>
        </div>
      )
    },
    {
      id: 'posting-earning',
      category: 'Creators',
      title: 'Posting & Earning',
      content: (
        <div className="space-y-12">
          <section className="space-y-6">
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase">Posting <span className="text-[#F7931A]">& Earning</span></h1>
            <p className="text-lg text-slate-400 leading-relaxed font-medium">
              Sharing content is how you build a relationship with your supporters. On TipHive, your &quot;Drops&quot; are more than just posts—they are assets that drive your creator economy.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">Content Types (Drops)</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
               <FeatureItem title="Text Posts" desc="Write articles, updates, or long-form thoughts for your fans." />
               <FeatureItem title="Photo Albums" desc="Share high-quality galleries, art, or behind-the-scenes shots." />
               <FeatureItem title="Audio Drops" desc="Upload music, podcasts, or voice notes directly to Mezo." />
               <FeatureItem title="Video Feed" desc="Share exclusive video content and tutorials with your inner circle." />
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">Visibility & Monetization</h2>
            <p className="text-slate-400 font-medium leading-relaxed">
              Control who can see your content to maximize both growth and revenue.
            </p>
            <div className="space-y-4">
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-xs">PUB</div>
                    <h4 className="font-black text-white uppercase tracking-widest text-xs">Public Access</h4>
                 </div>
                 <p className="text-sm text-slate-500 font-medium">Available to everyone. Use public drops to showcase your work and attract new supporters from the Explore feed.</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-xs">FOL</div>
                    <h4 className="font-black text-white uppercase tracking-widest text-xs">Follower Exclusive</h4>
                 </div>
                 <p className="text-sm text-slate-500 font-medium">Visible only to your followers. This is a great way to reward your community and encourage users to follow your profile for more updates.</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#F7931A]/10 flex items-center justify-center text-[#F7931A] font-black text-xs">SUB</div>
                    <h4 className="font-black text-white uppercase tracking-widest text-xs">Subscriber Exclusive</h4>
                 </div>
                 <p className="text-sm text-slate-500 font-medium">Locked behind a subscription. Only fans in your active tiers can view this content. This is your primary driver for recurring revenue.</p>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">Discovery Categories</h2>
            <p className="text-slate-400 font-medium leading-relaxed">
              Tagging your drops correctly ensures they appear in the right feeds on the **Explore** page. Common categories include:
            </p>
            <div className="flex flex-wrap gap-2">
               {['Art', 'Music', 'Gaming', 'Technology', 'Education', 'Lifestyle'].map(cat => (
                 <span key={cat} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">{cat}</span>
               ))}
            </div>
            <Callout type="check" title="Pro Tip">
               Creators who post exclusive &quot;Subscriber-only&quot; content at least twice a week earn 4x more on average than those who only post publicly.
            </Callout>
          </section>
        </div>
      )
    },
    {
      id: 'visual-toolkit',
      category: 'Technical',
      title: 'Visual Toolkit & API',
      content: (
        <div className="space-y-12">
          <section className="space-y-6">
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase">
              🎨 Visual Toolkit & API
            </h1>
            <p className="text-xl text-slate-400 font-medium">Professional assets and embeddable tools to bring TipHive to your own platform.</p>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">1. Button API (V1)</h2>
            <p className="text-slate-400 font-medium leading-relaxed">
              Generate dynamic, real-time SVG buttons for your website. Our API automatically calculates your unique supporter count and renders a branded button in high resolution.
            </p>
            <div className="bg-[#050507] p-6 rounded-2xl border border-white/5 font-mono text-xs text-[#F7931A] overflow-x-auto">
              {`<a href="https://tiphive.com/YOUR_USERNAME">
  <img src="https://tiphive.com/api/v1/button?slug=YOUR_USERNAME&color=f7931a" alt="Support on TipHive" />
</a>`}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <h4 className="text-[10px] font-black text-white uppercase mb-2">Parameters</h4>
                <ul className="text-[10px] text-slate-500 space-y-1 font-medium">
                  <li>• <code className="text-white">slug</code>: Your TipHive username (Required)</li>
                  <li>• <code className="text-white">color</code>: Hex color for the button (Default: f7931a)</li>
                  <li>• <code className="text-white">text</code>: Custom button label (Default: Support on TipHive)</li>
                </ul>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <h4 className="text-[10px] font-black text-white uppercase mb-2">Features</h4>
                <ul className="text-[10px] text-slate-500 space-y-1 font-medium">
                  <li>• Real-time unique supporter sync</li>
                  <li>• Cross-platform Emoji support</li>
                  <li>• High-DPI SVG rendering</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">2. Website Widget</h2>
            <p className="text-slate-400 font-medium leading-relaxed">
              Embed a full tipping experience directly into your blog, article, or sidebar. Our widget handles wallet connectivity and blockchain transactions seamlessly.
            </p>
            <div className="bg-[#050507] p-6 rounded-2xl border border-white/5 font-mono text-xs text-[#F7931A] overflow-x-auto">
              {`<iframe 
  src="https://tiphive.com/embed/YOUR_USERNAME?color=f7931a&title=Support+Me" 
  width="100%" height="600" frameborder="0">
</iframe>`}
            </div>
            <Callout type="info" title="Customization">
              You can override the widget&apos;s title and description by passing query parameters in the URL. Use our Dashboard Generator for a live preview.
            </Callout>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">3. QR Code Asset</h2>
            <p className="text-slate-400 font-medium leading-relaxed">
              Perfect for print media, streaming overlays, or business cards. Generate a fancy, branded QR code that opens your profile instantly when scanned.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
               <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                  <h4 className="text-[10px] font-black text-white uppercase mb-2">PNG Format</h4>
                  <p className="text-[10px] text-slate-500">3000x3000px High-Res for printing.</p>
               </div>
               <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                  <h4 className="text-[10px] font-black text-white uppercase mb-2">SVG Vector</h4>
                  <p className="text-[10px] text-slate-500">Infinite scaling for large billboards.</p>
               </div>
               <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                  <h4 className="text-[10px] font-black text-white uppercase mb-2">Branded</h4>
                  <p className="text-[10px] text-slate-500">Auto-injects TipHive logo for trust.</p>
               </div>
            </div>
          </section>
        </div>
      )
    },
    {
      id: 'smart-contracts',
      category: 'Technical',
      title: 'Smart Contracts',
      content: (
        <div className="space-y-12">
          <section className="space-y-6">
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase">
              🔐 Smart Contracts & Security
            </h1>
            <p className="text-xl text-slate-400 font-medium">Trustless. Audited. Non-custodial. Learn how it works.</p>
          </section>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-6 border border-emerald-500/30 bg-emerald-500/5 rounded-2xl">
              <h4 className="text-emerald-400 font-black uppercase tracking-widest text-xs mb-3">✅ No Centralized Control</h4>
              <p className="text-slate-400 text-xs font-medium">TipHive cannot freeze accounts or take your money. The contract code is law.</p>
            </div>
            <div className="p-6 border border-blue-500/30 bg-blue-500/5 rounded-2xl">
              <h4 className="text-blue-400 font-black uppercase tracking-widest text-xs mb-3">📜 Transparent & Auditable</h4>
              <p className="text-slate-400 text-xs font-medium">Every transaction is on-chain and verifiable. trace exactly where your money went.</p>
            </div>
          </div>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">Core Mechanics</h2>
            <div className="space-y-4">
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <h4 className="text-[#F7931A] font-black uppercase tracking-widest text-xs mb-2">Tipping Contract</h4>
                <p className="text-sm text-slate-500 font-medium">Direct wallet-to-wallet MUSD transfers with instant on-chain finality.</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <h4 className="text-cyan-400 font-black uppercase tracking-widest text-xs mb-2">Subscription Contract</h4>
                <p className="text-sm text-slate-500 font-medium">State-machine governed recurring payments with ACTIVE, CANCELLED, and EXPIRED states.</p>
              </div>
            </div>
          </section>
        </div>
      )
    },
    {
      id: 'musd-protocol',
      category: 'Technical',
      title: 'MUSD Protocol',
      content: (
        <div className="space-y-8">
          <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase">The MUSD Standard</h1>
          <p className="text-lg text-slate-400 leading-relaxed font-medium">
            TipHive uses MUSD as its primary economic unit. MUSD is a Bitcoin-backed stablecoin on the Mezo Network.
          </p>

          <div className="p-8 bg-white/5 border border-white/10 rounded-2xl">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#F7931A]" />
              Secure Settlements
            </h3>
            <p className="text-slate-500 font-medium">
              All tips and subscriptions are held in audited smart contracts. Creators can withdraw their funds at any time directly to their connected wallet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-white/5 rounded-2xl bg-white/5">
              <h4 className="font-black text-white uppercase tracking-widest text-xs mb-2">Low Volatility</h4>
              <p className="text-xs text-slate-500 font-medium">MUSD stays pegged to $1.00, meaning you don&apos;t have to worry about your earnings dropping.</p>
            </div>
            <div className="p-6 border border-white/5 rounded-2xl bg-white/5">
              <h4 className="font-black text-white uppercase tracking-widest text-xs mb-2">High Liquidity</h4>
              <p className="text-xs text-slate-500 font-medium">MUSD can be easily bridged or swapped for other assets within the Mezo ecosystem.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'architecture',
      category: 'Architecture',
      title: 'System Architecture',
      content: (
        <div className="space-y-12">
          <section className="space-y-6">
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase">🏗️ System Architecture</h1>
            <p className="text-xl text-slate-400 font-medium">How all the pieces fit together.</p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">High-Level Flow</h2>
            <div className="p-6 bg-black/40 border border-white/10 rounded-2xl space-y-6">
              <div className="space-y-2">
                <p className="font-black text-white uppercase text-sm">1. User Connects Wallet</p>
                <p className="text-xs text-slate-500 font-medium">→ Browser uses RainbowKit → User selects wallet → Signature confirms identity</p>
              </div>
              <div className="border-t border-white/10 pt-6 space-y-2">
                <p className="font-black text-white uppercase text-sm">2. Frontend Loads Profile Data</p>
                <p className="text-xs text-slate-500 font-medium">→ Wagmi queries smart contracts → Next.js API fetches user profile from Supabase → UI renders dashboard</p>
              </div>
              <div className="border-t border-white/10 pt-6 space-y-2">
                <p className="font-black text-white uppercase text-sm">3. Fan Sends a Tip</p>
                <p className="text-xs text-slate-500 font-medium">→ Fan clicks tip → Wagmi prepares tx → MUSD transferred on-chain → Smart contract logs event → Supabase updated</p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">Tech Stack</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <FeatureCard icon={Code} title="Next.js 15" desc="React framework with server components and API routes." />
              <FeatureCard icon={Zap} title="Wagmi / Viem" desc="React hooks and TS interface for blockchain interaction." />
              <FeatureCard icon={Database} title="Supabase" desc="PostgreSQL database for profiles and analytics." />
              <FeatureCard icon={Shield} title="Mezo L2" desc="Bitcoin Economic Layer for fast, cheap settlements." />
            </div>
          </section>
        </div>
      )
    },
    {
      id: 'roadmap',
      category: 'Welcome',
      title: 'Product Roadmap',
      content: (
        <div className="space-y-12">
          <section className="space-y-6">
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase">🚀 Product Roadmap</h1>
            <p className="text-xl text-slate-400 font-medium">The future of creator economics.</p>
          </section>

          <section className="space-y-8">
            <div className="p-6 border border-emerald-500/30 bg-emerald-500/5 rounded-2xl">
              <h4 className="text-emerald-400 font-black uppercase tracking-widest text-xs mb-4">Phase 1: MVP (Current)</h4>
              <ul className="space-y-2 text-slate-400 text-xs font-medium">
                <li>• Creator profiles & wallet integration</li>
                <li>• One-time tipping system</li>
                <li>• Multi-tier subscriptions</li>
              </ul>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <h4 className="font-black text-white uppercase tracking-widest text-xs mb-4">Phase 2: Growth (Q3 2026)</h4>
              <ul className="space-y-2 text-slate-400 text-xs font-medium">
                <li>• Advanced creator analytics</li>
                <li>• Social features & Messaging</li>
                <li>• Mobile app (iOS + Android)</li>
              </ul>
            </div>
          </section>
        </div>
      )
    },
    {
      id: 'faq',
      category: 'Welcome',
      title: 'FAQ',
      content: (
        <div className="space-y-12">
          <section className="space-y-6">
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase">❓ FAQ</h1>
            <p className="text-xl text-slate-400 font-medium">Common questions about TipHive.</p>
          </section>

          <section className="space-y-4">
            {[
              { q: 'How much does TipHive cost?', a: 'Nothing. TipHive charges 0% platform fees. You only pay network gas costs.' },
              { q: 'Do I need to be verified or provide ID?', a: 'No. Just connect your wallet. Totally permissionless.' },
              { q: 'Is TipHive safe?', a: 'Yes. TipHive is non-custodial—we never hold your funds. Money goes directly to your wallet.' },
              { q: 'What is MUSD?', a: 'MUSD is a stablecoin on Mezo L2 backed by Bitcoin. It is price-stable at ~$1 USD.' }
            ].map((item, i) => (
              <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <h4 className="font-black text-[#F7931A] uppercase tracking-widest text-xs mb-3">❓ {item.q}</h4>
                <p className="text-slate-500 text-xs font-medium">{item.a}</p>
              </div>
            ))}
          </section>
        </div>
      )
    }
  ], [handleSectionChange]);

  const categories = ['Welcome', 'Creators', 'Technical', 'Architecture'] as const;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && urlSection && sections.find(s => s.id === urlSection)) {
      setActiveSection(urlSection);
    }
  }, [urlSection, isMounted, sections]);

  const filteredSections = sections.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const currentSection = sections.find(s => s.id === activeSection) || sections[0];

  if (!isMounted) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#F7931A]/30 font-outfit">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] bg-black/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F7931A] flex items-center justify-center font-black text-black">T</div>
          <span className="font-black text-sm uppercase tracking-tighter">TipHive <span className="text-slate-500 text-[10px]">Docs</span></span>
        </Link>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/5 rounded-lg">
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="max-w-[1600px] mx-auto flex pt-16 lg:pt-0">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 lg:top-0 h-[100dvh] lg:h-screen w-72 bg-black border-r border-white/5 z-50 transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-white/5 hidden lg:block">
              <Link href="/" className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#F7931A] flex items-center justify-center font-black text-black text-xl">T</div>
                <span className="font-black text-lg uppercase tracking-tighter">TipHive Docs</span>
              </Link>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#F7931A]/50 transition-all font-medium"
                />
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
              {categories.map(cat => {
                const catSections = filteredSections.filter(s => s.category === cat);
                if (catSections.length === 0) return null;
                return (
                  <div key={cat} className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-2">{cat}</p>
                    {catSections.map(s => (
                      <button
                        key={s.id}
                        onClick={() => handleSectionChange(s.id)}
                        className={`
                          w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all
                          ${activeSection === s.id 
                            ? 'bg-[#F7931A]/10 text-[#F7931A] border border-[#F7931A]/20' 
                            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}
                        `}
                      >
                        {s.title}
                        {activeSection === s.id && <ChevronRight className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                );
              })}
            </nav>

            <div className="p-4 border-t border-white/5">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-[#F7931A]/20 flex items-center justify-center">
                     <GithubIcon className="w-4 h-4 text-[#F7931A]" />
                   </div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Open Source</div>
                 </div>
                 <Link href="https://github.com" className="text-[#F7931A] hover:underline text-[10px] font-black uppercase">View</Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-6 lg:px-20 py-12 lg:py-24 max-w-4xl min-h-screen">
          <div className="mb-8 flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span>Docs</span>
            <ChevronRight className="w-3 h-3" />
            <span>{currentSection.category}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#F7931A]">{currentSection.title}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {currentSection.content}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Footer */}
          <div className="mt-20 pt-10 border-t border-white/5 flex flex-wrap gap-4 justify-between">
            {sections.indexOf(currentSection) > 0 ? (
              <button 
                onClick={() => handleSectionChange(sections[sections.indexOf(currentSection) - 1].id)}
                className="flex items-center gap-4 p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/8 transition-all text-left"
              >
                <ChevronLeft className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Previous</p>
                  <p className="font-black text-white uppercase text-xs">{sections[sections.indexOf(currentSection) - 1].title}</p>
                </div>
              </button>
            ) : <div />}

            {sections.indexOf(currentSection) < sections.length - 1 ? (
              <button 
                onClick={() => handleSectionChange(sections[sections.indexOf(currentSection) + 1].id)}
                className="flex items-center gap-4 p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/8 transition-all text-right"
              >
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Next</p>
                  <p className="font-black text-white uppercase text-xs">{sections[sections.indexOf(currentSection) + 1].title}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </button>
            ) : <div />}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(247, 147, 26, 0.2);
        }
      `}</style>
    </div>
  );
}
