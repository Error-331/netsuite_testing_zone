import Filter from 'N/search/filter';

function createFilterMockImplementation(options) {
    return new Filter.constructor(options);
}

export {
    createFilterMockImplementation
}