/**
 * This smart contract code is Copyright 2021 WiBOO. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "./WibooAccessControl.sol";

contract ReferralEngagement is Initializable
{
    struct Referral
    {
        string id;
        string ref_conf_id;
        address from;
        uint256 amount;
        uint8 status;
        uint256 when;
    }

    event ReferralCreated
    (
        address to,
        string id,
        string ref_conf_id,
        address from,
        uint256 amount,
        uint8 status,
        uint256 when
    );

    WibooAccessControl internal _wibooAccessControl;

    mapping(address => mapping(string => Referral)) internal _referrals;

    function initialize(
        address wibooAccessControlAddr
    ) public payable initializer
    {
        _wibooAccessControl = WibooAccessControl(wibooAccessControlAddr);
    }

    function addReferral(
        address key,
        string calldata id,
        string calldata ref_conf_id,
        address from,
        uint256 amount,
        uint8 status,
        uint256 when
    ) public
    {
        _wibooAccessControl.onlyAdmin(msg.sender);

        _referrals[key][id] = Referral({
            id: id,
            ref_conf_id: ref_conf_id,
            from: from,
            amount: amount,
            status: status,
            when: when
        });

        emit ReferralCreated(key, id, ref_conf_id, from, amount, status, when);
    }

    function getReferral(
        address key,
        string calldata id_ref
    ) public view returns (
        address to,
        string memory id,
        string memory ref_conf_id,
        address from,
        uint256 amount,
        uint8 status,
        uint256 when
    )
    {
        Referral memory referral = _referrals[key][id_ref];

        return (
            key,
            referral.id,
            referral.ref_conf_id,
            referral.from,
            referral.amount,
            referral.status,
            referral.when
        );
    }
}