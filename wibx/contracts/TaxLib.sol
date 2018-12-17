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
     * Modifiable tax container
     */
    struct DynamicTax
    {
        /**
         * Tax amount per each transaction (in %).
         */
        uint256 amount;

        /**
         * Amount number shift.
         */
        uint8 shift;

        /**
         * Cache the value already calculated to save GAS.
         * Represents: amount * (10 ^ shift).
         */
        uint256 normalizedAmount;
    }

    /**
     * @dev Apply some percentage to some value.
     *
     * @param taxAmount The amount of tax
     * @param value The total amount
     * @return The tax amount to be payed (in WEI)
     */
    function applyTax(uint256 taxAmount, uint256 value) internal pure returns (uint256)
    {
        uint256 temp = value.mul(taxAmount);

        return temp.div(100);
    }

    /**
     * @dev Shifts the tax amount
     *
     * @param taxAmount The chosen tax amount
     * @param shift The power chosen
     */
    function normalizeTaxAmount(uint256 taxAmount, uint256 shift) internal pure returns (uint256)
    {
        require(shift <= 5, "Shift value too high");

        return taxAmount.mul(10 ** shift);
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