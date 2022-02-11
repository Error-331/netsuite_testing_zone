// external imports

// local imports
const { pickRandomNameByGenderCountry } = require('./names');
const { pickRandomSurnameByGenderCountry } = require('./surnames');

// implementation
async function generateCompanyEmailByGenderCountryCName(gender, countryCode, companyName) {
    const name = await pickRandomNameByGenderCountry(gender, countryCode);
    const surname = await pickRandomSurnameByGenderCountry(gender, countryCode);

    const preparedName = name.toLowerCase();
    const preparedSurname = surname.toLowerCase();

    const preparedCompanyName = companyName
        .toLowerCase()
        .replace('&', '_')
        .replace(' ', '_')
        .replace('@', '');

    const emailAddress = `${preparedName}_${preparedSurname}@${preparedCompanyName}.com`;
    return emailAddress;
}

// exports
module.exports.generateCompanyEmailByGenderCountryCName = generateCompanyEmailByGenderCountryCName;
