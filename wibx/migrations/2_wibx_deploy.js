const WibxToken = artifacts.require('./WibxToken.sol');

module.exports = (deployer) =>
{
    /**
     * The REAL BCH Addr
     */
    const BCH_ADDR = '0xDc34526883467d9698a0037d530197e3D4C7529C';

    /**
     * Tax recipient wallet
     */
    const TAX_RECIPIENT_ADDR = '0xE372d0001C0ed9768ee0679D0F5F78ED46e558d9';

    deployer.deploy(
        WibxToken,
        BCH_ADDR,
        TAX_RECIPIENT_ADDR
    );
};