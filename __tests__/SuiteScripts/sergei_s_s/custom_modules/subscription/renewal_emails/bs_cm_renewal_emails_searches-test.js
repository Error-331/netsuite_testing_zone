import search from 'N/search';
import Filter from 'N/search/filter';
import Column from 'N/search/column';

import { getRenewalChargeUniSearchFiltersColumns } from './../../../../../../src/FileCabinet/SuiteScripts/sergei_s_s/custom_modules/subscription/renewal_emails/bs_cm_renewal_emails_searches';

import { constructorMockImplementation as filterConstructorMockImplementation } from './../../../../../../src/Utilities/tests/search/filter';
import { constructorMockImplementation as columnConstructorMockImplementation } from './../../../../../../src/Utilities/tests/search/column';

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
});

describe('Custom modules / subscription / renewal emails / renewal emails searches tests', () => {
    it('it should return correct UNI search filters and columns...', () => {
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
});