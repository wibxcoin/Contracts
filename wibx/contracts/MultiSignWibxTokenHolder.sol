/**
 * This smart contract code is Copyright 2019 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

pragma solidity 0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./WibxToken.sol";

/**
 * @title Multi sign WiBX token holder
 *
 * @dev Implementation of a multi sign wibx wallet
 */
contract MultiSignWibxTokenHolder is Ownable
{
    struct TransferIntent
    {
        address owner;
        bool active;
        bool accomplished;
        address to;
        uint256 amount;
        uint256 timestamp;
        mapping (address => bool) intentSigners;
        uint256 signatures;
    }

    /**
     * Wibx Token Instance
     */
    WibxToken private _wibxToken;

    /**
     * All contract signers
     */
    mapping (address => bool) private _signers;
    uint256 private _signersCount = 0;

    /**
     * All transfer intents
     */
    mapping (bytes20 => TransferIntent) private _transferIntents;
    uint256 private _intentCount = 0;

    constructor(address wibxTokenAddress) public
    {
        _wibxToken = WibxToken(wibxTokenAddress);
    }

    /**
     * @dev Add a new signer to manipulate and sign transfers.
     *
     * @param signer The member to add
     * @return If the transaction was successful
     */
    function addSigner(address signer) public onlyOwner returns (bool)
    {
        if (_signers[signer] == false)
        {
            _signersCount++;
        }

        return _signers[signer] = true;
    }

    /**
     * @dev Get the token supply in this contract to be delivered to team members.
     */
    function getBalanceSupply() public view returns (uint256)
    {
        return _wibxToken.balanceOf(address(this));
    }

    /**
     * @dev Add a new transfer intent
     *
     * @param to The destiny account
     * @param amount The amount to transfer
     * @return The transferId to be signed
     */
    function addTransferIntent(address to, uint256 amount) public returns (bytes20 transferId)
    {
        require(to != address(0));
        require(_isSigner(msg.sender), "You need be a signer to intent transfers");
        require(amount > 0 && amount < _wibxToken.INITIAL_SUPPLY(), "Invalid amount");

        TransferIntent storage intent = _transferIntents[transferId = _generateTransactionHash()];

        intent.owner = msg.sender;
        intent.active = true;
        intent.accomplished = false;
        intent.to = to;
        intent.amount = amount;
        intent.timestamp = now;
        intent.intentSigners[msg.sender] = true;
        intent.signatures = 1;

        _intentCount++;
    }

    /**
     * @dev Sign a transfer intent
     *
     * @param transferId The intent ID to be signed
     * @return If it's successfully accomplished.
     */
    function signIntent(bytes20 transferId) public returns (bool)
    {
        require(_isSigner(msg.sender), "You need be a signer to intent transfers");

        TransferIntent storage intent = _transferIntents[transferId];

        if (intent.intentSigners[msg.sender] != true)
        {
            intent.intentSigners[msg.sender] = true;
            intent.signatures++;
        }

        if (intent.signatures == _signersCount)
        {
            _wibxToken.transfer(intent.to, intent.amount);
            intent.accomplished = true;
        }

        return true;
    }

    /**
     * @dev Check if address is a signer.
     *
     * @param signer The address
     * @return It its a singer
     */
    function _isSigner(address signer) internal view returns (bool)
    {
        return _signers[signer];
    }

    /**
     * @dev Generate a unique transaction hash for transfer intents.
     *
     * @return The new blob id
     */
    function _generateTransactionHash() internal view returns (bytes20 blobId)
    {
        // Generate the blobId.
        blobId = bytes20(keccak256(abi.encodePacked(
            msg.sender,
            blockhash(block.number - 1),
            _intentCount
        )));

        // Make sure this blobId has not been used before (could be in the same block).
        while (_transferIntents[blobId].active)
        {
            blobId = bytes20(keccak256(abi.encodePacked(blobId)));
        }
    }
}