import search from 'N/search';
import Column from 'N/search/column';

import {
    addZeroDaysColumn,
} from './../../../../../../src/FileCabinet/SuiteScripts/sergei_s_s/custom_modules/subscription/renewal_emails/bs_cm_renewal_email_search_columns';

import { constructorMockImplementation } from './../../../../../../src/Utilities/tests/search/column';
import { createColumnMockImplementation } from './../../../../../../src/Utilities/tests/search/search';

jest.mock('N/search');
jest.mock('N/search/column');

beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    Column.constructor.mockImplementation(constructorMockImplementation);
    search.createColumn.mockImplementation(createColumnMockImplementation);
});

describe('Custom modules / subscription / renewal emails / renewal emails search columns tests', () => {
    it('it should return proper "ZeroDays" column (case 1)', () => {
        const result = addZeroDaysColumn([]);

        expect(result).toStrictEqual([
            new Column.constructor({
                name: 'internalid',
                join: 'invoice',
                summary: null,
                formula: null,
                label: null,
                sort: null,
            }),
        ]);
    });

    it('it should return proper "ZeroDays" column (case 2)', () => {
        const result = addZeroDaysColumn([
            new Column.constructor({
                name: 'test_name1',
                join: 'test_invoice1',
                summary: 'test_summary1',
                formula: null,
                label: 'test_label1',
                sort: null,
            }),
        ]);

        expect(result).toStrictEqual([
            new Column.constructor({
                name: 'test_name1',
                join: 'test_invoice1',
                summary: 'test_summary1',
                formula: null,
                label: 'test_label1',
                sort: null,
            }),

            new Column.constructor({
                name: 'internalid',
                join: 'invoice',
                summary: null,
                formula: null,
                label: null,
                sort: null,
            }),
        ]);
    });
});