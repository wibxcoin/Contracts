declare interface SettlementTransactionCTO extends FinFlowTransactionCTO
{
    /**
     * To user wallet
     */
    to: WalletCTO;

    /**
     * The tax amount paid
     */
    taxAmount: string;
}