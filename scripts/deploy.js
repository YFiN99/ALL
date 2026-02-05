const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  const feeSetter = process.env.FEE_SETTER_ADDRESS;

  console.log("================================================");
  console.log("Memulai Deployment di CelesChain...");
  console.log("Deployer:", deployer.address);
  console.log("Fee Setter:", feeSetter);
  console.log("================================================");

  // 1. Deploy Factory
  console.log("\n1. Deploying UniswapV2Factory...");
  const Factory = await ethers.getContractFactory("UniswapV2Factory");
  const factory = await Factory.deploy(feeSetter);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ Factory deployed ke:", factoryAddress);

  // 2. Ambil WETH/WETH-equivalent (Opsional, tapi Router butuh)
  // Untuk CelesChain, kita asumsikan kamu butuh alamat WETH. 
  // Jika belum ada, kita bisa ganti dengan address dummy atau deploy WETH sendiri.
  const WETH_ADDRESS = "0x0000000000000000000000000000000000000000"; // GANTI JIKA ADA WETH TESTNET

  // 3. Deploy Router
  console.log("\n2. Deploying UniswapV2Router02...");
  const Router = await ethers.getContractFactory("UniswapV2Router02");
  const router = await Router.deploy(factoryAddress, WETH_ADDRESS);
  await router.waitForDeployment();
  console.log("✅ Router deployed ke:", await router.getAddress());

  console.log("\n================================================");
  console.log("DEPLOYMENT SELESAI");
  console.log("Simpan alamat Factory & Router ini!");
  console.log("================================================");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});