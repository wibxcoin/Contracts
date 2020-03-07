/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

pragma solidity 0.5.12;

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
     * Considering a tax that will be applied over a value, what is
     * the value to request as trasnfer amount and make the sender balance
     * to be zero as resultant.
     *
     * @param value the amount that will transferred.
     */
    function calculateAmountToCleanBalance(uint256 taxAmount, uint256 shift, uint256 value) internal pure returns (uint256)
    {
        uint256 base = 1000;
        uint256 errorPropagator = base * 10; // this will add one more digit for error propagation.
        uint256 dividend = base.mul(taxAmount).div(shift).add(base);
        return _roundDivision(value.mul(errorPropagator).div(dividend));
    }

    /**
     * When executing some divisions that overflow 18 digits, this is consider
     * the 19th digit and return plus one in the 18 digit.
     */
    function _roundDivision(uint256 value) internal pure returns (uint256)
    {
        return value.add(10).div(10);
    }
    /**
     * Return amount plus the tax that will transferred from the sender.
     */
    function totalAmountTransfer(uint256 taxAmount, uint256 shift, uint256 value) internal pure returns (uint256)
    {
        return applyTax(
            taxAmount,
            shift,
            value
        ).add(value);
    }
}