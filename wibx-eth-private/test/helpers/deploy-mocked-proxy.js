/**
 * WiBOO CONFIDENTIAL
 * ------------------
 * Copyright (C) 2021 Ecossistema Negócios Digitais LTDA - All Rights Reserved.
 *
 * This file, project or its parts can not be copied and/or distributed without
 * the express permission of Ecossistema Negócios Digitais LTDA.
 *
 * @file deploy-mocked-proxy.js
 * @author Gabriel Matos <gabriel.matos@wiboo.io>
 * @date Tuesday, 2nd March 2021 10:09:52 pm
 */

module.exports = async function deployMockedProxy(contract, ...args)
{
    const instance = await contract.new();

    instance.initialize(...args);

    return instance;
}
