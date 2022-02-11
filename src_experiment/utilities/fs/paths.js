// external imports
const { resolve } = require('path');
const { map, reduce } = require('lodash');

// local imports

// implementation
function resolvePathsArray(basePath, pathsArray) {
    return map(pathsArray, path => resolve(basePath, path));
}

function resolvePathsVector(basePath, pathsArray) {
    return reduce(pathsArray, (combinedPath, pathSection) => resolve(combinedPath, pathSection), basePath);
}

// exports
module.exports.resolvePathsArray = resolvePathsArray;
module.exports.resolvePathsVector = resolvePathsVector;
