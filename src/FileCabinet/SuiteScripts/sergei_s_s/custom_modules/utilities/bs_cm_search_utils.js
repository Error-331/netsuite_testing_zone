/**
 * @NApiVersion 2.1
 */
define([],
    () => {
        function addFilter(filters, newFilter){
            const newFilters = filters.slice();
            newFilters.push(newFilter);

            return newFilters;
        }

        function addColumn(columns, newColumns){
            return addFilter(columns, newColumns);
        }

        return {
            addFilter,
            addColumn,
        }
    });
