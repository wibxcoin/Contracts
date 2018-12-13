/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

const util = require('util');

module.exports = {
    ethGetBalance: util.promisify(web3.eth.getBalance),
    ethSendTransaction: util.promisify(web3.eth.sendTransaction),
    ethGetBlock: util.promisify(web3.eth.getBlock)
};