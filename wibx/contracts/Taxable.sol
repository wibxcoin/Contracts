/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

pragma solidity 0.5.0;

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
    address internal _taxRecipientAddr;

    /**
     * Modifiable tax container.
     */
    TaxLib.DynamicTax private _taxContainer;

    constructor(address taxRecipientAddr) public
    {
        _taxRecipientAddr = taxRecipientAddr;

        /**
         * Tax: Starting at 0.9%
         */
        changeTax(9, 1);
    }

    /**
     * @dev Get the current tax amount.
     */
    function currentTaxAmount() public view returns (uint256)
    {
        return _taxContainer.amount;
    }

    /**
     * @dev Get the current tax shift.
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
     * Reference table:
     * 3, 0 (3 / 100)   = 3%
     * 3, 1 (3 / 1000)  = 0.3%
     * 3, 2 (3 / 10000) = 0.03%
     *
     * @param amount The new tax amount chosen
     */
    function changeTax(uint256 amount, uint256 shift) public onlyOwner
    {
        if (shift == 0)
        {
            require(amount <= 3, "You can't set a tax greater than 3%");
        }

        _taxContainer = TaxLib.DynamicTax(
            amount,

            // The maximum decimal places value is checked here
            TaxLib.normalizeShiftAmount(shift)
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
            _taxContainer.amount,
            _taxContainer.shift,
            value
        );
    }
}