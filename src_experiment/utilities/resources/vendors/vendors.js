// external imports

// local imports
const { PATH_TO_GENERATED_CSV } = require('./../../../constants/output');

const {
    pickRandomCompanyNameByFileNameInclude,
    pickRandomUniqueCompanyNamesByFileNameInclude,
    generateWebAddressByCompanyName
} = require('./../companies');
const { generateCompanyEmailByGenderCountryCName } = require('./../emails');
const { pickRandomPhoneByCountry, pickRandomUniquePhoneByCountry } = require('./../phones');

const { writeObjectsArrayToCSV } = require('./../../fs/data_steams');

// implementation
async function generateRandomVendorData() {
    const companyFileNameInclude = 'pc_hardware';
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

        'COMPANY NAME': companyName,
        'WEB ADDRESS': webAddress,

        'EMAIL': email,
        'PHONE': phone,
        'Alt. Phone': altPhone,
        'FAX': fax
    };

    return generatedData;
}

async function generateRandomVendorsData(vendorsCount = 0) {
    const vendorsData = [];

    for (let vendorCounter = 0; vendorCounter < vendorsCount; vendorCounter++) {
        const vendorData = await generateRandomVendorData();
        vendorsData.push(vendorData);
    }

    return vendorsData;
}

async function generateRandomUniqueVendorsData(vendorsCount = 0) {
    const companyFileNameInclude = 'pc_hardware';
    const gender = 'female';
    const countryCode = 'en';

    const companyNames = await pickRandomUniqueCompanyNamesByFileNameInclude(companyFileNameInclude, vendorsCount);
    const phones = await pickRandomUniquePhoneByCountry(countryCode, vendorsCount * 3);

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

async function generateRandomVendorsDataCSV(vendorsCount) {
    const vendorsData = await generateRandomVendorsData(vendorsCount);
    await writeObjectsArrayToCSV(vendorsData, `${PATH_TO_GENERATED_CSV}/vendors.csv`);
}

async function generateRandomUniqueVendorsDataCSV(vendorsCount) {
    const vendorsData = await generateRandomUniqueVendorsData(vendorsCount);
    await writeObjectsArrayToCSV(vendorsData, `${PATH_TO_GENERATED_CSV}/vendors.csv`);
}

// exports
module.exports.generateRandomVendorData = generateRandomVendorData;
module.exports.generateRandomVendorsData = generateRandomVendorsData;
module.exports.generateRandomVendorsDataCSV = generateRandomVendorsDataCSV;
module.exports.generateRandomUniqueVendorsDataCSV = generateRandomUniqueVendorsDataCSV;
