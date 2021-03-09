/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

const HDWalletProvider = require('@truffle/hdwallet-provider');

const LOCALHOST = '127.0.0.1';
const COMMON_NETWORK_ID = '*';
const COMMON_GAS_LIMIT = 0x5FDFB1;

/**
 * See <http://truffleframework.com/docs/advanced/configuration>
 * to customize your Truffle configuration!
 */
/* eslint-disable camelcase */
module.exports = {
    networks: {
        // Local server
        development: {
            host: LOCALHOST,
            port: 8646,
            gas: COMMON_GAS_LIMIT,
            network_id: COMMON_NETWORK_ID
        },

        rinkeby: {
            network_id: 4,
            provider: function()
            {
                return new HDWalletProvider(
                    process.env['INFURA_PK'],
                    'https://rinkeby.infura.io/v3/' + process.env['INFURA_API_KEY']
                );
            }
        },

        localdocker: {
            host: 'setup-geth',
            port: 8646,
            gas: COMMON_GAS_LIMIT,
            network_id: COMMON_NETWORK_ID
        },

        localwibxdocker: {
            host: 'wibx-geth',
            port: 8646,
            gas: COMMON_GAS_LIMIT,
            network_id: COMMON_NETWORK_ID
        },

        build: {
            host: LOCALHOST,
            port: 8545,
            gas: COMMON_GAS_LIMIT,
            network_id: COMMON_NETWORK_ID
        },

        // Build coverage server
        coverage: {
            host: LOCALHOST,
            network_id: COMMON_NETWORK_ID,
            port: 8555,
            gas: 0xfffffffffff,
            gasPrice: 0x01
        }
    }
};