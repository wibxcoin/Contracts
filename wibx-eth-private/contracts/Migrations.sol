/**
 * This smart contract code is Copyright 2021 WiBOO. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.4.22 <0.9.0;

contract Migrations
{
    address public owner = msg.sender;
    uint public last_completed_migration;

    modifier restricted()
    {
        require(
            msg.sender == owner,
            "This function is restricted to the contract's owner"
        );

        _;
    }

    function setCompleted(uint completed) public restricted
    {
        last_completed_migration = completed;
    }
}
