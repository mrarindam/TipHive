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
import { WagmiProvider, http, useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { createSiweMessage } from 'viem/siwe';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { MAINNET_RPC, TESTNET_RPC, mezoMainnet, mezoTestnet } from '@/lib/chains';
import { mainnet, arbitrum, base, optimism, baseSepolia, arbitrumSepolia } from 'wagmi/chains';
import WalletSignInPrompt from './WalletSignInPrompt';

export { mezoMainnet, mezoTestnet };

const walletConnectProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || '';

const config = getDefaultConfig({
  appName: 'TIPHIVE',
  appDescription: 'Bitcoin-native and multi-chain creator tipping and subscriptions.',
  appUrl: 'https://tiphive.xyz',
  appIcon: '/logo.png',
  projectId: walletConnectProjectId,
  // Add support for multiple chains: Mezo, Base, Arbitrum, Optimism, Mainnet
  chains: [mezoTestnet, baseSepolia, arbitrumSepolia, mezoMainnet, base, arbitrum, optimism, mainnet],
  transports: {
    [mezoTestnet.id]: http(TESTNET_RPC),
    [mezoMainnet.id]: http(MAINNET_RPC),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [mainnet.id]: http(),
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
  const { disconnect } = useDisconnect();
  const pathname = usePathname();
  const router = useRouter();
  const { signMessageAsync } = useSignMessage();
  const signingRef = React.useRef<string | null>(null);
  const [needsSignIn, setNeedsSignIn] = React.useState(false);
  const [isSigning, setIsSigning] = React.useState(false);
  const [signError, setSignError] = React.useState<string | null>(null);

  const skipSignIn = !isConnected || !address || pathname?.startsWith('/embed/');

  // Reset modal state whenever the wallet is disconnected or the active address
  // changes. We re-check the session below and only re-open the prompt if a
  // signature is actually required for the new address.
  React.useEffect(() => {
    if (!isConnected || !address) {
      setNeedsSignIn(false);
      setIsSigning(false);
      setSignError(null);
      signingRef.current = null;
    }
  }, [address, isConnected]);

  React.useEffect(() => {
    if (skipSignIn) return;

    let cancelled = false;
    const activeAddress = address!.toLowerCase();

    const checkSession = async () => {
      try {
        const sessionResponse = await fetch('/api/auth/session', { credentials: 'include' });
        if (cancelled) return;

        if (sessionResponse.ok) {
          const session = await sessionResponse.json();
          if (String(session.address || '').toLowerCase() === activeAddress) {
            setNeedsSignIn(false);
            window.dispatchEvent(new Event('tiphive-auth-changed'));
            return;
          }

          window.dispatchEvent(new Event('tiphive-wallet-mismatch'));
          return;
        }

        // No valid session for this wallet — surface the in-app prompt and let
        // the user trigger the wallet signature themselves.
        setSignError(null);
        setNeedsSignIn(true);
      } catch (error) {
        console.error('Wallet session check failed:', error);
      }
    };

    checkSession();

    return () => {
      cancelled = true;
    };
  }, [address, isConnected, pathname, skipSignIn]);

  const performSignIn = React.useCallback(async () => {
    if (!isConnected || !address) return;
    const activeAddress = address.toLowerCase();
    if (signingRef.current === activeAddress) return;

    signingRef.current = activeAddress;
    setIsSigning(true);
    setSignError(null);

    try {
      const nonceResponse = await fetch('/api/auth/nonce', { credentials: 'include' });
      if (!nonceResponse.ok) throw new Error('Unable to prepare wallet sign-in');
      const { nonce } = await nonceResponse.json();

      const message = createSiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to TipHive with your wallet.',
        uri: window.location.origin,
        version: '1',
        chainId: chainId || mezoTestnet.id,
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

      setNeedsSignIn(false);
      window.dispatchEvent(new Event('tiphive-auth-changed'));
      if (needsOnboarding && pathname !== '/onboarding') {
        router.replace('/onboarding');
      }
    } catch (error) {
      console.error('Wallet sign-in failed:', error);
      const detail = error instanceof Error ? error.message : 'Unknown error during wallet sign-in.';
      setSignError(detail);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tiphive-wallet-error', { detail }));
      }
    } finally {
      if (signingRef.current === activeAddress) signingRef.current = null;
      setIsSigning(false);
    }
  }, [address, chainId, isConnected, pathname, router, signMessageAsync]);

  const handleCancel = React.useCallback(() => {
    setNeedsSignIn(false);
    setSignError(null);
    disconnect();
  }, [disconnect]);

  if (skipSignIn) return null;

  return (
    <WalletSignInPrompt
      open={needsSignIn}
      isSigning={isSigning}
      error={signError}
      onSignIn={performSignIn}
      onCancel={handleCancel}
    />
  );
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
          initialChain={mezoTestnet}
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
