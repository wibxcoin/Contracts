/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title Taxation Library
 *
 * @dev Helpers for taxation
 */
library TaxLib
{
    using SafeMath for uint256;

    /**
     * @dev Apply some percentage to some value.
     *
     * @param taxAmount The amount of tax
     * @param value The total amount
     * @param decimals Decimal units to be used
     * @return The tax amount to be payed (in WEI)
     */
    function applyTax(uint256 taxAmount, uint256 value, uint256 decimals) internal pure returns (uint256)
    {
        // todo: The decimal calculation needs to be cached
        uint256 normalizedTaxAmount = taxAmount.mul(10 ** decimals);
        uint256 temp = value.mul(normalizedTaxAmount);

        return temp.div(100);
    }
}