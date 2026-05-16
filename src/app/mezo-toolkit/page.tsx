'use client';

import { motion } from 'framer-motion';
import {
  Zap,
  Landmark,
  ArrowRight,
  Lock,
  Vote,
  Database,
  Vault,
  BookOpen,
  Code2,
  ExternalLink as ExternalLinkIcon
} from 'lucide-react';
import MUSDLogo from '@/components/ui/MUSDLogo';

export default function MezoToolkitPage() {
  const sections = [
    {
      title: "Core Ecosystem",
      tools: [
        {
          title: 'Testnet Faucet',
          description: 'Get testnet BTC to interact with the Mezo ecosystem.',
          icon: <Zap className="h-8 w-8 text-[#F7931A]" />,
          link: 'https://faucet.test.mezo.org',
          action: 'Get Tokens',
          color: 'from-orange-500/20 to-orange-500/5',
          borderColor: 'border-orange-500/30',
        },
        {
          title: 'Buy MUSD',
          description: 'Acquire MUSD, the stable asset of the Mezo network.',
          icon: <MUSDLogo className="h-8 w-8" />,
          link: 'https://mezo.org/overview',
          action: 'Buy Now',
          color: 'from-cyan-500/20 to-cyan-500/5',
          borderColor: 'border-cyan-500/30',
        },
        {
          title: 'Borrow',
          description: 'Manage assets and leverage positions with Mezo.',
          icon: <Landmark className="h-8 w-8 text-emerald-500" />,
          link: 'https://mezo.org/borrow',
          action: 'Borrow',
          color: 'from-emerald-500/20 to-emerald-500/5',
          borderColor: 'border-emerald-500/30',
        }
      ]
    },
    {
      title: "Earn & Governance",
      tools: [
        {
          title: 'Mezo Earn',
          description: 'Lock your assets and earn rewards in the ecosystem.',
          icon: <Lock className="h-8 w-8 text-pink-500" />,
          link: 'https://mezo.org/earn/lock',
          action: 'Lock Assets',
          color: 'from-pink-500/20 to-pink-500/5',
          borderColor: 'border-pink-500/30',
        },
        {
          title: 'Mezo Vote',
          description: 'Participate in governance and shape the future of Mezo.',
          icon: <Vote className="h-8 w-8 text-purple-500" />,
          link: 'https://mezo.org/earn/vote',
          action: 'Vote Now',
          color: 'from-purple-500/20 to-purple-500/5',
          borderColor: 'border-purple-500/30',
        },
        {
          title: 'Mezo Pool',
          description: 'Provide liquidity to pools and earn trading fees.',
          icon: <Database className="h-8 w-8 text-blue-500" />,
          link: 'https://mezo.org/earn/pools',
          action: 'View Pools',
          color: 'from-blue-500/20 to-blue-500/5',
          borderColor: 'border-blue-500/30',
        },
        {
          title: 'Mezo Vaults',
          description: 'Automated strategies for optimized yield generation.',
          icon: <Vault className="h-8 w-8 text-amber-500" />,
          link: 'https://mezo.org/earn/vaults',
          action: 'Deposit',
          color: 'from-amber-500/20 to-amber-500/5',
          borderColor: 'border-amber-500/30',
        }
      ]
    },
    {
      title: "Resources",
      tools: [
        {
          title: 'User Docs',
          description: 'Comprehensive guides for users and community members.',
          icon: <BookOpen className="h-8 w-8 text-indigo-500" />,
          link: 'https://mezo.org/docs/users/',
          action: 'Read Guides',
          color: 'from-indigo-500/20 to-indigo-500/5',
          borderColor: 'border-indigo-500/30',
        },
        {
          title: 'Dev Docs',
          description: 'Technical documentation for building on Mezo.',
          icon: <Code2 className="h-8 w-8 text-slate-400" />,
          link: 'https://mezo.org/docs/developers/',
          action: 'Start Building',
          color: 'from-slate-500/20 to-slate-500/5',
          borderColor: 'border-slate-500/30',
        }
      ]
    }
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050505] pt-32 pb-32">
      {/* Background Decorations */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[5%] left-[5%] h-[600px] w-[600px] rounded-full bg-orange-500/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[5%] right-[5%] h-[600px] w-[600px] rounded-full bg-cyan-500/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
              <img src="/mezo.png" alt="Mezo" className="h-5 w-5" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">Mezo Ecosystem Toolkit</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent uppercase leading-none whitespace-nowrap">
              Mezo <span className="text-[#F7931A]">Toolkit</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              One-stop destination for all official Mezo tools, documentation, and earning opportunities.
            </p>
          </motion.div>
        </div>

        <div className="space-y-32">
          {sections.map((section) => (
            <div key={section.title} className="relative">
              <div className="flex items-center gap-6 mb-12">
                <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-white/40">{section.title}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {section.tools.map((tool, index) => (
                  <motion.a
                    key={tool.title}
                    href={tool.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`group relative flex flex-col p-8 rounded-[2.5rem] border ${tool.borderColor} bg-gradient-to-br ${tool.color} transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10 mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-black/60 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      {tool.icon}
                    </div>

                    <div className="relative z-10 flex-grow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">
                          {tool.title}
                        </h3>
                        <ExternalLinkIcon className="h-4 w-4 text-white/20 group-hover:text-white transition-colors" />
                      </div>
                      <p className="text-slate-400 font-medium leading-relaxed mb-8 text-sm">
                        {tool.description}
                      </p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between mt-auto">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 group-hover:text-white transition-colors">
                        {tool.action}
                      </span>
                      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Support Banner */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-40 p-1 bg-gradient-to-r from-orange-500/20 via-white/10 to-cyan-500/20 rounded-[3.5rem]"
        >
          <div className="bg-[#0A0A0A] p-12 md:p-20 rounded-[3.4rem] text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(247,147,26,0.05)_0%,transparent_70%)]" />
            <div className="relative z-10">
              <img src="/mezo.png" alt="Mezo" className="h-16 w-16 mx-auto mb-10 opacity-50" />
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter leading-none">Need Support?</h2>
              <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto font-medium">Join the Mezo community on Discord or follow us on X for the latest updates and technical support.</p>
              <div className="flex flex-wrap justify-center gap-6">
                <a href="https://discord.gg/nkysxsNkDm" target="_blank" rel="noopener noreferrer" className="px-10 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:scale-105 transition-transform">
                  Join Discord
                </a>
                <a href="https://x.com/MezoNetwork" target="_blank" rel="noopener noreferrer" className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                  Follow on X
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
