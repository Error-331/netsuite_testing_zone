// external imports
const { resolve } = require('path');
const { readdir } = require('fs/promises');

const { find } = require('lodash');

// local imports
const { PATH_TO_RESOURCES_JSON_PHONES } = require('./../../constants/resources');
const { pickRandomArrayItem, pickRandomUniqueArrayItems } = require('./../data_structures/arrays');

// implementation
async function loadPhonesByCountry(countryCode) {
    const preparedCountryCode = countryCode.toLowerCase();
    const preparedFileName = `${preparedCountryCode}_phones.json`

    const phonesFiles = await readdir(PATH_TO_RESOURCES_JSON_PHONES);
    const phonesJSONFileName = find(phonesFiles, (nameFile) => nameFile === preparedFileName);

    const phonesJSONFilePath = resolve(PATH_TO_RESOURCES_JSON_PHONES, phonesJSONFileName);

    return module.require(phonesJSONFilePath);
}

async function pickRandomPhoneByCountry(countryCode) {
    const names = await loadPhonesByCountry(countryCode);
    return pickRandomArrayItem(names );
}

async function pickRandomUniquePhoneByCountry(countryCode, itemsCount = 0) {
    const phones = await loadPhonesByCountry(countryCode);
    return pickRandomUniqueArrayItems(phones, itemsCount);
}

// exports
module.exports.loadPhonesByCountry = loadPhonesByCountry;
module.exports.pickRandomPhoneByCountry = pickRandomPhoneByCountry;
module.exports.pickRandomUniquePhoneByCountry = pickRandomUniquePhoneByCountry;
