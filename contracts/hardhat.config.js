require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "../.env.local" });

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    "mezo-testnet": {
      url: "https://rpc.test.mezo.org",
      chainId: 31611,
      accounts: [PRIVATE_KEY],
      gasPrice: 1000000000, // 1 gwei — legacy tx
    },
    "mezo-mainnet": {
      url: "https://rpc-http.mezo.boar.network",
      chainId: 31612,
      accounts: [PRIVATE_KEY],
    },
    hardhat: {
      chainId: 31337,
    },
  },
  paths: {
    sources:   "./contracts", // .sol files live in contracts/contracts/
    tests:     "./test",
    cache:     "./cache",
    artifacts: "./artifacts",
  },
};
