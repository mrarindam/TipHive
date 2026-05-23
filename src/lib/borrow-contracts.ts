import { parseAbi } from 'viem';

const ZERO_ADDR = '0x0000000000000000000000000000000000000000' as const;

export const TESTNET_BORROW = {
  BorrowerOperations: (process.env.NEXT_PUBLIC_TESTNET_BORROWER_OPERATIONS || ZERO_ADDR) as `0x${string}`,
  TroveManager: (process.env.NEXT_PUBLIC_TESTNET_TROVE_MANAGER || ZERO_ADDR) as `0x${string}`,
  HintHelpers: (process.env.NEXT_PUBLIC_TESTNET_HINT_HELPERS || ZERO_ADDR) as `0x${string}`,
  SortedTroves: (process.env.NEXT_PUBLIC_TESTNET_SORTED_TROVES || ZERO_ADDR) as `0x${string}`,
  PriceFeed: (process.env.NEXT_PUBLIC_TESTNET_PRICE_FEED || ZERO_ADDR) as `0x${string}`,
  MUSD: (process.env.NEXT_PUBLIC_TESTNET_MUSD_ADDRESS || ZERO_ADDR) as `0x${string}`,
} as const;

export const MAINNET_BORROW = {
  BorrowerOperations: (process.env.NEXT_PUBLIC_MAINNET_BORROWER_OPERATIONS || ZERO_ADDR) as `0x${string}`,
  TroveManager: (process.env.NEXT_PUBLIC_MAINNET_TROVE_MANAGER || ZERO_ADDR) as `0x${string}`,
  HintHelpers: (process.env.NEXT_PUBLIC_MAINNET_HINT_HELPERS || ZERO_ADDR) as `0x${string}`,
  SortedTroves: (process.env.NEXT_PUBLIC_MAINNET_SORTED_TROVES || ZERO_ADDR) as `0x${string}`,
  PriceFeed: (process.env.NEXT_PUBLIC_MAINNET_PRICE_FEED || ZERO_ADDR) as `0x${string}`,
  MUSD: (process.env.NEXT_PUBLIC_MAINNET_MUSD_ADDRESS || ZERO_ADDR) as `0x${string}`,
} as const;

export type BorrowAddresses = typeof TESTNET_BORROW;

export const BORROWER_OPERATIONS_ABI = parseAbi([
  'function openTrove(uint256 _debtAmount, address _upperHint, address _lowerHint) payable',
  'function closeTrove()',
  'function addColl(address _upperHint, address _lowerHint) payable',
  'function withdrawColl(uint256 _amount, address _upperHint, address _lowerHint)',
  'function withdrawMUSD(uint256 _amount, address _upperHint, address _lowerHint)',
  'function repayMUSD(uint256 _amount, address _upperHint, address _lowerHint)',
  'function adjustTrove(uint256 _collWithdrawal, uint256 _debtChange, bool _isDebtIncrease, address _upperHint, address _lowerHint) payable',
  'function borrowingRate() view returns (uint256)',
  'function minNetDebt() view returns (uint256)',
  'function MUSD_GAS_COMPENSATION() view returns (uint256)',
  'function MCR() view returns (uint256)',
]);

export const TROVE_MANAGER_ABI = parseAbi([
  'function getTroveDebt(address) view returns (uint256)',
  'function getTroveColl(address) view returns (uint256)',
  'function getTroveStatus(address) view returns (uint8)',
  'function getCurrentICR(address _borrower, uint256 _price) view returns (uint256)',
]);

export const HINT_HELPERS_ABI = parseAbi([
  'function getApproxHint(uint256 _CR, uint256 _numTrials, uint256 _inputRandomSeed) view returns (address hintAddress, uint256 diff, uint256 latestRandomSeed)',
  'function computeNominalCR(uint256 _coll, uint256 _debt) pure returns (uint256)',
  'function computeCR(uint256 _coll, uint256 _debt, uint256 _price) pure returns (uint256)',
]);

export const SORTED_TROVES_ABI = parseAbi([
  'function findInsertPosition(uint256 _NICR, address _prevId, address _nextId) view returns (address, address)',
  'function getSize() view returns (uint256)',
]);

export const PRICE_FEED_ABI = parseAbi([
  'function fetchPrice() view returns (uint256)',
]);

export const MUSD_ERC20_ABI = parseAbi([
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address,address) view returns (uint256)',
  'function approve(address,uint256) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]);

// Constants from the Mezo/Liquity-style borrowing protocol
export const ONE_E18 = BigInt('1000000000000000000');
export const GAS_COMPENSATION = BigInt('200000000000000000000'); // 200 MUSD held as gas comp
export const MIN_CR_BPS = BigInt('1100000000000000000'); // 1.10e18 = 110% MCR
export const NUM_HINT_TRIALS = 15;
