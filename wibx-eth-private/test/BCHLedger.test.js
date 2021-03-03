/**
 * WiBOO CONFIDENTIAL
 * ------------------
 * Copyright (C) 2021 Ecossistema Negócios Digitais LTDA - All Rights Reserved.
 *
 * This file, project or its parts can not be copied and/or distributed without
 * the express permission of Ecossistema Negócios Digitais LTDA.
 *
 * @file BCHLedger.test.js
 * @author Gabriel Matos <gabriel.matos@wiboo.io>
 * @date Wednesday, 3rd March 2021 12:06:17 pm
 */

const { expectEvent, ether, expectRevert } = require('@openzeppelin/test-helpers');
const { NOT_ADMIN_ERROR, MISSING_FUNDS } = require('./helpers/exceptions');
const { DEFAULT_ADMIN_ROLE } = require('./helpers/roles');
const deployMockedProxy = require('./helpers/deploy-mocked-proxy');

const WibooAccessControl = artifacts.require('WibooAccessControl');
const BCHLedger = artifacts.require('BCHLedger');
const FINLedger = artifacts.require('FINLedger');

contract('BCHLedger: Common Functionalities', ([_, firstUser, secondUser, externalUser]) =>
{
    let wibooAccessControl;
    let finLedger;
    let bchLedger;

    const DEPOSIT_PAYLOAD = {
        externalFrom: secondUser,
        to: firstUser,
        amount: ether('100').toString(),
        txnHash: '0x22ce91149aab4fa16c490a55e9b5a5c69feee670f19e6de37e2cfdc44d1b1224'
    };
    const TRANSFER_PAYLOAD = {
        from: firstUser,
        to: secondUser,
        amount: ether('50').toString(),
        taxAmount: '0'
    };
    const WITHDRAWAL_PAYLOAD = {
        from: firstUser,
        externalTo: externalUser,
        amount: ether('50').toString(),
        taxAmount: '0',
        journalAddr: 'cb3dd397-875f-4dc2-aee1-175ab1912037'
    };

    beforeEach(async () =>
    {
        wibooAccessControl = await deployMockedProxy(WibooAccessControl);
        finLedger = await deployMockedProxy(FINLedger, wibooAccessControl.address);
        bchLedger = await deployMockedProxy(BCHLedger, finLedger.address, wibooAccessControl.address);

        await wibooAccessControl.grantRole(DEFAULT_ADMIN_ROLE, bchLedger.address);
    });

    it('should user receive a deposit', createDeposit);

    it('should user not receive a deposit if isnt an admin', async () =>
    {
        await expectRevert(
            bchLedger.deposit(...Object.values(DEPOSIT_PAYLOAD), { from: externalUser }),
            NOT_ADMIN_ERROR
        );
    });

    it('should fail the transfer if the origin doesnt have balance', async () =>
    {
        await expectRevert(
            bchLedger.transferFrom(...Object.values(TRANSFER_PAYLOAD)),
            MISSING_FUNDS
        );
    });

    it('should fail the transfer if the address is not admin', async () =>
    {
        await expectRevert(
            bchLedger.transferFrom(...Object.values(TRANSFER_PAYLOAD), { from: externalUser }),
            NOT_ADMIN_ERROR
        );
    });

    it('should transfer some amount to other user', async () =>
    {
        await createDeposit();

        const receipt = await bchLedger.transferFrom(
            ...Object.values(TRANSFER_PAYLOAD)
        );

        expectEvent(receipt, 'Transfer', TRANSFER_PAYLOAD);
        await expectBalance(ether('50').toString());
        await expectBalance(ether('50').toString(), TRANSFER_PAYLOAD.to);
    });

    it('should fail the withdrawal if the origin doesnt have balance', async () =>
    {
        await expectRevert(
            bchLedger.withdrawal(...Object.values(WITHDRAWAL_PAYLOAD)),
            MISSING_FUNDS
        );
    });

    it('should fail the withdrawal if the address is not admin', async () =>
    {
        await expectRevert(
            bchLedger.withdrawal(...Object.values(WITHDRAWAL_PAYLOAD), { from: externalUser }),
            NOT_ADMIN_ERROR
        );
    });

    it('should withdrawal some amount to an external address', async () =>
    {
        await createDeposit();

        const receipt = await bchLedger.withdrawal(
            ...Object.values(WITHDRAWAL_PAYLOAD)
        );

        expectEvent(receipt, 'Withdrawal', WITHDRAWAL_PAYLOAD);
        await expectBalance(ether('50').toString());
        await expectBalance(ether('50').toString(), TRANSFER_PAYLOAD.externalTo);
    });

    it('should fail the update user BCH balance if the address isnt admin', async () =>
    {
        await expectRevert(
            bchLedger.setBalance(firstUser, ether('500').toString(), { from: externalUser }),
            NOT_ADMIN_ERROR
        );
    });

    it('should upgrade the user BCH balance', async () =>
    {
        const newBalance = ether('500').toString();

        await bchLedger.setBalance(firstUser, newBalance);

        await expectBalance(newBalance);
    });

    async function createDeposit()
    {
        const receipt = await bchLedger.deposit(
            ...Object.values(DEPOSIT_PAYLOAD)
        );

        expectEvent(receipt, 'Deposit', DEPOSIT_PAYLOAD);
        await expectBalance(DEPOSIT_PAYLOAD.amount);
        await expectFinBalance(DEPOSIT_PAYLOAD.amount);
    }

    async function expectBalance(match, account = firstUser)
    {
        const balance = await bchLedger.balanceOf(account);

        return expect(balance.toString()).to.equal(match);
    }

    async function expectFinBalance(match, account = firstUser)
    {
        const balance = await finLedger.balanceOf(account);

        return expect(balance.toString()).to.equal(match);
    }
});