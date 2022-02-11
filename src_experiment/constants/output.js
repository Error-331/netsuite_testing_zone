// external imports
const { sep, resolve } = require('path');

// local imports

// implementation
const PATH_TO_DIST = `.${sep}dist`;
const PATH_TO_GENERATED = resolve(PATH_TO_DIST, 'generated');
const PATH_TO_GENERATED_CSV = resolve(PATH_TO_GENERATED, 'csv');

// exports
module.exports.PATH_TO_DIST = PATH_TO_DIST;
module.exports.PATH_TO_GENERATED = PATH_TO_GENERATED;
module.exports.PATH_TO_GENERATED_CSV = PATH_TO_GENERATED_CSV;
