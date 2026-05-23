'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointerClick, QrCode, ArrowRight, Sparkles, Lock } from 'lucide-react';
import { useDashboard } from '../layout';
import ButtonGeneratorModal from '@/components/dashboard/ButtonGeneratorModal';
import WidgetGeneratorModal from '@/components/dashboard/WidgetGeneratorModal';
import QRCodeGeneratorModal from '@/components/dashboard/QRCodeGeneratorModal';

export default function VisualToolkitPage() {
  const { creatorProfile, address } = useDashboard();
  const hasWallet = !!creatorProfile?.address || !!address;
  const username = creatorProfile?.username || 'creator';
  const [isButtonModalOpen, setIsButtonModalOpen] = useState(false);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const tools = [
    {
      title: 'Website buttons',
      description: 'Create customizable buttons which take your audience to your page. You can add this to your site or blog.',
      buttonText: 'Generate',
      locked: !hasWallet,
      onClick: () => hasWallet && setIsButtonModalOpen(true),
      visual: (
        <div className="relative w-full h-40 bg-[#050507] rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden">
           <div className="absolute top-0 left-0 right-0 h-6 bg-white/5 flex items-center px-3 gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-red-500/30" />
             <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/30" />
             <div className="w-1.5 h-1.5 rounded-full bg-green-500/30" />
           </div>
           <motion.button 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="bg-[#f7931a] text-black px-5 py-2.5 rounded-full font-black text-sm shadow-[0_0_20px_rgba(247,147,26,0.3)] flex items-center gap-2"
           >
             <Sparkles className="w-4 h-4 fill-black/20" />
             Support on TipHive
           </motion.button>
           <div className="absolute bottom-2 right-3 opacity-20">
              <MousePointerClick className="w-12 h-12 text-white" />
           </div>
        </div>
      )
    },
    {
      title: 'Website widget',
      description: 'Allow your audience to support you right from your own website. Customize the widget with a message and your brand color.',
      buttonText: 'Generate',
      locked: !hasWallet,
      onClick: () => hasWallet && setIsWidgetModalOpen(true),
      visual: (
        <div className="relative w-full h-40 bg-[#050507] rounded-2xl border border-white/5 overflow-hidden p-4">
           <div className="absolute top-0 left-0 right-0 h-6 bg-white/5 flex items-center px-3 gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-red-500/30" />
             <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/30" />
             <div className="w-1.5 h-1.5 rounded-full bg-green-500/30" />
           </div>
           <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                 <div className="w-8 h-8 rounded-lg bg-white/5" />
                 <div className="space-y-1 flex-1">
                    <div className="w-20 h-2 bg-white/10 rounded" />
                    <div className="w-32 h-2 bg-white/5 rounded" />
                 </div>
              </div>
              <div className="w-full h-12 bg-white/5 rounded-xl border border-white/5" />
           </div>
           <motion.div 
             animate={{ y: [0, -5, 0] }}
             transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
             className="absolute bottom-4 right-4 w-12 h-12 bg-[#f7931a] rounded-full flex items-center justify-center shadow-xl shadow-[#f7931a]/20"
           >
             <Sparkles className="w-6 h-6 text-black fill-black/10" />
           </motion.div>
        </div>
      )
    },
    {
      title: 'QR code',
      description: 'Generate a fancy QR code for your page and give your audience a quick, simple way to make a support.',
      buttonText: 'Customize',
      onClick: () => setIsQRModalOpen(true),
      visual: (
        <div className="relative w-full h-40 bg-[#050507] rounded-2xl border border-white/5 flex items-center justify-center">
           <motion.div 
             whileHover={{ rotate: 5, scale: 1.1 }}
             className="w-28 h-28 bg-white rounded-2xl p-2 relative flex items-center justify-center shadow-2xl shadow-white/5"
           >
              <div className="grid grid-cols-4 gap-1 w-full h-full opacity-90">
                 {[...Array(16)].map((_, i) => (
                   <div key={i} className={`rounded-[2px] ${[0, 1, 4, 3, 12, 15].includes(i) ? 'bg-black' : 'bg-black/10'}`} />
                 ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-8 h-8 bg-[#f7931a] rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                    <span className="text-black text-xs font-black">T</span>
                 </div>
              </div>
           </motion.div>
           <div className="absolute top-2 right-3 opacity-10">
              <QrCode className="w-16 h-16 text-white" />
           </div>
        </div>
      )
    }
  ];

  return (
    <div className="w-full space-y-12">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="px-4 md:px-0 mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1.5 w-12 bg-[#F7931A] rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F7931A]">Creator Suite</span>
        </div>
        <h1 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-4 font-outfit">
          VISUAL <span className="text-[#F7931A]">TOOLKIT</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl font-medium max-w-3xl">
          Professional tools to integrate TipHive into your existing workflow and increase your creator revenue.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
            className="group relative bg-[#0f0f14] border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center text-center hover:border-[#f7931a]/40 hover:shadow-[0_0_50px_rgba(247,147,26,0.05)] transition-all duration-500 overflow-hidden"
          >
            {/* Background glow on hover */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#f7931a]/5 blur-[60px] rounded-full group-hover:bg-[#f7931a]/10 transition-colors duration-500" />
            
            {tool.locked && (
              <div className="absolute inset-0 z-20 backdrop-blur-[6px] bg-black/40 flex flex-col items-center justify-center p-6 transition-all duration-500">
                <div className="w-14 h-14 bg-[#f7931a]/10 rounded-full flex items-center justify-center mb-4 border border-[#f7931a]/20">
                  <Lock className="w-6 h-6 text-[#f7931a]" />
                </div>
                <h4 className="text-white font-black uppercase tracking-tight mb-2">Wallet Required</h4>
                <p className="text-slate-300 text-xs font-bold leading-relaxed max-w-[180px]">
                  Connect your wallet to enable website integrations.
                </p>
              </div>
            )}

            <div className={`w-full mb-8 relative z-10 ${tool.locked ? 'grayscale opacity-50' : ''}`}>
               {tool.visual}
            </div>
            
            <div className={`relative z-10 flex-1 flex flex-col items-center ${tool.locked ? 'opacity-30' : ''}`}>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tight group-hover:text-[#f7931a] transition-colors">
                {tool.title}
              </h3>
              <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium px-2">
                {tool.description}
              </p>
              
              <button 
                onClick={tool.onClick}
                disabled={tool.locked}
                className={`mt-auto w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-xl ${
                  tool.locked 
                    ? 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed' 
                    : 'bg-white/[0.03] border border-white/10 text-white hover:bg-[#f7931a] hover:text-black hover:border-transparent'
                }`}
              >
                {tool.locked ? 'Locked' : tool.buttonText}
                {!tool.locked && <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-10 rounded-[3rem] bg-gradient-to-br from-[#0f0f14] to-[#050507] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8"
      >
         <div className="space-y-4">
            <h2 className="text-3xl font-black text-white tracking-tight">Want to learn more?</h2>
            <p className="text-slate-500 font-medium">Our API allows you to build completely special experiences for your fans.</p>
         </div>
         <Link href="/docs/visual-toolkit" className="whitespace-nowrap px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors shadow-2xl">
            View API Docs
         </Link>
      </motion.div>

      <AnimatePresence>
        {isButtonModalOpen && (
          <ButtonGeneratorModal 
            isOpen={isButtonModalOpen} 
            onClose={() => setIsButtonModalOpen(false)} 
            username={username}
          />
        )}
        {isWidgetModalOpen && (
          <WidgetGeneratorModal 
            isOpen={isWidgetModalOpen} 
            onClose={() => setIsWidgetModalOpen(false)} 
            username={username}
          />
        )}
        {isQRModalOpen && (
          <QRCodeGeneratorModal 
            isOpen={isQRModalOpen} 
            onClose={() => setIsQRModalOpen(false)} 
            username={username}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
