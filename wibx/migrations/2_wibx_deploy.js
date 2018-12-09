const WibxToken = artifacts.require('./WibxToken.sol');

module.exports = (deployer) =>
{
    deployer.deploy(WibxToken);
};