/**
 * WiBOO CONFIDENTIAL
 * ------------------
 * Copyright (C) 2021 Ecossistema Negócios Digitais LTDA - All Rights Reserved.
 *
 * This file, project or its parts can not be copied and/or distributed without
 * the express permission of Ecossistema Negócios Digitais LTDA.
 *
 * @file 3_referral_engagement_migration.js
 * @author Gabriel Matos <gabriel.matos@wiboo.io>
 * @date Sunday, 21st February 2021 11:12:33 am
 */

const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const ReferralEngagement = artifacts.require('IndicationEngagement');

module.exports = async (deployer) =>
{
    await deployProxy(ReferralEngagement, [], { deployer });
};
