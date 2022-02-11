// external imports
const { clone, last, size, flow } = require('lodash');

// local imports
const { PATH_TO_RESOURCES_GOODS } = require('./../../constants/resources');
const { pickRandomArrayItem, pickRandomUniqueArrayItems } = require('./../data_structures/arrays');

const { resolvePathsVector } = require('./../fs/paths');
const { sanitizeCSVEntities } = require('./sanitization');

// implementation
async function loadRandomUniqueGoodNamesByCategories(categoriesVector) {
    const categoriesVectorCopy = clone(categoriesVector);
    if (last(categoriesVectorCopy).toLowerCase() !== '.json') {
        const categoriesVectorSize = size(categoriesVectorCopy);
        const categoriesVectorLastIndex = categoriesVectorSize - 1;

        categoriesVectorCopy[categoriesVectorLastIndex] = `${categoriesVectorCopy[categoriesVectorLastIndex]}.json`
    }

    const pathToGoodsFile = resolvePathsVector(PATH_TO_RESOURCES_GOODS, categoriesVectorCopy);
    return module.require(pathToGoodsFile);
}

async function pickRandomGoodNameByCategories(categoriesVector) {
    const goodNames = await loadRandomUniqueGoodNamesByCategories(categoriesVector);
    return flow([pickRandomArrayItem, sanitizeCSVEntities])(goodNames);
}

async function pickRandomUniqueGoodNamesByCategories(categoriesVector, itemsCount = 0) {
    const goodNames = await loadRandomUniqueGoodNamesByCategories(categoriesVector);
    return flow([pickRandomUniqueArrayItems, sanitizeCSVEntities])(goodNames, itemsCount);
}

// exports
module.exports.loadRandomUniqueGoodNamesByCategories = loadRandomUniqueGoodNamesByCategories;
module.exports.pickRandomGoodNameByCategories = pickRandomGoodNameByCategories;
module.exports.pickRandomUniqueGoodNamesByCategories = pickRandomUniqueGoodNamesByCategories;
