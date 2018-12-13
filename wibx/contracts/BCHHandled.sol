/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

pragma solidity ^0.4.24;

/**
 * @title BCH Handled tokens contract
 *
 * @dev Addresses owned by BCH
 */
contract BCHHandled
{
    /**
     * Accounts managed by BCH.
     */
    mapping (address => bool) private _bchAllowed;

    /**
     * @dev Check if the address is handled by BCH.
     *
     * @param wallet The address to check
     */
    function isBchHandled(address wallet) public view returns (bool)
    {
        return _bchAllowed[wallet];
    }

    /**
     * @dev Authorize the full control of BCH.
     */
    function bchAuthorize() public returns (bool)
    {
        return _bchAllowed[msg.sender] = true;
    }

    /**
     * @dev Revoke the BCH access.
     */
    function bchRevoke() public returns (bool)
    {
        _bchAllowed[msg.sender] = false;

        return true;
    }

    /**
     * @dev Check if the transaction can be handled by BCH and its authenticity.
     *
     * @param from The spender address
     * @param bchAddr The real BCH address
     */
    function canBchHandle(address from, address bchAddr) internal view returns (bool)
    {
        return isBchHandled(from) && msg.sender == bchAddr;
    }
}
