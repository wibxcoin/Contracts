/**
 * WiBOO CONFIDENTIAL
 * ------------------
 * Copyright (C) 2021 Ecossistema Negócios Digitais LTDA - All Rights Reserved.
 *
 * This file, project or its parts can not be copied and/or distributed without
 * the express permission of Ecossistema Negócios Digitais LTDA.
 *
 * @file ShareEngagement.test.js
 * @author Gabriel Matos <gabriel.matos@wiboo.io>
 * @date Tuesday, 2nd March 2021 11:15:35 pm
 */

const { expectEvent, ether, expectRevert } = require('@openzeppelin/test-helpers');
const { NOT_ADMIN_ERROR } = require('./helpers/exceptions');
const deployMockedProxy = require('./helpers/deploy-mocked-proxy');

const WibooAccessControl = artifacts.require('WibooAccessControl');
const ShareEngagement = artifacts.require('ShareEngagement');

contract('ShareEngagement: Common Functionalities', ([_, firstUser, secondUser, externalUser]) =>
{
    let wibooAccessControl;
    let shareEngagement;

    const STATUS = {
        OK: '1'
    };
    const MEDIA = {
        FACEBOOK: '1'
    };
    const SHARE_PAYLOAD = {
        to: secondUser,
        id: 'd10926de-7044-4577-989d-a049fbce746d',
        idCampaign: '6c5bae35-41eb-4325-aa3b-1b7f8b09ba85',
        token: '12345678910',
        media: MEDIA.FACEBOOK,
        amount: ether('100').toString(),
        status: STATUS.OK,
        when: Date.now().toString()
    };

    beforeEach(async () =>
    {
        wibooAccessControl = await deployMockedProxy(WibooAccessControl);
        shareEngagement = await deployMockedProxy(ShareEngagement, wibooAccessControl.address);
    });

    it('should add and get a new share', async () =>
    {
        const receipt = await shareEngagement.addShare(
            ...Object.values(SHARE_PAYLOAD)
        );

        expectEvent(receipt, 'ShareCreated', SHARE_PAYLOAD);

        const {
            to,
            id,
            idCampaign,
            token,
            media,
            amount,
            status,
            when
        } = await shareEngagement.getShare(
            secondUser,
            SHARE_PAYLOAD.id
        );

        expect({
            to,
            id,
            idCampaign,
            token: token.toString(),
            media: media.toString(),
            amount: amount.toString(),
            status: status.toString(),
            when: when.toString()
        }).to.eql(SHARE_PAYLOAD);
    });

    it('should external user not able to add a new referral', async () =>
    {
        await expectRevert(
            shareEngagement.addShare(...Object.values(SHARE_PAYLOAD), { from: externalUser }),
            NOT_ADMIN_ERROR
        );
    });
});