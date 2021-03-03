// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract WibooAccessControl is AccessControl
{
    /**
     * @dev Check if the current message sender has the ADMIN ACL Role.
     */
    function onlyAdmin() public view
    {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "WibooAccessControl: caller is not the admin"
        );
    }
}
