/**
 * WiBOO CONFIDENTIAL
 * ------------------
 * Copyright (C) 2021 Ecossistema Negócios Digitais LTDA - All Rights Reserved.
 *
 * This file, project or its parts can not be copied and/or distributed without
 * the express permission of Ecossistema Negócios Digitais LTDA.
 *
 * @file ReferralEngagement.test.js
 * @author Gabriel Matos <gabriel.matos@wiboo.io>
 * @date Tuesday, 2nd March 2021 9:59:19 pm
 */

const { expectEvent, ether, expectRevert } = require('@openzeppelin/test-helpers');
const { NOT_ADMIN_ERROR } = require('./helpers/exceptions');
const deployMockedProxy = require('./helpers/deploy-mocked-proxy');

const WibooAccessControl = artifacts.require('WibooAccessControl');
const ReferralEngagement = artifacts.require('ReferralEngagement');

contract('ReferralEngagement: Common Functionalities', ([_, firstUser, secondUser, externalUser]) =>
{
    let wibooAccessControl;
    let referralEngagement;

    const STATUS = {
        OK: '1'
    };
    const REF_PAYLOAD = {
        to: secondUser,
        id: 'ad4c8e77-ef25-4545-beff-1279138863cb',
        ref_conf_id: '814a380e-eea9-409c-bed3-519c1add0c8e',
        from: firstUser,
        amount: ether('100').toString(),
        status: STATUS.OK,
        when: Date.now().toString()
    };

    beforeEach(async () =>
    {
        wibooAccessControl = await deployMockedProxy(WibooAccessControl);
        referralEngagement = await deployMockedProxy(ReferralEngagement, wibooAccessControl.address);
    });

    it('should add and get a new referral', async () =>
    {
        const receipt = await referralEngagement.addReferral(
            ...Object.values(REF_PAYLOAD)
        );

        expectEvent(receipt, 'ReferralCreated', REF_PAYLOAD);

        const {
            to,
            id,
            ref_conf_id,
            from,
            amount,
            status,
            when
        } = await referralEngagement.getReferral(
            secondUser,
            REF_PAYLOAD.id
        );

        expect({
            to,
            id,
            ref_conf_id,
            from,
            amount: amount.toString(),
            status: status.toString(),
            when: when.toString()
        }).to.eql(REF_PAYLOAD);
    });

    it('should external user not able to add a new referral', async () =>
    {
        await expectRevert(
            referralEngagement.addReferral(...Object.values(REF_PAYLOAD), { from: externalUser }),
            NOT_ADMIN_ERROR
        );
    });
});