// external imports
const { sep, resolve } = require('path');

// local imports

// implementation
const PATH_TO_SOURCES = `.${sep}src`;
const PATH_TO_CONSTANTS = resolve(PATH_TO_SOURCES, 'constants');

const PATH_TO_CONSTANTS_RECORD = resolve(PATH_TO_CONSTANTS, 'record');

// exports
module.exports.PATH_TO_SOURCES = PATH_TO_SOURCES;
module.exports.PATH_TO_CONSTANTS = PATH_TO_CONSTANTS;

module.exports.PATH_TO_CONSTANTS_RECORD = PATH_TO_CONSTANTS_RECORD;
