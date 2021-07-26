const WealthWalletFactory = artifacts.require("@wealthwallet/core/contracts/WealthWalletFactory.sol");
const WealthWallet = artifacts.require("@wealthwallet/core/contracts/WealthWallet.sol");
const Portfolio = artifacts.require("@wealthwallet/core/contracts/Portfolio.sol");

module.exports = async function(callback) {
    // define mainnet factory address
    const mainnetFactoryAddress = "0x6d439dBA58e8642746c155fe902B1833892F2504";

    // create wealth wallet factory instance
    const wealthWalletFactory = await WealthWalletFactory.at(mainnetFactoryAddress);

    // create wealth wallet
    await wealthWalletFactory.createWealthWallet();

    //get wealthwallet address 
    const wealthWalletAddress = await wealthWalletFactory.getWealthWallet();

    //create wealth wallet instance
    const wealthWallet = await WealthWallet.at(wealthWalletAddress);

    // define portfolio name
    const portfolioName = "Main";

    //get total portfolios
    const totalPortfolios = await wealthWallet.getTotalPortfolios();

    //create Portfolio
    await wealthWallet.createPortfolio(portfolioName);

    //get portfolio address
    const portfolioAddress = await wealthWallet.getPortfolio(totalPortfolios);

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

    //set configurations
    const slippage = 50; //basis points out of 10,000 (0.5% slippage)
    const swapTimeLimit = 600; //time limit in seconds (10 minutes)
    const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";


    //configure portfolio
    await portfolio.configure(slippage, swapTimeLimit, uniswapRouterAddress, wethAddress);

    //define assets
    assets = [
        {
            name: "Wrapped BTC",
            symbol: "WBTC",
            address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
            ratio: 1667
        },
        {
            name: "Wrapped Ether",
            symbol: "WETH",
            address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            ratio: 1667
        },
        {
            name: "AxieInfinityShard",
            symbol: "AXS",
            address: "0xF5D669627376EBd411E34b98F19C868c8ABA5ADA",
            ratio: 1667
        },
        {
            name: "Uniswap",
            symbol: "UNI",
            address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
            ratio: 1667
        },
        {
            name: "UnisocksEdition0",
            symbol: "SOCKS",
            address: "0x23B608675a2B2fB1890d3ABBd85c5775c51691d5",
            ratio: 1666
        },
        {
            name: "SushiToken",
            symbol: "SUSHI",
            address: "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2",
            ratio: 1666
        }
    ];


    //loop through all assets
    for (let i=0; i<assets.length; i++){
        // add asset
        await portfolio.addAsset(assets[i].name, assets[i].symbol, assets[i].address, assets[i].ratio);
    }

    //define funding amount
    amountIn = 0;

    // fund portfolio
    response = await portfolio.deposit({value: amountIn});


    return "";

}
