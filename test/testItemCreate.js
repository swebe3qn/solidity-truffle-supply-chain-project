const ItemManager = artifacts.require('./ItemManager.sol')

contract('ItemManager', accounts => {
  it('should create a new item', async () => {
    let itemManagerInstance = await ItemManager.deployed();

    let itemName = "product";
    let itemPrice = 500;

    let result = await itemManagerInstance.createItem(itemName, itemPrice, {from: accounts[0]});

    assert.equal(result.logs[0].args.itemIndex, 0, "This is not the first element");

    let item = await itemManagerInstance.items(0);

    assert.equal(item.name, itemName, "wrong name")
    assert.equal(item.price.toString(), itemPrice, "wrong price")
    assert.equal(item.state.toString(), 0, "wrong state")
  })
})