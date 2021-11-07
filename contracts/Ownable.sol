pragma solidity ^0.8.7;

contract Ownable {
    address payable public owner;
    
    constructor() {
        owner = payable(msg.sender);
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "You don't have permission");
        _;
    }
    
    function isOwner() public view returns(bool) {
        return owner == msg.sender;
    }
}