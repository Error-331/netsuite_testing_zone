/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       2 Aug 2021     Eugene Karakovsky
 *
 */
//replaceSalesRep('scheduled');
/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduledBSNSubsProcessing(type) {
    var sub = null;
    try{
        var subID = nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_subid_email');
        var subtype = nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_subtype');
        var period = nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_period');
        var suspendEmail = nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_suspend_email')||'F';

        nlapiLogExecution("DEBUG", "", "================== BSN Subscriptions creation Start =================");
        nlapiLogExecution("DEBUG", "Init data", "subtype: " + subtype + ", period: " + period);
        var today = nlapiDateToString(new Date());
        nlapiLogExecution("DEBUG", "today", today);
        if( !isNullorEmpty( subtype ) && !isNullorEmpty( period ) ) {
            bsnGetMailingList( period, subtype );
        }

        /* Send single Suspension Email by request */
        if( !isNullorEmpty( subID ) && suspendEmail == 'T' ) {
            sub = nlapiLoadRecord('subscription', subID);
            var args = {
                fromId: 84741/* Orders */,
                recipient: sub.getFieldValue('customer'),
                startDate: sub.getFieldValue('startdate'),
                suspendDate: '',
                overrideSuspension: '',
                ccExpDate: '',
                ccNumber: '',
                subscription: subID,
                customerName: '',
                amount: '',
                po: '',
                networkName: sub.getFieldValue('custrecord_sub_network_name'),
                template:  sbBSNSettings.emailTemplates[search( 'Ssp', sbBSNSettings.emailTemplates, 'code' )].customer,
                mailSubject: '',
                mailBody: '',
                cc: null,
                bcc: null,
                files: null,
                records: null,
            };
            sendEmailUsingBrightSignTemplate(args);
        }
    } catch(e) {
        if( !isNullorEmpty( sub ) ){
            //sub.setFieldValue('custrecord_bs_last_error', today);
            //nlapiSubmitRecord( sub );
        }
        nlapiLogExecution('DEBUG', 'Exception ', e.message );
        nlapiLogExecution('DEBUG', 'Exception ', e.stack);
        nlapiLogExecution('DEBUG', 'Exception ', e.toString());
    }
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

function subRecValues( searchRes ){
    var subValues = {//https://3293628-sb2.app.netsuite.com/app/common/search/savedsearch.nl?id=80871
        customerId: searchRes.getValue('entity'),
        customerName: searchRes.getText('entity'),
        customerEmail: searchRes.getValue('email', 'customer'),
        enduserId: searchRes.getValue('custrecord_bsn_sub_end_user', 'subscription'),
        enduserName: searchRes.getText('custrecord_bsn_sub_end_user', 'subscription'),
        enduserEmail: '',
        billingAccount: searchRes.getValue('billingaccount'),
        startDate: searchRes.getValue('startdate', 'subscription'),
        endDate: searchRes.getValue('enddate', 'subscription'),
        terms: parseInt(searchRes.getValue('formulatext')),
        daysAfter: parseInt(searchRes.getValue('formulanumeric'))*(-1),
        plan: searchRes.getValue('subscriptionplan', 'subscription'),
        renewalNumber: searchRes.getValue('renewalnumber', 'subscription'),
        status: searchRes.getValue('status', 'subscription'),
        adminEmail: searchRes.getValue('custrecord_sub_network_admin', 'subscription'),
        networkId: searchRes.getValue('custrecord_sub_network_id', 'subscription'),
        bsnType: searchRes.getValue('custrecord_bsn_type', 'subscription'),
        bsnTypeName: searchRes.getText('custrecord_bsn_type', 'subscription'),
        salesRep: searchRes.getValue('salesrep', 'customer'),
        salesRepName: searchRes.getText('salesrep', 'customer'),
        amount: searchRes.getValue('amount'),
        subscriptionId: searchRes.getValue('subscription'),
        subscription: searchRes.getValue('name', 'subscription'),
        overrideSuspension: searchRes.getValue('custrecord_sub_override_suspension', 'subscription')||0,
        po: searchSubs[i].getValue('custrecord_bs_subscription_po', 'subscription'),
        networkName: searchRes.getValue('custrecord_sub_network_name', 'subscription'),
        networkAdmin: searchRes.getValue('custrecord_sub_network_admin', 'subscription'),
        //ccExpDate: searchSubs[i].getValue('ccexpdate', 'customer')||'',
        //ccNumber: searchSubs[i].getValue('ccnumber', 'customer')||'',
        //ccState: searchSubs[i].getText('ccstate', 'customer')||'',
        ccIdBA: searchRes.getValue('custrecord_payop_ccid', 'headerBillingAccount')||'',
    };

    return subValues;
}

function addFilter( filters, newFilter ){
    var newFilters = [];
    for( var i = 0; i < filters.length; i++ ){
        newFilters.push( filters[i] );
    }
    newFilters.push(newFilter);

    return newFilters;
}

function bsnIsMoreThanNSubs(netId, netType, n){
    var countRes = {};
    var quantity = 0;
    if( !isNullorEmpty( netId ) && !isNullorEmpty( netType ) ){
        if( netType == netTypeCom ){
            countRes = soapNetworkSubscriptionsCount( netId );
        } else {
            countRes = soapNetworkSubscriptionsCountBSNC( netId );
        }

        if( !countRes.error ){
            quantity = countRes.quantity;
            nlapiLogExecution('DEBUG', 'Subs Count', 'Subs Count: ' + countRes.message);
        } else {
            nlapiLogExecution('DEBUG', 'Subs Count', 'ERROR: ' + countRes.message);
        }
    }
    return quantity >= n;
}

function bsnRenewalEmailFromTo( period, subtype, countryCode ){
    var error = false;
    var suspend = false;
    var check = '';
    var isTerms = false;
    var sendToDisty = false;
    var sendToReseller = false;
    var sendToOwner = false;
    var sendToSales = false;
    var attachInvoice = false;
    var from = 0;
    var to = 0;

    var isROW = false;
    if( !isNullorEmpty( countryCode ) && countryCode != 'US' ) isROW = true;

    if( subtype == 'bsn' ) {
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

function bsnRecurringEmail(incoming, recType, template, invoice, attachment){
    var recipient = '';
    var records = {};
    switch( recType ){
        case 'customer':
            recipient = incoming.customerEmail;
            records['customer'] = incoming.customerId;
            break;
        case 'enduser':
            recipient = incoming.networkAdmin;
            //records['customer'] = incoming.enduserId;
            break;
        case 'sales':
            recipient = incoming.salesRep;
            records['employee'] = incoming.salesRep;
            break;
        default: break;
    }

    if( isNullorEmpty( attachment ) ){
        attachment = null;
    } else {
        attachment = [nlapiLoadFile( parseInt( attachment ) )];
    }

    nlapiLogExecution('DEBUG', 'records', JSON.stringify(records));

    var fromId = 84741/* Orders */;

    var suspendDay = 30;
    if( !isNullorEmpty( incoming.overrideSuspension ) ) suspendDay = parseInt(incoming.overrideSuspension);
    nlapiLogExecution('DEBUG', 'suspendDay', suspendDay);
    var suspendDate = nlapiStringToDate(incoming.startDate);
    suspendDate.setDate( suspendDate.getDate() + suspendDay );
    nlapiLogExecution('DEBUG', 'suspendDate', suspendDate);
    var args = {
        fromId: fromId,
        recipient: recipient,
        startDate: incoming.startDate,
        suspendDate: nlapiDateToString( suspendDate ),
        overrideSuspension: parseInt(incoming.overrideSuspension),
        ccExpDate: '',
        ccNumber: incoming.ccNumber,
        subscription: incoming.subscription,
        customerName: incoming.customerName,
        execName: incoming.salesRepName,
        amount: incoming.amount,
        po: incoming.po,
        networkName: incoming.networkName,
        networkAdmin: incoming.networkAdmin,
        daysAfter: incoming.daysAfter,
        template: template,
        terms: incoming.terms,
        daysLeft: incoming.daysLeft,
        mailSubject: '',
        mailBody: '',
        cc: null,
        bcc: null,
        files: isNullorEmpty( invoice ) ? attachment : nlapiPrintRecord('TRANSACTION', invoice, 'PDF', null),
        records: records,
    };
    if( !isNullorEmpty( incoming.ccNumber ) ){
        var regex  = new RegExp(/\((.*?)\)/);
        var expMatch = args.ccNumber.match(regex);
        if( expMatch && expMatch.length ) args.ccExpDate = expMatch[1];
    }

    if( !isNullorEmpty( recType ) && !isNullorEmpty( template ) && !isNullorEmpty( recipient ) ){
        args.mailSubject = 'New BSN.cloud network notification';
        var mailSent = sendEmailUsingBrightSignTemplate(args);
        if( mailSent ) {
            return true;
        }
    }

    return false;
}

function sendEmailByTemplate(from, to, emailSubject, emailBody, cc, bcc, records, files) {
    emailBody = emailBody.replace(/{current_year}/g, new Date().getFullYear());
    nlapiSendEmail( from, to, emailSubject, emailBody, cc, bcc, records, files );
}

function sendEmailUsingBrightSignTemplate(args) {

    if( args.template ) {
        var expiration = sbCCExpirationMessage( args.ccNumber, args.ccExpDate, args.startDate, args.overrideSuspension );
        //var customerId = nlapiGetUser();
        var emailMerger = nlapiCreateEmailMerger(args.template);
        //emailMerger.setEntity('customer', customerId);
        var mergeResult = emailMerger.merge();

        var emailBody = mergeResult.getBody();
        emailBody = emailBody.replace(/{email_body}/g, args.mailBody);
        emailBody = emailBody.replace(/{subscription}/g, args.subscription);
        emailBody = emailBody.replace(/{customerName}/g, args.customerName);
        emailBody = emailBody.replace(/{execName}/g, args.execName);
        emailBody = emailBody.replace(/{amount}/g, '$' + args.amount);
        emailBody = emailBody.replace(/{po}/g, args.po);
        emailBody = emailBody.replace(/{4dig}/g, args.ccNumber);
        emailBody = emailBody.replace(/{renewaldate}/g, args.startDate);
        emailBody = emailBody.replace(/{suspensiondate}/g, args.suspendDate);
        emailBody = emailBody.replace(/{ccexpiration}/g, expiration);
        emailBody = emailBody.replace(/{netname}/g, args.networkName);
        emailBody = emailBody.replace(/{netadmin}/g, args.networkAdmin);
        emailBody = emailBody.replace(/{daysafter}/g, args.daysAfter);
        emailBody = emailBody.replace(/{terms}/g, args.daysAfter);

        var emailSubject = mergeResult.getSubject();
        emailSubject = emailSubject.replace(/{subscription}/g, args.subscription);
        emailSubject = emailSubject.replace(/{netname}/g, args.networkName);
        emailSubject = emailSubject.replace(/{customerName}/g, args.customerName);

        if (!isNullorEmpty(args.recipient)) {
            try {
                sendEmailByTemplate(args.fromId, args.recipient, emailSubject, emailBody, args.cc, args.bcc, args.records, args.files);
            } catch(e) {
                nlapiLogExecution('DEBUG', 'Exception ', e.message );
                nlapiLogExecution('DEBUG', 'Exception ', e.stack);
                nlapiLogExecution('DEBUG', 'Exception ', e.toString());
                return false;
            }

        }

        return true;
    }

    return false;
}

function networkSuspend( networkId, suspend ){
    var networkInfo = soapGetNetworkByIdBSNC( networkId, false );
    if( !networkInfo.IsError ) {
        var updateRes = soapUpdateNetworkBSNC(networkInfo.Id, networkInfo.Name, networkInfo.SubscriptionsActivityPeriod, networkInfo.SubscriptionsRenewalDate, suspend);
        if (updateRes.result) {
            return true;
        }
    }

    return false;
}

function networkEmpty( netId, subId ){
    var prevSubsId = [];
    var prevSubs = [];

    var maxlength = 5;// : 6;
    var subRecordText = '00000';// : '000000';
    var idLength = digits_count(subId);
    subRecordText = subRecordText.substr(0, maxlength - idLength) + subId;

    var filter = "[DeviceSubscription].[Network].[Id] IS " + netId + " AND ([DeviceSubscription].[InvoiceNumber] IS IN ('" + subRecordText + "'))";
    var sort = '[DeviceSubscription].[Device].[Serial] DESC';
    nlapiLogExecution('DEBUG', 'Filter Get Subs', filter);
    prevSubs = soapGetDeviceSubscriptions(filter, sort);

    if( !isNullorEmpty(prevSubs.error) ){
        nlapiLogExecution( 'ERROR', 'Get Subs Error', prevSubs.error )
    } else {
        if (isArray(prevSubs.subscriptions) && prevSubs.subscriptions.length > 0) {
            for (var i = 0; i < prevSubs.subscriptions.length; i++) {
                prevSubsId.push(prevSubs.subscriptions[i].Id);
            }
            nlapiLogExecution('DEBUG', 'prevSubsId.length ', prevSubsId.length);
            nlapiLogExecution('DEBUG', 'prevSubsId ', JSON.stringify(prevSubsId));
        }
    }

    var errors = [];
    //Delete expired subscriptions
    var delResult = false;
    if (!isNullorEmpty(netId)) {
        delResult = soapDeleteDeviceSubscriptions(prevSubsId, subId);
    }
    if( isNullorEmpty( delResult.error ) ){
        nlapiLogExecution('DEBUG', 'Deleted Subs ', delResult.deleted);
        return true;
    } else {
        errors.push( delResult.error );
        nlapiLogExecution('ERROR', 'Deleted Subs ', delResult.error);
    }

    return false;
}

function digits_count(n) {
    var count = 0;
    if (n >= 1) ++count;

    while (n / 10 >= 1) {
        n /= 10;
        ++count;
    }

    return count;
}

function isNullorEmpty(strVal){
    return (strVal == null || strVal == '');
}