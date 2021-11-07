pragma solidity ^0.8.7;

import './ItemManager.sol';

contract Item {
    uint public price;
    uint public index;
    uint public amountPaid;
    ItemManager parentContract;
    
    constructor(ItemManager _parentContract, uint _price, uint _index) {
        price = _price;
        index = _index;
        parentContract = _parentContract;
    }
    
    receive() external payable {
        require(amountPaid == 0, "Item is paid already");
        require(msg.value == price, "Please pay the exact amount");
        amountPaid += msg.value;
        (bool success, ) = address(parentContract).call{value: msg.value}(abi.encodeWithSignature("triggerPayment(uint256)", index));
        require(success, "There was an error. Cancelling transaction");
    }
    
    fallback() external {}
}