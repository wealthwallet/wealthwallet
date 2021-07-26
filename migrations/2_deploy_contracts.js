const WealthWalletFactory = artifacts.require("@wealthwallet/core/contracts/WealthWalletFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(WealthWalletFactory);
};
