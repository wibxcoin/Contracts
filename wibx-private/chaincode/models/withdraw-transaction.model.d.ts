/**
 * Represents a withdraw operation.
 *
 * It occurs when some coins are transferred to the external net.
 */
declare interface WithdrawTransactionCTO extends FinancialTransactionCTO
{
    /**
     * The coin owner
     */
    from: WalletCTO;

    /**
     * The origin ETH address of the coins.
     */
    toEthAddress: string;

    /**
     * Tax paid
     */
    taxAmount: string;
}