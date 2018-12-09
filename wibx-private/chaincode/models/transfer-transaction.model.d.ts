/**
 * Represents a financial transaction that transfer coins from some Wallet
 * to another.
 */
declare interface TransferTransactionCTO extends FinancialTransactionCTO
{
    /**
     * The coin owner
     */
    from: WalletCTO;

    /**
     * Destiny account
     */
    to: WalletCTO;
}