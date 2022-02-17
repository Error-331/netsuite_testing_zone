import search from 'N/search';
import Filter from 'N/search/filter';

import {
    create7tNoneBSNEETermsFilter,
    create30tNoneBSNEETermsFilter,
    createGenericFilter,
    createTimeFilter,

    createCheckFilter,
    createSubscriptionFilter,
    createInvoiceFilter,
    createTermsFilter,
    createPayopCCIDFilter,

    addCheckAndUncheckFilters,
    addZeroOrMoreDaysFilter,
    addLessThenZeroDaysFilter,
    addTermsFilters,
} from './../../../../../../src/FileCabinet/SuiteScripts/sergei_s_s/custom_modules/subscription/renewal_emails/bs_cm_renewal_emails_search_filters';

import { constructorMockImplementation } from './../../../../../../src/Utilities/tests/search/filter';
import { createFilterMockImplementation } from './../../../../../../src/Utilities/tests/search/search';
import { initSuiteBillingBSNEnvSettingsMockImplementation } from './../../../../../../src/Utilities/tests/utilities/bs_cm suite_billing_settings_utils';

import {
    netTypeCom,
    netTypeCloud,
    netTypeBSNEE,

    initSuiteBillingBSNSettings
} from './../../../../../../src/FileCabinet/SuiteScripts/sergei_s_s/custom_modules/utilities/bs_cm suite_billing_settings_utils';

jest.mock('N/search');
jest.mock('N/search/filter');
jest.mock('./../../../../../../src/FileCabinet/SuiteScripts/sergei_s_s/custom_modules/utilities/bs_cm suite_billing_settings_utils')

beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    Filter.constructor.mockImplementation(constructorMockImplementation);
    search.createFilter.mockImplementation(createFilterMockImplementation);

    initSuiteBillingBSNSettings.mockImplementation(initSuiteBillingBSNEnvSettingsMockImplementation);
});

describe('Custom modules / subscription / renewal emails / renewal emails search filters tests', () => {
    it('it should return proper 7t none-BSNEE terms filter', () => {
        const result = create7tNoneBSNEETermsFilter();

        expect(result.name).toBe('entity');
        expect(result.join).toBe(null);
        expect(result.operator).toBe(search.Operator.BETWEEN);
        expect(result.values).toStrictEqual([-10, 0]);
        expect(result.summary).toBe(null);
        expect(result.formula).toBe(`(
                    FLOOR({now}-{subscription.startdate})
                ) 
                - 
                (
                    CASE 
                        WHEN regexp_like({invoice.terms}, '*Net 45') 
                        THEN  45 
                        
                        WHEN regexp_like({invoice.terms}, '*Net 60') 
                        THEN  60 
                        
                        WHEN regexp_like({invoice.terms}, '*Net 90') 
                        THEN  90 
                        
                        WHEN regexp_like({invoice.terms}, '*Net 120') 
                        THEN  120 
                        
                        WHEN regexp_like({invoice.terms}, '*Net*') 
                        THEN  30 
                        ELSE 0 
                    END
                )`);
    });

    it('it should return proper 30t none-BSNEE terms filter', () => {
        const result = create30tNoneBSNEETermsFilter();

        expect(result.name).toBe('formulanumeric');
        expect(result.join).toBe(null);
        expect(result.operator).toBe(search.Operator.GREATERTHANOREQUALTO);
        expect(result.values).toStrictEqual([0]);
        expect(result.summary).toBe(null);
        expect(result.formula).toBe(`(
                    FLOOR({now}-{subscription.startdate})
                ) 
                - 
                (
                    CASE 
                        WHEN regexp_like({invoice.terms}, '*Net 45') 
                        THEN  45 
                        
                        WHEN regexp_like({invoice.terms}, '*Net 60') 
                        THEN  60 
                        
                        WHEN regexp_like({invoice.terms}, '*Net 90')
                        THEN  90 
                        
                        WHEN regexp_like({invoice.terms}, '*Net 120') 
                        THEN  120 
                        
                        WHEN regexp_like({invoice.terms}, '*Net*') 
                        THEN  30 
                        ELSE 0 
                    END
                )`);
    });

    it('it should return proper generic filter', () => {
        const result = createGenericFilter(10, 4);

        expect(result.name).toBe('formulanumeric');
        expect(result.join).toBe(null);
        expect(result.operator).toBe(search.Operator.BETWEEN);
        expect(result.values).toStrictEqual([10, 4]);
        expect(result.summary).toBe(null);
        expect(result.formula).toBe(`
                    {now}
                    -
                    {subscription.startdate}
                    `);
    });

    it('it should return proper time filter (case 1)', () => {
        const result = createTimeFilter(true, '7t', 'bsn');

        expect(result.name).toBe('entity');
        expect(result.join).toBe(null);
        expect(result.operator).toBe(search.Operator.BETWEEN);
        expect(result.values).toStrictEqual([-10, 0]);
        expect(result.summary).toBe(null);
        expect(result.formula).toBe(`(
                    FLOOR({now}-{subscription.startdate})
                ) 
                - 
                (
                    CASE 
                        WHEN regexp_like({invoice.terms}, '*Net 45') 
                        THEN  45 
                        
                        WHEN regexp_like({invoice.terms}, '*Net 60') 
                        THEN  60 
                        
                        WHEN regexp_like({invoice.terms}, '*Net 90') 
                        THEN  90 
                        
                        WHEN regexp_like({invoice.terms}, '*Net 120') 
                        THEN  120 
                        
                        WHEN regexp_like({invoice.terms}, '*Net*') 
                        THEN  30 
                        ELSE 0 
                    END
                )`);
    });

    it('it should return proper time filter (case 2)', () => {
        const result = createTimeFilter(true, '30t', 'bsn');

        expect(result.name).toBe('formulanumeric');
        expect(result.join).toBe(null);
        expect(result.operator).toBe(search.Operator.GREATERTHANOREQUALTO);
        expect(result.values).toStrictEqual([0]);
        expect(result.summary).toBe(null);
        expect(result.formula).toBe(`(
                    FLOOR({now}-{subscription.startdate})
                ) 
                - 
                (
                    CASE 
                        WHEN regexp_like({invoice.terms}, '*Net 45') 
                        THEN  45 
                        
                        WHEN regexp_like({invoice.terms}, '*Net 60') 
                        THEN  60 
                        
                        WHEN regexp_like({invoice.terms}, '*Net 90')
                        THEN  90 
                        
                        WHEN regexp_like({invoice.terms}, '*Net 120') 
                        THEN  120 
                        
                        WHEN regexp_like({invoice.terms}, '*Net*') 
                        THEN  30 
                        ELSE 0 
                    END
                )`);
    });

    it('it should return proper time filter (case 3)', () => {
        const result = createTimeFilter(true, '-7t', 'bsn', 10, 4);

        expect(result.name).toBe('formulanumeric');
        expect(result.join).toBe(null);
        expect(result.operator).toBe(search.Operator.BETWEEN);
        expect(result.values).toStrictEqual([10, 4]);
        expect(result.summary).toBe(null);
        expect(result.formula).toBe(`
                    {now}
                    -
                    {subscription.startdate}
                    `);
    });

    it('it should return proper time filter (case 4)', () => {
        const result = createTimeFilter(false, '7t', 'bsn', 6, -7);

        expect(result.name).toBe('formulanumeric');
        expect(result.join).toBe(null);
        expect(result.operator).toBe(search.Operator.BETWEEN);
        expect(result.values).toStrictEqual([6, -7]);
        expect(result.summary).toBe(null);
        expect(result.formula).toBe(`
                    {now}
                    -
                    {subscription.startdate}
                    `);
    });

    it('it should return proper check filter', () => {
        const result = createCheckFilter('test1');

        expect(result.name).toBe('test1');
        expect(result.join).toBe('subscription');
        expect(result.operator).toBe(search.Operator.IS);
        expect(result.values).toStrictEqual(['is', 'F']);
        expect(result.summary).toBe(null);
        expect(result.formula).toBe(null);
    });

    it('it should return proper subscription filter', () => {
        const result = createSubscriptionFilter();

        expect(result.name).toBe('status');
        expect(result.join).toBe('subscription');
        expect(result.operator).toBe(search.Operator.ANYOF);
        expect(result.values).toStrictEqual(['anyof', 'ACTIVE']);
        expect(result.summary).toBe(null);
        expect(result.formula).toBe(null);
    });

    it('it should return proper invoice filter (case 1)', () => {
        const result = createInvoiceFilter();

        expect(result.name).toBe('status');
        expect(result.join).toBe('invoice');
        expect(result.operator).toBe(search.Operator.ANYOF);
        expect(result.values).toStrictEqual(['CustInvc:A']);
        expect(result.summary).toBe(null);
        expect(result.formula).toBe(null);
    });

    it('it should return proper invoice filter (case 2)', () => {
        const suiteBillingBSNSettings = initSuiteBillingBSNSettings();
        let values = [suiteBillingBSNSettings.bsn1yrItemNum, suiteBillingBSNSettings.bsnc1yrItemNum];

        const result = createInvoiceFilter(values);

        expect(result.name).toBe('status');
        expect(result.join).toBe('invoice');
        expect(result.operator).toBe(search.Operator.ANYOF);
        expect(result.values).toStrictEqual([849, 850]);
        expect(result.summary).toBe(null);
        expect(result.formula).toBe(null);
    });

    it('it should return proper terms filter (case 1)', () => {
        const result = createTermsFilter(search.Operator.NONEOF);

        expect(result.name).toBe('terms');
        expect(result.join).toBe('customer');
        expect(result.operator).toBe(search.Operator.NONEOF);
        expect(result.values).toStrictEqual(['@NONE@', '13']);
        expect(result.summary).toBe(null);
        expect(result.formula).toBe(null);
    });

    it('it should return proper terms filter (case 2)', () => {
        const result = createTermsFilter(search.Operator.ANYOF);

        expect(result.name).toBe('terms');
        expect(result.join).toBe('customer');
        expect(result.operator).toBe(search.Operator.ANYOF);
        expect(result.values).toStrictEqual(['@NONE@', '13']);
        expect(result.summary).toBe(null);
        expect(result.formula).toBe(null);
    });

    it('it should return proper "PayopCCID" filter (case 1)', () => {
        const result = createPayopCCIDFilter(search.Operator.ISNOTEMPTY);

        expect(result.name).toBe('custrecord_payop_ccid');
        expect(result.join).toBe('billingaccount');
        expect(result.operator).toBe(search.Operator.ISNOTEMPTY);
        expect(result.values).toStrictEqual(null);
        expect(result.summary).toBe(null);
        expect(result.formula).toBe(null);
    });

    it('it should return proper "PayopCCID" filter (case 2)', () => {
        const result = createPayopCCIDFilter(search.Operator.ISEMPTY);

        expect(result.name).toBe('custrecord_payop_ccid');
        expect(result.join).toBe('billingaccount');
        expect(result.operator).toBe(search.Operator.ISEMPTY);
        expect(result.values).toStrictEqual(null);
        expect(result.summary).toBe(null);
        expect(result.formula).toBe(null);
    });

    it('it should return proper "CheckAndUncheckFilters" filter (case 1)', () => {
        const result = addCheckAndUncheckFilters([], 'testCheckName1');

        expect(result).toStrictEqual([
            new Filter.constructor({
                name: 'testCheckName1',
                join: 'subscription',
                operator: search.Operator.IS,
                values: ['is', 'F'],
                summary: null,
                formula: null,
            }),
        ]);
    });

    it('it should return proper "CheckAndUncheckFilters" filter (case 2)', () => {
        const result = addCheckAndUncheckFilters([], 'testCheckName1', ['testUnCheckName1', 'testUnCheckName2']);

        expect(result).toStrictEqual([
            new Filter.constructor({
                name: 'testCheckName1',
                join: 'subscription',
                operator: search.Operator.IS,
                values: ['is', 'F'],
                summary: null,
                formula: null,
            }),

            new Filter.constructor({
                name: 'testUnCheckName1',
                join: 'subscription',
                operator: search.Operator.IS,
                values: ['is', 'F'],
                summary: null,
                formula: null,
            }),

            new Filter.constructor({
                name: 'testUnCheckName2',
                join: 'subscription',
                operator: search.Operator.IS,
                values: ['is', 'F'],
                summary: null,
                formula: null,
            }),
        ]);
    });

    it('it should return proper "CheckAndUncheckFilters" filter (case 3)', () => {
        const result = addCheckAndUncheckFilters([
            createInvoiceFilter(),
        ], 'testCheckName1', ['testUnCheckName1', 'testUnCheckName2']);

        expect(result).toStrictEqual([
            new Filter.constructor({
                name: 'status',
                join: 'invoice',
                operator: search.Operator.ANYOF,
                values: ['CustInvc:A'],
                summary: null,
                formula: null,
            }),

            new Filter.constructor({
                name: 'testCheckName1',
                join: 'subscription',
                operator: search.Operator.IS,
                values: ['is', 'F'],
                summary: null,
                formula: null,
            }),

            new Filter.constructor({
                name: 'testUnCheckName1',
                join: 'subscription',
                operator: search.Operator.IS,
                values: ['is', 'F'],
                summary: null,
                formula: null,
            }),

            new Filter.constructor({
                name: 'testUnCheckName2',
                join: 'subscription',
                operator: search.Operator.IS,
                values: ['is', 'F'],
                summary: null,
                formula: null,
            }),
        ]);
    });

    it('it should return proper "ZeroOrMoreDays" filter (case 1)', () => {
        const result = addZeroOrMoreDaysFilter([]);

        expect(result).toStrictEqual([
            new Filter.constructor({
                name: 'status',
                join: 'subscription',
                operator: search.Operator.ANYOF,
                values: ['anyof', 'ACTIVE'],
                summary: null,
                formula: null,
            }),
            new Filter.constructor({
                name: 'status',
                join: 'invoice',
                operator: search.Operator.ANYOF,
                values: ['CustInvc:A'],
                summary: null,
                formula: null,
            }),
            new Filter.constructor({
                name: 'status',
                join: 'invoice',
                operator: search.Operator.ANYOF,
                values: [849, 850],
                summary: null,
                formula: null,
            }),
        ]);
    });

    it('it should return proper "ZeroOrMoreDays" filter (case 2)', () => {
        const result = addZeroOrMoreDaysFilter([], 'bsnee')

        expect(result).toStrictEqual([
            new Filter.constructor({
                name: 'status',
                join: 'subscription',
                operator: search.Operator.ANYOF,
                values: ['anyof', 'ACTIVE'],
                summary: null,
                formula: null,
            }),
            new Filter.constructor({
                name: 'status',
                join: 'invoice',
                operator: search.Operator.ANYOF,
                values: ['CustInvc:A'],
                summary: null,
                formula: null,
            }),
            new Filter.constructor({
                name: 'status',
                join: 'invoice',
                operator: search.Operator.ANYOF,
                values: [884],
                summary: null,
                formula: null,
            }),
        ]);
    });

    it('it should return proper "ZeroOrMoreDays" filter (case 3)', () => {
        const result = addZeroOrMoreDaysFilter([
            createCheckFilter('test1')
        ], 'bsnee');

        expect(result).toStrictEqual([
            new Filter.constructor({
                name: 'test1',
                join: 'subscription',
                operator: search.Operator.IS,
                values: ['is', 'F'],
            }),

            new Filter.constructor({
                name: 'status',
                join: 'subscription',
                operator: search.Operator.ANYOF,
                values: ['anyof', 'ACTIVE'],
                summary: null,
                formula: null,
            }),
            new Filter.constructor({
                name: 'status',
                join: 'invoice',
                operator: search.Operator.ANYOF,
                values: ['CustInvc:A'],
                summary: null,
                formula: null,
            }),
            new Filter.constructor({
                name: 'status',
                join: 'invoice',
                operator: search.Operator.ANYOF,
                values: [884],
                summary: null,
                formula: null,
            }),
        ]);
    });

    it('it should return proper "LessThenZeroDays" filter (case 1)', () => {
        const result = addLessThenZeroDaysFilter([]);
        let eligibleItems = [netTypeCom, netTypeCloud];

        expect(result).toStrictEqual([
            new Filter.constructor({
                name: 'custrecord_bsn_type',
                join: 'subscription',
                operator: search.Operator.ANYOF,
                values: [eligibleItems],
            }),

            new Filter.constructor({
                name: 'status',
                join: 'subscription',
                operator: search.Operator.ANYOF,
                values: ['PENDING_ACTIVATION'],
            }),
        ]);
    });

    it('it should return proper "LessThenZeroDays" filter (case 2)', () => {
        const result = addLessThenZeroDaysFilter([], 'bsnee');
        let eligibleItems = [netTypeBSNEE];

        expect(result).toStrictEqual([
            new Filter.constructor({
                name: 'custrecord_bsn_type',
                join: 'subscription',
                operator: search.Operator.ANYOF,
                values: [eligibleItems],
            }),

            new Filter.constructor({
                name: 'status',
                join: 'subscription',
                operator: search.Operator.ANYOF,
                values: ['PENDING_ACTIVATION'],
            }),
        ]);
    });

    it('it should return proper "LessThenZeroDays" filter (case 3)', () => {
        const result = addLessThenZeroDaysFilter([
            createCheckFilter('test1')
        ], 'bsnee');
        let eligibleItems = [netTypeBSNEE];

        expect(result).toStrictEqual([
            new Filter.constructor({
                name: 'test1',
                join: 'subscription',
                operator: search.Operator.IS,
                values: ['is', 'F'],
            }),

            new Filter.constructor({
                name: 'custrecord_bsn_type',
                join: 'subscription',
                operator: search.Operator.ANYOF,
                values: [eligibleItems],
            }),

            new Filter.constructor({
                name: 'status',
                join: 'subscription',
                operator: search.Operator.ANYOF,
                values: ['PENDING_ACTIVATION'],
            }),
        ]);
    });

    it('it should return proper "terms" filters (case 1)', () => {
        const result = addTermsFilters();

        expect(result).toStrictEqual([
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

    it('it should return proper "terms" filters (case 2)', () => {
        const result = addTermsFilters([
            createCheckFilter('test1')
        ]);

        expect(result).toStrictEqual([
            new Filter.constructor({
                name: 'test1',
                join: 'subscription',
                operator: search.Operator.IS,
                values: ['is', 'F'],
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
});