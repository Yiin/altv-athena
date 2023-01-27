import * as alt from 'alt-server';
import { StoredItem } from '@AthenaShared/interfaces/item';
import { Athena } from '@AthenaServer/api/athena';
import { deepCloneArray, deepCloneObject } from '@AthenaShared/utility/deepCopy';

type dbName = string;

type ItemCombo = [dbName, dbName];

type Quantities = [number, number];

export interface CraftRecipe {
    /**
     * A unique identifier for this recipe.
     *
     * @type {string}
     * @memberof Recipe
     */
    uid: string;

    /**
     * Two items that can be combined.
     *
     * @type {ItemCombo}
     * @memberof Recipe
     */
    combo: ItemCombo;

    /**
     * The amount required to combine.
     *
     * @type {Quantities}
     * @memberof Recipe
     */
    quantities: Quantities;

    /**
     * The crafting result.
     *
     * @type {dbName}
     * @memberof CraftRecipe
     */
    result: {
        /**
         * Name of the item.
         *
         * @type {string}
         */
        dbName: string;

        /**
         * The amount of this item.
         *
         * @type {number}
         */
        quantity: number;

        /**
         * What version of this item to use.
         *
         * @type {(number | undefined)}
         */
        version?: number | undefined;

        /**
         * The custom data to start with on this item.
         * If data migration is specified; the data will be stacked on top of this data object.
         *
         * @type {Object}
         */
        data?: Object;
    };

    /**
     * What items to take the data from.
     * ORDER MATTERS. What item is specified first will get data appended first.
     * Second item overwrites matching property names.
     *
     * @type {ItemCombo}
     * @memberof CraftRecipe
     */
    dataMigration?: ItemCombo;
}

const recipes: Array<CraftRecipe> = [];

export const ItemCrafting = {
    recipe: {
        /**
         * Add a recipe in-memory. Does not store to database.
         *
         * @param {Recipe} recipe
         */
        add(recipe: CraftRecipe): boolean {
            if (recipe.combo.length !== 2 || recipe.quantities.length !== 2) {
                alt.logWarning(`Aborted Recipe. Recipe ${recipe.uid} needs two items and two quantities given.`);
                return false;
            }

            if (recipe.combo[0] === recipe.combo[1]) {
                alt.logWarning(`Aborted Recipe. Recipe ${recipe.uid} has two matching dbNames.`);
                return false;
            }

            if (recipe.quantities[0] <= 0 && recipe.quantities[1] <= 0) {
                alt.logWarning(`Aborted Recipe. Recipe ${recipe.uid} has two matching dbNames; this is invalid.`);
                return false;
            }

            alt.log(`~c~Recipe: ~lg~${recipe.uid}`);
            recipes.push(recipe);
            return true;
        },
        /**
         * Attempts to find a matching recipe.
         * If a matching recipe is found; it is returned.
         * Otherwise, returns undefined.
         *
         * @param {ItemCombo} combo
         * @return {(Recipe | undefined)}
         */
        find(combo: ItemCombo): CraftRecipe | undefined {
            if (combo.length !== 2) {
                return undefined;
            }

            const item1 = combo[0];
            const item2 = combo[1];

            for (let recipe of recipes) {
                let foundItem1 = false;
                let foundItem2 = false;

                if (recipe.combo[0] === item1 || recipe.combo[0] === item2) {
                    foundItem1 = true;
                }

                if (recipe.combo[1] === item1 || recipe.combo[1] === item2) {
                    foundItem2 = true;
                }

                if (!foundItem1 || !foundItem2) {
                    continue;
                }

                return recipe;
            }

            return undefined;
        },
    },
    items: {
        /**
         * Combine two slots given a data set.
         * It will attempt to find a matching recipe and make modifications according to the combination.
         *
         * @param {Array<StoredItem>} dataSet
         * @param {number} slot1
         * @param {number} slot2
         * @returns {Array<StoredItem> | undefined}
         */
        combine(
            dataSet: Array<StoredItem>,
            slot1: number,
            slot2: number,
            type: 'inventory' | 'toolbar' | 'custom',
        ): Array<StoredItem> | undefined {
            if (slot1 === slot2) {
                return undefined;
            }

            const item1 = Athena.systems.itemManager.slot.getAt(slot1, dataSet);
            const item2 = Athena.systems.itemManager.slot.getAt(slot2, dataSet);

            if (typeof item1 === 'undefined' || typeof item2 === 'undefined') {
                return undefined;
            }

            const recipe = ItemCrafting.recipe.find([item1.dbName, item2.dbName]);
            if (typeof recipe === 'undefined') {
                return undefined;
            }

            // Verify Quantities
            if (!Athena.systems.itemManager.quantity.has(dataSet, recipe.combo[0], recipe.quantities[0])) {
                return undefined;
            }

            if (!Athena.systems.itemManager.quantity.has(dataSet, recipe.combo[1], recipe.quantities[1])) {
                return undefined;
            }

            // Recipe found; now to remove both items.
            const baseItem = Athena.systems.itemFactory.sync.getBaseItem(recipe.result.dbName, recipe.result.version);
            if (typeof baseItem === 'undefined') {
                alt.logWarning(`Aborted Recipe. Recipe ${recipe.uid} cannot find item provided in result.`);
                return undefined;
            }

            // Attempt to find an open slot to combine data into.
            const openSlot = Athena.systems.itemManager.slot.findOpen(type, dataSet);
            if (typeof openSlot === 'undefined') {
                return undefined;
            }

            const newItem: Omit<StoredItem, 'slot'> = {
                dbName: recipe.result.dbName,
                quantity: recipe.result.quantity,
                version: recipe.result.version,
                data: baseItem.data ? deepCloneObject(baseItem.data) : {},
            };

            if (recipe.result.data) {
                newItem.data = Object.assign(newItem.data, recipe.result.data);
            }

            // Combines data sets based on specified data migration by dbNames.
            if (recipe.dataMigration && recipe.dataMigration.length >= 1) {
                const firstCombine = recipe.dataMigration[0] === item1.dbName ? item1 : item2;
                newItem.data = Object.assign(newItem.data, firstCombine.data);

                if (recipe.dataMigration.length >= 2) {
                    const secondCombine = recipe.dataMigration[0] === item1.dbName ? item1 : item2;
                    newItem.data = Object.assign(newItem.data, secondCombine.data);
                }
            }

            // Remove quantities from original data set...
            let newData = deepCloneArray<StoredItem>(dataSet);
            for (let i = 0; i < recipe.combo.length; i++) {
                newData = Athena.systems.itemManager.inventory.sub(
                    { dbName: recipe.combo[i], quantity: recipe.quantities[i] },
                    newData,
                );

                if (typeof newData === 'undefined') {
                    return undefined;
                }
            }

            newData = Athena.systems.itemManager.inventory.add(newItem, newData, type);
            return newData;
        },
    },
};