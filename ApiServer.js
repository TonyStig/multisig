var Web3Wallet = require('../Web3Wallet.js').Web3Wallet;
var panda = require('../Panda.js');
var config = require('./test-config.js');

wallet = new Web3Wallet(config.address, config.secret);
wallet.initProvider();

var express = require('express');

var app = new express();

app.get('/api/v1/wallet/new', function (req, res) {
	// address should be checked formally.
	  var myaccount = wallet.new("654321");
	 console.log(myaccount);
       res.end( JSON.stringify(myaccount));
   
})

var server = app.listen(3000, function (){

 
  var host = server.address().address;
  var port = server.address().port;

  console.log("Please access the application ", host, port);

})

/*
var balance = wallet.getBalance();
console.log('getBalance', balance);

console.log('getSeq', wallet.getSeq());

console.log('getGasPrice', wallet.getGasPrice());

wallet.transferPanda('0x38bf9c59e8129fa13f19cbeecca5131b52f6ab04', 28, function(err, hash) {
	if (err) {
		console.error('Transfer Fail!');
		console.error(err);
	} else {
		console.log('Done with HASH:', hash);
	}
});
*/

// wallet.scanBlockRange(0, wallet.listBalances);
// wallet.listBalances();
 // wallet.historyTransactions();

