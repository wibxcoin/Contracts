// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";

contract WibooAccessControl is Initializable, AccessControl
{
    /**
     * @dev Constructor
     */
    function initialize() public payable initializer
    {
        // Grant the ADMIN ACL Role to the contract owner.
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    /**
     * @dev Check if the current message sender has the ADMIN ACL Role.
     */
    function onlyAdmin(address sender) public view
    {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, sender),
            "WibooAccessControl: caller is not the admin"
        );
    }
}
