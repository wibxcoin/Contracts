const WibxToken = artifacts.require('./WibxToken.sol');
const WibxTokenVesting = artifacts.require('./WibxTokenVesting.sol');
const WibxTaxLib = artifacts.require('./TaxLib.sol');

module.exports = async (deployer) =>
{
    /**
     * The REAL BCH Addr
     */
    const BCH_ADDR = '0xDc34526883467d9698a0037d530197e3D4C7529C';

    /**
     * Tax recipient wallet
     */
    const TAX_RECIPIENT_ADDR = '0xE372d0001C0ed9768ee0679D0F5F78ED46e558d9';

    await deployer.deploy(WibxTaxLib);

    await deployer.link(WibxTaxLib, WibxToken);

    /**
     * Deploy the Wibx Token Contract
     */
    await deployer.deploy(
        WibxToken,
        BCH_ADDR,
        TAX_RECIPIENT_ADDR
    );

    /**
     * Deploy the Wibx Token Vesting Contract (with the WibxToken instance)
     */
    await deployer.deploy(
        WibxTokenVesting,
        WibxToken.address
    );
};