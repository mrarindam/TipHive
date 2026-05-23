const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying SubscriptionV2 contract...");
  console.log("   Deployer:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("   Balance:", ethers.formatEther(balance), "ETH\n");

  const MUSD_ADDRESS = process.env.NEXT_PUBLIC_MUSD_ADDRESS || "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503";
  console.log("   MUSD Address:", MUSD_ADDRESS);

  const Subscription = await ethers.getContractFactory("SubscriptionV2");
  const subscription = await Subscription.deploy(MUSD_ADDRESS);

  await subscription.waitForDeployment();
  const contractAddress = await subscription.getAddress();

  console.log("\n✅ SubscriptionV2 contract deployed!");
  console.log("   Address:", contractAddress);
  console.log("   Network: Mezo Testnet (chainId 31611)");
  console.log("\n🔗 View on MezoScan:");
  console.log(`   https://testnet.mezoscan.io/address/${contractAddress}`);

  const deployInfo = {
    network:     "mezo-testnet",
    chainId:     31611,
    contract:    "SubscriptionV2",
    address:     contractAddress,
    musd:        MUSD_ADDRESS,
    deployedAt:  new Date().toISOString(),
  };

  const outPath = path.join(__dirname, "deployment.json");
  fs.writeFileSync(outPath, JSON.stringify(deployInfo, null, 2));
  console.log("\n💾 Deployment info saved to contracts/scripts/deployment.json");

  console.log("\n📋 Add this to your web/.env.local:");
  console.log(`   NEXT_PUBLIC_SUBSCRIPTION_CONTRACT=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Deployment failed:", err);
    process.exit(1);
  });
