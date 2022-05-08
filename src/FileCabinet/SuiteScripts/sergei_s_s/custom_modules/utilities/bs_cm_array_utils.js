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

        function removeFieldsFromObjectsArray(objectsArray, fieldsToRemove = []) {
            for (const arrayRow of objectsArray) {
                for (const fieldToRemove of fieldsToRemove) {
                    delete arrayRow[fieldToRemove];
                }
            }

            return objectsArray;
        }

        return {
            findIdxInObjectsArrayByKeyValue,
            removeFieldsFromObjectsArray,
        }
    });
