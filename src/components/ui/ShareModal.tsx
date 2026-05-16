'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Copy, Check, Share2
} from 'lucide-react';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  RedditShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  TelegramIcon,
  RedditIcon
} from 'react-share';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export default function ShareModal({ isOpen, onClose, url, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url ? (url.includes('?') ? `${url}&v=1` : `${url}?v=1`) : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    { Button: TwitterShareButton, Icon: TwitterIcon, label: 'Twitter', color: '#1DA1F2' },
    { Button: TelegramShareButton, Icon: TelegramIcon, label: 'Telegram', color: '#0088cc' },
    { Button: WhatsappShareButton, Icon: WhatsappIcon, label: 'WhatsApp', color: '#25D366' },
    { Button: FacebookShareButton, Icon: FacebookIcon, label: 'Facebook', color: '#4267B2' },
    { Button: LinkedinShareButton, Icon: LinkedinIcon, label: 'LinkedIn', color: '#0077B5' },
    { Button: RedditShareButton, Icon: RedditIcon, label: 'Reddit', color: '#FF4500' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card w-full max-w-md p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              <button
                onClick={onClose}
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all relative z-[110]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-8">
              <div className="w-12 h-12 bg-[#F7931A]/10 rounded-2xl flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6 text-[#F7931A]" />
              </div>
              <h2 className="text-2xl font-black text-white font-outfit uppercase tracking-tighter">Share <span className="text-[#F7931A]">Profile</span></h2>
              <p className="text-slate-400 text-sm mt-1">Spread the word and help the creator grow.</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {shareOptions.map((option, index) => (
                <motion.div
                  key={option.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <option.Button 
                    url={shareUrl} 
                    title={title} 
                    className="w-full flex flex-col items-center justify-center group outline-none"
                  >
                    <div className="relative mb-2">
                      <div 
                        className="absolute inset-0 blur-lg opacity-0 group-hover:opacity-40 transition-opacity rounded-full" 
                        style={{ backgroundColor: option.color }}
                      />
                      <option.Icon size={64} round className="transition-transform group-hover:scale-110 duration-300 relative z-10" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">
                      {option.label}
                    </span>
                  </option.Button>
                </motion.div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Profile Link</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-slate-400 text-sm font-mono truncate">
                  {shareUrl}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="bg-[#F7931A] hover:bg-[#FFAB40] text-white px-4 rounded-xl transition-all flex items-center justify-center min-w-[50px]"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Premium Liquid Decorative Element */}
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-[#F7931A]/10 blur-[60px] rounded-full" />
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#F7931A]/5 blur-[60px] rounded-full" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
