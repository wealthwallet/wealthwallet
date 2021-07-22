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
This tutorial uses [Truffle](https://www.trufflesuite.com/docs/truffle/overview) for simplicity and assumes you have your ethereum wallet connected to interact with the smart contract.

To install Truffle:
```
$ npm install -g truffle
```

<br>

To get started, install the wealthwallet node package to have access to the contracts
```
$ npm i @wealthwallet/core
```

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
const factoryAddress = "0x24b2e6065fD465501f4b52f13B8B0BcA544B22fC"; // mainnet address

//create wealthwalletfactory instance
const wealthWalletFactory = await WealthWalletFactory.at(factoryAddress);

//create wealthwallet
await wealthWalletFactory.createWealthWallet();

//get wealthwallet
const wealthWalletAddress = await wealthWalletFactory.getWealthWallet();
```

First, we create an instance of WealthWalletFactory at the address it's deployed on.

Next, we create a wealthwallet using the factory's `createWealthWallet()` method. Whenever you create a wealthwallet, only the ethereum wallet you used to create it will have access to it.

Finally, we retrieve the address of the wealthwallet we just created using `getWealthWallet()` method.

Congratulations, you have just create a wealthwallet using WealthWalletFactory and retrieved the address of that wealthwallet. Next, we will interaction with the wealthwallet we have just created.

## WealthWallet
Wealthwallets are used to create and keep track of your portfolios.

```javascript
//create wealthwallet instance
const wealthWallet = await WealthWallet.at(wealthWalletAddress);

//get current portfolio index aka total portfolios
const portfolioIndex = await wealthWallet.getTotalPortfolios(); //equals 0

// define portfolio name
const portfolioName = "Portfolio 1";

//create Portfolio
await wealthWallet.createPortfolio(portfolioName);

//get portfolio address
const portfolioAddress = await wealthWallet.getPortfolio(portfolioIndex);
```

First, we create an instance of the wealthwallet we just created.

Next, we create a portfolio using `createPortfolio` method and giving it a name.

Finally, we retrieve the address of that portfolio using `getPortfolio` method and giving it the portfolio index.
0 = First portfolio
1 = Second portfolio
...

You have just created a portfolio and retrieved at address of that portfolio using your wealthwallet! Next we will customize the portfolio.

## Portfolio
Portfolios are where you choose the assets you want to invest in and their respective ratios. You can deposit, rebalance and withdraw from your portfolio at anytime.
```javascript
//create portfolio instance
const portfolio = await Portfolio.at(portfolioAddress);

//define configuration settings
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

First, we create an instance of the portfolio using the address we were given.

Then, we configure the settings that we want the portfolio to be made of using the `configure()` method.
### `configure(slippage, swapTimeLimit, uniswapRouterAddress, wethAddress)`
`slippage`: This is amount a price can move between when a swap is submitted and when it is executed, this is measured in basis points out of 10,000, see [Uniswap's glossary](https://uniswap.org/docs/v2/protocol-overview/glossary/#slippage).  
<br>
`swapTimeLimit`: This is a swap's deadline, the maximum amount of time a swap has to execute a trade from when it's submitted.
<br>
<br>
`uniswapRouterAddress`: Input Uniswap's Router address to be able to swap tokens on Uniswap. See [Uniswap's Router02](https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02).
<br>
<br>
`wethAddress`: This is wrapped ether's address. We input this address to buy wrapped ether directly, without having to use a market maker.
<br>
<br>

Next, we add the assets we want to make up the portfolio using `addAsset()` method. 
### `addAsset(name, symbol, address, ratio)`
`name`: This is the name of the asset 
<br>
<br>
`symbol`: This is the symbol of the asset
<br>
<br>
`address`: This is the asset's token address
<br>
<br>
`ratio`: This is the percentage you want the asset to make up of your portfolio. This is measured in basis points out of 10,000. Remember to make sure your assets always add up to 100% of your portfolio. 
<br>
<br>
You have just configure your portfolio and added 2 assets. In this example, your portfolio is 50% WBTC and 50% WETH.

## Fund
Whenever you fund your portfolio, wealthwallet will automatically distribute your funds to your chosen assets with their respective ratios.
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
### Console
```
BEFORE FUNDING

--------------- Asset Details ----------------
Name:  Wrapped BTC
Symbol:  WBTC
Address:  0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599
Ratio:  5000
Amount:  0
--------------- Asset Details ----------------
Name:  Wrapped Ether
Symbol:  WETH
Address:  0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
Ratio:  5000
Amount:  0


AFTER FUNDING

--------------- Asset Details ----------------
Name:  Wrapped BTC
Symbol:  WBTC
Address:  0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599
Ratio:  5000
Amount:  3056095
--------------- Asset Details ----------------
Name:  Wrapped Ether
Symbol:  WETH
Address:  0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
Ratio:  5000
Amount:  500000000000000000
```
First, we get the total number of assets using the `getTotalAssets()` method, then loop through those assets and get their information using the `getAssetDetails()` method.

Next, we fund the portfolio by calling the `deposit()` method and sending the amount of wei we want to deposit. You can also fund your portfolio by simply sending funds to the portfolio address.

Finally, we loop through the assets again to see how they've change. As you can see, 50% of the funds sent was swapped for WBTC and the other 50% was swapped for WETH. 

## Rebalance
Let's say you want to modify your portfolio's structure or are simply overdue for rebalancing, wealthwallet makes rebalancing simple.
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
### Console
```
BEFORE REBALANCE

--------------- Asset Details ----------------
Name:  Wrapped BTC
Symbol:  WBTC
Address:  0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599
Ratio:  5000
Amount:  3056095
--------------- Asset Details ----------------
Name:  Wrapped Ether
Symbol:  WETH
Address:  0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
Ratio:  5000
Amount:  500000000000000000


AFTER REBALANCE

--------------- Asset Details ----------------
Name:  Wrapped BTC
Symbol:  WBTC
Address:  0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599
Ratio:  2500
Amount:  1523482
--------------- Asset Details ----------------
Name:  Wrapped Ether
Symbol:  WETH
Address:  0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
Ratio:  7500
Amount:  747753291186141747
```

We loop through the assets and get their information using `getAssetDetails()`.

Then, we change the asset's ratio using the `changeAssetRatio()` method. In this example, we're changing WBTC(0) to 25% and WETH(1) to 75% of the portfolio.

Next, we rebalancing the portfolio using the `rebalance()` method. This method liquifies all the assets to ETH and then reswaps them at their respective ratios. 

Finally, we loop through the assets to get their info and see how they've changed. As you can see, the asset's ratios were updated and using `rebalance()`, their amount was changed to match that ratio. It works like magic!

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

### Console
```
BEFORE WITHDRAWAL

--------------- Asset Details ----------------
Name:  Wrapped BTC
Symbol:  WBTC
Address:  0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599
Ratio:  2500
Amount:  1523482
--------------- Asset Details ----------------
Name:  Wrapped Ether
Symbol:  WETH
Address:  0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
Ratio:  7500
Amount:  747753291186141747


AFTER WITHDRAWAL

--------------- Asset Details ----------------
Name:  Wrapped BTC
Symbol:  WBTC
Address:  0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599
Ratio:  2500
Amount:  0
--------------- Asset Details ----------------
Name:  Wrapped Ether
Symbol:  WETH
Address:  0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
Ratio:  7500
Amount:  0
```

We get the asset's details using `getAssetDetails()`.

Then, we withdraw all of our fund back to our ethereum wallet using the `withdrawAll()` method. You also have the option of using `withdraw(withdrawAmount)` to withdraw a specific amount. These methods liquify your assets into ETH, then withdraws the amount requested to your wallet, then reswaps the remaining funds, if any, back to the portfolio's chosen assets.

We get the asset's details and notice that all of the tokens were successfully withdrawn from the portfolio back to your ethereum wallet.
