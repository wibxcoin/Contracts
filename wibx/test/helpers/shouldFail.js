/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

const { should } = require('./util');

/**
 * Checks if the promise is failing with the message.
 *
 * @param {Promise<any>} promise The promise
 * @param {string} message The message
 */
async function shouldFailWithMessage(promise, message)
{
    try
    {
        await promise;
    }
    catch (error)
    {
        error.message.should.include(message, 'Wrong failure type');
        return;
    }

    should().fail(`Expected '${message}' failure not received`);
}

module.exports = {
    /**
     * Check if it's failing reverting
     */
    reverting: async (promise) => await shouldFailWithMessage(
        promise,
        'revert'
    ),

    /**
     * Check if it's failing throwing
     */
    throwing: async (promise) => await shouldFailWithMessage(
        promise,
        'invalid opcode'
    ),

    /**
     * Check if it's failing outOfGas
     */
    outOfGas: async (promise) => await shouldFailWithMessage(
        promise,
        'out of gas'
    )
};
