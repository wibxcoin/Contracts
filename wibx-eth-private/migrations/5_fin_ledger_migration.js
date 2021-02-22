/**
 * WiBOO CONFIDENTIAL
 * ------------------
 * Copyright (C) 2021 Ecossistema Negócios Digitais LTDA - All Rights Reserved.
 *
 * This file, project or its parts can not be copied and/or distributed without
 * the express permission of Ecossistema Negócios Digitais LTDA.
 *
 * @file 5_fin_ledger_migration.js
 * @author Gabriel Matos <gabriel.matos@wiboo.io>
 * @date Sunday, 21st February 2021 11:34:30 am
 */

const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const FINLedger = artifacts.require('FINLedger');

module.exports = async (deployer) =>
{
    await deployProxy(FINLedger, [], { deployer });
};
