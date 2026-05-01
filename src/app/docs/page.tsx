'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  ChevronRight, 
  ArrowRight,
  User,
  Search,
  Menu,
  X,
  ChevronLeft,
  Info,
  AlertCircle,
  Check,
  Lock,
  Star
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Local SVG components for icons that might be missing in older lucide versions
const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
);


type Section = {
  id: string;
  title: string;
  content: React.ReactNode;
  category: 'Welcome' | 'Creators' | 'Fans' | 'Technical';
};

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('welcome');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sections: Section[] = [
    {
      id: 'welcome',
      category: 'Welcome',
      title: 'Welcome',
      content: (
        <div className="space-y-8">
          <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter">Welcome to <span className="text-[#F7931A]">TipHive</span></h1>
          <div className="space-y-6">
            <p className="text-lg text-slate-400 leading-relaxed">
              TipHive is the premier monetization layer for the Mezo Network. We empower creators to build direct, permissionless economic relationships with their audience using Bitcoin-native stability.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6 border-white/5">
                <h3 className="text-[#F7931A] font-black uppercase tracking-tight mb-3">Why TipHive?</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Traditional platforms are built on legacy banking rails that take massive cuts (10-30%) and can freeze your funds at any time. TipHive is built on Bitcoin, giving you absolute ownership.
                </p>
              </div>
              <div className="glass-card p-6 border-white/5">
                <h3 className="text-cyan-400 font-black uppercase tracking-tight mb-3">Our Fee System</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  We believe creators should keep what they earn. TipHive charges **0% platform fees**. You only pay the network gas fee (paid in BTC) required to settle the transaction on the Mezo L2.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 mt-8">
             <button onClick={() => setActiveSection('introduction')} className="btn-primary flex items-center gap-2">
               Next: Introduction <ArrowRight className="w-4 h-4" />
             </button>
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
          <section className="space-y-6">
            <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter">What is <span className="text-[#F7931A]">TipHive?</span></h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              TipHive is a decentralized protocol that transforms how creators monetize their digital presence. By leveraging the security of Bitcoin and the speed of the Mezo Network, we provide a &quot;dopamine-vibe&quot; interface for instant tipping and exclusive subscriptions.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">Why we stand out</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <FeatureItem title="Permissionless" desc="No bank approvals. No waiting periods. Just pure P2P support." />
              <FeatureItem title="Stable Earnings" desc="MUSD ensures your income isn't affected by market volatility." />
              <FeatureItem title="Web3 Identity" desc="Your wallet is your profile. No email or password needed." />
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">Core Features</h2>
            <ul className="grid md:grid-cols-2 gap-4">
              <li className="flex gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <Check className="w-5 h-5 text-green-400 shrink-0" />
                <span className="text-slate-300 font-medium">Instant MUSD Tipping with real-time alerts</span>
              </li>
              <li className="flex gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <Check className="w-5 h-5 text-green-400 shrink-0" />
                <span className="text-slate-300 font-medium">Multi-tier Subscription Smart Contracts</span>
              </li>
              <li className="flex gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <Check className="w-5 h-5 text-green-400 shrink-0" />
                <span className="text-slate-300 font-medium">Detailed Analytics & Growth Charts</span>
              </li>
              <li className="flex gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <Check className="w-5 h-5 text-green-400 shrink-0" />
                <span className="text-slate-300 font-medium">Discovery Feed for global creator visibility</span>
              </li>
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">Use Cases & Applications</h2>
            <div className="space-y-4">
              <div className="p-6 glass-card bg-black/40 border-white/5">
                <h4 className="font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#F7931A]" /> For Digital Creators
                </h4>
                <p className="text-sm text-slate-500">Share your TipHive link on X, Discord, or Instagram to receive direct support from your fans without platform tax.</p>
              </div>
              <div className="p-6 glass-card bg-black/40 border-white/5">
                <h4 className="font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                   <Lock className="w-4 h-4 text-cyan-400" /> For Developers
                </h4>
                <p className="text-sm text-slate-500">Integrate TipHive into your GitHub profile or documentation to receive tips for your open-source contributions.</p>
              </div>
            </div>
          </section>
        </div>
      )
    },
    {
      id: 'creator-setup',
      category: 'Creators',
      title: 'Quick Start',
      content: (
        <div className="space-y-8">
          <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter">Creator Setup</h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Becoming a TipHive creator is a simple process that lives entirely on the blockchain. Follow these steps to claim your identity.
          </p>
          
          <div className="space-y-12 mt-8">
            <Step number="01" title="Connect & Claim">
              Connect your Mezo-compatible wallet (like Rainbow or MetaMask) and choose a unique username. This username becomes your public URL: <code className="text-[#F7931A] bg-[#F7931A]/10 px-2 py-1 rounded">tiphive.io/profile/yourname</code>.
            </Step>
            <Step number="02" title="Define Your Brand">
              Add your bio, social links (Twitter, Discord, Website), and select your primary category. This helps fans find you in the Discovery feed.
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
            <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter">Subscriptions <span className="text-[#F7931A]">& Payouts</span></h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              Subscriptions are the engine of recurring growth on TipHive. They allow your most loyal fans to support you continuously while unlocking exclusive benefits.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">The Tier Concept</h2>
            <p className="text-slate-400 leading-relaxed">
              Subscription tiers represent different levels of membership. Creators can define up to three tiers (e.g., Bronze, Silver, Gold), each with its own monthly MUSD price and set of perks.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <h4 className="font-bold text-white mb-2">On-chain Enforcement</h4>
                <p className="text-sm text-slate-500">Every subscription is a direct agreement between you and the fan, managed by our audited smart contracts.</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <h4 className="font-bold text-white mb-2">Flexible Perks</h4>
                <p className="text-sm text-slate-500">You decide what each tier gets: early access, private Discord roles, exclusive content, or shoutouts.</p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">Withdrawing Your Funds</h2>
            <p className="text-slate-400 leading-relaxed">
              Earnings on TipHive are not locked behind waiting periods. When a fan tips you or pays for a subscription, the MUSD is held in your dedicated payout contract.
            </p>
            <div className="space-y-4">
              <Step number="01" title="Visit your Dashboard">
                Navigate to the **Earnings** tab in your creator dashboard to see your current balance.
              </Step>
              <Step number="02" title="Trigger Payout">
                Click the **Withdraw** button. This will prompt a wallet transaction to transfer the MUSD from the smart contract directly to your wallet.
              </Step>
              <Step number="03" title="Instant Settlement">
                Once the transaction is confirmed on the Mezo Network, your funds are available in your wallet to spend, swap, or bridge.
              </Step>
            </div>
            <Callout type="check" title="Real Ownership">
              Since you are interacting directly with the smart contract, TipHive cannot block your withdrawals. You are always in control of your money.
            </Callout>
          </section>
        </div>
      )
    },
    {
      id: 'musd-stablecoin',
      category: 'Technical',
      title: 'MUSD Protocol',
      content: (
        <div className="space-y-8">
          <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter">The MUSD Standard</h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            TipHive uses MUSD as its primary economic unit. MUSD is a Bitcoin-backed stablecoin on the Mezo Network, providing the perfect balance of decentralization and price stability.
          </p>

          <div className="glass-card p-8 bg-black/40">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#F7931A]" />
              Secure Settlements
            </h3>
            <p className="text-slate-400">
              All tips and subscriptions are held in audited smart contracts. Creators can withdraw their funds at any time directly to their connected wallet. No one—not even the TipHive team—can block your access to your earnings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-white/5 rounded-2xl bg-white/5">
              <h4 className="font-bold text-white mb-2">Low Volatility</h4>
              <p className="text-sm text-slate-500">MUSD stays pegged to $1.00, meaning you don&apos;t have to worry about your earnings dropping in value overnight.</p>
            </div>
            <div className="p-6 border border-white/5 rounded-2xl bg-white/5">
              <h4 className="font-bold text-white mb-2">High Liquidity</h4>
              <p className="text-sm text-slate-500">MUSD can be easily bridged or swapped for other assets within the Mezo ecosystem.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'fan-support',
      category: 'Fans',
      title: 'Supporting Creators',
      content: (
        <div className="space-y-8">
          <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter">Supporting Creators</h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Show your appreciation for the builders you love. Supporting on TipHive is direct and impactful.
          </p>

          <div className="space-y-6">
            <div className="flex gap-4 items-start p-6 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">One-time Tips</h4>
                <p className="text-sm text-slate-400">Send any amount of MUSD instantly. Use the pre-set amounts or enter a custom value to say thanks.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-6 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-[#F7931A]/10 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-[#F7931A]" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Subscriptions</h4>
                <p className="text-sm text-slate-400">Join a creator&apos;s inner circle. Subscriptions recur monthly and grant you special status on their profile and in their community.</p>
              </div>
            </div>
          </div>

          <Callout type="check" title="Privacy First">
             TipHive does not collect your name, email, or physical address. Your support is tied only to your wallet address, preserving your Web3 anonymity.
          </Callout>
        </div>
      )
    },
    {
      id: 'why-mezo-musd',
      category: 'Technical',
      title: 'Why Mezo & MUSD?',
      content: (
        <div className="space-y-12">
          <section className="space-y-6">
            <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter">Why Mezo & <span className="text-[#F7931A]">MUSD?</span></h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              TipHive isn&apos;t just another platform; it&apos;s a pillar of the emerging Bitcoin circular economy. We chose Mezo and MUSD because they represent the most sophisticated economic layer ever built for Bitcoin.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">Mezo: The Bitcoin Economic Layer</h2>
            <p className="text-slate-400 leading-relaxed">
              Mezo is designed to bring Bitcoin to life. Instead of BTC just sitting in cold storage, Mezo enables **&quot;Proof of HODL&quot;**—allowing users to put their Bitcoin to work through real network activity and commerce.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <h4 className="font-black text-white text-xs uppercase tracking-widest mb-2">Native Yield</h4>
                <p className="text-xs text-slate-500">Mezo rewards long-term Bitcoin holders through ve-tokenomics, creating a sustainable ecosystem for creators to grow their wealth.</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <h4 className="font-black text-white text-xs uppercase tracking-widest mb-2">Decentralized Security</h4>
                <p className="text-xs text-slate-500">Built with self-custody at its core, Mezo ensures that your identity and earnings are secured by the most robust network in the world.</p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">MUSD Fixes Bitcoin</h2>
            <p className="text-slate-400 leading-relaxed">
              While BTC is the ultimate store of value, its volatility makes it challenging for daily payments. **MUSD (Mezo USD)** is a Bitcoin-backed stablecoin that provides the stability creators need without sacrificing their Bitcoin exposure.
            </p>
            <Callout type="info" title="The Supernormal Vision">
              The Supernormal Foundation supports Mezo&apos;s mission to build a **bank-free economy**. By using MUSD on TipHive, you are tapping into your Bitcoin equity to pay for services and support creators, keeping the value within the decentralized ecosystem.
            </Callout>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight border-b border-white/5 pb-4">The Result</h2>
            <p className="text-slate-400 leading-relaxed">
              By selecting Mezo and MUSD, TipHive offers:
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-300 font-bold">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F7931A]" />
                Access to Bitcoin-native liquidity
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300 font-bold">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F7931A]" />
                Zero reliance on centralized banking rails
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300 font-bold">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F7931A]" />
                Stable pricing for a global audience
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300 font-bold">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F7931A]" />
                Integration with the most advanced Bitcoin L2
              </li>
            </ul>
          </section>
        </div>
      )
    }
  ];

  const currentSection = sections.find(s => s.id === activeSection) || sections[0];
  const categories = ['Welcome', 'Creators', 'Fans', 'Technical'] as const;

  const filteredSections = sections.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#F7931A]/30">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] bg-black/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={32} height={32} unoptimized />
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
                <Image src="/logo.png" alt="Logo" width={36} height={36} unoptimized />
                <span className="font-black text-lg uppercase tracking-tighter">TipHive Docs</span>
              </Link>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#F7931A]/50 transition-all"
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
                        onClick={() => {
                          setActiveSection(s.id);
                          setIsSidebarOpen(false);
                          window.scrollTo(0, 0);
                        }}
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
                onClick={() => setActiveSection(sections[sections.indexOf(currentSection) - 1].id)}
                className="flex items-center gap-4 p-6 glass-card hover:bg-white/5 transition-all text-left"
              >
                <ChevronLeft className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Previous</p>
                  <p className="font-black text-white uppercase">{sections[sections.indexOf(currentSection) - 1].title}</p>
                </div>
              </button>
            ) : <div />}

            {sections.indexOf(currentSection) < sections.length - 1 ? (
              <button 
                onClick={() => setActiveSection(sections[sections.indexOf(currentSection) + 1].id)}
                className="flex items-center gap-4 p-6 glass-card hover:bg-white/5 transition-all text-right"
              >
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Next</p>
                  <p className="font-black text-white uppercase">{sections[sections.indexOf(currentSection) + 1].title}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </button>
            ) : <div />}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
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

function Callout({ type, title, children }: { type: 'info' | 'warning' | 'check', title: string, children: React.ReactNode }) {
  const styles = {
    info: { icon: <Info className="w-5 h-5" />, bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
    warning: { icon: <AlertCircle className="w-5 h-5" />, bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400' },
    check: { icon: <Check className="w-5 h-5" />, bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400' },
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
}

function Step({ number, title, children }: { number: string, title: string, children: React.ReactNode }) {
  return (
    <div className="relative pl-12 pb-12 last:pb-0">
      <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-white/5 last:hidden" />
      <div className="absolute left-0 top-0 w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center z-10">
        <span className="text-[10px] font-black text-[#F7931A] tracking-tighter">{number}</span>
      </div>
      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">{title}</h3>
      <div className="text-slate-400 leading-relaxed font-medium">{children}</div>
    </div>
  );
}


function FeatureItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-[#F7931A]/30 transition-all group">
      <h4 className="font-black text-white uppercase tracking-widest text-[10px] mb-2 group-hover:text-[#F7931A] transition-colors">{title}</h4>
      <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}


