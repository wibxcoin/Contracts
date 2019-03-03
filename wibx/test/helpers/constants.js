/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

const { BN } = require('openzeppelin-test-helpers');

/**
 * 12 billion tokens raised by 18 decimal places.
 *
 * 12000000000 * (10 ** 18)
 */
const TOTAL_TOKENS = '12000000000000000000000000000';

module.exports = class
{
    /**
     * Ghost Address.
     */
    static get ZERO_ADDRESS ()
    {
        return '0x0000000000000000000000000000000000000000';
    }

    /**
     * Total tokens in Big Number.
     */
    static get INITIAL_SUPPLY ()
    {
        return new BN(TOTAL_TOKENS.toString());
    }

    /**
     * A big number that will be used to transfers in tests
     */
    static get TRANSFER_TEST_AMOUNT ()
    {
        return this.INITIAL_SUPPLY.div(new BN('2'));
    }

    /**
     * Some amount that no one can have.
     */
    static get UNAVAILABLE_AMOUNT ()
    {
        const addionalSupply = new BN(1);

        return this.INITIAL_SUPPLY.add(addionalSupply);
    }

    /**
     * All taxes.
     *
     * Initial tax: 0.9%
     */
    static get ALL_TAXES ()
    {
        return new BN(9);
    }

    /**
     * All taxes (shift value).
     *
     * Initial tax: 0.9%
     */
    static get ALL_TAXES_SHIFT ()
    {
        return new BN(1);
    }
};