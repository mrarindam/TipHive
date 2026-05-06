'use client';

import { motion } from 'framer-motion';

export const Skeleton = ({ className }: { className: string }) => (
  <div className={`relative overflow-hidden bg-white/5 rounded-2xl ${className}`}>
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: '100%' }}
      transition={{
        repeat: Infinity,
        duration: 1.5,
        ease: 'linear',
      }}
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
    />
  </div>
);

export const PostCardSkeleton = () => (
  <div className="bg-[#111827] border border-white/5 rounded-[2.5rem] overflow-hidden p-4">
    <Skeleton className="w-full aspect-video rounded-[2rem] mb-6" />
    <div className="px-4 pb-4">
      <Skeleton className="h-8 w-3/4 mb-4" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  </div>
);

export const ProfileHeaderSkeleton = () => (
  <div className="w-full">
    {/* Cover Area */}
    <Skeleton className="w-full h-64 md:h-80 rounded-b-[4rem]" />
    
    <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-10">
      <div className="flex flex-col md:flex-row items-end gap-8 mb-12">
        <div className="relative group">
           <Skeleton className="w-40 h-40 md:w-48 md:h-48 rounded-full border-8 border-[#0B0F19]" />
        </div>
        <div className="flex-1 pb-4 text-center md:text-left">
           <Skeleton className="h-12 w-64 mb-4 mx-auto md:mx-0" />
           <Skeleton className="h-6 w-40 mx-auto md:mx-0" />
        </div>
      </div>
    </div>
  </div>
);

export const SinglePostSkeleton = () => (
  <div className="max-w-4xl mx-auto py-12 px-6">
    <Skeleton className="h-4 w-32 mb-8" />
    <Skeleton className="h-16 w-3/4 mb-12" />
    <Skeleton className="w-full aspect-video rounded-[3rem] mb-12" />
    <div className="space-y-4">
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-2/3" />
    </div>
  </div>
);
