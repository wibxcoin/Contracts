/**
 * Financial event when some withdrawal occurs.
 */
declare interface WithdrawCTO extends FinancialEventCTO
{
    /**
     * The coin owner
     */
    from: WalletCTO;

    /**
     * The ETH address which will be transferred the coins.
     */
    toEthAddress: string;
}