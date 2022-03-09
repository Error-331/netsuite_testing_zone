/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define([
        'N/search',
        'N/runtime',
        './../../custom_modules/subscription/renewal_emails/bs_cm_renewal_emails_parameters_preparation',
        './../../custom_modules/subscription/renewal_emails/bs_cm_renewal_emails_map_reduce',
        './../../custom_modules/utilities/bs_cm_general_utils',
    ],
    /**
            */
    (
        search,
        runtime,
        { getRenewalEmailParamsForBSN },
        {
            prepareAndExecuteSearches,
            prepareRenewalEmailsParamsBySearchResult,
            addCCNumberToRenewalEmailsParams,
            sendEmailToCustomerAndSuspendNetwork,
            sendEmailToOwnerAndSuspendNetwork,
            sendEmailToSales,
        },
        { isNullOrEmpty, logExecution },
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
            const currentScript = runtime.getCurrentScript();
            const period = currentScript.getParameter({ name: 'custscriptperiod' });
            const subtype = currentScript.getParameter({ name: 'custscriptsubtype' });

            const settings = getRenewalEmailParamsForBSN(period, subtype, '');

            try {
                let searchesResults = prepareAndExecuteSearches(period, subtype, false, settings);
                return prepareRenewalEmailsParamsBySearchResult(settings, searchesResults);
            } catch (e) {
                log.debug('Search error');
                log.debug(e)
            }
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
                let searchesResults = JSON.parse(mapContext.value);

                mapContext.write({
                    key: searchesResults.customerId,
                    value: { ...searchesResults }
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
            try {
                reduceContext.write({
                    key: reduceContext.key,
                    value: JSON.parse(reduceContext.values[0])
                });
            } catch (e) {
                log.debug('Reduce error');
                log.debug(e);
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
                const currentScript = runtime.getCurrentScript();
                const period = currentScript.getParameter({ name: 'custscriptperiod' });
                const subtype = currentScript.getParameter({ name: 'custscriptsubtype' });

                summaryContext.output.iterator().each((key, value) => {
                    let searchesResults = JSON.parse(value);
                    searchesResults = addCCNumberToRenewalEmailsParams(searchesResults);

                    const isDisty = searchesResults.networkAdmin !== searchesResults.customerEmail;
                    let settings = getRenewalEmailParamsForBSN(period, subtype, searchesResults.billingAccountCountry);

                    let override = false;
                    const tranasactionId = settings.attachInvoice ? searchesResults.invoiceId : null;

                    if (!isNullOrEmpty(searchesResults.overrideSuspension)) {
                        override = true;
                    }

                    if (!isNullOrEmpty(searchesResults.customerEmail)) {
                        sendEmailToCustomerAndSuspendNetwork(subtype, period, isDisty, tranasactionId, settings, searchesResults);

                        if(isDisty && settings.sendToOwner) {
                            sendEmailToOwnerAndSuspendNetwork(period, isDisty, settings, searchesResults);
                        }

                        try {
                            settings = getRenewalEmailParamsForBSN(period, subtype, '');
                        } catch(error) {
                            logExecution('ERROR', 'Wrong data', 'Stopping.');
                            return;
                        }

                        sendEmailToSales(subtype, period, tranasactionId, settings, searchesResults);
                    } else {
                        // TODO: Send Email to Sales if no email address on record
                        logExecution('DEBUG', 'Email not sent', `Customer "${searchesResults.customerName}" has no Email. Skipping...`);
                    }

                    return true;
                });
            } catch (e) {
                log.debug('Summary error');
                log.debug(e);
            }
        }

        return {getInputData, map, reduce, summarize}

    });
