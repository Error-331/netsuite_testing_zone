/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
require([
        'N/record',
        'N/runtime',
        'N/search',
        './../custom_modules/moment',
        './../custom_modules/bs_cm suite_billing_settings_utils'
        './../custom_modules/bs_cm_general_utils'
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
        function bsnGetEmailParamsObjectDummy() {
            return {
                check:  '',
                attachInvoice: false,
                suspend: false,

                from: 0,
                to: 0,

                sendToDisty: false,
                sendToReseller: false,
                sendToOwner: false,

                isTerms: false,
                sendToSales: false,
            };
        }

        function bsnGetRenewalEmailParamsForBsn(period, subtype) {
            const paramsObject = bsnGetEmailParamsObjectDummy();

            let isROW = false;
            if(!isNullOrEmpty(countryCode) && countryCode != 'US') {
                isROW = true;
            }

            switch (period) {
                case '-30t':
                case '-30p':
                case '-30a':
                    paramsObject.check = 'custrecord_bs_sub_30day_email';
                    paramsObject.from = -30;
                    paramsObject.to = -15.01;
                    paramsObject.sendToReseller = true;
                    paramsObject.sendToDisty = true;
                    paramsObject.sendToOwner = isROW;
                    break;
                case '-15t':
                case '-15p':
                case '-15a':
                    paramsObject.check = 'custrecord_bs_sub_15day_email';
                    paramsObject.from = -15;
                    paramsObject.to = -7.01;
                    paramsObject.sendToDisty = isROW;
                    paramsObject.sendToOwner = true;
                    break;
                case '-7t':
                case '-7p':
                case '-7a':
                    paramsObject.check = 'custrecord_bs_sub_7day_email';
                    paramsObject.from = -7;
                    paramsObject.to = -0.01;
                    paramsObject.sendToDisty = isROW;
                    paramsObject.sendToOwner = true;
                    break;
                case '0t':
                    paramsObject.attachInvoice = true;
                case '0p':
                case '0a':
                    paramsObject.check = 'custrecord_bs_sub_0day_email';
                    paramsObject.from = 0;
                    paramsObject.to = 6.99;
                    paramsObject.sendToDisty = true;
                    paramsObject.sendToOwner = true;
                    break;
                case '7t':
                    paramsObject.attachInvoice = true;
                case '7p':
                case '7a':
                    paramsObject.check = 'custrecord_bs_sub_7day_past_email';
                    paramsObject.from = 7;
                    paramsObject.to = 29.99;
                    paramsObject.sendToDisty = isROW;
                    paramsObject.sendToOwner = true;
                    break;
                case '30t':
                    paramsObject.attachInvoice = true;
                //case '30p':
                case '30a':
                    paramsObject.check = 'custrecord_bs_sub_30day_past_email';
                    paramsObject.from = 30;
                    paramsObject.to = 450;
                    paramsObject.sendToDisty = true;
                    paramsObject.sendToOwner = true;
                    //suspend = true; //Do Not Suspent Terms Customers
                    break;
                default:
                    throw new Error(`Cannot determine renewal period (email params) for BSN: "${period}"`);
                    break;
            }

            if( subtype == 'bsn' && period == '7p' ) {
                paramsObject.suspend = true;
            }

            switch (period) {
                case '-30t':
                case '-15t':
                case '30t':
                    paramsObject.isTerms = true;
                    break;
                case '-7t':
                case '0t':
                case '7t':
                    paramsObject.isTerms = true;
                    paramsObject.sendToSales = true;
                    break;
                default:
                    break;
            }

            return paramsObject;
        }

        function bsnGetRenewalEmailParamsForBsnee(period) {
            const paramsObject = bsnGetEmailParamsObjectDummy();

            paramsObject.sendToDisty = true;
            switch (period) {
                case '-30t':
                    paramsObject.check = 'custrecord_bs_sub_30day_email';
                    paramsObject.from = -30;
                    paramsObject.to = -15.01;

                    break;
                case '-15t':
                    paramsObject.check = 'custrecord_bs_sub_15day_email';
                    paramsObject.from = -15;
                    paramsObject.to = -7.01;

                    break;
                case '-7t':
                    paramsObject.check = 'custrecord_bs_sub_7day_email';
                    paramsObject.from = -7;
                    paramsObject.to = -0.01;

                    break;
                case '0t':
                    paramsObject.check = 'custrecord_bs_sub_0day_email';
                    paramsObject.from = 0;
                    paramsObject.to = 30;

                    break;
                default:
                    throw new Error(`Cannot determine renewal period (email params) for BSNEE: "${period}"`);

                    break;
            }

            switch (period) {
                case '-15t':
                case '-7t':
                case '0t':
                    paramsObject.isTerms = true;
                    paramsObject.sendToSales = true;
                    break;
                default:
                    break;
            }
        }

        function bsnRenewalEmailFromTo(period, subtype){
            if(subtype == 'bsn') {
                return bsnGetRenewalEmailParamsForBsn(period, subtype);
            } else if( subtype == 'bsnee' ) {
                return bsnGetRenewalEmailParamsForBsnee(period);
            }
        }

        // TODO: to general functions (check)
        function addFilter(filters, newFilter){
            return filters.split().push(newFilter);
        }

        // TODO: to general functions (check)
        function search(nameKey, myArray, myArrayIndex){
            for (var i=0; i < myArray.length; i++) {
                if (myArray[i][myArrayIndex] === nameKey) {
                    return i;
                }
            }
            return -1;
        }

        // TODO: to general functions (check)
        function bsnGetEmailTemplateByCode(code, type){
            sbBSNSettings = initSuiteBillingBSNEnvSettings();

            const res = search(code, sbBSNSettings.emailTemplates, 'code');
            return res == -1 ? 0 : parseInt(sbBSNSettings.emailTemplates[res][type]);
        }

        function bsnGetMailingList(period, subtype, hascc){
            let settings;

            try {
                settings = bsnRenewalEmailFromTo(period, subtype, '');
            } catch(error) {
                logExecution( 'ERROR', 'Wrong data', 'Stopping.' );
                return;
            }

            const checkCC = hascc || false;
            // TODO: to general module
            const scriptObj = runtime.getCurrentScript();
            logExecution('DEBUG', 'Units Left', scriptObj.getRemainingUsage());


            const isTerms = settings.isTerms;
            const sendToSales = settings.sendToSales;

            let i, renewalChargeUniSearch, filters, columns, newFilters, newColumns;

            logExecution('DEBUG', 'settings', JSON.stringify(settings));

            renewalChargeUniSearch = search.load({
                type: 'charge',
                id: 'customsearch_sb_renewal_charge_uni'
            });

            filters = search.filters;
            columns = search.columns;

            logExecution('DEBUG', 'filters', filters.length);


            let timeFilter = null;
            if( isTerms && period === '7t' && subtype != 'bsnee' ){
                timeFilter = search.createFilter({
                    name: 'entity',
                    join: null,
                    operator: search.Operator.BETWEEN,
                    values: [-10, 0]
                });

                timeFilter.setFormula("(FLOOR({now}-{subscription.startdate})) - (CASE WHEN regexp_like({invoice.terms}, '*Net 45') THEN  45 WHEN regexp_like({invoice.terms}, '*Net 60') THEN  60 WHEN regexp_like({invoice.terms}, '*Net 90') THEN  90 WHEN regexp_like({invoice.terms}, '*Net 120') THEN  120 WHEN regexp_like({invoice.terms}, '*Net*') THEN  30 ELSE 0 END)" );
            } else if( isTerms && period === '30t' && subtype != 'bsnee' ){
                timeFilter = search.createFilter({
                    name: 'formulanumeric',
                    join: null,
                    operator: search.Operator.GREATERTHANOREQUALTO,
                    values: [0]
                });

                timeFilter.setFormula( "(FLOOR({now}-{subscription.startdate})) - (CASE WHEN regexp_like({invoice.terms}, '*Net 45') THEN  45 WHEN regexp_like({invoice.terms}, '*Net 60') THEN  60 WHEN regexp_like({invoice.terms}, '*Net 90') THEN  90 WHEN regexp_like({invoice.terms}, '*Net 120') THEN  120 WHEN regexp_like({invoice.terms}, '*Net*') THEN  30 ELSE 0 END)" );
            } else {
                timeFilter = search.createFilter({
                    name: 'formulanumeric',
                    join: null,
                    operator: search.Operator.BETWEEN,
                    values: [settings.from, settings.to],
                });

                timeFilter.setFormula( '{now}-{subscription.startdate}' );
            }
            newFilters = addFilter(filters, timeFilter);
            if( !isNullorEmpty( settings.check ) ) {
                const subFilter = search.createFilter({
                    name: settings.check,
                    join: 'subscription',
                    operator: search.Operator.IS,
                    values: ['is', 'F'],
                });

                newFilters = addFilter(newFilters, subFilter);
            }

            if( settings.uncheck && settings.uncheck.length ){
                for(i = 0; i < settings.uncheck.length; i++) {
                    const subFilter = search.createFilter({
                        name: settings.uncheck[i],
                        join: 'subscription',
                        operator: search.Operator.IS,
                        values: ['is', 'F'],
                    });

                    newFilters = addFilter(newFilters, subFilter);
                }
            }

            if(settings.to >= 0){
                let subFilter = search.createFilter({
                    name: 'status',
                    join: 'subscription',
                    operator: search.Operator.ANYOF,
                    values: ['anyof', 'ACTIVE'],
                });

                newFilters = addFilter(newFilters, subFilter);

                subFilter = search.createFilter({
                    name: 'status',
                    join: 'invoice',
                    operator: search.Operator.ANYOF,
                    values: ['CustInvc:A'],
                });

                newFilters = addFilter(newFilters, subFilter);
                let eligibleItems = [sbBSNSettings.bsn1yrItemNum, sbBSNSettings.bsnc1yrItemNum];

                if(subtype == 'bsnee') {
                    eligibleItems = [sbBSNSettings.bsnee1yrItemNum];
                }

                subFilter = search.createFilter({
                    name: 'status',
                    join: 'invoice',
                    operator: search.Operator.ANYOF,
                    values: [eligibleItems],
                });

                newFilters = addFilter( newFilters, subFilter);
            } else {
                let eligibleItems = [netTypeCom, netTypeCloud];
                if(subtype == 'bsnee') {
                    eligibleItems = [netTypeBSNEE];
                }

                logExecution('DEBUG', 'eligibleItems', JSON.stringify(eligibleItems));

                let subFilter = search.createFilter({
                    name: 'custrecord_bsn_type',
                    join: 'subscription',
                    operator: search.Operator.ANYOF,
                    values: [eligibleItems],
                });

                newFilters = addFilter(newFilters, subFilter);

                subFilter = search.createFilter({
                    name: 'status',
                    join: 'subscription',
                    operator: search.Operator.ANYOF,
                    values: ['PENDING_ACTIVATION'],
                });

                newFilters = addFilter(newFilters, subFilter);
            }

            if( settings.from == 0 ){
                const internalIdInvoiceColumn = search.createColumn({
                    name: 'internalid',
                    join: 'invoice',
                });

                newColumns = addFilter( columns, internalIdInvoiceColumn);
            } else {
                newColumns = columns;
            }

            logExecution('DEBUG', 'filters', newFilters.length);
            const searchSubs = [];

            if(isTerms) {
                let subFilter =  search.createFilter({
                    name: 'terms',
                    join: 'customer',
                    operator: search.Operator.NONEOF,
                    values: ['@NONE@', '13'],
                });

                let filters0 = addFilter(newFilters, subFilter);

                subFilter =  search.createFilter({
                    name: 'custrecord_payop_ccid',
                    join: 'billingaccount',
                    operator: search.Operator.ISEMPTY,
                });

                filters0 = addFilter(filters0, subFilter);
                logExecution('DEBUG', 'filters', filters0);

                let subSearch = search.create({
                    type: 'charge',
                    id: null,
                    columns: newColumns,
                    filters: filters0,
                });

                searchSubs.push(subSearch);
            } else {
                let subFilters = search.createFilter({
                    name: 'terms',
                    join: 'customer',
                    operator: search.Operator.ANYOF,
                    values: ['@NONE@', '13'],
                });

                const filters1 = addFilter(newFilters, subFilters);
                let subSearch = search.create({
                    type: 'charge',
                    id: null,
                    columns: newColumns,
                    filters: filters1,
                });

                searchSubs.push(subSearch);
                subFilters = search.createFilter({
                    name: 'terms',
                    join: 'customer',
                    operator: search.Operator.NONEOF,
                    values: ['@NONE@', '13'],
                });

                let filters2 = addFilter(newFilters, subFilters);
                subFilters = search.createFilter({
                    name: 'custrecord_payop_ccid',
                    join: 'billingaccount',
                    operator: search.Operator.ISNOTEMPTY,
                });

                filters2 = addFilter(filters2, subFilters);
                subSearch = search.create({
                    type: 'charge',
                    id: null,
                    columns: newColumns,
                    filters: filters2,
                });

                searchSubs.push(subSearch);
            }

            logExecution('DEBUG', 'searchSubs', JSON.stringify(searchSubs));
            logExecution('DEBUG', 'Units Left', scriptObj.getRemainingUsage());

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


                            usage = nlapiGetContext().getRemainingUsage();
                            nlapiLogExecution('DEBUG', 'Units Left', usage);
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
