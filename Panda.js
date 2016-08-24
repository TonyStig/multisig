var _ = require('lodash');
var SolidityFunction = require('web3/lib/web3/function');

var abi = [ {
	"constant" : true,
	"inputs" : [],
	"name" : "name",
	"outputs" : [ { "name" : "", "type" : "string" } ],
	"type" : "function"
}, {
	"constant" : true,
	"inputs" : [],
	"name" : "decimals",
	"outputs" : [ { "name" : "", "type" : "uint8" } ],
	"type" : "function"
}, {
	"constant" : true,
	"inputs" : [ { "name" : "", "type" : "address" } ],
	"name" : "balanceOf",
	"outputs" : [ { "name" : "", "type" : "uint256" } ],
	"type" : "function"
}, {
	"constant" : true,
	"inputs" : [],
	"name" : "symbol",
	"outputs" : [ { "name" : "", "type" : "string" } ],
	"type" : "function"
}, {
	"constant" : false,
	"inputs" : [ { "name" : "_to", "type" : "address" }, { "name" : "_value", "type" : "uint256" } ],
	"name" : "transfer",
	"outputs" : [],
	"type" : "function"
}, {
	"inputs" : [ { "name" : "_supply", "type" : "uint256" }, 
	             { "name" : "_name", "type" : "string" }, 
	             { "name" : "_symbol", "type" : "string" }, 
	             { "name" : "_decimals", "type" : "uint8" } ],
	"type" : "constructor"
}, {
	"anonymous" : false,
	"inputs" : [ { "indexed" : true, "name" : "from", "type" : "address" }, 
	             { "indexed" : true, "name" : "to", "type" : "address" }, 
	             { "indexed" : false, "name" : "value", "type" : "uint256" } ],
	"name" : "Transfer",
	"type" : "event"
} ];

var address = '0xA494B85566a591B246B481039aD06eeA1a9CDc90';

function getData(functionName, params) {
	var solidityFunction = new SolidityFunction('', _.find(abi, { name: functionName }), '');
	//console.log(solidityFunction)

	var payloadData = solidityFunction.toPayload(params).data;
	//console.log(payloadData);
	return payloadData;
}

exports.abi = abi;
exports.address = address;
exports.getData = getData;