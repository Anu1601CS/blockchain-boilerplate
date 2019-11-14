import React, { Component } from "react";
import "./App.css";
import todoList from "./build/contracts/TodoList.json";
import truffleContract from "truffle-contract";
import Web3 from "web3";
import { throws } from "assert";

class App extends Component {
  constructor() {
    super();

    this.state = {
      storageData: [],
      web3: null,
      accounts: null,
      contract: null,
      inputValue: ""
    };
  }

  componentDidMount = async () => {
    try {
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        try {
          // Request account access if needed
          await window.ethereum.enable();
          // Acccounts now exposed
          window.web3.eth.sendTransaction({
            /* ... */
          });
        } catch (error) {
          // User denied account access...
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
        // Acccounts always exposed
        window.web3.eth.sendTransaction({
          /* ... */
        });
      }
      // Non-dapp browsers...
      else {
        console.log(
          "Non-Ethereum browser detected. You should consider trying MetaMask!"
        );
      }

      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();

      const Contract = truffleContract(todoList);
      Contract.setProvider(web3.currentProvider);
      const instance = await Contract.deployed();

      this.setState(
        {
          web3,
          accounts,
          contract: instance
        },
        this.loadData
      );
    } catch (err) {
      console.log(err);
    }
  };

  loadData = async () => {
    const { accounts, contract } = this.state;
    // console.log(accounts, contract);

    const taskCount = await contract.taskCount();

    let result = [];
    for (let i = 1; i <= taskCount.toNumber(); i++) {
      const task = await contract.tasks(i);
      result.push(task);
    }
    const mappedData = result.map(val => val.content);
    this.setState({
      storageData: mappedData
    });
  };

  handleClick = async () => {
    const { accounts, contract } = this.state;

    await contract.createTask(this.state.inputValue, { from: accounts[0] });

    const taskCount = await contract.taskCount();

    let result = [];
    for (let i = 1; i <= taskCount.toNumber(); i++) {
      const task = await contract.tasks(i);
      result.push(task);
    }
    const mappedData = result.map(val => val.content);
    this.setState({
      storageData: mappedData
    });
  };

  render() {
    return (
      <div className="App">
        <div>{this.state.storageData}</div>
        <input
          onChange={event => {
            this.setState({
              inputValue: event.target.value
            });
          }}
        ></input>
        <button onClick={this.handleClick}>Click</button>
      </div>
    );
  }
}

export default App;
