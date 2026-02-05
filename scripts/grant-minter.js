const hre = require("hardhat");

async function main() {
  const EX_ADDRESS = "0xB567431a2719a25E40F49B5a9E478E54C0944Afc";
  const MASTERCHEF_ADDRESS = "0xF4D096b7E06DCff1745Ea202B18105D2B2674085";

  // Kita gunakan getContractAt dengan interface minimal yang mungkin ada
  const EX = await hre.ethers.getContractAt([
    "function owner() view returns (address)",
    "function transferOwnership(address newOwner) public",
    "function addMinter(address _minter) public",
    "function mint(address to, uint256 amount) public"
  ], EX_ADDRESS);

  console.log("Checking EX Contract...");

  try {
    console.log("Trying to transfer ownership to MasterChef...");
    const tx = await EX.transferOwnership(MASTERCHEF_ADDRESS);
    await tx.wait();
    console.log("Success via transferOwnership!");
  } catch (err) {
    console.log("transferOwnership failed, trying addMinter...");
    try {
      const tx2 = await EX.addMinter(MASTERCHEF_ADDRESS);
      await tx2.wait();
      console.log("Success via addMinter!");
    } catch (err2) {
      console.error("All attempts failed. Please check EXCoin.sol for the minting permission function.");
    }
  }
}

main().catch(console.error);