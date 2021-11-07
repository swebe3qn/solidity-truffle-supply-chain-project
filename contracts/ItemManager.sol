pragma solidity ^0.8.7;

import './Ownable.sol';
import './Item.sol';

contract ItemManager is Ownable {
    enum SupplyChainState {
        Created,
        Paid,
        Delivered
    }
    
    event SupplyChainStep(uint itemIndex, uint state, address item);
    
    struct S_Item {
        Item item;
        string name;
        uint price;
        SupplyChainState state;
    }
    
    mapping(uint => S_Item) public items;
    
    uint itemCount;
    
    function createItem(string memory _name, uint _price) public onlyOwner {
        Item item = new Item(this, _price, itemCount);
        items[itemCount].item = item;
        
        items[itemCount].name = _name;
        items[itemCount].price = _price;
        items[itemCount].state = SupplyChainState.Created;
        
        emit SupplyChainStep(itemCount, uint(items[itemCount].state), address(item));
        
        itemCount++;
    }
    
    function triggerPayment(uint _itemIndex) public payable {
        require(items[_itemIndex].state == SupplyChainState.Created, "This item is not for sale anymore");
        
        Item item = items[_itemIndex].item;
        require(address(item) == msg.sender, "Only items are allowed to update themselves");
        require(item.price() == msg.value, "Please pay the exact amount");
        
        items[_itemIndex].state = SupplyChainState.Paid;
        
        emit SupplyChainStep(_itemIndex, uint(items[_itemIndex].state), address(items[_itemIndex].item));
    }
    
    function triggerDelivery(uint _itemIndex) public onlyOwner {
        require(items[_itemIndex].state == SupplyChainState.Paid, "This item can't be delivered (wrong state)");
        
        items[_itemIndex].state = SupplyChainState.Delivered;
        
        emit SupplyChainStep(_itemIndex, uint(items[_itemIndex].state), address(items[_itemIndex].item));
    }
    
    function withdrawMoney(address payable _to, uint _amount) public onlyOwner {
        require(_amount <= address(this).balance, 'Not enough funds');
        _to.transfer(_amount);
    }
}