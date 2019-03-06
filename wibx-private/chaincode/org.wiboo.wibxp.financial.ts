/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/**
 * Function to process the transfer transaction.
 *
 * @param {org.wiboo.wibxp.financial.TransferTransaction} tx The financial transaction
 * @transaction
 */
async function transferTransaction(tx: TransferTransactionCTO): Promise<void>
{
    // Check if the amount is valid
    isAmountValid(tx.amount);

    // Full amount with taxes
    const amountWithTax: string = SafeMath.add(tx.amount, tx.taxAmount);

    // Check if the origin account has funds to transfer
    assert(SafeMath.gte(tx.from.balance, amountWithTax), 'The origin account doesnt have funds to pay.');

    tx.from.balance = SafeMath.sub(tx.from.balance, amountWithTax);
    tx.to.balance = SafeMath.add(tx.to.balance, tx.amount);

    // Update participants (Wallets)
    const walletParticipant: HyperledgerParticipant<WalletCTO> = await getParticipantRegistry<WalletCTO>(
        entities.wallet
    );

    await walletParticipant.update(tx.from);
    await walletParticipant.update(tx.to);

    // Emit events
    const transferEvent: HyperledgerEvent<TransferCTO> = getFactory().newEvent<TransferCTO>(
        namespaces.financial,
        entities.transfer
    );

    Object.assign<TransferCTO, TransferCTO>(transferEvent, {
        from: tx.from,
        to: tx.to,
        amount: tx.amount,
        taxAmount: tx.taxAmount
    });

    emit(transferEvent);
}

/**
 * Represents a deposit transaction.
 *
 * It occurs when some coins are transferred from the public to the private net.
 *
 * @param {org.wiboo.wibxp.financial.DepositTransaction} tx The deposit transaction
 * @transaction
 */
async function depositTransaction(tx: DepositTransactionCTO): Promise<void>
{
    isAmountValid(tx.amount);

    tx.to.balance = SafeMath.add(tx.to.balance, tx.amount);
    tx.to.finBalance = SafeMath.add(tx.to.finBalance, tx.amount);

    // Update participants (Wallets)
    const walletParticipant: HyperledgerParticipant<WalletCTO> = await getParticipantRegistry<WalletCTO>(
        entities.wallet
    );

    await walletParticipant.update(tx.to);

    // Emit events
    const depositEvent: HyperledgerEvent<DepositCTO> = getFactory().newEvent<DepositCTO>(
        namespaces.financial,
        entities.deposit
    );

    Object.assign<DepositCTO, DepositCTO>(depositEvent, {
        fromEthAddress: tx.fromEthAddress,
        to: tx.to,
        amount: tx.amount
    });

    emit(depositEvent);
}

/**
 * Represents a withdrawal operation.
 *
 * It occurs when some coins are transferred to the external net.
 *
 * @param {org.wiboo.wibxp.financial.WithdrawTransaction} tx The withdraw transaction
 * @transaction
 */
async function withdrawTransaction(tx: WithdrawTransactionCTO): Promise<void>
{
    isAmountValid(tx.amount);

    tx.from.balance = SafeMath.sub(tx.from.balance, tx.amount);

    // Update participants (Wallets)
    const walletParticipant: HyperledgerParticipant<WalletCTO> = await getParticipantRegistry<WalletCTO>(entities.wallet);

    await walletParticipant.update(tx.from);

    // Emit events
    const transferEvent: HyperledgerEvent<WithdrawCTO> = getFactory().newEvent<WithdrawCTO> (
        namespaces.financial,
        entities.withdraw
    );

    Object.assign<WithdrawCTO, WithdrawCTO>(transferEvent, {
        from: tx.from,
        toEthAddress: tx.toEthAddress,
        amount: tx.amount
    });

    emit(transferEvent);
}