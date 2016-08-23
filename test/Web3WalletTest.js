var Web3Wallet = require('../Web3Wallet.js').Web3Wallet;

wallet = new Web3Wallet('0xffDF1F2881f0f8C5b2B572a261c85058D5a113B7');
wallet.initProvider();

var balance = wallet.getBalance();
console.log('getBalance', balance);

