'use client';

import { useChainId } from 'wagmi';

const MEZO_TESTNET_ID = 31611;
const MEZO_MAINNET_ID = 31612;

interface NetworkConfig {
  chainId: number;
  isMainnet: boolean;
  isTestnet: boolean;
  explorerUrl: string;
  networkName: string;
  contracts: {
    TIPPING: `0x${string}`;
    SUBSCRIPTION: `0x${string}`;
    MUSD: `0x${string}`;
  };
}

const TESTNET_CONFIG: NetworkConfig = {
  chainId: MEZO_TESTNET_ID,
  isMainnet: false,
  isTestnet: true,
  explorerUrl: 'https://explorer.test.mezo.org',
  networkName: 'Mezo Testnet',
  contracts: {
    TIPPING: (process.env.NEXT_PUBLIC_TESTNET_TIPPING_CONTRACT || process.env.NEXT_PUBLIC_TIPPING_CONTRACT || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    SUBSCRIPTION: (process.env.NEXT_PUBLIC_TESTNET_SUBSCRIPTION_CONTRACT || process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTRACT || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    MUSD: (process.env.NEXT_PUBLIC_TESTNET_MUSD_ADDRESS || process.env.NEXT_PUBLIC_MUSD_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  },
};

const MAINNET_CONFIG: NetworkConfig = {
  chainId: MEZO_MAINNET_ID,
  isMainnet: true,
  isTestnet: false,
  explorerUrl: 'https://explorer.mezo.org',
  networkName: 'Mezo Mainnet',
  contracts: {
    TIPPING: (process.env.NEXT_PUBLIC_MAINNET_TIPPING_CONTRACT || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    SUBSCRIPTION: (process.env.NEXT_PUBLIC_MAINNET_SUBSCRIPTION_CONTRACT || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    MUSD: (process.env.NEXT_PUBLIC_MAINNET_MUSD_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  },
};

export function useNetworkConfig(): NetworkConfig {
  const chainId = useChainId();

  if (chainId === MEZO_MAINNET_ID) {
    return MAINNET_CONFIG;
  }

  // Default to testnet for any other chain
  return TESTNET_CONFIG;
}

export { MEZO_TESTNET_ID, MEZO_MAINNET_ID };
