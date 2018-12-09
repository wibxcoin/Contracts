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

/**
 * Assert some condition
 *
 * @param condition The error condition
 * @param errorMessage The error message case this condition fails
 */
declare function assert(condition: boolean, errorMessage: string);

/**
 * Get the asset registry
 *
 * @param asset The asset name with namespace
 */
declare function getAssetRegistry(asset: string);

/**
 * Get the participant registry
 *
 * @param participant The participant name with the namespace
 */
declare function getParticipantRegistry<T>(participant: string): Promise<Participant<T>>;

/**
 * Get the Hyperledger object factory
 */
declare function getFactory(): Factory;

/**
 * Emit some event
 *
 * @param event The event
 */
declare function emit<T>(event: Event<T>): void;

/**
 * Hyperledger generic event
 */
declare type Event<T> = T;

/**
 * Hyperledger participant registry
 */
declare interface Participant<T>
{
    /**
     * Update some info inside the participant
     *
     * @param item The participant
     */
    update(item: T);
}

/**
 * Hyperledger objects factory
 */
declare interface Factory
{
    /**
     * Create a new event instance
     */
    newEvent<T>(namespace: string, eventName: string): Event<T>;
}