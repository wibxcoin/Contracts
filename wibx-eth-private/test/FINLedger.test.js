/**
 * WiBOO CONFIDENTIAL
 * ------------------
 * Copyright (C) 2021 Ecossistema Negócios Digitais LTDA - All Rights Reserved.
 *
 * This file, project or its parts can not be copied and/or distributed without
 * the express permission of Ecossistema Negócios Digitais LTDA.
 *
 * @file FINLedger.test.js
 * @author Gabriel Matos <gabriel.matos@wiboo.io>
 * @date Wednesday, 3rd March 2021 9:25:45 am
 */

const { expectEvent, ether, expectRevert } = require('@openzeppelin/test-helpers');
const { NOT_ADMIN_ERROR, MISSING_FUNDS } = require('./helpers/exceptions');
const deployMockedProxy = require('./helpers/deploy-mocked-proxy');

const WibooAccessControl = artifacts.require('WibooAccessControl');
const FINLedger = artifacts.require('FINLedger');

contract('FINLedger: Common Functionalities', ([_, firstUser, secondUser, externalUser]) =>
{
    let wibooAccessControl;
    let finLedger;

    const DEPOSIT_PAYLOAD = {
        externalFrom: externalUser,
        to: firstUser,
        amount: ether('100').toString(),
        txnHash: '0xbf84184797ad9df32347140d89fa11a4aab6b2caad8e89a56c2e2f51cf35bb10'
    };
    const RESERVATION_PAYLOAD = {
        from: firstUser,
        amount: ether('50').toString()
    };
    const SETTLEMENT_PAYLOAD = {
        from: firstUser,
        to: secondUser,
        amount: ether('50').toString(),
        taxAmount: '0'
    };
    const CANCELATION_PAYLOAD = {
        from: firstUser,
        amount: ether('50').toString()
    };

    beforeEach(async () =>
    {
        wibooAccessControl = await deployMockedProxy(WibooAccessControl);
        finLedger = await deployMockedProxy(FINLedger, wibooAccessControl.address);
    });

    it('should deposit some amount to the user', createDeposit);

    it('should fail deposit if account isnt admin', async () =>
    {
        await expectRevert(
            finLedger.deposit(...Object.values(DEPOSIT_PAYLOAD), { from: externalUser }),
            NOT_ADMIN_ERROR
        );
    });

    it('should reserve some amount to the user', createReservation);

    it('should fail reservation if user doesnt have amount', async () =>
    {
        await expectRevert(
            finLedger.reserve(...Object.values(RESERVATION_PAYLOAD)),
            MISSING_FUNDS
        );
    });

    it('should fail reservation if account isnt admin', async () =>
    {
        await expectRevert(
            finLedger.reserve(...Object.values(RESERVATION_PAYLOAD), { from: externalUser }),
            NOT_ADMIN_ERROR
        );
    });

    it('should settle some amount to the user', async () =>
    {
        await createReservation();

        const receipt = await finLedger.settle(
            ...Object.values(SETTLEMENT_PAYLOAD)
        );

        expectEvent(receipt, 'Settlement', SETTLEMENT_PAYLOAD);
        await expectResevation('0');
        await expectBalance(ether('50').toString());
        await expectBalance(ether('50').toString(), secondUser);
    });

    it('should fail settlement if account doesnt have the reserved amount', async () =>
    {
        await expectRevert(
            finLedger.settle(...Object.values(SETTLEMENT_PAYLOAD)),
            MISSING_FUNDS
        );
    });

    it('should fail settlement if account isnt admin', async () =>
    {
        await expectRevert(
            finLedger.settle(...Object.values(SETTLEMENT_PAYLOAD), { from: externalUser }),
            NOT_ADMIN_ERROR
        );
    });

    it('should cancel some reservation and back the value to the user balance', async () =>
    {
        await createReservation();

        const receipt = await finLedger.cancel(
            ...Object.values(CANCELATION_PAYLOAD)
        );

        expectEvent(receipt, 'Cancelation', CANCELATION_PAYLOAD);
        await expectBalance(DEPOSIT_PAYLOAD.amount);
        await expectResevation('0');
    });

    it('should fail cancellation if account doesnt have the reserved amount', async () =>
    {
        await expectRevert(
            finLedger.cancel(...Object.values(CANCELATION_PAYLOAD)),
            MISSING_FUNDS
        );
    });

    it('should fail cancelation if account isnt admin', async () =>
    {
        await expectRevert(
            finLedger.cancel(...Object.values(CANCELATION_PAYLOAD), { from: externalUser }),
            NOT_ADMIN_ERROR
        );
    });

    it('should override the user balance', async () =>
    {
        const newBalance = ether('500').toString();

        await finLedger.setBalance(firstUser, newBalance);

        await expectBalance(newBalance);
    });

    it('should fail override the user balance if the account isnt admin', async () =>
    {
        const newBalance = ether('500').toString();

        await expectRevert(
            finLedger.setBalance(firstUser, newBalance, { from: externalUser }),
            NOT_ADMIN_ERROR
        );
    });

    it('should override the user reservation', async () =>
    {
        const newReservation = ether('500').toString();

        await finLedger.setReservation(firstUser, newReservation);

        await expectResevation(newReservation);
    });

    it('should fail override the user reservation if the account isnt admin', async () =>
    {
        const newReservation = ether('500').toString();

        await expectRevert(
            finLedger.setReservation(firstUser, newReservation, { from: externalUser }),
            NOT_ADMIN_ERROR
        );
    });

    async function createDeposit()
    {
        const receipt = await finLedger.deposit(
            ...Object.values(DEPOSIT_PAYLOAD)
        );

        expectEvent(receipt, 'Deposit', DEPOSIT_PAYLOAD);
        await expectBalance(DEPOSIT_PAYLOAD.amount);
    }

    async function createReservation()
    {
        await createDeposit();

        const receipt = await finLedger.reserve(
            ...Object.values(RESERVATION_PAYLOAD)
        );

        expectEvent(receipt, 'Reservation', RESERVATION_PAYLOAD);
        await expectBalance(ether('50').toString());
        await expectResevation(ether('50').toString());
    }

    async function expectBalance(match, account = firstUser)
    {
        const balance = await finLedger.balanceOf(account);

        return expect(balance.toString()).to.equal(match);
    }

    async function expectResevation(match, account = firstUser)
    {
        const reservation = await finLedger.reservationOf(account);

        return expect(reservation.toString()).to.equal(match);
    }
});