// external imports
const { size, keys, slice, random, shuffle } = require('lodash');

// local imports

// implementation
function pickRandomArrayItem(arrayOfEntities) {
    const arraySize = size(arrayOfEntities);
    const randomItemIndex = random(0, arraySize - 1, false);

    return arrayOfEntities[randomItemIndex];
}

function pickRandomUniqueArrayItems(arrayOfEntities, numberOfItems = 0) {
    const entitiesCount = size(arrayOfEntities);

    if (numberOfItems > entitiesCount) {
        throw new Error('Number of entities to pick is greater than the actual number of entities');
    }

    const entitiesKeys = keys(arrayOfEntities);
    const entitiesKeysShuffled = shuffle(entitiesKeys);
    const entitiesKeysSlice = slice(entitiesKeysShuffled, 0, numberOfItems);

    const selectedItems = [];
    for (const entityKey of entitiesKeysSlice) {
        selectedItems.push(arrayOfEntities[entityKey]);
    }

    return selectedItems;
}

// exports
module.exports.pickRandomArrayItem = pickRandomArrayItem;
module.exports.pickRandomUniqueArrayItems = pickRandomUniqueArrayItems;
