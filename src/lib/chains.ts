import { type Chain } from 'viem';

// Private RPCs (Simply Staking / env) — used by backend & frontend fetching only.
export const TESTNET_RPC =
  process.env.NEXT_PUBLIC_TESTNET_RPC_URL ||
  'https://spectrum-01.simplystaking.xyz/YWhoZWVucm0tMDEtZmQ3YzY2NWY/IuFaiQdAx_Y9XQ/mezo/testnet/';

export const MAINNET_RPC =
  process.env.NEXT_PUBLIC_MAINNET_RPC_URL ||
  'https://spectrum-01.simplystaking.xyz/Y2FhZ3ZkdXEtMDEtYzY1ZTM2NWM/wUcizgu7F7gykw/mezo/mainnet/';

// Public RPCs — these are the URLs added to the user's wallet when the chain
// gets registered there. Never put the private RPC in `rpcUrls`.
export const PUBLIC_TESTNET_RPC = 'https://rpc.test.mezo.org';
export const PUBLIC_MAINNET_RPC = 'https://rpc-http.mezo.boar.network';

export const mezoTestnet = {
  id: 31611,
  name: 'Mezo Testnet',
  nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 18 },
  rpcUrls: {
    default: { http: [PUBLIC_TESTNET_RPC] },
  },
  blockExplorers: {
    default: { name: 'Mezo Explorer', url: 'https://explorer.test.mezo.org' },
  },
} as const satisfies Chain;

export const mezoMainnet = {
  id: 31612,
  name: 'Mezo Mainnet',
  nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 18 },
  rpcUrls: {
    default: { http: [PUBLIC_MAINNET_RPC] },
  },
  blockExplorers: {
    default: { name: 'Mezo Explorer', url: 'https://explorer.mezo.org' },
  },
} as const satisfies Chain;

