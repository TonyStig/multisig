var Tx = require('ethereumjs-tx');
var ethUtil = require('ethereumjs-util');
var Web3 = require('web3');
var HookedWeb3Provider = require('hooked-web3-provider');
var panda = require('./Panda.js');
var fs = require('fs');
var _ = require('underscore');
global.CryptoJS = require('browserify-cryptojs');
require('browserify-cryptojs/components/enc-base64');
require('browserify-cryptojs/components/md5');
require('browserify-cryptojs/components/evpkdf');
require('browserify-cryptojs/components/cipher-core');
require('browserify-cryptojs/components/aes');

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

/**
Generate a new Ethereum account in browser with a passphrase that will encrypt the public and private keys with AES for storage.
@method (new)
@param {String} passphrase          The passphrase to encrypt the public and private keys.
@return {Object}  {
                                     "success": true,
                                     "account": {
                                          "address": "0xffDF1F2881f0f8C5b2B572a261c85058D5a113B7",
                                          "secret": "a549e1e4374b3c69452339a5812c23451072fd67a9a06c37394d0e00f9f70a7b"
                                      }
                                }
**/
Web3Wallet.prototype.new = function(passphrase) {
	var self = this;
    var private = new Buffer(self.randomBytes(64), 'hex');
    var public = ethUtil.privateToPublic(private);
    var address = self.formatAddress(ethUtil.publicToAddress(public).toString('hex'));
    var accountObject = {
		"success" : true,
		"account" : {
		  "address" : address,
		  "secret" : private
		}
    };

    // if passphrrase provided or required, attempt account encryption
    if((!_.isUndefined(passphrase) && !_.isEmpty(passphrase))){
        if(self.isPassphrase(passphrase)) {
            private = CryptoJS.AES.encrypt(private.toString('hex'), passphrase).toString();
            public = CryptoJS.AES.encrypt(public.toString('hex'), passphrase).toString();
            // accountObject.encrypted = true;
            // accountObject.locked = true;
        } else {
            this.log('The passphrase you tried to use was invalid.');
            private = private.toString('hex');
            public = public.toString('hex');
        }
    }else{
        private = private.toString('hex');
        public = public.toString('hex');
    }

    // Set account object private and public keys
    accountObject.account.secret = private;
    // accountObject.public = public;
    

    // If option select new is true
    // if(this.options.selectNew)
        // this.select(accountObject.address);

    return accountObject;
};

/**
Generate 16 random alpha numeric bytes.
@method (randomBytes)
@param {Number} length      The string length that should be generated
@return {String} A 16 char/UTF-8 byte string of random alpha-numeric characters
**/

Web3Wallet.prototype.randomBytes = function(length) {
	var self = this;
    var charset = "abcdef0123456789";
    var i;
    var result = "";
    
        for(i=0; i<length; i++) {
            result += charset[Math.floor(Math.random()*charset.length)];
        }
        return result;
}


/**
Prepair Ethereum address for raw transactions.
@method (formatAddress)
@param {String} addr    An ethereum address to prep
@param {String} format          The format type (i.e. 'raw' or 'hex')
@return {String} The prepaired ethereum address
**/

Web3Wallet.prototype.formatAddress = function(addr, format) {
    if(_.isUndefined(format) || !_.isString(format))
        format = 'hex';

    if(_.isUndefined(addr) || !_.isString(addr))
        addr = '0000000000000000000000000000000000000000';

    if(addr.substr(0, 2) == '0x' && format == 'raw')
        addr = addr.substr(2);

    if(addr.substr(0, 2) != '0x' && format == 'hex')
        addr = '0x' + addr;

    return addr;
};


/**
Returns true when a valid passphrase is provided.
@method (isPassphrase)
@param {String} passphrase    A valid ethereum passphrase
@return {Boolean} Whether the passphrase is valid or invalid.
**/

Web3Wallet.prototype.isPassphrase = function(passphrase){
	var self = this;
    if(!_.isUndefined(passphrase) && _.isString(passphrase) && !_.isEmpty(passphrase))  // && String(passphrase).length > self.options.minPassphraseLength
        return true;
};





Web3Wallet.prototype.listBalances = function() {
	var self = this.wallet;
	// console.log("I am in listBalances.");
	console.log(panda.abi);
	var PandaToken = self.web3.eth.contract(panda.abi);
    console.log(panda.address);
	var ptInstance = PandaToken.at(panda.address);
	if (self.addressList) {
	    console.log(self.addressList);
	    self.addressList.forEach(function(e){
	        console.log(e + " (Panda Token) : " + self.web3.toBigNumber(ptInstance.balanceOf(self.toMapPos(e,2)))+ "    by  balanceOf    ");
		    console.log(e+" (Panda Token) : "+self.web3.toBigNumber(self.web3.eth.getStorageAt(panda.address,self.toMapPos(e,3)))   + " by Storage");
	   });
	}
}

Web3Wallet.prototype.toMapPos = function(address, mapPosIndex) {
	var self = this;
	var key = address.substring(2,address.length);
	var zero24 = "000000000000000000000000";
	var zero63 =zero24+zero24 +"000000000000000";
	key = zero24+key + zero63+mapPosIndex;
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
	var hwallet = self.wallet;
	// console.log(self);
	
	// console.log(self.wallet.transactions);
	
	// var PandaToken = self.web3.eth.contract(panda.abi);

	// var ptInstance = PandaToken.at(self.address);
	if (hwallet.transactions) {
		// console.log("I am in historyTransactions");
		// console.log(self.transactions);
	    hwallet.transactions.forEach(function(tx){
		    // console.log(tx);
			// console.log("I am in historyTransactions forEach");
			var txr = hwallet.web3.eth.getTransactionReceipt(tx.hash);
		   //  self.transactions.push(tx);
		    var xlen = txr.from.length;
		    var ylen = txr.logs[0].topics[1].length;
			var rAddress = "0x" + txr.logs[0].topics[2].substring(ylen-xlen+2, ylen);
			// A transaction credited Panda Token into this wallet
            var ether = hwallet.web3.toBigNumber(txr.logs[0].data);
			var block = hwallet.web3.eth.getBlock(tx.blockNumber);
            console.log("\r Timestamp is "+ block.timestamp + ".   Transferred "+ ether  +"  Panda Token from " + tx.from  + " to " + rAddress);
	  });
	}
	
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

Web3Wallet.prototype.traversalBlocks = function(startBlock) {
	/*
	var self = this;
	var blockNum = self.web3.eth.blockNumber;
	var tTxNum = 0;
	
	// var trlBadrs = contractAddress.toLowerCase();
	
	for (i=self.startBlockNo; i<blockNum; i++) {
		var txNum = self.web3.eth.getBlockTransactionCount(i);
		if (0===i%100) {
			console.log(txNum + " " + i);
		}
		
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
		} 
		
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
	*/
}


/**
 * Scan an individual transaction
 *
 * This is called once for every transaction found between the
 * starting block and the ending block.
 *
 * Do whatever you want with this transaction.
 *
 * NOTE- This is called asynchronously, so the tx/block you
 * see here might have actually happened AFTER the tx/block
 * you see the next time is is called.  To determine
 * synchronicity, you need to look at `block.timestamp`
 *
 * @param {Object} tx (See https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethgettransaction)
 * @param {Object} block The parent block of the transaction (See https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethgetblock)
 */
Web3Wallet.prototype.scanTransactionCallback = function(tx, block) {
	var self = this;
	
	if (tx.to === panda.address.toLowerCase()) {
		// console.log("the smart contract of the transaction tx.to is " + tx.to);
	   //  console.log("panda.address = " + panda.address);
		// console.log("Haha, a transaction of the smart contract was found.");
       var txr = self.web3.eth.getTransactionReceipt(tx.hash);
		if (txr.logs[0]) {
		     self.transactions.push(tx);
		     var xlen = txr.from.length;
		
		     var ylen = txr.logs[0].topics[1].length;    //   logs may be 'undefined'
		     // console.log("number of topics is " + txr.logs[0].topics.length);
		     // console.log("topics[0] is "+txr.logs[0].topics[0]);
		     // console.log("topics[1] is "+ txr.logs[0].topics[1]);
		     // console.log("topics[2] is "+ txr.logs[0].topics[2]);
		     // console.log("logs[0].data is "+ txr.logs[0].data);
		     // console.log("topics[4] is "+ txr.logs[0].topics[4]);
		     var rAddress = "0x" + txr.logs[0].topics[2].substring(ylen-xlen+2, ylen);
		      // console.log("toAddress is "+rAddress);
		     // console.log("fromAddress is "+tx.from);
		     self.updateAddressList(rAddress);
		     self.updateAddressList(tx.from);
		     // console.log(self.addressList);
             // A transaction credited Panda Token into this wallet
             // var ether = self.web3.toBigNumber(txr.logs[0].data);
             //  console.log("\r Timestamp is "+ block.timestamp + ".  Transferred "+ ether  +"  Panda Token from " + tx.from  + " to " + rAddress);
			}
    } 
}


/**
 * Scan an individual block
 *
 * This is called once for every block found between the
 * start block and the end block.
 *
 * Here we just look for transactions in the block, and then
 * we scan each of those.
 *
 * NOTE- This is called asynchronously, so the block you
 * see here might have actually happened AFTER the block
 * you see the next time this is called.  To determine
 * synchronicity, you need to look at `block.timestamp`
 *
 * @param {Object} block (See https://github.com/ethereum/wiki/wiki/JavaScript-API#web3.eth.getblock)
 */
Web3Wallet.prototype.scanBlockCallback = function(block) {
	var self = this;
	if (block.transactions) {
		
        for (var i = 0; i < block.transactions.length; i++) {
            var txn = block.transactions[i];
            self.scanTransactionCallback(txn, block);
        }
    }
}

/**
 * Scan a range of blocks
 *
 * Spawn up to `maxThreads` threads to scan blocks in the
 * range provided.
 *
 * Note that if you pass undefined for `stoppingBlock`, its
 * value will be computed at the beginning of the function,
 * so any blocks added during the scan will not be processed.
 *
 * @param {number|hex} startingBlock First block to scan.
 * @param {number|hex} stoppingBlock (Optional) Last block to scan. If undefined, scan all blocks.
 * @param {function} callback Function to call after this range has been fully scanned.
 * It must accept these arguments: (error, lastScannedBlockNumber)
 * @returns {number} Number of threads started. They will continue working asynchronously in the background.
 */
Web3Wallet.prototype.scanBlockRange = function(startingBlock, callback) {
	var self = this;
	 // If they didn't provide an explicit stopping block, then read
    // ALL of the blocks up to the current one.

    
    var    stoppingBlock = self.web3.eth.blockNumber;
	self.startBlockNo = stoppingBlock;
    
	console.log("block Number is: " + stoppingBlock);

    // If they asked for a starting block that's after the stopping block,
    // that is an error (or they're waiting for more blocks to appear,
    // which hasn't yet happened).

    if (startingBlock > stoppingBlock) {
        return -1;
    }

    let blockNumber = startingBlock,
        gotError = false,
        numThreads = 0,
        startTime = new Date();

    function getPercentComplete(bn) {
        var t = stoppingBlock - startingBlock,
            n = bn - startingBlock;
        return Math.floor(n / t * 100, 2);
    }

    function exitThread() {
        if (--numThreads == 0) {
            var numBlocksScanned = 1 + stoppingBlock - startingBlock,
                stopTime = new Date(),
                duration = (stopTime.getTime() - startTime.getTime())/1000,
                blocksPerSec = Math.floor(numBlocksScanned / duration, 2),
                msg = `Scanned to block ${stoppingBlock} (${numBlocksScanned} in ${duration} seconds; ${blocksPerSec} blocks/sec).`,
                len = msg.length,
                numSpaces = process.stdout.columns - len,
                spaces = Array(1+numSpaces).join(" ");

            process.stdout.write("\r"+msg+spaces+"\n");
            if (callback) {
                callback(gotError, stoppingBlock);
            }
        }
		
        return numThreads;
    }

    function asyncScanNextBlock() {

        // If we've encountered an error, stop scanning blocks
        if (gotError) {
            return exitThread();
        }

        // If we've reached the end, don't scan more blocks
        if (blockNumber > stoppingBlock) {
            return exitThread();
        }

        // Scan the next block and assign a callback to scan even more
        // once that is done.
        var myBlockNumber = blockNumber++;

        // Write periodic status update so we can tell something is happening
        if (myBlockNumber % maxThreads == 0 || myBlockNumber == stoppingBlock) {
            var pctDone = getPercentComplete(myBlockNumber);
            process.stdout.write(`\rScanning block ${myBlockNumber} - ${pctDone} %`);
        }

        // Async call to getBlock() means we can run more than 1 thread
        // at a time, which is MUCH faster for scanning.

        self.web3.eth.getBlock(myBlockNumber, true, (error, block) => {
            if (error) {
                // Error retrieving this block
                gotError = true;
                console.error("Error retrieving this block +      +  Error:", error);
            } else {
                self.scanBlockCallback(block);
                asyncScanNextBlock();
            }
        });
    }

    var nt;
	var maxThreads = 200;
    for (nt = 0; nt < maxThreads && startingBlock + nt <= stoppingBlock; nt++) {
		
        numThreads++;
		// console.log("Address List is :    " + self.addressList + " Thread: " + numThreads);
        asyncScanNextBlock();
    }
	
	// console.log("Address List is :    " + self.addressList);
	// console.log(self.transactions);
	
	// write the transactions into a file named etransactions.txt
	// fs.writeFile('etransactions.txt', JSON.stringify(self.transactions) );

    return nt; // number of threads spawned (they'll continue processing)
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