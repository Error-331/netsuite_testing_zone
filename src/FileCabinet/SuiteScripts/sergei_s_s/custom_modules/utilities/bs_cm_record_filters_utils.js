/**
 * @NApiVersion 2.1
 */
define([],
    
    () => {
        function filterRecordData(loadedRecord, filters = []) {
            const preparedData = {};
            for (const filterKey of Object.getOwnPropertyNames(filters)) {
                preparedData[filterKey] = filters[filterKey](loadedRecord);
            }

            return preparedData;
        }

        return {
            filterRecordData
        }
    });
