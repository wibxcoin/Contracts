/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

const { BN, expect, should } = require('openzeppelin-test-helpers');

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

    Object.keys(eventArgs)
        .forEach(key => contains(event.args, key, eventArgs[key]));

    should.exist(event);

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
    inLogs
};