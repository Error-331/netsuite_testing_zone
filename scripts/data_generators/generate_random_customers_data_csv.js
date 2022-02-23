// external imports

// local imports
const { generateRandomUniqueCustomersDataCSV } = require('../../src/Utilities/resources/customers');

// implementation

// name
async function generateAndSaveRandomCustomersDataCSV() {
    await generateRandomUniqueCustomersDataCSV(15);
}

generateAndSaveRandomCustomersDataCSV()

// exports
