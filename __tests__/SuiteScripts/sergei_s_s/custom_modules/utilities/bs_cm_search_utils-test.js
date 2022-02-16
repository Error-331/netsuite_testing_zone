import search from 'N/search';
import Filter from 'N/search/filter';
import Column from 'N/search/column';

import {
    findIdxInObjectsArrayByKeyValue,

    addFilter,
    addColumn,
} from './../../../../../src/FileCabinet/SuiteScripts/sergei_s_s/custom_modules/utilities/bs_cm_search_utils';

import { constructorMockImplementation as filterConstructorMockImplementation  } from './../../../../../src/Utilities/tests/search/filter'
import { constructorMockImplementation as columnConstructorMockImplementation } from './../../../../../src/Utilities/tests/search/column';
import { createFilterMockImplementation, createColumnMockImplementation } from './../../../../../src/Utilities/tests/search/search';

jest.mock('N/search');
jest.mock('N/search/filter');
jest.mock('N/search/column');

beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    Filter.constructor.mockImplementation(filterConstructorMockImplementation);
    Column.constructor.mockImplementation(columnConstructorMockImplementation);

    search.createFilter.mockImplementation(createFilterMockImplementation);
    search.createColumn.mockImplementation(createColumnMockImplementation);
});

const testArray1 = [
    {
        id: 35,
        value: 'test 1'
    },
    {
        id: 478,
        value: 'test 2'
    },
    {
        id: 5,
        value: 'test 3'
    },
];

describe('Custom modules / utilities / search utilities tests', () => {
    it('it should find proper item index in objects array (case 1)', () => {
        const foundIdx = findIdxInObjectsArrayByKeyValue(5, testArray1, 'id');
        expect(foundIdx).toBe(2);
    });

    it('it should find proper item index in objects array (case 2)', () => {
        const foundIdx = findIdxInObjectsArrayByKeyValue('test 1', testArray1, 'value');
        expect(foundIdx).toBe(0);
    });

    it('it should not find proper item index in objects array (case 1)', () => {
        const foundIdx = findIdxInObjectsArrayByKeyValue(75, testArray1, 'id');
        expect(foundIdx).toBe(-1);
    });

    it('it should not find proper item index in objects array (case 2)', () => {
        const foundIdx = findIdxInObjectsArrayByKeyValue('test 12', testArray1, 'value');
        expect(foundIdx).toBe(-1);
    });

    it('it should properly concat filter objects into one array', () => {
        const testFilter1 = search.createFilter({
            name: 'entity',
            join: null,
            operator: search.Operator.BETWEEN,
            values: [-10, 0],
        });

        const testFilter2 = search.createFilter({
            name: 'formulanumeric',
            join: null,
            operator: search.Operator.GREATERTHANOREQUALTO,
            values: [0],
        });

        const testFilter3 = search.createFilter({
            name: 'formulanumeric',
            join: null,
            operator: search.Operator.BETWEEN,
            values: [2, 6],
        });

        let testFilters = [testFilter1];
        testFilters = addFilter(testFilters, testFilter2)
        testFilters = addFilter(testFilters, testFilter3)

        expect(testFilters).toStrictEqual([
            testFilter1,
            testFilter2,
            testFilter3,
        ]);
    });

    it('it should properly concat column objects into one array', () => {
        const testColumn1 = search.createColumn({
            name: 'test_name1',
            join: null,
            label: 'test_label1',
            summary: 'test_summary1',
            formula: null,
            sort: null,
        });

        const testColumn2 = search.createColumn({
            name: 'test_name2',
            join: null,
            label: 'test_label2',
            summary: 'test_summary2',
            formula: null,
            sort: null,
        });

        const testColumn3 = search.createColumn({
            name: 'test_name3',
            join: null,
            label: 'test_label3',
            summary: 'test_summary3',
            formula: null,
            sort: null,
        });

        let testColumns = [testColumn1];
        testColumns = addColumn(testColumns, testColumn2)
        testColumns = addColumn(testColumns, testColumn3)

        expect(testColumns).toStrictEqual([
            testColumn1,
            testColumn2,
            testColumn3,
        ]);
    });
});