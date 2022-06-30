/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
require([
        'N/query',
        'N/record',
        'N/search',
        'N/format',
        'N/runtime',
        'SuiteScripts/sergei_s_s/custom_modules/utilities/bs_cm_general_utils',
        'SuiteScripts/sergei_s_s/custom_modules/utilities/bs_cm_runtime_utils',
        'SuiteScripts/sergei_s_s/custom_modules/aggregations/subscription/bs_cm_expired_subscription_for_salesrep',
        'SuiteScripts/sergei_s_s/custom_modules/aggregations/custom/bs_cm_exp_network_disposition',
        'SuiteScripts/sergei_s_s/custom_modules/utilities/specific/bs_cm_daily_subscription_expiry_report_utils',
        'SuiteScripts/sergei_s_s/custom_modules/aggregations/custom/bs_cm_disposition_action_list',
        'SuiteScripts/sergei_s_s/custom_modules/aggregations/custom/bs_cm_exp_network_disposition',
    ],
    /**
 * @param{search} search
 */
    (
        query, record, search, format, runtime,
        { isNullOrEmpty, isArray },
        { getCurrentEmployeeId,  getCurrentUserName },
        { loadExpSubsForSalesReps, loadExpSubsWithGroupedCustomers },
        { upsertDisposition, loadExpiredNetworksWithDispositionData },
        { prepareNoteHeader },
        { loadDispositionActionNameById },
        { loadExpiredNetworksWithDispositionDataRaw }
    ) => {


        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {





            //   AND ROWNUM <= 50 // 143898

           const suiteQLQuery1 = `
            SELECT customer, LISTAGG(id, ',') WITHIN GROUP (ORDER BY id)
            FROM Subscription      
            GROUP BY customer      
            `;

           const suiteQLQuery2 = `
 
           `;

            const suiteQLQuery = `
                SELECT * FROM customrecordbs_cr_expired_network_dispos
            `;

log.debug( getCurrentUserName())
            //log.debug(loadExpiredNetworksWithDispositionDataRaw(0, 100, 4));
            return;

const res = query.runSuiteQL({ query: suiteQLQuery }).asMappedResults();
            log.debug(res.length); // 2899 // 2938 // 2704
            //const bb = res.map(c => c.custrecord_sub_network_id); // 10004
log.debug(res);
            //log.debug(bb.filter((item, index) => bb.indexOf(item) !== index))
// ["15547","14122","13913","15226","2345","9389","12562","6091","13788","5244","15533","13437","9919","13050","12168","12297","10102","8333","13400","8493","9730","12161","15050","11741","14534","10043","15684","7402","15554","15637","14884","16105","8933","2720","13790","13900","8258","6657","12844"]



            // sales rep not found - 173387, 158887, 173390, 158887, 173392, 202550 - some fake sales reps and
            /*subscriptionSearch.run().each(function(result) {
                const customerId = result.getValue('customer');
                const networkId = result.getValue('custrecord_sub_network_id');
                const networkName = result.getValue('custrecord_sub_network_name');

                const customerRecord = loadCustomerById(customerId, true);
                const filteredDataCustomer = filterRecordData(customerRecord, {
                        address: filterCustomerDefaultBillingAddress,
                        salesRep: filterCustomerSalesRep,
                    },
                );

                if (isNullOrEmpty(filteredDataCustomer.address) || isNullOrEmpty(filteredDataCustomer.salesRep)) {
                    log.debug('Cannot process', result.id);
                    return true;
                }

                const salesTerritory = findSalesRepTerritoryBySalesRepId(filteredDataCustomer.salesRep, filteredDataCustomer.address);
                return true;
            });*/
        }

        execute();
        return { execute }
    });
