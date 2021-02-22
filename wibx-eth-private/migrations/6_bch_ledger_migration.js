/**
 * WiBOO CONFIDENTIAL
 * ------------------
 * Copyright (C) 2021 Ecossistema Negócios Digitais LTDA - All Rights Reserved.
 *
 * This file, project or its parts can not be copied and/or distributed without
 * the express permission of Ecossistema Negócios Digitais LTDA.
 *
 * @file 6_bch_ledger_migration.js
 * @author Gabriel Matos <gabriel.matos@wiboo.io>
 * @date Sunday, 21st February 2021 2:11:20 pm
 */

const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const BCHLedger = artifacts.require('BCHLedger');

module.exports = async (deployer) =>
{
    await deployProxy(BCHLedger, [], { deployer });
};