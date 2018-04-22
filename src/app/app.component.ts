import { Component, OnInit, HostListener, NgZone } from '@angular/core';
import { NgForm } from '@angular/forms';
import {Web3Service} from './util/web3.service';
const grubscan_artifacts = require('../../build/contracts/Grubscan.json');
const contract = require('truffle-contract');
declare var window: any;
const Web3 = require('web3');


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  Grubscan = contract(grubscan_artifacts);
  grubscanInstance: any;

  account: any;
  accounts: any;
  web3: any;

  constructor(private _ngZone: NgZone) {}

  @HostListener('window:load')
  windowLoaded() {
    this.checkAndInstantiateWeb3();
    this.onReady();
  }

  checkAndInstantiateWeb3 = () => {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      console.warn(
        'Using web3 detected from external source.'
      );
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.warn(
        'No web3 detected, falling back to Infura Ropsten'
      );
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(
        new Web3.providers.HttpProvider('http://localhost:8545')

      );
    }
  }

  getHistory = () => {
    let grubscanInstance;
    this.Grubscan.deployed().then(function(instance) {
      grubscanInstance = instance;
      return grubscanInstance.historyCount();
    }).then(function(historyCount) {
      for (let i = 1; i <= historyCount; i++) {
        grubscanInstance.historyLogs(i).then(function(candidate) {
          const id = candidate[0];
          const company = candidate[1];
          const date = candidate[2];

          console.log(id + ' ' + company + ' ' + date);
        });
      }
      // return grubscanInstance.voters(App.account);
    // }).then(function(hasVoted) {
    //   // Do not allow a user to vote
    //   if(hasVoted) {
    //     $('form').hide();
    //   }
    //   loader.hide();
    //   content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  }

  addHistory = (form: NgForm) => {
    let acc1, acc2;
    console.log(form.value);
    const company = form.value.company;
    const batchId = form.value.batchId;
    const date1 = form.value.date1;
    const date2 = form.value.date2;
    const date3 = form.value.date3;
    const chem1 = form.value.chem1;
    const chem2 = form.value.chem2;
    const chem3 = form.value.chem3;
    const process1 = form.value.process1;
    const process2 = form.value.process2;
    const process3 = form.value.process3;

    acc1 = this.accounts[0];
    acc2 = this.accounts[1];
    this.Grubscan.deployed().then(function(instance) {
      const dateObj = new Date(date1);
      const month = dateObj.getUTCMonth() + 1;
      const day = dateObj.getUTCDate();
      const year = dateObj.getUTCFullYear();
      const newdate = year + '/' + month + '/' + day;

      return instance.addHistory(company, newdate, process1, chem1, {from: acc1, to: acc2, gasLimit: 21000, gasPrice: 2000000000});
    }).then(function(result) {
      console.log(result);
    }).catch(function(err) {
      console.error(err);
    });
  }

  onReady = () => {
    // Bootstrap the Grubscan abstraction for Use.
    this.Grubscan.setProvider(this.web3.currentProvider);
    console.log(grubscan_artifacts);
    // Get the initial account balance so it can be displayed.
    this.web3.eth.getAccounts((err, accs) => {
      if (err != null) {
        alert('There was an error fetching your accounts.');
        return;
      }

      if (accs.length === 0) {
        alert(
          'You are not connected to an Ethereum client. You can still browse the data, but you will not be able to perform transactions.'
        );
        return;
      }
      this.accounts = accs;
      this.account = this.accounts[0];

      // This is run from window:load and ZoneJS is not aware of it we
      // need to use _ngZone.run() so that the UI updates on promise resolution
      this._ngZone.run(() => {
        // Initial loading of UI
        // Load balances or whatever
        console.log(this.accounts);
        this.getHistory();
      });

    });
  }

}
