interface IWETH {
    function deposit() external payable;
    function approve(address spender, uint amount) external;
    function transfer(address to, uint value) external returns (bool);
    function withdraw(uint) external;
    function allowance(address owner, address spender) external view returns(uint);
    function balanceOf(address owner) external view returns(uint);
}

