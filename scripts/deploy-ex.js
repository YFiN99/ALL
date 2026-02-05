const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("================================================");
  console.log("Deploying EX Coin (21M Supply)...");
  console.log("Deployer:", deployer.address);
  console.log("================================================");

  const EX = await ethers.getContractFactory("EXCoin");
  const ex = await EX.deploy();
  await ex.waitForDeployment();

  const tokenAddress = await ex.getAddress();
  console.log("✅ EX Coin Deployed ke:", tokenAddress);
  console.log("Total Supply: 21,000,000 EX");
  console.log("================================================");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});