'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface MUSDLogoProps {
  className?: string;
  animate?: boolean;
}

export default function MUSDLogo({ className = "w-6 h-6", animate = false }: MUSDLogoProps) {
  const content = (
    <Image 
      src="/musd.png" 
      alt="MUSD" 
      width={24}
      height={24}
      className={`${className} object-contain rounded-full`}
      unoptimized
    />
  );

  if (animate) {
    return (
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
