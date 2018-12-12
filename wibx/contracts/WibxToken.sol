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
     * Tax recipient
     */
    address private _taxRecipientAddr = 0x08B9C1aE682aD62119635b5C6044204971bf1575;

    /**
     * Tax amount per each transaction
     */
    uint8 private _taxRecipientAmount = 35;

    constructor() public ERC20Detailed("WiBX Utility Token", "WBX", 18)
    {
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
        require(value <= balanceOf(msg.sender), "No balance");
        require(to != address(0), "Ghost addr");

        uint256 taxValue = TaxLib.applyTax(_taxRecipientAmount, 0, value);

        // Transfer the tax to the recipient
        _transfer(msg.sender, _taxRecipientAddr, taxValue);

        // Transfer user's tokens
        _transfer(msg.sender, to, TaxLib.netValue(taxValue, value));

        return true;
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
        require(value <= balanceOf(from), "No balance");
        require(to != address(0), "Ghost addr");

        if (isBchHandled(from))
        {
            require(approve(BCH_ADDR, value), "Issue approving BCH authorization");
        }

        require(value <= allowance(from, msg.sender), "Not allowed");

        uint256 taxValue = TaxLib.applyTax(_taxRecipientAmount, 0, value);

        // Transfer the tax to the recipient
        super.transferFrom(from, _taxRecipientAddr, taxValue);

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

        for (uint256 i = 0; i < values.length; i++)
        {
            require(transferFrom(from, recipients[i], values[i]), "Issue on transfer");
        }

        return true;
    }
}