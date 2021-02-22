/**
 * This smart contract code is Copyright 2021 WiBOO. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/math/SafeMath.sol";

contract FINLedger
{
    using SafeMath for uint256;

    mapping(address => uint256) private _balances;
    mapping(address => uint256) private _reservations;

    event Reservation(
        address indexed from,
        uint256 amount
    );
    event Settlement(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 taxAmount
    );
    event Cancelation(
        address indexed from,
        uint256 amount
    );

    function getBalance(address from) public view returns (uint256)
    {
        return _balances[from];
    }

    function getReservation(address from) public view returns (uint256)
    {
        return _reservations[from];
    }

    function setBalance(address from, uint256 balance) public
    {
        _balances[from] = balance;
    }

    function setReservation(address from, uint256 reservation) public
    {
        _reservations[from] = reservation;
    }

    function setFinBalance(address from, uint256 balance, uint256 reservation) public
    {
        setBalance(from, balance);
        setReservation(from, reservation);
    }

    function deposit(
        address externalFrom,
        address to,
        uint256 amount,
        uint256 txnHash
    ) public
    {
        uint256 balance = _balances[to];

        (bool balanceOperation, uint256 newBalance) = balance.trySub(amount);

        require(balanceOperation, 'Overflow during deposit.');

        _balances[to] = newBalance;
    }

    function reserve(address from, uint256 amount) public
    {
        uint256 balance = _balances[from];

        require(balance >= amount, 'The origin account doesnt have funds to pay.');

        (bool balanceOperation, uint256 newBalance) = balance.trySub(amount);
        (bool reservationOperation, uint256 newReservation) = _reservations[from].tryAdd(amount);

        require(balanceOperation && reservationOperation, 'Overflow during reservation.');

        _balances[from] = newBalance;
        _reservations[from] = newReservation;

        emit Reservation(from, amount);
    }

    function settle(address from, address to, uint256 amount, uint256 taxAmount) public
    {
        uint256 reserved = _reservations[from];
        (bool taxOperation, uint256 amountWithTax) = amount.tryAdd(taxAmount);

        require(taxOperation && reserved >= amountWithTax, 'The origin account doesnt have funds to pay.');

        (bool balanceOperation, uint256 newToBalance) = _balances[to].tryAdd(amount);
        (bool reservationOperation, uint256 newFromReservation) = reserved.trySub(amountWithTax);

        require(balanceOperation && reservationOperation, 'Overflow during settlement.');

        _balances[to] = newToBalance;
        _reservations[from] = newFromReservation;

        emit Settlement(from, to, amount, taxAmount);
    }

    function cancel(address from, uint256 amount) public
    {
        uint256 reserved = _reservations[from];

        require(reserved >= amount, 'The origin account doesnt have funds to pay.');

        (bool balanceOperation, uint256 newBalance) = _balances[from].tryAdd(amount);
        (bool reservationOperation, uint256 newReservation) = reserved.trySub(amount);

        require(balanceOperation && reservationOperation, 'Overflow during cancelation.');

        _balances[from] = newBalance;
        _reservations[from] = newReservation;

        emit Cancelation(from, amount);
    }
}