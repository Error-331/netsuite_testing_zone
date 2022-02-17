import search from 'N/search';
import Filter from 'N/search/filter';
import Column from 'N/search/column';

import {
    getRenewalChargeUniSearchFiltersColumns,
    createTermsSearch,
    createNoneTermsSearches,
} from './../../../../../../src/FileCabinet/SuiteScripts/sergei_s_s/custom_modules/subscription/renewal_emails/bs_cm_renewal_emails_searches';

import { constructorMockImplementation as filterConstructorMockImplementation } from './../../../../../../src/Utilities/tests/search/filter';
import { constructorMockImplementation as columnConstructorMockImplementation } from './../../../../../../src/Utilities/tests/search/column';
import {
    createColumnMockImplementation,
    createFilterMockImplementation,
} from './../../../../../../src/Utilities/tests/search/search';

import renewalChangeUniSearchFilters from './../../../../../../src/JSON/subscription/renewal_emails/renewal_charge_uni_search_filters.json';
import renewalChangeUniSearchColumns from './../../../../../../src/JSON/subscription/renewal_emails/renewal_charge_uni_search_columns.json';

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

    search.load.mockImplementation(() => {
        const filters = [];
        const columns = [];

        for (const filter of renewalChangeUniSearchFilters) {
            filters.push(new Filter.constructor(filter));
        }

        for (const column of renewalChangeUniSearchColumns) {
            columns.push(new Column.constructor(column));
        }

        return {
            filters,
            columns,
        };
    });

    search.create.mockImplementation((options) => {
        return options;
    });
});

describe('Custom modules / subscription / renewal emails / renewal emails searches tests', () => {
    it('it should return proper UNI search filters and columns', () => {
        const filtersColumns = getRenewalChargeUniSearchFiltersColumns();

        expect(filtersColumns.filters[0].name).toBe('formulanumeric');
        expect(filtersColumns.filters[0].join).toBe(null);
        expect(filtersColumns.filters[0].operator).toBe(search.Operator.EQUALTO);
        expect(filtersColumns.filters[0].values).toStrictEqual(['1']);
        expect(filtersColumns.filters[0].summary).toBe(null);
        expect(filtersColumns.filters[0].formula).toBe(`CASE WHEN {priceplan.startdate}={subscription.startdate} THEN 1 ELSE 0 END `);

        expect(filtersColumns.filters[1].name).toBe('custrecord_bs_is_import');
        expect(filtersColumns.filters[1].join).toBe('subscription');
        expect(filtersColumns.filters[1].operator).toBe(search.Operator.IS);
        expect(filtersColumns.filters[1].values).toStrictEqual(['T']);
        expect(filtersColumns.filters[1].summary).toBe(null);
        expect(filtersColumns.filters[1].formula).toBe(null);

        expect(filtersColumns.filters[2].name).toBe('parentsubscriptionid');
        expect(filtersColumns.filters[2].join).toBe('subscription');
        expect(filtersColumns.filters[2].operator).toBe(search.Operator.ISNOTEMPTY);
        expect(filtersColumns.filters[2].values).toStrictEqual([]);
        expect(filtersColumns.filters[2].summary).toBe(null);
        expect(filtersColumns.filters[2].formula).toBe(null);

        expect(filtersColumns.columns.length).toBe(37);
    });

    it('it should return proper terms search filters and columns (case 1)', () => {
        const testSearch = createTermsSearch();

        expect(testSearch.type).toBe('charge');
        expect(testSearch.id).toBe(null);

        expect(testSearch.columns).toStrictEqual([]);
        expect(testSearch.filters).toStrictEqual([
            new Filter.constructor({
                name: 'terms',
                join: 'customer',
                operator: search.Operator.NONEOF,
                values: ['@NONE@', '13'],
            }),

            new Filter.constructor({
                name: 'custrecord_payop_ccid',
                join: 'billingaccount',
                operator: search.Operator.ISEMPTY,
                values: null,
            }),
        ]);
    });

    it('it should return proper terms search filters and columns (case 2)', () => {
        const testFilters = [
            search.createFilter({
                name: 'test_filter1',
                join: 'test_join1',
                operator: search.Operator.ANYOF,
                values: [10, 20],
            }),

            search.createFilter({
                name: 'test_filter2',
                join: 'test_join2',
                operator: search.Operator.ANYOF,
                values: [-10, -20],
            }),
        ];

        const testColumns = [
            new Column.constructor({
                name: 'test_name1',
                join: 'test_join1',
                summary: 'test_summary1',
                formula: null,
                label: 'test_label1',
                sort: null,
            }),

            new Column.constructor({
                name: 'test_name2',
                join: 'test_join2',
                summary: 'test_summary2',
                formula: null,
                label: 'test_label2',
                sort: null,
            }),
        ];

        const testSearch = createTermsSearch(testColumns, testFilters);

        expect(testSearch.type).toBe('charge');
        expect(testSearch.id).toBe(null);

        expect(testSearch.columns).toStrictEqual([
            new Column.constructor({
                name: 'test_name1',
                join: 'test_join1',
                summary: 'test_summary1',
                formula: null,
                label: 'test_label1',
                sort: null,
            }),

            new Column.constructor({
                name: 'test_name2',
                join: 'test_join2',
                summary: 'test_summary2',
                formula: null,
                label: 'test_label2',
                sort: null,
            }),
        ]);

        expect(testSearch.filters).toStrictEqual([
            search.createFilter({
                name: 'test_filter1',
                join: 'test_join1',
                operator: search.Operator.ANYOF,
                values: [10, 20],
            }),

            search.createFilter({
                name: 'test_filter2',
                join: 'test_join2',
                operator: search.Operator.ANYOF,
                values: [-10, -20],
            }),

            new Filter.constructor({
                name: 'terms',
                join: 'customer',
                operator: search.Operator.NONEOF,
                values: ['@NONE@', '13'],
            }),

            new Filter.constructor({
                name: 'custrecord_payop_ccid',
                join: 'billingaccount',
                operator: search.Operator.ISEMPTY,
                values: null,
            }),
        ]);
    });

    it('it should return proper none-terms searches filters and columns (case 1)', () => {
        const testSearches = createNoneTermsSearches();

        expect(testSearches[0].type).toBe('charge');
        expect(testSearches[0].id).toBe(null);

        expect(testSearches[1].type).toBe('charge');
        expect(testSearches[1].id).toBe(null);

        expect(testSearches[0].columns).toStrictEqual([]);
        expect(testSearches[1].columns).toStrictEqual([]);

        expect(testSearches[0].filters).toStrictEqual([
            new Filter.constructor({
                name: 'terms',
                join: 'customer',
                operator: search.Operator.ANYOF,
                values: ['@NONE@', '13'],
            }),
        ]);

        expect(testSearches[1].filters).toStrictEqual([
            new Filter.constructor({
                name: 'terms',
                join: 'customer',
                operator: search.Operator.NONEOF,
                values: ['@NONE@', '13'],
            }),

            new Filter.constructor({
                name: 'custrecord_payop_ccid',
                join: 'billingaccount',
                operator: search.Operator.ISNOTEMPTY,
                values: null,
            }),
        ]);
    });

    it('it should return proper none-terms searches filters and columns (case 2)', () => {
        const testFilters = [
            search.createFilter({
                name: 'test_filter1',
                join: 'test_join1',
                operator: search.Operator.ANYOF,
                values: [10, 20],
            }),

            search.createFilter({
                name: 'test_filter2',
                join: 'test_join2',
                operator: search.Operator.ANYOF,
                values: [-10, -20],
            }),
        ];

        const testColumns = [
            new Column.constructor({
                name: 'test_name1',
                join: 'test_join1',
                summary: 'test_summary1',
                formula: null,
                label: 'test_label1',
                sort: null,
            }),

            new Column.constructor({
                name: 'test_name2',
                join: 'test_join2',
                summary: 'test_summary2',
                formula: null,
                label: 'test_label2',
                sort: null,
            }),
        ];

        const testSearches = createNoneTermsSearches(testColumns, testFilters);

        expect(testSearches[0].type).toBe('charge');
        expect(testSearches[0].id).toBe(null);

        expect(testSearches[1].type).toBe('charge');
        expect(testSearches[1].id).toBe(null);

        expect(testSearches[0].columns).toStrictEqual([
            new Column.constructor({
                name: 'test_name1',
                join: 'test_join1',
                summary: 'test_summary1',
                formula: null,
                label: 'test_label1',
                sort: null,
            }),

            new Column.constructor({
                name: 'test_name2',
                join: 'test_join2',
                summary: 'test_summary2',
                formula: null,
                label: 'test_label2',
                sort: null,
            }),
        ]);
        expect(testSearches[1].columns).toStrictEqual([
            new Column.constructor({
                name: 'test_name1',
                join: 'test_join1',
                summary: 'test_summary1',
                formula: null,
                label: 'test_label1',
                sort: null,
            }),

            new Column.constructor({
                name: 'test_name2',
                join: 'test_join2',
                summary: 'test_summary2',
                formula: null,
                label: 'test_label2',
                sort: null,
            }),
        ]);

        expect(testSearches[0].filters).toStrictEqual([
            search.createFilter({
                name: 'test_filter1',
                join: 'test_join1',
                operator: search.Operator.ANYOF,
                values: [10, 20],
            }),

            search.createFilter({
                name: 'test_filter2',
                join: 'test_join2',
                operator: search.Operator.ANYOF,
                values: [-10, -20],
            }),

            new Filter.constructor({
                name: 'terms',
                join: 'customer',
                operator: search.Operator.ANYOF,
                values: ['@NONE@', '13'],
            }),
        ]);

        expect(testSearches[1].filters).toStrictEqual([
            search.createFilter({
                name: 'test_filter1',
                join: 'test_join1',
                operator: search.Operator.ANYOF,
                values: [10, 20],
            }),

            search.createFilter({
                name: 'test_filter2',
                join: 'test_join2',
                operator: search.Operator.ANYOF,
                values: [-10, -20],
            }),

            new Filter.constructor({
                name: 'terms',
                join: 'customer',
                operator: search.Operator.NONEOF,
                values: ['@NONE@', '13'],
            }),

            new Filter.constructor({
                name: 'custrecord_payop_ccid',
                join: 'billingaccount',
                operator: search.Operator.ISNOTEMPTY,
                values: null,
            }),
        ]);
    });

});