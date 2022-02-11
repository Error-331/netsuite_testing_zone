// external imports
const { randomBytes } = require('crypto');

// local imports
const { DEFAULT_MAX_RANDOM_STRING_LENGTH } = require('./../../constants/strings');

// implementation
function generateRandomString(maxLength = DEFAULT_MAX_RANDOM_STRING_LENGTH) {
    return randomBytes(maxLength)
        .toString('hex')
        .substr(0, maxLength);
}

function generateRandomStringWithPrefix(prefix = '', maxLength) {
    const randomString = generateRandomString(maxLength);
    return `${prefix}${randomString}`;
}

// exports
module.exports.generateRandomString = generateRandomString;
module.exports.generateRandomStringWithPrefix = generateRandomStringWithPrefix;
