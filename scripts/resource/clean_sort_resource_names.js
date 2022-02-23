// external imports
const { readdir } = require('fs/promises');
const jsonfile = require('jsonfile');

const { uniq, concat } = require('lodash');

// local imports
const {
    PATH_TO_RESOURCES_JSON_NAMES,
    PATH_TO_RESOURCES_JSON_SURNAMES,
    PATH_TO_RESOURCES_JSON_COMPANY_NAMES,

    PATH_TO_RESOURCES_JSON_PHONES,
} = require('./../../src/constants/resources');

const { resolvePathsArray } = require('../../src/Utilities/fs/paths');

// implementation
// TODO: commit and then refaktor
async function run() {
    const namesFiles = await readdir(PATH_TO_RESOURCES_JSON_NAMES);
    const surnamesFiles = await readdir(PATH_TO_RESOURCES_JSON_SURNAMES);
    const companyNamesFiles = await readdir(PATH_TO_RESOURCES_JSON_COMPANY_NAMES);

    const phoneFiles = await readdir(PATH_TO_RESOURCES_JSON_PHONES);

    const preparedNamesFiles = resolvePathsArray(PATH_TO_RESOURCES_JSON_NAMES, namesFiles);
    const preparedSurnamesFiles = resolvePathsArray(PATH_TO_RESOURCES_JSON_SURNAMES, surnamesFiles);
    const preparedCompanyNamesFiles = resolvePathsArray(PATH_TO_RESOURCES_JSON_COMPANY_NAMES, companyNamesFiles);

    const preparedPhoneFiles = resolvePathsArray(PATH_TO_RESOURCES_JSON_PHONES, phoneFiles);

    const preparedFiles = concat(preparedNamesFiles, preparedSurnamesFiles, preparedCompanyNamesFiles, preparedPhoneFiles);

    for (const preparedFile of preparedFiles) {
        const jsonContents = await jsonfile.readFile(preparedFile);
        const preparedJSONContents = uniq(jsonContents).sort();

        await jsonfile.writeFile(preparedFile, preparedJSONContents, { spaces: 2 })
    }
}

run();

// exports

