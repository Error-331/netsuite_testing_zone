/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
require(['N/search'],
    /**
 * @param{search} search
 */
    (search) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            const renewalChargeUniSearch = search.load({
                type: 'charge',
                id: 'customsearch_sb_renewal_charge_uni'
            });

            log.debug(renewalChargeUniSearch.filters);
        }
        execute();
        return {execute}
    });
