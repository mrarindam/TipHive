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

const mezoTestnet = {
  id: 31611,
  name: 'Mezo Testnet',
  nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mezo-testnet.drpc.org'] },
  },
  blockExplorers: {
    default: { name: 'MezoScan', url: 'https://testnet.mezoscan.io' },
  },
} as const satisfies Chain;

const config = getDefaultConfig({
  appName: 'TIPHIVE',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || '80300a74d538e14674718507c30d931a',
  chains: [mezoTestnet],
  transports: {
    [mezoTestnet.id]: http(process.env.NEXT_PUBLIC_MEZO_RPC_URL),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
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
