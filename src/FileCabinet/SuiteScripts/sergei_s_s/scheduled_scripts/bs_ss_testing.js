/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
require([
        'N/record',
        'N/runtime',
        'N/search',
        './../custom_modules/moment',
        '../custom_modules/utilities/bs_cm suite_billing_settings_utils',
        './../custom_modules/utilities/bs_cm_general_utils'
    ],
    /**
     * @param{http} http
     */
    (
        record,
        runtime,
        search,
        moment,
        { initSuiteBillingBSNEnvSettings },
        { isNullOrEmpty, logExecution }
    ) => {
        // TODO: to general functions (check)
        function bsnGetEmailTemplateByCode(code, type){
            sbBSNSettings = initSuiteBillingBSNSettings();

            const res = search(code, sbBSNSettings.emailTemplates, 'code');
            return res == -1 ? 0 : parseInt(sbBSNSettings.emailTemplates[res][type]);
        }

        function bsnGetMailingList(period, subtype, hascc){
            let settings;

            try {
                settings = bsnRenewalEmailFromTo(period, subtype, '');
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
                searchSubs.push(createTermsSearch(newColumns, newFilters));
            } else {
                searchSubs = createNoneTermsSearches(newColumns, newFilters);
            }

            logExecution('DEBUG', 'searchSubs', JSON.stringify(searchSubs));
            printCurrentScriptRemainingUsage();

            if(searchSubs.length) {
                for(let k = 0; k < searchSubs.length; k++) {
                    if (searchSubs[k]) {
                        const customerTemplate = bsnGetEmailTemplateByCode(period, subtype == 'bsnee' ? 'bsnee' : 'customer');
                        const enduserTemplate = bsnGetEmailTemplateByCode(period, 'enduser');
                        const salesTemplate = bsnGetEmailTemplateByCode(period, subtype == 'bsnee' ? 'bsneesales' : 'sales');
                        const pendingSearch = bsnGetEmailTemplateByCode(period, 'searchId');

                        for (let i = 0; i < searchSubs[k].length; i++) {
                            let override = false;
                            const subValues = {};

                            subValues.customerId = searchSubs[k][i].getValue('billto');
                            subValues.customerName = searchSubs[k][i].getText('billto');
                            subValues.customerEmail = searchSubs[k][i].getValue('email', 'customer');
                            subValues.terms = parseInt(searchSubs[k][i].getValue('formulatext'));
                            subValues.daysLeft = parseInt(searchSubs[k][i].getValue('formulanumeric'));
                            subValues.enduserId = searchSubs[k][i].getValue('custrecord_bsn_sub_end_user', 'subscription');
                            subValues.enduserName = searchSubs[k][i].getText('custrecord_bsn_sub_end_user', 'subscription');
                            subValues.enduserEmail = '';
                            subValues.billingAccount = searchSubs[k][i].getValue('billingaccount');
                            subValues.billingAccountCountry = searchSubs[k][i].getValue('custrecord_ba_country_code', 'billingaccount') || '';
                            subValues.billingAccountCC = searchSubs[k][i].getValue('custrecord_payop_ccid', 'billingaccount');
                            subValues.ccNumber = '';
                            subValues.startDate = searchSubs[k][i].getValue('startdate', 'subscription');
                            subValues.endDate = searchSubs[k][i].getValue('enddate', 'subscription');
                            subValues.daysAfter = parseInt(searchSubs[k][i].getValue('formulanumeric')) * (-1);
                            subValues.plan = searchSubs[k][i].getValue('subscriptionplan', 'subscription');
                            subValues.renewalNumber = searchSubs[k][i].getValue('renewalnumber', 'subscription');
                            subValues.status = searchSubs[k][i].getValue('status', 'subscription');
                            subValues.adminEmail = searchSubs[k][i].getValue('custrecord_sub_network_admin', 'subscription');
                            subValues.networkId = searchSubs[k][i].getValue('custrecord_sub_network_id', 'subscription');
                            subValues.bsnType = searchSubs[k][i].getValue('custrecord_bsn_type', 'subscription');
                            subValues.bsnTypeName = searchSubs[k][i].getText('custrecord_bsn_type', 'subscription');
                            subValues.salesRep = searchSubs[k][i].getValue('salesrep', 'customer');
                            subValues.salesRepName = searchSubs[k][i].getText('salesrep', 'customer');
                            subValues.amount = searchSubs[k][i].getValue('amount');
                            subValues.subscriptionId = searchSubs[k][i].getValue('subscription');
                            subValues.subscription = searchSubs[k][i].getValue('name', 'subscription');
                            subValues.overrideSuspension = searchSubs[k][i].getValue('custrecord_sub_override_suspension', 'subscription') || 0;
                            subValues.po = searchSubs[k][i].getValue('custrecord_bs_subscription_po', 'subscription');
                            subValues.networkName = searchSubs[k][i].getValue('custrecord_sub_network_name', 'subscription');
                            subValues.networkAdmin = searchSubs[k][i].getValue('custrecord_sub_network_admin', 'subscription');

                            if( settings.from == 0 ) {
                                subValues.invoiceId = searchSubs[k][i].getValue('internalid', 'invoice');
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
                                        const lineCount = objRecord.getLineCount({
                                            sublistId: 'paymentinstruments'
                                        });


                                        for (let n = 1; n <= lineCount; n++) {
                                            const ccID = objRecord.getSublistValue({
                                                sublistId: 'paymentinstruments',
                                                fieldId: 'id',
                                                line: n
                                            });

                                            const ccMask = objRecord.getSublistValue({
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
                            settings = bsnRenewalEmailFromTo(period, subtype, subValues.billingAccountCountry);

                            const tranasactionId = settings.attachInvoice ? subValues.invoiceId : null;
                            if (!isNullOrEmpty(subValues.overrideSuspension)) {
                                override = true;
                            }

                            if (!isNullOrEmpty(subValues.customerEmail)) {
                                if((isDisty && settings.sendToDisty ) || !isDisty) {
                                    let fileId = null;
                                    if(subtype == 'bsnee' && period == '0t') {
                                        fileId = scriptObj.getParameter( {type: 'SCRIPT', name: 'custscript_sb_bsnc_attachment'}) || 3792706;
                                    }

                                    var emailSent = bsnRecurringEmail(subValues, 'customer', customerTemplate, tranasactionId, fileId);
                                    if (emailSent) {
                                        nlapiLogExecution('DEBUG', 'Email sent', 'Email sent to Customer: "' + subValues.customerEmail + '".');
                                        var subRec = nlapiLoadRecord('subscription', subValues.subscriptionId);
                                        if (subRec) {
                                            if (settings.suspend) subRec.setFieldValue('custrecord_sb_sub_network_suspended', 'T');
                                            subRec.setFieldValue(settings.check, 'T');
                                            var submitRes = nlapiSubmitRecord(subRec);
                                            if (submitRes) {
                                                nlapiLogExecution('DEBUG', 'Checkbox Updated', 'Checkbox ' + settings.check + ' was set to true.');
                                            } else {
                                                nlapiLogExecution('DEBUG', 'Checkbox not Updated', 'ERROR: Checkbox ' + settings.check + ' was not set to true.');
                                            }
                                        }

                                    } else {
                                        nlapiLogExecution('DEBUG', 'Email not sent', 'ERROR: Email was not sent to Customer: "' + subValues.customerEmail + '".');
                                    }
                                }

                                if( isDisty && settings.sendToOwner ) {
                                    if (!isNullorEmpty(subValues.networkAdmin)) {
                                        if (isDisty) {
                                            var enduserSent = bsnRecurringEmail(subValues, 'enduser', enduserTemplate, null);
                                            if (enduserSent) {
                                                nlapiLogExecution('DEBUG', 'Email sent', 'Email sent to End User: "' + subValues.networkAdmin + '".');
                                                if( isDisty && !settings.sendToDisty ){
                                                    var subRec = nlapiLoadRecord('subscription', subValues.subscriptionId);
                                                    if (subRec) {
                                                        subRec.setFieldValue(settings.check, 'T');
                                                        var submitRes = nlapiSubmitRecord(subRec);
                                                        if (submitRes) {
                                                            nlapiLogExecution('DEBUG', 'Checkbox Updated', 'Checkbox ' + settings.check + ' was set to true.');
                                                        } else {
                                                            nlapiLogExecution('DEBUG', 'Checkbox not Updated', 'ERROR: Checkbox ' + settings.check + ' was not set to true.');
                                                        }
                                                    }
                                                }
                                            } else {
                                                nlapiLogExecution('DEBUG', 'Email not sent', 'ERROR: Email was not sent to End User: "' + subValues.networkAdmin + '".');
                                            }
                                        } else {
                                            nlapiLogExecution('DEBUG', 'Email not sent', 'No End User. Skipping...');
                                        }
                                    } else {
                                        nlapiLogExecution('DEBUG', 'Email not sent', 'No End User Email. Skipping...');
                                    }
                                }
                                if (sendToSales && (bsnIsMoreThanNSubs(subValues.networkId, subValues.bsnType, 25) || subtype == 'bsnee')) {
                                    var salesSent = bsnRecurringEmail(subValues, 'sales', salesTemplate, tranasactionId);
                                    if (salesSent) {
                                        nlapiLogExecution('DEBUG', 'Email sent', 'Sales Email sent to SalesRep: "' + subValues.salesRepName + '".');
                                    } else {
                                        nlapiLogExecution('DEBUG', 'Email not sent', 'ERROR: Sales Email was not sent to SalesRep: "' + subValues.salesRepName + '".');
                                    }
                                } else {
                                    nlapiLogExecution('DEBUG', 'Email not sent', 'Less than 25 Subs or not Terms. Skipping...');
                                }
                            } else {
                                /*TODO: Send Email to Sales if no email address on record*/
                                nlapiLogExecution('DEBUG', 'Email not sent', 'Customer "' + subValues.customerName + '" has no Email. Skipping...');
                            }

                            if (settings.suspend) {
                                if (parseInt(subValues.bsnType) === netTypeCom) {
                                    var delResult = networkEmpty(subValues.networkId, subValues.subscriptionId);
                                    if (delResult) {
                                        nlapiLogExecution('DEBUG', 'EMPTY', 'Network "' + subValues.networkName + '" ID: ' + subValues.networkId + ' is empty.');
                                    } else {
                                        nlapiLogExecution('DEBUG', 'EMPTY', 'Network "' + subValues.networkName + '" ID: ' + subValues.networkId + ' was not emptied.');
                                    }
                                } else if (parseInt(subValues.bsnType) === netTypeCloud) {
                                    var suspendResult = networkSuspend(subValues.networkId, true);
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
            const subtype = '.com or .cloud';
            const period = null;

            logExecution('DEBUG', '', '================== BSN Subscriptions creation Start =================');
            logExecution('DEBUG', 'Init data', `subtype: ${subtype}, period: ${period}"`);

            const today = moment().format(); // TODO: nlapiDateToString(new Date()); - check
            logExecution('DEBUG', 'today', today);

            if(!isNullOrEmpty(subtype) && !isNullOrEmpty(period) ) {
                bsnGetMailingList(period, subtype);
            }



        }
        execute();
        return { execute }

    });
