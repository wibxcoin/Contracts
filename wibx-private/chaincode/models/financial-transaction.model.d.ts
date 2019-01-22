/**
 * Base for all financial transactions
 */
declare interface FinancialTransactionCTO
{
    /**
     * Public network transaction id
     */
    ethTransactionId: string;

    /**
     * Optional extra identification
     */
    externalId?: string;

    /**
     * Coin amount
     */
    amount: string;

    /**
     * Text describing the transaction
     */
    description: string;
}