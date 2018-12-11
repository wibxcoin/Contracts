/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

const BigNumber = web3.BigNumber;

module.exports = {
    /**
     * Prepare the test function 'should'.
     */
    should: () => require('chai')
        .use(require('chai-bignumber')(BigNumber))
        .should()
};