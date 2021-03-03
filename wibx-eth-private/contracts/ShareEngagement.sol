/**
 * This smart contract code is Copyright 2021 WiBOO. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "./WibooAccessControl.sol";

contract ShareEngagement is Initializable
{
    struct Share
    {
        string id;
        string idCampaign;
        uint256 token;
        uint16 media;
        uint256 amount;
        uint16 status;
        uint256 when;
    }

    event ShareCreated
    (
        address to,
        string id,
        string idCampaign,
        uint256 token,
        uint16 media,
        uint256 amount,
        uint16 status,
        uint256 when
    );

    WibooAccessControl internal _wibooAccessControl;

    mapping(address => mapping(string => Share)) internal _shares;

    function initialize(
        address wibooAccessControlAddr
    ) public payable initializer
    {
        _wibooAccessControl = WibooAccessControl(wibooAccessControlAddr);
    }

    function addShare(
        address key,
        string calldata id,
        string calldata idCampaign,
        uint256 token,
        uint16 media,
        uint256 amount,
        uint16 status,
        uint256 when
    ) public
    {
        _wibooAccessControl.onlyAdmin(msg.sender);

        _shares[key][id] = Share({
            id: id,
            idCampaign: idCampaign,
            token: token,
            media: media,
            amount: amount,
            status: status,
            when: when
        });

        emit ShareCreated(key, id, idCampaign, token, media, amount, status, when);
    }

    function getShare(address key, string calldata idShare) public view returns (
        address to,
        string memory id,
        string memory idCampaign,
        uint256 token,
        uint16 media,
        uint256 amount,
        uint16 status,
        uint256 when
    )
    {
        Share memory share = _shares[key][idShare];

        return (
            key,
            share.id,
            share.idCampaign,
            share.token,
            share.media,
            share.amount,
            share.status,
            share.when
        );
    }
}