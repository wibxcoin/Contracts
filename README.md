# <img src="https://wibx.io/assets/svg/logo-site.svg" alt="WiBX" width="150px">

[![Build Status](https://travis-ci.com/wibxcoin/Contracts.svg?branch=master)](https://travis-ci.com/wibxcoin/Contracts)
[![Coverage Status](https://coveralls.io/repos/github/wibxcoin/Contracts/badge.svg?branch=master)](https://coveralls.io/github/wibxcoin/Contracts?branch=master)

**WiBX is an Ethereum and Hyperledger DAPP.** The first utility token with mass usability in the exchange of products and services. The best in the NFC (Near Field Communication) wich is a mobile proximity payments transfer method model. The most flexible in his assignments.

How it works technically

WiBX is a generic crypto-currency, designed for retailers to receive payment and retain their customers.
In order to do this, WiBX needs to provide a solid and fast platform for immediate and reliable transactions.

All tokens are issued in the Ethereum network through the smart contract `WibxToken` and are tracked within the private network Hyperledger, through the chaincode `org.wiboo.wibxp.financial`, which is, the Hyperledger performing a fast network, processing the information well faster than Ethereum mainnet.

This implies having a module called BCH (Blockchain Handler) that acts on both networks, tracing one blockchain to another and vice versa.

## How will BCH (Blockchain Handler) manage these transactions?

There are two types of addresses:

  * Personal address: Your normal Ethereum address. You can manipulate your WiBX tokens in a free way without the slightest interference from the `BCH` module.

  * Custody address: This type of wallet is used totally restricted for the internal operations of the WiBOO mall platform and will not allow any type of creation or external manipulation; these tokens will be administered by the `BCH` in full. Those tokens could be extracted to  a personal address, however it will be possible just via the WiBOO marketplace.

# How to Install

## Ethereum smart contract

Inside the `wibx` directory, contains a [Truffle Framework](https://truffleframework.com) project. So you can do all Truffle operations.

Installation of local dependencies:
```
$ yarn
```

### Deployment

Configure your network node inside the `truffle.js` configuration file and run the migration:
```
$ yarn migrate
```

### Testing

You need to keep your [Ganache](https://truffleframework.com/ganache) (it is possible, instead to use [Ganache CLI](https://github.com/trufflesuite/ganache-cli) if you like) node up and running on `port 8545`. It is recommended to have `100+ ETH` in the first account to run all the test cases smoothly.
```
$ yarn test
```

Or you can run it automatically:
```
$ yarn build:test
```

### Coverage

To get coverage statistics, just run the coverage script:
```
$ yarn build:coverage
```

Solidity version: `v0.4.24+commit.e67f0147`.

## Hyperledger chaincode

Inside the `wibx-private` directory, contains a [generator-hyperledger-composer](https://www.npmjs.com/package/generator-hyperledger-composer) project.

To deploy it, make sure that you have the Hyperledger Composer [installed and running](https://hyperledger.github.io/composer/latest/installing/development-tools.html) in your computer. The CLI tools are needed as well.

There is a script that do the deployment  job for you.
```(sh)
$ sh publish-blockchain.sh
```

# License

WiBX contracts are released under the [Apache 2.0 License](LICENSE).
