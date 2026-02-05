const { ethers } = require("hardhat");

async function main() {
  // Ambil artifact dari Pair yang baru saja di-compile
  const Pair = await ethers.getContractFactory("UniswapV2Pair");
  const initCodeHash = ethers.keccak256(Pair.bytecode);
  
  console.log("\n==============================================");
  console.log("INIT_CODE_HASH ASLI ANDA:");
  console.log(initCodeHash);
  console.log("==============================================\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});