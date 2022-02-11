// external imports
const { resolve } = require('path');
const { readdir } = require('fs/promises');

const { find } = require('lodash');

// local imports
const { PATH_TO_RESOURCES_JSON_COMPANY_NAMES } = require('./../../constants/resources');
const { pickRandomArrayItem, pickRandomUniqueArrayItems } = require('./../data_structures/arrays');

// implementation
async function loadCompaniesNamesByFileNameInclude(fileNameInclude) {
    const companyNamesFiles = await readdir(PATH_TO_RESOURCES_JSON_COMPANY_NAMES);
    const companyNamesJSONFileName = find(companyNamesFiles, (companyFileName) => companyFileName.includes(fileNameInclude));
    const companyNamesJSONFilePath = resolve(PATH_TO_RESOURCES_JSON_COMPANY_NAMES, companyNamesJSONFileName);

    return module.require(companyNamesJSONFilePath);
}

async function pickRandomCompanyNameByFileNameInclude(fileNameInclude) {
    const companyNames = await loadCompaniesNamesByFileNameInclude(fileNameInclude);
    return pickRandomArrayItem(companyNames);
}

async function pickRandomUniqueCompanyNamesByFileNameInclude(fileNameInclude, itemsCount = 0) {
    const companyNames = await loadCompaniesNamesByFileNameInclude(fileNameInclude);
    return pickRandomUniqueArrayItems(companyNames, itemsCount);
}

function generateWebAddressByCompanyName(companyName) {
    const preparedCompanyName = companyName.replace(' ', '_').toLowerCase().replace('&', '_');
    return `http://www.${preparedCompanyName}.com`;
}

// exports
module.exports.loadCompaniesNamesByFileNameInclude = loadCompaniesNamesByFileNameInclude;

module.exports.pickRandomCompanyNameByFileNameInclude = pickRandomCompanyNameByFileNameInclude;
module.exports.pickRandomUniqueCompanyNamesByFileNameInclude = pickRandomUniqueCompanyNamesByFileNameInclude;

module.exports.generateWebAddressByCompanyName = generateWebAddressByCompanyName;
