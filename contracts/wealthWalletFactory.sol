// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import 'contracts/wealthWallet.sol';

contract WealthWalletFactory {
    mapping(address => WealthWallet) public wealthWallets;

    function createWealthWallet() external {
        require(address(wealthWallets[msg.sender]) == address(0), "Wealthwallet already exists");

        //create wealth wallet
        WealthWallet wealthWallet = new WealthWallet(msg.sender);

        //map wealth wallet to sender
        wealthWallets[msg.sender] = wealthWallet;
    }

    function getWealthWallet() external view returns (address) {
        return address(wealthWallets[msg.sender]);
    }
    
}