'use strict';

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const CHAIN_CODE_PATH = path.join('.', 'lib');
const UTILS_PATH = path.join(CHAIN_CODE_PATH, 'utils');

/**
 * Put the global.utils.js on top of all contracts.
 */
function generateCode()
{
    console.log('Tree-shaking chaincode...');

    const compiledUtilsData = fs.readFileSync(path.join(UTILS_PATH, 'global.util.js'), 'utf8');
    const files = fs.readdirSync('./lib').filter(file => /\.js/.test(file));

    files.forEach(file =>
    {
        console.log(`Processing contract ${file}...`);

        const filePath = path.join(CHAIN_CODE_PATH, file);

        const compiledData = fs.readFileSync(filePath, 'utf8');
        fs.writeFileSync(filePath, [
            compiledData,
            compiledUtilsData
        ].join(''), 'utf-8');
    });

    rimraf.sync(path.join(CHAIN_CODE_PATH, 'utils'));
}

if (fs.existsSync(UTILS_PATH))
{
    generateCode();
}