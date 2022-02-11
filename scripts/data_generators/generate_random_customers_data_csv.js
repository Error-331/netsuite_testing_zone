// external imports

// local imports
const { generateRandomUniqueCustomersDataCSV } = require('./../../src/utilities/resources/customers');

// implementation

// name
async function generateAndSaveRandomCustomersDataCSV() {
    await generateRandomUniqueCustomersDataCSV(15);
}

generateAndSaveRandomCustomersDataCSV()

// exports
