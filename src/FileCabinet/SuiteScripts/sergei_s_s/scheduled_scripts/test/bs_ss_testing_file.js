/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
require(['N/file', 'N/search'],
    /**
 * @param{file} file
 */
    (file, search) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            const transactionSearch = search.load({
                id: 102780
            });

           // log.debug(transactionSearch.columns)

            const searchResults = transactionSearch.run().getRange({
                start: 0,
                end: 5,
            });

            log.debug(searchResults);

        }
execute();
        return {execute}

    });
