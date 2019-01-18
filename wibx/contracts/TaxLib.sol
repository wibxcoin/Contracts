/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

pragma solidity 0.5.0;

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
         * The shift value.
         * Represents: 100 * 10 ** shift
         */
        uint256 shift;
    }

    /**
     * @dev Apply percentage to the value.
     *
     * @param taxAmount The amount of tax
     * @param shift The shift division amount
     * @param value The total amount
     * @return The tax amount to be payed (in WEI)
     */
    function applyTax(uint256 taxAmount, uint256 shift, uint256 value) internal pure returns (uint256)
    {
        uint256 temp = value.mul(taxAmount);

        return temp.div(shift);
    }

    /**
     * @dev Normalize the shift value
     *
     * @param shift The power chosen
     */
    function normalizeShiftAmount(uint256 shift) internal pure returns (uint256)
    {
        require(shift >= 0 && shift <= 2, "You can't set more than 2 decimal places");

        uint256 value = 100;

        return value.mul(10 ** shift);
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