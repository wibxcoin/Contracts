/**
 * This smart contract code is Copyright 2021 WiBOO. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.4.22 <0.9.0;

contract ShareEngagement
{
    struct Share
    {
        string id;
        string id_campaign;
        uint256 token;
        uint16 media;
        uint256 amount;
        uint16 status;
        uint256 when;
    }

    mapping(address => Share) private _shares;

    function addShare(
        address key,
        string calldata id,
        string calldata id_campaign,
        uint256 token,
        uint16 media,
        uint256 amount,
        uint16 status,
        uint256 when
    ) public
    {
        _shares[key] = Share({
            id: id,
            id_campaign: id_campaign,
            token: token,
            media: media,
            amount: amount,
            status: status,
            when: when
        });
    }

    function getShare(address key) public view returns (
        address to,
        string memory id,
        string memory id_campaign,
        uint256 token,
        uint16 media,
        uint256 amount,
        uint16 status,
        uint256 when
    )
    {
        Share memory share = _shares[key];

        return (
            to,
            share.id,
            share.id_campaign,
            share.token,
            share.media,
            share.amount,
            share.status,
            share.when
        );
    }
}