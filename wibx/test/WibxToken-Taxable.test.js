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
    TAX_RECIPIENT,
    ALL_TAXES,
    ALL_TAXES_SHIFT
} = require('./helpers/constants');
const BigNumber = web3.BigNumber;

/**
 * WibxToken BCH batch transfer.
 *
 * Test BCH batch feature.
 */
contract('WibxToken: Taxable', ([owner, recipient, anotherAccount, bchAddr]) =>
{
    should();
    let tokenInstance;

    beforeEach(async () =>
    {
        tokenInstance = await WibxToken.new(bchAddr);
    });

    describe('Tax administration', () =>
    {
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
            await shouldFail.reverting(changeTax(4, 0));
        });

        it('should administrator not change the tax amount sift greater than 5 decimals', async () =>
        {
            await shouldFail.reverting(changeTax(1, 6));
        });

        it('should keep the tax information available for everyone', async () =>
        {
            const from = { from: anotherAccount };

            (await tokenInstance.currentTaxAmount(from)).should.be.bignumber.equal(
                ALL_TAXES.div(10 ** ALL_TAXES_SHIFT)
            );
            (await tokenInstance.currentTaxShift(from)).should.be.bignumber.equal(ALL_TAXES_SHIFT);
        });

        it('should start the tax information with default values', async () =>
        {
            (await tokenInstance.currentTaxAmount()).should.be.bignumber.equal(
                ALL_TAXES.div(10 ** ALL_TAXES_SHIFT)
            );
            (await tokenInstance.currentTaxShift()).should.be.bignumber.equal(ALL_TAXES_SHIFT);
        });
    });

    describe('Dynamic tax transference', () =>
    {
        const amount = INITIAL_SUPPLY;
        const to = recipient;

        it('emits a transfer event with the default tax value', async () =>
        {
            const taxes = applyTax(amount);
            const valueWithoutTaxes = amount.minus(taxes);
            const { logs } = await tokenInstance.transfer(to, amount, { from: owner });

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

        it('emits a transfer event with a changed tax value', async () =>
        {
            const taxContainer = {
                amount: new BigNumber(3),
                shift: new BigNumber(0)
            };
            const taxes = applyTax(amount, taxContainer.shift, taxContainer.amount);
            const valueWithoutTaxes = amount.minus(taxes);

            await changeTax(taxContainer.amount, taxContainer.shift);
            const { logs } = await tokenInstance.transfer(to, amount, { from: owner });

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

    /**
     * Change the global tax
     *
     * @param {number} amount The new amount
     * @param {number} shift Decimal places to shift
     * @param {string} from From account
     */
    async function changeTax (amount, shift, from)
    {
        await tokenInstance.changeTax(amount, shift, from ? { from } : undefined);

        (await tokenInstance.currentTaxAmount()).should.be.bignumber.equal(amount);
        (await tokenInstance.currentTaxShift()).should.be.bignumber.equal(shift);
    }
});