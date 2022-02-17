/**
 * @NApiVersion 2.1
 */
define([
        'N/search',
        './../../utilities/bs_cm_search_utils',
    ],
    /**
 * @param{search} search
 */
    (
        search,
        { addColumn },
    ) => {
        function addZeroDaysColumn(prevColumns = []) {
            const internalIdInvoiceColumn = search.createColumn({
                name: 'internalid',
                join: 'invoice',
            });

            return addColumn(prevColumns, internalIdInvoiceColumn);
        }

        return {
            addZeroDaysColumn,
        };

    });
