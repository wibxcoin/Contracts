/**
 * WiBOO CONFIDENTIAL
 * ------------------
 * Copyright (C) 2021 Ecossistema Negócios Digitais LTDA - All Rights Reserved.
 *
 * This file, project or its parts can not be copied and/or distributed without
 * the express permission of Ecossistema Negócios Digitais LTDA.
 *
 * @file 1_initial_migration.js
 * @author Gabriel Matos <gabriel.matos@wiboo.io>
 * @date Thursday, 18th February 2021 2:37:03 pm
 */

const Migrations = artifacts.require('Migrations');

module.exports = (deployer) =>
{
    deployer.deploy(Migrations);
};
