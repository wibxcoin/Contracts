/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */
const { ALL_TAXES } = require('./constants');

/**
 * Apply the WiBX token takes to given value.
 *
 * @param {BigNumber} value
 * @param {BigNumber} taxDecimals
 */
function applyTax (value, taxDecimals = 0)
{
    const normalizedTaxAmount = ALL_TAXES.mul(10 ** taxDecimals);
    const temp = value.mul(normalizedTaxAmount);

    return temp.div(100);
}

module.exports = {
    applyTax
};