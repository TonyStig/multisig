var Web3Wallet = require('../Web3Wallet.js').Web3Wallet;
var panda = require('../Panda.js');
var config = require('./test-config.js');

wallet = new Web3Wallet(config.address, config.secret);
wallet.initProvider();

var balance = wallet.getBalance();
console.log('getBalance', balance);

console.log('getSeq', wallet.getSeq());

console.log('getGasPrice', wallet.getGasPrice());

wallet.transferPanda('0x1552f2d8C79CCEe276dfD399229f6985383926a4', 288, function(err, hash) {
	if (err) {
		console.error('Transfer Fail!');
		console.error(err);
	} else {
		console.log('Done with HASH:', hash);
	}
});