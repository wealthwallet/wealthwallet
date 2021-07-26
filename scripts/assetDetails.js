const WealthWalletFactory = artifacts.require("@wealthwallet/core/contracts/WealthWalletFactory.sol");
const WealthWallet = artifacts.require("@wealthwallet/core/contracts/WealthWallet.sol");
const Portfolio = artifacts.require("@wealthwallet/core/contracts/Portfolio.sol");

module.exports = async function(callback) {
    //define mainnet factory address
    const mainnetFactoryAddress = "0x6d439dBA58e8642746c155fe902B1833892F2504";

    // create wealth wallet factory
    const wealthWalletFactory = await WealthWalletFactory.at(mainnetFactoryAddress);

    const wealthWalletAddress = await wealthWalletFactory.getWealthWallet();

    var wealthWallet = await WealthWallet.at(wealthWalletAddress);

    //define which portfolio to get details
    const portfolioIndex = 0;

    //get portfolio address
    const portfolioAddress = await wealthWallet.getPortfolio(portfolioIndex);

    console.log(portfolioAddress);

    // create portfolio instance
    const portfolio = await Portfolio.at(portfolioAddress);

    //get total assets
    const totalAssets = (await portfolio.getTotalAssets()).toNumber();

    //loop through all assets 
    for (let i=0; i<totalAssets; i++) {
        //get asset details
        let asset = await portfolio.getAssetDetails(i);
        console.log("--------------- Asset Details ----------------");

        console.log("Name: ", asset[0]);
        console.log("Symbol: ", asset[1]);
        console.log("Address: ", asset[2]);
        console.log("Ratio: ", asset[3].toString());
        console.log("Amount: ", asset[4].toString());

    }
}
