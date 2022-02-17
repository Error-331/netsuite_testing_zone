/**
 * @NApiVersion 2.1
 */
define([
        'N/search',
        './../../utilities/bs_cm_general_utils',
        './../../utilities/bs_cm_search_utils',
        './../../utilities/bs_cm suite_billing_settings_utils',
    ],
    /**
 * @param{search} search
 */
    (
        search,
        { isNullOrEmpty },
        { addFilter },
        {
            netTypeCloud,
            netTypeCom,
            netTypeBSNEE,
            initSuiteBillingBSNSettings
        },
    ) => {

        function create7tNoneBSNEETermsFilter() {
            return search.createFilter({
                name: 'entity',
                join: null,
                operator: search.Operator.BETWEEN,
                values: [-10, 0],
                formula: `(
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
                )`,
            });
        }

        function create30tNoneBSNEETermsFilter() {
            return search.createFilter({
                name: 'formulanumeric',
                join: null,
                operator: search.Operator.GREATERTHANOREQUALTO,
                values: [0],
                formula: `(
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
                )`,
            });
        }

        function createGenericFilter(from, to) {
            return search.createFilter({
                name: 'formulanumeric',
                join: null,
                operator: search.Operator.BETWEEN,
                values: [from, to],
                formula: `
                    {now}
                    -
                    {subscription.startdate}
                    `
            });
        }

        function createTimeFilter(isTerms = false, period, subtype, from, to) {
            const preparedPeriod = period.toLowerCase();

            if(isTerms && preparedPeriod === '7t' && (subtype != 'bsnee')){
                return create7tNoneBSNEETermsFilter();
            } else if( isTerms && preparedPeriod === '30t' && (subtype != 'bsnee') ){
                return create30tNoneBSNEETermsFilter();
            } else {
                return createGenericFilter(from, to);
            }
        }

        function createCheckFilter(name) {
            return search.createFilter({
                name,
                join: 'subscription',
                operator: search.Operator.IS,
                values: ['is', 'F'],
            });
        }

        function createSubscriptionFilter(name, values) {
            const preparedName = name ?? 'status';
            const preparedValues = isNullOrEmpty(values) ? ['anyof', 'ACTIVE'] : values

            return search.createFilter({
                name: preparedName,
                join: 'subscription',
                operator: search.Operator.ANYOF,
                values: preparedValues,
            });
        }

        function createInvoiceFilter(values = null) {
            let preparedValues = values ?? 'CustInvc:A';
            preparedValues = Array.isArray(preparedValues) ? preparedValues : [preparedValues];

            return search.createFilter({
                name: 'status',
                join: 'invoice',
                operator: search.Operator.ANYOF,
                values: preparedValues,
            })
        }

        function createTermsFilter(operator) {
            return search.createFilter({
                name: 'terms',
                join: 'customer',
                operator,
                values: ['@NONE@', '13'],
            });
        }

        function createPayopCCIDFilter(operator) {
            return search.createFilter({
                name: 'custrecord_payop_ccid',
                join: 'billingaccount',
                operator: operator,
            });
        }

        function addCheckAndUncheckFilters(prevFilters = [], checkName, uncheckNames) {
            let preparedPrevFilters = prevFilters.slice();

            if(!isNullOrEmpty(checkName)) {
                preparedPrevFilters = addFilter(preparedPrevFilters, createCheckFilter(checkName));
            }

            if(uncheckNames && uncheckNames.length){
                for(let nameIdx = 0; nameIdx < uncheckNames.length; nameIdx++) {
                    preparedPrevFilters = addFilter(preparedPrevFilters, createCheckFilter(uncheckNames[nameIdx]));
                }
            }

            return preparedPrevFilters;
        }

        function addZeroOrMoreDaysFilter(prevFilters = [], subtype = '') {
            const preparedSubType = subtype.toLowerCase();

            const sbBSNSettings = initSuiteBillingBSNSettings();
            let preparedPrevFilters = prevFilters.slice();

            preparedPrevFilters = addFilter(preparedPrevFilters, createSubscriptionFilter());
            preparedPrevFilters = addFilter(preparedPrevFilters, createInvoiceFilter());

            let eligibleItems = [sbBSNSettings.bsn1yrItemNum, sbBSNSettings.bsnc1yrItemNum];

            if(preparedSubType == 'bsnee') {
                eligibleItems = [sbBSNSettings.bsnee1yrItemNum];
            }

            return addFilter(preparedPrevFilters, createInvoiceFilter(eligibleItems));
        }

        function addLessThenZeroDaysFilter(prevFilters = [], subtype = '') {
            const preparedSubType = subtype.toLowerCase();
            let preparedPrevFilters = prevFilters.slice();

            let eligibleItems = [netTypeCom, netTypeCloud];
            if(preparedSubType == 'bsnee') {
                eligibleItems = [netTypeBSNEE];
            }

            preparedPrevFilters = addFilter(preparedPrevFilters, createSubscriptionFilter('custrecord_bsn_type', [eligibleItems]));
            return addFilter(preparedPrevFilters, createSubscriptionFilter('status', ['PENDING_ACTIVATION']));
        }

        function addTermsFilters(prevFilters = []) {
            let preparedPrevFilters = prevFilters.slice();
            let filterInstance = createTermsFilter(search.Operator.NONEOF);

            preparedPrevFilters = addFilter(preparedPrevFilters, filterInstance);

            filterInstance = createPayopCCIDFilter(search.Operator.ISEMPTY);
            return addFilter(preparedPrevFilters, filterInstance);
        }

        return {
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
        };
    });
