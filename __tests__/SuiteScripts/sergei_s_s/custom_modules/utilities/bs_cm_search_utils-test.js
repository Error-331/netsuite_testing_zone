import search from 'N/search';
import Filter from 'N/search/filter';

import {
    findIdxInObjectsArrayByKeyValue,
    addFilter,
    addFilter1,
} from './../../../../../src/FileCabinet/SuiteScripts/sergei_s_s/custom_modules/utilities/bs_cm_search_utils';

import { constructorMockImplementation } from './../../../../../src/Utilities/tests/search/filter';
import { createFilterMockImplementation } from './../../../../../src/Utilities/tests/search/search';

jest.mock('N/search');
jest.mock('N/search/filter');

beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    Filter.constructor.mockImplementation(constructorMockImplementation);
    search.createFilter.mockImplementation(createFilterMockImplementation);
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
});