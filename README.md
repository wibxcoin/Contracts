# <img src="https://wibx.io/assets/svg/logo-site.svg" alt="WiBX" width="150px">

**WiBX is an Ethereum and Hyperledger DAPP.** The first utility token with mass usability in the exchange of products and services. The best in the NFC (mobile proximity payments) transfer method model. The most elastic in his assignments.

# How it works technically

WiBX is a generic crypto-currency, designed for retailers to receive payment and preserve their customers.
For this, WiBX needs to provide a solid and fast platform for instant and reliable transactions.

All tokens are issued in the Ethereum network through the smart contract `WibxToken` and are tracked within the private network Hyperledger through the chaincode `org.wiboo.wibxp.financial`, that is, Hyperledger acts as lightning network, processing the information well faster than Ethereum mainnet.

This implies having a module called `BCH` that acts on both networks, tracing one blockchain to another and vice versa.

## How will BCH handle those transactions?

There are two types of addresses:

  * Personal address: Your normal Ethereum address. You can manipulate your WiBX tokens in a free way without the slightest interference from the `BCH` module.

  * Custody address: This type of wallet is of totally restricted use for the internal operations of the WiBOO mall and will not allow any type of creation or external manipulation, these tokens will be administered by the `BCH` in full. Those tokens could be extracted to an personal address, but it will be possible just via the WiBOO marketplace.

# Install

## Ethereum smart contract

Inside the `wibx` directory, contains a [Truffle Framework](https://truffleframework.com) project. So you can do all Truffle operations.

Install the local dependencies:
```
$ yarn
```

Configure your network inside the `truffle.js` configuration file and run the migration (Requires the [Truffle CLI installed](https://truffleframework.com/truffle)):
```
$ truffle migrate
```

Solidity version: `v0.4.24+commit.e67f0147`.

## Hyperledger chaincode

Inside the `wibx-private` directory, contains a [generator-hyperledger-composer](https://www.npmjs.com/package/generator-hyperledger-composer) project.

To deploy it, make sure that you have the Hyperledger Composer (installed and running)[https://hyperledger.github.io/composer/latest/installing/development-tools.html] in your computer. The CLI tools are needed as well.

There is a script that do the deploy job for you.
```(sh)
$ sh publish-blockchain.sh
```

# License

WiBX contracts are released under the [Apache 2.0 License](LICENSE).