/**
 * This smart contract code is Copyright 2019 WiBX. For more information see https://wibx.io
 *
 * Licensed under the Apache License, version 2.0: https://github.com/wibxcoin/Contracts/LICENSE.txt
 */

pragma solidity 0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./TaxLib.sol";

/**
 * @title Vesting Library
 *
 * @dev Helpers for vesting
 */
library VestingLib
{
    using SafeMath for uint256;

    /**
     * Period to get tokens (bimester).
     */
    uint256 private constant _timeShiftPeriod = 60 days;

    struct TeamMember
    {
        /**
         * User's next token withdrawal
         */
        uint256 nextWithdrawal;

        /**
         * Remaining tokens to be released
         */
        uint256 totalRemainingAmount;

        /**
         * GAS Optimization.
         * Calculates the transfer value for the first time (20%)
         */
        uint256 firstTransferValue;

        /**
         * GAS Optimization.
         * Calculates the transfer value for each month (10%)
         */
        uint256 eachTransferValue;

        /**
         * Check if this member is active
         */
        bool active;
    }

    /**
     * @dev Calculate the member earnings according to the rules of the board.
     *
     * @param tokenAmount The total user token amount
     * @return The first transfer amount and the other months amount.
     */
    function _calculateMemberEarnings(uint256 tokenAmount) internal pure returns (uint256, uint256)
    {
        // 20% on the first transfer (act)
        uint256 firstTransfer = TaxLib.applyTax(20, 100, tokenAmount);

        // 10% for the other months
        uint256 eachMonthTransfer = TaxLib.applyTax(10, 100, tokenAmount.sub(firstTransfer));

        return (firstTransfer, eachMonthTransfer);
    }

    /**
     * @dev Updates the date to the next user's withdrawal.
     *
     * @param oldWithdrawal The last user's withdrawal
     */
    function _updateNextWithdrawalTime(uint256 oldWithdrawal) internal view returns (uint256)
    {
        uint currentTimestamp = block.timestamp;

        require(oldWithdrawal <= currentTimestamp, "You need to wait the next withdrawal period");

        /**
         * If is the user's first withdrawal, get the time of the first transfer
         * and adds plus the time shift period.
         */
        if (oldWithdrawal == 0)
        {
            return _timeShiftPeriod.add(currentTimestamp);
        }

        /**
         * Otherwise adds the time shift period to the previous withdrawal date to avoid
         * unnecessary waitings.
         */
        return oldWithdrawal.add(_timeShiftPeriod);
    }

    /**
     * @dev Calculates the amount to pay taking into account the first transfer rule.
     *
     * @param member The team member container
     * @return The amount for pay
     */
    function _checkAmountForPay(TeamMember memory member) internal pure returns (uint256)
    {
        /**
         * First user transference. It should be 20%.
         */
        if (member.nextWithdrawal == 0)
        {
            return member.firstTransferValue;
        }

        /**
         * Check for avoid rounding errors.
         */
        return member.eachTransferValue >= member.totalRemainingAmount
            ? member.totalRemainingAmount
            : member.eachTransferValue;
    }
}