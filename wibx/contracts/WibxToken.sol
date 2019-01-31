/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

pragma solidity 0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Pausable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Taxable.sol";
import "./BCHHandled.sol";
import "./TaxLib.sol";

/**
 * @title WiBX Utility Token
 *
 * @dev Implementation of the main WiBX token smart contract.
 */
contract WibxToken is ERC20Pausable, ERC20Detailed, Taxable, BCHHandled
{
    /**
     * 12 billion tokens raised by 18 decimal places.
     */
    uint256 public constant INITIAL_SUPPLY = 12000000000 * (10 ** 18);

    constructor(address bchAddress, address taxRecipientAddr) public ERC20Detailed("WiBX Utility Token", "WBX", 18)
                                                                     BCHHandled(bchAddress)
                                                                     Taxable(taxRecipientAddr)
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
        if (canBchHandle(from))
        {
            return _fullTransfer(from, to, value);
        }

        /*
         * Exempting the tax account to avoid an infinite loop in transferring values from this wallet.
         */
        if (from == _taxRecipientAddr)
        {
            super.transferFrom(from, to, value);

            return true;
        }

        uint256 taxValue = _applyTax(value);

        // Transfer the tax to the recipient
        super.transferFrom(from, _taxRecipientAddr, taxValue);

        // Transfer user's tokens
        super.transferFrom(from, to, TaxLib.netValue(taxValue, value));

        return true;
    }

    /**
     * @dev Batch token transfer (maxium 100 transfers)
     *
     * @param recipients The recipients for transfer to
     * @param values The values
     * @param from Spender address
     * @return If the operation was successful
     */
    function sendBatch(address[] memory recipients, uint256[] memory values, address from) public returns (bool)
    {
        /*
         * The maximum batch send should be 100 transactions.
         * Each transaction we recommend 65000 of GAS limit and the maximum block size is 6700000.
         * 6700000 / 65000 = ~103.0769 ∴ 100 transacitons (safe rounded).
         */
        uint maxTransactionCount = 100;
        uint transactionCount = recipients.length;

        require(transactionCount <= maxTransactionCount, "Max transaction count violated");
        require(transactionCount == values.length, "Wrong data");

        if (msg.sender == from)
        {
            return _sendBatchSelf(recipients, values, transactionCount);
        }

        return _sendBatchFrom(recipients, values, from, transactionCount);
    }

    /**
     * @dev Batch token transfer from MSG sender
     *
     * @param recipients The recipients for transfer to
     * @param values The values
     * @param transactionCount Total transaction count
     * @return If the operation was successful
     */
    function _sendBatchSelf(address[] memory recipients, uint256[] memory values, uint transactionCount) private returns (bool)
    {
        for (uint i = 0; i < transactionCount; i++)
        {
            _fullTransfer(msg.sender, recipients[i], values[i]);
        }

        return true;
    }

    /**
     * @dev Batch token transfer from other sender
     *
     * @param recipients The recipients for transfer to
     * @param values The values
     * @param from Spender address
     * @param transactionCount Total transaction count
     * @return If the operation was successful
     */
    function _sendBatchFrom(address[] memory recipients, uint256[] memory values, address from, uint transactionCount) private returns (bool)
    {
        for (uint i = 0; i < transactionCount; i++)
        {
            transferFrom(from, recipients[i], values[i]);
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
        /*
         * Exempting the tax account to avoid an infinite loop in transferring values from this wallet.
         */
        if (from == _taxRecipientAddr)
        {
            _transfer(from, to, value);

            return true;
        }

        uint256 taxValue = _applyTax(value);

        // Transfer the tax to the recipient
        _transfer(from, _taxRecipientAddr, taxValue);

        // Transfer user's tokens
        _transfer(from, to, TaxLib.netValue(taxValue, value));

        return true;
    }
}