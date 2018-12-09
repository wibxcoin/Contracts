/**
 * Financial event when some deposit occurs.
 */
declare interface DepositCTO extends FinancialEventCTO
{
    /**
     * The coin owner
     */
    fromEthAddress: string;

    /**
     * Destiny account
     */
    to: WalletCTO;
}