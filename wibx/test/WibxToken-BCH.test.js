/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

const { shouldFail } = require('openzeppelin-test-helpers');
const WibxToken = artifacts.require('WibxToken');
const { applyTax } = require('./helpers/tax');
const expectEvent = require('./helpers/expectEvent');
const {
    INITIAL_SUPPLY,
    TRANSFER_TEST_AMOUNT,
    ALL_TAXES_SHIFT
} = require('./helpers/constants');

/**
 * WibxToken BCH Management.
 *
 * Test BCH management features.
 */
contract('WibxToken: BCH Management', ([owner, recipient, anotherAccount, bchAddr, taxRecipientAddr]) =>
{
    let tokenInstance;

    beforeEach(async () =>
    {
        tokenInstance = await WibxToken.new(bchAddr, taxRecipientAddr);
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

        const { logs } = await tokenInstance.bchRevoke({ from: owner });

        (await tokenInstance.isBchHandled(owner)).should.be.false;

        expectEvent.inLogs(logs, 'BchApproval', {
            to: owner,
            state: false
        });
    });

    describe('should transfer value from a authorized BCH manipulated address', async () =>
    {
        const to = anotherAccount;
        const amount = TRANSFER_TEST_AMOUNT;
        const taxes = applyTax(amount, ALL_TAXES_SHIFT);

        beforeEach(async () =>
        {
            await authorize();
        });

        it('transfer value', async () =>
        {
            await tokenInstance.transferFrom(owner, to, amount, { from: bchAddr });

            (await tokenInstance.balanceOf(owner)).should.be.bignumber.equal(INITIAL_SUPPLY.sub(amount).sub(taxes));

            (await tokenInstance.balanceOf(to)).should.be.bignumber.equal(amount);
        });

        it('emits the transfer events', async () =>
        {
            const { logs } = await tokenInstance.transferFrom(owner, to, amount, { from: bchAddr });

            /**
             * The Foundation transaction
             */
            expectEvent.inLogs(logs, 'Transfer', {
                from: owner,
                to: taxRecipientAddr,
                value: taxes
            });

            /**
             * The user transaction
             */
            expectEvent.inLogs(logs, 'Transfer', {
                from: owner,
                to: to,
                value: amount
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
        const { logs } = await tokenInstance.bchAuthorize({ from: owner });

        (await tokenInstance.isBchHandled(owner)).should.be.true;

        expectEvent.inLogs(logs, 'BchApproval', {
            to: owner,
            state: true
        });
    }
});