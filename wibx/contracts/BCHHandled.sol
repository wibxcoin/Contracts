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
     * The BCH address
     */
    address internal constant BCH_ADDR = 0xc5A9007407FBa42285E15f1cA90779D130C93C29;

    mapping (address => bool) private _allowed;

    /**
     * @dev Check if the address is handled by BCH
     *
     * @param wallet The address to check
     */
    function isBchHandled(address wallet) public view returns (bool)
    {
        return _allowed[wallet];
    }

    /**
     * @dev Authorize the full control of the BCH
     */
    function bchAuthorize() public returns (bool)
    {
        return _allowed[msg.sender] = true;
    }

    /**
     * @dev Revoke the BCH access
     */
    function bchRevoke() public returns (bool)
    {
        _allowed[msg.sender] = false;

        return true;
    }
}
