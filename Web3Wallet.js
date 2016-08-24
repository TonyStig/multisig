var Tx = require('ethereumjs-tx');
var Web3 = require('web3');
var HookedWeb3Provider = require('hooked-web3-provider');
var panda = require('./Panda.js');
//var lightwallet = require('eth-lightwallet');
//var txutils = lightwallet.txutils;
//var signing = lightwallet.signing;

function Web3Wallet(address, secret) {
	var self = this;
	
	this.address = address;
	this.secret = secret;
	this.privateKey = new Buffer(secret, 'hex');
	
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

Web3Wallet.prototype.getSeq = function(address) {
	var self = this;
	address = address || self.address;
	
	var number = self.web3.eth.getTransactionCount(address);
	return number;
}

Web3Wallet.prototype.getGasPrice = function() {
	return this.web3.eth.gasPrice;
}

Web3Wallet.prototype.transferPanda = function(toAddress, amount, callback) {
	var self = this;
	var gasPriceHex = self.web3.toHex(self.getGasPrice());
	var gasLimitHex = self.web3.toHex(300000);
	var nonceHex = self.web3.toHex(self.getSeq());
	var txData = panda.getData('transfer', [toAddress, amount]);
	var rawTx = {
	    nonce: nonceHex,
	    gasPrice: gasPriceHex,
	    gasLimit: gasLimitHex,
	    to: panda.address,
	    from: self.address,
	    value: '0x00',
	    data: txData
	};
	
	var tx = new Tx(rawTx);
	tx.sign(self.privateKey);
	var serializedTx = tx.serialize();
	
	self.web3.eth.sendRawTransaction(serializedTx.toString('hex'), callback);
}

exports.Web3Wallet = Web3Wallet;