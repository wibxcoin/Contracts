/**
 * Financial event when some withdrawal occurs.
 */
declare interface WithdrawEventCTO extends FinancialEventCTO
{
    /**
     * The coin owner
     */
    from: WalletCTO;

    /**
     * The ETH address which will be transferred the coins.
     */
    toEthAddress: string;

    /**
     * Tax paid
     */
    taxAmount: string;
}