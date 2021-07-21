pragma solidity ^0.7.6;

import 'contracts/portfolio.sol';

contract WealthWallet {
    address public owner;
    uint public totalPortfolios;
    mapping(uint => Portfolio) public portfolios;
    bool public defaultSet;
    uint public defaultPortfolio;
    
    constructor(address _owner) public {
        owner = _owner;
        defaultSet = false;
        totalPortfolios = 0;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    function createPortfolio(string memory _name) onlyOwner public {
        Portfolio portfolio = new Portfolio(owner, _name);

        portfolios[totalPortfolios] = portfolio;

        //if there is no default portfolio
        if (!defaultSet) {
            //set default to this
            defaultPortfolio = totalPortfolios;
            defaultSet = true;
        }

        //update total portfolios
        totalPortfolios+=1;
    }

    function addFunds() public payable {
        require(defaultSet, "Create a portfolio");
        
        fundPortfolio(defaultPortfolio);
    }

    function fundPortfolio(uint portfolioIndex) public payable {
        //get portfolio
        Portfolio portfolio = portfolios[portfolioIndex];

        //fund portfolio with msg value
        address(portfolio).call{value: msg.value}("");
    }

    function setDefault(uint portfolioIndex) onlyOwner public {
        require(portfolioIndex < totalPortfolios, "Portfolio doesn't exist");

        //sets new default portfolio
        defaultPortfolio = portfolioIndex;
    }

    function getOwner() public view returns (address) {
        return owner;
    }
    function getTotalPortfolios() public view returns (uint) {
        return totalPortfolios;
    }
    function getPortfolio(uint portfolioIndex) public view returns (address) {
        return address(portfolios[portfolioIndex]);
    }

    receive() external payable {
        addFunds();
    }
}