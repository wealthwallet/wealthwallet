# Wealthwallet
Wealthwallet is a smart contract built on Ethereum powered by Uniswap that allows you to make unlimited portfolios easily

[Follow us on Twitter](https://twitter.com/getwealthwallet)

<br>

Wealthwallet smart contract is deployed on mainnet and ropsten.
|**Network** | **Address**
|------------|------------
|MainNet     | [](https://etherscan.io/address/)
|Ropsten     | [0x24b2e6065fD465501f4b52f13B8B0BcA544B22fC](https://ropsten.etherscan.io/address/0x24b2e6065fD465501f4b52f13B8B0BcA544B22fC)

## Features
+ Wealthwallet allows you to make custom portfolios with any Uniswap asset.
+ You can choose the ratio in which the assets make up your portfolio.
+ Whenever you fund your portfolio, Wealthwallet will automatically distribute your funds to your chosen assets.
+ You can rebalance your portfolio(redistribute your assets to their respective ratios) at anytime.
+ It is completely free to use, there are no fees associated with Wealthwallet.

## Getting Started
To get started, install the wealthwallet node package to have access to the contracts
```
$ npm i @wealthwallet/core
```

<br>

This tutorial uses [Truffle](https://www.trufflesuite.com/docs/truffle/overview) for simplicity and assumes you have your ethereum wallet connected to interact with the smart contract.

<br>

First, we import the smart contracts from the wealthwallet node package.
```javascript
const WealthWalletFactory = artifacts.require("@wealthwallet/core/contracts/WealthWalletFactory.sol");
const WealthWallet = artifacts.require("@wealthwallet/core/contracts/WealthWallet.sol");
const Portfolio = artifacts.require("@wealthwallet/core/contracts/Portfolio.sol");
```

## WealthWalletFactory
The WealthWalletFactory is used to create wealthwallets. It also keeps track of which ethereum wallets created a wealthwallet.

```javascript
//define factory address
const factoryAddress = "0x24b2e6065fD465501f4b52f13B8B0BcA544B22fC";

//create wealthwalletfactory instance
const wealthWalletFactory = await WealthWalletFactory.at(factoryAddress);

//create wealthwallet
await wealthWalletFactory.createWealthWallet();

//get wealthwallet
const wealthWalletAddress = await wealthWalletFactory.getWealthWallet();
```

First, we create an instance of WealthWalletFactory at the address it's deployed on. In this case, we'll be using the mainnet address.

Next, we create a wealthwallet using the factory's `createWealthWallet()` method. Whenever you create a wealthwallet, only the ethereum wallet you used to create it will have access to it.

Finally, we retrieve the address of the wealthwallet we just created using `getWealthWallet()` method. This method uses the ethereum wallet address calling it and returns the address of the wealthwallet create by the ethereum wallet.

## WealthWallet
```javascript
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
```

## Portfolio
```javascript
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
```

## Fund
```javascript
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
```
## Rebalance
```javascript
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
```

## Withdraw
```javascript
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
```
