// external imports
const { random, last } = require('lodash');

// local imports
const { PATH_TO_GENERATED_CSV } = require('./../../../constants/output');

const { pickRandomUniqueGoodNamesByCategories } = require('./../goods');
const { writeObjectsArrayToCSV } = require('./../../fs/data_steams');
const { generateRandomStringWithPrefix } = require('./../../math/random');

// implementation
async function generateRandomUniqueVendorItemsData(vendorCode, categoriesVector, priceMin = 0, priceMax = 0, itemsCount = 0) {
    const goodNames = await pickRandomUniqueGoodNamesByCategories(categoriesVector, itemsCount);
    const generatedData = [];

    const prefix = last(categoriesVector).replace('_names', '') + '_';

    for (const goodName of goodNames) {
        const vendorItemData = {
            'subsidiary': 'Parent Company',
            'itemid': goodName,
            'upcCode':  generateRandomStringWithPrefix(prefix), //uniqueId('vendor_item_'),
            'taxschedule': 'Test product 1',
            'purchasePrice': random(priceMin, priceMax),
        };

        generatedData.push(vendorItemData);
    }

    return generatedData;
}

async function generateRandomUniqueVendorItemsDataCSV(vendorCode, categoriesVector, priceMin = 0, priceMax = 0, itemsCount = 0) {
    const vendorsData = await generateRandomUniqueVendorItemsData(vendorCode, categoriesVector, priceMin, priceMax , itemsCount);
    await writeObjectsArrayToCSV(vendorsData, `${PATH_TO_GENERATED_CSV}/vendor_items.csv`);
}

// exports
module.exports.generateRandomUniqueVendorItemsData = generateRandomUniqueVendorItemsData;
module.exports.generateRandomUniqueVendorItemsDataCSV = generateRandomUniqueVendorItemsDataCSV;

