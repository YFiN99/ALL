require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { PRIVATE_KEY, FEE_SETTER_ADDRESS } = process.env;

module.exports = {
  solidity: {
    compilers: [
      { version: "0.5.16" }, // Factory & Pair
      { version: "0.6.6" },  // Router
      { version: "0.6.12" }, // <--- TAMBAHKAN INI UNTUK MULTICALL
      { 
        version: "0.8.20",   // EX Coin
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
    ],
  },
  networks: {
    celes: {
      url: "https://rpc-testnet.celeschain.xyz/",
      chainId: 22225,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  defaultNetwork: "celes",
  // Masukkan Fee Setter ke config sebagai referensi jika dibutuhkan script lain
  feeSetter: FEE_SETTER_ADDRESS, 
};