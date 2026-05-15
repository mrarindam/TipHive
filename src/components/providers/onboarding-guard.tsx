'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter, usePathname } from 'next/navigation';

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
    const { ready, authenticated, user, getAccessToken } = usePrivy();
    const router = useRouter();
    const pathname = usePathname();
    const [status, setStatus] = useState<'loading' | 'new' | 'existing'>('loading');

    useEffect(() => {
      if (!ready || !authenticated || !user?.id) {
        return;
      }

      const checkProfile = async () => {
        try {
          const walletToQuery = address || user?.wallet?.address || '';
          const token = await getAccessToken();
          const res = await fetch(`/api/auth?did=${user.id}&wallet=${walletToQuery}&t=${Date.now()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) throw new Error(`Auth API failed: ${res.status}`);
        
        const data = await res.json();
        
        if (!data?.user) {
          setStatus('new');
          return;
        }

        // isNewUser flag from API = truly brand new account
        // is_creator = false but has username/display_name = old user that didn't complete onboarding  
        // is_creator = true OR has wallet_address with data = existing user, skip onboarding
        const isCreator = data.user.is_creator === true;
        console.log('ONBOARDING_GUARD:', { isCreator, pathname, did: user.id });

        if (!isCreator) {
          console.log('ONBOARDING_GUARD: User is NOT a creator, setting status to new');
          setStatus('new');
          if (pathname !== '/onboarding') {
            console.log('ONBOARDING_GUARD: Triggering redirect to /onboarding');
            router.replace('/onboarding');
          }
        } else {
          console.log('ONBOARDING_GUARD: User IS a creator, setting status to existing');
          setStatus('existing');
          if (pathname === '/onboarding') {
            router.replace('/dashboard');
          }
        }
      } catch (err) {
        console.error('ONBOARDING_GUARD: Error in checkProfile', err);
        // On error, don't redirect — let user stay where they are
        setStatus('existing');
      }
    };

    checkProfile();
  }, [address, ready, authenticated, user?.id, user?.wallet?.address, pathname, router, getAccessToken]);

  // Show loading screen while checking status to prevent flashes and race conditions
  if (authenticated && (status === 'loading' || (status === 'new' && pathname !== '/onboarding'))) {
    return (
      <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-[200]">
        <div className="relative">
          <div className="absolute inset-0 bg-[#F7931A]/20 blur-3xl rounded-full animate-pulse" />
          <img src="/logo.png" alt="TipHive" className="w-16 h-16 relative mb-8 animate-bounce unoptimized" />
        </div>
        <div className="flex items-center gap-3 text-slate-400 font-bold tracking-widest uppercase text-sm">
          <div className="w-4 h-4 border-2 border-[#F7931A] border-t-transparent rounded-full animate-spin" />
          Securing Session...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
