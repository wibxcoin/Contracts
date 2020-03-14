/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

const { BN, expectRevert } = require('openzeppelin-test-helpers');
const WibxToken = artifacts.require('WibxToken');
const { applyTax } = require('./helpers/tax');
const expectEvent = require('./helpers/expectEvent');
const {
    ZERO_ADDRESS,
    INITIAL_SUPPLY,
    TRANSFER_TEST_AMOUNT,
    UNAVAILABLE_AMOUNT,
    ALL_TAXES_SHIFT
} = require('./helpers/constants');

/**
 * WibxToken Principal EC20 Functionalities.
 *
 * Originally based on code by OpenZeppelin:
 * https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/test/token/ERC20/ERC20.test.js
 */
contract('WibxToken: Common ERC20 Functionalities', ([owner, recipient, anotherAccount, bchAddr, taxRecipientAddr, boardAccount, burner]) =>
{
    let tokenInstance;

    beforeEach(async () =>
    {
        tokenInstance = await WibxToken.new(bchAddr, taxRecipientAddr);
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
                (await tokenInstance.balanceOf(anotherAccount)).should.be.bignumber.equal(new BN(0));
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
                    await expectRevert.unspecified(tokenInstance.transfer(to, amount, { from: owner }));
                });
            });

            describe('when the sender has enough balance', () =>
            {
                const amount = TRANSFER_TEST_AMOUNT;
                const taxes = applyTax(amount, ALL_TAXES_SHIFT);

                it('transfers the requested amount', async () =>
                {
                    await tokenInstance.transfer(to, amount, { from: owner });

                    (await tokenInstance.balanceOf(owner)).should.be.bignumber.equal(INITIAL_SUPPLY.sub(amount).sub(taxes));

                    (await tokenInstance.balanceOf(to)).should.be.bignumber.equal(amount);
                });

                it('should transfer the full value from the tax recipient address', async () =>
                {
                    // Transfer the value to some wallet
                    await tokenInstance.transfer(to, amount, { from: owner });

                    // Check the tax amount in the tax addr recipient
                    (await tokenInstance.balanceOf(taxRecipientAddr)).should.be.bignumber.equal(taxes);

                    // Transfer for some other wallet
                    await tokenInstance.transfer(boardAccount, taxes, { from: taxRecipientAddr });

                    // Final check
                    (await tokenInstance.balanceOf(boardAccount)).should.be.bignumber.equal(taxes);
                    (await tokenInstance.balanceOf(taxRecipientAddr)).should.be.bignumber.equal(new BN(0));
                });

                it('emits a transfer event', async () =>
                {
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
                        value: amount
                    });
                });
            });
        });

        describe('when the recipient is the zero address', () =>
        {
            const to = ZERO_ADDRESS;

            it('reverts', async () =>
            {
                await expectRevert.unspecified(tokenInstance.transfer(to, INITIAL_SUPPLY, { from: owner }));
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
                await expectRevert.unspecified(tokenInstance.approve(spender, amount, { from: owner }));
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
                    const amount = TRANSFER_TEST_AMOUNT;
                    const taxes = applyTax(amount, ALL_TAXES_SHIFT);

                    it('transfers the requested amount', async () =>
                    {
                        await tokenInstance.transferFrom(owner, to, amount, { from: spender });

                        (await tokenInstance.balanceOf(owner)).should.be.bignumber.equal(INITIAL_SUPPLY.sub(amount).sub(taxes));

                        (await tokenInstance.balanceOf(to)).should.be.bignumber.equal(amount);
                    });

                    it('decreases the spender allowance', async () =>
                    {
                        await tokenInstance.transferFrom(owner, to, amount, { from: spender });

                        (await tokenInstance.allowance(owner, spender)).should.be.bignumber.equal(INITIAL_SUPPLY.sub(amount).sub(taxes));
                    });

                    it('should transfer the full value from the tax recipient address', async () =>
                    {
                        // Approve spender to manipulate the TAX wallet
                        await tokenInstance.approve(spender, taxes, { from: taxRecipientAddr });

                        // Transfer the value to some wallet
                        await tokenInstance.transferFrom(owner, to, amount, { from: spender });

                        // Check the tax amount in the tax addr recipient
                        (await tokenInstance.balanceOf(taxRecipientAddr)).should.be.bignumber.equal(taxes);

                        // Transfer to some other wallet
                        await tokenInstance.transferFrom(taxRecipientAddr, boardAccount, taxes, { from: spender });

                        // Final check
                        (await tokenInstance.balanceOf(boardAccount)).should.be.bignumber.equal(taxes);
                        (await tokenInstance.balanceOf(taxRecipientAddr)).should.be.bignumber.equal(new BN(0));
                    });

                    it('emits a transfer event', async () =>
                    {
                        const { logs } = await tokenInstance.transferFrom(owner, to, amount, { from: spender });

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

                describe('when the owner does not have enough balance', () =>
                {
                    const amount = UNAVAILABLE_AMOUNT;

                    it('reverts', async () =>
                    {
                        await expectRevert.unspecified(tokenInstance.transferFrom(owner, to, amount, { from: spender }));
                    });
                });
            });

            describe('when the spender does not have enough approved balance', () =>
            {
                beforeEach(async () =>
                {
                    await tokenInstance.approve(spender, INITIAL_SUPPLY.sub(new BN(1)), { from: owner });
                });

                describe('when the owner has enough balance', () =>
                {
                    const amount = INITIAL_SUPPLY;

                    it('reverts', async () =>
                    {
                        await expectRevert.unspecified(tokenInstance.transferFrom(owner, to, amount, { from: spender }));
                    });
                });

                describe('when the owner does not have enough balance', () =>
                {
                    const amount = UNAVAILABLE_AMOUNT;

                    it('reverts', async () =>
                    {
                        await expectRevert.unspecified(tokenInstance.transferFrom(owner, to, amount, { from: spender }));
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
                await expectRevert.unspecified(tokenInstance.transferFrom(owner, to, amount, { from: spender }));
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
                        await expectRevert.unspecified(tokenInstance.decreaseAllowance(spender, amount, { from: owner }));
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
                            value: new BN(0)
                        });
                    });

                    it('decreases the spender allowance subtracting the requested amount', async () =>
                    {
                        await tokenInstance.decreaseAllowance(spender, approvedAmount.sub(new BN(1)), { from: owner });

                        (await tokenInstance.allowance(owner, spender)).should.be.bignumber.equal(new BN(1));
                    });

                    it('sets the allowance to zero when all allowance is removed', async () =>
                    {
                        await tokenInstance.decreaseAllowance(spender, approvedAmount, { from: owner });

                        (await tokenInstance.allowance(owner, spender)).should.be.bignumber.equal(new BN(0));
                    });

                    it('reverts when more than the full allowance is removed', async () =>
                    {
                        await expectRevert.unspecified(tokenInstance.decreaseAllowance(
                            spender, approvedAmount.add(new BN(1)), { from: owner })
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
                await expectRevert.unspecified(tokenInstance.decreaseAllowance(spender, amount, { from: owner }));
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

                        (await tokenInstance.allowance(owner, spender)).should.be.bignumber.equal(
                            amount.add(new BN(1))
                        );
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

                        (await tokenInstance.allowance(owner, spender)).should.be.bignumber.equal(
                            amount.add(new BN(1))
                        );
                    });
                });
            });
        });

        describe('when the spender is the zero address', () =>
        {
            const spender = ZERO_ADDRESS;

            it('reverts', async () =>
            {
                await expectRevert.unspecified(tokenInstance.increaseAllowance(spender, amount, { from: owner }));
            });
        });
    });

    describe('burn', function ()
    {
        describe('when the given amount is not greater than balance of the sender', function ()
        {
            context('for a zero amount', function ()
            {
                shouldBurn(new BN(0));
            });

            context('for a non-zero amount', function ()
            {
                shouldBurn(TRANSFER_TEST_AMOUNT);
            });

            function shouldBurn (amount)
            {
                beforeEach(async function ()
                {
                    ({ logs: this.logs } = await tokenInstance.burn(amount, { from: owner }));
                });

                it('burns the requested amount', async function ()
                {
                    (await tokenInstance.balanceOf(owner)).should.be.bignumber.equal(INITIAL_SUPPLY.sub(amount));
                });

                it('emits a transfer event', async function ()
                {
                    expectEvent.inLogs(this.logs, 'Transfer', {
                        from: owner,
                        to: ZERO_ADDRESS,
                        value: amount
                    });
                });
            }
        });

        describe('when the given amount is greater than the balance of the sender', function ()
        {
            const amount = INITIAL_SUPPLY.addn(1);

            it('reverts', async function ()
            {
                await expectRevert.unspecified(tokenInstance.burn(amount, { from: owner }));
            });
        });
    });

    describe('burnFrom', function ()
    {
        describe('on success', function ()
        {
            context('for a zero amount', function ()
            {
                shouldBurnFrom(new BN(0));
            });

            context('for a non-zero amount', function ()
            {
                shouldBurnFrom(TRANSFER_TEST_AMOUNT);
            });

            function shouldBurnFrom (amount)
            {
                const originalAllowance = amount.muln(3);

                beforeEach(async function ()
                {
                    await tokenInstance.approve(burner, originalAllowance, { from: owner });
                    const { logs } = await tokenInstance.burnFrom(owner, amount, { from: burner });
                    this.logs = logs;
                });

                it('burns the requested amount', async function ()
                {
                    (await tokenInstance.balanceOf(owner)).should.be.bignumber.equal(INITIAL_SUPPLY.sub(amount));
                });

                it('decrements allowance', async function ()
                {
                    (await tokenInstance.allowance(owner, burner)).should.be.bignumber.equal(originalAllowance.sub(amount));
                });

                it('emits a transfer event', async function ()
                {
                    expectEvent.inLogs(this.logs, 'Transfer', {
                        from: owner,
                        to: ZERO_ADDRESS,
                        value: amount
                    });
                });
            }
        });

        describe('when the given amount is greater than the balance of the sender', function ()
        {
            const amount = INITIAL_SUPPLY.addn(1);

            it('reverts', async function ()
            {
                await tokenInstance.approve(burner, amount, { from: owner });
                await expectRevert.unspecified(tokenInstance.burnFrom(owner, amount, { from: burner }));
            });
        });

        describe('when the given amount is greater than the allowance', function ()
        {
            const allowance = TRANSFER_TEST_AMOUNT;

            it('reverts', async function ()
            {
                await tokenInstance.approve(burner, allowance, { from: owner });
                await expectRevert.unspecified(tokenInstance.burnFrom(owner, allowance.addn(1), { from: burner }));
            });
        });
    });

    describe('Pausable', function ()
    {
        context('when unpaused', function ()
        {
            beforeEach(async function ()
            {
                expect(await tokenInstance.paused()).to.equal(false);
            });

            describe('pausing', function ()
            {
                it('is pausable by the pauser', async function ()
                {
                    await tokenInstance.pause({ from: owner });
                    expect(await tokenInstance.paused()).to.equal(true);
                });

                it('reverts when pausing from non-pauser', async function ()
                {
                    await expectRevert.unspecified(tokenInstance.pause({ from: anotherAccount }),
                        'PauserRole: caller does not have the Pauser role'
                    );
                });

                context('when paused', function ()
                {
                    beforeEach(async function ()
                    {
                        ({ logs: this.logs } = await tokenInstance.pause({ from: owner }));
                    });

                    it('emits a Paused event', function ()
                    {
                        expectEvent.inLogs(this.logs, 'Paused', { account: owner });
                    });

                    it('cannot perform transfer in pause', async function ()
                    {
                        await expectRevert.unspecified(
                            tokenInstance.transfer(anotherAccount, '1', { from: owner }),
                            'Pausable: paused'
                        );
                    });

                    it('cannot perform transferFrom in pause', async function ()
                    {
                        await expectRevert.unspecified(
                            tokenInstance.transferFrom(owner, anotherAccount, '1', { from: owner }),
                            'Pausable: paused'
                        );
                    });

                    it('cannot perform transferBatch in pause', async function ()
                    {
                        await expectRevert.unspecified(
                            tokenInstance.sendBatch(
                                [recipient, anotherAccount],
                                ['1', '1'],
                                owner,
                                { from: owner }
                            ),
                            'Pausable: paused'
                        );
                    });

                    it('reverts when re-pausing', async function ()
                    {
                        await expectRevert.unspecified(tokenInstance.pause({ from: owner }), 'Pausable: paused');
                    });

                    describe('unpausing', function ()
                    {
                        it('is unpausable by the pauser', async function ()
                        {
                            await tokenInstance.unpause({ from: owner });
                            expect(await tokenInstance.paused()).to.equal(false);
                        });

                        it('reverts when unpausing from non-pauser', async function ()
                        {
                            await expectRevert.unspecified(tokenInstance.unpause({ from: anotherAccount }),
                                'PauserRole: caller does not have the Pauser role'
                            );
                        });

                        context('when unpaused', function ()
                        {
                            beforeEach(async function ()
                            {
                                ({ logs: this.logs } = await tokenInstance.unpause({ from: owner }));
                            });

                            it('emits an Unpaused event', function ()
                            {
                                expectEvent.inLogs(this.logs, 'Unpaused', { account: owner });
                            });

                            it('should resume allowing transfer', async function ()
                            {
                                await tokenInstance.transfer(anotherAccount, '1', { from: owner });
                                (await tokenInstance.balanceOf(anotherAccount)).should.be.bignumber.equal(new BN(1));
                            });

                            it('should resume allowing transferFrom', async function ()
                            {
                                await tokenInstance.bchAuthorize({ from: recipient });
                                await tokenInstance.transfer(recipient, '100000000000000000000', { from: owner });

                                await tokenInstance.transferFrom(recipient, anotherAccount, '1', { from: bchAddr });

                                (await tokenInstance.balanceOf(anotherAccount)).should.be.bignumber.equal(new BN(1));
                            });

                            it('should resume allowing transferBatch', async function ()
                            {
                                tokenInstance.sendBatch(
                                    [recipient, anotherAccount],
                                    ['1', '1'],
                                    owner,
                                    { from: owner }
                                );

                                (await tokenInstance.balanceOf(recipient)).should.be.bignumber.equal(new BN(1));
                                (await tokenInstance.balanceOf(anotherAccount)).should.be.bignumber.equal(new BN(1));
                            });

                            it('reverts when re-unpausing', async function ()
                            {
                                await expectRevert.unspecified(tokenInstance.unpause({ from: owner }), 'Pausable: not paused');
                            });
                        });
                    });
                });
            });
        });
    });
});