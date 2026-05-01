'use client';

import { motion } from 'framer-motion';
import { Share2, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import ShareModal from './ShareModal';
import MUSDLogo from './MUSDLogo';

interface CreatorProps {
  creator: {
    address: string;
    username?: string;
    name: string;
    bio: string;
    avatar_url: string;
    category: string;
    total_earned: number;
  };
}

export default function CreatorCard({ creator }: CreatorProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        className="glass-card overflow-hidden group hover:border-[#F7931A]/30 transition-all border-white/5"
      >
        <div className="h-32 bg-gradient-to-br from-[#F7931A]/20 to-transparent relative">
          <div className="absolute -bottom-8 left-6">
            <Image
              src={creator.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=random`}
              alt={creator.name}
              width={80}
              height={80}
              className="w-20 h-20 rounded-2xl border-4 border-[#0a0a0c] object-cover bg-[#1a1a1a]"
              unoptimized
            />
          </div>
        </div>

        <div className="p-6 pt-12">
          <div className="flex justify-between items-start mb-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-white group-hover:text-[#F7931A] transition-colors font-outfit truncate">
                {creator.name}
              </h3>
              <p className="text-xs text-[#F7931A]/80 font-bold mt-0.5">
                {creator.username ? `@${creator.username}` : ''}
              </p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Tips</p>
              <p className="text-lg font-black text-white flex items-center gap-1 justify-end">{creator.total_earned || 0} <MUSDLogo className="w-5 h-5" /></p>
            </div>
          </div>

          {/* Categories */}
          {creator.category && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {creator.category.split(',').map((cat) => cat.trim()).filter(Boolean).map((cat) => (
                <span
                  key={cat}
                  className="text-[10px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full bg-[#F7931A]/10 border border-[#F7931A]/25 text-[#F7931A]"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          <p className="text-slate-400 text-sm line-clamp-2 mb-6 h-10">
            {creator.bio}
          </p>

          <div className="flex gap-3">
            <Link
              href={`/profile/${creator.username || creator.address}`}
              className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 fill-current" />
              Tip Creator
            </Link>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
            >
              <Share2 className="w-4 h-4 text-[#F7931A]" />
            </button>
          </div>
        </div>
      </motion.div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={`http://localhost:3000/profile/${creator.username || creator.address}`}
        title={`👋 Check out my profile on TipHive! If you enjoy my work, \n\nyou can now support me by tipping via MUSD on the Mezo Network. Every bit helps! 🚀💎`}
      />
    </>
  );
}
