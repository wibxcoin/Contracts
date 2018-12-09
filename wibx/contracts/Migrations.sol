/**
 * This smart contract code is Copyright 2018 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

pragma solidity ^0.4.24;

contract Migrations
{
    address public owner;
    uint public last_completed_migration;

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
        last_completed_migration = completed;
    }

    function upgrade(address new_address) public restricted
    {
        Migrations upgraded = Migrations(new_address);
        upgraded.setCompleted(last_completed_migration);
    }
}
