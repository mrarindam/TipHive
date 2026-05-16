'use client';

import * as React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider, createConfig } from '@privy-io/wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { http } from 'wagmi';
import { defineChain } from 'viem';

const TESTNET_RPC = process.env.NEXT_PUBLIC_TESTNET_RPC_URL || 'https://spectrum-01.simplystaking.xyz/YWhoZWVucm0tMDEtZmQ3YzY2NWY/IuFaiQdAx_Y9XQ/mezo/testnet/';
const MAINNET_RPC = process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://spectrum-01.simplystaking.xyz/Y2FhZ3ZkdXEtMDEtYzY1ZTM2NWM/wUcizgu7F7gykw/mezo/mainnet/';

export const mezoTestnet = defineChain({
  id: 31611,
  name: 'Mezo Testnet',
  network: 'mezo-testnet',
  nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 18 },
  rpcUrls: {
    default: { http: [TESTNET_RPC] },
    public: { http: [TESTNET_RPC] },
  },
  blockExplorers: {
    default: { name: 'Mezo Explorer', url: 'https://explorer.test.mezo.org' },
  },
  testnet: true,
});

export const mezoMainnet = defineChain({
  id: 31612,
  name: 'Mezo Mainnet',
  network: 'mezo-mainnet',
  nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 18 },
  rpcUrls: {
    default: { http: [MAINNET_RPC] },
    public: { http: [MAINNET_RPC] },
  },
  blockExplorers: {
    default: { name: 'Mezo Explorer', url: 'https://explorer.mezo.org' },
  },
});

const wagmiConfig = createConfig({
  chains: [mezoMainnet, mezoTestnet],
  transports: {
    [mezoMainnet.id]: http(MAINNET_RPC),
    [mezoTestnet.id]: http(TESTNET_RPC),
  },
});

const queryClient = new QueryClient();

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cmoo25aum00qp0cjvs3zhmunm'}
      config={{
        loginMethods: ['email', 'google', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#F7931A',
          logo: 'https://tiphive.xyz/logo.png',
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'off',
          },
        },
        defaultChain: mezoMainnet,
        supportedChains: [mezoMainnet, mezoTestnet],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
