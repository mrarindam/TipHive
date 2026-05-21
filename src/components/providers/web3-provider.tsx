'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  useConnectModal,
  getDefaultConfig,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import '@rainbow-me/rainbowkit/styles.css';
import { usePathname, useRouter } from 'next/navigation';
import { WagmiProvider, http, useAccount, useSignMessage } from 'wagmi';
import { createSiweMessage } from 'viem/siwe';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { MAINNET_RPC, TESTNET_RPC, mezoMainnet, mezoTestnet } from '@/lib/chains';

export { mezoMainnet, mezoTestnet };

const walletConnectProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || '';

const config = getDefaultConfig({
  appName: 'TIPHIVE',
  appDescription: 'Bitcoin-native creator tipping and subscriptions on Mezo.',
  appUrl: 'https://tiphive.xyz',
  appIcon: '/logo.png',
  projectId: walletConnectProjectId,
  // Mainnet first => RainbowKit/wagmi treat it as the default chain. Users can
  // still manually switch to testnet from the wallet profile menu.
  chains: [mezoMainnet, mezoTestnet],
  transports: {
    [mezoMainnet.id]: http(MAINNET_RPC),
    [mezoTestnet.id]: http(TESTNET_RPC),
  },
  wallets: [
    {
      groupName: 'WalletConnect',
      wallets: [walletConnectWallet],
    },
  ],
  ssr: true,
  // Keep EIP-6963 discovery enabled and let installed extensions register their
  // own providers. Explicit browser-wallet connectors reserve the same rdns ids
  // and can force RainbowKit into QR/WalletConnect fallback instead.
  multiInjectedProviderDiscovery: true,
});

const queryClient = new QueryClient();

function WalletSessionSync() {
  const { address, chainId, isConnected } = useAccount();
  const pathname = usePathname();
  const router = useRouter();
  const { signMessageAsync } = useSignMessage();
  const signingRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!isConnected || !address) return;
    // Embed widgets are public tip jars; visitors should NOT be forced through
    // SIWE just to send a tip. Skip the session handshake on /embed/* routes.
    if (pathname?.startsWith('/embed/')) return;

    let cancelled = false;
    const activeAddress = address.toLowerCase();

    const ensureSignedSession = async () => {
      try {
        const sessionResponse = await fetch('/api/auth/session', { credentials: 'include' });
        if (sessionResponse.ok) {
          const session = await sessionResponse.json();
          if (String(session.address || '').toLowerCase() === activeAddress) {
            window.dispatchEvent(new Event('tiphive-auth-changed'));
            return;
          }

          window.dispatchEvent(new Event('tiphive-wallet-mismatch'));
          return;
        }

        if (signingRef.current === activeAddress) return;
        signingRef.current = activeAddress;

        const nonceResponse = await fetch('/api/auth/nonce', { credentials: 'include' });
        if (!nonceResponse.ok) throw new Error('Unable to prepare wallet sign-in');
        const { nonce } = await nonceResponse.json();

        const message = createSiweMessage({
          domain: window.location.host,
          address,
          statement: 'Sign in to TipHive with your wallet.',
          uri: window.location.origin,
          version: '1',
          chainId: chainId || mezoMainnet.id,
          nonce,
        });

        const signature = await signMessageAsync({ message });
        const verifyResponse = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, signature }),
          credentials: 'include',
        });

        if (!verifyResponse.ok) {
          const errorBody = await verifyResponse.json().catch(() => ({}));
          const reason = errorBody?.reason || 'UNKNOWN';
          const detail = errorBody?.error || 'Wallet signature verification failed';
          console.error(`[wallet-sign-in] verify failed (${reason}): ${detail}`);
          throw new Error(`Wallet signature verification failed: ${reason} — ${detail}`);
        }

        const profileResponse = await fetch(`/api/auth?wallet=${activeAddress}&t=${Date.now()}`, {
          credentials: 'include',
        });
        if (!profileResponse.ok) throw new Error('Unable to load wallet profile');
        const profileData = await profileResponse.json();
        const needsOnboarding = profileData?.isNewUser === true || profileData?.user?.is_creator !== true;

        if (!cancelled) {
          window.dispatchEvent(new Event('tiphive-auth-changed'));
          if (needsOnboarding && pathname !== '/onboarding') {
            router.replace('/onboarding');
          }
        }
      } catch (error) {
        console.error('Wallet sign-in failed:', error);
        const detail = error instanceof Error ? error.message : 'Unknown error during wallet sign-in.';
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('tiphive-wallet-error', { detail }));
        }
      } finally {
        if (signingRef.current === activeAddress) signingRef.current = null;
      }
    };

    ensureSignedSession();

    return () => {
      cancelled = true;
    };
  }, [address, chainId, isConnected, pathname, router, signMessageAsync]);

  return null;
}

function WalletModalBridge() {
  const { openConnectModal } = useConnectModal();

  React.useEffect(() => {
    const handler = () => openConnectModal?.();
    window.addEventListener('open-rainbowkit-connect', handler);
    return () => window.removeEventListener('open-rainbowkit-connect', handler);
  }, [openConnectModal]);

  return null;
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={mezoMainnet}
          theme={darkTheme({
            accentColor: '#F7931A',
            accentColorForeground: 'white',
            borderRadius: 'large',
          })}
        >
          <WalletSessionSync />
          <WalletModalBridge />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
