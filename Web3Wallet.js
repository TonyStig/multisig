var Web3 = require('web3');
var HookedWeb3Provider = require('hooked-web3-provider');

function Web3Wallet(address, secret) {
	var self = this;
	
	this.address = address;
	this.secret = secret;
	
	this.host;
	this.web3 = new Web3();
	
}

Web3Wallet.prototype.initProvider = function(host) {
	var self = this;
	self.host = host || 'http://localhost:8545';
	console.log(self.host)
	var provider = new Web3.providers.HttpProvider(self.host);
//	var provider = new HookedWeb3Provider({
//		  host: self.host,
//		  transaction_signer: { 
//		    // Can be any object that implements the following methods:
//		    hasAddress: function(address, callback) { },
//		    signTransaction: function(tx_params, callback) { }
//		  }
//	});
	self.web3.setProvider(provider);
}

Web3Wallet.prototype.getBalance = function(address) {
	var self = this;
	address = address || self.address;
	
	console.log(address);
	var balance = self.web3.eth.getBalance(address);
    return balance;
}

exports.Web3Wallet = Web3Wallet;