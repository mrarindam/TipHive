'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MousePointerClick, QrCode, ArrowRight, Sparkles, Lock, 
  Check, Copy, Wallet
} from 'lucide-react';
import { useDashboard } from '@/components/providers/DashboardProvider';
import { useWalletAuth } from '@/lib/wallet-auth-shim';
import ButtonGeneratorModal from '@/components/dashboard/ButtonGeneratorModal';
import WidgetGeneratorModal from '@/components/dashboard/WidgetGeneratorModal';
import QRCodeGeneratorModal from '@/components/dashboard/QRCodeGeneratorModal';

export default function VisualToolkitPage() {
  const { creatorProfile, address, authenticated } = useDashboard();
  const { login } = useWalletAuth();
  const hasWallet = !!creatorProfile?.address || !!address;
  const username = creatorProfile?.username || 'creator';
  
  const [isButtonModalOpen, setIsButtonModalOpen] = useState(false);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  
  const [copiedCode, setCopiedCode] = useState(false);
  const [mockTipAmount, setMockTipAmount] = useState<number>(10);

  const copyMockCode = () => {
    navigator.clipboard.writeText(`<a href="https://tiphive.xyz/${username}" target="_blank" style="background:#F7931A;color:#000;font-weight:bold;padding:12px 24px;border-radius:24px;text-decoration:none;">Support on TipHive</a>`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const tools = [
    {
      title: 'Website buttons',
      description: 'Create customizable buttons which take your audience to your page. You can add this to your site or blog.',
      buttonText: 'Generate',
      locked: authenticated && !hasWallet,
      onClick: () => hasWallet && setIsButtonModalOpen(true),
      visual: (
        <div className="relative w-full h-40 bg-slate-50 dark:bg-[#050507] rounded-2xl border border-slate-200 dark:border-white/5 flex items-center justify-center overflow-hidden">
           <div className="absolute top-0 left-0 right-0 h-6 bg-slate-200/50 dark:bg-white/5 flex items-center px-3 gap-1.5">
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
                <MousePointerClick className="w-12 h-12 text-slate-400 dark:text-white" />
             </div>
        </div>
      )
    },
    {
      title: 'Website widget',
      description: 'Allow your audience to support you right from your own website. Customize the widget with a message and your brand color.',
      buttonText: 'Generate',
      locked: authenticated && !hasWallet,
      onClick: () => hasWallet && setIsWidgetModalOpen(true),
      visual: (
        <div className="relative w-full h-40 bg-slate-50 dark:bg-[#050507] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden p-4">
           <div className="absolute top-0 left-0 right-0 h-6 bg-slate-200/50 dark:bg-white/5 flex items-center px-3 gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-red-500/30" />
             <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/30" />
             <div className="w-1.5 h-1.5 rounded-full bg-green-500/30" />
           </div>
           <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                 <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/5" />
                 <div className="space-y-1 flex-1">
                    <div className="w-20 h-2 bg-slate-300 dark:bg-white/10 rounded" />
                    <div className="w-32 h-2 bg-slate-200 dark:bg-white/5 rounded" />
                 </div>
              </div>
              <div className="w-full h-12 bg-slate-200/50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5" />
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
      locked: false,
      onClick: () => setIsQRModalOpen(true),
      visual: (
        <div className="relative w-full h-40 bg-slate-50 dark:bg-[#050507] rounded-2xl border border-slate-200 dark:border-white/5 flex items-center justify-center">
           <motion.div 
             whileHover={{ rotate: 5, scale: 1.1 }}
             className="w-28 h-28 bg-white rounded-2xl p-2 relative flex items-center justify-center shadow-2xl shadow-black/5 dark:shadow-white/5"
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
              <QrCode className="w-16 h-16 text-slate-800 dark:text-white" />
           </div>
        </div>
      )
    }
  ];

  return (
    <div className="w-full space-y-16">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 md:px-0 text-center max-w-3xl mx-auto space-y-4"
      >
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit uppercase">
          VISUAL <span className="text-[#F7931A]">TOOLKIT</span>
        </h1>
        <p className="text-slate-550 dark:text-slate-400 text-base md:text-lg font-medium leading-relaxed">
          Professional suite of customizable widgets, responsive buttons and dynamic QR codes to integrate TipHive directly into your website layout and live streams.
        </p>
      </motion.div>

      {/* Main Grid Card Containers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
            className="group relative bg-white dark:bg-[#0f0f14] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center text-center hover:border-[#f7931a]/40 shadow-sm hover:shadow-[0_0_50px_rgba(247,147,26,0.05)] transition-all duration-500 overflow-hidden"
          >
            {/* Background glow on hover */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#f7931a]/5 blur-[60px] rounded-full group-hover:bg-[#f7931a]/10 transition-colors duration-500" />
            
            {tool.locked && (
              <div className="absolute inset-0 z-20 backdrop-blur-[6px] bg-white/80 dark:bg-black/60 flex flex-col items-center justify-center p-6 transition-all duration-500">
                <div className="w-14 h-14 bg-[#f7931a]/10 rounded-full flex items-center justify-center mb-4 border border-[#f7931a]/20">
                  <Lock className="w-6 h-6 text-[#f7931a]" />
                </div>
                <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-tight mb-2">Wallet Required</h4>
                <p className="text-slate-600 dark:text-slate-300 text-xs font-bold leading-relaxed max-w-[180px]">
                  Connect your wallet to enable website integrations.
                </p>
              </div>
            )}

            <div className={`w-full mb-8 relative z-10 ${tool.locked ? 'grayscale opacity-30' : ''}`}>
               {tool.visual}
            </div>
            
            <div className={`relative z-10 flex-1 flex flex-col items-center w-full ${tool.locked ? 'opacity-30' : ''}`}>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight group-hover:text-[#f7931a] transition-colors uppercase font-outfit">
                {tool.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-10 leading-relaxed font-medium px-2">
                {tool.description}
              </p>
              
              {authenticated ? (
                <button 
                  onClick={tool.onClick}
                  disabled={tool.locked}
                  className={`mt-auto w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-xl cursor-pointer ${
                    tool.locked 
                      ? 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-white/5 cursor-not-allowed' 
                      : 'bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:bg-[#f7931a] hover:text-black hover:border-transparent'
                  }`}
                >
                  {tool.locked ? 'Locked' : tool.buttonText}
                  {!tool.locked && <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
                </button>
              ) : (
                <button 
                  disabled
                  className="mt-auto w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-slate-100/30 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 text-slate-500 dark:text-slate-500 cursor-not-allowed"
                >
                  Authentication required
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Deep Details Sections (Showcase for public visitors & reference for creators) */}
      <div className="w-full space-y-12">
        
        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-white/5" />

        {/* Section 1: Buttons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight uppercase font-outfit">
              1. Responsive Website Buttons
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed font-medium">
              Make it effortless for readers to support your work. TipHive button builder generates a native, responsive HTML link block that you can insert into any web page, blog sidebar or email newsletter. 
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Unlike complex scripts, this integration is 100% compliant with all major publishing platforms including WordPress, Ghost, Medium and custom static sites (HTML/Next.js/React). It loads instantly, requires zero JS bundles and fits beautifully in your existing design scheme.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl">
                <h4 className="text-slate-900 dark:text-white font-bold text-sm">Lightweight code</h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Pre-styled inline CSS ensure immediate layout rendering.</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl">
                <h4 className="text-slate-900 dark:text-white font-bold text-sm">Mezo L2 Ready</h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Connects to dynamic creator tipping contracts with 0% fees.</p>
              </div>
            </div>
          </div>

          {/* Right visual mock */}
          <div className="bg-slate-50 dark:bg-[#0f0f14] border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 shadow-xl relative overflow-hidden flex flex-col h-[340px] justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Mock Preview</span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center flex-grow py-6 space-y-4">
              <motion.a 
                href="#"
                onClick={(e) => e.preventDefault()}
                whileHover={{ scale: 1.05 }}
                className="bg-[#f7931a] text-black px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider shadow-lg flex items-center gap-2.5"
              >
                <Sparkles size={16} fill="black/10" /> Support on TipHive
              </motion.a>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest">Hover to see active glow effect</span>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/5 p-3 flex items-center justify-between mt-auto w-full">
              <span className="font-mono text-[10px] text-slate-300 dark:text-slate-400 truncate max-w-[280px]">
                {`<a href="https://tiphive.xyz/${username}" target="_blank" ...`}
              </span>
              <button 
                onClick={copyMockCode}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-400 hover:text-white transition-colors"
                title="Copy HTML Code"
              >
                {copiedCode ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-white/5" />

        {/* Section 2: Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left visual mock */}
          <div className="order-2 lg:order-1 bg-slate-50 dark:bg-[#0f0f14] border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between max-w-sm mx-auto w-full">
            <div className="pb-4 border-b border-slate-200 dark:border-white/5 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#f7931a]">Embedded Payment Frame</span>
            </div>

            <div className="py-6 space-y-5">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/5 shrink-0" />
                <div>
                  <h4 className="text-slate-900 dark:text-white font-black text-sm uppercase">@{username}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Tipping Widget</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 20].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setMockTipAmount(amt)}
                    className={`py-3 rounded-xl text-xs font-black transition-all ${
                      mockTipAmount === amt
                        ? 'bg-[#f7931a] text-black shadow-md'
                        : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-300'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <div className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-medium">
                Support message...
              </div>
            </div>

            <button
              disabled
              className="w-full py-3 bg-[#f7931a]/20 border border-[#f7931a]/30 text-amber-800 dark:text-[#f7931a] rounded-xl text-xs font-black uppercase tracking-wider cursor-not-allowed"
            >
              Sign In to Pay
            </button>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight uppercase font-outfit">
              2. Embedded Payment Widgets
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed font-medium">
              Retain your fans context. The inline tipping widget allows users to send support metrics directly inside your website layout without redirecting them to external links.
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              This widget uses a highly secure, isolated non-custodial iframe bridge. It automatically detects theme changes (Light/Dark mode) and allows creators to configure custom preset values, customize messaging and match brand colors perfectly.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0 mt-0.5"><Check size={12} /></div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Lower drop-off rates by avoiding domain switching.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0 mt-0.5"><Check size={12} /></div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Full customization of preset support quantities.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-white/5" />

        {/* Section 3: QR Codes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight uppercase font-outfit">
              3. Dynamic QR Codes
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed font-medium">
              Bridge the physical world and your digital creator space. Branded QR codes are perfect for creators who want to display instant scan-to-pay codes during live streams, in slide decks or printed on physical media.
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Dynamically generated QR structures are mobile-responsive and include a clean TipHive badge in the center to build trust with your supporters. Download them in high-resolution, print them on business cards, poster prints or place them in the overlay of your Twitch/YouTube stream.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl">
                <h4 className="text-slate-900 dark:text-white font-bold text-sm">High Contrast Recognition</h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Camera auto-scan detects tipping endpoints immediately.</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl">
                <h4 className="text-slate-900 dark:text-white font-bold text-sm">Download Options</h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Export in vectors or high-res raster shapes easily.</p>
              </div>
            </div>
          </div>

          {/* Right visual mock */}
          <div className="bg-slate-50 dark:bg-[#0f0f14] border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 shadow-xl relative overflow-hidden flex flex-col items-center justify-center space-y-6 h-[340px]">
            <div className="w-32 h-32 bg-white rounded-3xl p-3 relative flex items-center justify-center shadow-lg border border-slate-200 dark:border-transparent">
              <div className="grid grid-cols-4 gap-1.5 w-full h-full opacity-90">
                 {[...Array(16)].map((_, i) => (
                   <div key={i} className={`rounded-[2px] ${[0, 1, 4, 3, 12, 15].includes(i) ? 'bg-black' : 'bg-black/10'}`} />
                 ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-9 h-9 bg-[#f7931a] rounded-xl flex items-center justify-center shadow-md border-2 border-white">
                     <span className="text-black text-xs font-black">T</span>
                  </div>
              </div>
            </div>
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-300 block">Scan to Support @{username}</span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-widest font-black">Dynamic Redirect Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Login / Wallet Connect CTA Section */}
      {!authenticated && (
        <div className="w-full">
          <div className="relative border border-slate-200 dark:border-white/5 rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50 dark:from-[#0d0d12] dark:to-[#050508] p-10 md:p-16 text-center overflow-hidden shadow-2xl transition-all duration-500 border-t-[#f7931a]/15">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-[#f7931a]/40 to-transparent" />
            <div className="absolute -top-32 w-96 h-96 bg-[#f7931a]/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-center mb-6 shadow-inner relative mx-auto transition-colors duration-300">
              <Wallet className="w-7 h-7 text-[#f7931a] relative z-10" />
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-outfit uppercase tracking-tight mb-4">
              Interested in Tipping Integrations?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto mb-10 leading-relaxed text-sm md:text-base">
              Connect your wallet to generate customized buttons, widgets and dynamic QR codes linking directly to your TipHive creator profile.
            </p>

            <button
              onClick={login}
              className="px-10 py-4.5 bg-[#f7931a] hover:bg-[#e08215] text-white dark:text-black font-black uppercase tracking-wider text-xs md:text-sm rounded-2xl transition-all hover:shadow-[0_0_40px_rgba(247,147,26,0.3)] active:scale-95 cursor-pointer shadow-md"
            >
              Connect Wallet & Build Yours
            </button>
          </div>
        </div>
      )}

      {/* Modals for generation logic */}
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
