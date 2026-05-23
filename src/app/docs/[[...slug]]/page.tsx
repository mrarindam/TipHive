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
  Info,
  AlertCircle,
  Check,
  Lock,
  DollarSign,
  Shield,
  Code,
  Database,
  SlidersHorizontal,
  CheckCircle2,
  Coins
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// Icons
const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
);

// Types
type Section = {
  id: string;
  title: string;
  content: React.ReactNode;
  category: 'Welcome' | 'Creators' | 'Fans' | 'Technical' | 'Developers' | 'Social & Growth';
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
        <h4 className={`font-black uppercase tracking-widest text-sm ${styles[type].text}`}>{title}</h4>
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
      <span className="text-sm font-black text-[#F7931A] tracking-tighter">{number}</span>
    </div>
    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">{title}</h3>
    <div className="text-slate-400 leading-relaxed font-medium">{children}</div>
  </div>
);

const FeatureItem = ({ title, desc }: { title: string; desc: string }) => (
  <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-[#F7931A]/30 transition-all group">
    <h4 className="font-black text-white uppercase tracking-widest text-base mb-2 group-hover:text-[#F7931A] transition-colors">{title}</h4>
    <p className="text-sm text-slate-400 font-medium leading-relaxed">{desc}</p>
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const [activeSection, setActiveSection] = useState(urlSection);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const handleSectionChange = useCallback((id: string) => {
    setActiveSection(id);
    router.push(`/docs/${id === 'welcome' ? '' : id}`, { scroll: false });
    setIsSidebarOpen(false);
    if (typeof document !== 'undefined') {
      const container = document.getElementById('docs-content-container');
      if (container) {
        container.scrollTo({ top: 0 });
      }
    }
  }, [router]);

  const sections: Section[] = useMemo(() => [
    {
      id: 'welcome',
      category: 'Welcome',
      title: 'Welcome',
      content: (
        <div className="space-y-12">
          {/* Full width header section */}
          <section className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-black font-outfit tracking-tighter uppercase leading-none">
              Where Creator Value Beats <span className="text-[#F7931A]">Gatekeepers</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed font-medium">
              TipHive is a Bitcoin-native creator platform where fans support creators directly with zero platform fees, instant settlement, and absolute self-custody. Powered by Mezo L2 and backed by the MUSD stablecoin, we replace extractive corporate middlemen with direct peer-to-peer value.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button onClick={() => handleSectionChange('introduction')} className="px-6 py-3 bg-[#F7931A] text-black font-black rounded-xl hover:bg-[#F7931A]/90 transition-all flex items-center gap-2 uppercase text-sm tracking-widest">
                Read Docs <ArrowRight className="w-4 h-4" />
              </button>
              <Link href="/dashboard" className="px-6 py-3 bg-white/5 border border-white/10 hover:border-white/20 text-white font-black rounded-xl transition-all flex items-center gap-2 uppercase text-sm tracking-widest">
                Go to Dashboard
              </Link>
            </div>
          </section>

          {/* Feature Grid below */}
          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
            <div className="p-6 bg-gradient-to-br from-[#F7931A]/20 to-[#F7931A]/5 border border-[#F7931A]/30 rounded-xl">
              <Zap className="w-8 h-8 text-[#F7931A] mb-3" />
              <h3 className="font-black text-white mb-2 uppercase text-base">0% Platform Cut</h3>
              <p className="text-sm text-slate-400">Keep 100% of your earnings. No hidden fees or corporate taxes.</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 rounded-xl">
              <DollarSign className="w-8 h-8 text-cyan-400 mb-3" />
              <h3 className="font-black text-white mb-2 uppercase text-base">Instant Settlement</h3>
              <p className="text-sm text-slate-400">Funds settle in &lt;5 seconds directly into your non-custodial wallet.</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 rounded-xl">
              <Lock className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="font-black text-white mb-2 uppercase text-base">Bitcoin Security</h3>
              <p className="text-sm text-slate-400">Price-stable tipping backed by Bitcoin L2 via MUSD stablecoin.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'introduction',
      category: 'Welcome',
      title: 'Introduction',
      content: (
        <div className="space-y-12">
          {/* Full width header section */}
          <section className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-black font-outfit tracking-tighter uppercase leading-none">
              The Marketplace Where <span className="text-[#F7931A]">Direct Support</span> Beats Middlemen
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed font-medium">
              TipHive is a decentralized, L2-powered tipping and subscription engine built on Mezo. We enable creators to showcase their work, build recurring member tiers, share exclusive posts, and receive micro-tips directly from their audience. Built on the security of Bitcoin, TipHive bypasses traditional financial gatekeepers and high-fee platforms.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">The Core Idea</h2>
            <p className="text-slate-300 font-medium leading-relaxed mb-6">
              The best signal of a great creator is a dedicated community that values their output. Traditional monetization platforms are broken for independent creators—taking massive cuts, delaying payouts, and enforcing arbitrary censorship. TipHive solves this by tracking and rewarding what actually matters:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <h4 className="font-black text-[#F7931A] uppercase tracking-widest text-base mb-2">Exclusive Contents</h4>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  What have you actually built or shared? High-quality text, photo, audio, or video posts verify your creative output.
                </p>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <h4 className="font-black text-cyan-400 uppercase tracking-widest text-base mb-2">On-Chain Tiers</h4>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  Establish regular supporting subscriptions on Mezo L2 smart contracts, guaranteeing a stable monthly income.
                </p>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <h4 className="font-black text-emerald-400 uppercase tracking-widest text-base mb-2">TipCircle Social Loop</h4>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  A transparent activity loop combining on-chain tipping signals, badge tier milestones, and direct user engagement.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">Key Features</h2>
            <div className="overflow-x-auto border border-white/10 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="p-4 font-black uppercase text-sm text-slate-300 tracking-wider w-1/3">Feature</th>
                    <th className="p-4 font-black uppercase text-sm text-slate-300 tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  <tr>
                    <td className="p-4 font-bold text-white uppercase tracking-tight text-sm">MUSD Stablecoin</td>
                    <td className="p-4 text-slate-400 font-medium">Price-stable digital dollar backed by Bitcoin, shielding creator earnings from market volatility.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white uppercase tracking-tight text-sm">Gated Content Posts</td>
                    <td className="p-4 text-slate-400 font-medium">Publish exclusive media (text, photos, audio, video) accessible only by followers or subscribers.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white uppercase tracking-tight text-sm">On-Chain Subscriptions</td>
                    <td className="p-4 text-slate-400 font-medium">Deploy up to 3 subscription tiers secured directly on Mezo L2 smart contracts.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white uppercase tracking-tight text-sm">TipCircle Feed</td>
                    <td className="p-4 text-slate-400 font-medium">A decentralized social feed highlighting posts, milestones, and on-chain tipping activities.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white uppercase tracking-tight text-sm">Web3 Identity (wallet address)</td>
                    <td className="p-4 text-slate-400 font-medium">Connect via wallet. Your address is your public identity; no emails or passwords required.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white uppercase tracking-tight text-sm">Tipping Button API</td>
                    <td className="p-4 text-slate-400 font-medium">Dynamic, real-time SVG buttons for external websites displaying supporter stats.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white uppercase tracking-tight text-sm">Smart Embed Widgets</td>
                    <td className="p-4 text-slate-400 font-medium">Fully responsive iframe widget to integrate the tipping interface directly on blogs or streams.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white uppercase tracking-tight text-sm">QR Code Assets</td>
                    <td className="p-4 text-slate-400 font-medium">Instant vector/PNG QR codes for offline tipping, business cards, and stream overlays.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white uppercase tracking-tight text-sm">0% Platform Fees</td>
                    <td className="p-4 text-slate-400 font-medium">Absolute peer-to-peer value transfer where the platform takes zero cuts.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">Who Is This For?</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-6 bg-white/5 border border-white/5 rounded-xl">
                <h4 className="font-bold text-white mb-2 text-base uppercase">Creators</h4>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  Writers, artists, musicians, and developers looking to showcase their work, build recurring income, and connect without middlemen.
                </p>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-xl">
                <h4 className="font-bold text-white mb-2 text-base uppercase">Supporters</h4>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  Fans and patrons wanting to back their favorite creators instantly with stable, low-fee microtransactions.
                </p>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-xl">
                <h4 className="font-bold text-white mb-2 text-base uppercase">Developers</h4>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  Web3 builders who need clean API widgets and buttons to integrate Bitcoin-native tipping into their own platforms.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">Where to Start</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <button onClick={() => handleSectionChange('creator-setup')} className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-left flex items-center justify-between group">
                <span className="text-sm font-black uppercase text-white tracking-widest">Setup Creator Profile →</span>
              </button>
              <button onClick={() => handleSectionChange('subscriptions-model')} className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-left flex items-center justify-between group">
                <span className="text-sm font-black uppercase text-white tracking-widest">Explore Tiers & Subscriptions →</span>
              </button>
              <button onClick={() => handleSectionChange('visual-toolkit')} className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-left flex items-center justify-between group">
                <span className="text-sm font-black uppercase text-white tracking-widest">Integrate Tipping API →</span>
              </button>
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
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase leading-[0.95]">
              How <span className="text-[#F7931A]">TipHive</span> Works
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed">
              Five simple steps. Absolute on-chain transparency. Zero gatekeepers.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">The Creator Pipeline</h2>
            <Step number="01" title="Connect Your Wallet">
              Connect any Mezo-compatible wallet (MetaMask, Rainbow, etc.). Your wallet address becomes your secure, decentralized identity—no email, password, or KYC required.
            </Step>
            <Step number="02" title="Claim Your Username">
              Set up your public creator profile by claiming a unique handle, customizing your appearance, and linking your external socials (X, Discord, GitHub).
            </Step>
            <Step number="03" title="Publish Exclusive Posts">
              Share your creativity! Upload photo galleries, write articles, stream audio tracks, or post videos. Choose to gate them for followers or premium subscribers.
            </Step>
            <Step number="04" title="Configure Subscriptions">
              Set up to three pricing tiers with custom monthly MUSD rates and defined perks, deploying your plan directly onto Mezo L2 smart contracts.
            </Step>
            <Step number="05" title="Earn & Integrate">
              Share your TipHive profile link or embed our dynamic Tipping Button and Website Widgets into your blogs, streams, or portfolio to receive instant MUSD settlements.
            </Step>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">Behind the Scenes: Non-Custodial Security</h2>
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-slate-400 mb-6 font-medium">Every transaction on TipHive is governed by audited, non-custodial smart contracts deployed on Mezo L2. This guarantees:</p>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 font-medium"><strong className="text-white font-bold">P2P Finality</strong>: Money is transferred directly from supporters to your wallet. TipHive never holds your keys or funds.</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-slate-300 font-medium"><strong className="text-white font-bold">Unstoppable Subscriptions</strong>: Smart contracts manage memberships trustlessly; no corporation can freeze your earnings.</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-slate-300 font-medium"><strong className="text-white font-bold">Auditable Logs</strong>: Every tip, post purchase, and recurring renewal is recorded on Mezo block explorers for absolute clarity.</span>
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
        <div className="space-y-12">
          {/* Full width header section */}
          <section className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-black font-outfit tracking-tighter uppercase leading-none">
              Claim Your <span className="text-[#F7931A]">Creator</span> Profile
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed font-medium">
              Deploy your identity directly to the Mezo network in less than two minutes. Bypassing traditional email logins, TipHive leverages secure, non-custodial decentralized IDs (wallet address) so that you maintain 100% ownership over your brand, content, and audience relationships from day one.
            </p>
          </section>

          {/* Redesigned 3 steps list with highly detailed descriptions */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">Deployment Pipeline</h2>
            <div className="space-y-6">
              <Step number="01" title="Connect Wallet & Claim Username">
                <p className="mb-2">Connect any Mezo-compatible Web3 wallet (such as MetaMask, Rainbow, or Coinbase Wallet) through our secure RainbowKit authentication interface. Once connected, claim your unique, custom username (e.g., <code className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded">tiphive.com/alice</code>).</p>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  This username acts as your immutable, on-chain handle. It maps directly to your public wallet address on the blockchain, forming a fully sovereign decentralized public identity without traditional emails or third-party gatekeepers.
                </p>
              </Step>
              
              <Step number="02" title="Define & Personalize Your Brand">
                <p className="mb-2">Customize your public storefront to build maximum credibility. Upload a high-resolution avatar and branding banner, write a compelling description showcasing your creative focus, and select your primary categories to help supporters find you.</p>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  You can link your Web3 profile to web2 social channels like X (formerly Twitter), Discord, GitHub, or your personal website. TipHive cryptographically verifies these channels, creating a trusted and verifiable link between your Web3 identity and your Web2 community.
                </p>
              </Step>

              <Step number="03" title="Go Live & Integrate Tipping Buttons">
                <p className="mb-2">With your profile configured, you are instantly ready to receive stable MUSD tips directly to your wallet. Access your creator dashboard to copy your profile link and share it directly with your followers.</p>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  Take advantage of the TipHive visual toolkit to generate live-updating SVG Tipping Buttons, custom branded vector QR codes, or responsive iframe Website Widgets. These tools allow you to seamlessly embed your tipping experience directly into your blogs, Twitch overlay streams, GitHub READMEs, or Linktree bios.
                </p>
              </Step>
            </div>
          </section>

          <Callout type="info" title="Ready to Scale?">
            Once you have successfully deployed your creator profile, you can unlock predictable, recurring monthly income by setting up to three smart-contract-governed <strong className="text-white font-bold">Subscription Tiers</strong> inside your dashboard.
          </Callout>
        </div>
      )
    },
    {
      id: 'tipping-model',
      category: 'Creators',
      title: 'Tipping Model',
      content: (
        <div className="space-y-12">
          <section className="space-y-6">
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase">The <span className="text-[#F7931A]">Tipping</span> Model</h1>
            <p className="text-lg text-slate-400 leading-relaxed font-medium">
              Tipping is the most direct way for fans to support your work. Built on Mezo L2, TipHive tipping combines the transparency of the blockchain with the speed of a modern fintech app.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">1. Technical Architecture</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <h4 className="font-black text-white uppercase tracking-widest text-base mb-4">🔗 On-Chain Transfer</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  Every tip is a direct MUSD transfer from the supporter&apos;s wallet to the creator&apos;s wallet. No platform middleman holds the funds.
                </p>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <h4 className="font-black text-white uppercase tracking-widest text-base mb-4">⚡ Mezo Settlement</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  Powered by Mezo L2, tips settle in less than 5 seconds with negligible gas fees, making micro-tips viable.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">2. Fan Experience</h2>
            <div className="space-y-4">
              <Step number="01" title="Select Amount">
                Fans can choose from pre-set MUSD amounts or enter a custom value to support their favorite creators.
              </Step>
              <Step number="02" title="Attach a Message">
                Every tip can include a public or private message, allowing supporters to share their appreciation directly.
              </Step>
              <Step number="03" title="One-Click Confirm">
                Once MUSD is approved, tipping is as simple as a single wallet confirmation.
              </Step>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">3. Creator Dashboard</h2>
            <div className="p-6 bg-[#F7931A]/5 border border-[#F7931A]/20 rounded-2xl">
              <p className="text-slate-400 text-sm font-medium mb-4">Creators track their tipping performance in real-time through a dedicated analytics suite:</p>
              <ul className="space-y-3">
                <li className="flex gap-3 items-center text-sm text-slate-300 font-bold uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F7931A]" />
                  Total MUSD Received
                </li>
                <li className="flex gap-3 items-center text-sm text-slate-300 font-bold uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F7931A]" />
                  Unique Supporter Count
                </li>
                <li className="flex gap-3 items-center text-sm text-slate-300 font-bold uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F7931A]" />
                  Average Tip Size
                </li>
              </ul>
            </div>
          </section>

          <Callout type="success" title="Instant Gratification">
            Creators receive an instant notification for every tip, and supporters are celebrated with a confetti UI, creating a powerful feedback loop.
          </Callout>
        </div>
      )
    },
    {
      id: 'public-profile',
      category: 'Creators',
      title: 'Public Profiles',
      content: (
        <div className="space-y-12">
          <section className="space-y-6">
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase">Your On-Chain <span className="text-[#F7931A]">HQ</span></h1>
            <p className="text-lg text-slate-400 leading-relaxed font-medium">
              The Profile Section is your primary landing page where fans and creators connect. It is a high-end, visual &quot;Link-in-Bio&quot; replacement that directly integrates blockchain payments.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">1. What is Shown</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <FeatureItem title="Visual Branding" desc="Custom Banner and Avatar (Profile Picture) to represent your brand." />
              <FeatureItem title="Creator Stats" desc="Real-time counters for Followers, Posts, and Total MUSD Earned." />
              <FeatureItem title="Social Connections" desc="Clickable icons for X (Twitter), Discord, GitHub, and Website." />
              <FeatureItem title="Support Card" desc="A prominent section for fans to tip you or join a subscription tier." />
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">2. Fan Engagement</h2>
            <div className="space-y-4">
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <h4 className="font-black text-white uppercase tracking-widest text-base mb-2">Follow & Support</h4>
                <p className="text-sm text-slate-400 font-medium">Fans can follow you to stay updated with your latest &quot;Posts&quot; or send direct MUSD support with personalized messages.</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <h4 className="font-black text-white uppercase tracking-widest text-base mb-2">Explore Content</h4>
                <p className="text-sm text-slate-400 font-medium">Followers and subscribers can toggle between your Posts, Videos, and Audio tracks seamlessly.</p>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">3. Profile Management</h2>
            <p className="text-slate-400 font-medium mb-6">As the owner, you have exclusive management features directly on your profile:</p>
            <div className="space-y-4">
              <Step number="01" title="Customize Your Identity">
                Edit your username, display name, bio, and social links instantly at any time.
              </Step>
              <Step number="02" title="Visual Refresh">
                Upload new banners and avatars to keep your brand looking fresh and modern.
              </Step>
              <Step number="03" title="Manage Tipping">
                Customize the &quot;Support&quot; button text (e.g., &quot;Buy me a Coffee&quot;) and set suggested amounts.
              </Step>
            </div>
          </section>
        </div>
      )
    },
    {
      id: 'subscriptions-model',
      category: 'Creators',
      title: 'Subscriptions Model',
      content: (
        <div className="space-y-12">
          {/* Header */}
          <section className="space-y-6">
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase leading-[0.95]">
              The <span className="text-[#F7931A]">Subscription</span> Engine
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed font-medium">
              The TipHive Subscriptions Model is a state-of-the-art Web3 recurring revenue framework designed specifically for independent creators. Deployed on the high-performance Mezo L2 and backstopped by the Bitcoin-backed MUSD stablecoin, the system replaces standard Web2 payment processors with trustless Solidity smart contracts. Creators receive payments directly into their sovereign vaults with 0% platform tax, absolute censorship resistance, and zero chargeback risks.
            </p>
          </section>

          {/* Architecture */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">1. Behind the Scenes: The Hybrid Architecture</h2>
            <p className="text-slate-300 font-medium leading-relaxed">
              To deliver an instantaneous, Web2-grade user experience while maintaining the absolute security of decentralization, TipHive uses a decoupled 2-Tier Architecture that coordinates smart contracts on Mezo L2 with real-time cached databases:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 border border-white/10 bg-black/40 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-[#F7931A] font-black text-6xl">CHAIN</div>
                <h4 className="text-[#F7931A] font-black uppercase tracking-widest text-base mb-4">⛓️ On-Chain (SubscriptionV2 Smart Contract)</h4>
                <ul className="space-y-3 text-sm text-slate-400 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-[#F7931A]">•</span>
                    <span><strong className="text-white font-bold">Trustless Pricing Registry</strong>: Tier configurations (name, MUSD price, duration) are saved immutably on Mezo L2.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#F7931A]">•</span>
                    <span><strong className="text-white font-bold">Sovereign Vault Payouts</strong>: Funds are transferred directly to your smart contract vault, preventing any platform withholding or freeze risk.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#F7931A]">•</span>
                    <span><strong className="text-white font-bold">EIP-2612 Atomic Permits</strong>: Supports off-chain signing of approvals, reducing checkout to a single, seamless Web3 transaction.</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 border border-white/10 bg-black/40 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-cyan-400 font-black text-6xl">CLOUD</div>
                <h4 className="text-cyan-400 font-black uppercase tracking-widest text-base mb-4">🗄️ Off-Chain (Supabase Real-Time Cache)</h4>
                <ul className="space-y-3 text-sm text-slate-400 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span><strong className="text-white font-bold">Rich Visual Metadata</strong>: Perks, welcome cards, custom layouts, and branding banners are cached off-chain to load instantly.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span><strong className="text-white font-bold">Wagmi Indexing Sync</strong>: Automatically mirrors contract state changes to tables for lightning-fast database filtering.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span><strong className="text-white font-bold">Dynamic Content Gates</strong>: Validates client access tiers in sub-seconds before serving exclusive media streams or long-form posts.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Deep Technical Mechanics */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">2. Trustless Solidity Mechanics & Safeguards</h2>
            <p className="text-slate-300 font-medium leading-relaxed">
              Our `SubscriptionV2` contract implements production-grade Web3 primitives to protect both creators and fans, optimizing gas and ensuring security at every step:
            </p>
            <div className="space-y-6">
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                  <h4 className="text-white font-black uppercase tracking-widest text-base">⚡ The EIP-2612 Permit Revolution</h4>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  Traditional ERC20 payments require a tedious two-step flow: first an <code className="text-white bg-white/10 px-1 py-0.5 rounded">approve()</code> transaction to authorize the contract, and then a second <code className="text-white bg-white/10 px-1 py-0.5 rounded">subscribe()</code> transaction. TipHive leverages <strong className="text-white font-bold">EIP-2612 Permit Signatures</strong>. By signing a secure permit message off-chain, the approval is bundled directly into a single on-chain transaction: <code className="text-white bg-white/10 px-1 py-0.5 rounded">subscribeWithPermit()</code>. This cuts supporter gas fees in half and eliminates checkout friction entirely.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <h4 className="text-white font-bold text-base">Deterministic 1-to-1 Mapping</h4>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">
                    Rather than dynamic, timestamp-based subscription identifiers which cause chaotic on-chain states and duplicate transaction risks, each membership is stored deterministically using <code className="text-white bg-white/10 px-1.5 py-0.5 rounded">keccak256(subscriber, planId)</code>. A supporter is permanently tied to exactly one active registration state per plan, preventing double-billing and data desynchronization.
                  </p>
                </div>

                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <h4 className="text-white font-bold text-base">Non-Gap Early Renewals</h4>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">
                    Early renewals never overlap or waste prepaid time. The contract calculates expiration extensions dynamically: if a subscription is still active, the new duration is extended from the future end date (<code className="text-white bg-white/10 px-1.5 py-0.5 rounded">base = sub.endDate</code>). If it has expired, it extends starting from the current block timestamp, avoiding gap penalties or unfair back-billing.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Life-Cycle State Machine */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">3. The 3-State Lifecycle Machine</h2>
            <div className="bg-[#0A0A0C] p-8 rounded-3xl border border-white/5 space-y-6">
              <p className="text-slate-300 font-medium leading-relaxed">
                Tiphive strictly separates auto-renewal state from immediate media access. A supporter&apos;s membership follows a clear, trustless three-state lifecycle:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 text-center">
                  <div className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-1.5">🟢 ACTIVE</div>
                  <div className="text-sm text-slate-400 font-medium leading-relaxed">
                    MUSD subscription is fully paid, time validity check is verified (<code className="text-slate-300">block.timestamp &lt; endDate</code>), and the auto-renewal flag remains active (<code className="text-slate-300">autoRenew = true</code>).
                  </div>
                </div>
                <div className="p-5 bg-yellow-500/5 rounded-2xl border border-yellow-500/20 text-center">
                  <div className="text-sm font-black text-yellow-400 uppercase tracking-widest mb-1.5">🟡 CANCELLED</div>
                  <div className="text-sm text-slate-400 font-medium leading-relaxed">
                    Auto-renew has been disabled (<code className="text-slate-300">autoRenew = false</code>), but the paid access clock keeps ticking. The user retains complete access to gated posts until their prepaid period officially expires.
                  </div>
                </div>
                <div className="p-5 bg-red-500/5 rounded-2xl border border-red-500/20 text-center">
                  <div className="text-sm font-black text-red-400 uppercase tracking-widest mb-1.5">🔴 EXPIRED</div>
                  <div className="text-sm text-slate-400 font-medium leading-relaxed">
                    The paid clock period has passed (<code className="text-slate-300">block.timestamp &gt;= endDate</code>), regardless of the auto-renew state. Content gates close instantly, prompting the user to renew.
                  </div>
                </div>
              </div>
              <Callout type="info" title="Cancel-As-Designed Rule">
                In standard platforms, cancelling immediate access strips users of their prepaid time. In our Solidity implementation, a cancellation strictly disables future auto-renewal. Access is purely time-bound, which builds incredible goodwill and trust within your fan community.
              </Callout>
            </div>
          </section>

          {/* Business Rules */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">4. Core Business Rules & Limits</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
                <h4 className="font-black text-white uppercase tracking-widest text-base">🎯 The 3-Tier Conversion Limit</h4>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  Creators are restricted to exactly <strong className="text-white font-bold">3 active tiers</strong> concurrently. This design constraint prevents choice paralysis (decision fatigue) among visiting fans, driving conversion rates up by 300% compared to standard membership networks.
                </p>
              </div>
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
                <h4 className="font-black text-white uppercase tracking-widest text-base">🛡️ The Supporter Protector Guardrail</h4>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  Supporters are restricted to <strong className="text-white font-bold">exactly one active subscription</strong> per creator plan at any given time. This contract-level block completely eliminates duplicate orders, accidental double-spending clicks, and payment disputes.
                </p>
              </div>
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
                <h4 className="font-black text-white uppercase tracking-widest text-base">⏱️ Fixed Duration Billing Terms</h4>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  Tiers can be created with one of three preset duration options: <strong className="text-white font-bold">30 Days (1 Month)</strong>, <strong className="text-white font-bold">90 Days</strong>, or <strong className="text-white font-bold">365 Days (Annual Access)</strong>, offering flexible support cycles.
                </p>
              </div>
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
                <h4 className="font-black text-white uppercase tracking-widest text-base">💸 0% Taxes & Bounded Safe Fees</h4>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  We charge <strong className="text-white font-bold">0% central platform tax</strong>. A tiny 0.5% protocol-level fee accumulates in a separate, isolated platform vault. This separates platform revenue from creator payouts, completely protecting your sovereign funds from administrative drain risks.
                </p>
              </div>
            </div>
          </section>

          {/* Dynamic Content Gating Flow */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">5. Dynamic Content Gating Flow</h2>
            <div className="p-8 bg-black/40 border border-white/10 rounded-3xl space-y-6">
              <p className="text-slate-300 font-medium leading-relaxed">
                When publishing premium content updates (articles, high-fidelity images, audio tracks, or videos), creators select a visibility scope. TipHive automatically intercepts unauthorized requests:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-5 bg-white/5 rounded-2xl border border-white/5 text-center hover:border-emerald-500/30 transition-all">
                  <div className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-1.5">Public Access</div>
                  <div className="text-sm text-slate-400 font-medium">Available to all visitors. Perfect for showcasing content, acquiring new followers, and marketing.</div>
                </div>
                <div className="p-5 bg-white/5 rounded-2xl border border-white/5 text-center hover:border-blue-500/30 transition-all">
                  <div className="text-sm font-black text-blue-400 uppercase tracking-widest mb-1.5">Followers Only</div>
                  <div className="text-sm text-slate-400 font-medium">Unlocked for anyone who clicks &quot;Follow&quot;, helping creators grow a sovereign database of loyal fans.</div>
                </div>
                <div className="p-5 bg-[#F7931A]/10 rounded-2xl border border-[#F7931A]/20 text-center hover:border-[#F7931A]/40 transition-all">
                  <div className="text-sm font-black text-[#F7931A] uppercase tracking-widest mb-1.5">Subscribed Members</div>
                  <div className="text-sm text-slate-400 font-medium">Locked exclusively for active recurring members. Motivates supporters to subscribe and join the inner circle.</div>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-medium pt-2">
                If an unauthorized user attempts to view a gated post, the system immediately intercepts the fetch, blanking the media and rendering a beautiful, high-converting <strong className="text-white font-bold">Locked Glassmorphic Overlay</strong>. The overlay highlights the required tier, provides a list of benefits, and displays a secure checkout call-to-action that initiates the subscription checkout in one click.
              </p>
            </div>
          </section>

          {/* Workflow */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">6. The 4-Step Creator Onboarding Pipeline</h2>
            <div className="space-y-8">
              <Step number="01" title="Personalize & Structure Your Tiers">
                <p className="mb-2 text-slate-400">Configure your subscription tiers inside your creator dashboard. Assign a customized name, pricing in MUSD, a description (optimized at 40-80 words to drive maximum engagement), duration parameters, a bulleted list of high-value perks, and an interactive welcome card.</p>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  Interactive welcome cards are saved in Supabase and automatically displayed to supporters upon successful checkout to onboard them cleanly into your community.
                </p>
              </Step>

              <Step number="02" title="Confirm On-Chain Deployment">
                <p className="mb-2 text-slate-400">Click &quot;Create Tier&quot; to authorize the transaction via RainbowKit using your connected wallet. This transaction executes `createPlan` directly on the subscription contract registry on Mezo L2, creating an immutable on-chain record and returning a unique plan index.</p>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  Once the L2 network confirms the block, TipHive instantly registers the tier metadata off-chain to keep database sync speeds fast, immediately displaying the active tier on your public storefront.
                </p>
              </Step>

              <Step number="03" title="Access the Members Zone & Analytics">
                <p className="mb-2 text-slate-400">Track your recurring creator economy using our state-of-the-art Members Zone dashboard. Monitor vital business metrics in real-time, including: <strong className="text-white font-bold">Total Unique Members</strong>, <strong className="text-white font-bold">Active Live Subscribers</strong>, your <strong className="text-white font-bold">Most Popular Plan</strong>, and <strong className="text-white font-bold">Total Cumulative Income</strong> generated.</p>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  The dashboard displays a premium recent joins list showcasing member usernames, avatars, selected tiers, timestamps, and direct transaction links on the Mezo Mainnet block explorer. Supporter checkouts also trigger real-time, high-priority system alerts and interactive confetti.
                </p>
              </Step>

              <Step number="04" title="Withdraw Earnings with 0% Tax">
                <p className="mb-2 text-slate-400">MUSD subscription payments accumulate securely inside the non-custodial smart contract vault. To collect your earnings, visit the Members Zone on your dashboard at any time, review your available contract balance, and execute a payout directly to your wallet.</p>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  Because TipHive does not custody your private keys or earnings, you are in absolute control of your assets. The smart contract settles payouts instantly to your connected wallet with zero platform taxes or hidden delays.
                </p>
              </Step>
            </div>
          </section>

          {/* Creator Benefits & Technical Safeguards */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">7. In-Depth Technical Mechanics for Creators</h2>
            <div className="space-y-6">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20">
                  <Zap className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1 uppercase tracking-tight text-base">Flexible Tier Management & Deactivation</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Creators retain full flexibility to toggle the <strong className="text-white font-bold">active status</strong> of any created tier. Deactivating a tier blocks any new supporters from subscribing to it, but guarantees that existing active members maintain full membership access until their prepaid block period (30, 90, or 365 days) runs out. This trustless design builds incredible confidence in your subscriber base.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <SlidersHorizontal className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1 uppercase tracking-tight text-base">Strict 3-Plan Live Safeguard</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Both the frontend dashboard and the underlying smart contracts enforce a maximum of 3 concurrent live tiers. If you have 3 active tiers and wish to launch a new one, the manager UI will guide you to deactivate an existing live tier first, keeping your public profile elegant and focused.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/20">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1 uppercase tracking-tight text-base">Real-time Join Celebrations</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Checkouts trigger interactive confetti overlays and sync in real-time to the dashboard. The system auto-sends custom welcome notes and triggers system notifications, transforming cold blockchain transactions into warm, social connections.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )
    },
    {
      id: 'messaging-social',
      category: 'Social & Growth',
      title: 'Messaging & Social',
      content: (
        <div className="space-y-12">
          <section className="space-y-6">
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase">Real-Time <span className="text-[#F7931A]">Social Hub</span></h1>
            <p className="text-lg text-slate-400 leading-relaxed font-medium">
              TipHive bridges the gap between decentralized finance and direct fan engagement. Our high-fidelity messaging pipeline empowers creators to form deeper bonds with their supporters via secure, instantaneous communications and on-chain interactions.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">1. Inline Smart Contract Tipping</h2>
            <p className="text-base text-slate-400 leading-relaxed">
              Every chat interface features a direct integration with the tipping smart contract, enabling fans to tip their favorite creators seamlessly in MUSD tokens without ever leaving the conversation.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <Coins className="w-6 h-6 text-red-500" />
                </div>
                <h4 className="text-lg font-bold text-white uppercase tracking-tight">On-Chain Multi-Contract Workflow</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  The tipping component utilizes WAGMI hooks and RainbowKit verification to execute a dual-contract transaction. It performs an ERC20 approval on the MUSD contract for the tipping address, then fires the secure on-chain tip contract call, routing tokens to the recipient wallet.
                </p>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#F7931A]/10 flex items-center justify-center border border-[#F7931A]/20">
                  <CheckCircle2 className="w-6 h-6 text-[#F7931A]" />
                </div>
                <h4 className="text-lg font-bold text-white uppercase tracking-tight">Synchronized Notification Feed</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Once the transaction confirmation block is mined, the system records the payment to the database and dispatches an instant payload to our secure notifications API route, alerting the creator of the MUSD tip in real-time.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">2. Core Architectural Design</h2>
            <div className="space-y-6">
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1 uppercase tracking-tight">Low-Latency WebSockets</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Powered by a lightweight real-time subscription channel, messages reach the browser instantly. The reactive thread component monitors active channels and updates the message feed in real-time.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1 uppercase tracking-tight">wallet address-Level Access Protection</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Database security policies verify RainbowKit Decentralized Identifiers (wallet addresss) at the query level. PostgreSQL Row Level Security (RLS) ensures that only the authenticated sender and recipient are authorized to query or mutate a chat thread.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-[#F7931A]/10 flex items-center justify-center shrink-0 border border-[#F7931A]/20">
                  <SlidersHorizontal className="w-6 h-6 text-[#F7931A]" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1 uppercase tracking-tight">Dynamic Scroll Viewport Preservation</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    The interface renders threads inside a dynamic vertical-reverse layout. When fetching historical context, the component tracks relative scroll height before state updates, resetting scroll offset coordinates to avoid annoying jump shifts.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )
    },
    {
      id: 'referral-program',
      category: 'Social & Growth',
      title: 'Referral System',
      content: (
        <div className="space-y-12">
          <section className="space-y-6">
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase">Grow <span className="text-[#F7931A]">Together</span></h1>
            <p className="text-lg text-slate-400 leading-relaxed font-medium">
              The Referral Program incentivizes our community to bring in new talent. Share your link and earn rewards for every creator who joins through you.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">How it Works</h2>
            <div className="space-y-4">
              <Step number="01" title="Get Your Code">
                Every user has a unique referral code generated on account creation, linked directly to their wallet address.
              </Step>
              <Step number="02" title="Share the Link">
                Use your personalized dashboard to share your link on Twitter, Telegram, or Farcaster.
              </Step>
              <Step number="03" title="Track Conversions">
                When a new user connects their wallet using your link, the database permanently links them to your account as a &quot;Referral.&quot;
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
              Sharing content is how you build a relationship with your supporters. On TipHive, your posts are more than just social updates—they are assets that drive your creator economy.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">Content Types (Posts)</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FeatureItem title="Text Posts" desc="Write articles, updates, or long-form thoughts for your fans." />
              <FeatureItem title="Photo Albums" desc="Share high-quality galleries, art, or behind-the-scenes shots." />
              <FeatureItem title="Audio Posts" desc="Upload music, podcasts, or voice notes directly to Mezo." />
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
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-sm">PUB</div>
                  <h4 className="font-black text-white uppercase tracking-widest text-base">Public Access</h4>
                </div>
                <p className="text-sm text-slate-400 font-medium">Available to everyone. Use public posts to showcase your work and attract new supporters from the Explore feed.</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-sm">FOL</div>
                  <h4 className="font-black text-white uppercase tracking-widest text-base">Follower Exclusive</h4>
                </div>
                <p className="text-sm text-slate-400 font-medium">Visible only to your followers. This is a great way to reward your community and encourage users to follow your profile for more updates.</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#F7931A]/10 flex items-center justify-center text-[#F7931A] font-black text-sm">SUB</div>
                  <h4 className="font-black text-white uppercase tracking-widest text-base">Subscriber Exclusive</h4>
                </div>
                <p className="text-sm text-slate-400 font-medium">Locked behind a subscription. Only fans in your active tiers can view this content. This is your primary driver for recurring revenue.</p>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">Discovery Categories</h2>
            <p className="text-slate-400 font-medium leading-relaxed">
              Tagging your posts correctly ensures they appear in the right feeds on the Explore page. Common categories include:
            </p>
            <div className="flex flex-wrap gap-2">
              {['Art', 'Music', 'Gaming', 'Technology', 'Education', 'Lifestyle'].map(cat => (
                <span key={cat} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-black uppercase tracking-widest text-slate-400">{cat}</span>
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
            <p className="text-lg text-slate-400 leading-relaxed font-medium">
              Integrate TipHive seamlessly into external platforms. We provide low-latency, high-performance visual endpoints and script widgets that allow creators to display badges, handle tipping popups, or embed inline forms with zero external dependencies.
            </p>
          </section>

          {/* Section 1: Button API (V1) */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">1. SVG Button Badge API</h2>
            <p className="text-base text-slate-400 leading-relaxed">
              Our high-DPI button endpoint generates dynamic vector SVG badges on-the-fly. The service connects directly to your unique supporter database (counting unique tips and subscription records) and returns a responsive image asset.
            </p>

            <div className="bg-[#050507] p-6 rounded-2xl border border-white/5 space-y-4">
              <span className="text-xs font-black uppercase text-[#F7931A] tracking-wider block">Endpoint Request URI</span>
              <div className="font-mono text-sm text-white overflow-x-auto whitespace-nowrap bg-white/[0.02] p-4 rounded-xl border border-white/5">
                GET https://tiphive.com/api/v1/button?slug=YOUR_USERNAME&color=f7931a&count=true
              </div>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-6">
              <h4 className="text-lg font-bold text-white uppercase tracking-tight">API Request Properties</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400 border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-white font-bold">
                      <th className="pb-3 pr-4">Property</th>
                      <th className="pb-3 px-4">Type</th>
                      <th className="pb-3 px-4">Default</th>
                      <th className="pb-3 pl-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="py-3 pr-4 font-mono text-white">slug</td>
                      <td className="py-3 px-4 font-mono text-[#F7931A]">string</td>
                      <td className="py-3 px-4 font-mono">none</td>
                      <td className="py-3 pl-4 leading-relaxed">TipHive creator username. Required to calculate and append supporter metrics.</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-mono text-white">color</td>
                      <td className="py-3 px-4 font-mono text-[#F7931A]">string</td>
                      <td className="py-3 px-4 font-mono">f7931a</td>
                      <td className="py-3 pl-4 leading-relaxed">Accent background color in Hex format. Automatically strips leading hash and validates structure.</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-mono text-white">text</td>
                      <td className="py-3 px-4 font-mono text-[#F7931A]">string</td>
                      <td className="py-3 px-4 font-mono">Support on TipHive</td>
                      <td className="py-3 pl-4 leading-relaxed">Custom button text label. Trimmed to 80 characters for optimal canvas width fitting.</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-mono text-white">emoji</td>
                      <td className="py-3 px-4 font-mono text-[#F7931A]">string</td>
                      <td className="py-3 px-4 font-mono">⚡</td>
                      <td className="py-3 pl-4 leading-relaxed">Prefix emoji character. To render clean, text-only buttons, pass an empty string.</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-mono text-white">font</td>
                      <td className="py-3 px-4 font-mono text-[#F7931A]">string</td>
                      <td className="py-3 px-4 font-mono">Arial</td>
                      <td className="py-3 pl-4 leading-relaxed">Base SVG font face. Sanitized internally to shield against cross-site scripting vulnerabilities.</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-mono text-white">count</td>
                      <td className="py-3 px-4 font-mono text-[#F7931A]">boolean</td>
                      <td className="py-3 px-4 font-mono">false</td>
                      <td className="py-3 pl-4 leading-relaxed">Enables a visual card divider showing aggregate unique wallet supporters.</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-mono text-white">count_val</td>
                      <td className="py-3 px-4 font-mono text-[#F7931A]">integer</td>
                      <td className="py-3 px-4 font-mono">none</td>
                      <td className="py-3 pl-4 leading-relaxed">Simulates supporter numbers (0 to 999,999) for dev previews and sandboxed environments.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
              <h4 className="text-lg font-bold text-white uppercase tracking-tight">API HTTP Response Standard</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-400 font-medium">
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                  <span className="text-[#F7931A] font-bold block mb-1">Content-Type</span>
                  image/svg+xml;charset=utf-8
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                  <span className="text-[#F7931A] font-bold block mb-1">Cache-Control</span>
                  public, max-age=3600 (1 Hour)
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                  <span className="text-[#F7931A] font-bold block mb-1">CORS Header</span>
                  Access-Control-Allow-Origin: *
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Website Embedded Iframe Widget */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">2. Inline Iframe Checkout Widget</h2>
            <p className="text-base text-slate-400 leading-relaxed">
              Embed a fully interactive, lightweight tipping pane on external websites. The widget hosts a responsive container that automatically prompts wallet connections, suggested tipping tiers, and custom client messages.
            </p>

            <div className="bg-[#050507] p-6 rounded-2xl border border-white/5 space-y-4">
              <span className="text-xs font-black uppercase text-[#F7931A] tracking-wider block">Standard Iframe Embed Snippet</span>
              <div className="font-mono text-sm text-white overflow-x-auto whitespace-pre bg-white/[0.02] p-4 rounded-xl border border-white/5 leading-relaxed">
{`<iframe 
  src="https://tiphive.com/embed/YOUR_USERNAME?color=f7931a&title=Support+My+Content&desc=Help+me+fund+the+next+creative+milestone" 
  width="100%" 
  height="600" 
  frameborder="0"
  style="border: none; border-radius: 24px; max-width: 450px;">
</iframe>`}
              </div>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
              <h4 className="text-lg font-bold text-white uppercase tracking-tight">Iframe Customize Query Settings</h4>
              <ul className="space-y-3 text-sm text-slate-400 font-medium">
                <li className="flex gap-2">
                  <span className="text-white font-mono shrink-0">title</span>
                  <span className="text-slate-500">•</span>
                  <span>Overrides the default panel header (e.g. &apos;Support with Tip&apos;).</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white font-mono shrink-0">desc</span>
                  <span className="text-slate-500">•</span>
                  <span>Provides a custom subheader message description (defaults to creator profile biography).</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white font-mono shrink-0">color</span>
                  <span className="text-slate-500">•</span>
                  <span>Renders active interactive buttons and outlines in your customized hex color scheme.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3: Inline JavaScript Badge Script */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">3. Dynamic Inline Badge Script (V1)</h2>
            <p className="text-base text-slate-400 leading-relaxed">
              Avoid manually writing anchor and image tags. The dynamic script loads our button bundle, creates a clean layout wrapper, automatically requests requested parameters, and renders a smooth CSS-scaled badge.
            </p>

            <div className="bg-[#050507] p-6 rounded-2xl border border-white/5 space-y-4">
              <span className="text-xs font-black uppercase text-[#F7931A] tracking-wider block">Script Installation Snippet</span>
              <div className="font-mono text-sm text-white overflow-x-auto whitespace-pre bg-white/[0.02] p-4 rounded-xl border border-white/5 leading-relaxed">
{`<script 
  src="https://tiphive.com/api/v1/widget" 
  data-name="tiphive-button" 
  data-slug="YOUR_USERNAME" 
  data-color="f7931a" 
  data-text="Support on TipHive" 
  data-emoji="⚡"
  data-count="true">
</script>`}
              </div>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
              <h4 className="text-lg font-bold text-white uppercase tracking-tight">Script Attributes Guide</h4>
              <ul className="space-y-3 text-sm text-slate-400 font-medium">
                <li className="flex gap-2">
                  <span className="text-white font-mono shrink-0">data-name</span>
                  <span className="text-slate-500">•</span>
                  <span>Must be set precisely to <code className="text-white">tiphive-button</code> so the loader can match and target this tag.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white font-mono shrink-0">data-slug</span>
                  <span className="text-slate-500">•</span>
                  <span>Your profile username identifier.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white font-mono shrink-0">data-color</span>
                  <span className="text-slate-500">•</span>
                  <span>Hex string setting the button accent styling.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white font-mono shrink-0">data-count</span>
                  <span className="text-slate-500">•</span>
                  <span>Set to <code className="text-white">true</code> to pull active supporter counts inside the badge.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4: Floating Bubble Script Widget */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">4. Premium Floating Action Bubble (V1)</h2>
            <p className="text-base text-slate-400 leading-relaxed">
              Provide a global, floating support system. This loader appends a sleek, floating action bubble to the bottom-right of your page. When clicked, it rotates dynamically and opens a sliding sidebar iframe overlay, letting users complete checkout seamlessly.
            </p>

            <div className="bg-[#050507] p-6 rounded-2xl border border-white/5 space-y-4">
              <span className="text-xs font-black uppercase text-[#F7931A] tracking-wider block">Global Bubble Installation Snippet</span>
              <div className="font-mono text-sm text-white overflow-x-auto whitespace-pre bg-white/[0.02] p-4 rounded-xl border border-white/5 leading-relaxed">
{`<script 
  src="https://tiphive.com/api/v1/widget/loader" 
  data-slug="YOUR_USERNAME" 
  data-color="f7931a" 
  data-title="Send Support ⚡">
</script>`}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-400 font-medium">
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1">
                <span className="text-white font-bold block">Interactive Bubble (64px)</span>
                <p>Fixed positioning, border radius of 32px, box-shadow and glow coordinates synchronized to the custom color accent.</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1">
                <span className="text-white font-bold block">Animated Sidebar (400x600px)</span>
                <p>Appears smoothly with opacity and transform animations. When closed, it slides down out of view after 300ms.</p>
              </div>
            </div>
          </section>

          {/* Section 5: Branded QR Assets */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">5. QR Code Asset</h2>
            <p className="text-base text-slate-400 leading-relaxed">
              Generate branded QR assets perfect for printed banners, cards, or streaming overlays. The QR maps to your profile URI and automatically injects high-contrast, recognizable brand aesthetics.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <h4 className="text-base font-black text-white uppercase mb-2">Print Resolution</h4>
                <p className="text-sm text-slate-400 leading-relaxed">Export high-resolution PNG assets (3000x3000px) optimized for offline flyers.</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <h4 className="text-base font-black text-white uppercase mb-2">Vector Format</h4>
                <p className="text-sm text-slate-400 leading-relaxed">Export SVG vectors that scale infinitely for display billboards without losing sharpness.</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <h4 className="text-base font-black text-white uppercase mb-2">Branded Accents</h4>
                <p className="text-sm text-slate-400 leading-relaxed">Auto-embeds the signature TipHive brand logo in the core, boosting user trust.</p>
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
          {/* Header Section */}
          <section className="space-y-6">
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase">
              🔐 Smart Contracts & On-Chain Security
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed font-medium">
              Every interaction on TipHive is fully governed by open-source, non-custodial Solidity smart contracts deployed on the Mezo L2 network. With zero centralized custody or administrative balance freezes, the contract code guarantees trustless finality.
            </p>
          </section>

          {/* Security Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-emerald-400">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="text-emerald-400 font-black uppercase tracking-wider text-sm">Non-Custodial</h4>
              </div>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Funds go directly to creators or vault balances. Platform owners have absolutely zero access to freeze, move, or confiscate user assets.
              </p>
            </div>
            <div className="p-6 border border-cyan-500/20 bg-cyan-500/5 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-cyan-400">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="text-cyan-400 font-black uppercase tracking-wider text-sm">Reentrancy Shield</h4>
              </div>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Critical payout operations utilize OpenZeppelin ReentrancyGuard modifiers, ensuring full protection against cross-function call exploits.
              </p>
            </div>
            <div className="p-6 border border-[#F7931A]/20 bg-[#F7931A]/5 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-[#F7931A]">
                  <Coins className="w-5 h-5" />
                </div>
                <h4 className="text-[#F7931A] font-black uppercase tracking-wider text-sm">MUSD Centric</h4>
              </div>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                All ledger settlements are locked to 100% Bitcoin-backed MUSD stablecoins, eliminating market volatility risk for creator revenues.
              </p>
            </div>
          </div>

          {/* Tipping Contract Documentation */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">
              1. Direct Tipping Ledger (Tipping.sol)
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              The tipping contract governs immediate fan-to-creator micropayments. It manages registered creator profiles, receives MUSD transfers securely, tracks lifetime earnings, and provides high-performance on-chain paginated queries for indexing tools.
            </p>

            <div className="space-y-6">
              {/* Storage Structures */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Storage Structs & Mappings</h4>
                <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`struct Creator {
    address wallet;
    uint256 totalEarned;
    uint256 withdrawnAmount;
    bool exists;
}

struct TipRecord {
    address fan;
    address creator;
    uint256 amount;
    uint256 timestamp;
}

mapping(address => Creator) public creators;
mapping(address => uint256) public creatorBalance;
TipRecord[] public tipHistory;`}
                </pre>
              </div>

              {/* Tipping Execution Functions Table */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Execution Interface Reference</h4>
                <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/40">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Function Signature</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">State Impact</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      <tr>
                        <td className="px-4 py-3 font-mono text-cyan-400">registerCreator()</td>
                        <td className="px-4 py-3 text-slate-300">Creates profile, emits event</td>
                        <td className="px-4 py-3 text-slate-400">Idempotently registers a wallet as an active creator ledger destination.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-cyan-400">tip(address _creator, uint256 _amount)</td>
                        <td className="px-4 py-3 text-slate-300">Vault credit & Tip history record</td>
                        <td className="px-4 py-3 text-slate-400">Transfers MUSD tokens from fan to contract, increments creator Balance, appends TipRecord.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-cyan-400">withdraw(uint256 _amount)</td>
                        <td className="px-4 py-3 text-slate-300">Decreases balance, transfers out</td>
                        <td className="px-4 py-3 text-slate-400">Enforces Checks-Effects-Interactions (CEI). Deducts internal credit balance before outbound MUSD transfer.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-cyan-400">getTipHistory(uint256 offset, uint256 limit)</td>
                        <td className="px-4 py-3 text-slate-300">Read-only view query</td>
                        <td className="px-4 py-3 text-slate-400">Enables high-performance paginated queries for frontend ledgers without hitting RPC gas limits.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tipping Security Mechanics */}
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <h4 className="text-[#F7931A] font-black uppercase tracking-widest text-base mb-3">🛡️ CEI Pattern Enforcement</h4>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  To eliminate common reentrancy attack vectors, the <code className="text-white font-mono bg-white/10 px-1.5 py-0.5 rounded">withdraw</code> function updates the creator's ledger balance <strong className="font-bold text-white">before</strong> initiating the external ERC20 token transfer. This is coupled with the standard <code className="text-white font-mono bg-white/10 px-1.5 py-0.5 rounded">nonReentrant</code> guard to secure creator withdraw workflows.
                </p>
              </div>
            </div>
          </section>

          {/* Subscription Contract Documentation */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">
              2. Production-Grade Subscriptions (Subscription.sol)
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              The subscription engine introduces a trustless recurring funding standard. Designed to offer a premium, low-friction UX, the SubscriptionV2 architecture improves upon common early smart contract issues with several key technical enhancements:
            </p>

            {/* V2 Architecture Enhancements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-cyan-500/20 transition-all">
                <h4 className="text-cyan-400 font-black uppercase tracking-wider text-sm mb-2">⚡ EIP-2612 Atomic Permit Signatures</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  Permit integrations eliminate the traditional two-step transaction friction (Approve then Subscribe). Fans sign an off-chain cryptographic allowance permit, allowing checkout in a single gas-saving transaction.
                </p>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-emerald-500/20 transition-all">
                <h4 className="text-emerald-400 font-black uppercase tracking-wider text-sm mb-2">⏱️ Cancel-As-Designed Logic</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  Cancelling a subscription disables the auto-renew trigger (<code className="text-white font-mono bg-white/10 px-1 py-0.5 rounded">autoRenew = false</code>) rather than terminating access. Supporters keep premium tier access until the paid period expires.
                </p>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-purple-500/20 transition-all">
                <h4 className="text-purple-400 font-black uppercase tracking-wider text-sm mb-2">🎯 Deterministic 1-to-1 Mapping</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  Avoids duplicate subscriptions per creator plan. Keys are derived deterministically using <code className="text-white font-mono bg-white/10 px-1.5 py-0.5 rounded">keccak256(abi.encodePacked(subscriber, planId))</code> to enforce database-level consistency.
                </p>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-[#F7931A]/20 transition-all">
                <h4 className="text-[#F7931A] font-black uppercase tracking-wider text-sm mb-2">🔒 Separated Platform Accounting</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  Platform owner commissions (0.5% fee) accumulate securely inside a isolated storage balance (<code className="text-white font-mono bg-white/10 px-1.5 py-0.5 rounded">platformFeesAccumulated</code>), ensuring creators are immune to admin vault drain risks.
                </p>
              </div>
            </div>

            {/* Mappings and State Machine Description */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Subscription Structure Reference</h4>
                <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`struct Plan {
    uint256 id;
    address creator;
    string name;
    uint256 price;      // in MUSD
    uint256 duration;   // in seconds
    bool active;
    uint256 createdAt;
}

struct SubscriptionRecord {
    uint256 planId;
    address subscriber;
    address creator;
    uint256 startDate;
    uint256 endDate;
    bool autoRenew;
    uint256 totalPaid;
    uint256 renewalCount;
}`}
                </pre>
              </div>

              {/* State Machine Visualization */}
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <h4 className="text-white font-black uppercase tracking-widest text-base mb-4">🌀 Subscription State Machine Lifecycle</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm font-bold uppercase rounded-full mb-2">ACTIVE</span>
                    <p className="text-slate-300 text-sm font-medium">Valid payment, valid timeline. Auto-renewal remains active.</p>
                  </div>
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 text-sm font-bold uppercase rounded-full mb-2">CANCELLED</span>
                    <p className="text-slate-300 text-sm font-medium">Auto-renew disabled. Access remains valid until expiration date.</p>
                  </div>
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                    <span className="inline-block px-3 py-1 bg-rose-500/20 text-rose-300 text-sm font-bold uppercase rounded-full mb-2">EXPIRED</span>
                    <p className="text-slate-300 text-sm font-medium">Access timer has lapsed. Full re-activation requires manual renew call.</p>
                  </div>
                </div>
              </div>

              {/* Subscription Functions Reference Table */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Method Execution & Security Matrix</h4>
                <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/40">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Method Signature</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">UX Steps</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Impact & Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      <tr>
                        <td className="px-4 py-3 font-mono text-cyan-400">createPlan(string name, uint256 price, uint256 duration)</td>
                        <td className="px-4 py-3 text-slate-300">Creator tx only</td>
                        <td className="px-4 py-3 text-slate-400">Deploys new tier with fixed subscription fee rates and durations.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-cyan-400">subscribe(uint256 planId)</td>
                        <td className="px-4 py-3 text-slate-300">2 Steps: Approve + Send</td>
                        <td className="px-4 py-3 text-slate-400">Traditional signup. Reverts if an active subscription record exists.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-cyan-400">subscribeWithPermit(planId, price, deadline, v, r, s)</td>
                        <td className="px-4 py-3 text-slate-300">1 Step: Atomic Permitted checkout</td>
                        <td className="px-4 py-3 text-slate-400">Saves gas. Executes EIP-2612 signatures to atomically authorize and subscribe.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-cyan-400">renewSubscription(uint256 planId)</td>
                        <td className="px-4 py-3 text-slate-300">1 Step: Extends time</td>
                        <td className="px-4 py-3 text-slate-400">Extends date from the later of NOW or current endDate. Zero gap, zero wasted seconds.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-cyan-400">cancelSubscription(uint256 planId)</td>
                        <td className="px-4 py-3 text-slate-300">1 Step: Disables auto-renew</td>
                        <td className="px-4 py-3 text-slate-400">Flips autoRenew to false. Grace access window remains fully open until paid expiration time.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Callouts integration for developers */}
              <Callout type="info" title="Zero Gas Read Queries">
                Frontend applications leverage the view methods <code className="text-white font-mono bg-white/10 px-1 py-0.5 rounded">getUserSubscription</code>, <code className="text-white font-mono bg-white/10 px-1 py-0.5 rounded">isUserSubscribed</code>, and <code className="text-white font-mono bg-white/10 px-1 py-0.5 rounded">getSubscriptionStatus</code> via Viem/Wagmi read hooks. These read-only routines execute against local node state with absolutely zero gas required.
              </Callout>
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
        <div className="space-y-12">
          {/* Header Section */}
          <section className="space-y-6">
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase">The MUSD Standard</h1>
            <p className="text-xl text-slate-400 leading-relaxed font-medium">
              TipHive leverages MUSD as its primary economic unit. Minted directly on the Mezo Layer 2 network, MUSD is a decentralized, 100% Bitcoin-backed stablecoin designed to capture the liquidity of hard money without compromising on trustlessness or economic efficiency.
            </p>
          </section>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-6 bg-[#F7931A]/5 border border-[#F7931A]/20 rounded-2xl hover:border-[#F7931A]/40 transition-all">
              <h3 className="text-sm font-bold text-[#F7931A]/80 uppercase tracking-widest mb-1">Fixed Loan Rate</h3>
              <p className="text-3xl font-black text-white font-outfit">1% - 5%</p>
              <p className="text-sm text-slate-400 mt-2 font-medium">Fixed APR locked for the life of the borrow position.</p>
            </div>
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl hover:border-emerald-500/40 transition-all">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-1">Min Collateral</h3>
              <p className="text-3xl font-black text-white font-outfit">110%</p>
              <p className="text-sm text-slate-400 mt-2 font-medium">Enables a highly capital-efficient 90% max LTV ratio.</p>
            </div>
            <div className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl hover:border-cyan-500/40 transition-all">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-1">Backing Asset</h3>
              <p className="text-3xl font-black text-white font-outfit">Pure BTC</p>
              <p className="text-sm text-slate-400 mt-2 font-medium">Non-custodial, secured on-chain via tBTC infrastructure.</p>
            </div>
            <div className="p-6 bg-purple-500/5 border border-purple-500/20 rounded-2xl hover:border-purple-500/40 transition-all">
              <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-1">Repayment Schedule</h3>
              <p className="text-3xl font-black text-white font-outfit">Flexible</p>
              <p className="text-sm text-slate-400 mt-2 font-medium">No deadlines or monthly schedules. Pay back when you choose.</p>
            </div>
          </div>

          {/* Why Use MUSD Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">
              Why Borrow MUSD on Mezo L2?
            </h2>
            <p className="text-base text-slate-400 font-medium leading-relaxed">
              Traditional banking and legacy DeFi models force a painful trade-off: either sell your Bitcoin (triggering capital gains taxes and forfeiting future price appreciation) or navigate highly fragile centralized lending desks or unpredictable variable borrow rates. MUSD on Mezo L2 fundamentally solves this trilemma:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#F7931A]/10 border border-[#F7931A]/20 rounded-lg">
                    <Shield className="w-5 h-5 text-[#F7931A]" />
                  </div>
                  <h4 className="font-black text-white uppercase tracking-widest text-base">Decentralized Custody</h4>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  Unlike platforms like BlockFi, Celsius, or cbBTC which rely on corporate custodians, MUSD collateral is locked in audited smart contracts secured by tBTC’s Threshold Network. Operating since 2020 with over 17,000 BTC safely bridged, this multi-signer infrastructure is 100% transparent and verifiable 24/7 on-chain.
                </p>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="font-black text-white uppercase tracking-widest text-base">Predictable Fixed Costs</h4>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  Borrowing dollars against Bitcoin on standard lending markets (like Aave or Compound) carries variable rates fluctuating between 8% and 20% depending on market cycles. MUSD offers a guaranteed fixed interest rate of 1% to 5% APR for the exact lifetime of the loan, allowing precise long-term financial planning.
                </p>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h4 className="font-black text-white uppercase tracking-widest text-base">Maximum Capital Efficiency</h4>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  With a minimum collateralization ratio of just 110%, you can access up to 90% of your Bitcoin’s equity in a stable format. This is significantly more efficient than Aave’s 82.5% or Compound’s 80%, providing professional miners and holders with immediate, highly liquid working capital.
                </p>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <Coins className="w-5 h-5 text-purple-400" />
                  </div>
                  <h4 className="font-black text-white uppercase tracking-widest text-base">Pure Bitcoin Sovereignty</h4>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  MUSD is purely backed by BTC. It does not rely on centralized stablecoins (USDT/USDC) or alternative volatile cryptocurrencies in its reserve. This ensures the system remains sovereign, scaling linearly with the growth of the global Bitcoin economy without exposure to legacy banking blockages.
                </p>
              </div>
            </div>
          </section>

          {/* Comparison Table */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">
              Comparing Bitcoin-Backed Capital Solutions
            </h2>
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/40">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="p-4 text-sm font-bold text-white uppercase tracking-wider">Metrics</th>
                      <th className="p-4 text-sm font-bold text-white uppercase tracking-wider">MUSD (Mezo L2)</th>
                      <th className="p-4 text-sm font-bold text-white uppercase tracking-wider">Legacy Centralized Desks</th>
                      <th className="p-4 text-sm font-bold text-white uppercase tracking-wider">Standard DeFi (Aave/Compound)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="p-4 text-sm font-bold text-white">Custody Profile</td>
                      <td className="p-4 text-sm text-slate-300 font-medium">Decentralized, non-custodial tBTC</td>
                      <td className="p-4 text-sm text-slate-400 font-medium">Centralized corporate vaults</td>
                      <td className="p-4 text-sm text-slate-400 font-medium">Semi-centralized wrappers (WBTC/cbBTC)</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm font-bold text-white">Borrowing APR</td>
                      <td className="p-4 text-sm text-emerald-400 font-bold">1% - 5% Fixed</td>
                      <td className="p-4 text-sm text-slate-400 font-medium">8% - 15% Fixed</td>
                      <td className="p-4 text-sm text-slate-400 font-medium">8% - 20% Variable</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm font-bold text-white">Max Loan-to-Value (LTV)</td>
                      <td className="p-4 text-sm text-slate-300 font-medium">Up to 90% (110% ICR)</td>
                      <td className="p-4 text-sm text-slate-400 font-medium">50% - 60% Max</td>
                      <td className="p-4 text-sm text-slate-400 font-medium">80% - 82.5% Max</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm font-bold text-white">Repayment Demands</td>
                      <td className="p-4 text-sm text-emerald-400 font-medium">No deadlines. Repay at will.</td>
                      <td className="p-4 text-sm text-slate-400 font-medium">Forced monthly payments</td>
                      <td className="p-4 text-sm text-slate-400 font-medium">No deadlines. Variable interest.</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm font-bold text-white">Peg Enforcement</td>
                      <td className="p-4 text-sm text-slate-300 font-medium">On-chain direct BTC arbitrage</td>
                      <td className="p-4 text-sm text-slate-400 font-medium">Not applicable</td>
                      <td className="p-4 text-sm text-slate-400 font-medium">Indirect market liquidity</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Peg Stability Mechanics */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">
              Dual-Arbitrage Peg Enforcement
            </h2>
            <p className="text-base text-slate-400 font-medium leading-relaxed">
              MUSD maintains a pristine peg to 1.00 USD through real-time, permissionless economic incentives. Every single MUSD token is hard-backed and can be systematically redeemed for exactly 1.00 USD worth of pure BTC collateral directly on-chain:
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
                  Peg Trading Below $1.00
                </h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  When MUSD experiences selling pressure and trades at a discount (e.g. $0.90):
                </p>
                <div className="p-4 bg-black/40 rounded-xl space-y-2 border border-white/5">
                  <div className="text-sm text-slate-300 font-medium">
                    <span className="text-[#F7931A] font-bold">Step 1:</span> Arbitrageurs or borrowers purchase discounted MUSD on open markets.
                  </div>
                  <div className="text-sm text-slate-300 font-medium">
                    <span className="text-[#F7931A] font-bold">Step 2:</span> They redeem the tokens directly through the protocol smart contract.
                  </div>
                  <div className="text-sm text-slate-300 font-medium">
                    <span className="text-[#F7931A] font-bold">Step 3:</span> The protocol pays out exactly $1.00 of raw BTC collateral, pocketing a 10% instant profit. (Borrowers pay a 0% fee; others pay a 0.5% fee).
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  Peg Trading Above $1.00
                </h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  When intense demand pushes MUSD to trade at a premium (e.g. $1.10):
                </p>
                <div className="p-4 bg-black/40 rounded-xl space-y-2 border border-white/5">
                  <div className="text-sm text-slate-300 font-medium">
                    <span className="text-emerald-400 font-bold">Step 1:</span> Users deposit additional BTC collateral directly to the protocol.
                  </div>
                  <div className="text-sm text-slate-300 font-medium">
                    <span className="text-emerald-400 font-bold">Step 2:</span> They mint new MUSD stablecoins at the base $1.00 collateral valuation.
                  </div>
                  <div className="text-sm text-slate-300 font-medium">
                    <span className="text-emerald-400 font-bold">Step 3:</span> They sell the newly minted MUSD on the open market for alternative stablecoins or assets at a 10% premium profit, restoring equilibrium.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* System Safety Layers */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">
              Advanced System Safety & Multi-Layer Protections
            </h2>
            <p className="text-base text-slate-400 font-medium leading-relaxed">
              To withstand extreme black swan market declines, MUSD relies on three independent layers of automated, algorithmic protection to absorb bad debt and maintain system-wide solvent backing:
            </p>
            <div className="space-y-4 mt-4">
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="px-3 py-1 bg-[#F7931A]/10 border border-[#F7931A]/20 rounded-md text-sm font-bold text-[#F7931A] uppercase tracking-wider">
                    Layer 1
                  </div>
                  <h4 className="font-bold text-white text-base">The Stability Pool</h4>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  The primary absorber of protocol risk. When an individual borrow position falls below the critical 110% collateralization ratio, it is immediately flagged for liquidation. The Stability Pool automatically pays back the outstanding MUSD debt of that position. In return, the Stability Pool receives the entire BTC collateral of the position at a significant discount, creating a direct payout incentive for liquidity providers.
                </p>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-sm font-bold text-emerald-400 uppercase tracking-wider">
                    Layer 2
                  </div>
                  <h4 className="font-bold text-white text-base">Redistribution Mechanics</h4>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  If the Stability Pool is entirely depleted during an extremely volatile market crash, the protocol falls back to redistribution. The remaining undercollateralized debt and collateral from the liquidated position are split and assigned proportionally across all remaining healthy borrow positions in the system. Healthy, well-collateralized positions temporarily absorb a portion of the debt while acquiring the corresponding discounted BTC collateral, maintaining absolute protocol solvency.
                </p>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-md text-sm font-bold text-purple-400 uppercase tracking-wider">
                    Layer 3
                  </div>
                  <h4 className="font-bold text-white text-base">System-Wide Economic Incentives</h4>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  To ensure liquidations are triggered instantly, third-party searchers are incentivized via direct gas compensations paid from a dedicated reserve. This ensures a fully decentralized and robust liquidation desk that remains operational regardless of network congestion or centralized liquidator failures.
                </p>
              </div>
            </div>
          </section>

          {/* Tigris Economic Loop & Savings Rate */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">
              Tigris Flywheel & MUSD Savings Rate
            </h2>
            <p className="text-base text-slate-400 font-medium leading-relaxed">
              MUSD is deeply woven into Mezo’s native economic incentive engine: Tigris. All interest fees collected from MUSD loans (1%-5% fixed APR) and redemption fees (0.5%) flow directly into the MUSD protocol treasury. This treasury supports the <strong>MUSD Savings Rate</strong> staking module:
            </p>
            <div className="p-8 border border-white/10 rounded-2xl bg-black/40 space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h5 className="font-black text-white uppercase text-sm">1. Lock & Stake</h5>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">
                    Users deposit their outstanding MUSD into the Savings Rate staking module, removing it from circulating supply and locking in structural yield.
                  </p>
                </div>
                <div className="space-y-2">
                  <h5 className="font-black text-white uppercase text-sm">2. Governance Gauges</h5>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">
                    veBTC stakers vote on savings rate gauges, determining exactly how much mats emissions and Mezo chain fees (paid in native BTC) are distributed to the stakers.
                  </p>
                </div>
                <div className="space-y-2">
                  <h5 className="font-black text-white uppercase text-sm">3. Positive Feedback Loop</h5>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">
                    Higher yield incentives attract additional MUSD deposits, which in turn drives organic borrowing demand (minting fees), reinforcing the entire Mezo L2 economic engine.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )
    },

    {
      id: 'dev-setup',
      category: 'Developers',
      title: 'Dev Setup',
      content: (
        <div className="space-y-12">
          {/* Header */}
          <section className="space-y-6">
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase">🔧 Developer Setup</h1>
            <p className="text-xl text-slate-400 font-medium">Step-by-step instructions to configure and run the TipHive local development environment.</p>
          </section>

          {/* Prerequisites */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">
              Prerequisites
            </h2>
            <p className="text-base text-slate-400 font-medium leading-relaxed">
              Before setting up TipHive locally, ensure that your development machine has the following tools and accounts configured:
            </p>
            <div className="grid md:grid-cols-2 gap-6 pt-2">
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-[#F7931A]" />
                  <h4 className="font-bold text-white text-base">Node.js 20+</h4>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  LTS version is recommended. Required to run the Next.js web application, execute Hardhat smart contract commands, and launch helper utility scripts.
                </p>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-[#3ECF8E]" />
                  <h4 className="font-bold text-white text-base">Supabase Project</h4>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  A free project hosted at supabase.com. Used to provision the PostgreSQL database, manage Row Level Security (RLS), and handle real-time social/tipping channels.
                </p>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-400" />
                  <h4 className="font-bold text-white text-base">Mezo Testnet Wallet</h4>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  A non-custodial wallet (such as MetaMask or Rainbow) configured with the Mezo Testnet (Chain ID 31611) and pre-funded with testnet BTC for tipping gas fees.
                </p>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-purple-400" />
                  <h4 className="font-bold text-white text-base">Cloudinary Storage CDN</h4>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  A free account at cloudinary.com. Used to store creator profile assets and content postings media (images and videos) with global CDN delivery and optimization.
                </p>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-pink-400" />
                  <h4 className="font-bold text-white text-base">RainbowKit Application</h4>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  An authorized application inside your RainbowKit developer console (dashboard.RainbowKit.io) to enable non-custodial web3 login hooks and embedded wallets.
                </p>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400" />
                  <h4 className="font-bold text-white text-base">No External Mailer Required</h4>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  TipHive uses in-app notifications only — there is no transactional email or external mailer integration. All creator alerts (tips, likes, comments, follows, subscriptions) surface in the notification bell.
                </p>
              </div>
            </div>
          </section>

          {/* Quick Start steps */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">
              Quick Start Guide
            </h2>
            <div className="space-y-0">
              <Step number="1" title="Clone the Repository">
                <p className="text-sm text-slate-400 mb-4">
                  First, clone the TipHive repository to your local computer and navigate into the workspace root:
                </p>
                <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`git clone https://github.com/mrarindam/TipHive.git
cd TipHive`}
                </pre>
              </Step>

              <Step number="2" title="Install All Dependencies">
                <p className="text-sm text-slate-400 mb-4">
                  TipHive is now a unified workspace — a single <code className="text-white bg-white/10 px-1.5 py-0.5 rounded font-mono">npm install</code> from inside <code className="text-white bg-white/10 px-1.5 py-0.5 rounded font-mono">/web</code> pulls everything: Next.js, wagmi, Hardhat, OpenZeppelin contracts, ethers, and all toolbox plugins under one shared <code className="text-white bg-white/10 px-1.5 py-0.5 rounded font-mono">node_modules</code>.
                </p>
                <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`cd web
npm install`}
                </pre>
                <p className="text-sm text-slate-400 mt-4 leading-relaxed">
                  No separate install inside <code className="text-white bg-white/10 px-1.5 py-0.5 rounded font-mono">/contracts</code> is required — Hardhat resolves dependencies from the root <code className="text-white bg-white/10 px-1.5 py-0.5 rounded font-mono">node_modules</code> via parent traversal.
                </p>
              </Step>

              <Step number="3" title="Configure Local Environment Variables">
                <p className="text-sm text-slate-400 mb-4">
                  Create a new file named <code className="text-white bg-white/10 px-1.5 py-0.5 rounded font-mono">.env.local</code> in the root of the <code className="text-white bg-white/10 px-1.5 py-0.5 rounded font-mono">/web</code> directory. Set up the environment variables using the template below:
                </p>
                <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Web3 / Mezo Testnet (Chain ID: 31611)
NEXT_PUBLIC_TESTNET_TIPPING_CONTRACT=0x0f3B081667B24C2d62162b04CA88D6098d361Ffd
NEXT_PUBLIC_TESTNET_MUSD_ADDRESS=0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503
NEXT_PUBLIC_TESTNET_SUBSCRIPTION_CONTRACT=0x4315E5B5d64E3d650d2AD017716cf225C666aD60
NEXT_PUBLIC_TESTNET_RPC_URL=

# Web3 / Mezo Mainnet (Chain ID: 31612)
NEXT_PUBLIC_MAINNET_TIPPING_CONTRACT=0xc2fCf7dA22C53fe7137a6191b9230022A1A9a393
NEXT_PUBLIC_MAINNET_MUSD_ADDRESS=0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186
NEXT_PUBLIC_MAINNET_SUBSCRIPTION_CONTRACT=0x122C3181703b5B6A88C80a07Ac5e848bC5c1a33D
NEXT_PUBLIC_MAINNET_RPC_URL=

# Legacy configuration (default fallback)
NEXT_PUBLIC_TIPPING_CONTRACT=0x0f3B081667B24C2d62162b04CA88D6098d361Ffd
NEXT_PUBLIC_MUSD_ADDRESS=0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503
NEXT_PUBLIC_SUBSCRIPTION_CONTRACT=0x4315E5B5d64E3d650d2AD017716cf225C666aD60
NEXT_PUBLIC_MEZO_RPC_URL=
NEXT_PUBLIC_CHAIN_ID=31611

# WalletConnect Project ID (For wallet connection modal)
NEXT_PUBLIC_WC_PROJECT_ID=your-walletconnect-project-id

# Cloudinary Integration (Media CDN)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# RainbowKit Non-Custodial Authentication
NEXT_PUBLIC_RainbowKit_APP_ID=your-RainbowKit-app-id
RainbowKit_APP_SECRET=your-RainbowKit-app-secret

# Wallet Session HMAC Secret (Required, 32+ random chars)
# No email service env vars needed — TipHive sends no transactional email.
WALLET_SESSION_SECRET=replace-with-32-plus-char-random-string`}
                </pre>
              </Step>

              <Step number="4" title="Set Up Supabase Databases & Tables">
                <p className="text-sm text-slate-400 mb-4">
                  Run the SQL migrations inside your Supabase SQL Editor. The schema configures Row Level Security (RLS) policies and prepares the following key database tables:
                </p>
                <div className="grid md:grid-cols-2 gap-4 my-6">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h5 className="font-bold text-white text-sm uppercase mb-1">user_profiles</h5>
                    <p className="text-sm text-slate-400 font-medium">Unified fan & creator identities mapping wallet addresses to usernames and social details.</p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h5 className="font-bold text-white text-sm uppercase mb-1">posts</h5>
                    <p className="text-sm text-slate-400 font-medium">Creator publication records featuring text, Cloudinary media URLs, and content visibility controls.</p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h5 className="font-bold text-white text-sm uppercase mb-1">tips</h5>
                    <p className="text-sm text-slate-400 font-medium">Continuous records capturing on-chain MUSD tipping transactions and Mezo tx hashes.</p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h5 className="font-bold text-white text-sm uppercase mb-1">subscriptions & plans</h5>
                    <p className="text-sm text-slate-400 font-medium">Smart contract subscription statuses and creator-defined membership plan structures.</p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h5 className="font-bold text-white text-sm uppercase mb-1">followers</h5>
                    <p className="text-sm text-slate-400 font-medium">Real-time mapping of social interactions and creator support networks.</p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h5 className="font-bold text-white text-sm uppercase mb-1">notifications</h5>
                    <p className="text-sm text-slate-400 font-medium">Aggregated database logs feeding real-time user action logs in the activity feed.</p>
                  </div>
                </div>
                <Callout type="info" title="Authentication Integration">
                  To sync user login sessions with your Supabase database, ensure that you configure RainbowKit Webhooks or synchronizations inside your RainbowKit Developer console to sync new authenticated user wallets directly with the <code className="text-white bg-white/15 px-1 py-0.5 rounded font-mono">user_profiles</code> database table.
                </Callout>
              </Step>

              <Step number="5" title="Deploying Smart Contracts (Optional)">
                <p className="text-sm text-slate-400 mb-4">
                  If you have modified the Solidity tipping or subscription contracts, use the unified npm scripts from inside <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">/web</code> to compile and deploy via Hardhat:
                </p>
                <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`# From inside /web
npm run contracts:compile           # hardhat compile
npm run contracts:test              # hardhat test
npm run contracts:deploy:testnet    # deploy SubscriptionV2 to Mezo Testnet (chainId 31611)
npm run contracts:deploy:mainnet    # deploy to Mezo Mainnet  (chainId 31612)`}
                </pre>
                <p className="text-sm text-slate-400 mt-4 leading-relaxed">
                  Take the newly generated contract addresses from the console output and update the corresponding contract environment keys inside your <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">.env.local</code> file.
                </p>
              </Step>

              <Step number="6" title="Launch the Local Development Server">
                <p className="text-sm text-slate-400 mb-4">
                  Start the Next.js development server to compile and run the local application:
                </p>
                <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`cd web
npm run dev`}
                </pre>
                <p className="text-sm text-slate-400 mt-4 leading-relaxed">
                  Open your browser and navigate to <Link href="http://localhost:3000" className="text-[#F7931A] hover:underline font-bold">http://localhost:3000</Link>. The app will run locally and respond instantly to code edits.
                </p>
              </Step>

              <Step number="7" title="Execute TypeScript Code Verification">
                <p className="text-sm text-slate-400 mb-4">
                  Validate that all files compile correctly and do not produce type checking errors:
                </p>
                <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`npx tsc --noEmit`}
                </pre>
              </Step>
            </div>
          </section>

          {/* Repository Tree Structure */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">
              Project Directory Structure
            </h2>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              TipHive is organized as a single unified workspace at <code className="text-white bg-white/10 px-1.5 py-0.5 rounded font-mono">/web</code> — Next.js frontend, API routes, and the Hardhat smart-contract project all share one <code className="text-white bg-white/10 px-1.5 py-0.5 rounded font-mono">package.json</code> and one <code className="text-white bg-white/10 px-1.5 py-0.5 rounded font-mono">node_modules</code>:
            </p>
            <pre className="p-6 bg-black/60 border border-white/10 rounded-2xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`TipHive/
└── web/                             # Unified Next.js 16 + Hardhat workspace
    ├── package.json                 # Single manifest (Next + Hardhat deps)
    ├── node_modules/                # Single dependency tree
    ├── .env.local                   # Shared env (consumed by Next + Hardhat)
    │
    ├── contracts/                   # Hardhat project (shares root node_modules)
    │   ├── hardhat.config.js        # Solc 0.8.19 + Mezo testnet/mainnet networks
    │   ├── contracts/               # Solidity sources
    │   │   ├── Tipping.sol          # One-time tipping contract
    │   │   └── Subscription.sol     # SubscriptionV2 — recurring memberships
    │   └── scripts/                 # Deploy & verify scripts
    │       ├── deploySubscription.js
    │       └── deployMainnet.js
    │
    ├── public/                      # PWA manifest, service worker, logos, icons
    │
    └── src/
        ├── app/                     # Next.js App Router folders and routes
        │   ├── (api)/api/           # Serverless API routes (auth, profile, v1 widgets)
        │   ├── [username]/          # Creator public profile + posts/members/subs
        │   ├── dashboard/           # Creator control panels
        │   │   ├── borrow-musd/     # Mezo Trove (open/adjust/close)
        │   │   ├── tipcircle/       # Live tip ledger + supporter ranking
        │   │   ├── visual-toolkit/  # Button, widget, QR generator
        │   │   ├── createposts/     # TipTap-powered post composer
        │   │   ├── earninganalysis/ # Chart.js earnings analytics
        │   │   ├── inbox/           # Direct messages
        │   │   ├── mysubsriptions/  # Subscriptions you hold
        │   │   ├── posts/           # Your post manager
        │   │   ├── referrals/       # Referral tracking
        │   │   ├── sentsupport/     # Outgoing support history
        │   │   ├── subscriptions/   # Plan management
        │   │   └── activityfeed/    # Unified on/off-chain activity stream
        │   ├── mezo-toolkit/        # Mezo ecosystem launcher hub
        │   ├── embed/               # Iframeable widget for external sites
        │   ├── explore/             # Creator discovery feed
        │   ├── onboarding/          # First-time wallet sign-in flow
        │   ├── editprofile/         # Profile editor
        │   ├── docs/                # In-app documentation pages
        │   └── HomePageClient.tsx   # Landing page
        ├── components/              # Modular React components
        │   ├── layout/              # Navbar, Footer, NetworkSwitcher, NotificationBell
        │   ├── providers/           # Web3Provider, OnboardingGuard, WalletSwitchGuard
        │   ├── dashboard/           # SubscriptionManager, Analytics, inbox/ChatWindow
        │   ├── wallet/              # WalletProfileMenu
        │   ├── profile/             # SubscriptionSection
        │   ├── modals/              # Tip + Subscribe modals
        │   └── ui/                  # Skeletons, Modals, Buttons, Pagination, MUSDLogo
        └── lib/                     # Shared client configs and integrations
            ├── wallet-session.ts    # SIWE verify + HMAC session cookies
            ├── wallet-auth-shim.ts  # Client wallet auth state hook
            ├── chains.ts            # Mezo chain definitions + RPC config
            ├── contracts.ts         # Tipping + Subscription ABIs + addresses
            ├── borrow-contracts.ts  # Mezo Trove ABIs + addresses + constants
            ├── sanitize.ts          # DOMPurify wrapper for TipTap content
            └── supabase.ts          # Anon + service-role clients`}
            </pre>
          </section>
        </div>
      )
    },
    {
      id: 'architecture-stack',
      category: 'Developers',
      title: 'Architecture & Tech Stack',
      content: (
        <div className="space-y-12">
          {/* Header */}
          <section className="space-y-6">
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase">🏗️ Architecture & Tech Stack</h1>
            <p className="text-xl text-slate-400 font-medium">A deep dive into TipHive's technical mechanics, data flows, on-chain execution layer, and service modules.</p>
          </section>

          {/* System Diagram */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">
              High-Level Architecture
            </h2>
            <p className="text-base text-slate-400 font-medium leading-relaxed">
              TipHive is a decentralized, Web3-native tipping and subscription engine. It integrates a server-side Next.js framework, an on-chain Solidity contracts layer, and real-time backend microservices:
            </p>
            <pre className="p-6 bg-black/60 border border-white/10 rounded-2xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`┌───────────────────────────────────────────────────────────────┐
│                      Client Browser (UX)                      │
│   Next.js 16 App Router + Tailwind CSS 4 + Framer Motion      │
└──────────────┬───────────────────────────────┬────────────────┘
               │                               │
               ▼ Web3 Interface                ▼ Web API Requests
┌──────────────────────────────┐┌───────────────────────────────┐
│        Wallet (Wagmi)        ││       Next.js API Routes      │
│   RainbowKit / RainbowKit SDKs    ││           (/api/*)            │
└──────────────┬───────────────┘└──────────────┬────────────────┘
               │                               │
               ▼ RPC Calls                     ▼ DB Mutations & Alerts
┌──────────────────────────────┐┌───────────────────────────────┐
│     Blockchain Network       ││       Supabase Backend        │
│   Mezo L2 Execution Layer    ││  ┌─────────────────────────┐  │
│ ┌──────────────────────────┐ ││  │  PostgreSQL + RLS       │  │
│ │  TippingContract.sol     │ ││  ├─────────────────────────┤  │
│ ├──────────────────────────┤ ││  │  Supabase Realtime      │  │
│ │  SubscriptionContract.sol│ ││  ├─────────────────────────┤  │
│ ├──────────────────────────┤ ││  │  Row Level Security     │  │
│ │  MUSD Stablecoin ERC-20  │ ││  └─────────────────────────┘  │
│ └──────────────────────────┘ │└──────────────┬────────────────┘
└──────────────────────────────┘               │
                                               ▼ Service Synced Hooks
                                ┌───────────────────────────────┐
                                │       External Services       │
                                │  ┌───────────┐ ┌───────────┐  │
                                │  │ RainbowKit     │ │ Cloudinary│  │
                                │  │ (Identity)│ │ (Media)   │  │
                                │  ├───────────┤ ├───────────┤  │
                                │  │ Notif Bell│ │ Wallet    │  │
                                │  │ (In-App)  │ │ Connect   │  │
                                │  └───────────┘ └───────────┘  │
                                └───────────────────────────────┘`}
            </pre>
          </section>

          {/* Tech Stack Tables */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">
              Core Technologies
            </h2>
            
            <div className="space-y-6">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Frontend Application</h3>
              <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/40">
                <table className="w-full border-collapse text-left text-sm text-slate-300">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Technology</th>
                      <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Version</th>
                      <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    <tr>
                      <td className="p-4 font-bold text-white">Next.js</td>
                      <td className="p-4 text-[#F7931A] font-mono">16</td>
                      <td className="p-4 text-slate-400">Core framework supporting React Server Components (RSC), page layouts, and serverless API endpoints.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white">React</td>
                      <td className="p-4 text-[#F7931A] font-mono">19</td>
                      <td className="p-4 text-slate-400">Declarative UI library rendering dynamic interactive creator dashboards.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white">Tailwind CSS</td>
                      <td className="p-4 text-[#F7931A] font-mono">v4</td>
                      <td className="p-4 text-slate-400">Modern utility-first framework powering beautiful, responsive responsive layout styles.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white">Framer Motion</td>
                      <td className="p-4 text-[#F7931A] font-mono">—</td>
                      <td className="p-4 text-slate-400">Sleek layout animation engine handling page transitions and micro-interactions.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white">Lenis CSS</td>
                      <td className="p-4 text-[#F7931A] font-mono">—</td>
                      <td className="p-4 text-slate-400">Physics-based smooth scroll controller enhancing navigation.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Web3 & On-Chain Layer</h3>
              <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/40">
                <table className="w-full border-collapse text-left text-sm text-slate-300">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Component</th>
                      <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Standard</th>
                      <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    <tr>
                      <td className="p-4 font-bold text-white">Mezo L2</td>
                      <td className="p-4 text-[#F7931A] font-mono">Bitcoin Layer 2</td>
                      <td className="p-4 text-slate-400">Bitcoin Economic Layer providing absolute transaction security and fast settlements.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white">MUSD Contract</td>
                      <td className="p-4 text-[#F7931A] font-mono">ERC-20 Stablecoin</td>
                      <td className="p-4 text-slate-400">Stable Bitcoin-backed asset serving as the primary payment unit across the platform.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white">Tipping.sol</td>
                      <td className="p-4 text-[#F7931A] font-mono">Solidity Contract</td>
                      <td className="p-4 text-slate-400">Decentralized, non-custodial smart contract orchestrating instant wallet-to-wallet support transfers.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white">Subscription.sol</td>
                      <td className="p-4 text-[#F7931A] font-mono">Solidity Contract</td>
                      <td className="p-4 text-slate-400">Recurring membership subscription engine enforcing payment schedules and tier accesses.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white">Wagmi / Viem</td>
                      <td className="p-4 text-[#F7931A] font-mono">v3 Hooks Suite</td>
                      <td className="p-4 text-slate-400">Type-safe Ethereum JSON-RPC client wrappers syncing smart contract reads & writes.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Backend & Integration Modules</h3>
              <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/40">
                <table className="w-full border-collapse text-left text-sm text-slate-300">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Module</th>
                      <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Integration</th>
                      <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    <tr>
                      <td className="p-4 font-bold text-white">Supabase Suite</td>
                      <td className="p-4 text-[#3ECF8E] font-mono">PostgreSQL + Realtime</td>
                      <td className="p-4 text-slate-400">Unified profile database, real-time message sockets, and PostgreSQL row policies.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white">RainbowKit Auth</td>
                      <td className="p-4 text-pink-400 font-mono">Identity Provider</td>
                      <td className="p-4 text-slate-400">Non-custodial, high-fidelity user wallet manager supporting social OAuths and OTPs.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white">Cloudinary CDN</td>
                      <td className="p-4 text-purple-400 font-mono">Media Cloud</td>
                      <td className="p-4 text-slate-400">Optimized media uploading backend and delivery CDN encoding image & video contents.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white">In-App Notifications</td>
                      <td className="p-4 text-blue-400 font-mono">notifications table</td>
                      <td className="p-4 text-slate-400">All alerts (tips, likes, comments, follows, subscriptions) are inserted into Supabase and surfaced via the in-app notification bell. No external mailer is used.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Data Flow Patterns */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">
              Data Flow Patterns
            </h2>

            <div className="space-y-8">
              <div>
                <h4 className="font-bold text-white text-base mb-2">1. Server Components (Read Path)</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-4">
                  Next.js Server Components query Supabase database states directly on the server, avoiding unnecessary client-side fetch requests and reducing JavaScript bundle weight:
                </p>
                <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`Browser Request
  → Next.js Page (React Server Component)
    → Direct Supabase PostgreSQL query
      → Row Level Security (RLS) policies evaluated
    ← Fetched data payload
  ← Rendered glassmorphic HTML`}
                </pre>
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-2">2. API Routes (Write Path)</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-4">
                  Actions that edit profile configurations, update notifications, or save settings route securely via API handlers:
                </p>
                <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`Client POST/PATCH/DELETE
  → Next.js Route Handler (/api/profile)
    → Session Authenticator Checks (RainbowKit SDK verifying JWT headers)
    → Data Input Validation & Sanitization
    → Supabase Postgres Mutation
  ← JSON Success Response`}
                </pre>
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-2">3. On-Chain Tipping Transaction Flow</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-4">
                  Unlike traditional platforms where payment splits are manually distributed, TipHive tipping settles directly on-chain within 5 seconds with zero intermediate cuts:
                </p>
                <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`Fan clicks custom tip in MUSD
  → Wagmi triggers TippingContract.tip(creatorAddress, amount)
    → User MetaMask or Rainbow Wallet signs transaction
      → Transaction executed and confirmed on Mezo L2 Network
        → Smart contract emits TipSent event
        → Client API POST /api/tips registers transaction in Supabase PostgreSQL
        → Real-time subscription updates creator's profile dashboard
        → In-app notification appears in the creator's notification bell`}
                </pre>
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-2">4. Subscription Activation Flow</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-4">
                  Creator memberships are fully governed by Solidity contracts, ensuring perpetual monetization without reliance on centralized payment networks:
                </p>
                <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`Supporter purchases a tier membership (Bronze/Silver/Gold)
  → Wagmi triggers SubscriptionContract.subscribe(creator, tierId, price)
    → Wallet confirmation & settlement on Mezo L2
      → API POST /api/subscriptions updates state in Supabase
      → Supabase Row Level Security (RLS) dynamically unlocks paywalled posts
      → Supporter gains instant access to supporters-only content`}
                </pre>
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-2">5. Admin Client Pattern</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-4">
                  Privileged database mutations that run safely on the server side use the Supabase Service Role Key to bypass RLS policies where necessary (such as creating initial database profile profiles on first connect):
                </p>
                <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`import { createClient } from '@supabase/supabase-js';

// Setup admin client bypassing Row Level Security
export const sbAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);`}
                </pre>
              </div>
            </div>
          </section>

          {/* Key Design Decisions */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">
              Key Architectural Decisions
            </h2>
            <div className="grid md:grid-cols-2 gap-6 pt-2">
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all">
                <h4 className="font-bold text-white text-base mb-2">Why Mezo L2 & MUSD?</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  Mezo's EVM compatibility allows us to deploy industry-grade Solidity contracts. By adopting the stable MUSD unit, we protect users from cryptocurrency price volatility while taking advantage of gas fees under fractions of a cent, making minor tipping payouts highly feasible.
                </p>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all">
                <h4 className="font-bold text-white text-base mb-2">Why Wallet-Only SIWE?</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  TipHive uses Sign-In With Ethereum (EIP-4361). Visitors connect any browser extension wallet (MetaMask, Rainbow, Coinbase, Phantom) or scan a WalletConnect QR from a mobile wallet, then sign a single message to prove ownership. There are no email logins, no Google OAuth, and no embedded wallets — your wallet is your identity, and TipHive never sees a password.
                </p>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all">
                <h4 className="font-bold text-white text-base mb-2">Why Supabase + Cloudinary?</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  By routing social operations (such as follower relationships, likes, comments, and direct messaging) through Supabase PostgreSQL, we obtain instant WebSocket synchronization. Media uploads are offloaded directly to Cloudinary, ensuring swift content streaming and responsive resizing without taxing our server.
                </p>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all">
                <h4 className="font-bold text-white text-base mb-2">Why Server Components?</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  Rendering public creator profiles and exploratory feeds on the server allows us to fetch relational database data prior to page display. This ensures optimal SEO visibility, search engine indexing, and rapid page-load times across mobile browsers.
                </p>
              </div>
            </div>
          </section>
        </div>
      )
    },
    {
      id: 'database-schema',
      category: 'Developers',
      title: 'Database Schema',
      content: (
        <div className="space-y-12">
          {/* Header */}
          <section className="space-y-6">
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase">🗄️ Database Schema</h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed">
              TipHive database architecture is built on Supabase PostgreSQL. This document outlines the physical tables, relational constraints, triggers, and Row Level Security (RLS) rules that govern user profiles, post monetization, and content subscription security.
            </p>
          </section>

          {/* ERD Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">
              Entity Relationship Diagram
            </h2>
            <p className="text-slate-400 leading-relaxed font-medium">
              The diagram below visualizes the physical table structures and their foreign key linkages inside TipHive. Arrows represent many-to-one and one-to-one foreign key constraints:
            </p>
            <pre className="p-6 bg-black/60 border border-white/10 rounded-2xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed my-6">
{`┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  user_profiles   │       │      posts       │       │    followers     │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │←┐     │ id (PK)          │       │ id (PK)          │
│ wallet_address   │ │     │ creator_id (FK)  │──┐    │ follower_id (FK) │──→ user_profiles.id
│ username         │ │     │ title            │  │    │ creator_id (FK)  │──→ user_profiles.id
│ display_name     │ └─────│ content          │  │    └──────────────────┘
│ bio              │       │ image_url        │  │
│ avatar_url       │       │ video_url        │  │    ┌──────────────────┐
│ banner_url       │       │ visibility       │  │    │    post_likes    │
│ total_earned     │       │ category         │  │    ├──────────────────┤
│ is_creator       │       │ created_at       │  │    │ id (PK)          │
│ verified_on_chain│       └──────────────────┘  ├─→  │ post_id (FK)     │──→ posts.id
│ created_at       │                             │    │ user_address     │
└──────────────────┘                             │    └──────────────────┘
         ↑                                       │
         │                                       │    ┌──────────────────┐
         │                                       │    │  post_comments   │
         │                                       │    ├──────────────────┤
         │                                       ├─→  │ id (PK)          │
         │                                            │ post_id (FK)     │──→ posts.id
         │                                            │ user_address     │
         │                                            │ content          │
         │                                            └──────────────────┘
         │
 ┌───────┴──────────┐       ┌──────────────────┐       ┌──────────────────┐
 │subscription_plans│       │  subscriptions   │       │       tips       │
 ├──────────────────┤       ├──────────────────┤       ├──────────────────┤
 │ id (PK)          │←┐     │ id (PK)          │       │ id (PK)          │
 │ creator_address  │ │     │ plan_id (FK)     │       │ from_address     │
 │ name             │ └─────│ fan_address      │       │ to_address       │
 │ price            │       │ creator_address  │       │ amount           │
 │ duration         │       │ active           │       │ tx_hash          │
 │ welcome_note     │       │ start_date       │       │ chain_id         │
 │ perks (JSONB)    │       │ end_date         │       │ message          │
 └──────────────────┘       └──────────────────┘       └──────────────────┘`}
            </pre>
          </section>

          {/* Database Tables & Fields */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">
              Database Tables & Fields
            </h2>

            {/* user_profiles */}
            <div className="space-y-4">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Database className="w-5 h-5 text-[#F7931A]" />
                user_profiles
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Unified fan and creator identities mapping RainbowKit-authenticated user IDs, wallet addresses, handles, customize preferences, and social details.
              </p>
              
              <div className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Column</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Type</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Constraints</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">id</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">UUID</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">PRIMARY KEY</td>
                        <td className="p-4 text-slate-400 text-sm">Unique profile identifier, matching RainbowKit authenticated wallet address or Supabase user identifier.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">wallet_address</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">UNIQUE, NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">Public Ethereum-compatible wallet address parsed from authenticated state.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">username</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">UNIQUE</td>
                        <td className="p-4 text-slate-400 text-sm">Unique alphanumeric handle used in public routing endpoints and profile URLs.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">display_name</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-slate-400 text-sm">-</td>
                        <td className="p-4 text-slate-400 text-sm">Public display name shown on profile header layouts.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">bio</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-slate-400 text-sm">-</td>
                        <td className="p-4 text-slate-400 text-sm">Biographical profile description (max 500 characters).</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">avatar_url</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-slate-400 text-sm">-</td>
                        <td className="p-4 text-slate-400 text-sm">Image URL directing to user's profile avatar asset.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">banner_url</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-slate-400 text-sm">-</td>
                        <td className="p-4 text-slate-400 text-sm">Image URL pointing to profile header background banner.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">location</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-slate-400 text-sm">-</td>
                        <td className="p-4 text-slate-400 text-sm">Optional virtual or geographic location information.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">social_links</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">JSONB</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: &apos;&#123;&#125;&apos;</td>
                        <td className="p-4 text-slate-400 text-sm">Structured handles for external social integrations (GitHub, Twitter/X, Discord, Website).</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">is_creator</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">BOOLEAN</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: false</td>
                        <td className="p-4 text-slate-400 text-sm">Indicates whether creator features and subscription setup options are active.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">creator_category</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-slate-400 text-sm">-</td>
                        <td className="p-4 text-slate-400 text-sm">Category classification facilitating discoverability in directory searches.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">creator_description</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-slate-400 text-sm">-</td>
                        <td className="p-4 text-slate-400 text-sm">Extended description summarizing creator core content offerings.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">button_text</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: &apos;Buy Me a Coffee ☕&apos;</td>
                        <td className="p-4 text-slate-400 text-sm">Custom call-to-action text displayed on the tipping interface.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">thank_you_message</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: &apos;Thank you for the support! 🎉&apos;</td>
                        <td className="p-4 text-slate-400 text-sm">Custom appreciation message shown to supporters post-tip confirmation.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">suggested_amounts</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">JSONB</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: [5, 25, 50]</td>
                        <td className="p-4 text-slate-400 text-sm">Array of standard tipping amounts denominated in stable MUSD currency.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">total_earned</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">NUMERIC</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: 0</td>
                        <td className="p-4 text-slate-400 text-sm">Aggregated index of all on-chain tips received on-platform.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">verified_on_chain</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">BOOLEAN</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: false</td>
                        <td className="p-4 text-slate-400 text-sm">Whether user has validated identity credentials directly on the blockchain.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">referral_code</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">UNIQUE</td>
                        <td className="p-4 text-slate-400 text-sm">Unique string used in user referral links.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">referred_by</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-slate-400 text-sm">-</td>
                        <td className="p-4 text-slate-400 text-sm">Wallet address of the referral agent who referred the user.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">created_at</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TIMESTAMPTZ</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: now()</td>
                        <td className="p-4 text-slate-400 text-sm">Timestamp documenting when the profile record was created.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">updated_at</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TIMESTAMPTZ</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: now()</td>
                        <td className="p-4 text-slate-400 text-sm">Timestamp capturing the last change of the profile record.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* followers */}
            <div className="space-y-4">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Database className="w-5 h-5 text-[#F7931A]" />
                followers
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Maps user-to-creator social follow networks, driving main feeds and real-time dashboard notifications.
              </p>
              
              <div className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Column</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Type</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Constraints</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">id</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">UUID</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">PRIMARY KEY, DEFAULT</td>
                        <td className="p-4 text-slate-400 text-sm">Unique follower mapping record identifier.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">follower_id</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">UUID</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">FOREIGN KEY REFERENCES user_profiles.id</td>
                        <td className="p-4 text-slate-400 text-sm">User profile ID of the fan who initiates the follow action.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">creator_id</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">UUID</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">FOREIGN KEY REFERENCES user_profiles.id</td>
                        <td className="p-4 text-slate-400 text-sm">User profile ID of the content creator being followed.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">created_at</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TIMESTAMPTZ</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: now()</td>
                        <td className="p-4 text-slate-400 text-sm">Timestamp capturing when the follower relationship was logged.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* posts */}
            <div className="space-y-4">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Database className="w-5 h-5 text-[#F7931A]" />
                posts
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Main publication logs, storing textual write-ups and links to Cloudinary assets with native access restrictions.
              </p>
              
              <div className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Column</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Type</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Constraints</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">id</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">UUID</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">PRIMARY KEY, DEFAULT</td>
                        <td className="p-4 text-slate-400 text-sm">Unique post record identifier.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">creator_id</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">UUID</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">FOREIGN KEY REFERENCES user_profiles.id</td>
                        <td className="p-4 text-slate-400 text-sm">User profile ID of the creator posting the content.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">title</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">Post title header (max 100 characters).</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">content</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">Main body content supporting rich HTML and markdown structures.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">image_url</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-slate-400 text-sm">-</td>
                        <td className="p-4 text-slate-400 text-sm">Cloudinary CDN asset link for attached images.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">video_url</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-slate-400 text-sm">-</td>
                        <td className="p-4 text-slate-400 text-sm">Cloudinary CDN asset link for uploaded video streams.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">visibility</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: &apos;public&apos;</td>
                        <td className="p-4 text-slate-400 text-sm">Security access check constraint: &apos;public&apos; or &apos;subscribers&apos;.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">category</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-slate-400 text-sm">-</td>
                        <td className="p-4 text-slate-400 text-sm">Optional tag designating subject matter categorization.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">created_at</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TIMESTAMPTZ</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: now()</td>
                        <td className="p-4 text-slate-400 text-sm">Timestamp logging publication creation.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">updated_at</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TIMESTAMPTZ</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: now()</td>
                        <td className="p-4 text-slate-400 text-sm">Timestamp logging the last modification date.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* post_likes */}
            <div className="space-y-4">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Database className="w-5 h-5 text-[#F7931A]" />
                post_likes
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Tracks user like interactions on published creator posts.
              </p>
              
              <div className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Column</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Type</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Constraints</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">id</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">UUID</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">PRIMARY KEY, DEFAULT</td>
                        <td className="p-4 text-slate-400 text-sm">Unique like association record identifier.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">post_id</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">UUID</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">FOREIGN KEY REFERENCES posts.id</td>
                        <td className="p-4 text-slate-400 text-sm">Target post being liked.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">user_address</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">Wallet address of the fan initiating the like.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">created_at</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TIMESTAMPTZ</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: now()</td>
                        <td className="p-4 text-slate-400 text-sm">Timestamp documentation of social log event.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* post_comments */}
            <div className="space-y-4">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Database className="w-5 h-5 text-[#F7931A]" />
                post_comments
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Tracks user comments on published creator posts, facilitating real-time social discussion.
              </p>
              
              <div className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Column</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Type</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Constraints</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">id</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">UUID</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">PRIMARY KEY, DEFAULT</td>
                        <td className="p-4 text-slate-400 text-sm">Unique comment record identifier.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">post_id</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">UUID</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">FOREIGN KEY REFERENCES posts.id</td>
                        <td className="p-4 text-slate-400 text-sm">Target post being commented on.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">user_address</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">Wallet address of the fan creating the comment.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">content</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">Comment text body.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">created_at</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TIMESTAMPTZ</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: now()</td>
                        <td className="p-4 text-slate-400 text-sm">Comment publication timestamp.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* tips */}
            <div className="space-y-4">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Database className="w-5 h-5 text-[#F7931A]" />
                tips
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Tracks successful on-chain stable MUSD tipping transfers settled on the Mezo L2 network.
              </p>
              
              <div className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Column</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Type</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Constraints</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">id</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">UUID</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">PRIMARY KEY, DEFAULT</td>
                        <td className="p-4 text-slate-400 text-sm">Unique tipping transaction log identifier.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">from_address</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">Wallet address of the fan initiating the tip.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">to_address</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">Wallet address of the creator receiving the tip.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">amount</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">NUMERIC</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">Tip value size denominated in stable token format (MUSD).</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">tx_hash</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">UNIQUE, NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">On-chain transaction hash receipt from Mezo L2 network.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">chain_id</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">INTEGER</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: 31611</td>
                        <td className="p-4 text-slate-400 text-sm">Network identifier representing the target blockchain (e.g. 31611 for Testnet, 31612 for Mainnet).</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">message</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-slate-400 text-sm">-</td>
                        <td className="p-4 text-slate-400 text-sm">Optional message or custom memo recorded by the supporter.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">created_at</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TIMESTAMPTZ</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: now()</td>
                        <td className="p-4 text-slate-400 text-sm">Database synchronization logging timestamp.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* subscription_plans */}
            <div className="space-y-4">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Database className="w-5 h-5 text-[#F7931A]" />
                subscription_plans
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Stores pricing tiers, welcome notes, on-chain identifier references, and custom perks for creator membership packages.
              </p>
              
              <div className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Column</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Type</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Constraints</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">id</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">UUID</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">PRIMARY KEY, DEFAULT</td>
                        <td className="p-4 text-slate-400 text-sm">Unique plan configuration record identifier.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">creator_address</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">Wallet address of the creator hosting the plan.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">name</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">Designation name of membership plan tier (e.g. Legend Pass).</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">price</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">NUMERIC</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">Price denominated in stable MUSD currency.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">duration</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">BIGINT</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">Validity period of the membership plan in seconds.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">description</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">Detailed overview outlining plan values.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">perks</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">JSONB</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: &apos;[]&apos;</td>
                        <td className="p-4 text-slate-400 text-sm">Custom perks array listing user benefits (e.g. exclusive channels).</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">active</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">BOOLEAN</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: true</td>
                        <td className="p-4 text-slate-400 text-sm">Logical toggle tracking if plan tier is open to purchase.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">welcome_note</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-slate-400 text-sm">-</td>
                        <td className="p-4 text-slate-400 text-sm">Custom welcome greeting delivered to new fans on purchase.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">chain_plan_id</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">INTEGER</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">The tier index registered inside Solidity smart contracts.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">chain_id</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">INTEGER</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: 31611</td>
                        <td className="p-4 text-slate-400 text-sm">EVM chain identifier.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">created_at</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TIMESTAMPTZ</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: now()</td>
                        <td className="p-4 text-slate-400 text-sm">Record creation date.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">updated_at</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TIMESTAMPTZ</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: now()</td>
                        <td className="p-4 text-slate-400 text-sm">Last update date.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* subscriptions */}
            <div className="space-y-4">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Database className="w-5 h-5 text-[#F7931A]" />
                subscriptions
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Tracks active fan-to-creator memberships, governing visibility RLS filters for supporter-only post access.
              </p>
              
              <div className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Column</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Type</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Constraints</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">id</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">UUID</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">PRIMARY KEY, DEFAULT</td>
                        <td className="p-4 text-slate-400 text-sm">Unique database subscription record mapping identifier.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">subscription_hash</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">UNIQUE</td>
                        <td className="p-4 text-slate-400 text-sm">Unique hash identifying the subscription on-chain.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">fan_address</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">Wallet address of the subscribed fan.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">creator_address</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">Wallet address of the creator being supported.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">plan_id</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">UUID</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">FOREIGN KEY REFERENCES subscription_plans.id</td>
                        <td className="p-4 text-slate-400 text-sm">Link detailing pricing plan configurations.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">start_date</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TIMESTAMPTZ</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">Active plan commencement timestamp.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">end_date</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TIMESTAMPTZ</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">Membership expiration date on-chain.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">active</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">BOOLEAN</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: true</td>
                        <td className="p-4 text-slate-400 text-sm">Logical switch documenting whether membership features remain unlocked.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">total_paid</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">NUMERIC</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: 0</td>
                        <td className="p-4 text-slate-400 text-sm">Accumulated aggregate of payments processed for this plan.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">renewal_count</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">INTEGER</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: 0</td>
                        <td className="p-4 text-slate-400 text-sm">Times the membership has been renewed.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">tx_hash</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">On-chain transaction signature logging creation.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">chain_id</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">INTEGER</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: 31611</td>
                        <td className="p-4 text-slate-400 text-sm">EVM chain identifier.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">created_at</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TIMESTAMPTZ</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: now()</td>
                        <td className="p-4 text-slate-400 text-sm">Mapping creation timestamp.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* notifications */}
            <div className="space-y-4">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Database className="w-5 h-5 text-[#F7931A]" />
                notifications
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Stores high-priority user alerts supporting custom notification banners and interactive feed elements.
              </p>
              
              <div className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Column</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Type</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Constraints</th>
                        <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">id</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">UUID</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">PRIMARY KEY, DEFAULT</td>
                        <td className="p-4 text-slate-400 text-sm">Unique notification log identifier.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">user_address</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">Wallet address of the target user profile receiving the alert.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">type</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">Event classification categorization: &apos;tip&apos;, &apos;subscription&apos;, &apos;like&apos;, &apos;comment&apos;, or &apos;follow&apos;.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">content</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-[#F7931A] font-mono text-sm">NOT NULL</td>
                        <td className="p-4 text-slate-400 text-sm">Dynamic text description detailing event updates to the user.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">is_read</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">BOOLEAN</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: false</td>
                        <td className="p-4 text-slate-400 text-sm">Toggle tracking status of user read action.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">tx_hash</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TEXT</td>
                        <td className="p-4 text-slate-400 text-sm">-</td>
                        <td className="p-4 text-slate-400 text-sm">Optional on-chain transaction hash for linking to explorer scans.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-white font-mono text-sm">created_at</td>
                        <td className="p-4 text-[#3ECF8E] font-mono text-sm">TIMESTAMPTZ</td>
                        <td className="p-4 text-slate-400 text-sm">DEFAULT: now()</td>
                        <td className="p-4 text-slate-400 text-sm">Notification arrival timestamp.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Row Level Security Policies */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#F7931A]" />
              Row Level Security (RLS) Policies
            </h2>
            <p className="text-slate-400 leading-relaxed font-medium">
              PostgreSQL Row Level Security (RLS) is enabled globally on all tables. Supabase policies ensure data isolation by confirming the caller wallet signature matches the target database rows.
            </p>
            
            <div className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Table Name</th>
                      <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Action</th>
                      <th className="p-4 font-black uppercase text-white tracking-wider text-xs">SQL Policy Definition</th>
                      <th className="p-4 font-black uppercase text-white tracking-wider text-xs">Security Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    <tr>
                      <td className="p-4 font-bold text-white font-mono text-sm">user_profiles</td>
                      <td className="p-4 text-blue-400 font-mono text-sm">SELECT</td>
                      <td className="p-4 text-[#3ECF8E] font-mono text-sm">true</td>
                      <td className="p-4 text-slate-400 text-sm">Public profile directory lookup. Anyone can search and explore profiles.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white font-mono text-sm">user_profiles</td>
                      <td className="p-4 text-yellow-500 font-mono text-sm">UPDATE</td>
                      <td className="p-4 text-[#3ECF8E] font-mono text-sm">auth.uid() = id</td>
                      <td className="p-4 text-slate-400 text-sm">Profile configuration lock. Users can only edit their own profile fields.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white font-mono text-sm">posts</td>
                      <td className="p-4 text-blue-400 font-mono text-sm">SELECT</td>
                      <td className="p-4 text-[#3ECF8E] font-mono text-sm">
                        visibility = &apos;public&apos; OR auth.uid() = creator_id OR (visibility = &apos;subscribers&apos; AND EXISTS (...))
                      </td>
                      <td className="p-4 text-slate-400 text-sm">
                        Paywall guard. Accesses subscribers-only posts if reader has an active on-chain subscription or is the creator.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white font-mono text-sm">posts</td>
                      <td className="p-4 text-green-400 font-mono text-sm">INSERT</td>
                      <td className="p-4 text-[#3ECF8E] font-mono text-sm">auth.uid() = creator_id</td>
                      <td className="p-4 text-slate-400 text-sm">Creator publication verification. Prevents masquerading as another creator.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white font-mono text-sm">posts</td>
                      <td className="p-4 text-[#f43f5e] font-mono text-sm">ALL</td>
                      <td className="p-4 text-[#3ECF8E] font-mono text-sm">auth.uid() = creator_id</td>
                      <td className="p-4 text-slate-400 text-sm">Restricts publishing modifications and post deletions to creator owner.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white font-mono text-sm">post_likes</td>
                      <td className="p-4 text-blue-400 font-mono text-sm">SELECT</td>
                      <td className="p-4 text-[#3ECF8E] font-mono text-sm">true</td>
                      <td className="p-4 text-slate-400 text-sm">Allows public directory calculation of content social stats.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white font-mono text-sm">post_likes</td>
                      <td className="p-4 text-green-400 font-mono text-sm">INSERT/DELETE</td>
                      <td className="p-4 text-[#3ECF8E] font-mono text-sm">auth.uid() IS NOT NULL</td>
                      <td className="p-4 text-slate-400 text-sm">Restricts likes configuration to validated authenticated user addresses.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white font-mono text-sm">post_comments</td>
                      <td className="p-4 text-blue-400 font-mono text-sm">SELECT</td>
                      <td className="p-4 text-[#3ECF8E] font-mono text-sm">true</td>
                      <td className="p-4 text-slate-400 text-sm">Enables public comment timelines to download and render.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white font-mono text-sm">post_comments</td>
                      <td className="p-4 text-green-400 font-mono text-sm">INSERT/DELETE</td>
                      <td className="p-4 text-[#3ECF8E] font-mono text-sm">auth.uid() IS NOT NULL</td>
                      <td className="p-4 text-slate-400 text-sm">Only authenticated profiles are authorized to insert comments on content.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white font-mono text-sm">tips</td>
                      <td className="p-4 text-blue-400 font-mono text-sm">SELECT</td>
                      <td className="p-4 text-[#3ECF8E] font-mono text-sm">
                        auth.uid() IN (SELECT id FROM user_profiles WHERE wallet_address IN (from_address, to_address))
                      </td>
                      <td className="p-4 text-slate-400 text-sm">Tip ledger privacy lock. Details are only visible to sender, receiver, or system admin.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white font-mono text-sm">subscriptions</td>
                      <td className="p-4 text-blue-400 font-mono text-sm">SELECT</td>
                      <td className="p-4 text-[#3ECF8E] font-mono text-sm">
                        auth.uid() IN (SELECT id FROM user_profiles WHERE wallet_address IN (fan_address, creator_address))
                      </td>
                      <td className="p-4 text-slate-400 text-sm">Restricts active subscription inspection to active supporter or creator.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white font-mono text-sm">subscription_plans</td>
                      <td className="p-4 text-blue-400 font-mono text-sm">SELECT</td>
                      <td className="p-4 text-[#3ECF8E] font-mono text-sm">true</td>
                      <td className="p-4 text-slate-400 text-sm">Allows public checks on pricing structures for creator signups.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white font-mono text-sm">subscription_plans</td>
                      <td className="p-4 text-[#f43f5e] font-mono text-sm">ALL</td>
                      <td className="p-4 text-[#3ECF8E] font-mono text-sm">
                        auth.uid() = (SELECT id FROM user_profiles WHERE wallet_address = creator_address)
                      </td>
                      <td className="p-4 text-slate-400 text-sm">Grants absolute authority over tier settings to the managing creator.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white font-mono text-sm">followers</td>
                      <td className="p-4 text-blue-400 font-mono text-sm">SELECT</td>
                      <td className="p-4 text-[#3ECF8E] font-mono text-sm">true</td>
                      <td className="p-4 text-slate-400 text-sm">Public social lookup. Enables follower index updates.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white font-mono text-sm">followers</td>
                      <td className="p-4 text-green-400 font-mono text-sm">INSERT/DELETE</td>
                      <td className="p-4 text-[#3ECF8E] font-mono text-sm">auth.uid() = follower_id</td>
                      <td className="p-4 text-slate-400 text-sm">Prevents logging follow/unfollow events on behalf of other profiles.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white font-mono text-sm">notifications</td>
                      <td className="p-4 text-blue-400 font-mono text-sm">SELECT/UPDATE</td>
                      <td className="p-4 text-[#3ECF8E] font-mono text-sm">
                        auth.uid() = (SELECT id FROM user_profiles WHERE wallet_address = user_address)
                      </td>
                      <td className="p-4 text-slate-400 text-sm">Private inbox security. User alerts are isolated to the destination recipient.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Database Functions & Triggers */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-[#F7931A]" />
              Database Functions & Triggers
            </h2>
            <p className="text-slate-400 leading-relaxed font-medium">
              TipHive automates database operations and profile synchronizations on identity events using standard PL/pgSQL database triggers.
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-white text-base mb-2">1. Profile Sync Trigger (handle_new_user)</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-4">
                  When a user registers or logs in with RainbowKit for the first time, a new database record is logged in the Supabase <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">auth.users</code> database. An automated database trigger propagates the wallet address, wallet address token, and system defaults directly into the <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">public.user_profiles</code> directory:
                </p>
                <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    wallet_address,
    username,
    display_name,
    avatar_url,
    RainbowKit_wallet address,
    suggested_amounts,
    button_text,
    thank_you_message,
    is_creator,
    total_earned
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'wallet_address', ''),
    LOWER(REGEXP_REPLACE(new.raw_user_meta_data->>'username', '[^a-zA-Z0-9]', '', 'g')),
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'avatar_url',
    new.id,
    '[5, 25, 50]'::jsonb,
    'Buy Me a Coffee ☕',
    'Thank you for the support! 🎉',
    false,
    0
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`}
                </pre>
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-2">2. Dynamic Timestamp Trigger (update_modified_column)</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-4">
                  Ensures all table modification timestamps (<code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">updated_at</code>) are synchronized automatically when row records undergo a mutation operation:
                </p>
                <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Executed across profiles, posts, plans, etc.
CREATE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();`}
                </pre>
              </div>
            </div>
          </section>
        </div>
      )
    },
    {
      id: 'api-reference',
      category: 'Developers',
      title: 'API Reference',
      content: (
        <div className="space-y-12">
          {/* Main Header */}
          <section className="space-y-6">
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase flex items-center gap-3">
              <Code className="w-10 h-10 text-[#F7931A]" />
              API Reference
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed">
              Integrate TipHive tipping mechanics, supporter statistics, and interactive overlay panels directly into third-party sites, applications, or AI agent toolkits.
            </p>
          </section>

          {/* Public API v1 Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-[#F7931A]" />
              Public API (v1) — Visual Integration Toolkit
            </h2>
            <p className="text-slate-300 font-medium leading-relaxed">
              All Public API (v1) endpoints are globally versioned, fully CORS-enabled, and accessible by third-party clients and custom scripts without authentication. The base URL is:
            </p>
            <div className="p-4 bg-black/60 border border-white/10 rounded-xl font-mono text-sm text-[#F7931A] font-bold">
              https://tiphive.com/api/v1
            </div>

            <div className="space-y-8">
              {/* Endpoint 1 */}
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-black uppercase rounded-lg">GET</span>
                  <code className="text-lg font-mono font-bold text-white">/api/v1/button</code>
                </div>
                <p className="text-slate-300 leading-relaxed font-medium">
                  Renders a dynamically-generated, customizable SVG supporter badge on-the-fly. The supporter count is calculated dynamically by scanning the database for unique wallet addresses that have sent tips or started subscriptions to the creator's wallet.
                </p>

                <h4 className="font-bold text-white text-base mt-4 mb-2">Query Parameters</h4>
                <div className="overflow-x-auto border border-white/10 rounded-xl bg-black/40">
                  <table className="min-w-full divide-y divide-white/5">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Parameter</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Default</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300 text-sm font-medium">
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">slug</td>
                        <td className="px-4 py-3 text-slate-400">string</td>
                        <td className="px-4 py-3 text-slate-500">—</td>
                        <td className="px-4 py-3 text-slate-300">Required. The unique creator handle/username (case-insensitive database match).</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">text</td>
                        <td className="px-4 py-3 text-slate-400">string</td>
                        <td className="px-4 py-3 text-white">"Support on TipHive"</td>
                        <td className="px-4 py-3 text-slate-300">Custom label to show inside the button. Max length 80 characters.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">emoji</td>
                        <td className="px-4 py-3 text-slate-400">string</td>
                        <td className="px-4 py-3 text-white">"⚡"</td>
                        <td className="px-4 py-3 text-slate-300">Custom prefix emoji. Left empty to hide.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">color</td>
                        <td className="px-4 py-3 text-slate-400">string</td>
                        <td className="px-4 py-3 text-white">"f7931a"</td>
                        <td className="px-4 py-3 text-slate-300">Hex code of badge background (omit leading #). Falls back to orange on invalid inputs.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">font</td>
                        <td className="px-4 py-3 text-slate-400">string</td>
                        <td className="px-4 py-3 text-white">"Arial, sans-serif"</td>
                        <td className="px-4 py-3 text-slate-300">CSS font family to style the badge text. Max length 80 characters.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">count</td>
                        <td className="px-4 py-3 text-slate-400">boolean</td>
                        <td className="px-4 py-3 text-white">"false"</td>
                        <td className="px-4 py-3 text-slate-300">Set to "true" to enable dynamic supporter count and heart icon layout.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">count_val</td>
                        <td className="px-4 py-3 text-slate-400">number</td>
                        <td className="px-4 py-3 text-slate-500">—</td>
                        <td className="px-4 py-3 text-slate-300">Hardcoded count value to display for testing or visual previews (bounds: 0-999999).</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h4 className="font-bold text-white text-base mt-4 mb-2">Visual Snippet Example</h4>
                <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`<img 
  src="https://tiphive.com/api/v1/button?slug=alice&count=true&color=f7931a" 
  alt="Support Alice on TipHive" 
/>`}
                </pre>
              </div>

              {/* Endpoint 2 */}
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-black uppercase rounded-lg">GET</span>
                  <code className="text-lg font-mono font-bold text-white">/api/v1/widget</code>
                </div>
                <p className="text-slate-300 leading-relaxed font-medium">
                  A direct Javascript loader script that generates and appends an interactive supporter button inline at the target location. The injected element automatically listens to hover state events, scaling with a smooth transition layout (<code className="text-[#F7931A] font-bold">scale(1.05)</code>).
                </p>

                <h4 className="font-bold text-white text-base mt-4 mb-2">Configuration Attributes</h4>
                <div className="overflow-x-auto border border-white/10 rounded-xl bg-black/40">
                  <table className="min-w-full divide-y divide-white/5">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Attribute</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Default</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300 text-sm font-medium">
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">data-name</td>
                        <td className="px-4 py-3 text-slate-400">string</td>
                        <td className="px-4 py-3 text-slate-500">Required</td>
                        <td className="px-4 py-3 text-slate-300">Must be set explicitly to "tiphive-button" for selector resolution.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">data-slug</td>
                        <td className="px-4 py-3 text-slate-400">string</td>
                        <td className="px-4 py-3 text-white">"creator"</td>
                        <td className="px-4 py-3 text-slate-300">Creator's username handle. Tapping redirects visitors to the creator's page.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">data-color</td>
                        <td className="px-4 py-3 text-slate-400">string</td>
                        <td className="px-4 py-3 text-white">"f7931a"</td>
                        <td className="px-4 py-3 text-slate-300">Accent background hex color (exclude #).</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">data-emoji</td>
                        <td className="px-4 py-3 text-slate-400">string</td>
                        <td className="px-4 py-3 text-white">"⚡"</td>
                        <td className="px-4 py-3 text-slate-300">The icon emoji shown on the badge.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">data-text</td>
                        <td className="px-4 py-3 text-slate-400">string</td>
                        <td className="px-4 py-3 text-white">"Support on TipHive"</td>
                        <td className="px-4 py-3 text-slate-300">Main button text label.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">data-font</td>
                        <td className="px-4 py-3 text-slate-400">string</td>
                        <td className="px-4 py-3 text-white">"Arial"</td>
                        <td className="px-4 py-3 text-slate-300">System font styling.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">data-count</td>
                        <td className="px-4 py-3 text-slate-400">boolean</td>
                        <td className="px-4 py-3 text-slate-500">—</td>
                        <td className="px-4 py-3 text-slate-300">Include this attribute to query and render the live supporter count badge.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h4 className="font-bold text-white text-base mt-4 mb-2">Integration Snippet</h4>
                <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`<script 
  src="https://tiphive.com/api/v1/widget" 
  data-name="tiphive-button" 
  data-slug="alice" 
  data-color="f7931a" 
  data-emoji="⚡" 
  data-text="Support Alice on TipHive" 
  data-count="true"
></script>`}
                </pre>
              </div>

              {/* Endpoint 3 */}
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-black uppercase rounded-lg">GET</span>
                  <code className="text-lg font-mono font-bold text-white">/api/v1/widget/loader</code>
                </div>
                <p className="text-slate-300 leading-relaxed font-medium">
                  A high-end visual widget loader script. It injects a sleek Floating Action Bubble (FAB) pinned to the bottom-right corner (<code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">bottom: 24px, right: 24px, zIndex: 9999</code>). Clicking the bubble rotates the action icon and toggles a smooth sliding overlay panel frame showing the creator's full tipping page directly within `/embed/[slug]`.
                </p>

                <h4 className="font-bold text-white text-base mt-4 mb-2">Configuration Attributes</h4>
                <div className="overflow-x-auto border border-white/10 rounded-xl bg-black/40">
                  <table className="min-w-full divide-y divide-white/5">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Attribute</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Default</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300 text-sm font-medium">
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">data-slug</td>
                        <td className="px-4 py-3 text-slate-400">string</td>
                        <td className="px-4 py-3 text-white">"creator"</td>
                        <td className="px-4 py-3 text-slate-300">Required. The username of the creator whose embedded overlay panel is activated.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">data-color</td>
                        <td className="px-4 py-3 text-slate-400">string</td>
                        <td className="px-4 py-3 text-white">"f7931a"</td>
                        <td className="px-4 py-3 text-slate-300">Theme color of the action bubble and surrounding borders (exclude #).</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">data-title</td>
                        <td className="px-4 py-3 text-slate-400">string</td>
                        <td className="px-4 py-3 text-white">"Support on TipHive"</td>
                        <td className="px-4 py-3 text-slate-300">The title label passed directly into the iframe's header panel.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h4 className="font-bold text-white text-base mt-4 mb-2">Integration Snippet</h4>
                <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`<script 
  src="https://tiphive.com/api/v1/widget/loader" 
  data-slug="alice" 
  data-color="f7931a" 
  data-title="Support Alice on TipHive"
></script>`}
                </pre>
              </div>
            </div>
          </section>

          {/* Internal API Suite Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-[#F7931A]" />
              Internal API Suite
            </h2>
            <p className="text-slate-300 font-medium leading-relaxed">
              These APIs run under the primary dashboard environment. Tipping mutations, notifications settings, and profile updates use standard Next.js API Routes. Endpoints that require user authentication check the <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">Authorization: Bearer &lt;token&gt;</code> header with a valid RainbowKit wallet access token.
            </p>
            <div className="p-4 bg-black/60 border border-white/10 rounded-xl font-mono text-sm text-[#F7931A] font-bold">
              https://tiphive.com/api
            </div>

            <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/40">
              <table className="min-w-full divide-y divide-white/5">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Method</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Endpoint</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Auth</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Details & Behaviors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 text-sm font-medium">
                  <tr>
                    <td className="px-4 py-3"><span className="px-2.5 py-0.5 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-black rounded">GET</span></td>
                    <td className="px-4 py-3 font-mono text-white">/profile</td>
                    <td className="px-4 py-3 text-slate-400">Optional</td>
                    <td className="px-4 py-3 text-slate-300">Retrieves a creator's public profile data (custom suggested amounts, on-chain verification flags, total earnings) using their RainbowKit wallet address or wallet address.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3"><span className="px-2.5 py-0.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-black rounded">PATCH</span></td>
                    <td className="px-4 py-3 font-mono text-white">/profile</td>
                    <td className="px-4 py-3 text-[#F7931A] font-bold">Required</td>
                    <td className="px-4 py-3 text-slate-300">Updates profile configurations (display name, bio, avatars, location, custom suggested amounts, categories). Validates username format limits (3-24 characters, alphanumeric and underscores) and checks uniqueness before committing.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3"><span className="px-2.5 py-0.5 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-black rounded">GET</span></td>
                    <td className="px-4 py-3 font-mono text-white">/profile/check-username</td>
                    <td className="px-4 py-3 text-slate-400">Optional</td>
                    <td className="px-4 py-3 text-slate-300">Lightweight check to query the profiles table and verify if the requested username is available.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3"><span className="px-2.5 py-0.5 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-black rounded">GET</span></td>
                    <td className="px-4 py-3 font-mono text-white">/notifications</td>
                    <td className="px-4 py-3 text-[#F7931A] font-bold">Required</td>
                    <td className="px-4 py-3 text-slate-300">Fetches a paginated, reverse-chronological stream of creator alerts and notifications based on the user's active wallet or wallet address.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3"><span className="px-2.5 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-black rounded">POST</span></td>
                    <td className="px-4 py-3 font-mono text-white">/notifications</td>
                    <td className="px-4 py-3 text-[#F7931A] font-bold">Required</td>
                    <td className="px-4 py-3 text-slate-300">Executes alert state mutations. Supports <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">markAllRead</code> to dismiss alerts, or <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">create</code> to insert a follow, like, or comment notification row. Notifications are in-app only — the alert surfaces in the recipient's notification bell. No email is sent.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3"><span className="px-2.5 py-0.5 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-black rounded">GET</span></td>
                    <td className="px-4 py-3 font-mono text-white">/referrals</td>
                    <td className="px-4 py-3 text-[#F7931A] font-bold">Required</td>
                    <td className="px-4 py-3 text-slate-300">Retrieves the collection of users referred by the authenticated wallet address, alongside total counts and referral signup timestamps.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3"><span className="px-2.5 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-black rounded">POST</span></td>
                    <td className="px-4 py-3 font-mono text-white">/upload</td>
                    <td className="px-4 py-3 text-[#F7931A] font-bold">Required</td>
                    <td className="px-4 py-3 text-slate-300">Handles media assets. Generates secure, signed Cloudinary signature hashes for authenticated client-side uploads, or proxies small files directly into Cloudinary CDN.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3"><span className="px-2.5 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-black rounded">POST</span></td>
                    <td className="px-4 py-3 font-mono text-white">/auth/nonce</td>
                    <td className="px-4 py-3 text-slate-400">Optional</td>
                    <td className="px-4 py-3 text-slate-300">Issues a one-time SIWE nonce that the client embeds into the EIP-4361 message before requesting the wallet signature.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3"><span className="px-2.5 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-black rounded">POST</span></td>
                    <td className="px-4 py-3 font-mono text-white">/auth/verify</td>
                    <td className="px-4 py-3 text-slate-400">Optional</td>
                    <td className="px-4 py-3 text-slate-300">Verifies the signed SIWE message, upserts the wallet into <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">user_profiles</code>, and sets an HMAC-signed session cookie keyed off <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">WALLET_SESSION_SECRET</code>.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3"><span className="px-2.5 py-0.5 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-black rounded">GET</span></td>
                    <td className="px-4 py-3 font-mono text-white">/auth/session</td>
                    <td className="px-4 py-3 text-slate-400">Optional</td>
                    <td className="px-4 py-3 text-slate-300">Returns the currently authenticated wallet address by validating the session cookie's HMAC signature, or <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">null</code> if no valid cookie is present.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3"><span className="px-2.5 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-black rounded">POST</span></td>
                    <td className="px-4 py-3 font-mono text-white">/auth/logout</td>
                    <td className="px-4 py-3 text-[#F7931A] font-bold">Required</td>
                    <td className="px-4 py-3 text-slate-300">Clears the session cookie. The wallet itself is never disconnected — only the server-side session is invalidated.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* API Error Responses Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-[#F7931A]" />
              API Error Responses
            </h2>
            <p className="text-slate-300 font-medium leading-relaxed">
              All TipHive API endpoints use standard HTTP status codes to indicate the outcome of requests. Errors are returned as a JSON object containing a descriptive explanation:
            </p>
            <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`{
  "error": "Detailed description explaining what went wrong"
}`}
            </pre>

            <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/40">
              <table className="min-w-full divide-y divide-white/5">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Status Code</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Reason</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Common Triggers & Resolutions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 text-sm font-medium">
                  <tr>
                    <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">400</td>
                    <td className="px-4 py-3 text-white">Bad Request</td>
                    <td className="px-4 py-3 text-slate-300">Returned when mandatory fields are missing, search parameters are invalid, or request body validation failed (e.g. malformed email syntax).</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">401</td>
                    <td className="px-4 py-3 text-white">Unauthorized</td>
                    <td className="px-4 py-3 text-slate-300">Returned when no Bearer session token is present in the request headers, or if the provided RainbowKit access token has expired.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">403</td>
                    <td className="px-4 py-3 text-white">Forbidden</td>
                    <td className="px-4 py-3 text-slate-300">Returned when security signature checks succeed, but the authenticated user does not have permission to modify the target resource.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">404</td>
                    <td className="px-4 py-3 text-white">Not Found</td>
                    <td className="px-4 py-3 text-slate-300">Returned when the requested resource (e.g. user profile handle, message, or file mapping) does not exist in the database.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">409</td>
                    <td className="px-4 py-3 text-white">Conflict</td>
                    <td className="px-4 py-3 text-slate-300">Returned when a database constraint violation occurs, such as attempting to register a username that is already claimed by another active profile.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">429</td>
                    <td className="px-4 py-3 text-white">Too Many Requests</td>
                    <td className="px-4 py-3 text-slate-300">Returned when an IP or user exceeds rate limit safety quotas. Tipping triggers and upload signers enforce defensive limiters to prevent sybil exploits.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono font-bold text-[#F7931A]">500</td>
                    <td className="px-4 py-3 text-white">Internal Server Error</td>
                    <td className="px-4 py-3 text-slate-300">Returned when database connections fail, or an unhandled server-side exception occurs. Contact support if issues persist.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )
    },
    {
      id: 'auth-security',
      category: 'Developers',
      title: 'Authentication & Security',
      content: (
        <div className="space-y-12">
          {/* Main Header */}
          <section className="space-y-6">
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase flex items-center gap-3">
              <Shield className="w-10 h-10 text-[#F7931A]" />
              Authentication & Security
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed">
              Security parameters, identity verification, and non-custodial guardrails in the TipHive creator economy.
            </p>
          </section>

          {/* Authentication Protocols Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-[#F7931A]" />
              Authentication & Session Management
            </h2>
            <p className="text-slate-300 font-medium leading-relaxed">
              TipHive enforces a robust non-custodial login flow using <strong className="font-bold text-white">Sign-In With Ethereum (EIP-4361)</strong>. Users retain full ownership over their cryptographic keys and wallets, skipping central credential storage entirely.
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-white text-base mb-2">1. Identity Verification Flow</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-4">
                  Visitors connect any browser extension wallet (MetaMask, Rainbow, Coinbase, Phantom) or scan a WalletConnect QR from a mobile wallet, then sign a single SIWE message to prove ownership. There are no email logins, no Google or social OAuth, and no embedded wallets — your wallet is your identity.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-2">2. Server-Side Session Cookie</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-4">
                  After the SIWE message is signed, the server verifies the signature, then issues an HMAC-SHA256 signed session cookie keyed off the <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">WALLET_SESSION_SECRET</code> environment variable. The cookie is HttpOnly, SameSite=Lax, and session-only (no <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">maxAge</code>) — closing the browser logs the user out:
                </p>
                <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`// /api/auth/verify validates the SIWE signature
const { address } = await verifySiweMessage(message, signature);

// Server signs a session payload with HMAC-SHA256
const cookie = signWalletSession(address, process.env.WALLET_SESSION_SECRET);
response.cookies.set('tiphive_session', cookie, {
  httpOnly: true,
  sameSite: 'lax',
});`}
                </pre>
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-2">3. Supabase Integration Sync</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-4">
                  Upon verification, the system upserts the connected wallet address into the <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">user_profiles</code> table and routes the user to onboarding (for first-time wallets) or directly to the dashboard.
                </p>
              </div>
            </div>
          </section>

          {/* Row Level Security (RLS) Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-[#F7931A]" />
              Row Level Security (RLS) Policies
            </h2>
            <p className="text-slate-300 font-medium leading-relaxed">
              Every database table in our Supabase schema enforces strict PostgreSQL RLS policies. Even in the event of client bundle exposure or compromised anonymous API keys, direct database queries via PostgREST are blocked from accessing or altering private records.
            </p>

            <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/40">
              <table className="min-w-full divide-y divide-white/5">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Database Table</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">SELECT Policy</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">INSERT Policy</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">UPDATE/DELETE Policy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 text-sm font-medium">
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">user_profiles</td>
                    <td className="px-4 py-3 text-slate-300">Public — anyone can query and view active creator profiles.</td>
                    <td className="px-4 py-3 text-slate-300">Authenticated — requires a matching RainbowKit wallet address session check.</td>
                    <td className="px-4 py-3 text-slate-300">Owner only — compares session wallet address directly to the record's ID.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">posts</td>
                    <td className="px-4 py-3 text-slate-300">Public/Subscribers — free content is open; premium plans check active subscriptions.</td>
                    <td className="px-4 py-3 text-slate-300">Owner only — verifies poster matches authenticated profile.</td>
                    <td className="px-4 py-3 text-slate-300">Owner only — only poster is authorized to edit or delete content.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">tips</td>
                    <td className="px-4 py-3 text-slate-300">Participant only — visible to sender and recipient addresses.</td>
                    <td className="px-4 py-3 text-slate-300">Public — open inserts are permitted during dynamic on-chain payment logging.</td>
                    <td className="px-4 py-3 text-slate-300">Disabled — transactions are immutable; updates and deletes are blocked.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">subscriptions</td>
                    <td className="px-4 py-3 text-slate-300">Public/Participants — visible to fans, creators, and dynamic query lookups.</td>
                    <td className="px-4 py-3 text-slate-300">Service role only — syncs and updates are strictly written by background transaction listeners.</td>
                    <td className="px-4 py-3 text-slate-300">Disabled — subscription logs are immutable.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">notifications</td>
                    <td className="px-4 py-3 text-slate-300">Recipient only — queried by matching recipient wallet or wallet address.</td>
                    <td className="px-4 py-3 text-slate-300">Authenticated — anyone can create follow, like, or comment alerts.</td>
                    <td className="px-4 py-3 text-slate-300">Recipient only — recipient matches session wallet address to dismiss or clear.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Rate Limiting Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-6 h-6 text-[#F7931A]" />
              Rate Limiting & Defensive Shielding
            </h2>
            <p className="text-slate-300 font-medium leading-relaxed">
              We implement defensive rate limiting powered by <strong className="font-bold text-white">Upstash Redis</strong> using a sliding window algorithm to safeguard server-side endpoints from brute-force attempts and bot spam.
            </p>

            <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/40">
              <table className="min-w-full divide-y divide-white/5">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Protected Endpoint</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Limit Threshold</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Primary Defensive Goal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 text-sm font-medium">
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">POST /api/upload</td>
                    <td className="px-4 py-3 text-slate-300">30 request calls per hour</td>
                    <td className="px-4 py-3 text-slate-300">Blocks asset uploading abuse, limiting signed signature requests.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">POST /api/notifications</td>
                    <td className="px-4 py-3 text-slate-300">60 request calls per minute</td>
                    <td className="px-4 py-3 text-slate-300">Throttles follow/like/comment alert triggers to prevent system noise.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <Info className="w-5 h-5 text-blue-400" />
                <h4 className="font-black uppercase tracking-widest text-sm text-blue-400">Graceful Degradation</h4>
              </div>
              <p className="text-slate-300 font-medium leading-relaxed text-sm">
                If the underlying Redis infrastructure undergoes an outage, the system automatically defaults to a permissive state, allowing client requests to proceed unblocked. Keeping user services available is our primary goal.
              </p>
            </div>
          </section>

          {/* Input Validation & Sanitization */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-[#F7931A]" />
              Input Validation & Sanitization
            </h2>
            <p className="text-slate-300 font-medium leading-relaxed">
              We validate all text and identifier inputs on the server before database ingestion, enforcing type and pattern safety:
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-white text-base mb-2">1. Input Format & Constraints</h4>
                <div className="overflow-x-auto border border-white/10 rounded-xl bg-black/40">
                  <table className="min-w-full divide-y divide-white/5">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Field Type</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Regular Expression / Bounds</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Enforced Constraints</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300 text-sm font-medium">
                      <tr>
                        <td className="px-4 py-3 font-bold text-white">Wallet Address</td>
                        <td className="px-4 py-3 font-mono text-[#F7931A]">/^0x[a-fA-F0-9]&#123;40&#125;$/</td>
                        <td className="px-4 py-3 text-slate-300">Requires standard hex formatting (length of 42 characters).</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold text-white">Username</td>
                        <td className="px-4 py-3 font-mono text-[#F7931A]">/^[a-z0-9_]&#123;3,24&#125;$/</td>
                        <td className="px-4 py-3 text-slate-300">Limits length between 3 and 24 characters; lowercase letters, numbers, and underscores only.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold text-white">Email Address</td>
                        <td className="px-4 py-3 font-mono text-[#F7931A]">/^[^\s@]+@[^\s@]+\.[^\s@]+$/</td>
                        <td className="px-4 py-3 text-slate-300">Ensures correct syntax for any optional contact email captured at the profile boundary.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold text-white">Link URLs</td>
                        <td className="px-4 py-3 font-mono text-slate-400">—</td>
                        <td className="px-4 py-3 text-slate-300">URLs must lead with http:// or https:// patterns to mitigate XSS links.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-2">2. Disposable Email Blocklist</h4>
                <p className="text-slate-300 leading-relaxed font-medium mb-3">
                  To prevent duplicate signups and defensive sybil spam, any notification email change checks the domain registry against a strict blocklist. Blocked providers include:
                </p>
                <div className="p-4 bg-black/60 border border-white/10 rounded-xl font-mono text-sm text-[#F7931A] leading-relaxed">
                  mailinator.com, tempmail.com, throwaway.email, guerrillamail.com, sharklasers.com, grr.la, guerrillamailblock.com, yopmail.com, fakeinbox.com, trashmail.com, dispostable.com, maildr{"o"}p.cc, 10minutemail.com, temp-mail.org, tempail.com, test.com, example.com, foo.com, bar.com, asdf.com, noreply.com, nowhere.com
                </div>
              </div>
            </div>
          </section>

          {/* Secure Environment & Cron Jobs */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-6 h-6 text-[#F7931A]" />
              Secure API Operations
            </h2>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-white text-base mb-2">1. Cron Endpoint Protection</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-4">
                  Sensitive weekly live check triggers and daily database cleanups require a cryptographically secure token passed inside the HTTP authorization header. Request executions lacking a valid token are rejected immediately:
                </p>
                <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`GET /api/cron/check-live-urls
Authorization: Bearer {CRON_SECRET}`}
                </pre>
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-2">2. Client vs Server Env Isolation</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-4">
                  Client-exposed values are limited to the Supabase endpoint URL and anonymous keys, which are built to be public. Private keys (such as `SUPABASE_SERVICE_ROLE_KEY`, `RainbowKit_APP_SECRET`, and `CLOUDINARY_API_SECRET`) are never packaged inside client bundles. The service role key is reserved strictly for backend administration tasks.
                </p>
              </div>
            </div>
          </section>

          {/* Threat Model Matrix */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-[#F7931A]" />
              Threat Model & Mitigations
            </h2>
            <p className="text-slate-300 font-medium leading-relaxed">
              Our comprehensive security posture is designed to counter common Web3 and database exploit vectors:
            </p>

            <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/40">
              <table className="min-w-full divide-y divide-white/5">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Potential Attack Vector</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">TipHive Mitigation Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 text-sm font-medium">
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">Unauthorized database reads/writes</td>
                    <td className="px-4 py-3 text-slate-300">Enforced Supabase Row Level Security (RLS) on every table, blocking unauthorized direct queries via PostgREST API keys.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">Session Hijacking & XSS exploits</td>
                    <td className="px-4 py-3 text-slate-300">RainbowKit-managed cryptographic JWTs. Social and external wallets utilize secure signature verification with short expiration times.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">Sybil Attacks & Registry Spam</td>
                    <td className="px-4 py-3 text-slate-300">Active email validation utilizing regex matching alongside a strict disposable email domain blocklist.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">Cross-Site Scripting (XSS) in links</td>
                    <td className="px-4 py-3 text-slate-300">Strict regular expression validations block non-http protocols (e.g. javascript: schemes), and render content via React's automatic script escaping blocks.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">Direct PostgREST API mutations</td>
                    <td className="px-4 py-3 text-slate-300">Database triggers validate identity constraints. Public visual toolkit calls use read-only queries with restricted access structures.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )
    },
    {
      id: 'deployment-infra',
      category: 'Developers',
      title: 'Deployment & Infrastructure',
      content: (
        <div className="space-y-12">
          {/* Main Header */}
          <section className="space-y-6">
            <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase flex items-center gap-3">
              <SlidersHorizontal className="w-10 h-10 text-[#F7931A]" />
              Deployment & Infrastructure
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed">
              Production environments, serverless deployment workflows, database migrations, caching architectures, and scalability pathways.
            </p>
          </section>

          {/* Core Hosting Infrastructure */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-[#F7931A]" />
              Core Hosting Platforms
            </h2>
            <p className="text-slate-300 font-medium leading-relaxed">
              TipHive is deployed using a distributed architecture designed for low-latency client rendering, highly secure transactional integrity, and edge-optimized data delivery:
            </p>
            <ul className="list-disc pl-5 space-y-3 text-slate-300 text-sm font-medium">
              <li>
                <strong className="font-bold text-white">Production Hosting on Vercel:</strong> Our Next.js App Router application is fully optimized for Vercel, deploying automatically on every git push to the main branch.
              </li>
              <li>
                <strong className="font-bold text-white">Edge Functions for API Routing:</strong> Low-latency edge middleware handles geographical rate-limiting and session validations instantly.
              </li>
              <li>
                <strong className="font-bold text-white">Serverless Execution Layer:</strong> Serverless functions handle heavier computation and SIWE signature verification for wallet-based authentication.
              </li>
              <li>
                <strong className="font-bold text-white">Global Asset Delivery:</strong> Vercel Global CDN handles fast static asset caching, while media uploads are optimized and served globally via Cloudinary.
              </li>
              <li>
                <strong className="font-bold text-white">Auto-Managed HTTPS & SSL:</strong> Full automatic SSL termination protects all first-party API routes and embeds.
              </li>
            </ul>
          </section>

          {/* Environment Variables Table */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-6 h-6 text-[#F7931A]" />
              Environment Setup & Vercel Configuration
            </h2>
            <p className="text-slate-300 font-medium leading-relaxed">
              Define the following production environment variables in the Vercel Dashboard under <strong className="font-bold text-white">Settings &gt; Environment Variables</strong>:
            </p>

            <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/40">
              <table className="min-w-full divide-y divide-white/5">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Variable Name</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Required</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Execution Scope</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Purpose Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 text-sm font-medium">
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">NEXT_PUBLIC_SUPABASE_URL</td>
                    <td className="px-4 py-3 text-green-400 font-bold">Yes</td>
                    <td className="px-4 py-3">Client & Server</td>
                    <td className="px-4 py-3 text-slate-400">Endpoint target for API routing and public data syncing.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">NEXT_PUBLIC_SUPABASE_ANON_KEY</td>
                    <td className="px-4 py-3 text-green-400 font-bold">Yes</td>
                    <td className="px-4 py-3">Client & Server</td>
                    <td className="px-4 py-3 text-slate-400">Anonymous database API key. Secure RLS policies restrict operations.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">NEXT_PUBLIC_SITE_URL</td>
                    <td className="px-4 py-3 text-green-400 font-bold">Yes</td>
                    <td className="px-4 py-3">Client & Server</td>
                    <td className="px-4 py-3 text-slate-400">Determines host domains for CORS headers and RainbowKit redirect URLs.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">SUPABASE_SERVICE_ROLE_KEY</td>
                    <td className="px-4 py-3 text-green-400 font-bold">Yes</td>
                    <td className="px-4 py-3 text-yellow-400">Server Only</td>
                    <td className="px-4 py-3 text-slate-400">Privileged bypass key. Used for backend cron operations. Never expose to clients.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">NEXT_PUBLIC_RainbowKit_APP_ID</td>
                    <td className="px-4 py-3 text-green-400 font-bold">Yes</td>
                    <td className="px-4 py-3">Client & Server</td>
                    <td className="px-4 py-3 text-slate-400">Binds connection modals with your RainbowKit application dashboard.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">RainbowKit_APP_SECRET</td>
                    <td className="px-4 py-3 text-green-400 font-bold">Yes</td>
                    <td className="px-4 py-3 text-yellow-400">Server Only</td>
                    <td className="px-4 py-3 text-slate-400">Decrypts and validates RainbowKit-issued user identity JWT tokens.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">NEXT_PUBLIC_TIPPING_CONTRACT</td>
                    <td className="px-4 py-3 text-green-400 font-bold">Yes</td>
                    <td className="px-4 py-3">Client & Server</td>
                    <td className="px-4 py-3 text-slate-400">Mezo L2 tipping contract address executing on-chain transfers.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">NEXT_PUBLIC_MUSD_ADDRESS</td>
                    <td className="px-4 py-3 text-green-400 font-bold">Yes</td>
                    <td className="px-4 py-3">Client & Server</td>
                    <td className="px-4 py-3 text-slate-400">The ERC-20 contract address of the mUSD stablecoin on Mezo.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">NEXT_PUBLIC_SUBSCRIPTION_CONTRACT</td>
                    <td className="px-4 py-3 text-green-400 font-bold">Yes</td>
                    <td className="px-4 py-3">Client & Server</td>
                    <td className="px-4 py-3 text-slate-400">Direct contract managing supporter recurring subscription channels.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">NEXT_PUBLIC_MEZO_RPC_URL</td>
                    <td className="px-4 py-3 text-green-400 font-bold">Yes</td>
                    <td className="px-4 py-3">Client & Server</td>
                    <td className="px-4 py-3 text-slate-400">Provider gateway URL for smart contract gas estimation.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">UPSTASH_REDIS_REST_URL</td>
                    <td className="px-4 py-3 text-slate-400">No</td>
                    <td className="px-4 py-3 text-yellow-400">Server Only</td>
                    <td className="px-4 py-3 text-slate-400">Redis URL backing our sliding window rate-limiting middleware.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">UPSTASH_REDIS_REST_TOKEN</td>
                    <td className="px-4 py-3 text-slate-400">No</td>
                    <td className="px-4 py-3 text-yellow-400">Server Only</td>
                    <td className="px-4 py-3 text-slate-400">Redis authorization token checking client rate quotas.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">WALLET_SESSION_SECRET</td>
                    <td className="px-4 py-3 text-green-400 font-bold">Yes</td>
                    <td className="px-4 py-3 text-yellow-400">Server Only</td>
                    <td className="px-4 py-3 text-slate-400">Random secret (≥32 chars) used to HMAC-sign SIWE session cookies. The server throws on boot if this is missing.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">CRON_SECRET</td>
                    <td className="px-4 py-3 text-green-400 font-bold">Yes</td>
                    <td className="px-4 py-3 text-yellow-400">Server Only</td>
                    <td className="px-4 py-3 text-slate-400">Validates cron invocations, securing administrative tasks.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Database Setup */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-[#F7931A]" />
              Database & Storage Setup
            </h2>
            <p className="text-slate-300 font-medium leading-relaxed">
              Initializing the database backend involves setting up secure environments on Supabase and connecting media pipelines on Cloudinary:
            </p>
            <div className="space-y-4">
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <h4 className="font-bold text-white text-base mb-2">1. Supabase Initialization</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  Provision a new Supabase project. Apply all SQL migrations (defining user profiles, posts, tips, subscriptions, and notification structures) to create tables, functions, and active Row Level Security (RLS) policies.
                </p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <h4 className="font-bold text-white text-base mb-2">2. RainbowKit Redirect Settings</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  Inside the RainbowKit developer console, define authorized redirection URLs (such as <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">http://localhost:3000</code> or your custom production site URL) to handle post-wallet authentication callbacks successfully.
                </p>
              </div>
            </div>
          </section>

          {/* Cron Jobs */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-6 h-6 text-[#F7931A]" />
              Cron Jobs & Scheduled Automation
            </h2>
            <p className="text-slate-300 font-medium leading-relaxed">
              Cron tasks are configured inside <code className="text-white bg-white/10 px-1.5 py-0.5 rounded font-mono">vercel.json</code>. Vercel's scheduler runs the daily orchestrator and weekly checker, supplying the secure <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">Authorization: Bearer &lt;CRON_SECRET&gt;</code> token to block unauthorized invocations:
            </p>

            <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/40">
              <table className="min-w-full divide-y divide-white/5">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Scheduled Path</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Frequency Interval</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Functional Role & System Behavior</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 text-sm font-medium">
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">/api/cron/daily</td>
                    <td className="px-4 py-3 text-slate-300 font-bold">Daily 06:00 UTC</td>
                    <td className="px-4 py-3 text-slate-400">Daily Orchestrator — fans out to trigger reset-streaks, github-sync, and pending digests.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">/api/cron/check-live-urls</td>
                    <td className="px-4 py-3 text-slate-300 font-bold">Weekly Sun 03:00 UTC</td>
                    <td className="px-4 py-3 text-slate-400">Link Checker — verifies all creator profiles and active external URLs remain reachable.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-slate-900/60 border border-white/10 rounded-2xl space-y-4">
              <h4 className="font-bold text-white text-base">Internal Job Handlers (Triggered by Orchestrator)</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-400 font-medium">
                <li>
                  <strong className="font-bold text-white">/api/cron/reset-streaks:</strong> Calculates expired creator activity logs and adjusts tipping rankings accordingly.
                </li>
                <li>
                  <strong className="font-bold text-white">/api/cron/github-sync:</strong> Syncs registered Github repository contribution metrics for active builders.
                </li>
              </ul>
            </div>
          </section>

          {/* Caching Strategy */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-[#F7931A]" />
              Caching Architecture & Performance Strategy
            </h2>
            <p className="text-slate-300 font-medium leading-relaxed">
              We leverage Next.js’s server-side caching via <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">unstable_cache</code> with 60-second revalidation cycles to balance real-time freshness with database security:
            </p>
            <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`const getTopSupporters = unstable_cache(
  async () => { /* Supabase query fetches aggregate metrics */ },
  ['top-supporters-leaderboard'],
  { revalidate: 60 }
);`}
            </pre>
            <p className="text-slate-300 font-medium leading-relaxed">
              Under this cache pipeline, the initial visitor request reads from the Supabase Postgres instance directly. Subsequent requests within the next 60 seconds are served instantly from cache memory. After 60 seconds expire, the following request triggers a background revalidation to rebuild fresh static assets.
            </p>

            <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/40">
              <table className="min-w-full divide-y divide-white/5">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Cached Segment</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Cache TTL</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Primary System Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 text-sm font-medium">
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">Leaderboard Rankings</td>
                    <td className="px-4 py-3 text-[#F7931A] font-bold">60 seconds</td>
                    <td className="px-4 py-3 text-slate-400">High-volume page, aggregate rankings rarely shift second-to-second.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">Creator Public Profiles</td>
                    <td className="px-4 py-3 text-[#F7931A] font-bold">60 seconds</td>
                    <td className="px-4 py-3 text-slate-400">Speeds up profile rendering while keeping bio edits fresh.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">Public Post Listings</td>
                    <td className="px-4 py-3 text-[#F7931A] font-bold">60 seconds</td>
                    <td className="px-4 py-3 text-slate-400">Reduces direct query loads; new posts update within 1 minute.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-slate-900/60 border border-white/10 rounded-2xl space-y-4">
              <h4 className="font-bold text-white text-base">Uncached Segments (Always Real-Time)</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                To guarantee functional correctness, the following systems skip cache memory entirely:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-400 font-medium">
                <li>
                  <strong className="font-bold text-white">Tipping Transfers & Ledgers:</strong> Transaction states must reflect immediate blockchain states.
                </li>
                <li>
                  <strong className="font-bold text-white">Active Subscription Channels:</strong> Access validations to premium posts must evaluate live states instantly.
                </li>
                <li>
                  <strong className="font-bold text-white">User Authentication Sessions:</strong> Login transitions require instant state verification.
                </li>
              </ul>
            </div>
          </section>

          {/* Image Handling */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-[#F7931A]" />
              Image Handling & Content Delivery Network
            </h2>
            <p className="text-slate-300 font-medium leading-relaxed">
              Profile images and project cards are hosted securely and served via global CDNs. While initial user avatar assets connect via social OAuth registries, custom media cards upload to Cloudinary for optimized scaling and fast client rendering.
            </p>
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <h4 className="font-bold text-white text-base mb-2">Next.js Image Domain Configuration</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-medium mb-3">
                To optimize and compress remote assets, the system restricts the Next.js Image component to the following allowed domains inside <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">next.config.ts</code>:
              </p>
              <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-slate-300 font-mono text-sm overflow-x-auto leading-relaxed">
{`*.supabase.co                 // Supabase storage media
api.dicebear.com               // DiceBear generated avatars
res.cloudinary.com             // Cloudinary media delivery`}
              </pre>
            </div>
          </section>

          {/* Monitoring & Observability */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-[#F7931A]" />
              Monitoring, Observability & Error Handling
            </h2>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-white text-base mb-2">1. Defensive Error Boundaries</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  Client React views use nested Error Boundaries for graceful degradation, isolating client failures to specific components without rendering the entire page blank. API routes return structured error JSON formats, while Redis outages degrade gracefully to allow requests through unblocked.
                </p>
              </div>
            </div>
          </section>

          {/* SEO & dynamic sharing */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-[#F7931A]" />
              SEO Optimization & Dynamic Metadata
            </h2>
            <p className="text-slate-300 font-medium leading-relaxed">
              TipHive enforces comprehensive, search-engine-friendly protocols to maximize creator profile discoverability:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-400 font-medium">
              <li>
                <strong className="font-bold text-white">Dynamic Sitemap:</strong> Auto-generated daily at <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">/sitemap.xml</code> to dynamically catalog public creator profiles, explore lists, and leaderboard rankings.
              </li>
              <li>
                <strong className="font-bold text-white">Robots configuration:</strong> Served at <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">/robots.txt</code> to direct crawlers to active landing pages while blocking crawler paths to settings or editing pages.
              </li>
              <li>
                <strong className="font-bold text-white">Social Sharing Cards:</strong> Auto-generates Open Graph and Twitter card meta-tags, loading dynamic share graphics generated programmatically on the server at <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">/api/share-card/[username]</code>.
              </li>
            </ul>
          </section>

          {/* Scaling Pathway Matrix */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-6 h-6 text-[#F7931A]" />
              Scalability Pathways & Upgrade Matrix
            </h2>
            <p className="text-slate-300 font-medium leading-relaxed">
              Our architecture is designed to scale gracefully alongside high volume, transitioning infrastructure resources smoothly as network transactions grow:
            </p>

            <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/40">
              <table className="min-w-full divide-y divide-white/5">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Component Layer</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Current Tier Setup</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Enterprise Scale Upgrade Pathway</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 text-sm font-medium">
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">Database</td>
                    <td className="px-4 py-3 text-slate-300">Supabase Free / Pro Tier</td>
                    <td className="px-4 py-3 text-slate-400">Scale to Supabase Enterprise or migrate to self-hosted multi-region Postgres.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">Rate Limiting</td>
                    <td className="px-4 py-3 text-slate-300">Upstash Redis Serverless</td>
                    <td className="px-4 py-3 text-slate-400">Migrate to a dedicated, high-quota Upstash enterprise tier plan.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">Media Storage</td>
                    <td className="px-4 py-3 text-slate-300">Cloudinary Standard Plan</td>
                    <td className="px-4 py-3 text-slate-400">Migrate media delivery to high-volume AWS S3 buckets backed by CloudFront.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">Compute Nodes</td>
                    <td className="px-4 py-3 text-slate-300">Vercel Serverless Platform</td>
                    <td className="px-4 py-3 text-slate-400">Transition to Vercel Enterprise or orchestrate containerized cloud systems.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">Blockchain RPC Gateway</td>
                    <td className="px-4 py-3 text-slate-300">Public Mezo Testnet Node Gateways</td>
                    <td className="px-4 py-3 text-slate-400">Provision dedicated privately hosted Mezo network validator nodes.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )
    }
  ], [handleSectionChange]);

  const categories = ['Welcome', 'Creators', 'Social & Growth', 'Technical', 'Developers'] as const;

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
    <div className="h-screen w-screen overflow-hidden bg-[#050505] text-white selection:bg-[#F7931A]/30 font-outfit flex flex-col">
      {/* Global Top Header */}
      <header className="shrink-0 h-16 bg-black border-b border-white/5 px-6 flex items-center justify-between z-[60] w-full relative">
        {/* Left: Logo & Title */}
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="TipHive" className="w-8 h-8 object-contain rounded-lg" />
          <span className="font-black text-lg uppercase tracking-tighter flex items-center">
            TipHive <span className="text-[#F7931A] text-sm ml-2 px-2 py-0.5 rounded-md bg-[#F7931A]/10 border border-[#F7931A]/20 font-sans">DOCS</span>
          </span>
        </Link>

        {/* Center: Search Bar (Desktop only) */}
        <div className="flex-1 flex justify-center hidden lg:flex">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#F7931A]/50 transition-all font-medium"
            />
          </div>
        </div>

        {/* Right: Actions / Menu */}
        <div className="flex items-center gap-4">
          <Link 
            href="https://github.com/mrarindam/TipHive" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-slate-400 hover:text-white transition-colors hidden lg:block"
          >
            <GithubIcon className="w-5 h-5" />
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="lg:hidden p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Container taking remaining height */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        
        {/* Mobile Sidebar overlay background */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)} 
            className="fixed inset-y-0 left-0 right-0 top-16 bg-black/85 z-40 lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static top-16 lg:top-0 bottom-0 left-0 w-72 h-[calc(100vh-64px)] lg:h-full bg-black border-r border-white/5 z-50 transition-transform duration-300 flex flex-col shrink-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex flex-col h-full">
            {/* Scrollable Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
              {/* Mobile Search (Search inside list for easy access on mobile) */}
              <div className="lg:hidden mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#F7931A]/50 transition-all font-medium"
                />
              </div>

              {categories.map(cat => {
                const catSections = filteredSections.filter(s => s.category === cat);
                if (catSections.length === 0) return null;
                return (
                  <div key={cat} className="space-y-2">
                    <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-2">{cat}</p>
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

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-white/5 shrink-0">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F7931A]/20 flex items-center justify-center">
                    <GithubIcon className="w-4 h-4 text-[#F7931A]" />
                  </div>
                  <div className="text-sm font-black uppercase tracking-widest text-slate-400">Open Source</div>
                </div>
                <Link href="https://github.com/mrarindam/TipHive" className="text-[#F7931A] hover:underline text-sm font-black uppercase">View</Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Scrollable Content Pane */}
        <div id="docs-content-container" className="flex-1 h-full overflow-y-auto custom-scrollbar">
          <main className="px-6 lg:px-16 py-12 lg:py-16 w-full">
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
          </main>
        </div>

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
