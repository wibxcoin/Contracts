/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */
const { BN } = require('openzeppelin-test-helpers');
const { ALL_TAXES } = require('./constants');

/**
 * Apply the WiBX token takes to given value.
 *
 * @param {BN} value Transaction value
 * @param {BN} taxDecimals Tax number shift
 * @param {BN} taxAmount The tax amount
 */
function applyTax (value, taxDecimals = 0, taxAmount = ALL_TAXES)
{
    const normalizedTaxAmount = new BN(100).mul(new BN(10 ** taxDecimals));
    const temp = value.mul(taxAmount);

    return temp.div(normalizedTaxAmount);
}

module.exports = {
    applyTax
};