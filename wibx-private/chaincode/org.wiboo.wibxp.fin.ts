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
 * Function to process the reservation transaction.
 *
 * @param {org.wiboo.wibxp.fin.ReservationTransaction} tx The reservation transaction
 * @transaction
 */
async function reservationTransaction(tx: ReservationTransactionCTO): Promise<void>
{
    // Check if the amount is valid
    isAmountValid(tx.amount);

    // Check if the origin account has funds to transfer
    assert(SafeMath.gte(tx.from.finBalance, tx.amount), 'The origin account doesnt have funds to pay.');

    tx.from.finBalance = SafeMath.sub(tx.from.finBalance, tx.amount);
    tx.from.finReservedBalance = SafeMath.add(tx.from.finReservedBalance, tx.amount);

    // Update participants (Wallets)
    const walletParticipant: HyperledgerParticipant<WalletCTO> = await getParticipantRegistry<WalletCTO>(
        entities.wallet
    );

    await walletParticipant.update(tx.from);
}

/**
 * Function to process the settlement transaction.
 *
 * @param {org.wiboo.wibxp.fin.SettlementTransaction} tx The settlement transaction
 * @transaction
 */
async function settlementTransaction(tx: SettlementTransactionCTO): Promise<void>
{
    // Check if the amount is valid
    isAmountValid(tx.amount);

    // Check if the origin account has funds to transfer
    assert(SafeMath.gte(tx.from.finReservedBalance, tx.amount), 'The origin account doesnt have funds to pay.');

    tx.from.finReservedBalance = SafeMath.sub(tx.from.finReservedBalance, tx.amount);
    tx.to.finBalance = SafeMath.add(tx.to.finBalance, tx.amount);

    // Update participants (Wallets)
    const walletParticipant: HyperledgerParticipant<WalletCTO> = await getParticipantRegistry<WalletCTO>(
        entities.wallet
    );

    await walletParticipant.update(tx.from);
    await walletParticipant.update(tx.to);
}

/**
 * Function to process the cancelation transaction.
 *
 * @param {org.wiboo.wibxp.fin.CancelationTransaction} tx The cancelation transaction
 * @transaction
 */
async function cancelationTransaction(tx: CancelationTransactionCTO): Promise<void>
{
    // Check if the amount is valid
    isAmountValid(tx.amount);

    // Check if the origin account has funds to transfer
    assert(SafeMath.gte(tx.from.finReservedBalance, tx.amount), 'The origin account doesnt have funds to pay.');

    tx.from.finBalance = SafeMath.add(tx.from.finBalance, tx.amount);
    tx.from.finReservedBalance = SafeMath.sub(tx.from.finReservedBalance, tx.amount);

    // Update participants (Wallets)
    const walletParticipant: HyperledgerParticipant<WalletCTO> = await getParticipantRegistry<WalletCTO>(
        entities.wallet
    );

    await walletParticipant.update(tx.from);
}