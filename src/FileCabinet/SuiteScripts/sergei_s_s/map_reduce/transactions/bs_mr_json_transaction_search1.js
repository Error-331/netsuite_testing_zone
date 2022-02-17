/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define([
    'N/file',
        '../../custom_modules/utilities/bs_cm_general_utils',
        './../../custom_modules/bs_cm_csv_utils'
    ],
    /**
 * @param{file} file
 */
    (
        file,
        { isNullOrEmpty , defaultTo},
        { revrecGenerateCSV },
        ) => {
        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const getInputData = (inputContext) => {
            const jsonFileObj = file.load({
                id: 3788477
            });

            const jsonContents = jsonFileObj.getContents();
            const parsedJSONContents = JSON.parse(jsonContents);

            return parsedJSONContents;
        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */

        const map = (mapContext) => {
            try {
                const searchResult = JSON.parse(mapContext.value);

                const name = defaultTo('', searchResult['Name']);
                const endDate = defaultTo('', searchResult['End Date']);
                const networkId = defaultTo('', searchResult['Network ID']);
                const networkType = defaultTo('', searchResult['Network Type']);
                const endUser = defaultTo('', searchResult['End User']);

                const key = `${name}_${endDate}_${networkId}_${networkType}_${endUser}`;

                mapContext.write({
                    key,
                    value: searchResult
                });
            } catch (e) {
                log.debug('Map error');
                log.debug(e);
            }
        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reduceContext) => {
            let firstParsedValue = null;

            try {
                const reduceValues = reduceContext.values;
                firstParsedValue = JSON.parse(reduceValues[0]);

                firstParsedValue['Memo'] = firstParsedValue['Memo'].replace(/(\n\n)|(\n)/g, ' ');
                firstParsedValue['error'] = '';

                const bsnRefs = [];
                let totalQuantity = 0;

                for (const reduceValue of reduceValues) {
                    const parsedReduceValue = JSON.parse(reduceValue);

                    if (parseInt(parsedReduceValue['Internal ID']) % 2 !== 0) {
                        throw new Error(`Internal ID is not even (${parsedReduceValue['Internal ID']})`);
                    }

                    if (!isNullOrEmpty(parsedReduceValue['BSN Ref'])) {
                        bsnRefs.push(parsedReduceValue['BSN Ref']);
                    }

                    if (!isNullOrEmpty(parsedReduceValue['Quantity'])) {
                        totalQuantity += parseInt(parsedReduceValue['Quantity']);
                    }
                }

                firstParsedValue.bsnRefs = bsnRefs;
                firstParsedValue['Quantity'] = totalQuantity;

                reduceContext.write({
                    key: reduceContext.key,
                    value: firstParsedValue
                });
            } catch (e) {
                log.debug('Reduce error');
                log.debug(e);

                firstParsedValue.error = e.message;

                reduceContext.write({
                    key: reduceContext.key,
                    value: firstParsedValue
                });
            }
        }


        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {
            try {
                let csvArray = [];

                summaryContext.output.iterator().each((key, value) => {
                    const parsedValue = JSON.parse(value);
                    csvArray.push(parsedValue);

                    return true;
                });

                revrecGenerateCSV(csvArray, 'test_merged_results.tsv', {
                    columnDelimiter: '\t',
                    folder: 2845824
                });
            } catch (e) {
                log.debug('Summary error');
                log.debug(e);
            }
        }

        return {getInputData, map, reduce, summarize}

    });
