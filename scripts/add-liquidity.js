const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const EX_ADDRESS = "0xB567431a2719a25E40F49B5a9E478E54C0944Afc";
  const ROUTER_ADDRESS = "0xc48891E4E525D4c32b0B06c5fe77Efe7743939FD";

  const exToken = await ethers.getContractAt("EXCoin", EX_ADDRESS);
  const router = await ethers.getContractAt("UniswapV2Router02", ROUTER_ADDRESS);

  const amountToken = ethers.parseEther("1000000"); // 1 Juta EX
  const amountETH = ethers.parseEther("0.00012");   // 0.00012 Celes

  console.log("1. Memberi Izin (Approve) Router...");
  const approveTx = await exToken.approve(ROUTER_ADDRESS, amountToken);
  await approveTx.wait();
  console.log("✅ Approved!");

  console.log("\n2. Menambahkan Likuiditas (EX + CELES)...");
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

  const addLiquidityTx = await router.addLiquidityETH(
    EX_ADDRESS,
    amountToken,
    0, 
    0, 
    deployer.address,
    deadline,
    { value: amountETH }
  );

  await addLiquidityTx.wait();
  console.log("✅ LIKUIDITAS BERHASIL DITAMBAHKAN!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});