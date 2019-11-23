/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

pragma solidity 0.5.0;

contract Migrations
{
    address public owner;
    uint public lastCompletedMigration;

    constructor() public
    {
        owner = msg.sender;
    }

    modifier restricted()
    {
        if (msg.sender == owner) _;
    }

    function setCompleted(uint completed) public restricted
    {
        lastCompletedMigration = completed;
    }

    function upgrade(address newAddress) public restricted
    {
        Migrations upgraded = Migrations(newAddress);
        upgraded.setCompleted(lastCompletedMigration);
    }
}
