const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Starting Mezo Mainnet Deployment...");
  console.log("   Deployer:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("   Balance:", ethers.formatUnits(balance, 18), "BTC\n");

  const MUSD_ADDRESS = "0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186";
  console.log("   MUSD Address (Mainnet):", MUSD_ADDRESS);

  // 1. Deploy Tipping
  console.log("\n📦 Deploying Tipping contract...");
  const Tipping = await ethers.getContractFactory("Tipping");
  const tipping = await Tipping.deploy(MUSD_ADDRESS);
  await tipping.waitForDeployment();
  const tippingAddress = await tipping.getAddress();
  console.log("   ✅ Tipping deployed to:", tippingAddress);

  // 2. Deploy SubscriptionV2
  console.log("\n📦 Deploying SubscriptionV2 contract...");
  const Subscription = await ethers.getContractFactory("SubscriptionV2");
  const subscription = await Subscription.deploy(MUSD_ADDRESS);
  await subscription.waitForDeployment();
  const subscriptionAddress = await subscription.getAddress();
  console.log("   ✅ SubscriptionV2 deployed to:", subscriptionAddress);

  const deployInfo = {
    network: "mezo-mainnet",
    chainId: 31612,
    musd: MUSD_ADDRESS,
    contracts: {
      Tipping: tippingAddress,
      SubscriptionV2: subscriptionAddress
    },
    deployedAt: new Date().toISOString()
  };

  const outPath = path.join(__dirname, "deployment_mainnet.json");
  fs.writeFileSync(outPath, JSON.stringify(deployInfo, null, 2));
  console.log("\n💾 Deployment info saved to contracts/scripts/deployment_mainnet.json");

  console.log("\n📋 Add these to your web/.env.local:");
  console.log(`   NEXT_PUBLIC_MAINNET_TIPPING_CONTRACT=${tippingAddress}`);
  console.log(`   NEXT_PUBLIC_MAINNET_SUBSCRIPTION_CONTRACT=${subscriptionAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Deployment failed:", err);
    process.exit(1);
  });
