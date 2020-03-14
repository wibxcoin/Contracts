/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

const { BN, expectRevert } = require('openzeppelin-test-helpers');
const WibxToken = artifacts.require('WibxToken');
const { applyTax } = require('./helpers/tax');
const {
    INITIAL_SUPPLY,
    TRANSFER_TEST_AMOUNT,
    ALL_TAXES_SHIFT
} = require('./helpers/constants');

/**
 * WibxToken BCH batch transfer.
 *
 * Test BCH batch feature.
 */
contract('WibxToken: BCH batch transfer', ([owner, recipient, anotherAccount, bchAddr, taxRecipientAddr]) =>
{
    let tokenInstance;

    beforeEach(async () =>
    {
        tokenInstance = await WibxToken.new(bchAddr, taxRecipientAddr);
    });

    it('should fail with a different number of parameters', async () =>
    {
        await expectRevert.unspecified(tokenInstance.sendBatch(
            [recipient],
            [1, 2],
            owner
        ));
    });

    it('should fail with a different and unauthorized sender', async () =>
    {
        const halfAmount = TRANSFER_TEST_AMOUNT;

        await expectRevert.unspecified(tokenInstance.sendBatch(
            [recipient, anotherAccount],
            [halfAmount, halfAmount],
            owner,
            { from: anotherAccount }
        ));
    });

    it('should fail with more transactions than permitted', async () =>
    {
        const transactionNumber = 150;
        const recipients = Array(transactionNumber).fill(recipient);
        const amounts = Array(transactionNumber).fill(new BN(1));

        await expectRevert.unspecified(tokenInstance.sendBatch(
            recipients,
            amounts,
            owner,
            { from: anotherAccount }
        ));
    });

    it('should transfer correctly some value in batch from the real account owner', async () =>
    {
        await transfer(owner);
    });

    it('should transfer correctly some value in batch from the some BCH managed account', async () =>
    {
        await bchAuthorize();

        await transfer(bchAddr);
    });

    /**
     * Transfer some value in batch
     *
     * @param {string} from The sender address
     */
    async function transfer (from)
    {
        const amount = TRANSFER_TEST_AMOUNT;
        const halfAmount = amount.div(new BN(2));
        const taxes = applyTax(amount, ALL_TAXES_SHIFT);

        (await tokenInstance.balanceOf(owner)).should.be.bignumber.least(amount);

        await tokenInstance.sendBatch(
            [recipient, anotherAccount],
            [halfAmount, halfAmount],
            owner,
            { from }
        );

        (await tokenInstance.balanceOf(owner)).should.be.bignumber.equal(INITIAL_SUPPLY.sub(amount).sub(taxes));
        (await tokenInstance.balanceOf(recipient)).should.be.bignumber.equal(halfAmount);
        (await tokenInstance.balanceOf(anotherAccount)).should.be.bignumber.equal(halfAmount);
    }

    /**
     * Authorize the BCH address manipulation
     */
    async function bchAuthorize ()
    {
        await tokenInstance.bchAuthorize();

        (await tokenInstance.isBchHandled(owner)).should.be.true;
    }
});