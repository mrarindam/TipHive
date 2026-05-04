'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Check } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'tip' | 'subscription';
  amount?: string;
  creatorName?: string;
  planName?: string;
  message?: string;
}

export default function CelebrationModal({ 
  isOpen, 
  onClose, 
  type = 'tip', 
  amount, 
  creatorName, 
  planName, 
  message 
}: CelebrationModalProps) {
  const [particles, setParticles] = useState<{x: number, y: number, r: number}[]>([]);

  useEffect(() => {
    if (isOpen) {
      setParticles([...Array(24)].map(() => ({
        x: (Math.random() - 0.5) * 600,
        y: (Math.random() - 0.5) * 500,
        r: Math.random() * 360
      })));
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl"
          onClick={onClose}
        >
          {/* Confetti / Firecracker effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1, 1.2, 0.5],
                  x: p.x,
                  y: p.y,
                  rotate: p.r
                }}
                transition={{ 
                  duration: 2.5, 
                  delay: (index % 6) * 0.1,
                  repeat: Infinity,
                  repeatDelay: 0.5
                }}
                className={`absolute left-1/2 top-1/2 h-3 w-3 rounded-full ${
                  index % 3 === 0 ? 'bg-[#F7931A]' : 
                  index % 3 === 1 ? 'bg-[#8A2BE2]' : 'bg-white'
                } shadow-[0_0_15px_rgba(255,255,255,0.5)]`}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.8, y: 30, rotate: -2 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.8, y: 30, opacity: 0 }}
            className="glass-card relative max-w-lg w-full p-12 text-center overflow-hidden border-[#F7931A]/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F7931A]/10 blur-3xl rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#8A2BE2]/10 blur-3xl rounded-full -ml-16 -mb-16" />

            <div className="relative z-10">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-[#F7931A] to-[#FFAB40] shadow-[0_0_40px_rgba(247,147,26,0.5)]"
              >
                {type === 'tip' ? (
                  <Heart className="h-12 w-12 fill-white text-white" />
                ) : (
                  <Check className="h-12 w-12 text-white stroke-[4px]" />
                )}
              </motion.div>

              <h3 className="font-outfit text-5xl font-black uppercase tracking-tighter text-white mb-4">
                {type === 'tip' ? 'Awesome!' : 'Circle Joined!'}
              </h3>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                <p className="text-slate-300 text-lg leading-relaxed font-medium italic">
                  {type === 'tip' ? (
                    message || `Thank you so much for the ${amount} MUSD support! It means the world to me.`
                  ) : (
                    <>You are now subscribed to <span className="text-white font-bold">{planName}</span>. Thank you for supporting <span className="text-white font-bold">{creatorName}</span>!</>
                  )}
                </p>
              </div>

              <button 
                onClick={onClose}
                className="w-full btn-primary py-5 text-xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {type === 'tip' ? "You're Welcome! 🥂" : "Start Exploring 🚀"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
