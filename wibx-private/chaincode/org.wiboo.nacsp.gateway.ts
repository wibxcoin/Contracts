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
 * Uma transacao futura agendada para uma tag
 *
 * @param {org.wiboo.wibxp.gateway.FutureTransaction} tx The future transaction.
 * @transaction
 */
async function futureTransaction(tx)
{
    const tagAsset = await getAssetRegistry('org.wiboo.wibxp.gateway.NfcTag');

    tx.tag.lastPendingTransactionAmount = tx.amount;

    await tagAsset.update(tx.tag);
}

/**
 * Uma transacao que concretiza uma transacao futura.
 *
 * @param {org.wiboo.wibxp.gateway.ConcreteTransaction} tx The concrete transaction.
 * @transaction
 */
async function concreteTransaction(tx)
{
    if (tx.amount !== tx.tag.lastPendingTransactionAmount)
    {
        throw new Error('You are not paying the correct amount.');
    }

    if (tx.amount > tx.payer.balance)
    {
        throw new Error('Insufficient funds.');
    }

    const walletParticipant = await getParticipantRegistry('org.wiboo.wibxp.common.Wallet');
    const tagAsset = await getAssetRegistry('org.wiboo.wibxp.gateway.NfcTag');

    tx.payer.balance -= tx.amount;
    tx.tag.owner.balance += tx.amount;
    tx.tag.lastPendingTransactionAmount = 0;

    await walletParticipant.update(tx.payer);
    await walletParticipant.update(tx.tag.owner);
    await tagAsset.update(tx.tag);
}