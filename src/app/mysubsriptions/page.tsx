'use client';

import { motion } from 'framer-motion';
import { 
  Crown, Shield, Users, Star, 
  Wallet, Check, Heart
} from 'lucide-react';
import { useDashboard } from '@/components/providers/DashboardProvider';
import { useWalletAuth } from '@/lib/wallet-auth-shim';
import MySubscriptions from '@/components/dashboard/MySubscriptions';

export default function MySubscriptionsPage() {
  const { authenticated } = useDashboard();
  const { login } = useWalletAuth();

  return (
    <div className="w-full space-y-16">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 md:px-0 text-center max-w-3xl mx-auto space-y-4"
      >
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit uppercase">
          MY <span className="text-[#F7931A]">SUBSCRIPTIONS</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg font-medium leading-relaxed">
          Manage the creators you support, track your active memberships and unlock exclusive perks through on-chain subscription plans.
        </p>
      </motion.div>

      {/* Authenticated: Show actual subscriptions */}
      {authenticated ? (
        <MySubscriptions />
      ) : (
        <>
          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {[
              {
                icon: <Crown className="w-6 h-6" />,
                title: 'Exclusive access',
                description: 'Subscribe to your favorite creators and unlock members-only posts, updates and premium content that regular followers cannot see.'
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'On-chain security',
                description: 'Every subscription is recorded on the Mezo L2 blockchain. Your membership is verifiable, transparent and fully under your control.'
              },
              {
                icon: <Heart className="w-6 h-6" />,
                title: 'Direct support',
                description: 'Your subscription funds go directly to the creator with zero platform fees. Help them grow while getting exclusive perks in return.'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                className="group relative bg-white dark:bg-[#0f0f14] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center text-center hover:border-[#f7931a]/40 shadow-sm hover:shadow-[0_0_50px_rgba(247,147,26,0.05)] transition-all duration-500 overflow-hidden"
              >
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#f7931a]/5 blur-[60px] rounded-full group-hover:bg-[#f7931a]/10 transition-colors duration-500" />
                
                
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight group-hover:text-[#f7931a] transition-colors uppercase font-outfit relative z-10">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium px-2 relative z-10">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Deep Details Sections */}
          <div className="w-full space-y-12">
            
            <div className="border-t border-slate-200 dark:border-white/5" />

            {/* Section 1: How It Works */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight uppercase font-outfit">
                  1. How Subscriptions Work
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed font-medium">
                  Creators on TipHive can set up subscription tiers with custom pricing, perks and durations. When you subscribe, a smart contract on Mezo L2 records your membership on-chain.
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Your subscription gives you access to gated content, exclusive posts and direct communication channels with the creator. Everything runs through non-custodial smart contracts so your funds go directly to the creator with no middleman.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl">
                    <h4 className="text-slate-900 dark:text-white font-bold text-sm">Zero platform fees</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">100% of your subscription goes to the creator you support.</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl">
                    <h4 className="text-slate-900 dark:text-white font-bold text-sm">Flexible plans</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Creators offer multiple tiers so you can choose what fits your budget.</p>
                  </div>
                </div>
              </div>

              {/* Right visual mock */}
              <div className="bg-slate-50 dark:bg-[#0f0f14] border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 shadow-xl relative overflow-hidden flex flex-col justify-center items-center space-y-6 h-[340px]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#f7931a]/10 flex items-center justify-center">
                    <Users className="w-7 h-7 text-[#f7931a]" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Join a Creator Circle</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pick a plan that fits your support level</div>
                  </div>
                </div>
                
                <div className="w-full space-y-3">
                  {['Starter - 5 MUSD/month', 'Pro - 15 MUSD/month', 'VIP - 50 MUSD/month'].map((plan, i) => (
                    <div key={plan} className={`flex items-center justify-between px-5 py-3.5 rounded-2xl border transition-all ${
                      i === 1 
                        ? 'bg-[#f7931a]/10 border-[#f7931a]/30 shadow-sm' 
                        : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/5'
                    }`}>
                      <span className={`text-xs font-bold ${i === 1 ? 'text-[#f7931a]' : 'text-slate-700 dark:text-slate-300'}`}>{plan}</span>
                      {i === 1 && <Star className="w-4 h-4 text-[#f7931a] fill-[#f7931a]/20" />}
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold text-center">
                  Paid in MUSD stablecoin on Mezo L2
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-white/5" />

            {/* Section 2: Member Perks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left visual mock */}
              <div className="order-2 lg:order-1 bg-slate-50 dark:bg-[#0f0f14] border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 shadow-xl relative overflow-hidden flex flex-col justify-center max-w-sm mx-auto w-full space-y-5">
                <div className="text-center pb-4 border-b border-slate-200 dark:border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#f7931a]">Member Benefits</span>
                </div>

                {[
                  'Unlock exclusive posts and updates',
                  'Access members-only content',
                  'Get early access to new posts',
                  'Direct messaging with creator',
                  'Custom badge on your profile'
                ].map((perk) => (
                  <div key={perk} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                      <Check size={12} />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{perk}</span>
                  </div>
                ))}
              </div>

              <div className="order-1 lg:order-2 space-y-6">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight uppercase font-outfit">
                  2. Exclusive Member Perks
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed font-medium">
                  When you subscribe to a creator, you unlock a suite of exclusive benefits that regular followers do not have access to. Each creator defines their own perk tiers.
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  From gated blog posts and premium tutorials to early access previews and direct messaging channels - your subscription is your key to a deeper connection with the creators you value most.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0 mt-0.5"><Check size={12} /></div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Perks activate instantly after on-chain confirmation.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0 mt-0.5"><Check size={12} /></div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Renew or cancel anytime without penalties.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-white/5" />

            {/* Section 3: Manage & Track */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight uppercase font-outfit">
                  3. Manage and Track
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed font-medium">
                  Your subscriptions dashboard gives you a complete overview of every creator you support. See active plans, renewal dates, perk details and transaction history in one clean interface.
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  The interactive 3D card carousel lets you browse through all your subscriptions with smooth animations. Each card shows the creator profile, plan details, included perks and quick-action buttons for renewing or viewing on the blockchain explorer.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl">
                    <h4 className="text-slate-900 dark:text-white font-bold text-sm">One-click renewal</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Extend your subscription with a single transaction.</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl">
                    <h4 className="text-slate-900 dark:text-white font-bold text-sm">On-chain verified</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Every transaction is verifiable on the Mezo explorer.</p>
                  </div>
                </div>
              </div>

              {/* Right visual mock */}
              <div className="bg-slate-50 dark:bg-[#0f0f14] border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 shadow-xl relative overflow-hidden flex flex-col h-[340px] justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Subscription Dashboard</span>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                  </div>
                </div>
                
                <div className="flex-1 flex items-center justify-center py-4">
                  <div className="flex items-center gap-3 -space-x-8">
                    {[
                      { name: 'DEVID', color: 'from-purple-500/20 to-indigo-500/20', border: 'border-purple-500/30' },
                      { name: 'DEXSTAR', color: 'from-[#f7931a]/20 to-amber-500/20', border: 'border-[#f7931a]' },
                      { name: 'ALEX', color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30' },
                    ].map((card, i) => (
                      <div 
                        key={card.name}
                        className={`w-[120px] h-[160px] bg-gradient-to-br ${card.color} rounded-2xl border-2 ${card.border} flex flex-col items-center justify-center shadow-lg ${
                          i === 1 ? 'scale-110 z-10' : 'opacity-60 scale-90'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/10 dark:bg-white/5 mb-2 flex items-center justify-center">
                          <Crown className={`w-5 h-5 ${i === 1 ? 'text-[#f7931a]' : 'text-slate-400'}`} />
                        </div>
                        <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{card.name}</span>
                        <span className="text-[8px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">Active</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest">
                  3D carousel with smooth transitions
                </div>
              </div>
            </div>
          </div>

          {/* Premium Login / Wallet Connect CTA Section */}
          <div className="w-full">
            <div className="relative border border-slate-200 dark:border-white/5 rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50 dark:from-[#0d0d12] dark:to-[#050508] p-10 md:p-16 text-center overflow-hidden shadow-2xl transition-all duration-500 border-t-[#f7931a]/15">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-[#f7931a]/40 to-transparent" />
              <div className="absolute -top-32 w-96 h-96 bg-[#f7931a]/5 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-center mb-6 shadow-inner relative mx-auto transition-colors duration-300">
                <Wallet className="w-7 h-7 text-[#f7931a] relative z-10" />
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-outfit uppercase tracking-tight mb-4">
                Ready to Support Creators?
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto mb-10 leading-relaxed text-sm md:text-base">
                Connect your wallet to browse creator subscription plans, manage your active memberships and unlock exclusive content.
              </p>

              <button
                onClick={login}
                className="px-10 py-4.5 bg-[#f7931a] hover:bg-[#e08215] text-white dark:text-black font-black uppercase tracking-wider text-xs md:text-sm rounded-2xl transition-all hover:shadow-[0_0_40px_rgba(247,147,26,0.3)] active:scale-95 cursor-pointer shadow-md"
              >
                Connect Wallet & Start Supporting
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
