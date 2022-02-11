// external imports

// local imports
const { PATH_TO_GENERATED_CSV } = require('./../../constants/output');

const {
    pickRandomCompanyNameByFileNameInclude,
    pickRandomUniqueCompanyNamesByFileNameInclude,
    generateWebAddressByCompanyName
} = require('./companies');
const { generateCompanyEmailByGenderCountryCName } = require('./emails');
const { pickRandomPhoneByCountry, pickRandomUniquePhoneByCountry } = require('./phones');

const { writeObjectsArrayToCSV } = require('./../fs/data_steams');

// implementation
async function generateRandomCustomerData() {
    const companyFileNameInclude = 'food';
    const gender = 'female';
    const countryCode = 'en';

    const companyName = await pickRandomCompanyNameByFileNameInclude(companyFileNameInclude);
    const webAddress = generateWebAddressByCompanyName(companyName);
    const email = await generateCompanyEmailByGenderCountryCName(gender, countryCode, companyName);

    const phone = await pickRandomPhoneByCountry(countryCode);
    const altPhone = await pickRandomPhoneByCountry(countryCode);
    const fax = await pickRandomPhoneByCountry(countryCode);

    const generatedData = {
        'isperson': 'F',
        'Primary Subsidiary': 'Parent Company',
        'entitystatus': 'CUSTOMER-Closed Won',

        'COMPANY NAME': companyName,
        'WEB ADDRESS': webAddress,

        'EMAIL': email,
        'PHONE': phone,
        'Alt. Phone': altPhone,
        'FAX': fax
    };

    return generatedData;
}

async function generateRandomCustomersData(customersCount = 0) {
    const customersData = [];

    for (let customerCounter = 0; customerCounter < customersCount; customerCounter++) {
        const customerData = await generateRandomCustomersData();
        customersData.push(customerData);
    }

    return customersData;
}

async function generateRandomUniqueCustomersData(customersCount = 0) {
    const companyFileNameInclude = 'food';
    const gender = 'female';
    const countryCode = 'en';

    const companyNames = await pickRandomUniqueCompanyNamesByFileNameInclude(companyFileNameInclude, customersCount);
    const phones = await pickRandomUniquePhoneByCountry(countryCode, customersCount * 3);

    let phoneIndex = 0;
    const generatedData = [];

    for (const companyName of companyNames) {
        const webAddress = generateWebAddressByCompanyName(companyName);
        const email = await generateCompanyEmailByGenderCountryCName(gender, countryCode, companyName);

        const phone = phones[phoneIndex];
        const altPhone = phones[phoneIndex + 1];
        const fax = phones[phoneIndex + 2];

        const vendorData = {
            'isperson': 'F',
            'Primary Subsidiary': 'Parent Company',
            'entitystatus': 'CUSTOMER-Closed Won',

            'COMPANY NAME': companyName,
            'WEB ADDRESS': webAddress,

            'EMAIL': email,
            'PHONE': phone,
            'Alt. Phone': altPhone,
            'FAX': fax
        };

        phoneIndex += 3;
        generatedData.push(vendorData);
    }

    return generatedData;
}

async function generateRandomCustomersDataCSV(customersCount) {
    const vendorsData = await generateRandomCustomersData(customersCount);
    await writeObjectsArrayToCSV(vendorsData, `${PATH_TO_GENERATED_CSV}/customers.csv`);
}

async function generateRandomUniqueCustomersDataCSV(vendorsCount) {
    const vendorsData = await generateRandomUniqueCustomersData(vendorsCount);
    await writeObjectsArrayToCSV(vendorsData, `${PATH_TO_GENERATED_CSV}/customers.csv`);
}

// exports
module.exports.generateRandomCustomerData = generateRandomCustomerData;
module.exports.generateRandomCustomersData = generateRandomCustomersData;
module.exports.generateRandomCustomersDataCSV = generateRandomCustomersDataCSV;
module.exports.generateRandomUniqueCustomersDataCSV = generateRandomUniqueCustomersDataCSV;
