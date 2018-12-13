const WibxToken = artifacts.require('./WibxToken.sol');

module.exports = (deployer) =>
{
    /**
     * The REAL BCH Addr
     */
    const BCH_ADDR = '0xc5a9007407fba42285e15f1ca90779d130c93c29';

    deployer.deploy(
        WibxToken,
        BCH_ADDR
    );
};