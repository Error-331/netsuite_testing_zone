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
    ],
    /**
 * @param{search} search
 */
    (
        query, record, search, format, runtime,
        { isNullOrEmpty, isArray },
        { getCurrentEmployeeId },
        { loadExpSubsForSalesReps, loadExpSubsWithGroupedCustomers },
        { upsertDisposition, loadExpiredNetworksWithDispositionData },
        { prepareNoteHeader },
        { loadDispositionActionNameById }
    ) => {


        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {



            log.debug(loadDispositionActionNameById('2'));

//             const formattedDateString = format.format({ value: currentDate, type: format.Type.DATE });

            //   AND ROWNUM <= 50 // 143898

            // 142375
            // 123923

      /*     const suiteQLQuery = `
SELECT * FROM note WHERE ID=1461
            `;

//569

           log.debug('pupu'); //1446 1447
            log.debug(query.runSuiteQL({ query: suiteQLQuery }).asMappedResults())*/
/*

            const objRecord = record.load({
                type: 'note',
                id: 1459,
                isDynamic: false,
            });

            log.debug(objRecord);*/


          /*  const ss1 = search.create({
                type: 'note',
                filters: [
                    search.createFilter({name: 'recordtype', operator: search.Operator.EQUALTO, values: '569'}),
                ],
                columns: [
                    search.createColumn({name: 'recordtype'}),
                ]
            });*/




            /*
                        const c = search.load({
                            type: 'charge',
                            id: 'customsearch_sb_renewal_charge_uni'
                        });

                        log.debug('filters', JSON.stringify(c.filters))*/

            /*

            filters: [{"name":"formulanumeric","operator":"equalto","values":["1"],"formula":"CASE WHEN {priceplan.startdate}={subscription.startdate} THEN 1 ELSE 0 END ","isor":false,"isnot":false,"leftparens":0,"rightparens":0},{"name":"custrecord_bs_is_import","join":"subscription","operator":"is","values":["T"],"isor":true,"isnot":false,"leftparens":1,"rightparens":0},{"name":"parentsubscriptionid","join":"subscription","operator":"isnotempty","values":[],"isor":false,"isnot":false,"leftparens":0,"rightparens":1}]
             */

          /*  const subscriptionSearch = search.load({
                id: 102824,
                type: search.Type.SUBSCRIPTION
            });*/



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
