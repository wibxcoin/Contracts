/**
 * This smart contract code is Copyright 2019 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

const { BN, shouldFail, time } = require('openzeppelin-test-helpers');
const { applyTax } = require('./helpers/tax');
const WibxToken = artifacts.require('WibxToken');
const WibxTokenVesting = artifacts.require('WibxTokenVesting');
const {
    ALL_TAXES_SHIFT
} = require('./helpers/constants');

contract('WibxTokenVesting: Common Functionalities', ([owner, recipient, anotherAccount, bchAddr, taxRecipientAddr]) =>
{
    /**
     * 45 milions of WBX
     */
    const defaultAmount = new BN('45000000000000000000000000');

    /**
     * The time shift period. Should be equals to VestingLib._timeShiftPeriod.
     */
    const timeLeap = time.duration.days('60');

    let wibxInstance;
    let vestingInstance;

    beforeEach(async () =>
    {
        wibxInstance = await WibxToken.new(bchAddr, taxRecipientAddr);
        vestingInstance = await WibxTokenVesting.new(wibxInstance.address);
    });

    describe('add new team member tests', () =>
    {
        it('should add a new team member', async () =>
        {
            await vestingInstance.addTeamMember(anotherAccount, defaultAmount);

            (await vestingInstance.remainingTokenAmount(anotherAccount)).should.be.bignumber.equal(defaultAmount);
            (await vestingInstance.totalAlocatedWibxVestingTokens()).should.be.bignumber.equal(defaultAmount);
        });

        it('should fail add a new user from other user than the contract owner', async () =>
        {
            await shouldFail.reverting(
                vestingInstance.addTeamMember(anotherAccount, defaultAmount, { from: anotherAccount })
            );
        });

        it('should fail add the same member twice', async () =>
        {
            await vestingInstance.addTeamMember(anotherAccount, defaultAmount);

            await shouldFail.reverting.withMessage(
                vestingInstance.addTeamMember(anotherAccount, defaultAmount),
                'Member already added'
            );
        });
    });

    describe('team members token withdrawal', () =>
    {
        it('should fail if the member doesnt exists', async () =>
        {
            await shouldFail.reverting.withMessage(
                vestingInstance.withdrawal(anotherAccount),
                'The team member is not found'
            );
        });

        it('should throw when the contract doesnt have founds for pay', async () =>
        {
            await vestingInstance.addTeamMember(anotherAccount, defaultAmount);

            await shouldFail.reverting.withMessage(
                vestingInstance.withdrawal(anotherAccount),
                'The contract doesnt have founds to pay'
            );
        });

        it('should withdrawal the first transfer correctly of a team member', async () =>
        {
            await withdrawalMember(anotherAccount);
        });

        it('should withdrawal all tokens of the team member', async () =>
        {
            await withdrawalMember(anotherAccount);

            while ((await vestingInstance.remainingTokenAmount(anotherAccount)).gt(new BN('0')))
            {
                await time.increase(timeLeap); // Time machine

                await vestingInstance.withdrawal(anotherAccount);
            }

            await shouldFail.reverting.withMessage(
                vestingInstance.withdrawal(anotherAccount),
                'There is no more tokens to transfer to this wallet'
            );

            (await wibxInstance.balanceOf(anotherAccount)).should.be.bignumber.equal(defaultAmount);
            (await vestingInstance.remainingTokenAmount(anotherAccount)).should.be.bignumber.equal(new BN('0'));
            (await vestingInstance.totalWibxVestingSupply()).should.be.bignumber.equal(new BN('0'));
        });

        it('should withdrawal all tokens in a sequence if the user looses all drops', async () =>
        {
            await withdrawalMember(anotherAccount);

            await time.increase(time.duration.years('5')); // Time machine

            while ((await vestingInstance.remainingTokenAmount(anotherAccount)).gt(new BN('0')))
            {
                await vestingInstance.withdrawal(anotherAccount);
            }

            await shouldFail.reverting.withMessage(
                vestingInstance.withdrawal(anotherAccount),
                'There is no more tokens to transfer to this wallet'
            );

            (await wibxInstance.balanceOf(anotherAccount)).should.be.bignumber.equal(defaultAmount);
            (await vestingInstance.remainingTokenAmount(anotherAccount)).should.be.bignumber.equal(new BN('0'));
            (await vestingInstance.totalWibxVestingSupply()).should.be.bignumber.equal(new BN('0'));
        });

        it('should fail if the user doesnt wait the right time for the withdrawal', async () =>
        {
            await withdrawalMember(anotherAccount);

            await time.increase(timeLeap.div(new BN('2'))); // Time machine

            await shouldFail.reverting.withMessage(
                vestingInstance.withdrawal(anotherAccount),
                'You need to wait the next withdrawal period'
            );
        });
    });

    describe('end of the vesting period', () =>
    {
        it('should throw an exception if other person than owner try to destroy the contract', async () =>
        {
            await shouldFail.reverting.withMessage(
                vestingInstance.terminateTokenVesting({ from: anotherAccount }),
            );
        });

        it('should throw an exception if there someone to get tokens', async () =>
        {
            await vestingInstance.addTeamMember(recipient, defaultAmount);

            await shouldFail.reverting.withMessage(
                vestingInstance.terminateTokenVesting(),
                'All withdrawals have yet to take place'
            );
        });

        it('should transfer back tokens (if available) to the owner and terminate the contract', async () =>
        {
            await transferTokensToVestingContract(defaultAmount);

            const taxBalanceAfterVesting = await wibxInstance.balanceOf(taxRecipientAddr);

            await vestingInstance.terminateTokenVesting();

            (await wibxInstance.balanceOf(taxRecipientAddr)).should.be.bignumber.greaterThan(taxBalanceAfterVesting);
            (await wibxInstance.balanceOf(vestingInstance.address)).should.be.bignumber.equal(new BN('0'));
        });

        it('should contract be not available after its destruction', async () =>
        {
            await vestingInstance.terminateTokenVesting();

            await shouldFail(
                vestingInstance.remainingTokenAmount(recipient)
            );
        });
    });

    /**
     * Perform the first withdrawal of the member
     *
     * @param {Address} wallet
     */
    async function withdrawalMember (wallet)
    {
        (await wibxInstance.balanceOf(wallet)).should.be.bignumber.equal(new BN('0'));

        await transferTokensToVestingContract(defaultAmount);

        (await vestingInstance.totalWibxVestingSupply()).should.be.bignumber.equal(amountWithTaxes(defaultAmount));

        await vestingInstance.addTeamMember(wallet, defaultAmount);

        await vestingInstance.withdrawal(wallet);

        (await wibxInstance.balanceOf(wallet)).should.be.bignumber.equal('9000000000000000000000000');

        await shouldFail.reverting.withMessage(
            vestingInstance.withdrawal(wallet),
            'You need to wait the next withdrawal period'
        );

        (await vestingInstance.nextWithdrawalTime(wallet)).should.be.bignumber.greaterThan(new BN('0'));
    }

    /**
     * Here we bypass the contract taxes because the vesting contract needs the exact SAME value
     * of the pending payments.
     *
     * @param {BN} amount The amount that you want
     */
    async function transferTokensToVestingContract (amount)
    {
        const amountBN = amountWithTaxes(amount);

        await wibxInstance.transfer(taxRecipientAddr, amountBN);

        await wibxInstance.transfer(vestingInstance.address, amountBN, { from: taxRecipientAddr });
    }

    /**
     * Calculate the amount without taxes
     *
     * @param {BN | string} amount
     */
    function amountWithTaxes (amount)
    {
        const amountBN = new BN(amount);

        return amountBN.add(applyTax(amountBN, ALL_TAXES_SHIFT));
    }
});