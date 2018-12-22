/**
 * Represents a deposit transaction.
 *
 * It occurs when some coins are transferred from the public to the private net.
 */
declare interface DepositTransactionCTO extends FinancialTransactionCTO
{
    /**
     * The origin ETH address of the coins
     */
    fromEthAddress: string;

    /**
     * Destination account
     */
    to: WalletCTO;
}