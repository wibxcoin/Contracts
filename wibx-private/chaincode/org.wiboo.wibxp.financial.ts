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
 * Recognized contract namespaces
 */
const namespaces: Record<string, string> = {
    common: 'org.wiboo.wibxp.common',
    financial: 'org.wiboo.wibxp.financial'
};

/**
 * Financial entities
 */
const entities: Record<string, string> = {
    wallet: `${namespaces.common}.Wallet`,
    transfer: 'Transfer',
    deposit: 'Deposit',
    withdraw: 'Withdraw'
};

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

    // Check if the origin account has funds to transfer
    assert(SafeMath.gte(tx.from.balance, tx.amount), 'The origin account doesnt have funds to pay.');

    tx.from.balance = SafeMath.sub(tx.from.balance, tx.amount);
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

    transferEvent.from = tx.from;
    transferEvent.to = tx.to;
    transferEvent.amount = tx.amount;

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

    depositEvent.fromEthAddress = tx.fromEthAddress;
    depositEvent.to = tx.to;
    depositEvent.amount = tx.amount;

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

    transferEvent.from = tx.from;
    transferEvent.toEthAddress = tx.toEthAddress;
    transferEvent.amount = tx.amount;

    emit(transferEvent);
}