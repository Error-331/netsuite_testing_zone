// external imports
const { resolve } = require('path');
const { readdir } = require('fs/promises');

const { find } = require('lodash');

// local imports
const { PATH_TO_RESOURCES_JSON_SURNAMES } = require('./../../constants/resources');
const { pickRandomArrayItem } = require('./../data_structures/arrays');

// implementation
async function loadSurnamesByGenderCountry(gender, countryCode) {
    const preparedGender = gender.toLowerCase();
    const preparedCountryCode = countryCode.toLowerCase();
    const preparedFileName = `${preparedCountryCode}_${preparedGender}_surnames.json`

    const surnamesFiles = await readdir(PATH_TO_RESOURCES_JSON_SURNAMES);
    const surnamesJSONFileName = find(surnamesFiles, (surnameFile) => surnameFile === preparedFileName);
    const surnamesJSONFilePath = resolve(PATH_TO_RESOURCES_JSON_SURNAMES, surnamesJSONFileName);

    return module.require(surnamesJSONFilePath);
}

async function pickRandomSurnameByGenderCountry(gender, countryCode) {
    const surnames = await loadSurnamesByGenderCountry(gender, countryCode);
    return pickRandomArrayItem(surnames);
}

// exports
module.exports.loadSurnamesByGenderCountry = loadSurnamesByGenderCountry;
module.exports.pickRandomSurnameByGenderCountry = pickRandomSurnameByGenderCountry;
