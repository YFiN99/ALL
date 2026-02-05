const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const FACTORY_ADDRESS = "0x7f1999E6E7f3A4EEf08b11bB591d0659DBd30e85"; 
  const WCLES_ADDRESS = "0xcfc4Fa68042509a239fA33f7A559860C875dCA70"; 

  console.log("================================================");
  console.log("Deploying Router ke CelesChain...");
  console.log("Deployer:", deployer.address);
  console.log("================================================");

  const Router = await ethers.getContractFactory("UniswapV2Router02");
  const router = await Router.deploy(FACTORY_ADDRESS, WCLES_ADDRESS);
  await router.waitForDeployment();
  
  console.log("✅ Router deployed ke:", await router.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});