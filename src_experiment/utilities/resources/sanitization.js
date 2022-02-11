// external imports
const { map } = require('lodash');

// local imports

// implementation
function sanitizeCSVEntity(entity) {
    return entity.replace(/(\,)/g, ' ')
}

function sanitizeCSVEntities(entities) {
    return map(entities, sanitizeCSVEntity);
}

// exports
module.exports.sanitizeCSVEntity = sanitizeCSVEntity;
module.exports.sanitizeCSVEntities = sanitizeCSVEntities;
