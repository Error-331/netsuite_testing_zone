/**
 * @NApiVersion 2.1
 */
define([
    'N/search',
    './../../utilities/bs_cm_search_utils',
    './bs_cm_renewal_emails_search_filters'
    ],
    /**
 * @param{search} search
 */
    (
        search,
        { addFilter },
        { createTermsFilter, createPayopCCIDFilter, addTermsFilters },
    ) => {
        function loadRenewalChargeUniSearch() {
            return search.load({
                type: 'charge',
                id: 'customsearch_sb_renewal_charge_uni'
            });
        }

        function getRenewalChargeUniSearchFiltersColumns() {
            const customSearch = loadRenewalChargeUniSearch();
            return {
                filters: customSearch.filters,
                columns: customSearch.columns,
            };
        }

        function createTermsSearch(usrColumns = [], usrFilters = []) {
            let filtersInstances = addTermsFilters(usrFilters);

            return search.create({
                type: 'charge',
                id: null,
                columns: usrColumns,
                filters: filtersInstances,
            });
        }

        function createNoneTermsSearches(usrColumns = [], usrFilters = []) {
            const searches = [];
            let subFilters = addFilter(usrFilters, createTermsFilter(search.Operator.ANYOF));

            let subSearch = search.create({
                type: 'charge',
                id: null,
                columns: usrColumns,
                filters: subFilters,
            });
            searches.push(subSearch);

            subFilters = addFilter(usrFilters, createTermsFilter(search.Operator.NONEOF));
            subFilters = addFilter(subFilters, createPayopCCIDFilter(search.Operator.ISNOTEMPTY));

            subSearch = search.create({
                type: 'charge',
                id: null,
                columns: usrColumns,
                filters: subFilters,
            });

            searches.push(subSearch);
            return searches;
        }

        return {
            loadRenewalChargeUniSearch,
            getRenewalChargeUniSearchFiltersColumns,

            createTermsSearch,
            createNoneTermsSearches,
        }
    });
