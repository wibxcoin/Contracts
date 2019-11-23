/**
 * This smart contract code is Copyright 2019 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

pragma solidity 0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./VestingLib.sol";
import "./WibxToken.sol";

/**
 * @title WiBX Token Vesting
 *
 * @dev Implementation of the team token vesting
 */
contract WibxTokenVesting is Ownable
{
    using SafeMath for uint256;

    /**
     * Wibx Token Instance
     */
    WibxToken private _wibxToken;

    /**
     * All team members
     */
    mapping (address => VestingLib.TeamMember) private _members;

    /**
     * Total Wibx tokens allocated in this vesting contract
     */
    uint256 private _alocatedWibxVestingTokens = 0;

    constructor(address wibxTokenAddress) public
    {
        _wibxToken = WibxToken(wibxTokenAddress);
    }

    /**
     * @dev Add a new team member to withdrawal tokens.
     *
     * @param wallet The member wallet address
     * @param tokenAmount The token amount desired by the team member
     * @return If the transaction was successful
     */
    function addTeamMember(address wallet, uint256 tokenAmount) public onlyOwner returns (bool)
    {
        require(!_members[wallet].active, "Member already added");

        uint256 firstTransfer;
        uint256 eachMonthTransfer;

        _alocatedWibxVestingTokens = _alocatedWibxVestingTokens.add(tokenAmount);
        (firstTransfer, eachMonthTransfer) = VestingLib._calculateMemberEarnings(tokenAmount);

        _members[wallet] = VestingLib.TeamMember({
            totalRemainingAmount: tokenAmount,
            firstTransferValue: firstTransfer,
            eachTransferValue: eachMonthTransfer,
            nextWithdrawal: 0,
            active: true
        });

        return _members[wallet].active;
    }

    /**
     * @dev Withdrawal team tokens to the selected wallet
     *
     * @param wallet The team member wallet
     * @return If the transaction was successful
     */
    function withdrawal(address wallet) public returns (bool)
    {
        VestingLib.TeamMember storage member = _members[wallet];

        require(member.active, "The team member is not found");
        require(member.totalRemainingAmount > 0, "There is no more tokens to transfer to this wallet");

        uint256 amountToTransfer = VestingLib._checkAmountForPay(member);
        require(totalWibxVestingSupply() >= amountToTransfer, "The contract doesnt have founds to pay");

        uint256 nextWithdrawalTime = VestingLib._updateNextWithdrawalTime(member.nextWithdrawal);

        _wibxToken.transfer(wallet, amountToTransfer);

        member.nextWithdrawal = nextWithdrawalTime;
        member.totalRemainingAmount = member.totalRemainingAmount.sub(amountToTransfer);
        _alocatedWibxVestingTokens = _alocatedWibxVestingTokens.sub(amountToTransfer);

        return true;
    }

    /**
     * @dev Clean everything and terminate this token vesting
     */
    function terminateTokenVesting() public onlyOwner
    {
        require(_alocatedWibxVestingTokens == 0, "All withdrawals have yet to take place");

        if (totalWibxVestingSupply() > 0)
        {
            _wibxToken.transfer(_wibxToken.taxRecipientAddr(), totalWibxVestingSupply());
        }

        /**
         * Due to the Owner's Ownable (from OpenZeppelin) is not flagged as payable,
         * we need to cast it here.
         */
        selfdestruct(address(uint160(owner())));
    }

    /**
     * @dev Get the token supply in this contract to be delivered to team members.
     */
    function totalWibxVestingSupply() public view returns (uint256)
    {
        return _wibxToken.balanceOf(address(this));
    }

    /**
     * @dev Returns all tokens allocated to users.
     */
    function totalAlocatedWibxVestingTokens() public view returns (uint256)
    {
        return _alocatedWibxVestingTokens;
    }

    /**
     * @dev Get the remaining token for some member.
     *
     * @param wallet The member's wallet address.
     */
    function remainingTokenAmount(address wallet) public view returns (uint256)
    {
        return _members[wallet].totalRemainingAmount;
    }

    /**
     * @dev Get the next withdrawal day of the user.
     *
     * @param wallet The member's wallet address.
     */
    function nextWithdrawalTime(address wallet) public view returns (uint256)
    {
        return _members[wallet].nextWithdrawal;
    }
}