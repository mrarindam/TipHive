'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useWalletAuth } from '@/lib/wallet-auth-shim';

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user } = useWalletAuth();
  const address = user?.wallet?.address;
  const router = useRouter();
  const pathname = usePathname();
  const profileStatusRef = useRef<{ address: string; isCreator: boolean } | null>(null);

  useEffect(() => {
    const resetProfileStatus = () => {
      profileStatusRef.current = null;
    };

    window.addEventListener('wallet-profile-updated', resetProfileStatus);
    window.addEventListener('tiphive-auth-changed', resetProfileStatus);
    return () => {
      window.removeEventListener('wallet-profile-updated', resetProfileStatus);
      window.removeEventListener('tiphive-auth-changed', resetProfileStatus);
    };
  }, []);

  useEffect(() => {
    if (pathname?.startsWith('/docs')) return;
    if (!ready || !authenticated || !address) return;

    const walletAddress = address.toLowerCase();

    const applyRedirect = (isCreator: boolean) => {
      if (!isCreator && pathname !== '/onboarding') {
        router.replace('/onboarding');
        return;
      }

      if (isCreator && pathname === '/onboarding') {
        router.replace('/dashboard');
      }
    };

    if (profileStatusRef.current?.address === walletAddress) {
      applyRedirect(profileStatusRef.current.isCreator);
      return;
    }

    const checkProfile = async () => {
      try {
        const res = await fetch(`/api/auth?wallet=${address}&t=${Date.now()}`, {
          credentials: 'include',
        });

        // 401 = session cookie not ready yet (SIWE still in progress, or
        // active wallet doesn't match the signed-in session). Stay quiet —
        // a 'tiphive-auth-changed' event will retrigger this effect once
        // the handshake settles.
        if (res.status === 401) return;

        if (!res.ok) throw new Error(`Auth API failed: ${res.status}`);

        const data = await res.json();
        const isCreator = data?.user?.is_creator === true;
        profileStatusRef.current = { address: walletAddress, isCreator };

        applyRedirect(isCreator);
      } catch (err) {
        console.error('ONBOARDING_GUARD: Error checking wallet profile', err);
      }
    };

    checkProfile();
  }, [address, ready, authenticated, pathname, router]);

  return <>{children}</>;
}
