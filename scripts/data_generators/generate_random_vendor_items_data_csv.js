// external imports

// local imports
const {
    RESOURCE_GOODS_PC_HARDWARE,
    RESOURCE_GOODS_RCA_CABLES_NAMES,
} = require('./../../src/constants/resources');

const { generateRandomUniqueVendorItemsDataCSV } = require('./../../src/utilities/resources/vendors/items');

// implementation

// name
async function generateAndSaveRandomVendorItemsDataCSV() {
    await generateRandomUniqueVendorItemsDataCSV(1, [RESOURCE_GOODS_PC_HARDWARE, RESOURCE_GOODS_RCA_CABLES_NAMES], 4, 10, 15);
}

generateAndSaveRandomVendorItemsDataCSV()

// exports
