/**
 * Financial event when some transaction occurs.
 * Based on ERC-20
 */
declare interface TransferCTO extends FinancialEventCTO
{
    /**
     * The coin owner
     */
    from: WalletCTO;

    /**
     * Destination account
     */
    to: WalletCTO;

    /**
     * Tax paid
     */
    taxAmount: string;
}