'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Copy, Check, ChevronDown, Sparkles, Hash } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { HexColorPicker } from "react-colorful";
import { useTheme } from 'next-themes';

interface ButtonGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export default function ButtonGeneratorModal({ isOpen, onClose, username }: ButtonGeneratorModalProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'customize' | 'code'>('customize');
  const [buttonText, setButtonText] = useState('Support on TipHive');
  const [emoji, setEmoji] = useState('⚡');
  const [color, setColor] = useState('#f7931a');
  const [font, setFont] = useState('Inter');
  const [type, setType] = useState<'standard' | 'count'>('standard');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [copiedType, setCopiedType] = useState<'script' | 'image' | null>(null);

  const colors = ['#f7931a', '#a855f7', '#3b82f6', '#10b981', '#ef4444'];
  const fonts = ['Inter', 'Cookie', 'Roboto', 'Oswald'];

  const [baseUrl, setBaseUrl] = useState('https://tiphive.com');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const generatedCode = `<script type="text/javascript" src="${baseUrl}/api/v1/widget" data-name="tiphive-button" data-slug="${username}" data-color="${color}" data-emoji="${emoji}" data-font="${font}" data-text="${buttonText}"${type === 'count' ? ' data-count="true"' : ''}></script>`;
  const generatedImageCode = `<a href="${baseUrl}/${username}"><img src="${baseUrl}/api/v1/button?slug=${username}&text=${encodeURIComponent(buttonText)}&emoji=${encodeURIComponent(emoji)}&color=${color.replace('#', '')}&font=${encodeURIComponent(font)}${type === 'count' ? '&count=true' : ''}" alt="Support me on TipHive" /></a>`;

  const copyToClipboard = (text: string, type: 'script' | 'image') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
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
        className="relative w-full max-w-2xl bg-white dark:bg-[#0f0f14] border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-6 right-6 z-20 w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
          <X size={20} />
        </button>

        {step === 'customize' ? (
          <div className="flex flex-col">
            {/* Preview Area */}
            <div className="bg-slate-50 dark:bg-[#050507] p-12 flex flex-col items-center justify-center relative min-h-[300px]">
              <div className="absolute top-4 left-6 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-500/50" />
                 <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                 <div className="w-2 h-2 rounded-full bg-green-500/50" />
              </div>

              <motion.div 
                layoutId="preview-button"
                style={{ backgroundColor: color, fontFamily: font }}
                className={`flex items-center gap-3 px-8 py-4 rounded-full text-black font-black text-xl shadow-2xl transition-all duration-300`}
              >
                <span className="text-2xl">{emoji}</span>
                {buttonText}
                {type === 'count' && (
                  <div className="ml-2 pl-4 border-l border-black/10 flex items-center gap-2 opacity-60">
                    <Hash size={16} />
                    <span className="text-sm">220</span>
                  </div>
                )}
              </motion.div>

              <div className="absolute bottom-8 left-0 right-0 px-8 flex items-center justify-between">
                <div className="flex gap-3">
                  {colors.map(c => (
                    <button 
                      key={c} 
                      onClick={() => {
                        setColor(c);
                        setIsColorPickerOpen(false);
                      }}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  
                  <div className="relative">
                    <button 
                      onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                      className={`w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center transition-all ${isColorPickerOpen ? 'bg-slate-200 dark:bg-white/20 ring-2 ring-slate-400 dark:ring-white text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-white/60 dark:hover:text-white'}`}
                    >
                      <Sparkles size={18} />
                    </button>

                    <AnimatePresence>
                      {isColorPickerOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, x: '-50%' }}
                          animate={{ opacity: 1, y: 0, x: '-50%' }}
                          exit={{ opacity: 0, y: 10, x: '-50%' }}
                          className="absolute bottom-full left-1/2 mb-4 p-4 bg-white dark:bg-[#1a1a20] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50"
                        >
                          <HexColorPicker color={color} onChange={setColor} />
                          <div className="mt-4 flex items-center justify-between bg-slate-50 dark:bg-black/40 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-lg shadow-sm border border-slate-200 dark:border-white/10" style={{ backgroundColor: color }} />
                              <span className="text-[10px] font-black font-mono text-slate-900 dark:text-white uppercase tracking-wider">{color}</span>
                            </div>
                            <button 
                              onClick={() => setIsColorPickerOpen(false)}
                              className="text-[10px] font-black text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white uppercase tracking-widest"
                            >
                              Done
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="relative">
                  <select 
                    value={font} 
                    onChange={(e) => setFont(e.target.value)}
                    className="appearance-none bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 pr-10 text-sm font-bold text-slate-800 dark:text-white outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                  >
                    {fonts.map(f => <option key={f} value={f} className="bg-white dark:bg-[#0f0f14] text-slate-900 dark:text-white">{f}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Controls Area */}
            <div className="p-8 space-y-8">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Button Text</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                       <button 
                         onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                         className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white transition-colors text-xl"
                       >
                         {emoji}
                       </button>
                    </div>
                    <input 
                      type="text" 
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-5 pl-16 pr-6 text-slate-900 dark:text-white font-bold outline-none focus:border-[#f7931a]/50 transition-all"
                      placeholder="Button text..."
                    />
                    
                    <AnimatePresence>
                      {isEmojiPickerOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full left-0 mb-4 z-[60] shadow-2xl scale-90 md:scale-100 origin-bottom-left"
                        >
                          <div className="relative">
                            <Picker 
                              data={data} 
                              onEmojiSelect={(emojiData: { native: string }) => { 
                                console.log('Emoji selected:', emojiData);
                                if (emojiData.native) {
                                  setEmoji(emojiData.native); 
                                }
                                setIsEmojiPickerOpen(false); 
                              }} 
                              theme={mounted && resolvedTheme === 'dark' ? 'dark' : 'light'}
                            />
                            <button 
                              onClick={() => setIsEmojiPickerOpen(false)}
                              className="absolute top-2 right-2 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white/50 hover:text-white z-10"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <button 
                  onClick={() => setStep('code')}
                  className="w-full md:w-auto bg-[#f7931a] text-black h-[62px] px-8 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#f7931a]/20"
                >
                  <RefreshCw size={16} />
                  Generate Button
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <button 
                  onClick={() => setType('standard')}
                  className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${type === 'standard' ? 'bg-[#f7931a]/10 border-[#f7931a]/50' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/[0.08]'}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-[#f7931a]/20 flex items-center justify-center">
                    <div className="w-6 h-2 bg-[#f7931a] rounded-full" />
                  </div>
                  <div className="text-left">
                    <div className="text-slate-900 dark:text-white font-black text-sm">Standard button</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs font-medium">Clean and simple</div>
                  </div>
                </button>

                <button 
                  onClick={() => setType('count')}
                  className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${type === 'count' ? 'bg-[#f7931a]/10 border-[#f7931a]/50' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/[0.08]'}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center gap-1">
                    <div className="w-4 h-2 bg-purple-500 rounded-full" />
                    <div className="w-2 h-2 bg-purple-500/40 rounded-full" />
                  </div>
                  <div className="text-left">
                    <div className="text-slate-900 dark:text-white font-black text-sm">Button + supporter count</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs font-medium">Show your social proof</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 space-y-10">
             <div className="space-y-4">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Your code is ready!</h3>
                <p className="text-slate-500 font-medium leading-relaxed">Copy the code below and paste it into the HTML of your website where you want the button to appear.</p>
             </div>

             <div className="space-y-6">
                <div className="space-y-3">
                   <div className="flex items-center justify-between px-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Widget Script</span>
                      <button 
                        onClick={() => copyToClipboard(generatedCode, 'script')}
                        className="text-[10px] font-black uppercase tracking-widest text-[#f7931a] flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        {copiedType === 'script' ? <Check size={12} /> : <Copy size={12} />}
                        {copiedType === 'script' ? 'Copied' : 'Copy Code'}
                      </button>
                   </div>
                   <div className="bg-slate-50 dark:bg-[#050507] p-6 rounded-2xl border border-slate-200 dark:border-white/5 font-mono text-xs text-slate-700 dark:text-slate-400 break-all leading-relaxed whitespace-pre-wrap">
                      {generatedCode}
                   </div>
                </div>

                <div className="space-y-3">
                   <div className="flex items-center justify-between px-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Image Tag (Markdown)</span>
                      <button 
                        onClick={() => copyToClipboard(generatedImageCode, 'image')}
                        className="text-[10px] font-black uppercase tracking-widest text-[#f7931a] flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        {copiedType === 'image' ? <Check size={12} /> : <Copy size={12} />}
                        {copiedType === 'image' ? 'Copied' : 'Copy Image Code'}
                      </button>
                   </div>
                   <div className="bg-slate-50 dark:bg-[#050507] p-6 rounded-2xl border border-slate-200 dark:border-white/5 font-mono text-xs text-slate-700 dark:text-slate-400 break-all leading-relaxed whitespace-pre-wrap">
                      {generatedImageCode}
                   </div>
                </div>
             </div>

             <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setStep('customize')}
                  className="flex-1 py-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-800 dark:text-white font-black uppercase tracking-widest text-xs hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                >
                   Back to customize
                </button>
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest text-xs dark:hover:bg-slate-200 transition-colors"
                >
                   Finish
                </button>
             </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
