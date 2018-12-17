/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */
const { ALL_TAXES } = require('./constants');

/**
 * Apply the WiBX token takes to given value.
 *
 * @param {BigNumber} value Transaction value
 * @param {BigNumber} taxDecimals Tax number shift
 * @param {BigNumber} taxAmount The tax amount
 */
function applyTax (value, taxDecimals = 0, taxAmount = ALL_TAXES)
{
    const normalizedTaxAmount = taxAmount.mul(10 ** taxDecimals);
    const temp = value.mul(normalizedTaxAmount);

    return temp.div(100);
}

module.exports = {
    applyTax
};