/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

pragma solidity 0.5.12;

/**
 * @title BCH Handled tokens contract
 *
 * @dev Revocable transfer delegation to the BCH module, opted in by each holder
 */
contract BCHHandled
{
    /**
     * The BCH module address.
     */
    address private _bchAddress;

    /**
     * Accounts whose holders delegated transfers to BCH.
     */
    mapping (address => bool) private _bchAllowed;

    /**
     * BCH Approval event
     */
    event BchApproval(address indexed to, bool state);

    constructor(address bchAddress) public
    {
        _bchAddress = bchAddress;
    }

    /**
     * @dev Check if the address holder delegated transfers to BCH.
     *
     * @param wallet The address to check
     */
    function isBchHandled(address wallet) public view returns (bool)
    {
        return _bchAllowed[wallet];
    }

    /**
     * @dev Delegate transfers of the caller tokens to BCH (revocable at any time).
     */
    function bchAuthorize() public returns (bool)
    {
        return _changeState(true);
    }

    /**
     * @dev Revoke the BCH delegation.
     */
    function bchRevoke() public returns (bool)
    {
        return _changeState(false);
    }

    /**
     * @dev Check if the holder delegated to BCH and the caller is BCH.
     *
     * @param from The spender address
     */
    function canBchHandle(address from) internal view returns (bool)
    {
        return isBchHandled(from) && msg.sender == _bchAddress;
    }

    /**
     * @dev Change the BCH delegation state
     *
     * @param state The new state
     */
    function _changeState(bool state) private returns (bool)
    {
        emit BchApproval(msg.sender, _bchAllowed[msg.sender] = state);

        return true;
    }
}