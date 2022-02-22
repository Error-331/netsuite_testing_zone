/**
 * @NApiVersion 2.1
 */
define([
        './../../utilities/bs_cm_general_utils',
        './../../utilities/bs_cm_runtime_utils',
        './../../utilities/bs_cm_search_utils',

        './../../utilities/bs_cm suite_billing_settings_utils',

        './bs_cm_renewal_emails_parameters_preparation',
        './bs_cm_renewal_emails_searches',
        './bs_cm_renewal_emails_search_filters',
        './bs_cm_renewal_email_search_columns',
    ],
    
    (
        { isNullOrEmpty, logExecution },
        { getScriptParameterByName, printCurrentScriptRemainingUsage },
        { addFilter},
        { initSuiteBillingBSNEnvSettings },
        { getRenewalEmailParamsForBSN, getInitialRenewalEmailsParamsBySearchResult },
        {
            getRenewalChargeUniSearchFiltersColumns,
            createTermsSearch,
            createNoneTermsSearches,
        },
        {
            createTimeFilter,
            addCheckAndUncheckFilters,
            addZeroOrMoreDaysFilter,
            addLessThenZeroDaysFilter,
        },
        { addZeroDaysColumn },
    ) => {
        function prepareAndExecuteSearches(period, subtype, hascc) {
            printCurrentScriptRemainingUsage();

            const settings = getRenewalEmailParamsForBSN(period, subtype, '');
            const checkCC = hascc || false;
            const isTerms = settings.isTerms;

            let renewalChargeUniSearch, newFilters;

            logExecution('DEBUG', 'settings', JSON.stringify(settings));
            renewalChargeUniSearch = getRenewalChargeUniSearchFiltersColumns();
            logExecution('DEBUG', 'filters length', renewalChargeUniSearch.filters.length);

            newFilters = addFilter(renewalChargeUniSearch.filters, createTimeFilter(isTerms, period, subtype, settings.from, settings.to));
            newFilters = addCheckAndUncheckFilters(newFilters, settings.check, settings.uncheck);

            if(settings.to >= 0){
                newFilters = addZeroOrMoreDaysFilter(newFilters, subtype);
            } else {
                newFilters = addLessThenZeroDaysFilter(newFilters, subtype);
            }

            let newColumns;

            if( settings.from == 0 ){
                newColumns = addZeroDaysColumn(renewalChargeUniSearch.columns);
            } else {
                newColumns = renewalChargeUniSearch.columns;
            }

            logExecution('DEBUG', 'filters', newFilters.length);
            let searchSubs = [];

            if(isTerms) {
                const preparedSearch = createTermsSearch(newColumns, newFilters);
                searchSubs.push(preparedSearch.run());
            } else {
                const preparedSearches = createNoneTermsSearches(newColumns, newFilters);

                for (const preparedSearch of preparedSearches) {
                    searchSubs.push(preparedSearch.run())
                }
            }

            logExecution('DEBUG', 'searchSubs', JSON.stringify(searchSubs));
            printCurrentScriptRemainingUsage();
        }
        return {
            prepareAndExecuteSearches,
        }
    });
