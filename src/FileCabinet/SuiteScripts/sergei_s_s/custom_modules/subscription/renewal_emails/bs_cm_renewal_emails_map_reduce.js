/**
 * @NApiVersion 2.1
 */
define([
        'N/record',

        './../../utilities/bs_cm_general_utils',
        './../../utilities/bs_cm_runtime_utils',
        './../../utilities/bs_cm_search_utils',

        './../../utilities/bs_cm suite_billing_settings_utils',

        './bs_cm_renewal_emails_parameters_preparation',
        './bs_cm_renewal_emails_searches',
        './bs_cm_renewal_emails_search_filters',
        './bs_cm_renewal_email_search_columns',
        './bs_cm_renewal_emails_templates',
        './bs_cm_renewal_emails',
    ],
    
    (
        record,
        { isNullOrEmpty, logExecution },
        { getScriptParameterByName, printCurrentScriptRemainingUsage },
        { addFilter},
        { initSuiteBillingBSNEnvSettings },
        { getInitialRenewalEmailsParamsBySearchResult },
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
        { getEmailTemplateByCode },
        { sendRecurringEmail },
    ) => {
        function prepareAndExecuteSearches(period, subtype, hascc, settings) {
            printCurrentScriptRemainingUsage();

            const checkCC = hascc || false;
            const isTerms = settings.isTerms;

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

            return searchSubs;
        }

        function prepareRenewalEmailsParamsBySearchResult(settings, searchSubs) {
            if (isNullOrEmpty(searchSubs)) {
                throw new Error('"searchSubs" are not defined')
            }

            const subValuesList = {};

            for(let k = 0; k < searchSubs.length; k++) {
                if (!isNullOrEmpty(searchSubs[k])) {
                    searchSubs[k].each((searchResult) => {
                        const subValues = getInitialRenewalEmailsParamsBySearchResult(searchResult);

                        if(settings.from == 0) {
                            subValues.invoiceId = searchResult.getValue('internalid', 'invoice');
                        }

                        logExecution('DEBUG', 'subValues', JSON.stringify(subValues));

                        subValuesList[`resultSet${k}`] = subValues;
                    });
                }
            }

            return subValuesList;
        }

        function addCCNumberToRenewalEmailsParams(subValues) {
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

                    for (let line = 1; n <= lineCount; n++) {
                        const ccID = custRec.getSublistValue({
                            sublistId: 'paymentinstruments',
                            fieldId: 'id',
                            line,
                        });

                        const ccMask = custRec.getSublistValue({
                            sublistId: 'paymentinstruments',
                            fieldId: 'mask',
                            line,
                        });

                        if (ccID === subValues.billingAccountCC) {
                            subValues.ccNumber = ccMask;
                            break;
                        }
                    }
                }
            }

            return subValues;
        }

        function sendEmailToCustomerAndSuspendNetwork(subtype, period, isDisty, tranasactionId, settings, subValues) {
            if((isDisty && settings.sendToDisty ) || !isDisty) {
                let fileId = null;
                if(subtype == 'bsnee' && period == '0t') {
                    fileId = getScriptParameterByName('custscript_sb_bsnc_attachment')  || 3792706;
                }

                const customerTemplate = getEmailTemplateByCode(period, subtype == 'bsnee' ? 'bsnee' : 'customer');
                const emailSent = sendRecurringEmail(subValues, 'customer', customerTemplate, tranasactionId, fileId);

                if (emailSent) {
                    logExecution('DEBUG', 'Email sent', `Email sent to Customer: "${subValues.customerEmail}".`);
                    const subRec = record.load({
                        type: 'subscription',
                        id:  subValues.subscriptionId
                    });

                    if (subRec) {
                        if (settings.suspend) {
                            subRec.setValue('custrecord_sb_sub_network_suspended', true);
                        }

                        subRec.setValue(settings.check, true);
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
        }

        function sendEmailToOwnerAndSuspendNetwork(period, isDisty, settings, subValues) {
            if (!isNullOrEmpty(subValues.networkAdmin)) {
                if (isDisty) {
                    const enduserTemplate = getEmailTemplateByCode(period, 'enduser');
                    const enduserSent = sendRecurringEmail(subValues, 'enduser', enduserTemplate, null);

                    if (enduserSent) {
                        logExecution('DEBUG', 'Email sent', `Email sent to End User: "${subValues.networkAdmin}".`);

                        if(isDisty && !settings.sendToDisty){
                            const subRec = record.load({
                                type: 'subscription',
                                id: subValues.subscriptionId,
                            });

                            if (subRec) {
                                subRec.setValue(settings.check, true);
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

        function sendEmailToSales(subtype, period, tranasactionId, settings, subValues ) {
            const sendToSales = settings.sendToSales;

            if (sendToSales && (bsnIsMoreThanNSubs(subValues.networkId, subValues.bsnType, 25) || subtype == 'bsnee')) {
                const salesTemplate = getEmailTemplateByCode(period, subtype == 'bsnee' ? 'bsneesales' : 'sales');
                const salesSent = sendRecurringEmail(subValues, 'sales', salesTemplate, tranasactionId);

                if (salesSent) {
                    logExecution('DEBUG', 'Email sent', `Sales Email sent to SalesRep: "${subValues.salesRepName }".`);
                } else {
                    logExecution('DEBUG', 'Email not sent', 'ERROR: Sales Email was not sent to SalesRep: "${subValues.salesRepName}".');
                }
            } else {
                logExecution('DEBUG', 'Email not sent', 'Less than 25 Subs or not Terms. Skipping...');
            }
        }

        return {
            prepareAndExecuteSearches,
            prepareRenewalEmailsParamsBySearchResult,
            addCCNumberToRenewalEmailsParams,
            sendEmailToCustomerAndSuspendNetwork,
            sendEmailToOwnerAndSuspendNetwork,
            sendEmailToSales,
        }
    });
