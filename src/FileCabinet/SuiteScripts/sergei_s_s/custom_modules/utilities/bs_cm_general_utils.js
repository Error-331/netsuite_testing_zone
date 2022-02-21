/**
 * @NApiVersion 2.1
 */
define([],
    () => {
        const isArray = (input) => {
            return (
                input instanceof Array ||
                Object.prototype.toString.call(input) === '[object Array]'
            );
        }

        const isNullOrEmpty = (value) => {
            if (value === undefined || value === null) {
                return true;
            }

            if (typeof value === 'string') {
                return value.length === 0;
            }

            return false;
        };

        const defaultTo = (defaultValue, value) => {
            if (isNullOrEmpty(value)) {
                return defaultValue;
            } else {
                return value;
            }
        }

        const logExecution = (type, title, details) => {
            const logMessage = `${type} ${title} ${details}`;

            log.debug(logMessage);
        };

        const oneTimeMemoizer = (functionToMemoize) => {
            let cache = null;

            const functionWrapper = (...args) => {
                if (cache !== null) {
                    return cache;
                } else {
                    cache = functionToMemoize(...args);
                    return cache;
                }

            };

            return functionWrapper;
        };

        const filterUniqueValues = (inputArray) => {
            return inputArray.filter((element, index, inputArray) => inputArray.indexOf(element) == index);
        }

        return {
            isArray,
            isNullOrEmpty,
            defaultTo,
            logExecution,
            oneTimeMemoizer,
            filterUniqueValues,
        }
    });
