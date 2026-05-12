'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Palette, Check, Sparkles, QrCode } from 'lucide-react';
import QRCodeStyling, { DotType } from "qr-code-styling";

interface QRCodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

const colors = [
  { name: 'Orange', value: '#f97316' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Red', value: '#ef4444' },
];

export default function QRCodeGeneratorModal({ isOpen, onClose, username }: QRCodeGeneratorModalProps) {
  const [dotColor, setDotColor] = useState('#f97316');
  const [qrType, setQrType] = useState<DotType>('rounded');
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);
  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${username}`;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    qrCodeInstance.current = new QRCodeStyling({
      width: 300,
      height: 300,
      data: profileUrl,
      image: "/logo.png",
      dotsOptions: {
        color: dotColor,
        type: qrType
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 5
      }
    });

    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCodeInstance.current.append(qrRef.current);
    }
  }, [dotColor, qrType, profileUrl, isOpen]);

  const downloadQR = (extension: 'png' | 'svg' | 'jpeg') => {
    qrCodeInstance.current?.download({ name: `tiphive-qr-${username}`, extension });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[#0a0a0c] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col md:flex-row"
        >
          {/* Left Side: Preview */}
          <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center bg-white/5 border-r border-white/5">
            <div className="relative group">
               <div className="absolute -inset-4 bg-gradient-to-tr from-[#f7931a]/20 to-purple-500/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="relative bg-white p-6 rounded-[2.5rem] shadow-2xl overflow-hidden" ref={qrRef} />
            </div>
            
            <div className="mt-8 text-center">
              <h3 className="text-xl font-black text-white flex items-center justify-center gap-2">
                 <QrCode className="w-5 h-5 text-[#f7931a]" />
                 Scan to Support
              </h3>
              <p className="text-slate-500 text-sm mt-2 font-medium">tiphive.com/{username}</p>
            </div>
          </div>

          {/* Right Side: Customization */}
          <div className="flex-1 p-8 md:p-12 space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-white tracking-tight">QR Design</h2>
                    <p className="text-slate-500 text-sm font-medium">Style your unique support code</p>
                </div>
                <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
                    <X size={20} />
                </button>
            </div>

            {/* Dot Colors */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Palette size={12} /> QR Pattern Color
              </label>
              <div className="flex flex-wrap gap-3">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setDotColor(c.value)}
                    className={`w-10 h-10 rounded-xl transition-all duration-300 relative ${dotColor === c.value ? 'scale-110 shadow-lg shadow-' + c.name.toLowerCase() + '-500/20' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c.value }}
                  >
                    {dotColor === c.value && <Check className="absolute inset-0 m-auto text-white" size={16} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern Type */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Sparkles size={12} /> Pattern Style
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['rounded', 'dots', 'classy'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setQrType(type)}
                    className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${qrType === type ? 'bg-[#f7931a] text-black border-[#f7931a] shadow-xl shadow-orange-500/20' : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Download Buttons */}
            <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Download size={12} /> Download Asset
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => downloadQR('png')}
                        className="py-4 bg-[#f7931a] hover:bg-[#f7931a]/90 text-black font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#f7931a]/10"
                    >
                        PNG High Res
                    </button>
                    <button 
                        onClick={() => downloadQR('svg')}
                        className="py-4 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/5"
                    >
                        SVG Vector
                    </button>
                </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
