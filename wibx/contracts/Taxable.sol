/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./TaxLib.sol";

/**
 * @title Taxable token
 *
 * @dev Manages dynamic taxes
 */
contract Taxable is Ownable
{
    /**
     * Tax recipient.
     */
    address internal constant _TAX_RECIPIENT_ADDR = 0x08B9C1aE682aD62119635b5C6044204971bf1575;

    /**
     * Modifiable tax container
     */
    TaxLib.DynamicTax private _taxContainer;

    constructor() public
    {
        /**
         * Tax: Starting at 0.9%
         */
        changeTax(9, 0);
    }

    /**
     * @dev Get the current tax amount
     */
    function currentTaxAmount() public view returns (uint256)
    {
        return _taxContainer.amount;
    }

    /**
     * @dev Get the current tax shift
     */
    function currentTaxShift() public view returns (uint256)
    {
        return _taxContainer.shift;
    }

    /**
     * @dev Change the dynamic tax.
     *
     * Just the contract admin can change the taxes.
     * The possible tax range is 0% ~ 3% and cannot exceed it.
     *
     * @param amount The new tax amount chosen
     * @param shift The shift power value
     */
    function changeTax(uint256 amount, uint8 shift) public onlyOwner
    {
        if (shift == 1)
        {
            require(amount <= 3, "You can't set a tax greater than 3%");
        }

        _taxContainer = TaxLib.DynamicTax(
            amount,
            shift,
            TaxLib.normalizeTaxAmount(amount, shift)
        );
    }

    /**
     * @dev Apply the tax based on the dynamic tax container
     *
     * @param value The value of transaction
     */
    function _applyTax(uint256 value) internal view returns (uint256)
    {
        return TaxLib.applyTax(
            _taxContainer.normalizedAmount,
            value
        );
    }
}