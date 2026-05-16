'use client';

import { useState, useEffect } from 'react';

export function usePerformanceSettings() {
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkPerformance = () => {
      // Basic mobile check
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Low end check: mobile OR reduced motion preference
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Hardware concurrency check (if available) - less than 4 cores is usually low end
      const lowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
      
      // Memory check (if available) - less than 4GB is usually low end
      // @ts-expect-error - deviceMemory is not yet in the official navigator type definition
      const lowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;

      setIsLowEnd(mobile || reducedMotion || lowCores || lowMemory);
    };

    checkPerformance();
    window.addEventListener('resize', checkPerformance);
    return () => window.removeEventListener('resize', checkPerformance);
  }, []);

  return {
    isLowEnd,
    isMobile,
    // Disable heavy layout animations on low end
    enableLayoutTransition: !isLowEnd,
    // Use simpler entrance animations
    simplifyAnimations: isLowEnd,
    // Disable expensive blur effects
    enableBlur: !isLowEnd,
  };
}
