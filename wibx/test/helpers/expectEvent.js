/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

const BigNumber = web3.BigNumber;
const should = require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();

/**
 * Checks if some event is in the log.
 *
 * @param {any} logs The event log
 * @param {string} eventName The event name
 * @param {any} eventArgs The event args
 */
function inLogs(logs, eventName, eventArgs = {})
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
function contains(args, key, value)
{
    if (isBigNumber(args[key]))
    {
        args[key].should.be.bignumber.equal(value);

        return;
    }

    args[key].should.be.equal(value);
}

/**
 * Checks if the object is a BigNumber
 *
 * @param {any} object The object to test
 */
function isBigNumber(object)
{
    return object.isBigNumber
        || object instanceof BigNumber
        || (object.constructor && object.constructor.name === 'BigNumber');
}

module.exports = {
    inLogs
};