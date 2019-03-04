/**
 * Generic FIN transaction
 */
declare interface FinFlowTransactionCTO
{
    /**
     * From user wallet
     */
    from: WalletCTO;

    /**
     * Amount of the transaction (WEI)
     */
    amount: string;
}