/**
 * This smart contract code is Copyright 2021 WiBOO. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.4.22 <0.9.0;

contract IndicationEngagement
{
    struct Indication
    {
        string id;
        string id_campaign;
        string id_item;
        uint256 amount_item;
        uint256 amount_reward;
        uint256 when;
    }

    mapping(address => Indication) private _indications;

    function addIndication(
        address key,
        string calldata id,
        string calldata id_campaign,
        string calldata id_item,
        uint256 amount_item,
        uint256 amount_reward,
        uint256 when
    ) public
    {
        _indications[key] = Indication({
            id: id,
            id_campaign: id_campaign,
            id_item: id_item,
            amount_item: amount_item,
            amount_reward: amount_reward,
            when: when
        });
    }

    function getIndication(address key) public view returns (
        address to,
        string memory id,
        string memory id_campaign,
        string memory id_item,
        uint256 amount_item,
        uint256 amount_reward,
        uint256 when
    )
    {
        Indication memory indication = _indications[key];

        return (
            key,
            indication.id,
            indication.id_campaign,
            indication.id_item,
            indication.amount_item,
            indication.amount_reward,
            indication.when
        );
    }
}