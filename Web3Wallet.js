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
	this.addressList = new Array();
	this.transactions = new Array();
	this.startBlockNo = 0;
	// this.traversalBlocks(this.address);
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

/**
  listBalances:
       function-----list all accounts' balances of some smart contract
  param: 
       contractAddress----- address of some smart contract
  output:
      console------<address  : balance  >
  return:
       null
*/

Web3Wallet.prototype.listBalances = function() {
	var self = this;
	
	var PandaToken = self.web3.eth.contract(panda.abi);
    
	var ptInstance = PandaToken.at(self.address);
	console.log(self.addressList);
	self.addressList.forEach(function(e){
	    console.log(e + " : " + self.web3.toBigNumber(ptInstance.balanceOf(self.toMapPos(e,3)))+ "           ");
		console.log(e+":"+self.web3.toBigNumber(self.web3.eth.getStorageAt(self.address,self.toMapPos(e,3))));
	});
}

Web3Wallet.prototype.toMapPos = function(address, mapPosIndex) {
	var self = this;
	var key = address.substring(2,address.length);
	var zero24 = "000000000000000000000000";
	var zero63 =zero24+zero24 +"000000000000000";
	key = zero24+address + zero63+mapPosIndex;
	var hashOfHash = self.web3.sha3(key, {encoding: 'hex'});
	return hashOfHash;
}

/**
  historyTransactions:
       function-----list all history transactions of some smart contract
  param: 
       contractAddress----- address of some smart contract
   output:
       console----all transactions
  return:
       null
*/

Web3Wallet.prototype.historyTransactions = function() {
	var self = this;
	console.log("I am in historyTransactions");
	var PandaToken = self.web3.eth.contract(panda.abi);

	var ptInstance = PandaToken.at(self.address);
	self.transactions.forEach(function(tx){
		console.log(tx);
	});
}

/**
  traversalBlocks:
       function-----ltraversal all blocks in the chain, list all history transactions of some smart contract and accounts
  param: 
       contractAddress----- address of some smart contract
   output:
       transactions []----all transactions
	   addressList []---- all accounts
  return:
       null
*/

Web3Wallet.prototype.traversalBlocks = function(contractAddress) {
	var self = this;
	var blockNum = self.web3.eth.blockNumber;
	var tTxNum = 0;
	
	var trlBadrs = contractAddress.toLowerCase();
	
	for (i=self.startBlockNo; i<blockNum; i++) {
		var txNum = self.web3.eth.getBlockTransactionCount(i);
		if (0===i%100) {
			console.log(txNum + " " + i);
		}
		/*
		var block = self.web3.eth.getBlock(i,true);
		if (block != null && block.transactions != null) {
           block.transactions.forEach( function(tx) {
			   if (tx.to == trlBadrs ) {
				  var txr =  self.web3.eth.getTransactionReceipt(tx.hash);
				   self.transactions[tTxNum++] = tx; 
				   var xlen = txr.from.length;
				   var ylen = txr.logs[0].topics[1].length;
				    var rAddress = "0x" + txr.logs[0].topics[2].substring(ylen-xlen+2, ylen);
			      self.updateAddressList(rAddress);
				  self.updateAddressList(tx.from);
			   }
		   } );
		} */
		
		for(j=0; j<txNum; j++) {
			
			var tx = self.web3.eth.getTransactionFromBlock(i, j);
			var txr = self.web3.eth.getTransactionReceipt(tx.hash);
			
			if (tx.to == trlBadrs ) {
				
				self.transactions[tTxNum++] = tx;
				var xlen = txr.from.length;
				var ylen = txr.logs[0].topics[1].length;
				var rAddress = "0x" + txr.logs[0].topics[2].substring(ylen-xlen+2, ylen);
				console.log(rAddress);
			    self.updateAddressList(rAddress);
				console.log(tx.from);
				self.updateAddressList(tx.from);
				
			}
		}
	}
	self.startBlockNo = blockNum;
}

/**
  updateAddressList:
       function-----insert an account of some smart contract
  param: 
       address----- address of an account using some smart contract
   output:
	   addressList []---- all accounts
  return:
       null
*/

Web3Wallet.prototype.updateAddressList = function(address) {
	var self = this;
	
	var adrNum = self.addressList.length;
	
	
	 
	var pos = self.findAddress(address);
	if (pos > adrNum-1) {
		self.addressList.push(address);
	} else {
		self.addressList.splice(pos,address);
	}
	//.addressList = addressList;
}

/**
  findAddress:
       function-----look for the pos of a given address
  param: 
       address----- address of an account using some smart contract
   output:
	   addressList []---- all accounts
  return:
       null
*/

Web3Wallet.prototype.findAddress = function(address) {
	var self = this;
	var addressList = self.addressList;
	var posi = 0;
	addressList.some(function(e){
		posi++; 
		return e>address;
	});
	return posi;
	
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