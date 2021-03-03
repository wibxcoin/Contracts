/**
 * This smart contract code is Copyright 2021 WiBOO. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "./WibooAccessControl.sol";
import "./FINLedger.sol";

contract BCHLedger is Initializable
{
    using SafeMath for uint256;

    FINLedger private _finLedger;
    WibooAccessControl private _wibooAccessControl;

    mapping(address => uint256) private _balances;

    event Deposit(
        address indexed externalFrom,
        address indexed to,
        uint256 amount,
        uint256 txnHash
    );
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 taxAmount
    );
    event Withdrawal(
        address indexed from,
        address indexed externalTo,
        uint256 amount,
        uint256 taxAmount,
        string journalAddr
    );

    function initialize(
        address finLedgerAddr,
        address wibooAccessControlAddr
    ) public payable initializer
    {
        _finLedger = FINLedger(finLedgerAddr);
        _wibooAccessControl = WibooAccessControl(wibooAccessControlAddr);
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount,
        uint256 taxAmount
    ) public
    {
        _wibooAccessControl.onlyAdmin();

        uint256 balance = _balances[from];
        (bool taxOperation, uint256 amountWithTax) = amount.tryAdd(taxAmount);

        require(taxOperation && balance >= amountWithTax, 'The origin account doesnt have funds to pay.');

        (bool fromOperation, uint256 newFromBalance) = balance.trySub(amountWithTax);
        (bool toOperation, uint256 newToBalance) = _balances[to].tryAdd(amount);

        require(fromOperation && toOperation, 'Overflow during transfer.');

        _balances[from] = newFromBalance;
        _balances[to] = newToBalance;

        emit Transfer(from, to, amount, taxAmount);
    }

    function deposit(
        address externalFrom,
        address to,
        uint256 amount,
        uint256 txnHash
    ) public
    {
        _wibooAccessControl.onlyAdmin();

        uint256 balance = _balances[to];
        (bool balanceOperation, uint256 newBalance) = balance.trySub(amount);

        require(balanceOperation, 'Overflow during deposit.');

        _balances[to] = newBalance;

        _finLedger.deposit(externalFrom, to, amount, txnHash);

        emit Deposit(externalFrom, to, amount, txnHash);
    }

    function withdrawal(
        address from,
        address externalTo,
        uint256 amount,
        uint256 taxAmount,
        string calldata journalAddr
    ) public
    {
        _wibooAccessControl.onlyAdmin();

        uint256 balance = _balances[from];
        (bool taxOperation, uint256 amountWithTax) = amount.tryAdd(taxAmount);

        require(taxOperation && balance >= amountWithTax, 'The origin account doesnt have funds to pay.');

        (bool fromOperation, uint256 newFromBalance) = balance.trySub(amountWithTax);

         require(fromOperation, 'Overflow during transfer.');

        _balances[from] = newFromBalance;

        emit Withdrawal(from, externalTo, amount, taxAmount, journalAddr);
    }
}