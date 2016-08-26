var Web3Wallet = require('../Web3Wallet.js').Web3Wallet;
var panda = require('../Panda.js');
var config = require('./test-config.js');

wallet = new Web3Wallet(config.address, config.secret);
wallet.initProvider();

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


wallet.traversalBlocks("0xA494B85566a591B246B481039aD06eeA1a9CDc90");
wallet.listBalances();
 wallet.historyTransactions();
