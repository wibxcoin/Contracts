/**
 * Represents a financial transaction that transfer coins between wallets. 
 */
declare interface TransferTransactionCTO extends FinancialTransactionCTO
{
    /**
     * The coin owner
     */
    from: WalletCTO;

    /**
     * Destination account
     */
    to: WalletCTO;
}