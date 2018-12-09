/**
 * Financial event when some withdraw occurs.
 */
declare interface WithdrawCTO extends FinancialEventCTO
{
    /**
     * The coin owner
     */
    from: WalletCTO;

    /**
     * The ETH address that will be transfered those coins
     */
    toEthAddress: string;
}