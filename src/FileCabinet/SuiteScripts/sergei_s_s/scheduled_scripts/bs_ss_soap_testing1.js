/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
require(['./SuiteScripts/sergei_s_s/custom_modules/poc/bs_cm_bsnc_soap', 'N/encode'],
/**
    * @param{http} http
    */
    ({soapGetNetworkByNameBSNC}, encode) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
          log.debug(soapGetNetworkByNameBSNC('network1'))

        }
execute();
        return { execute }

    });
