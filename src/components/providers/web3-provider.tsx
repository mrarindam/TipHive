'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { type Chain } from 'viem';

const TESTNET_RPC = process.env.NEXT_PUBLIC_TESTNET_RPC_URL || 'https://spectrum-01.simplystaking.xyz/YWhoZWVucm0tMDEtZmQ3YzY2NWY/IuFaiQdAx_Y9XQ/mezo/testnet/';
const MAINNET_RPC = process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://spectrum-01.simplystaking.xyz/Y2FhZ3ZkdXEtMDEtYzY1ZTM2NWM/wUcizgu7F7gykw/mezo/mainnet/';

const mezoTestnet = {
  id: 31611,
  name: 'Mezo Testnet',
  nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 18 },
  rpcUrls: {
    default: { http: [TESTNET_RPC] },
  },
  blockExplorers: {
    default: { name: 'Mezo Explorer', url: 'https://explorer.test.mezo.org' },
  },
} as const satisfies Chain;

const mezoMainnet = {
  id: 31612,
  name: 'Mezo Mainnet',
  nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 18 },
  rpcUrls: {
    default: { http: [MAINNET_RPC] },
  },
  blockExplorers: {
    default: { name: 'Mezo Explorer', url: 'https://explorer.mezo.org' },
  },
} as const satisfies Chain;

const config = getDefaultConfig({
  appName: 'TIPHIVE',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || '80300a74d538e14674718507c30d931a',
  chains: [mezoTestnet, mezoMainnet],
  transports: {
    [mezoTestnet.id]: http(TESTNET_RPC),
    [mezoMainnet.id]: http(MAINNET_RPC),
  },
  ssr: true,
  multiInjectedProviderDiscovery: true,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#F7931A',
            accentColorForeground: 'white',
            borderRadius: 'large',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
