/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */

function subscriptionPageInit(type){
    var query = window.location.search;
    var urlParams = new URLSearchParams(query);
    var takeover_res = urlParams.get('custparam_sb_takeover');
    console.log('takeover_res=' + takeover_res)
    if( takeover_res == 1 && 0 ){
        var err_msg = nlapiGetFieldValue('custrecord_bs_last_error');
        console.log('err_msg=' + err_msg)
        if( !isNullorEmpty( err_msg ) ){
            showAlertBox('generateAlertBox', 'Create Change Order Failed', err_msg, NLAlertDialog.ERROR);
        }
    }
}

function bsApplyTimeCredit(){
    var subID = nlapiGetRecordId();
    var sub = nlapiLoadRecord( 'subscription', subID );
    alert(subID);
    var customer = sub.getFieldValue( 'customer' );
    var endUser = sub.getFieldValue( 'custrecord_bsn_sub_end_user' );
    var network =sub.getFieldValue( 'custrecord_sub_network_id' );
    var scriptPreventRenewal = sub.getFieldValue( 'custrecord_bsn_script_suppress_renewal' );
    console.log( '!isNullorEmpty( endUser ) = ' + !isNullorEmpty( endUser ) );
    console.log( 'endUser != customer = ' + ( endUser != customer ) );
    console.log( 'scriptPreventRenewal == "T" = ' + ( scriptPreventRenewal == 'T' ) );
    if( !isNullorEmpty( endUser ) && endUser != customer ){
        if( scriptPreventRenewal == 'T' ){
            alert( 'reseller can be applied' );
        }
    } else {
        if( scriptPreventRenewal == 'T' ){
            alert( 'customer can be applied' );
        }
    }
    /*var amountUSD = tc.getFieldValue( 'custrecord_bs_tc_amount' );
    var amountMON = tc.getFieldValue( 'custrecord_bs_tc_months' );
    var newJE = nlapiCreateRecord( 'journalentry' );
    var today = nlapiDateToString(new Date());
    var endDate = new Date();
    newJE.setFieldValue('subsidiary', 1);
    newJE.setFieldValue('currency', 1); // USD
    newJE.setFieldValue('exchangerate', 1);
    newJE.setFieldValue('trandate', today);
    newJE.setLineItemValue('line', 'account', 1, 127); // Deferred Revenue
    newJE.setLineItemValue('line', 'debit', 1, amountUSD);
    newJE.setLineItemValue('line', 'memo', 1, 'Network ' + network +  ' Credit Memo');
    newJE.setLineItemValue('line', 'entity', 1, customer);

    newJE.setLineItemValue('line', 'account', 2, 915); // 4102 Sales : BSN Subscription Revenue
    newJE.setLineItemValue('line', 'revenuerecognitionrule', 2, 4); //Default Fixed Recurring Fee
    newJE.setLineItemValue('line', 'credit', 2, amountUSD);
    newJE.setLineItemValue('line', 'memo', 2, 'Network ' + network +  ' Credit Memo');
    newJE.setLineItemValue('line', 'entity', 2, customer);
    newJE.setLineItemValue('line', 'custcolbrsg_rr_term_start_date', 2, today);
    newJE.setLineItemValue('line', 'custcol_brsg_rr_term_end_date', 2, '6/28/2021');
    console.log(newJE);
    var je = nlapiSubmitRecord( newJE );
    console.log(je);*/
}

function bsStopRenewal(){
    var subID = nlapiGetRecordId();
    var sub = nlapiLoadRecord( 'subscription', subID );
    console.log( 'subID = ' + subID );
    var customer = sub.getFieldValue( 'customer' );
    var endUser = sub.getFieldValue( 'custrecord_bsn_sub_end_user' );
    var network =sub.getFieldValue( 'custrecord_sub_network_id' );
    var scriptPreventRenewal = sub.getFieldValue( 'custrecord_bsn_script_suppress_renewal' );
    console.log( '!isNullorEmpty( endUser ) = ' + !isNullorEmpty( endUser ) );
    console.log( 'endUser != customer = ' + ( endUser != customer ) );
    console.log( 'scriptPreventRenewal == "T" = ' + ( scriptPreventRenewal == 'T' ) );
    if( !isNullorEmpty( endUser ) && endUser != customer ){
        if( scriptPreventRenewal == 'F' ){
            alert( 'reseller can be applied' );
            sub.setFieldValue( 'custrecord_bsn_script_suppress_renewal', 'T' );
            sub.setFieldValue( 'defaultrenewalmethod', '' ); //CREATE_NEW_SUBSCRIPTION
            sub.setFieldValue( 'autorenewal', 'F' );
            nlapiSubmitRecord( sub );
            return true;
        }
    } else {
        if( scriptPreventRenewal == 'F' ){
            alert( 'customer can be applied' );
        }
    }
}

function bsResetTakeOver(){
    var subID = nlapiGetRecordId();
    var endUser = nlapiGetFieldValue( 'custrecord_bsn_sub_end_user' );
    var sub = nlapiLoadRecord( 'subscription', subID );
    console.log( 'subID = ' + subID );
    console.log( 'endUser = ' + endUser );
    sub.setFieldValue('custrecord_bs_takeover_processed', '');
    sub.setFieldValue('custrecord_bs_last_error', '');
    sub.setFieldValue('custrecord_sb_transitioned_to_co', '');
    sub.setFieldValue('custrecord_sb_transitioned_to_sub', '');
    sub.setFieldValue('defaultrenewalmethod', 'CREATE_NEW_SUBSCRIPTION');
    sub.setFieldValue('autorenewal', 'T');
    sub.setFieldValue('custrecord_bsn_script_suppress_renewal', 'F');
    nlapiSubmitRecord(sub);
    window.location.search += '&takeover_reset=1';
}

function bsTestDate( isToday, customDate, startDate ){
    var today = nlapiDateToString(new Date());

    if( isToday ){
        returnDate = today;
        return returnDate;
    } else {
        if( !isNullorEmpty( customDate ) ){
            var testDate = nlapiStringToDate( customDate );
            var start = nlapiStringToDate( startDate );
            if( +testDate >= +start ){
                returnDate = customDate;
                return returnDate;
            }
        }
        bsnMessage('Error', 'The date can only be on or after ' + startDate, 'error');
        return "";
    }
}

function bsCurrentInvoice( isToday, customDate ){
    var subID = nlapiGetRecordId();
    var sub = nlapiLoadRecord( 'subscription', subID );
    var customer = sub.getFieldValue('customer');
    var billingAcc = sub.getFieldValue('billingaccount');
    var startDate = sub.getFieldValue('startdate');
    var endDate = sub.getFieldValue('enddate');
    var invObj = {
        recordmode: 'dynamic',
        entity: customer,
        billingaccount:billingAcc
    };

    var effectiveDate = bsTestDate( isToday, customDate, startDate );
    console.log(effectiveDate);

    if( isNullorEmpty( effectiveDate ) ) return;

    //if(1)return "End";

    var newInv = nlapiCreateRecord('invoice', invObj);
    /*TODO: Ask what if DueDate is in past?*/
    newInv.setFieldValue('customform', invoiceForm);
    newInv.setFieldValue('recurringbill', 'F');
    newInv.setFieldValue('asofdate', effectiveDate);
    newInv.setFieldValue('whichchargestoadd', 'AS_OF_DATE');
    newInv.setFieldValue('custbody_sb_single_sub_invoice', subID);
    newInv.setFieldValue('duedate', nlapiDateToString(new Date()));
    newInv.setFieldValue('startdate', effectiveDate);
    newInv.setFieldValue('enddate', endDate);

    logInvoiceData( newInv, 'Invoice Before Submit' );
    /*
    var lineItemCount = newInv.getLineItemCount('item');
    for( var i = lineItemCount; i > 0 ; i-- ){
        var itemSubscription = newInv.getLineItemValue('item', 'subscription', i);
        console.log('itemSubscription ' + i + ':' + itemSubscription);
        if( itemSubscription != subID ){
            newInv.removeLineItem('item', i);
            console.log("remove line " + i);
        }
    }
*/
    if( newInv.getLineItemCount('item') == 0 ) {
        var inv = nlapiSubmitRecord(newInv);
        console.log(inv);
        if( 0 ){
            var editInv = nlapiLoadRecord('invoice', inv);
            editInv.setFieldValue('duedate', startDate);
            editInv.setFieldValue('startdate', startDate);
            editInv.setFieldValue('enddate', endDate);
            var savedInv = nlapiSubmitRecord(editInv);
            console.log(savedInv);
        }
    } else {
        console.log("no line items");
    }
}

function bsTerminateSub( isToday, customDate ){
    var subID = nlapiGetRecordId();
    var sub = nlapiLoadRecord( 'subscription', subID );
    var subStatus = sub.getFieldValue( 'billingsubscriptionstatus' );
    if( subStatus == 'ACTIVE' ) {
        var netType = sub.getFieldValue('custrecord_bsn_type');
        var netId = sub.getFieldValue('custrecord_sub_network_id');
        var startDate = sub.getFieldValue('startdate');

        var effectiveDate = bsTestDate( isToday, customDate, startDate );
        console.log(effectiveDate);

        if( isNullorEmpty( effectiveDate ) ) return;
        //if(1)return "End";
        var args = {subId: subID, isCleanup: true, netType: netType, netId: netId, toControl: 'T'};

        var terminateCO = nlapiCreateRecord('subscriptionchangeorder', {'action': 'TERMINATE', 'subscription': subID});
        terminateCO.setFieldValue('effectivedate', effectiveDate);
        terminateCO.setFieldValue('terminateatstartofday', 'T');
        terminateCO.setLineItemValue('subline', 'apply', 1, 'T');
        var newCO = nlapiSubmitRecord(terminateCO);
        console.log("newCO=" + newCO);

        var today = new Date();
        var terminateDate = nlapiStringToDate( effectiveDate );
        if( terminateDate <= today ) {
            bsRecreateSubs(args);
            /*
            if (netType == netTypeCom) {
                bsRecreateSubs(args);
            } else {
                //networkSuspend( netId, true );
            }
            */
        }

        bsnMessage('Result', 'Subscription Terminated!');
        //window.location.reload();
    } else {
        bsnMessage('Result', 'This Subscription cannot be terminated.', 'error');
    }
}

function isNullorEmpty(strVal){
    return (strVal == null || strVal == '');
}

function bsncGetBillingAccountsByCustomer( customerId ){
    var accounts = [];
    var additionalFilters = new Array();
    additionalFilters[0] = new nlobjSearchFilter('customer', null, 'is', customerId);
    var columns = new Array();
    columns[0] = new nlobjSearchColumn( 'name' );
    columns[1] = new nlobjSearchColumn( 'customer' );
    columns[2] = new nlobjSearchColumn( 'customerdefault' );
    columns[3] = new nlobjSearchColumn( 'billingschedule' );
    columns[4] = new nlobjSearchColumn( 'frequency' );
    columns[5] = new nlobjSearchColumn( 'startdate' );
    columns[6] = new nlobjSearchColumn( 'class' );
    columns[7] = new nlobjSearchColumn( 'location' );
    columns[8] = new nlobjSearchColumn( 'department' );
    columns[9] = new nlobjSearchColumn( 'inactive' );
    columns[10] = new nlobjSearchColumn( 'nextbillcycledate' );
    columns[11] = new nlobjSearchColumn( 'subsidiary' );
    columns[12] = new nlobjSearchColumn( 'idnumber' );
    var searchresults = nlapiSearchRecord('billingaccount', null, additionalFilters, columns);
    if( searchresults != null ){
        for( var i = 0; i < searchresults.length; i++ ){
            accounts.push( {
                baId: searchresults[i].getId(),
                baNumber: searchresults[i].getValue( 'idnumber' ),
                baName: searchresults[i].getValue( 'name' ),
                baStartDate: searchresults[i].getValue( 'startdate' ),
                baNextBill: searchresults[i].getValue( 'nextbillcycledate' ),
                baCustomer: searchresults[i].getText( 'customer' ),
                baCustomerId: searchresults[i].getValue( 'customer' ),
                baCustomerDefault: searchresults[i].getValue( 'customerdefault' ),
                baInactive: searchresults[i].getText( 'inactive' ),
                baSchedule: searchresults[i].getValue( 'billingschedule' ),
                baFrequency: searchresults[i].getValue( 'frequency' ),
                baClass: searchresults[i].getValue( 'class' ),
                baLocation: searchresults[i].getValue( 'location' ),
                baDepartment: searchresults[i].getValue( 'department' )
            } );
        }
    } else {
    }

    return accounts;
}

function bsncCustomerSubscriptionExists( customerId, subId ){
    var bsnNetwork = nlapiLookupField( 'subscription', subId, 'custrecord_sub_network_id' );
    var subs = [];
    if( !isNullorEmpty( bsnNetwork ) ) {
        var additionalFilters = new Array();
        additionalFilters[0] = new nlobjSearchFilter('customer', null, 'is', customerId);
        additionalFilters[1] = new nlobjSearchFilter('custrecord_sub_network_id', null, 'is', bsnNetwork);
        var columns = new Array();
        columns[0] = new nlobjSearchColumn('name');
        columns[1] = new nlobjSearchColumn('customer');
        columns[2] = new nlobjSearchColumn('billingaccount');
        columns[3] = new nlobjSearchColumn('status');
        columns[4] = new nlobjSearchColumn('subscriptionplan');
        columns[5] = new nlobjSearchColumn('startdate');
        columns[6] = new nlobjSearchColumn('enddate');
        //columns[7] = new nlobjSearchColumn( 'idnumber' );
        var searchresults = nlapiSearchRecord('subscription', null, additionalFilters, columns);
        if (searchresults != null) {
            for (var i = 0; i < searchresults.length; i++) {
                subs.push({
                    subsId: searchresults[i].getId(),
                    //subsNumber: searchresults[i].getValue('idnumber'),
                    subsName: searchresults[i].getValue('name'),
                    subsStartDate: searchresults[i].getValue('startdate'),
                    subsEndDate: searchresults[i].getValue('enddate'),
                    subsCustomer: searchresults[i].getText('customer'),
                    subsCustomerId: searchresults[i].getValue('customer'),
                    subsBillingAccount: searchresults[i].getValue('billingaccount'),
                    subsStatus: searchresults[i].getText('status'),
                    subsPlan: searchresults[i].getValue('subscriptionplan')
                });
            }
        } else {
        }
    }

    return subs;
}


SBBSN = {};
SBBSN.takeOverSubscription = function () {
    var subId = nlapiGetRecordId();
    //nlapiSubmitField( 'subscription', subId, 'custrecord_bs_last_error', '' );
    var parameters = '&custscript_sb_bsnc_script=customscript_sb_bsnc_subscription_to&custscript_sb_bsnc_takeover=T&custscript_sb_bsnc_subid=' + subId;
    //var netType = nlapiGetFieldValue('custrecord_bsn_type');
    //if( netType == 1 ) parameters += '&custscript_sb_bsnc_nettype=cloud';
    //if( netType == 2 ) parameters += '&custscript_sb_bsnc_nettype=com';
    var a = {'User-Agent-x': 'SuiteScript-Call'};
    try {
        var url = nlapiResolveURL('SUITELET', 'customscript_sb_bsnc_ssrunner_su', 'customdeploy_sb_bsnc_ssrunner_su');
        var response = nlapiRequestURL(url + parameters, null, a);
        var objResponse = JSON.parse(response.getBody());
        console.log(objResponse);
        if (objResponse) {
            if (objResponse.status == 'ERROR') {
                SBBSN.displayError(objResponse.details);
            } else if (objResponse.status == 'QUEUED') {
                SBBSN.displayQueuedInfo(objResponse.details);
            } else if (objResponse.status == 'SUCCESS') {
                var progressBar = new SBBSN.ProgressBar();
                progressBar.start();
            }
        }
    } catch (ex) {
        SBBSN.displayError();
    }
};
SBBSN.displayError = function (errorDetails) {
    var msg = '';
    if (errorDetails) {
        msg = errorDetails;
    } else {
        msg = 'An error was encountered while creating subscription. Please try again later.';
    }
    showAlertBox('generateAlertBox', 'Subscription Take Over Failed', msg, NLAlertDialog.ERROR);
};
SBBSN.displayQueuedInfo = function (details) {
    showAlertBox('generateAlertBox', 'Subscription Take Over Queued', details, NLAlertDialog.INFORMATION);
};
SBBSN.createChangeOrder = function () {
    var subId = nlapiGetRecordId();
    var parameters = '&custparam_sb_bsnc_script=customscript_sb_bsnc_create_change_order&custscript_sb_bsnc_takeover=T&custscript_sb_bsnc_subid=' + subId;
    var a = {'User-Agent-x': 'SuiteScript-Call'};
    if (SBBSN.createCO_blockInstance()) {
        SBBSN.createCO_displayError('Another instance of Change Order Creating script is currently running. Please try again later.');
    } else {
        try {
            var url = nlapiResolveURL('SUITELET', 'customscript_sb_bsnc_ssrunner_su', 'customdeploy_sb_bsnc_ssrunner_su');
            var response = nlapiRequestURL(url + parameters, null, a);
            var objResponse = JSON.parse(response.getBody());
            if (objResponse) {
                if (objResponse.status == 'ERROR') {
                    SBBSN.createCO_displayError(objResponse.details);
                } else if (objResponse.status == 'QUEUED') {
                    SBBSN.createCO_displayQueuedInfo(objResponse.details);
                } else if (objResponse.status == 'SUCCESS') {
                    var progressBar = new SBBSN.ProgressBar();
                    progressBar.createCO_start();
                }
            }
        } catch (ex) {
            SBBSN.createCO_displayError();
        }
    }
};
SBBSN.createCO_blockInstance = function () {
    var result = null, column = [], filter = [], retVal = false;
    try {
        column.push(new nlobjSearchColumn('queue', null, 'group'));
        filter.push(new nlobjSearchFilter('status', null, 'noneof', ['CANCELED', 'COMPLETE', 'FAILED']));
        filter.push(new nlobjSearchFilter('scriptid', 'script', 'is', 'customscript_sb_bsnc_create_change_order'));
        result = nlapiSearchRecord('scheduledscriptinstance', null, filter, column);
        if (result && result.length > 0) {
            retVal = true;
        }
    } catch (e) {
        showAlertBox('generateAlertBox', 'Create Change Order Failed', 'An error was encountered while searching for instances of Create Change Order script. Please try again later.');
        retVal = true;
    }
    return retVal;
};
SBBSN.createCO_displayError = function (errorDetails) {
    var msg = '';
    if (errorDetails) {
        msg = errorDetails;
    } else {
        msg = 'An error was encountered while creating the change order. Please try again later.';
    }
    showAlertBox('generateAlertBox', 'Create Change Order Failed', msg, NLAlertDialog.ERROR);
};
SBBSN.createCO_displayQueuedInfo = function (details) {
    showAlertBox('generateAlertBox', 'Create Change Order Queued', details, NLAlertDialog.INFORMATION);
};
SBBSN.ProgressBar = function () {
    var ctx = nlapiGetContext();
    var runner = new Ext.util.TaskRunner();
    var update = function () {
        var sub = nlapiLoadRecord('subscription', nlapiGetRecordId());
        var t = sub.getFieldValue('custrecord_bs_takeover_processed');
        var er = sub.getFieldValue('custrecord_bs_last_error');
        console.log(ctx.getRemainingUsage());
        console.log("error=" + er);
        if (!t && !er) {
            if (ctx.getRemainingUsage() < 100) {
                var subURL = nlapiResolveURL('RECORD', 'subscription', nlapiGetRecordId());
                runner.stop(updateProgressBarTask);
                Ext.MessageBox.hide();
                window.location = subURL + '&custparam_sb_takeover=1';
            }
        } else {
            if( er ){
                var subURL = nlapiResolveURL('RECORD', 'subscription', nlapiGetRecordId());
                //showAlertBox('generateAlertBox', 'Create Change Order Failed', er, NLAlertDialog.ERROR);
                runner.stop(updateProgressBarTask);
                Ext.MessageBox.hide();
                window.location = subURL + '&custparam_sb_takeover=2';
            } else {
                var subURL = nlapiResolveURL('RECORD', 'subscription', nlapiGetRecordId());
                runner.stop(updateProgressBarTask);
                Ext.MessageBox.hide();
                window.location = subURL + '&custparam_sb_takeover=3';
            }
        }
    };
    var updateProgressBarTask = {run: update, interval: 5000};
    this.start = function () {
        Ext.MessageBox.wait('Please Wait...', 'Creating Subscription');
        runner.start(updateProgressBarTask);
    };
    var createCO_update = function () {
        var t = nlapiLookupField('subscription', nlapiGetRecordId(), 'custrecord_contract_status');
        if (t == 1) {
            if (ctx.getRemainingUsage() < 100) {
                runner.stop(createCO_updateProgressBarTask);
                Ext.MessageBox.hide();
                window.location.search += '&custparam_sb_createco=4';
            }
        } else {
            runner.stop(createCO_updateProgressBarTask);
            Ext.MessageBox.hide();
            window.location.search += '&custparam_sb_createco=4';
        }
    };
    var createCO_updateProgressBarTask = {run: createCO_update, interval: 5000};
    this.createCO_start = function () {
        Ext.MessageBox.wait('Please Wait...', 'Creating Change Order');
        runner.start(createCO_updateProgressBarTask);
    };
};

jQuery( document ).ready(function() {
    var currRecId = nlapiGetRecordId();
    if(currRecId) {
        var subscriptionNow = nlapiLoadRecord('subscription', currRecId);
        if( subscriptionNow ){
            var currentPlan = subscriptionNow.getFieldValue("subscriptionplan");
            //var currentPlanName = subscriptionNow.getFieldText("subscriptionplan");
            var renewalPlan = subscriptionNow.getFieldValue("defaultrenewalplan");
            //alert(renewalPlan);
            //var renewalPlanName = subscriptionNow.getFieldText("defaultrenewalplan");

            if (!isNullorEmpty(currentPlan) && !isNullorEmpty(renewalPlan) && currentPlan != renewalPlan) {
                showAlertBox('alert_renewal', 'Subscription type change', "This Subscription will renew as a different Subscription Type.<br>"/* + currentPlanName + " -> " + renewalPlanName*/, NLAlertDialog.TYPE_MEDIUM_PRIORITY);
            }
        }
    }
});

function bsnGetPendingSubscriptionsList( period ){
    console.log(period);
    var customerTemplate = bsnGetEmailTemplateByCode(period, 'customer');
    var enduserTemplate = bsnGetEmailTemplateByCode(period, 'enduser');
    var salesTemplate = bsnGetEmailTemplateByCode(period, 'sales');
    var pendingSearch = bsnGetEmailTemplateByCode(period, 'searchId');

    var settings = bsnRenewalEmailFromTo( period );
    var isTerms = settings.isTerms;
    var sendToSales = settings.sendToSales;
    console.log(pendingSearch);
    console.log('isTerms:'+isTerms);
    console.log('sendToSales:'+sendToSales);
    if( !isNullorEmpty( pendingSearch ) ) {
        var searchSubs = nlapiSearchRecord('subscription', pendingSearch);
        console.log(searchSubs);
        if( searchSubs ){
            for( var i = 0; i < searchSubs.length; i++ ){
                var subValues = {
                    customerId: searchSubs[i].getValue('customer'),
                    customerName: searchSubs[i].getText('customer'),
                    customerEmail: searchSubs[i].getValue('email', 'customer'),
                    enduserId: searchSubs[i].getValue('custrecord_bsn_sub_end_user'),
                    enduserName: searchSubs[i].getText('custrecord_bsn_sub_end_user'),
                    enduserEmail: searchSubs[i].getValue('email', 'custrecord_bsn_sub_end_user'),
                    billingAccount: searchSubs[i].getValue('billingaccount'),
                    startDate: searchSubs[i].getValue('startdate'),
                    endDate: searchSubs[i].getValue('enddate'),
                    daysAfter: searchSubs[i].getValue('formulanumeric'),
                    plan: searchSubs[i].getValue('subscriptionplan'),
                    renewalNumber: searchSubs[i].getValue('renewalnumber'),
                    status: searchSubs[i].getValue('status'),
                    networkId: searchSubs[i].getValue('custrecord_sub_network_id'),
                    bsnType: searchSubs[i].getValue('custrecord_bsn_type'),
                    bsnTypeName: searchSubs[i].getText('custrecord_bsn_type'),
                    salesRep: searchSubs[i].getValue('salesrep', 'customer'),
                    salesRepName: searchSubs[i].getText('salesrep', 'customer'),
                };
                console.log( subValues );
                if( !isNullorEmpty(subValues.customerEmail) ) {
                    var emailSent = bsnRecurringEmail(subValues, 'customer', customerTemplate);
                    if( emailSent ) {
                        console.log('Email sent to Customer: "' + subValues.customerEmail + '".');
                    } else {
                        console.log('ERROR: Email was not sent to Customer: "' + subValues.customerEmail + '".');
                    }
                    if( !isNullorEmpty( subValues.enduserId ) && subValues.enduserId !== subValues.customerId ) {
                        if (!isNullorEmpty(subValues.enduserEmail)) {
                            var enduserSent = bsnRecurringEmail(subValues,  enduserTemplate);
                            if (enduserSent) {
                                console.log('Email sent to End User: "' + subValues.enduserEmail + '".');
                            } else {
                                console.log('ERROR: Email was not sent to End User: "' + subValues.enduserEmail + '".');
                            }
                        } else {
                            console.log('End User "' + subValues.enduserName + '" has no Email. Skipping...');
                        }
                    } else {
                        console.log('No End User. Skipping...');
                    }
                    if( sendToSales && bsnIsMoreThanNSubs(subValues.networkId, subValues.bsnType, 25) ) {
                        var salesSent = bsnRecurringSalesEmail(subValues, salesTemplate);
                        if( salesSent ) {
                            console.log('Sales Email sent to SalesRep: "' + subValues.salesRepName + '".');
                        } else {
                            console.log('ERROR: Sales Email was not sent to SalesRep: "' + subValues.salesRepName + '".');
                        }
                    }
                } else {
                    console.log('Customer "' + subValues.customerName + '" has no Email. Skipping...');
                }
            }
        }
    }
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
        } else {
            console.log('ERROR: ' + countRes.message);
        }
    }
    return quantity >= n;
}

function formSendEmailsButtonSubmit( args, rectype, template ){
    //https://3293628-sb2.app.netsuite.com/app/site/hosting/scriptlet.nl?script=927&deploy=1&rectype=customer&template=492&recipient=test@test.com&start=7/27/2021&bs_network=MyNet&amount=99&subscription=A1234&po=PO-123&customername=Michael%20Levine&4dig=3546
    var parameters = '&rectype=' + rectype + '&template=' + template + '&recipient=' + args.customerEmail + '&start=' + args.startDate + '&bs_network=' + args.networkId + '&amount=' + args.amount + '&subscription=' + args.subscription + '&po=' + args.po + '&customername=' + args.customerName + '&4dig=' + args.fourdig + '';
    //var parameters = '&custscript_sb_bsnc_script=bsnc_ss_renewal_emails&custscript_sb_bsnc_subtype=' + args.subtype + '&custscript_sb_bsnc_period=' + args.period;
    var a = {'User-Agent-x': 'SuiteScript-Call'};
    try {
        var url = nlapiResolveURL('SUITELET', 'customscript_sb_sl_send_renewal_email', 'customdeploy_sb_sl_send_renewal_email');
        console.log(url + parameters);
        var response = nlapiRequestURL(url + parameters, null, a);
        console.log(response.getBody());
        var objResponse = JSON.parse(response.getBody());
        console.log(objResponse);
        bsnMessage("Result", objResponse.status, 'info');
    } catch (ex) {
        bsnMessage("ERROR", ex.message, 'error');
    }
}

function bsnRecurringEmail(subValues, rectype, template){
    try {
        //formSendEmailsButtonSubmit( subValues, rectype, template );
        //nlapiSendEmail(69739/* Sales */, subValues.customerEmail, 'Email', template, null, null, {entity: subValues.customerId}, null, true);
        return true;
    } catch(e){
        console.log(e.message);
        console.log(e.stack);
    }
    return false;
}

function bsnRecurringSalesEmail(subValues, template){
    try {
        //nlapiSendEmail(69739/* Sales */, subValues.salesRep, 'Sales Email', template, null, null, {entity: subValues.salesRep}, null, true);
        return true;
    } catch(e){
        console.log(e.message);
        console.log(e.stack);
    }
    return false;
}

function bsnGetMailingList( period, subType, hascc ){
    var settings = bsnRenewalEmailFromTo( period, subType );

    if( settings.error ){
        console.log( 'Wrong data. Stopping.' );
        return;
    }

    var checkCC = hascc || false;
    var isTerms = settings.isTerms;
    var sendToSales = settings.sendToSales;

    var i, search, filters, columns;

    console.log(settings);

    //if( isTerms ){
        search = nlapiLoadSearch( 'charge', 'customsearch_sb_renewal_charge_uni' );
        /*
    } else {
        search = nlapiLoadSearch( 'charge', 'customsearch_sb_pending_wo_invoice' );
    }
    */
    filters = search.getFilters();
    columns = search.getColumns();
/*
    if( !isTerms && checkCC ){
        filters.push( new nlobjSearchFilter('ccdefault', 'customer', 'is', 'T') );

        columns.push( new nlobjSearchColumn( 'ccexpdate', 'customer' ) );
        columns.push( new nlobjSearchColumn( 'ccnumber', 'customer' ) );
        columns.push( new nlobjSearchColumn( 'ccstate', 'customer' ) );
    }
*/
    if( subType == 'bsn' ){
        filters.push( new nlobjSearchFilter( "billingitem", null, 'anyof', [sbBSNSettings.bsn1yrItemNum, sbBSNSettings.bsnc1yrItemNum] ) );
    } else if( subType == 'bsnee' ){
        filters.push( new nlobjSearchFilter( "billingitem", null, 'anyof', [sbBSNSettings.bsnee1yrItemNum] ) );
    }

    if( settings.to >= 0 ){
        filters.push( new nlobjSearchFilter( 'status', 'subscription', 'anyof', "ACTIVE" ) );
        filters.push( new nlobjSearchFilter( 'status', 'invoice', 'anyof', "CustInvc:A" ) );
    } else {
        filters.push( new nlobjSearchFilter( 'status', 'subscription', 'anyof', "PENDING ACTIVATION" ) );
    }

    var timeFilter = new nlobjSearchFilter( 'formulanumeric', null, 'between', settings.from, settings.to );
    timeFilter.setFormula( '{now}-{subscription.startdate}' );
    filters.push( timeFilter );

    if( !isNullorEmpty( settings.check ) ) filters.push( new nlobjSearchFilter( settings.check, 'subscription', 'is', 'F' ) );
    if( settings.uncheck && settings.uncheck.length ){
        for( i = 0; i < settings.uncheck.length; i++ ) {
            filters.push(new nlobjSearchFilter(settings.uncheck[i], 'subscription', 'is', 'F'));
        }
    }

    var searchSubs = [];
    if( isTerms ) {
        var filters0 = addFilter( filters, new nlobjSearchFilter('terms', 'customer', 'noneOf', ['@NONE@', '13']) );
        filters0 = addFilter( filters0, new nlobjSearchFilter('custrecord_payop_ccid', 'billingaccount', 'isEmpty') );
        console.log(filters0);
        searchSubs.push(nlapiSearchRecord('charge', null, filters0, columns));
    } else {
        //first search not Terms
        var filters1 = addFilter( filters, new nlobjSearchFilter('terms', 'customer', 'anyOf', ['@NONE@', '13']) );
        console.log(filters1);
        searchSubs.push(nlapiSearchRecord('charge', null, filters1, columns));
        //add second search Terms, but Credit Card
        var filters2 = addFilter( filters, new nlobjSearchFilter('terms', 'customer', 'noneOf', ['@NONE@', '13']) );
        filters2 = addFilter( filters2, new nlobjSearchFilter('custrecord_payop_ccid', 'billingaccount', 'isnotempty') );
        console.log(filters2);
        searchSubs.push(nlapiSearchRecord('charge', null, filters2, columns));
    }

    console.log(searchSubs);


    if( searchSubs.length ) {
        for( var k = 0; k < searchSubs.length; k++ ) {
            if (searchSubs[k]) {
                var customerTemplate = bsnGetEmailTemplateByCode(period, 'customer');
                var enduserTemplate = bsnGetEmailTemplateByCode(period, 'enduser');
                var salesTemplate = bsnGetEmailTemplateByCode(period, 'sales');
                var pendingSearch = bsnGetEmailTemplateByCode(period, 'searchId');

                for (i = 0; i < searchSubs[k].length; i++) {
                    var subValues = {
                        customerId: searchSubs[k][i].getValue('billto'),
                        customerName: searchSubs[k][i].getText('billto'),
                        customerEmail: searchSubs[k][i].getValue('email', 'customer'),
                        enduserId: searchSubs[k][i].getValue('custrecord_bsn_sub_end_user', 'subscription'),
                        enduserName: searchSubs[k][i].getText('custrecord_bsn_sub_end_user', 'subscription'),
                        enduserEmail: '',
                        billingAccount: searchSubs[k][i].getValue('billingaccount'),
                        billingAccountCC: searchSubs[k][i].getValue('custrecord_payop_ccid', 'billingaccount'),
                        startDate: searchSubs[k][i].getValue('startdate', 'subscription'),
                        endDate: searchSubs[k][i].getValue('enddate', 'subscription'),
                        daysAfter: searchSubs[k][i].getValue('formulanumeric'),
                        plan: searchSubs[k][i].getValue('subscriptionplan', 'subscription'),
                        renewalNumber: searchSubs[k][i].getValue('renewalnumber', 'subscription'),
                        status: searchSubs[k][i].getValue('status', 'subscription'),
                        networkId: searchSubs[k][i].getValue('custrecord_sub_network_id', 'subscription'),
                        bsnType: searchSubs[k][i].getValue('custrecord_bsn_type', 'subscription'),
                        bsnTypeName: searchSubs[k][i].getText('custrecord_bsn_type', 'subscription'),
                        salesRep: searchSubs[k][i].getValue('salesrep', 'customer'),
                        salesRepName: searchSubs[k][i].getText('salesrep', 'customer'),
                        amount: searchSubs[k][i].getValue('amount'),
                        subscriptionId: searchSubs[k][i].getValue('subscription'),
                        subscription: searchSubs[k][i].getValue('name', 'subscription'),
                        overrideSuspension: searchSubs[k][i].getValue('custrecord_sub_override_suspension', 'subscription'),
                        po: searchSubs[k][i].getValue('custrecord_bs_subscription_po', 'subscription'),
                        networkName: searchSubs[k][i].getValue('custrecord_sub_network_name', 'subscription'),
                        /*
                        ccExpDate: searchSubs[k][i].getValue('ccexpdate', 'customer'),
                        ccNumber: searchSubs[k][i].getValue('ccnumber', 'customer'),
                        ccState: searchSubs[k][i].getText('ccstate', 'customer'),
                         */
                    };
                    console.log(subValues.billingAccountCC);
                    if( !isNullorEmpty( subValues.billingAccountCC ) ){
                        var custRec = nlapiLoadRecord('customer', subValues.customerId);
                        console.log(custRec);
                        if( custRec ){
                            var lineCount = custRec.getLineItemCount('paymentinstruments');
                            console.log(lineCount);
                            for( var n = 1; n <= lineCount; n++ ){
                                var ccID = custRec.getLineItemValue( 'paymentinstruments','id', n );
                                var ccMask = custRec.getLineItemValue( 'paymentinstruments','mask', n );
                                console.log(ccID);
                                if( ccID === subValues.billingAccountCC ){
                                    subValues.billingAccountCC = ccMask;
                                    console.log(ccMask);
                                    break;
                                }
                            }
                        }
                    }
                    console.log('https://3293628-sb2.app.netsuite.com/app/accounting/subscription/subscription.nl?id=' + subValues.subscriptionId);
                    //console.log(subValues);
                    //console.log(JSON.stringify(subValues));
                    if (!isNullorEmpty(subValues.customerEmail)) {
                        var emailSent = bsnRecurringEmail(subValues, 'customer', customerTemplate);
                        if (emailSent) {
                            console.log('Email sent to Customer: "' + subValues.customerEmail + '".');
                        } else {
                            console.log('ERROR: Email was not sent to Customer: "' + subValues.customerEmail + '".');
                        }
                        if (!isNullorEmpty(subValues.enduserId) && subValues.enduserId !== subValues.customerId) {
                            subValues.enduserEmail = nlapiLookupField('customer', subValues.enduserId, 'email');
                            if (!isNullorEmpty(subValues.enduserEmail)) {
                                var enduserSent = bsnRecurringEmail(subValues, 'enduser', enduserTemplate);
                                if (enduserSent) {
                                    console.log('Email sent to End User: "' + subValues.enduserEmail + '".');
                                } else {
                                    console.log('ERROR: Email was not sent to End User: "' + subValues.enduserEmail + '".');
                                }
                            } else {
                                console.log('End User "' + subValues.enduserName + '" has no Email. Skipping...');
                            }
                        } else {
                            console.log('No End User. Skipping...');
                        }
                        if (sendToSales && bsnIsMoreThanNSubs(subValues.networkId, subValues.bsnType, 25)) {
                            var salesSent = bsnRecurringEmail(subValues, 'sales', salesTemplate);
                            if (salesSent) {
                                console.log('Sales Email sent to SalesRep: "' + subValues.salesRepName + '".');
                            } else {
                                console.log('ERROR: Sales Email was not sent to SalesRep: "' + subValues.salesRepName + '".');
                            }
                        } else {
                            console.log('Less than 25 Subs or not Terms. Skipping...');
                        }
                    } else {
                        console.log('Customer "' + subValues.customerName + '" has no Email. Skipping...');
                    }
                }
            }
        }
    }
}

function bsnRenewalEmailFromTo( period, subtype ){
    var error = false;
    var suspend = false;
    var check = '';
    var isTerms = false;
    var sendToSales = false;
    var from = 0;
    var to = 0;
    if( subtype == 'bsn' ) {
        switch (period) {
            case '-30t':
            case '-30p':
            case '-30a':
                check = 'custrecord_bs_sub_30day_email';
                from = -30;
                to = -15.01;
                break;
            case '-15t':
            case '-15p':
            case '-15a':
                check = 'custrecord_bs_sub_15day_email';
                from = -15;
                to = -7.01;
                break;
            case '-7t':
            case '-7p':
            case '-7a':
                check = 'custrecord_bs_sub_7day_email';
                from = -7;
                to = -0.01;
                break;
            case '0t':
            case '0p':
            case '0a':
                check = 'custrecord_bs_sub_0day_email';
                from = 0;
                to = 6.99;
                break;
            case '7t':
            case '7p':
            case '7a':
                check = 'custrecord_bs_sub_7day_past_email';
                from = 7;
                to = 29.99;
                break;
            case '30t':
            //case '30p':
            case '30a':
                check = 'custrecord_bs_sub_30day_past_email';
                from = 30;
                to = 450;
                suspend = true;
                break;
            default:
                error = true;
                break;
        }

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

    return { from: from, to: to, isTerms: isTerms, sendToSales: sendToSales, check: check, suspend: suspend, error: error };
}

function removeBSNSubscriptions( args ){
    var invArray = args.invoices || [];
    invArray = fixInvNumbers(invArray, args.netType);
    var invoices = invArray.join("','");
    args.netId = args.netId || '';
    if( invArray.length && !isNullorEmpty( args.netId ) && !isNullorEmpty( args.netType ) ) {
        var prevSubsId = [];
        var filter = "[DeviceSubscription].[Network].[Id] IS " + args.netId + " AND ([DeviceSubscription].[InvoiceNumber] IS IN ('" + invoices + "'))";
        var sort = '[DeviceSubscription].[Device].[Serial] DESC';
        nlapiLogExecution('DEBUG', 'Filter Get Device', filter);
        console.log(filter);

        var prevSubs ={ error: 'Unknown Network Type' };
        if( args.netType == netTypeCom ) prevSubs = soapGetDeviceSubscriptions(filter, sort);
        if( args.netType == netTypeCloud ) prevSubs = soapGetDeviceSubscriptionsBSNC(filter, sort);
        console.log(prevSubs);

        if (!isNullorEmpty(prevSubs.error)) {
            nlapiLogExecution('ERROR', 'Get Subs for Deletion', prevSubs.error)
            console.log(prevSubs.error);
        } else {
            if (isArray(prevSubs.subscriptions) && prevSubs.subscriptions.length > 0) {
                for (var i = 0; i < prevSubs.subscriptions.length; i++) {
                    prevSubsId.push(prevSubs.subscriptions[i].Id);
                }
                nlapiLogExecution('DEBUG', 'prevSubsId.length ', prevSubsId.length);
                nlapiLogExecution('DEBUG', 'prevSubsId ', JSON.stringify(prevSubsId));
                console.log('prevSubsId.length = ' + prevSubsId.length);
                console.log(prevSubsId);
            }
        }

        var errors = [];
        //Delete expired subscriptions
        var delResult = {error: 'Deletion Error.'};
        if (!isNullorEmpty(invoices)) {
            delResult = soapDeleteDeviceSubscriptions(prevSubsId, invoices);
        }
        if (isNullorEmpty(delResult.error)) {
            nlapiLogExecution('DEBUG', 'Deleted Subs ', delResult.deleted);
            console.log('Deleted Subs = ' + delResult.deleted);
        } else {
            errors.push(delResult.error);
            nlapiLogExecution('ERROR', 'Deleted Subs ', delResult.error);
            console.log('Deleted Subs = ' + delResult.error);
        }
    } else {
        if( !invoices.length ) {
            nlapiLogExecution('DEBUG', 'Remove Subs', 'No Invoice Numbers to use.');
            console.log('No Invoice Numbers to use.');
        }
        if( isNullorEmpty( args.netId ) ) {
            nlapiLogExecution('DEBUG', 'Remove Subs', 'No Network ID.');
            console.log('No Network ID.');
        }
    }
}

function fixInvNumbers(invoices, netType){
    var fixed = [];

    if( invoices.length ) {
        var maxlength = 5;
        var subRecordText = '00000';
        if (netType == netTypeCloud) {
            maxlength = 6;
            subRecordText = '000000';
        }

        if (netType != netTypeCom && maxlength == 5) {
            nlapiLogExecution('ERROR', 'Fix Invoice IDs', 'Wrong Network Type: ' + netType);
            console.log( 'Wrong Network Type: ' + netType );
        } else {
            for (var i = 0; i < invoices.length; i++) {
                var idLength = digits_count(invoices[i]);
                fixed[i] = subRecordText.substr(0, maxlength - idLength) + invoices[i];
            }
        }
    } else {
        nlapiLogExecution('ERROR', 'Fix Invoice IDs', 'No Invoices.');
        console.log( 'No Invoices.' );
    }
    nlapiLogExecution('DEBUG', 'Fixed Invoices', JSON.stringify(fixed));
    console.log( fixed );

    return fixed;
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