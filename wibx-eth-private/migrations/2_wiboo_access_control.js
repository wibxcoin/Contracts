/**
 * WiBOO CONFIDENTIAL
 * ------------------
 * Copyright (C) 2021 Ecossistema Negócios Digitais LTDA - All Rights Reserved.
 *
 * This file, project or its parts can not be copied and/or distributed without
 * the express permission of Ecossistema Negócios Digitais LTDA.
 *
 * @file 2_wiboo_access_control.js
 * @author Gabriel Matos <gabriel.matos@wiboo.io>
 * @date Tuesday, 2nd March 2021 6:51:59 pm
 */

const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const WibooAccessControl = artifacts.require('WibooAccessControl');

module.exports = async (deployer) =>
{
    await deployProxy(WibooAccessControl, [], { deployer });
};
