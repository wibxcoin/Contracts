/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

const { BN, shouldFail } = require('openzeppelin-test-helpers');
const WibxToken = artifacts.require('WibxToken');
const { applyTax } = require('./helpers/tax');
const expectEvent = require('./helpers/expectEvent');
const {
    INITIAL_SUPPLY,
    ALL_TAXES,
    ALL_TAXES_SHIFT
} = require('./helpers/constants');

/**
 * WibxToken BCH batch transfer.
 *
 * Test BCH batch feature.
 */
contract('WibxToken: Taxable', ([owner, recipient, anotherAccount, bchAddr, taxRecipientAddr]) =>
{
    let tokenInstance;

    beforeEach(async () =>
    {
        tokenInstance = await WibxToken.new(bchAddr, taxRecipientAddr);
    });

    describe('Tax administration', () =>
    {
        const normalizedTaxShift = new BN(100).mul(new BN(10).pow(ALL_TAXES_SHIFT));

        it('should adminsitrator change the tax amount', async () =>
        {
            await changeTax(1, 0, owner);
        });

        it('should adminsitrator change the tax amount to the max', async () =>
        {
            await changeTax(3, 0, owner);
        });

        it('should adminsitrator change a fractional tax amount', async () =>
        {
            await changeTax(9, 1, owner);
        });

        it('should other user not change the tax amount', async () =>
        {
            await shouldFail.reverting(changeTax(1, 0, anotherAccount));
        });

        it('should administrator not change the tax amount greater than 3%', async () =>
        {
            await shouldFail.reverting(changeTax(400, 0));
        });

        it('should keep the tax information available for everyone', async () =>
        {
            const from = { from: anotherAccount };

            (await tokenInstance.currentTaxAmount(from)).should.be.bignumber.equal(
                ALL_TAXES
            );

            (await tokenInstance.currentTaxShift(from)).should.be.bignumber.equal(
                normalizedTaxShift
            );
        });

        it('should start the tax information with default values', async () =>
        {
            (await tokenInstance.currentTaxAmount()).should.be.bignumber.equal(
                ALL_TAXES
            );

            (await tokenInstance.currentTaxShift()).should.be.bignumber.equal(
                normalizedTaxShift
            );
        });
    });

    describe('Dynamic tax transference', () =>
    {
        const amount = INITIAL_SUPPLY;
        const to = recipient;

        it('emits a transfer event with the default tax value', async () =>
        {
            const taxes = applyTax(amount, ALL_TAXES_SHIFT);
            const valueWithoutTaxes = amount.sub(taxes);
            const { logs } = await tokenInstance.transfer(to, amount, { from: owner });

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
                value: valueWithoutTaxes
            });
        });

        it('emits a transfer event with a changed tax value', async () =>
        {
            const taxContainer = {
                amount: new BN(3),
                shift: new BN(0)
            };
            const taxes = applyTax(amount, taxContainer.shift, taxContainer.amount);
            const valueWithoutTaxes = amount.sub(taxes);

            await changeTax(taxContainer.amount, taxContainer.shift);
            const { logs } = await tokenInstance.transfer(to, amount, { from: owner });

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
                value: valueWithoutTaxes
            });
        });
    });

    /**
     * Change the global tax
     *
     * @param {number} amount The new amount
     * @param {number} shift The decimal places shift
     * @param {string} from From account
     */
    async function changeTax (amount, shift, from)
    {
        const changeTaxArgs = [ amount, shift ];

        if (from)
        {
            changeTaxArgs.push({ from });
        }

        await tokenInstance.changeTax(...changeTaxArgs);

        (await tokenInstance.currentTaxAmount()).should.be.bignumber.equal(new BN(amount));
    }
});