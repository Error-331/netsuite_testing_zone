/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
require([
        'N/record',
        'N/search',
        'N/file',
        'N/format',
       // './../custom_modules/moment',
        'SuiteScripts/sergei_s_s/custom_modules/utilities/bs_cm_general_utils',
        'SuiteScripts/sergei_s_s/custom_modules/utilities/bs_cm_runtime_utils',
        'SuiteScripts/sergei_s_s/custom_modules/utilities/bs_cm_search_utils',
        'SuiteScripts/sergei_s_s/custom_modules/subscription/renewal_emails/bs_cm_renewal_emails_parameters_preparation',
        'SuiteScripts/sergei_s_s/custom_modules/utilities/bs_cm suite_billing_settings_utils',
        'SuiteScripts/sergei_s_s/custom_modules/subscription/renewal_emails/bs_cm_renewal_emails_searches',
        'SuiteScripts/sergei_s_s/custom_modules/subscription/renewal_emails/bs_cm_renewal_emails_search_filters',
        'SuiteScripts/sergei_s_s/custom_modules/subscription/renewal_emails/bs_cm_renewal_email_search_columns',
        'SuiteScripts/sergei_s_s/custom_modules/subscription/renewal_emails/bs_cm_renewal_emails_renderers',
        'SuiteScripts/sergei_s_s/custom_modules/subscription/renewal_emails/bs_cm_renewal_emails_templates',
        'SuiteScripts/sergei_s_s/custom_modules/subscription/network/bs_cm_network_operations',
    ],
    /**
     * @param{record} record
     */
    (
        record,
        search,
        file,
        format,
        //moment,
        { isNullOrEmpty, logExecution },
        { getScriptParameterByName, printCurrentScriptRemainingUsage },
        { addFilter},
        { getRenewalEmailParamsForBSN, getInitialRenewalEmailsParamsBySearchResult },
        { initSuiteBillingBSNEnvSettings },
        {
            getRenewalChargeUniSearchFiltersColumns,
            createTermsSearch,
            createNoneTermsSearches,
        },
        {
            createTimeFilter,
            addCheckAndUncheckFilters,
            addZeroOrMoreDaysFilter,
            addLessThenZeroDaysFilter,
        },
        { addZeroDaysColumn },
        { renderTransactionPDF },
        { getEmailTemplateByCode },
        { networkSuspend, networkEmpty },
    ) => {




        function bsnGetMailingList(period, subtype, hascc){
            let settings;

            try {
                settings = getRenewalEmailParamsForBSN(period, subtype, '');
            } catch(error) {
                logExecution('ERROR', 'Wrong data', 'Stopping.');
                return;
            }

            const checkCC = hascc || false;
            printCurrentScriptRemainingUsage();

            const isTerms = settings.isTerms;
            const sendToSales = settings.sendToSales;

            let renewalChargeUniSearch, newFilters;

            logExecution('DEBUG', 'settings', JSON.stringify(settings));
            renewalChargeUniSearch = getRenewalChargeUniSearchFiltersColumns();
            logExecution('DEBUG', 'filters length', renewalChargeUniSearch.filters.length);

            newFilters = addFilter(renewalChargeUniSearch.filters, createTimeFilter(isTerms, period, subtype, settings.from, settings.to));
            newFilters = addCheckAndUncheckFilters(newFilters, settings.check, settings.uncheck);

            if(settings.to >= 0){
                newFilters = addZeroOrMoreDaysFilter(newFilters, subtype);
            } else {
                newFilters = addLessThenZeroDaysFilter(newFilters, subtype);
            }

            let newColumns;

            if( settings.from == 0 ){
                newColumns = addZeroDaysColumn(renewalChargeUniSearch.columns);
            } else {
                newColumns = renewalChargeUniSearch.columns;
            }

            logExecution('DEBUG', 'filters', newFilters.length);
            let searchSubs = [];

            if(isTerms) {
                const preparedSearch = createTermsSearch(newColumns, newFilters);
                searchSubs.push(preparedSearch.run());
            } else {
                const preparedSearches = createNoneTermsSearches(newColumns, newFilters);

                for (const preparedSearch of preparedSearches) {
                    searchSubs.push(preparedSearch.run())
                }
            }

            logExecution('DEBUG', 'searchSubs', JSON.stringify(searchSubs));
            printCurrentScriptRemainingUsage();

            if(searchSubs.length) {
                for(let k = 0; k < searchSubs.length; k++) {
                    if (searchSubs[k]) {
                        const customerTemplate = getEmailTemplateByCode(period, subtype == 'bsnee' ? 'bsnee' : 'customer');
                        const enduserTemplate = getEmailTemplateByCode(period, 'enduser');
                        const salesTemplate = getEmailTemplateByCode(period, subtype == 'bsnee' ? 'bsneesales' : 'sales');
                        const pendingSearch = getEmailTemplateByCode(period, 'searchId');

                        searchSubs[k].each((searchResult) => {
                            let override = false;
                            const subValues = getInitialRenewalEmailsParamsBySearchResult(searchResult);

                            if( settings.from == 0 ) {
                                subValues.invoiceId = searchResult.getValue('internalid', 'invoice');
                            }

                            logExecution('DEBUG', 'subValues', JSON.stringify(subValues));

                            try {
                                if (!isNullOrEmpty(subValues.billingAccountCC)) {
                                    const custRec = record.load({
                                        type: 'customer',
                                        id: subValues.customerId,
                                        isDynamic: false,

                                    });

                                    if (custRec) {
                                        const lineCount = custRec.getLineCount({
                                            sublistId: 'paymentinstruments'
                                        });

                                        for (let n = 1; n <= lineCount; n++) {
                                            const ccID = custRec.getSublistValue({
                                                sublistId: 'paymentinstruments',
                                                fieldId: 'id',
                                                line: n
                                            });

                                            const ccMask = custRec.getSublistValue({
                                                sublistId: 'paymentinstruments',
                                                fieldId: 'mask',
                                                line: n
                                            });

                                            if (ccID === subValues.billingAccountCC) {
                                                subValues.ccNumber = ccMask;
                                                break;
                                            }
                                        }
                                    }
                                }
                            } catch(error) {
                                logExecution('DEBUG', 'Exception ', error.message );
                                logExecution('DEBUG', 'Exception ', error.stack);
                                logExecution('DEBUG', 'Exception ', error.toString());
                            }

                            const isDisty = subValues.networkAdmin !== subValues.customerEmail;
                            settings = getRenewalEmailParamsForBSN(period, subtype, subValues.billingAccountCountry);

                            const tranasactionId = settings.attachInvoice ? subValues.invoiceId : null;
                            if (!isNullOrEmpty(subValues.overrideSuspension)) {
                                override = true;
                            }

                            if (!isNullOrEmpty(subValues.customerEmail)) {
                                if((isDisty && settings.sendToDisty ) || !isDisty) {
                                    let fileId = null;
                                    if(subtype == 'bsnee' && period == '0t') {
                                        fileId = getScriptParameterByName('custscript_sb_bsnc_attachment')  || 3792706;
                                    }

                                    const emailSent = sendRecurringEmail(subValues, 'customer', customerTemplate, tranasactionId, fileId);

                                    if (emailSent) {
                                        logExecution('DEBUG', 'Email sent', 'Email sent to Customer: "' + subValues.customerEmail + '".');
                                        const subRec = record.load({
                                            type: 'subscription',
                                            id:  subValues.subscriptionId
                                        });

                                        if (subRec) {setValue
                                            if (settings.suspend) {
                                                subRec.setValue('custrecord_sb_sub_network_suspended', 'T');
                                            }

                                            subRec.setValue(settings.check, 'T');
                                            const submitRes = subRec.save();

                                            if (submitRes) {
                                                logExecution('DEBUG', 'Checkbox Updated', `Checkbox ${settings.check} was set to true.`);
                                            } else {
                                                logExecution('DEBUG', 'Checkbox not Updated', `ERROR: Checkbox ${settings.check} was not set to true.`);
                                            }
                                        }

                                    } else {
                                        logExecution('DEBUG', 'Email not sent', `ERROR: Email was not sent to Customer: "${subValues.customerEmail}".`);
                                    }
                                }

                                if(isDisty && settings.sendToOwner) {
                                    if (!isNullOrEmpty(subValues.networkAdmin)) {
                                        if (isDisty) {
                                            const enduserSent = sendRecurringEmail(subValues, 'enduser', enduserTemplate, null);

                                            if (enduserSent) {
                                                logExecution('DEBUG', 'Email sent', 'Email sent to End User: "' + subValues.networkAdmin + '".');

                                                if(isDisty && !settings.sendToDisty){
                                                    const subRec = record.load({
                                                        type: 'subscription',
                                                        id: subValues.subscriptionId,
                                                    });

                                                    if (subRec) {
                                                        subRec.setValue(settings.check, 'T');
                                                        const submitRes = subRec.save();

                                                        if (submitRes) {
                                                            logExecution('DEBUG', 'Checkbox Updated', `Checkbox ${settings.check} was set to true.`);
                                                        } else {
                                                            logExecution('DEBUG', 'Checkbox not Updated', `ERROR: Checkbox ${settings.check} was not set to true.`);
                                                        }
                                                    }
                                                }
                                            } else {
                                                logExecution('DEBUG', 'Email not sent', `ERROR: Email was not sent to End User: "${subValues.networkAdmin}".`);
                                            }
                                        } else {
                                            logExecution('DEBUG', 'Email not sent', 'No End User. Skipping...');
                                        }
                                    } else {
                                        logExecution('DEBUG', 'Email not sent', 'No End User Email. Skipping...');
                                    }
                                }
                                if (sendToSales && (bsnIsMoreThanNSubs(subValues.networkId, subValues.bsnType, 25) || subtype == 'bsnee')) {
                                    const salesSent = sendRecurringEmail(subValues, 'sales', salesTemplate, tranasactionId);

                                    if (salesSent) {
                                        logExecution('DEBUG', 'Email sent', `Sales Email sent to SalesRep: "${subValues.salesRepName }".`);
                                    } else {
                                        logExecution('DEBUG', 'Email not sent', 'ERROR: Sales Email was not sent to SalesRep: "${subValues.salesRepName}".');
                                    }
                                } else {
                                    logExecution('DEBUG', 'Email not sent', 'Less than 25 Subs or not Terms. Skipping...');
                                }
                            } else {
                                // TODO: Send Email to Sales if no email address on record
                                logExecution('DEBUG', 'Email not sent', `Customer "${subValues.customerName}" has no Email. Skipping...`);
                            }

                        });

                        for (let i = 0; i < searchSubs[k].length; i++) {
                            if (settings.suspend) {
                                if (parseInt(subValues.bsnType) === netTypeCom) {
                                   // const delResult = networkEmpty(subValues.networkId, subValues.subscriptionId);

                                    if (delResult) {
                                        nlapiLogExecution('DEBUG', 'EMPTY', 'Network "' + subValues.networkName + '" ID: ' + subValues.networkId + ' is empty.');
                                    } else {
                                        nlapiLogExecution('DEBUG', 'EMPTY', 'Network "' + subValues.networkName + '" ID: ' + subValues.networkId + ' was not emptied.');
                                    }
                                } else if (parseInt(subValues.bsnType) === netTypeCloud) {
                                    //const suspendResult = networkSuspend(subValues.networkId, true);

                                    if (suspendResult) {
                                        nlapiLogExecution('DEBUG', 'SUSPEND', 'Network "' + subValues.networkName + '" ID: ' + subValues.networkId + ' is suspended.');
                                    } else {
                                        nlapiLogExecution('DEBUG', 'SUSPEND', 'Network "' + subValues.networkName + '" ID: ' + subValues.networkId + ' was not suspended.');
                                    }
                                }
                            }

                            printCurrentScriptRemainingUsage();
                            //}
                        }
                    }
                }
            }
        }

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            const subtype = 'bsn';
            const period = '-30t';

            logExecution('DEBUG', '', '================== BSN Subscriptions creation Start =================');
            logExecution('DEBUG', 'Init data', `subtype: ${subtype}, period: ${period}"`);

          //  const today = moment().format(); // TODO: nlapiDateToString(new Date()); - check
            //logExecution('DEBUG', 'today', today);

            if(!isNullOrEmpty(subtype) && !isNullOrEmpty(period) ) {
                bsnGetMailingList(period, subtype);
            }



        }
        execute();
        return { execute }

    });
