'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter, usePathname } from 'next/navigation';

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  const [isCreator, setIsCreator] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      return;
    }

    const checkProfile = async () => {
      try {
        const res = await fetch(`/api/auth?wallet=${address}`);
        const data = await res.json();
        
        if (data?.user) {
          setIsCreator(data.user.is_creator);
          if (data.user.is_creator === false && pathname !== '/onboarding') {
            router.replace('/onboarding');
          } else if (data.user.is_creator === true && pathname === '/onboarding') {
            router.replace('/dashboard');
          }
        }
      } catch (err) {
        console.error('Failed to check profile for onboarding', err);
      }
    };

    checkProfile();
  }, [address, isConnected, pathname, router]);

  // Don't render anything if we are redirecting to onboarding to prevent flashing
  if (isConnected && isCreator === false && pathname !== '/onboarding') {
    return null; 
  }

  return <>{children}</>;
}
