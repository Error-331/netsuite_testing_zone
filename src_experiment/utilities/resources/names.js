// external imports
const { resolve } = require('path');
const { readdir } = require('fs/promises');

const { find } = require('lodash');

// local imports
const { PATH_TO_RESOURCES_JSON_NAMES } = require('./../../constants/resources');
const { pickRandomArrayItem } = require('./../data_structures/arrays');

// implementation
async function loadNamesByGenderCountry(gender, countryCode) {
    const preparedGender = gender.toLowerCase();
    const preparedCountryCode = countryCode.toLowerCase();
    const preparedFileName = `${preparedCountryCode}_${preparedGender}_names.json`

    const namesFiles = await readdir(PATH_TO_RESOURCES_JSON_NAMES);
    const namesJSONFileName = find(namesFiles, (nameFile) => nameFile === preparedFileName);

    const namesJSONFilePath = resolve(PATH_TO_RESOURCES_JSON_NAMES, namesJSONFileName);

    return module.require(namesJSONFilePath);
}

async function pickRandomNameByGenderCountry(gender, countryCode) {
    const names = await loadNamesByGenderCountry(gender, countryCode);
    return pickRandomArrayItem(names );
}

// exports
module.exports.loadNamesByGenderCountry = loadNamesByGenderCountry;
module.exports.pickRandomNameByGenderCountry = pickRandomNameByGenderCountry;
