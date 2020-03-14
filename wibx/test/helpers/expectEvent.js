/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

const { BN } = require('openzeppelin-test-helpers');
const { expect } = require('./chai');

/**
 * Fail if some exception is not received.
 *
 * @param {Promise<any>} promise The promise to run
 */
async function exception (promise)
{
    try
    {
        await promise;
    }
    catch (e)
    {
        return;
    }

    expect.fail('Expected an exception but none was received');
}

/**
 * Checks if some event is in the log.
 *
 * @param {any} logs The event log
 * @param {string} eventName The event name
 * @param {any} eventArgs The event args
 */
function inLogs (logs, eventName, eventArgs = {})
{
    const event = logs.find(
        e => e.event === eventName && e.args.to === eventArgs.to
    );

    if (!event)
    {
        throw new Error(`Event ${eventName} not found!`);
    }

    Object.keys(eventArgs)
        .forEach(key => contains(event.args, key, eventArgs[key]));

    return event;
}

/**
 * Checks if the event matches with the log.
 *
 * @param {any} args Log args
 * @param {string} key Event key
 * @param {string} value Event value
 */
function contains (args, key, value)
{
    (key in args).should.equal(true, `Unknown event argument '${key}'`);

    if (value === null)
    {
        expect(args[key]).to.equal(null);
    }
    else if (isBN(args[key]))
    {
        expect(args[key]).to.be.bignumber.equal(value);
    }
    else
    {
        expect(args[key]).to.be.equal(value);
    }
}

/**
 * Checks if the object is a BigNumber
 *
 * @param {any} object The object to test
 */
function isBN (object)
{
    return BN.isBN(object) || object instanceof BN;
}

module.exports = {
    inLogs,
    exception
};