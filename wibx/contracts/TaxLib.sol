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
     * @param taxDecimals Decimal units to be used in the taxAmount
     * @param value The total amount
     * @return The tax amount to be payed (in WEI)
     */
    function applyTax(uint256 taxAmount, uint256 taxDecimals, uint256 value) internal pure returns (uint256)
    {
        // todo: The decimal calculation needs to be cached (!Check with ROCA!)
        uint256 normalizedTaxAmount = taxAmount.mul(10 ** taxDecimals);
        uint256 temp = value.mul(normalizedTaxAmount);

        return temp.div(100);
    }

    /**
     * @dev Calculates the NET value of the transaction
     *
     * @param taxValue All tax value paid
     * @param value The transaction value
     * @return The NET price
     */
    function netValue(uint256 taxValue, uint256 value) internal pure returns (uint256)
    {
        return value.sub(taxValue);
    }
}