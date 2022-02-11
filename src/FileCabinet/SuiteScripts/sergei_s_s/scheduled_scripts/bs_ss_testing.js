/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
require([
        'N/record',
        './../custom_modules/moment',
        './../custom_modules/bs_cm_general_utils'
    ],
    /**
     * @param{http} http
     */
    (
        record,
        moment,
        { isNullOrEmpty, logExecution }
    ) => {
        function bsnGetRenewalEmailParamsForBsn() {
            switch (period) {
                case '-30t':
                case '-30p':
                case '-30a':
                    check = 'custrecord_bs_sub_30day_email';
                    from = -30;
                    to = -15.01;
                    sendToReseller = true;
                    sendToDisty = true;
                    sendToOwner = isROW;
                    break;
                case '-15t':
                case '-15p':
                case '-15a':
                    check = 'custrecord_bs_sub_15day_email';
                    from = -15;
                    to = -7.01;
                    sendToDisty = isROW;
                    sendToOwner = true;
                    break;
                case '-7t':
                case '-7p':
                case '-7a':
                    check = 'custrecord_bs_sub_7day_email';
                    from = -7;
                    to = -0.01;
                    sendToDisty = isROW;
                    sendToOwner = true;
                    break;
                case '0t':
                    attachInvoice = true;
                case '0p':
                case '0a':
                    check = 'custrecord_bs_sub_0day_email';
                    from = 0;
                    to = 6.99;
                    sendToDisty = true;
                    sendToOwner = true;
                    break;
                case '7t':
                    attachInvoice = true;
                case '7p':
                case '7a':
                    check = 'custrecord_bs_sub_7day_past_email';
                    from = 7;
                    to = 29.99;
                    sendToDisty = isROW;
                    sendToOwner = true;
                    break;
                case '30t':
                    attachInvoice = true;
                //case '30p':
                case '30a':
                    check = 'custrecord_bs_sub_30day_past_email';
                    from = 30;
                    to = 450;
                    sendToDisty = true;
                    sendToOwner = true;
                    //suspend = true; //Do Not Suspent Terms Customers
                    break;
                default:
                    error = true;
                    break;
            }

            if( subtype == 'bsn' && period == '7p' ) suspend = true;

            switch (period) {
                case '-30t':
                case '-15t':
                case '30t':
                    isTerms = true;
                    break;
                case '-7t':
                case '0t':
                case '7t':
                    isTerms = true;
                    sendToSales = true;
                    break;
                default:
                    break;
            }
        }


        function bsnRenewalEmailFromTo(period, subtype, countryCode){
            const error = false;
            const suspend = false;
            const isTerms = false;

            const sendToSales = false;

            let check = '';

            let sendToDisty = false;
            let sendToReseller = false;
            let sendToOwner = false;

            let attachInvoice = false;
            let from = 0;
            let to = 0;

            let isROW = false;
            if(!isNullOrEmpty(countryCode) && countryCode != 'US') {
                isROW = true;
            }

            if(subtype == 'bsn') {
                bsnGetRenewalEmailParamsForBsn();
            }

            if( subtype == 'bsnee' ) {
                sendToDisty = true;
                switch (period) {
                    case '-30t':
                        check = 'custrecord_bs_sub_30day_email';
                        from = -30;
                        to = -15.01;
                        break;
                    case '-15t':
                        check = 'custrecord_bs_sub_15day_email';
                        from = -15;
                        to = -7.01;
                        break;
                    case '-7t':
                        check = 'custrecord_bs_sub_7day_email';
                        from = -7;
                        to = -0.01;
                        break;
                    case '0t':
                        check = 'custrecord_bs_sub_0day_email';
                        from = 0;
                        to = 30;
                        break;
                    default:
                        error = true;
                        break;
                }

                switch (period) {
                    case '-15t':
                    case '-7t':
                    case '0t':
                        isTerms = true;
                        sendToSales = true;
                        break;
                    default:
                        break;
                }
            }

            return {
                from: from,
                to: to,
                isTerms: isTerms,
                sendToDisty: sendToDisty,
                sendToReseller: sendToReseller,
                sendToOwner: sendToOwner,
                sendToSales: sendToSales,
                attachInvoice: attachInvoice,
                check: check,
                suspend: suspend,
                error: error
            };
        }



        function bsnGetMailingList( period, subtype, hascc ){
            var settings = bsnRenewalEmailFromTo( period, subtype, '' );

            if( settings.error ){
                nlapiLogExecution( 'ERROR', 'Wrong data', 'Stopping.' );
                return;
            }

            var checkCC = hascc || false;
            var usage = nlapiGetContext().getRemainingUsage();
            nlapiLogExecution( 'DEBUG', 'Units Left', usage );

            var isTerms = settings.isTerms;
            var sendToSales = settings.sendToSales;

            var i, search, filters, columns, newFilters, newColumns;

            nlapiLogExecution('DEBUG', 'settings', JSON.stringify(settings));

            search = nlapiLoadSearch( 'charge', 'customsearch_sb_renewal_charge_uni' );
            /*
            if( isTerms ){
                search = nlapiLoadSearch( 'charge', 'customsearch_sb_renewal_charge' );
            } else {
                search = nlapiLoadSearch( 'charge', 'customsearch_sb_pending_wo_invoice' );
            }
            */
            filters = search.getFilters();
            columns = search.getColumns();
            nlapiLogExecution('DEBUG', 'filters', filters.length);
            /*
                if( !isTerms && checkCC ){
                    filters.push( new nlobjSearchFilter('ccdefault', 'customer', 'is', 'T') );

                    columns.push( new nlobjSearchColumn( 'ccexpdate', 'customer' ) );
                    columns.push( new nlobjSearchColumn( 'ccnumber', 'customer' ) );
                    columns.push( new nlobjSearchColumn( 'ccstate', 'customer' ) );
                }
            */

            var timeFilter = null;
            if( isTerms && period === '7t' && subtype != 'bsnee' ){
                timeFilter = new nlobjSearchFilter( 'formulanumeric', null, 'between', -10, 0 );
                timeFilter.setFormula( "(FLOOR({now}-{subscription.startdate})) - (CASE WHEN regexp_like({invoice.terms}, '*Net 45') THEN  45 WHEN regexp_like({invoice.terms}, '*Net 60') THEN  60 WHEN regexp_like({invoice.terms}, '*Net 90') THEN  90 WHEN regexp_like({invoice.terms}, '*Net 120') THEN  120 WHEN regexp_like({invoice.terms}, '*Net*') THEN  30 ELSE 0 END)" );
            } else if( isTerms && period === '30t' && subtype != 'bsnee' ){
                timeFilter = new nlobjSearchFilter( 'formulanumeric', null, 'greaterthanorequalto', 0 );
                timeFilter.setFormula( "(FLOOR({now}-{subscription.startdate})) - (CASE WHEN regexp_like({invoice.terms}, '*Net 45') THEN  45 WHEN regexp_like({invoice.terms}, '*Net 60') THEN  60 WHEN regexp_like({invoice.terms}, '*Net 90') THEN  90 WHEN regexp_like({invoice.terms}, '*Net 120') THEN  120 WHEN regexp_like({invoice.terms}, '*Net*') THEN  30 ELSE 0 END)" );
            } else {
                timeFilter = new nlobjSearchFilter( 'formulanumeric', null, 'between', settings.from, settings.to );
                timeFilter.setFormula( '{now}-{subscription.startdate}' );
            }
            newFilters = addFilter( filters, timeFilter );
            if( !isNullorEmpty( settings.check ) ) newFilters = addFilter( newFilters, new nlobjSearchFilter( settings.check, 'subscription', 'is', 'F' ) );
            if( settings.uncheck && settings.uncheck.length ){
                for( i = 0; i < settings.uncheck.length; i++ ) {
                    newFilters = addFilter( newFilters, new nlobjSearchFilter( settings.uncheck[i], 'subscription', 'is', 'F' ) );
                }
            }


            if( settings.to >= 0 ){
                newFilters = addFilter( newFilters, new nlobjSearchFilter( 'status', 'subscription', 'anyof', "ACTIVE" ) );
                newFilters = addFilter( newFilters, new nlobjSearchFilter( 'status', 'invoice', 'anyof', "CustInvc:A" ) );

                var eligibleItems = [sbBSNSettings.bsn1yrItemNum, sbBSNSettings.bsnc1yrItemNum];
                if( subtype == 'bsnee' ) eligibleItems = [sbBSNSettings.bsnee1yrItemNum];
                newFilters = addFilter( newFilters, new nlobjSearchFilter( 'item', 'invoice', 'anyOf', eligibleItems ) );
            } else {
                var eligibleItems = [netTypeCom, netTypeCloud];
                if( subtype == 'bsnee' ) eligibleItems = [netTypeBSNEE];
                nlapiLogExecution('DEBUG', 'eligibleItems', JSON.stringify(eligibleItems));
                newFilters = addFilter( newFilters, new nlobjSearchFilter( 'custrecord_bsn_type', 'subscription', 'anyOf', eligibleItems ) );
                newFilters = addFilter( newFilters, new nlobjSearchFilter( 'status', 'subscription', 'anyof', "PENDING_ACTIVATION" ) );
            }

            if( settings.from == 0 ){
                newColumns = addFilter( columns, new nlobjSearchColumn( 'internalid', 'invoice' ) );
            } else {
                newColumns = columns;
            }

            nlapiLogExecution('DEBUG', 'filters', newFilters.length);

            var searchSubs = [];
            if( isTerms ) {
                var filters0 = addFilter( newFilters, new nlobjSearchFilter('terms', 'customer', 'noneOf', ['@NONE@', '13']) );
                filters0 = addFilter( filters0, new nlobjSearchFilter('custrecord_payop_ccid', 'billingaccount', 'isEmpty') );
                nlapiLogExecution('DEBUG', 'filters', filters0);
                searchSubs.push(nlapiSearchRecord('charge', null, filters0, newColumns));
            } else {
                //first search not Terms
                var filters1 = addFilter( newFilters, new nlobjSearchFilter('terms', 'customer', 'anyOf', ['@NONE@', '13']) );
                searchSubs.push(nlapiSearchRecord('charge', null, filters1, newColumns));
                //add second search Terms, but Credit Card
                var filters2 = addFilter( newFilters, new nlobjSearchFilter('terms', 'customer', 'noneOf', ['@NONE@', '13']) );
                filters2 = addFilter( filters2, new nlobjSearchFilter('custrecord_payop_ccid', 'billingaccount', 'isNotEmpty') );
                searchSubs.push(nlapiSearchRecord('charge', null, filters2, newColumns));
            }
            nlapiLogExecution('DEBUG', 'searchSubs', JSON.stringify(searchSubs));
            usage = nlapiGetContext().getRemainingUsage();
            nlapiLogExecution( 'DEBUG', 'Units Left', usage );


            if( searchSubs.length ) {
                for( var k = 0; k < searchSubs.length; k++ ) {
                    if (searchSubs[k]) {
                        var customerTemplate = bsnGetEmailTemplateByCode(period, subtype == 'bsnee' ? 'bsnee' : 'customer');
                        var enduserTemplate = bsnGetEmailTemplateByCode(period, 'enduser');
                        var salesTemplate = bsnGetEmailTemplateByCode(period, subtype == 'bsnee' ? 'bsneesales' : 'sales');
                        var pendingSearch = bsnGetEmailTemplateByCode(period, 'searchId');

                        for (i = 0; i < searchSubs[k].length; i++) {
                            var override = false;
                            /*
                            var subValues = {
                                customerId: searchSubs[k][i].getValue('billto'),
                                customerName: searchSubs[k][i].getText('billto'),
                                customerEmail: searchSubs[k][i].getValue('email', 'customer'),
                                enduserId: searchSubs[k][i].getValue('custrecord_bsn_sub_end_user', 'subscription'),
                                enduserName: searchSubs[k][i].getText('custrecord_bsn_sub_end_user', 'subscription'),
                                enduserEmail: '',
                                billingAccount: searchSubs[k][i].getValue('billingaccount'),
                                billingAccountCC: searchSubs[k][k][i].getValue('custrecord_payop_ccid', 'billingaccount'),
                                ccNumber: '',
                                startDate: searchSubs[k][i].getValue('startdate', 'subscription'),
                                endDate: searchSubs[k][i].getValue('enddate', 'subscription'),
                                daysAfter: parseInt(searchSubs[k][i].getValue('formulanumeric')) * (-1),
                                plan: searchSubs[k][i].getValue('subscriptionplan', 'subscription'),
                                renewalNumber: searchSubs[k][i].getValue('renewalnumber', 'subscription'),
                                status: searchSubs[k][i].getValue('status', 'subscription'),
                                adminEmail: searchSubs[k][i].getValue('custrecord_sub_network_admin', 'subscription'),
                                networkId: searchSubs[k][i].getValue('custrecord_sub_network_id', 'subscription'),
                                bsnType: searchSubs[k][i].getValue('custrecord_bsn_type', 'subscription'),
                                bsnTypeName: searchSubs[k][i].getText('custrecord_bsn_type', 'subscription'),
                                salesRep: searchSubs[k][i].getValue('salesrep', 'customer'),
                                salesRepName: searchSubs[k][i].getText('salesrep', 'customer'),
                                amount: searchSubs[k][i].getValue('amount'),
                                subscriptionId: searchSubs[k][i].getValue('subscription'),
                                subscription: searchSubs[k][i].getValue('name', 'subscription'),
                                overrideSuspension: searchSubs[k][i].getValue('custrecord_sub_override_suspension', 'subscription') || 0,
                                po: searchSubs[k][i].getValue('custrecord_bs_subscription_po', 'subscription'),
                                networkName: searchSubs[k][i].getValue('custrecord_sub_network_name', 'subscription'),
                                networkAdmin: searchSubs[k][i].getValue('custrecord_sub_network_admin', 'subscription'),
                            };
                            */
                            var subValues = {};
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
                            if( settings.from == 0 ) subValues.invoiceId = searchSubs[k][i].getValue('internalid', 'invoice');
                            nlapiLogExecution('DEBUG', 'subValues', JSON.stringify(subValues));

                            try {
                                if (!isNullorEmpty(subValues.billingAccountCC)) {
                                    var custRec = nlapiLoadRecord('customer', subValues.customerId);
                                    if (custRec) {
                                        var lineCount = custRec.getLineItemCount('paymentinstruments');
                                        for (var n = 1; n <= lineCount; n++) {
                                            var ccID = custRec.getLineItemValue('paymentinstruments', 'id', n);
                                            var ccMask = custRec.getLineItemValue('paymentinstruments', 'mask', n);
                                            if (ccID === subValues.billingAccountCC) {
                                                subValues.ccNumber = ccMask;
                                                break;
                                            }
                                        }
                                    }
                                }
                            } catch(e) {
                                nlapiLogExecution('DEBUG', 'Exception ', e.message );
                                nlapiLogExecution('DEBUG', 'Exception ', e.stack);
                                nlapiLogExecution('DEBUG', 'Exception ', e.toString());
                            }

                            //add change order search for -30/-15/-7
                            //var subValues_new = subRecValues(searchSubs[k][i]);//https://3293628-sb2.app.netsuite.com/app/common/search/savedsearch.nl?id=80871

                            var isDisty = subValues.networkAdmin !== subValues.customerEmail;
                            settings = bsnRenewalEmailFromTo( period, subtype, subValues.billingAccountCountry );// Reload Settings
                            var tranasactionId = settings.attachInvoice ? subValues.invoiceId : null;
                            if (!isNullorEmpty(subValues.overrideSuspension)) override = true;
                            //nlapiLogExecution('DEBUG', '!( settings.from === 30 && override && subValues.overrideSuspension > subValues.daysAfter )', !( settings.from === 30 && override && subValues.overrideSuspension > subValues.daysAfter ));
                            //if( !( settings.from === 30 && override && parseInt(subValues.overrideSuspension) > subValues.daysAfter ) ) {
                            if (!isNullorEmpty(subValues.customerEmail)) {
                                if( ( isDisty && settings.sendToDisty ) || !isDisty ) {
                                    var fileId = null;
                                    if( subtype == 'bsnee' && period == '0t' ) fileId = nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_attachment')||3792706;
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
                                /*if (!isNullorEmpty(subValues.enduserId) && subValues.enduserId !== subValues.customerId) {
                                    subValues.enduserEmail = nlapiLookupField('customer', subValues.enduserId, 'email');
                                    if (!isNullorEmpty(subValues.enduserEmail)) {
                                        var enduserSent = bsnRecurringEmail(subValues, 'enduser', enduserTemplate, tranasactionId);
                                        if (enduserSent) {
                                            nlapiLogExecution('DEBUG', 'Email sent', 'Email sent to End User: "' + subValues.enduserEmail + '".');
                                        } else {
                                            nlapiLogExecution('DEBUG', 'Email not sent', 'ERROR: Email was not sent to End User: "' + subValues.enduserEmail + '".');
                                        }
                                    } else {
                                        nlapiLogExecution('DEBUG', 'Email not sent', 'End User "' + subValues.enduserName + '" has no Email. Skipping...');
                                    }
                                } else {
                                    nlapiLogExecution('DEBUG', 'Email not sent', 'No End User. Skipping...');
                                }*/
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
