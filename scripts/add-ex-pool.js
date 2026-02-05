// scripts/add-ex-pool.js
const hre = require("hardhat");

async function main() {
  const chefAddress = "0x793738CD083fe56b655DAF38371B930a6c234609";
  const exTokenAddress = "0xB567431a2719a25E40F49B5a9E478E54C0944Afc"; 

  const chef = await hre.ethers.getContractAt("MasterChefEX", chefAddress);
  
  console.log("Adding EX Token Pool...");
  // 1000 = alokasi point, true = update pools
  const tx = await chef.add(1000, exTokenAddress, true);
  await tx.wait();
  
  console.log("EX Pool added! Users can now stake EX directly.");
}

main().catch(console.error);