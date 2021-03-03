/**
 * WiBOO CONFIDENTIAL
 * ------------------
 * Copyright (C) 2021 Ecossistema Negócios Digitais LTDA - All Rights Reserved.
 *
 * This file, project or its parts can not be copied and/or distributed without
 * the express permission of Ecossistema Negócios Digitais LTDA.
 *
 * @file IndicationEngagement.test.js
 * @author Gabriel Matos <gabriel.matos@wiboo.io>
 * @date Tuesday, 2nd March 2021 11:30:38 pm
 */

const { expectEvent, ether, expectRevert } = require('@openzeppelin/test-helpers');
const { NOT_ADMIN_ERROR } = require('./helpers/exceptions');
const deployMockedProxy = require('./helpers/deploy-mocked-proxy');

const WibooAccessControl = artifacts.require('WibooAccessControl');
const IndicationEngagement = artifacts.require('IndicationEngagement');

contract('IndicationEngagement: Common Functionalities', ([_, firstUser, secondUser, externalUser]) =>
{
    let wibooAccessControl;
    let indicationEngagement;

    const REF_PAYLOAD = {
        to: secondUser,
        id: '5c8a8dc2-4eb0-425f-883c-f47e12af27b7',
        idCampaign: '85ed0166-59fe-4c1f-b15e-e0818bbe7753',
        idItem: 'd4366d02-e6d0-42f6-b95b-1c752afb83b6',
        amountItem: ether('100').toString(),
        amountReward: ether('1').toString(),
        when: Date.now().toString()
    };

    beforeEach(async () =>
    {
        wibooAccessControl = await deployMockedProxy(WibooAccessControl);
        indicationEngagement = await deployMockedProxy(IndicationEngagement, wibooAccessControl.address);
    });

    it('should add and get a new indication', async () =>
    {
        const receipt = await indicationEngagement.addIndication(
            ...Object.values(REF_PAYLOAD)
        );

        expectEvent(receipt, 'IndicationCreated', REF_PAYLOAD);

        const {
            to,
            id,
            idCampaign,
            idItem,
            amountItem,
            amountReward,
            when
        } = await indicationEngagement.getIndication(
            secondUser,
            REF_PAYLOAD.id
        );

        expect({
            to,
            id,
            idCampaign,
            idItem,
            amountItem: amountItem.toString(),
            amountReward: amountReward.toString(),
            when: when.toString()
        }).to.eql(REF_PAYLOAD);
    });

    it('should external user not able to add a new indication', async () =>
    {
        await expectRevert(
            indicationEngagement.addIndication(...Object.values(REF_PAYLOAD), { from: externalUser }),
            NOT_ADMIN_ERROR
        );
    });
});