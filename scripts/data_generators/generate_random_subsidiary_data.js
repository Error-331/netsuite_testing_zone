// external imports
const { readdir } = require('fs/promises');
const { resolve } = require('path');

const jsonfile = require('jsonfile');
const { find, random, size } = require('lodash');

// local imports
const {
    PATH_TO_RESOURCES_JSON_NAMES,
    PATH_TO_RESOURCES_JSON_SURNAMES,
    PATH_TO_RESOURCES_JSON_COMPANY_NAMES,

    PATH_TO_RESOURCES_JSON_PHONES,
} = require('./../../src/constants/resources');

const { pickRandomArrayItem } = require('./../../src/utilities/data_structures/arrays');

// implementation
async function readResourcesDirectory(pathToDi) {

}

// name
async function generateRandomSubsidiaryData() {
    const companyNamesFiles = await readdir(PATH_TO_RESOURCES_JSON_COMPANY_NAMES);
    const companyNamesJSONFileName = find(companyNamesFiles, (companyFileName) => { return companyFileName.includes('signage') });
    const companyNamesJSONFilePath = resolve(PATH_TO_RESOURCES_JSON_COMPANY_NAMES, companyNamesJSONFileName);

    const companyNames = module.require(companyNamesJSONFilePath);
    const companyName = pickRandomArrayItem(companyNames);

    console.log(companyName);
}

generateRandomSubsidiaryData()

// exports
