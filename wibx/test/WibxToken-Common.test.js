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
    ZERO_ADDRESS,
    INITIAL_SUPPLY,
    UNAVAILABLE_AMOUNT,
    TAX_RECIPIENT
} = require('./helpers/constants');

/**
 * WibxToken Principal EC20 Functionalities.
 *
 * Originally based on code by OpenZeppelin:
 * https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/test/token/ERC20/ERC20.test.js
 */
contract('WibxToken: Common ERC20 Functionalities', ([owner, recipient, anotherAccount, bchAddr]) =>
{
    should();
    let tokenInstance;

    beforeEach(async () =>
    {
        tokenInstance = await WibxToken.new(bchAddr);
    });

    describe('total supply', () =>
    {
        it('returns the total amount of tokens', async () =>
        {
            (await tokenInstance.totalSupply()).should.be.bignumber.equal(INITIAL_SUPPLY);
        });
    });

    describe('balanceOf', () =>
    {
        describe('when the requested account has no tokens', () =>
        {
            it('returns zero', async () =>
            {
                (await tokenInstance.balanceOf(anotherAccount)).should.be.bignumber.equal(0);
            });
        });

        describe('when the requested account has some tokens', () =>
        {
            it('returns the total amount of tokens', async () =>
            {
                (await tokenInstance.balanceOf(owner)).should.be.bignumber.equal(INITIAL_SUPPLY);
            });
        });
    });

    describe('transfer', () =>
    {
        describe('when the recipient is not the zero address', () =>
        {
            const to = recipient;

            describe('when the sender does not have enough balance', () =>
            {
                const amount = UNAVAILABLE_AMOUNT;

                it('reverts', async () =>
                {
                    await shouldFail.reverting(tokenInstance.transfer(to, amount, { from: owner }));
                });
            });

            describe('when the sender has enough balance', () =>
            {
                const amount = INITIAL_SUPPLY;
                const taxes = applyTax(amount);
                const valueWithoutTaxes = amount.minus(taxes);

                it('transfers the requested amount', async () =>
                {
                    await tokenInstance.transfer(to, amount, { from: owner });

                    (await tokenInstance.balanceOf(owner)).should.be.bignumber.equal(0);

                    (await tokenInstance.balanceOf(to)).should.be.bignumber.equal(valueWithoutTaxes);
                });

                it('emits a transfer event', async () =>
                {
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
        });

        describe('when the recipient is the zero address', () =>
        {
            const to = ZERO_ADDRESS;

            it('reverts', async () =>
            {
                await shouldFail.reverting(tokenInstance.transfer(to, INITIAL_SUPPLY, { from: owner }));
            });
        });
    });

    describe('approve', () =>
    {
        describe('when the spender is not the zero address', () =>
        {
            const spender = recipient;

            describe('when the sender has enough balance', () =>
            {
                const amount = INITIAL_SUPPLY;

                it('emits an approval event', async () =>
                {
                    const { logs } = await tokenInstance.approve(spender, amount, { from: owner });

                    expectEvent.inLogs(logs, 'Approval', {
                        owner: owner,
                        spender: spender,
                        value: amount
                    });
                });

                describe('when there was no approved amount before', () =>
                {
                    it('approves the requested amount', async () =>
                    {
                        await tokenInstance.approve(spender, amount, { from: owner });

                        (await tokenInstance.allowance(owner, spender)).should.be.bignumber.equal(amount);
                    });
                });

                describe('when the spender had an approved amount', () =>
                {
                    beforeEach(async () =>
                    {
                        await tokenInstance.approve(spender, 1, { from: owner });
                    });

                    it('approves the requested amount and replaces the previous one', async () =>
                    {
                        await tokenInstance.approve(spender, amount, { from: owner });

                        (await tokenInstance.allowance(owner, spender)).should.be.bignumber.equal(amount);
                    });
                });
            });

            describe('when the sender does not have enough balance', () =>
            {
                const amount = UNAVAILABLE_AMOUNT;

                it('emits an approval event', async () =>
                {
                    const { logs } = await tokenInstance.approve(spender, amount, { from: owner });

                    expectEvent.inLogs(logs, 'Approval', {
                        owner: owner,
                        spender: spender,
                        value: amount
                    });
                });

                describe('when there was no approved amount before', () =>
                {
                    it('approves the requested amount', async () =>
                    {
                        await tokenInstance.approve(spender, amount, { from: owner });

                        (await tokenInstance.allowance(owner, spender)).should.be.bignumber.equal(amount);
                    });
                });

                describe('when the spender had an approved amount', () =>
                {
                    beforeEach(async () =>
                    {
                        await tokenInstance.approve(spender, 1, { from: owner });
                    });

                    it('approves the requested amount and replaces the previous one', async () =>
                    {
                        await tokenInstance.approve(spender, amount, { from: owner });

                        (await tokenInstance.allowance(owner, spender)).should.be.bignumber.equal(amount);
                    });
                });
            });
        });

        describe('when the spender is the zero address', () =>
        {
            const amount = INITIAL_SUPPLY;
            const spender = ZERO_ADDRESS;

            it('reverts', async () =>
            {
                await shouldFail.reverting(tokenInstance.approve(spender, amount, { from: owner }));
            });
        });
    });

    describe('transfer from', () =>
    {
        const spender = recipient;

        describe('when the recipient is not the zero address', () =>
        {
            const to = anotherAccount;

            describe('when the spender has enough approved balance', () =>
            {
                beforeEach(async () =>
                {
                    await tokenInstance.approve(spender, INITIAL_SUPPLY, { from: owner });
                });

                describe('when the owner has enough balance', () =>
                {
                    const amount = INITIAL_SUPPLY;
                    const taxes = applyTax(amount);
                    const valueWithoutTaxes = amount.minus(taxes);

                    it('transfers the requested amount', async () =>
                    {
                        await tokenInstance.transferFrom(owner, to, amount, { from: spender });

                        (await tokenInstance.balanceOf(owner)).should.be.bignumber.equal(0);

                        (await tokenInstance.balanceOf(to)).should.be.bignumber.equal(valueWithoutTaxes);
                    });

                    it('decreases the spender allowance', async () =>
                    {
                        await tokenInstance.transferFrom(owner, to, amount, { from: spender });

                        (await tokenInstance.allowance(owner, spender)).should.be.bignumber.equal(0);
                    });

                    it('emits a transfer event', async () =>
                    {
                        const { logs } = await tokenInstance.transferFrom(owner, to, amount, { from: spender });

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

                describe('when the owner does not have enough balance', () =>
                {
                    const amount = UNAVAILABLE_AMOUNT;

                    it('reverts', async () =>
                    {
                        await shouldFail.reverting(tokenInstance.transferFrom(owner, to, amount, { from: spender }));
                    });
                });
            });

            describe('when the spender does not have enough approved balance', () =>
            {
                beforeEach(async () =>
                {
                    await tokenInstance.approve(spender, INITIAL_SUPPLY.minus(1), { from: owner });
                });

                describe('when the owner has enough balance', () =>
                {
                    const amount = INITIAL_SUPPLY;

                    it('reverts', async () =>
                    {
                        await shouldFail.reverting(tokenInstance.transferFrom(owner, to, amount, { from: spender }));
                    });
                });

                describe('when the owner does not have enough balance', () =>
                {
                    const amount = UNAVAILABLE_AMOUNT;

                    it('reverts', async () =>
                    {
                        await shouldFail.reverting(tokenInstance.transferFrom(owner, to, amount, { from: spender }));
                    });
                });
            });
        });

        describe('when the recipient is the zero address', () =>
        {
            const amount = INITIAL_SUPPLY;
            const to = ZERO_ADDRESS;

            beforeEach(async () =>
            {
                await tokenInstance.approve(spender, amount, { from: owner });
            });

            it('reverts', async () =>
            {
                await shouldFail.reverting(tokenInstance.transferFrom(owner, to, amount, { from: spender }));
            });
        });
    });

    describe('decrease allowance', () =>
    {
        describe('when the spender is not the zero address', () =>
        {
            const spender = recipient;

            function shouldDecreaseApproval (amount)
            {
                describe('when there was no approved amount before', () =>
                {
                    it('reverts', async () =>
                    {
                        await shouldFail.reverting(tokenInstance.decreaseAllowance(spender, amount, { from: owner }));
                    });
                });

                describe('when the spender had an approved amount', () =>
                {
                    const approvedAmount = amount;

                    beforeEach(async () =>
                    {
                        ({ logs: this.logs } = await tokenInstance.approve(spender, approvedAmount, { from: owner }));
                    });

                    it('emits an approval event', async () =>
                    {
                        const { logs } = await tokenInstance.decreaseAllowance(
                            spender, approvedAmount, { from: owner }
                        );

                        expectEvent.inLogs(logs, 'Approval', {
                            owner: owner,
                            spender: spender,
                            value: 0
                        });
                    });

                    it('decreases the spender allowance subtracting the requested amount', async () =>
                    {
                        await tokenInstance.decreaseAllowance(spender, approvedAmount.minus(1), { from: owner });

                        (await tokenInstance.allowance(owner, spender)).should.be.bignumber.equal(1);
                    });

                    it('sets the allowance to zero when all allowance is removed', async () =>
                    {
                        await tokenInstance.decreaseAllowance(spender, approvedAmount, { from: owner });

                        (await tokenInstance.allowance(owner, spender)).should.be.bignumber.equal(0);
                    });

                    it('reverts when more than the full allowance is removed', async () =>
                    {
                        await shouldFail.reverting(tokenInstance.decreaseAllowance(
                            spender, approvedAmount.plus(1), { from: owner })
                        );
                    });
                });
            }

            describe('when the sender has enough balance', () =>
            {
                shouldDecreaseApproval(INITIAL_SUPPLY);
            });

            describe('when the sender does not have enough balance', () =>
            {
                shouldDecreaseApproval(UNAVAILABLE_AMOUNT);
            });
        });

        describe('when the spender is the zero address', () =>
        {
            const amount = INITIAL_SUPPLY;
            const spender = ZERO_ADDRESS;

            it('reverts', async () =>
            {
                await shouldFail.reverting(tokenInstance.decreaseAllowance(spender, amount, { from: owner }));
            });
        });
    });

    describe('increase allowance', () =>
    {
        const amount = INITIAL_SUPPLY;

        describe('when the spender is not the zero address', () =>
        {
            const spender = recipient;

            describe('when the sender has enough balance', () =>
            {
                it('emits an approval event', async () =>
                {
                    const { logs } = await tokenInstance.increaseAllowance(spender, amount, { from: owner });

                    expectEvent.inLogs(logs, 'Approval', {
                        owner: owner,
                        spender: spender,
                        value: amount
                    });
                });

                describe('when there was no approved amount before', () =>
                {
                    it('approves the requested amount', async () =>
                    {
                        await tokenInstance.increaseAllowance(spender, amount, { from: owner });

                        (await tokenInstance.allowance(owner, spender)).should.be.bignumber.equal(amount);
                    });
                });

                describe('when the spender had an approved amount', () =>
                {
                    beforeEach(async () =>
                    {
                        await tokenInstance.approve(spender, 1, { from: owner });
                    });

                    it('increases the spender allowance adding the requested amount', async () =>
                    {
                        await tokenInstance.increaseAllowance(spender, amount, { from: owner });

                        (await tokenInstance.allowance(owner, spender)).should.be.bignumber.equal(amount.add(1));
                    });
                });
            });

            describe('when the sender does not have enough balance', () =>
            {
                const amount = UNAVAILABLE_AMOUNT;

                it('emits an approval event', async () =>
                {
                    const { logs } = await tokenInstance.increaseAllowance(spender, amount, { from: owner });

                    expectEvent.inLogs(logs, 'Approval', {
                        owner: owner,
                        spender: spender,
                        value: amount
                    });
                });

                describe('when there was no approved amount before', () =>
                {
                    it('approves the requested amount', async () =>
                    {
                        await tokenInstance.increaseAllowance(spender, amount, { from: owner });

                        (await tokenInstance.allowance(owner, spender)).should.be.bignumber.equal(amount);
                    });
                });

                describe('when the spender had an approved amount', () =>
                {
                    beforeEach(async () =>
                    {
                        await tokenInstance.approve(spender, 1, { from: owner });
                    });

                    it('increases the spender allowance adding the requested amount', async () =>
                    {
                        await tokenInstance.increaseAllowance(spender, amount, { from: owner });

                        (await tokenInstance.allowance(owner, spender)).should.be.bignumber.equal(amount.add(1));
                    });
                });
            });
        });

        describe('when the spender is the zero address', () =>
        {
            const spender = ZERO_ADDRESS;

            it('reverts', async () =>
            {
                await shouldFail.reverting(tokenInstance.increaseAllowance(spender, amount, { from: owner }));
            });
        });
    });
});