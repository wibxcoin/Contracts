/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

const { BigNumber } = require('./util');

/**
 * 12 billion tokens raised by 18 decimal places.
 */
const TOTAL_TOKENS = 12000000000 * (10 ** 18);

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
     * The tax recipient.
     */
    static get TAX_RECIPIENT ()
    {
        return '0x08b9c1ae682ad62119635b5c6044204971bf1575';
    }

    /**
     * Total tokens in Big Number.
     */
    static get INITIAL_SUPPLY ()
    {
        return new BigNumber(TOTAL_TOKENS.toString());
    }

    /**
     * Some amount that no one can have.
     */
    static get UNAVAILABLE_AMOUNT ()
    {
        return this.INITIAL_SUPPLY.add(1);
    }

    /**
     * All taxes.
     *
     * Initial tax: 0.9%
     */
    static get ALL_TAXES ()
    {
        return new BigNumber(9).mul(
            new BigNumber(10).pow(this.ALL_TAXES_SHIFT)
        );
    }

    /**
     * All taxes (shift value).
     *
     * Initial tax: 0.9%
     */
    static get ALL_TAXES_SHIFT ()
    {
        return new BigNumber(0);
    }
};