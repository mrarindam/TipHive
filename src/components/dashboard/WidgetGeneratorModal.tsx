'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Layout, Palette, MessageSquare, Code, Sparkles } from 'lucide-react';
import { HexColorPicker } from "react-colorful";

interface WidgetGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export default function WidgetGeneratorModal({ isOpen, onClose, username }: WidgetGeneratorModalProps) {
  const [step, setStep] = useState<'customize' | 'code'>('customize');
  const [title, setTitle] = useState('Support me on TipHive');
  const [description, setDescription] = useState('If you like my work, consider supporting me with a tip!');
  const [color, setColor] = useState('#f7931a');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [copiedType, setCopiedType] = useState<'iframe' | 'script' | null>(null);
  const [baseUrl, setBaseUrl] = useState('https://tiphive.com');

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const embedUrl = `${baseUrl}/embed/${username}?color=${color.replace('#', '')}&title=${encodeURIComponent(title)}&desc=${encodeURIComponent(description)}`;
  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" style="border-radius: 24px; border: 1px solid rgba(255,255,255,0.1);"></iframe>`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType('iframe');
    setTimeout(() => setCopiedType(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl bg-[#0a0a0c] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden z-10"
      >
        <button onClick={onClose} className="absolute top-6 right-6 z-20 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>

        {step === 'customize' ? (
          <div className="flex flex-col md:flex-row h-full">
            {/* Left Side: Preview */}
            <div className="flex-1 bg-[#050507] p-8 md:p-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 min-h-[400px]">
               <div className="w-full max-w-md space-y-6">
                  <div className="flex items-center gap-2 mb-8">
                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase ml-2 tracking-widest">Live Widget Preview</span>
                  </div>

                  <div className="bg-[#111116] rounded-3xl border border-white/10 p-8 shadow-2xl space-y-6">
                    <div className="space-y-2">
                       <h4 className="text-xl font-black text-white">{title}</h4>
                       <p className="text-sm text-slate-500 font-medium">{description}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                       {[5, 10, 15].map(amount => (
                         <div key={amount} className="py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-center text-white font-bold text-sm cursor-pointer hover:bg-white/10 transition-colors">
                            ${amount}
                         </div>
                       ))}
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-slate-500 text-sm font-medium">
                       Custom amount
                    </div>

                    <button 
                      style={{ backgroundColor: color }}
                      className="w-full py-4 rounded-2xl text-black font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-500/10 hover:brightness-110 transition-all"
                    >
                      Send Support ⚡
                    </button>
                  </div>
               </div>
            </div>

            {/* Right Side: Controls */}
            <div className="w-full md:w-[380px] p-8 space-y-8 overflow-y-auto max-h-[600px]">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white tracking-tight">Widget Settings</h3>
                <p className="text-slate-500 text-sm font-medium">Customize how your tip box looks</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <MessageSquare size={12} /> Widget Title
                  </label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold placeholder:text-slate-600 focus:ring-2 focus:ring-[#f7931a] outline-none transition-all"
                    placeholder="Enter title..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Layout size={12} /> Description
                  </label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold placeholder:text-slate-600 focus:ring-2 focus:ring-[#f7931a] outline-none transition-all min-h-[100px] resize-none"
                    placeholder="Enter description..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Palette size={12} /> Brand Color
                  </label>
                  <div className="flex gap-3">
                    {['#f7931a', '#a855f7', '#3b82f6', '#10b981', '#ef4444'].map(c => (
                      <button 
                        key={c} 
                        onClick={() => { setColor(c); setIsColorPickerOpen(false); }}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <div className="relative">
                      <button 
                        onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                        className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-all ${isColorPickerOpen ? 'bg-white/20 ring-2 ring-white text-white' : 'text-white/60 hover:text-white'}`}
                      >
                        <Sparkles size={18} />
                      </button>
                      <AnimatePresence>
                        {isColorPickerOpen && (
                          <div className="absolute bottom-full right-0 mb-4 p-4 bg-[#1a1a20] border border-white/10 rounded-2xl shadow-2xl z-50">
                            <HexColorPicker color={color} onChange={setColor} />
                            <div className="mt-4 flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/5">
                               <span className="text-[10px] font-black font-mono text-white uppercase tracking-wider">{color}</span>
                               <button onClick={() => setIsColorPickerOpen(false)} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest">Done</button>
                            </div>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setStep('code')}
                className="w-full py-5 bg-[#f7931a] rounded-[20px] text-black font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Generate Widget <Sparkles size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-12 space-y-10">
            <div className="space-y-4 text-center max-w-2xl mx-auto">
                <h3 className="text-4xl font-black text-white tracking-tight">Ready to Embed!</h3>
                <p className="text-slate-500 font-medium leading-relaxed">Copy the code below to add the TipHive widget to your website. It supports direct crypto tipping from your fans.</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
               <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Code size={12} /> Inline Iframe Code</span>
                     <button onClick={() => copyToClipboard(iframeCode)} className="text-[10px] font-black uppercase tracking-widest text-[#f7931a] flex items-center gap-2 hover:text-white transition-colors">
                        {copiedType === 'iframe' ? <Check size={12} /> : <Copy size={12} />}
                        {copiedType === 'iframe' ? 'Copied' : 'Copy Code'}
                     </button>
                  </div>
                  <div className="bg-[#050507] p-8 rounded-2xl border border-white/5 font-mono text-sm text-slate-400 break-all leading-relaxed whitespace-pre-wrap min-h-[200px]">
                     {iframeCode}
                  </div>
               </div>
            </div>

            <div className="flex gap-4 pt-4 max-w-md mx-auto">
               <button onClick={() => setStep('customize')} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-colors">Back to customize</button>
               <button onClick={onClose} className="flex-1 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors">Finish</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
