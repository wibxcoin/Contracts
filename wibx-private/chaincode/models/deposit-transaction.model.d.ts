/**
 * Represents a deposit transaction.
 *
 * It occours when some coins are transfered from the public net and are injected
 * into the game.
 */
declare interface DepositTransactionCTO extends FinancialTransactionCTO
{
    /**
     * The ETH address that comes those coins
     */
    fromEthAddress: string;

    /**
     * Destiny account
     */
    to: WalletCTO;
}