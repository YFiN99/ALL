const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("====================================================");
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Ethers v6: Mengambil saldo dan memformatnya
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  
  // Di Ethers v6, formatEther ada di hre.ethers, bukan hre.ethers.utils
  console.log("Account balance:", hre.ethers.formatEther(balance), "CLES");
  console.log("====================================================");

  const exTokenAddress = "0xB567431a2719a25E40F49B5a9E478E54C0944Afc";
  const exPerBlock = hre.ethers.parseEther("40"); // Ethers v6: langsung parseEther
  const startBlock = await hre.ethers.provider.getBlockNumber();
  
  console.log("Deploying MasterChefEX...");
  const MasterChef = await hre.ethers.getContractFactory("MasterChefEX");
  const masterChef = await MasterChef.deploy(
    exTokenAddress,
    exPerBlock,
    startBlock
  );

  // Ethers v6: menggunakan waitForDeployment() bukan deployed()
  await masterChef.waitForDeployment();
  const masterChefAddress = await masterChef.getAddress();
  console.log("MasterChefEX deployed to:", masterChefAddress);

  console.log("Deploying Multicall...");
  const Multicall = await hre.ethers.getContractFactory("Multicall");
  const multicall = await Multicall.deploy();
  await multicall.waitForDeployment();
  const multicallAddress = await multicall.getAddress();
  console.log("Multicall deployed to:", multicallAddress);

  console.log("====================================================");
  console.log("DEPLOYMENT SUCCESS");
  console.log("MasterChef:", masterChefAddress);
  console.log("Multicall:", multicallAddress);
  console.log("====================================================");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});