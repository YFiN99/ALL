// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EXCoin is ERC20 {
    constructor() ERC20("EX Coin", "EX") {
        // Mint 21 Juta token ke dompet pengirim (21.000.000 * 10^18)
        _mint(msg.sender, 21000000 * 10 ** decimals());
    }
}