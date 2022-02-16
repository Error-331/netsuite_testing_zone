/**
 * @NApiVersion 2.1
 */
define([],
    () => {
        function findIdxInObjectsArrayByKeyValue(valueToFind, objectsArray, keyToFind){
            for (let objectIdx = 0; objectIdx < objectsArray.length; objectIdx++) {
                if (objectsArray[objectIdx][keyToFind] === valueToFind) {
                    return objectIdx;
                }
            }

            return -1;
        }

        function addFilter(filters, newFilter){
            const newFilters = filters.slice();
            newFilters.push(newFilter);

            return newFilters;
        }

        return {
            findIdxInObjectsArrayByKeyValue,
            addFilter,
        }
    });
