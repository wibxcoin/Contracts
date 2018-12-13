/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

const WibxToken = artifacts.require('WibxToken');
const shouldFail = require('./helpers/shouldFail');
const expectEvent = require('./helpers/expectEvent');
const { applyTax } = require('./helpers/tax');
const { should } = require('./helpers/util');
const {
    INITIAL_SUPPLY,
    TAX_RECIPIENT
} = require('./helpers/constants');

/**
 * WibxToken BCH Management.
 *
 * Test BCH management features.
 */
contract('WibxToken: BCH Management', ([owner, recipient, anotherAccount, bchAddr]) =>
{
    should();
    let tokenInstance;

    beforeEach(async () =>
    {
        tokenInstance = await WibxToken.new(bchAddr);
    });

    it('should check the status of an unallowed address', async () =>
    {
        (await tokenInstance.isBchHandled(recipient)).should.be.false;
    });

    it('should allow some address to be manipulated by BCH', async () =>
    {
        await authorize();
    });

    it('should REVOKE some address to be manipulated by BCH', async () =>
    {
        await authorize();

        await tokenInstance.bchRevoke();

        (await tokenInstance.isBchHandled(owner)).should.be.false;
    });

    describe('should transfer value from a authorized BCH manipulated address', async () =>
    {
        const to = anotherAccount;
        const amount = INITIAL_SUPPLY;
        const taxes = applyTax(amount);
        const valueWithoutTaxes = amount.minus(taxes);

        beforeEach(async () =>
        {
            await authorize();
        });

        it('transfer value', async () =>
        {
            await tokenInstance.transferFrom(owner, to, amount, { from: bchAddr });

            (await tokenInstance.balanceOf(owner)).should.be.bignumber.equal(0);

            (await tokenInstance.balanceOf(to)).should.be.bignumber.equal(valueWithoutTaxes);
        });

        it('emits the transfer events', async () =>
        {
            const { logs } = await tokenInstance.transferFrom(owner, to, amount, { from: bchAddr });

            /**
             * The Foundation transaction
             */
            expectEvent.inLogs(logs, 'Transfer', {
                from: owner,
                to: TAX_RECIPIENT,
                value: taxes
            });

            /**
             * The user transaction
             */
            expectEvent.inLogs(logs, 'Transfer', {
                from: owner,
                to: to,
                value: valueWithoutTaxes
            });
        });
    });

    it('should not transfer value from a unauthorized BCH manipulated address', async () =>
    {
        await shouldFail.reverting(tokenInstance.transferFrom(
            owner, anotherAccount, INITIAL_SUPPLY, { from: bchAddr })
        );
    });

    /**
     * Authorize the BCH address manipulation
     */
    async function authorize ()
    {
        await tokenInstance.bchAuthorize();

        (await tokenInstance.isBchHandled(owner)).should.be.true;
    }
});