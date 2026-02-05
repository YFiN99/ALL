const hre = require("hardhat");

async function main() {
  console.log("Memulai deploy Multicall ke CelesChain...");

  const Multicall = await hre.ethers.getContractFactory("Multicall");
  const multicall = await Multicall.deploy();

  // GANTI BARIS INI:
  await multicall.waitForDeployment(); 

  // DAN GANTI CARA AMBIL ADDRESS MENJADI:
  const address = await multicall.getAddress();

  console.log("--- DEPLOY BERHASIL ---");
  console.log("Address Multicall:", address);
  console.log("Chain ID: 22225");
  console.log("-----------------------");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});