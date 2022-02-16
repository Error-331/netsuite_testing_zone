import Filter from 'N/search/filter';
import Column from 'N/search/column';

function createFilterMockImplementation(options) {
    return new Filter.constructor(options);
}

function createColumnMockImplementation(options) {
    return new Column.constructor(options);
}

export {
    createFilterMockImplementation,
    createColumnMockImplementation,
}