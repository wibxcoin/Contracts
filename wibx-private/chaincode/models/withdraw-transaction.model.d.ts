/**
 * Represents a withdraw operation.
 *
 * It occours when some coins are transfered to the external net.
 */
declare interface WithdrawTransactionCTO extends FinancialTransactionCTO
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