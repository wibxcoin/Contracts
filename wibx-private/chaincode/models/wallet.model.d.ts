declare interface WalletCTO
{
    idWallet: string;

    /**
     * The public key of the wallet
     */
    publicKey: string;

    /**
     * The coin balance of this wallet
     */
    balance: string;
}