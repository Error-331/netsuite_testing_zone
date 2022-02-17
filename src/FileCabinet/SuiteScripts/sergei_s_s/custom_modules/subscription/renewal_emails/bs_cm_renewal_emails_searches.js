/**
 * @NApiVersion 2.1
 */
define(['N/search'],
    /**
 * @param{search} search
 */
    (search) => {
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

        return {
            loadRenewalChargeUniSearch,
            getRenewalChargeUniSearchFiltersColumns,
        }
    });
