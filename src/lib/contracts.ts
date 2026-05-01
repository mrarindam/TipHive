export const MUSD_ADDRESS = process.env.NEXT_PUBLIC_MUSD_ADDRESS as `0x${string}`;
export const BTC_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_BTC_TOKEN_ADDRESS || '0x7b7C000000000000000000000000000000000000') as `0x${string}`;
export const MEZO_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_MEZO_TOKEN_ADDRESS || '0x7B7c000000000000000000000000000000000001') as `0x${string}`;
export const TIPPING_CONTRACT = process.env.NEXT_PUBLIC_TIPPING_CONTRACT as `0x${string}`;
export const SUBSCRIPTION_CONTRACT = process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTRACT as `0x${string}`;

export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", "type": "address" },
      { name: "amount", "type": "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", "type": "address" },
      { name: "spender", "type": "address" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  }
] as const;

export const TIPPING_ABI = [
  {
    name: "tip",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_creator", "type": "address" },
      { name: "_amount", "type": "uint256" }
    ],
    outputs: []
  },
  {
    name: "getCreatorBalance",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_creator", "type": "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_amount", "type": "uint256" }],
    outputs: []
  }
] as const;

export const SUBSCRIPTION_ABI = [
  {
    "name": "createPlan",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "_name", "type": "string" },
      { "name": "_price", "type": "uint256" },
      { "name": "_duration", "type": "uint256" }
    ],
    "outputs": []
  },
  {
    "name": "subscribe",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [{ "name": "_planId", "type": "uint256" }],
    "outputs": [{ "name": "subId", "type": "bytes32" }]
  },
  {
    "name": "renewSubscription",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [{ "name": "_planId", "type": "uint256" }],
    "outputs": []
  },
  {
    "name": "cancelSubscription",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [{ "name": "_planId", "type": "uint256" }],
    "outputs": []
  },
  {
    "name": "isUserSubscribed",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "_subscriber", "type": "address" },
      { "name": "_planId", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }]
  },
  {
    "name": "getCreatorPlans",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{ "name": "_creator", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256[]" }]
  },
  {
    "name": "plans",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{ "name": "", "type": "uint256" }],
    "outputs": [
      { "name": "id", "type": "uint256" },
      { "name": "creator", "type": "address" },
      { "name": "name", "type": "string" },
      { "name": "price", "type": "uint256" },
      { "name": "duration", "type": "uint256" },
      { "name": "active", "type": "bool" },
      { "name": "createdAt", "type": "uint256" }
    ]
  },
  {
    "name": "planCounter",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "name": "updatePlan",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "_planId", "type": "uint256" },
      { "name": "_name", "type": "string" },
      { "name": "_price", "type": "uint256" },
      { "name": "_active", "type": "bool" }
    ],
    "outputs": []
  },
  {
    "name": "getCreatorEarnings",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{ "name": "_creator", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "name": "withdrawEarnings",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [{ "name": "_amount", "type": "uint256" }],
    "outputs": []
  }
];
