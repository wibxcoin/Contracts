/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "./BCHHandled.sol";
import "./TaxLib.sol";

/**
 * @title WiBX Utility Token
 *
 * @dev Implementation of the main WiBX token smart contract.
 */
contract WibxToken is ERC20, ERC20Detailed, BCHHandled
{
    /**
     * 12 billion tokens raised by 18 decimal places.
     */
    uint256 public constant INITIAL_SUPPLY = 12000000000 * (10 ** uint256(18));

    /**
     * Tax recipient.
     */
    address private constant TAX_RECIPIENT_ADDR = 0x08B9C1aE682aD62119635b5C6044204971bf1575;

    /**
     * Tax amount per each transaction (in %).
     */
    uint8 private constant TAX_RECIPIENT_AMOUNT = 35;

    /**
     * The BCH module address.
     */
    address private _bchAddress;

    constructor(address bchAddress) public ERC20Detailed("WiBX Utility Token", "WBX", 18)
    {
        _bchAddress = bchAddress;

        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @dev Overrides the OpenZeppelin default transfer
     *
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     * @return If the operation was successful
     */
    function transfer(address to, uint256 value) public returns (bool)
    {
        return _fullTransfer(msg.sender, to, value);
    }

    /**
     * @dev Special WBX transfer tokens from one address to another checking the access for BCH
     *
     * @param from address The address which you want to send tokens from
     * @param to address The address which you want to transfer to
     * @param value uint256 the amount of tokens to be transferred
     * @return If the operation was successful
     */
    function transferFrom(address from, address to, uint256 value) public returns (bool)
    {
        if (canBchHandle(from, _bchAddress))
        {
            return _fullTransfer(from, to, value);
        }

        uint256 taxValue = TaxLib.applyTax(TAX_RECIPIENT_AMOUNT, 0, value);

        // Transfer the tax to the recipient
        super.transferFrom(from, TAX_RECIPIENT_ADDR, taxValue);

        // Transfer user's tokens
        super.transferFrom(from, to, TaxLib.netValue(taxValue, value));

        return true;
    }

    /**
     * @dev Batch token transfer
     *
     * @param recipients The recipients for transfer to
     * @param values The values
     * @param from Spender address
     * @return If the operation was successful
     */
    function sendBatch(address[] recipients, uint256[] values, address from) public returns (bool)
    {
        require(recipients.length == values.length, "Wrong data");

        for (uint256 i = 0; i < values.length; i = i.add(1))
        {
            if (msg.sender == from)
            {
                _fullTransfer(from, recipients[i], values[i]);
            }
            else
            {
                transferFrom(from, recipients[i], values[i]);
            }
        }

        return true;
    }

    /**
     * @dev Special WBX transfer token for a specified address.
     *
     * @param from The address of the spender
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     * @return If the operation was successful
     */
    function _fullTransfer(address from, address to, uint256 value) private returns (bool)
    {
        uint256 taxValue = TaxLib.applyTax(TAX_RECIPIENT_AMOUNT, 0, value);

        // Transfer the tax to the recipient
        _transfer(from, TAX_RECIPIENT_ADDR, taxValue);

        // Transfer user's tokens
        _transfer(from, to, TaxLib.netValue(taxValue, value));

        return true;
    }
}