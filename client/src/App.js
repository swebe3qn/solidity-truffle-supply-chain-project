import React, { Component } from "react";
import ItemManagerContract from "./contracts/ItemManager.json";
import ItemContract from "./contracts/Item.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { loaded: false, price: 0, name: '', items: [] };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      this.itemManager = new this.web3.eth.Contract(
        ItemManagerContract.abi,
        ItemManagerContract.networks[this.networkId] && ItemManagerContract.networks[this.networkId].address,
      );

      this.item = new this.web3.eth.Contract(
        ItemContract.abi,
        ItemContract.networks[this.networkId] && ItemContract.networks[this.networkId].address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenToEvent();
      this.setState({ loaded: true });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  listenToEvent = () => {
    let self = this;
    this.itemManager.events.SupplyChainStep().on('data', async function(evt) {
      console.log(evt)
      let itemObj = await self.itemManager.methods.items(evt.returnValues.itemIndex).call();
      
      if (itemObj.state == 1) {
        alert(`Item "${itemObj.name}" just got paid. Time to deliver it!`);
      } else if (itemObj.state == 2) {
        alert(`Item "${itemObj.name}" just got delivered. Good job!`);
      } 
    })
  }

  handleInputChange = e => {
    let {value, name} = e.target;
    this.setState({[name]: value});
  }

  handleSubmit = async() => {
    let {name, price} = this.state;

    if (!name || !price) {
      alert('Please enter a name and a price greater than 0.');
      return;
    }

    let result = await this.itemManager.methods.createItem(name, price).send({from: this.accounts[0]});

    let itemAddress = result.events.SupplyChainStep.returnValues.item;

    if (!itemAddress) {
      alert("Something went wrong. Please try again.");
    } else {
      alert(`Please send ${Number(this.state.price)} Wei to ${itemAddress}.`);
      this.setState({name: '', price: ''})
    }
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Event Trigger / Supply Chain Project</h1>
        <h2>Items</h2>
        {this.state.items.length >= 1 && (
          <ul>

          </ul>
        )}
        <h2>Add item</h2>
        <div>Item name: <input type="text" name="name" value={this.state.name} onChange={this.handleInputChange} placeholder="Item name" /></div>
        <div>Item price: <input type="number" name="price" value={this.state.price} onChange={this.handleInputChange} placeholder="Item price" /></div>
        <button type="button" onClick={this.handleSubmit}>Add item</button>
      </div>
    );
  }
}

export default App;
