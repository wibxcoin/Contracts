/**
 * This smart contract code is Copyright 2021 WiBOO. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "./WibooAccessControl.sol";

contract IndicationEngagement is Initializable
{
    struct Indication
    {
        string id;
        string idCampaign;
        string idItem;
        uint256 amountItem;
        uint256 amountReward;
        uint256 when;
    }

    event IndicationCreated
    (
        address to,
        string id,
        string idCampaign,
        string idItem,
        uint256 amountItem,
        uint256 amountReward,
        uint256 when
    );

    WibooAccessControl internal _wibooAccessControl;

    mapping(address => mapping(string => Indication)) internal _indications;

    function initialize(
        address wibooAccessControlAddr
    ) public payable initializer
    {
        _wibooAccessControl = WibooAccessControl(wibooAccessControlAddr);
    }

    function addIndication(
        address key,
        string calldata id,
        string calldata idCampaign,
        string calldata idItem,
        uint256 amountItem,
        uint256 amountReward,
        uint256 when
    ) public
    {
        _wibooAccessControl.onlyAdmin(msg.sender);

        _indications[key][id] = Indication({
            id: id,
            idCampaign: idCampaign,
            idItem: idItem,
            amountItem: amountItem,
            amountReward: amountReward,
            when: when
        });

        emit IndicationCreated(key, id, idCampaign, idItem, amountItem, amountReward, when);
    }

    function getIndication(address key, string calldata idIndication) public view returns (
        address to,
        string memory id,
        string memory idCampaign,
        string memory idItem,
        uint256 amountItem,
        uint256 amountReward,
        uint256 when
    )
    {
        Indication memory indication = _indications[key][idIndication];

        return (
            key,
            indication.id,
            indication.idCampaign,
            indication.idItem,
            indication.amountItem,
            indication.amountReward,
            indication.when
        );
    }
}