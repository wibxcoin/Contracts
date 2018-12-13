/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

const WibxToken = artifacts.require('WibxToken');
const shouldFail = require('./helpers/shouldFail');
const { applyTax } = require('./helpers/tax');
const { should } = require('./helpers/util');
const { INITIAL_SUPPLY } = require('./helpers/constants');

/**
 * WibxToken BCH batch transfer.
 *
 * Test BCH batch feature.
 */
contract('WibxToken: BCH batch transfer', ([owner, recipient, anotherAccount, bchAddr]) =>
{
    should();
    let tokenInstance;

    beforeEach(async () =>
    {
        tokenInstance = await WibxToken.new(bchAddr);
    });

    it('should fail with a different number of parameters', async () =>
    {
        await shouldFail.reverting(tokenInstance.sendBatch(
            [recipient],
            [1, 2],
            owner
        ));
    });

    it('should fail with a different and unauthorized sender', async () =>
    {
        const halfAmount = INITIAL_SUPPLY.div(2);

        await shouldFail.reverting(tokenInstance.sendBatch(
            [recipient, anotherAccount],
            [halfAmount, halfAmount],
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
    async function transfer(from)
    {
        const amount = INITIAL_SUPPLY;
        const halfAmount = amount.div(2);
        const taxes = applyTax(halfAmount);
        const valueWithoutTaxes = halfAmount.minus(taxes);

        (await tokenInstance.balanceOf(owner)).should.be.bignumber.equal(amount);

        await tokenInstance.sendBatch(
            [recipient, anotherAccount],
            [halfAmount, halfAmount],
            owner,
            { from }
        );

        (await tokenInstance.balanceOf(owner)).should.be.bignumber.equal(0);
        (await tokenInstance.balanceOf(recipient)).should.be.bignumber.equal(valueWithoutTaxes);
        (await tokenInstance.balanceOf(anotherAccount)).should.be.bignumber.equal(valueWithoutTaxes);
    }

    /**
     * Authorize the BCH address manipulation
     */
    async function bchAuthorize()
    {
        await tokenInstance.bchAuthorize();

        (await tokenInstance.isBchHandled(owner)).should.be.true;
    }
});