// external imports

// local imports
const { generateRandomUniqueVendorsDataCSV } = require('./../../src/utilities/resources/vendors/vendors');

// implementation

// name
async function generateAndSaveRandomVendorsDataCSV() {
    await generateRandomUniqueVendorsDataCSV(15);
}

generateAndSaveRandomVendorsDataCSV()

// exports
