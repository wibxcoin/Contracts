const WibxToken = artifacts.require('./WibxToken.sol');

module.exports = (deployer) =>
{
    /**
     * The REAL BCH Addr
     */
    const BCH_ADDR = '0xc5a9007407fba42285e15f1ca90779d130c93c29';

    /**
     * Tax recipient wallet
     */
    const TAX_RECIPIENT_ADDR = '0x08B9C1aE682aD62119635b5C6044204971bf1575';

    deployer.deploy(
        WibxToken,
        BCH_ADDR,
        TAX_RECIPIENT_ADDR
    );
};