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
        };

        const isNil = (value) => {
            if (value === undefined || value === null) {
                return true;
            }

            return false;
        };

        const isNullOrEmpty = (value) => {
            if (isNil(value)) {
                return true;
            }

            if (typeof value === 'string') {
                return value.length === 0;
            } else if (isArray(value)) {
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
        };

        const logExecution = (type, title, details) => {
            const logTitle = `${type} ${title}`;

            log.debug({title: logTitle, details});
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
        };

        const toSingleValue = (value) => {
            if (isArray(value)) {
                return value[0];
            }

            return value;
        }

        const toInt = (value) => {
            value = toSingleValue(value);

            if (typeof value !== 'number') {
                value = parseInt(value);
            }

            return value;
        };

        const toArray = (value) => {
            if (!isArray(value)) {
                return [value];
            }

            return value;
        };

        return {
            isArray,
            isNil,
            isNullOrEmpty,
            defaultTo,
            logExecution,
            oneTimeMemoizer,
            filterUniqueValues,
            toSingleValue,
            toInt,
            toArray,
        }
    });
