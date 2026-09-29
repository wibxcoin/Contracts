<h1 align="center"><img src="assets/wibx-logo-light.png" alt="WiBX" width="250px"></h1>

[![Coverage Status](https://coveralls.io/repos/github/wibxcoin/Contracts/badge.svg?branch=master)](https://coveralls.io/github/wibxcoin/Contracts?branch=master)

**WiBX is an Ethereum and Hyperledger Fabric DAPP.** The first utility token with mass usability in the exchange of products and services. The best in the NFC (Near Field Communication) wich is a mobile proximity payments transfer method model. The most flexible in his assignments.

How it works technically

WiBX is a generic crypto-currency, designed for retailers to receive payment and retain their customers.
In order to do this, WiBX needs to provide a solid and fast platform for immediate and reliable transactions.

All tokens are issued in the Ethereum network through the smart contract `WibxToken`.

## BCH (Blockchain Handler)

WiBX tokens are held in your normal Ethereum address. You can manipulate your WiBX tokens in a free way without the slightest interference from the `BCH` module.

A holder may optionally delegate transfers to `BCH` by calling `bchAuthorize()`, and revoke it at any time with `bchRevoke()`.

## Useful WiBX Network Addresses

  * 0x4261cDfEA93118677c04f880380d9b86b79C9b6a: The `BCH` system coordinator.
  * 0x194d1bA9EDb4Bd849CA844870C05AC5cFB632b14: Tax collection account.
  * 0x02F61ee95e2E7497Bfe4FAfE797ad97A4e8eFe33: `WibxToken` contract owner account.

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

Solidity version: `v0.5.0+commit.1d4f565a`.

## Hyperledger Fabric Chaincode

Inside the `wibx-private` directory, contains a [generator-hyperledger-composer](https://www.npmjs.com/package/generator-hyperledger-composer) project.

To deploy it, make sure that you have the Hyperledger Composer [installed and running](https://hyperledger.github.io/composer/latest/installing/development-tools.html) in your computer. The CLI tools are needed as well.

There is a script that do the deployment  job for you.
```(sh)
$ sh publish-blockchain.sh
```

# License

WiBX contracts are released under the [Apache 2.0 License](LICENSE).

Copyright (C) 2022 STAMPS Soluções Tecnológicas Aplicáveis a Mídias e Produtos Sociais LTDA.
