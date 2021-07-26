const WealthWalletFactory = artifacts.require("@wealthwallet/core/contracts/WealthWalletFactory.sol");
const WealthWallet = artifacts.require("@wealthwallet/core/contracts/WealthWallet.sol");
const Portfolio = artifacts.require("@wealthwallet/core/contracts/Portfolio.sol");

contract(WealthWalletFactory, (accounts) => {

    it("starter", async () => {
        // WEALTHWALLETFACTORY

        //create wealthwallet factory instance
        const wealthWalletFactory = await WealthWalletFactory.deployed();

        //create wealthwallet
        await wealthWalletFactory.createWealthWallet();

        //get wealthwallet
        const wealthWalletAddress = await wealthWalletFactory.getWealthWallet();


        // WEALTHWALLET

        //create wealthwallet instance
        const wealthWallet = await WealthWallet.at(wealthWalletAddress);

        //get total portfolios aka current portfolio index
        const portfolioIndex = await wealthWallet.getTotalPortfolios(); //equals 0

        // define portfolio name
        const portfolioName = "Portfolio 1";

        //create Portfolio
        await wealthWallet.createPortfolio(portfolioName);

        //get portfolio address
        const portfolioAddress = await wealthWallet.getPortfolio(portfolioIndex);
        
        // PORTFOLIO

        //create portfolio instance
        const portfolio = await Portfolio.at(portfolioAddress);

        //set configurations settings
        const slippage = 5000; //basis points out of 10,000 (0.5% slippage)
        const swapTimeLimit = 600; //time limit in seconds (10 minutes)
        const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
        const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";


        //configure portfolio
        await portfolio.configure(slippage, swapTimeLimit, uniswapRouterAddress, wethAddress);

        assets = [
            {
                name: "Wrapped BTC",
                symbol: "WBTC",
                address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
                ratio: 5000
            },
            {
                name: "Wrapped Ether",
                symbol: "WETH",
                address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                ratio: 5000
            }
        ];

        //loop through all assets
        for (let i=0; i<assets.length; i++){
            // add asset
            await portfolio.addAsset(assets[i].name, assets[i].symbol, assets[i].address, assets[i].ratio);
        }

        // FUND

        console.log("BEFORE FUNDING\n");

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

        // set funding amount
        const fundingAmount = web3.utils.toWei('1', 'ether');

        // fund portfolio
        await portfolio.deposit({value: fundingAmount});

        console.log("\n\nAFTER FUNDING\n");

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

        // REBALANCE
        console.log("\n\nBEFORE REBALANCE\n");

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

        //change asset ratio

        //set first asset to 25% of portfolio
        await portfolio.changeAssetRatio(0, 2500);

        //set second asset to 75% of portfolio
        await portfolio.changeAssetRatio(1, 7500);

        //rebalance
        await portfolio.rebalance();

        console.log("\n\nAFTER REBALANCE\n");

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


        // WITHDRAW

        console.log("\n\nBEFORE WITHDRAWAL\n");

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

        //withdraw all from portfolio
        await portfolio.withdrawAll();

        // or withdraw specific amount

        //const withdrawAmount = web3.utils.toWei('0.5', 'ether');
        //await portfolio.withdraw(withdrawAmount);

        console.log("\n\nAFTER WITHDRAWAL\n");

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
    });

});
