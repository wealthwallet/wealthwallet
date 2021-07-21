pragma solidity ^0.7.6;

import 'contracts/interfaces/IUniswapV2Router.sol';
import 'contracts/interfaces/IUniswapV2Pair.sol';
import 'contracts/interfaces/IWETH.sol';

contract Portfolio {
    //info
    address public owner;
    string public name;
    uint public assetIndex;
    mapping(uint => Asset) public assets;
    Config config;

    //states
    bool configured;
    bool rulesSet;
    bool started;
    bool running;
    bool rebalancing;

    //interfaces
    IUniswapV2Router iUniswapRouter;
    IWETH iWeth;

    //asset structure
    struct Asset {
        string name;
        string symbol;
        address tokenAddress;
        uint ratio;
        uint amount;
    }

    //configuration structure
    struct Config {
        uint slippage; // basis points out of 10,000 
        uint swapTimeLimit; // time limit until swap expires in seconds
        address uniswapRouterAddress;
        address wethAddress;
    }
    
    constructor(address _owner, string memory _name) public {
        //set main info
        owner = _owner;
        name = _name;
        assetIndex = 0;

        //set states
        configured = false;
        rulesSet = false;
        started= false;
        running = false;
        rebalancing = false;

    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    function addAsset(string memory _name, string memory _symbol, address _address, uint _ratio) onlyOwner public {
        //create Asset
        Asset memory asset = Asset(_name, _symbol, _address, _ratio, 0);

        //map asset
        assets[assetIndex] = asset;
        assetIndex++;
    }
    
    function changeAssetRatio(uint _assetIndex, uint _assetRatio) onlyOwner public {
        assets[_assetIndex].ratio = _assetRatio;
    }

    function spreadToAssets() internal {
        //spread contract balance to assets
        uint totalAmount = address(this).balance;
        uint currentAmount = totalAmount;

        //for every asset
        for (uint i=0; i<assetIndex; i++) {
            //if current amount is empty
            if (currentAmount == 0) {
                break;
            }

            //get asset and ratio
            Asset memory asset = assets[i];
            uint assetRatio = asset.ratio;

            if (assetRatio == 0) {
                break;
            }
            
            //calculate amountPerAsset
            uint amountPerAsset = totalAmount * assetRatio / 10000;
            
            //if current amount is more than amount to asset
            if (amountPerAsset <= currentAmount) {
                //buy asset for amount
                buyAsset(i, amountPerAsset);

                //adjust current amount
                if (amountPerAsset == currentAmount) {
                    currentAmount = 0;
                }
                else {
                    currentAmount -= amountPerAsset;
                }
            }
            else {
                //buy remaining current amount and set to 0
                buyAsset(i, currentAmount);
                currentAmount = 0;
            }
        }
        
    }

    function buyAsset(uint currentIndex, uint amountIn) internal {
        //set asset data
        Asset memory asset = assets[currentIndex];
        address buyingAddress = asset.tokenAddress;
        address wethAddress = config.wethAddress;

        require(amountIn <= address(this).balance, "Can't send more than current balance");

        if (buyingAddress == wethAddress) {
            //deposit to Wrapped WETH
            iWeth.deposit{value: amountIn}();
        }
        else {
            //get swap config
            uint slippage = config.slippage;
            uint swapTimeLimit = config.swapTimeLimit;

            //set path
            address[] memory path = new address[](2);
            path[0] = wethAddress;
            path[1] = buyingAddress;

            //get amounts out
            uint[] memory amountsOut = iUniswapRouter.getAmountsOut(amountIn, path);
            uint tokenOutput = amountsOut[1];

            //calculate slippage
            uint amountOutMin =  tokenOutput * (10000 - slippage) / 10000;
            
            //set deadline
            uint deadline = block.timestamp + swapTimeLimit;

            //swap Eth for tokens and set return amounts
            uint[] memory amounts = iUniswapRouter.swapExactETHForTokens{value: amountIn}(amountOutMin, path, address(this), deadline);
        }

        //update balance
        updateAssetBalance(currentIndex);
    }

    function updateAssetBalance(uint currentIndex) internal {
        Asset memory asset = assets[currentIndex];

        //set balance
        uint balance;

        //set Weth address
        address wethAddress = config.wethAddress;

        if (asset.tokenAddress == wethAddress) {
            //get balance
            balance = iWeth.balanceOf(address(this));
        }
        else {
            //create pair instance
            IUniswapV2Pair pair = IUniswapV2Pair(asset.tokenAddress);

            //get balance
            balance = pair.balanceOf(address(this));
        }

        //update balance
        assets[currentIndex].amount = balance;
    }

    function rebalance() onlyOwner public {
        //set rebalancing true 
        rebalancing = true;

        //empty assets
        emptyAssets();

        //spread to assets
        spreadToAssets();    

        //set rebalancing back to false
        rebalancing = false;  
    }

    function emptyAssets() onlyOwner internal {
        //for every asset
        for (uint i=0; i<assetIndex; i++) {
            //get asset and ratio
            Asset memory asset = assets[i];

            //if asset balance not empty
            if (asset.amount > 0) {
                //empty asset
                emptyAsset(i);
            }   
        }
    }

    function emptyAsset(uint currentIndex) internal {
        //set asset data
        Asset memory asset = assets[currentIndex];
        address sellingAddress = asset.tokenAddress;
        address wethAddress = config.wethAddress;

        //get swap config
        uint slippage = config.slippage;
        uint swapTimeLimit = config.swapTimeLimit;

        require(asset.amount > 0, "Asset is already empty");

        if (sellingAddress == wethAddress) {
            //deposit to Wrapped WETH
            iWeth.withdraw(asset.amount);
        }
        else {
            //set path
            address[] memory path = new address[](2);
            path[0] = sellingAddress;
            path[1] = wethAddress;

            //get amounts out
            uint[] memory amountsOut = iUniswapRouter.getAmountsOut(asset.amount, path);
            uint tokenOutput = amountsOut[1];

            //calculate slippage
            uint amountOutMin =  tokenOutput * (10000 - slippage) / 10000;
            
            //set deadline
            uint deadline = block.timestamp + swapTimeLimit;

            IUniswapV2Pair pair = IUniswapV2Pair(sellingAddress);
            pair.approve(address(iUniswapRouter), asset.amount);

            //swap Eth for tokens and set return amounts
            iUniswapRouter.swapExactTokensForETH(asset.amount, amountOutMin, path, address(this), deadline);
        }

        //update asset balance
        updateAssetBalance(currentIndex);
    }

    function configure(uint _slippage, uint _swapTimeLimit, address _uniswapRouterAddress, address _wethAddress) onlyOwner public {
        config = Config({
            slippage: _slippage,
            swapTimeLimit: _swapTimeLimit,
            uniswapRouterAddress: _uniswapRouterAddress,
            wethAddress:_wethAddress
        });

        //set interface instances
        iUniswapRouter = IUniswapV2Router(config.uniswapRouterAddress);
        iWeth = IWETH(config.wethAddress);

        //set configured to true
        configured = true;
    }

    function rename(string memory newName) onlyOwner public {
        name = newName;
    }

    function deposit() public payable {
        require(configured, "Configure portfolio");

        if (!rebalancing) {
            spreadToAssets();
        }
    }

    function withdraw(uint amount) onlyOwner public {
        //set state
        rebalancing = true;

        emptyAssets();

        //transfer to owner
        owner.call{value: amount}("");

        spreadToAssets();

        rebalancing = false;
    }

    function withdrawAll() onlyOwner public {
        //set state
        rebalancing = true;

        emptyAssets();

        //transfer to owner
        owner.call{value: address(this).balance}("");

        spreadToAssets();

        rebalancing = false;
    }

    function getAssetIndex() public view returns (uint) {
        return assetIndex;
    }

    function getAssetDetails(uint i) public view returns (string memory, string memory, address, uint, uint) {
        return (assets[i].name, assets[i].symbol, assets[i].tokenAddress, assets[i].ratio, assets[i].amount);
    }
    

    receive() external payable {
        deposit();
    }
}