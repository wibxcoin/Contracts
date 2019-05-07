/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

/**
 * See <http://truffleframework.com/docs/advanced/configuration>
 * to customize your Truffle configuration!
 */
module.exports = {
    networks: {
        // Local server
        development: {
            host: '127.0.0.1',
            port: 8545,
            network_id: '*' // eslint-disable-line camelcase
        },

        localdocker: {
            host: 'setup-geth',
            port: 30303,
            network_id: '*' // eslint-disable-line camelcase
        },

        // Build coverage server
        coverage: {
            host: '127.0.0.1',
            network_id: '*', // eslint-disable-line camelcase
            port: 8555,
            gas: 0xfffffffffff,
            gasPrice: 0x01
        }
    }
};