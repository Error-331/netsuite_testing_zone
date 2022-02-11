/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       26 Aug 2020     Eugene Karakovsky
 *
 */
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord salesorder
 *
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function subscriptionBeforeLoad(type, form, request){
    var context = nlapiGetContext();
    if (context.getExecutionContext() != 'webstore' && ( type == 'view' || type == 'edit' ) ) {
        var subId = nlapiGetRecordId();
        var subRevision = nlapiGetFieldValue('subscriptionrevision');
        var today = nlapiDateToString(new Date());
        var startDate = nlapiGetFieldValue('startdate');
        var timeCredit = subscriptionActiveTimeCredit(subId, subRevision);
        nlapiLogExecution('DEBUG', 'timeCredit', JSON.stringify(timeCredit));
        nlapiSetFieldValue('custrecord_bsn_time_credit', timeCredit.months);

        /* Apply Time Credit */
        form.setScript('customscript_sb_bsnc_cs_subscription');
        //form.addButton('custpage_bs_stop_renewal', 'Stop Renewal', "bsStopRenewal();");
        if( !isNullorEmpty( nlapiGetFieldValue( 'custrecord_bsn_sub_end_user' ) ) && nlapiGetFieldValue('customer') != nlapiGetFieldValue( 'custrecord_bsn_sub_end_user' ) ) {
            if( isNullorEmpty( nlapiGetFieldValue( 'custrecord_bs_takeover_processed' ) ) ){
                form.addButton('custpage_bs_takeover', 'Take Over', "SBBSN.takeOverSubscription();");
            } else {
                form.addButton('custpage_bs_reset_takeover', 'Reset Take Over', "bsResetTakeOver();");
            }
        }
        form.addButton('custpage_bs_recreate_subs', 'Re-create BSN Subs', "bsRecreateSubs();");
        //form.addButton('custpage_bs_update_network', 'Update Network', "bsUpdateNetwork();");
        //form.addButton('custpage_bs_current_invoice', 'Current Invoice', "bsCurrentInvoice();");
        form.addButton('custpage_bs_current_invoice', 'Current Invoice',
            "Ext.MessageBox.show({" +
            "                title: 'Generate Invoice'," +
            "                msg: 'Do you want to use Custom Effective Date?'," +
            "                width: 320," +
            "                modal: true," +
            "                buttons: {" +
            "                       yes: 'Custom Date'," +
            "                       no: '" + today + "'," +
            "                       cancel: 'Cancel'" +
            "                }," +
            "                multiline: 30," +
            "                value: '" + startDate + "'," +
            "                fn: function (btn, text) {" +
            "                    if (btn == 'yes') {" +
            "                       var effDate = bsTestDate( false, text, '" + startDate + "' );" +
            "                       if( isNullorEmpty( effDate ) ) return;" +
            "                       scheduleInvoiceCreation({subId: " + subId + ", effDate: effDate, isAny: 'T', isSingle: 'T'});" +
            //"                       bsCurrentInvoice(false, text);" +
            "                    }" +
            "                    if (btn == 'no') {" +
            "                       var effDate = bsTestDate( false, text, '" + startDate + "' );" +
            "                       if( isNullorEmpty( effDate ) ) return;" +
            "                       scheduleInvoiceCreation({subId: " + subId + ", effDate: '" + today + "', isAny: 'T', isSingle: 'T'});" +
            //"                       bsCurrentInvoice(true);" +
            "                    }" +
            "                }" +
            "            });");


        var subStatus = nlapiGetFieldValue( 'billingsubscriptionstatus' );
        if( subStatus == 'ACTIVE' ) {
            form.addButton('custpage_bs_terminate_subscription', 'Terminate Now',
                "Ext.MessageBox.show({" +
                "                title: 'Terminate Subscription'," +
                "                msg: 'Choose your Termination Date'," +
                "                width: 320," +
                "                modal: true," +
                "                buttons: {" +
                "                       yes: 'Custom Date'," +
                "                       no: '" + today + "'," +
                "                       cancel: 'Cancel'" +
                "                }," +
                "                multiline: 30," +
                "                value: '" + nlapiGetFieldValue('startdate') + "'," +
                "                fn: function (btn, text) {" +
                "                    if (btn == 'yes') {" +
                "                       bsTerminateSub(false, text);" +
                "                    }" +
                "                    if (btn == 'no') {" +
                "                       bsTerminateSub(true);" +
                "                    }" +
                "                }" +
                "            });");
        }

        if( subStatus == 'ACTIVE' || subStatus == 'PENDING_ACTIVATION' ) {
            var custEmail = nlapiLookupField( 'customer', nlapiGetFieldValue('customer'), 'email' );
            if ( isNullorEmpty(custEmail) ) {
                var message_field_email = form.addField('custpage_errscriptfieldemail', 'inlinehtml', 'Email Message Script');
                message_field_email.setDefaultValue('<script type="text/javascript">' +
                    'hideAlertBox("generateAlertBoxEmail");' +
                    'showAlertBox("generateAlertBoxEmail", "Customer has no Email", "This Customer has no Email address! This will prevent system from communicating with Customer.", NLAlertDialog.WARNING);' +
                    '</script>');
            }
        }

        var netType = nlapiGetFieldValue( 'custrecord_bsn_type' ) || netTypeCloud;
        var netId = nlapiGetFieldValue('custrecord_sub_network_id');
        if( !isNullorEmpty( netId ) ){
            var network = {};
            if( netType == netTypeCom )
                network = soapGetNetworkById( netId );
            else
                network = soapGetNetworkByIdBSNC( netId );
            if( !network.IsError ){
                var pageUrl = nlapiResolveURL('SUITELET', 'customscript_sb_bsnc_create_network', 'customdeploy_sb_bsnc_create_network');
                nlapiSetFieldValue('custrecord_sb_network_link', '<a href="' + pageUrl + '&bsn_email=' + network.Name + '" target="_blank">' + network.Name + '</a>');
                //nlapiSetFieldValue('custrecord_sub_network_name', network.Name);
            }
        }

        /** ERROR **/
        if( !isNullorEmpty(request) ) {
            var takeover_res = request.getParameter('custparam_sb_takeover');
            if (takeover_res == 1) {
                var message_field = form.addField('custpage_errscriptfield', 'inlinehtml', 'Message Script');
                message_field.setDefaultValue('<script type="text/javascript">' +
                    'hideAlertBox("generateAlertBox");' +
                    'showAlertBox("generateAlertBox", "Create Subscription Queued", "Take Over Subscription creation has been queued. Check back at a later time.", NLAlertDialog.INFO);' +
                    '</script>');
            }
            if (takeover_res == 2) {
                var err = nlapiGetFieldValue('custrecord_bs_last_error');
                if( !isNullorEmpty(err) ) {
                    var message_field = form.addField('custpage_errscriptfield', 'inlinehtml', 'Message Script');
                    message_field.setDefaultValue('<script type="text/javascript">' +
                        'hideAlertBox("generateAlertBox");' +
                        'showAlertBox("generateAlertBox", "Create Subscription Failed", "' + err + '", NLAlertDialog.ERROR);' +
                        '</script>');
                }
            }
            if (takeover_res == 3) {
                var newSub = nlapiGetFieldValue('custrecord_sb_transitioned_to_sub');
                if( !isNullorEmpty(newSub) ) {
                    var subURL = nlapiResolveURL('RECORD', 'subscription', newSub);
                    var message_field = form.addField('custpage_errscriptfield', 'inlinehtml', 'Message Script');
                    message_field.setDefaultValue('<script type="text/javascript">' +
                        'hideAlertBox("generateAlertBox");' +
                        'showAlertBox("generateAlertBox", "Subscription Take Over Success", "BSN Subscriptions were successfully transferred to <a href=\'' + subURL + '\' target=\'_blank\'>New Subscription</a>", NLAlertDialog.CONFIRMATION);' +
                        '</script>');
                }
            }
        }

        //nlapiSetFieldValue('custrecord_bs_last_error', '');
        //if( nlapiGetFieldValue('custrecord_bs_last_error') != '' ) nlapiSubmitField( 'subscription', subId, 'custrecord_bs_last_error', '' );

        //Styling the Renewal Checkboxes
        /*
        var header1 = form.addField('custpage_sb_sub_emails_sent_header1', 'inlinehtml', 'emails_sent_header1', null, 'renewals');
        header1.setFieldValue('<div class="uir-field-wrapper" data-field-type="select"><span id="frequency_lbl_uir_label" class="smallgraytextnolink uir-label "><span id="frequency_lbl" class="smallgraytextnolink" style="font-size: 12pt; text-transform: uppercase;">\n' +
            '\n' +
            'Customer Emails\n' +
            '</span></span>' +
            '</div>');
         */
    }

    nlapiLogExecution('DEBUG', 'BeforeLoad', context.getExecutionContext());
    if( type == 'create' && context.getExecutionContext() == 'csvimport' ){
        nlapiLogExecution('DEBUG', 'BeforeLoadBilling', nlapiGetFieldValue('billingaccount'));
        nlapiSetFieldValue('billingaccount', '');
    }
    //nlapiLogExecution('DEBUG', 'creds', JSON.stringify(getCredsBSNC()))
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function subscriptionBeforeSubmit(type){
    nlapiLogExecution( 'DEBUG', 'type', type );
    /************  Import code  ************/
    var isImport = nlapiGetFieldValue('custrecord_bs_is_import') == 'T';
    if( type == 'create' && isImport ){
        var customer = nlapiGetFieldValue( 'customer' );
        nlapiLogExecution('DEBUG', 'customer', customer);
        var priceBook = nlapiGetFieldValue( 'pricebook' );
        var subscriptionPlan = nlapiGetFieldValue( 'subscriptionplan' );
        var subStartDate = nlapiGetFieldValue('startdate');
        nlapiLogExecution('DEBUG', 'subStartDate', subStartDate);
        var billingAccount = nlapiGetFieldValue('billingaccount');
        nlapiLogExecution('DEBUG', 'billingAccount', billingAccount);

        nlapiSelectLineItem('priceinterval', 1);
        var backupQuantity = nlapiGetCurrentLineItemValue('priceinterval', 'quantity');

        if( isNullorEmpty( billingAccount ) ){
            nlapiLogExecution('DEBUG', 'BillingAccount', 'No Billing Account');

            var newBA = bsnCreateBillingAccount( customer, '1/1/2021' );
            nlapiLogExecution('DEBUG', 'new Billing Account', newBA);
            nlapiSetFieldValue('billingaccount', newBA);

            nlapiSetFieldValue( 'subscriptionplan', subscriptionPlan );
            nlapiSetFieldValue( 'pricebook', priceBook );

            nlapiSelectLineItem('priceinterval', 1);
            nlapiSetCurrentLineItemValue('priceinterval', 'quantity', backupQuantity);
            nlapiCommitLineItem('priceinterval');
        } else {
            nlapiLogExecution('DEBUG', 'BillingAccount ID', billingAccount);
            //var baRecord = nlapiLoadRecord('billingaccount', billingAccount);
            /*
            if( isBillingAccountEligible( billingAccount, subStartDate ) ){
                nlapiLogExecution('DEBUG', 'BillingAccount Eligible', 'Eligible');
            } else {
                nlapiLogExecution('DEBUG', 'BillingAccount Eligible', 'BA Date Not Eligible');
             */
            var baStartDate = nlapiLookupField('billingaccount', billingAccount, 'startdate');
            if( baStartDate != '1/1/2021' ) {
                var newBA = bsnCreateBillingAccount(customer, "1/1/2021");
                nlapiLogExecution('DEBUG', 'new Billing Account', newBA);
                nlapiSetFieldValue('billingaccount', newBA);

                nlapiSetFieldValue('subscriptionplan', subscriptionPlan);
                nlapiSetFieldValue('pricebook', priceBook);

                nlapiSelectLineItem('priceinterval', 1);
                nlapiSetCurrentLineItemValue('priceinterval', 'quantity', backupQuantity);
                nlapiCommitLineItem('priceinterval');
            }
            //}
        }
    }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function subscriptionAfterSubmit(type){
    nlapiLogExecution( 'DEBUG', 'type', type );
    /************  Takeover code  ************/
    if( type != 'delete' && type != 'create' ){
        var doSubmit = false;
        var oldRecord = nlapiGetOldRecord();
        var subID = nlapiGetRecordId();
        var newRecord = nlapiLoadRecord( 'subscription', subID );
        var prevCustomerRenew = oldRecord.getFieldValue( 'custrecord_bsn_script_suppress_renewal' );
        var newCustomerRenew = newRecord.getFieldValue( 'custrecord_bsn_script_suppress_renewal' );
        if( prevCustomerRenew != newCustomerRenew && newCustomerRenew == 'T' ){
            var subRevision = newRecord.getFieldValue('subscriptionrevision');
            var discountMON = subscriptionActiveTimeCredit(subID, subRevision);
            var q = newRecord.getLineItemValue( 'priceinterval', 'quantity', 1 );
            var partialPeriod = bsGetPartialPeriod(discountMON, q);
            var startdate = nlapiAddDays( nlapiStringToDate( newRecord.getFieldValue('enddate') ), 1 );
            var startdateStr = nlapiDateToString( startdate );
            var enddate = nlapiAddDays( nlapiAddMonths( startdate, 5 ), -1 ); // put time credit here
            var enddateStr = nlapiDateToString( enddate );
            nlapiLogExecution( 'DEBUG', 'newSub', JSON.stringify({
                'customer': newRecord.getFieldValue('customer'),
                'billingaccount': newRecord.getFieldValue('billingaccount'),
                'subscriptionplan': newRecord.getFieldValue('subscriptionplan'),
                'pricebook': newRecord.getFieldValue('pricebook'),
                'initialterm': '-102', // Custom Term
                'startdate': startdateStr,
                'enddate': enddateStr,
                'billingschedule': newRecord.getFieldValue('custrecord_sub_network_id'),
                'custrecord_bsn_sub_end_user': newRecord.getFieldValue('custrecord_bsn_sub_end_user'),
            }) );
            var newSubscription = nlapiCreateRecord( 'subscription' );
            newSubscription.setFieldValue('customer', newRecord.getFieldValue('customer'));
            newSubscription.setFieldValue('billingaccount', newRecord.getFieldValue('billingaccount'));
            newSubscription.setFieldValue('subscriptionplan', newRecord.getFieldValue('subscriptionplan'));
            newSubscription.setFieldValue('pricebook', newRecord.getFieldValue('pricebook'));
            newSubscription.setFieldValue('initialterm', '-102');// Custom Term
            newSubscription.setFieldValue('startdate', startdateStr);
            newSubscription.setFieldValue('enddate', enddateStr);
            newSubscription.setFieldValue('defaultrenewalterm', 1);
            newSubscription.setFieldValue('defaultrenewalmethod', '');
            //newSubscription.setFieldValue('defaultrenewalpricebook', newRecord.getFieldValue('pricebook'));
            //newSubscription.setFieldValue('defaultrenewalmethod', 'CREATE_NEW_SUBSCRIPTION');
            newSubscription.setFieldValue('custrecord_sub_network_id', newRecord.getFieldValue('custrecord_sub_network_id'));
            newSubscription.setFieldValue('custrecord_bsn_sub_end_user', newRecord.getFieldValue('custrecord_bsn_sub_end_user'));
            newSubscription.setFieldValue('custrecord_sb_sub_original_subscription', subID);
            newSubscription.setFieldValue('custrecord_sb_sub_apply_tc', 'T');

            var newSubID = nlapiSubmitRecord( newSubscription );
            nlapiLogExecution( 'DEBUG', 'newSubID', newSubID );
            if( newSubID ){
                nlapiLogExecution('DEBUG', 'discountMON', JSON.stringify(discountMON));
                if( discountMON.months ) {
                    var newSub = nlapiLoadRecord('subscription', newSubID);
                    var lineItemCount = newSub.getLineItemCount('priceinterval');
                    nlapiLogExecution('DEBUG', 'lineItemCount', lineItemCount);
                    for (var i = 1; i <= lineItemCount; i++) {
                        nlapiLogExecution('DEBUG', 'item', newSub.getLineItemValue('priceinterval', 'item', i));
                        var quantity = newSub.getLineItemValue( 'priceinterval', 'quantity', i );
                        var recurringAmount = newSub.getLineItemValue( 'priceinterval', 'recurringamount', i );
                        nlapiLogExecution('DEBUG', 'recurringAmount', recurringAmount);
                        var timeCreditUSD = ( (recurringAmount / quantity) / 12 ) * discountMON.months;
                        nlapiLogExecution('DEBUG', 'timeCreditUSD', timeCreditUSD);
                        var discountDiff = recurringAmount - timeCreditUSD;
                        nlapiLogExecution('DEBUG', 'discountDiff', discountDiff);
                        if( discountDiff > 0 ) {
                            newSub.setLineItemValue('priceinterval', 'discount', i, timeCreditUSD);
                        } else {
                            newSub.setLineItemValue('priceinterval', 'discount', i, recurringAmount);
                            nlapiLogExecution('DEBUG', 'store TimeCredit Difference', discountDiff);
                            /* Create New Time Credit record */

                        }
                        for( var k = 0; k < discountMON.records.length; k++ ){
                            nlapiSubmitField( 'customrecord_bsnc_time_credit', 'custrecord_bs_tc_status', 3 )
                        }
                    }
                    nlapiSubmitRecord(newSub);
                }
            }
        }
        /*
        if( type == 'create' ){
            nlapiLogExecution( 'DEBUG', 'newRecord.getFieldValue( \'custrecord_sb_sub_apply_tc\' ) == \'T\'', newRecord.getFieldValue( 'custrecord_sb_sub_apply_tc' ) == 'T' );
            if( newRecord.getFieldValue( 'custrecord_sb_sub_apply_tc' ) == 'T' ) {
                var lineItemCount = newRecord.getLineItemCount('priceinterval');
                nlapiLogExecution( 'DEBUG', 'lineItemCount', lineItemCount );
                for (var i = 1; i <= lineItemCount; i++) {
                    newRecord.setLineItemValue('priceinterval', 'discount', i, 50);
                }
                if (lineItemCount) {
                    nlapiSubmitRecord(newRecord);
                }
            }
        }
        */



        var prevNetType = oldRecord ? oldRecord.getFieldValue( 'custrecord_bsn_type' ) : null;
        var newNetType = newRecord.getFieldValue( 'custrecord_bsn_type' );
        var prevNetID = oldRecord ? oldRecord.getFieldValue( 'custrecord_sub_network_id' ) : null;
        var newNetID = newRecord.getFieldValue( 'custrecord_sub_network_id' );
        var isImport = newRecord.getFieldValue('custrecord_bs_is_import') == 'T';
        /*
        nlapiLogExecution('DEBUG', 'prevNetType != newNetType', prevNetType != newNetType);
        nlapiLogExecution('DEBUG', 'prevNetID != newNetID', prevNetID != newNetID);
        nlapiLogExecution('DEBUG', 'prevNetType', prevNetType);
        nlapiLogExecution('DEBUG', 'prevNetID', prevNetID);
        nlapiLogExecution('DEBUG', 'newNetType', newNetType);
        nlapiLogExecution('DEBUG', 'newNetID', newNetID);
        */
        if( !isImport && ( prevNetType != newNetType || prevNetID != newNetID ) ){
            if( !isNullorEmpty( newNetID ) ) {
                var network = {};
                if( newNetType == netTypeCom )
                    network = soapGetNetworkById( newNetID );
                else
                    network = soapGetNetworkByIdBSNC( newNetID );
                if( !network.IsError ){
                    newRecord.setFieldValue('custrecord_sub_network_name', network.Name);
                    nlapiSubmitRecord( newRecord );
                }
            }
        }
    }
    /************  End Takeover code  ************/

    /************  Renewal code  ************/
    if( type == 'create' ){
        var subRecordId = nlapiGetRecordId();
        var subRecord = nlapiLoadRecord( 'subscription', subRecordId, {recordmode: 'dynamic'} );
        var parentSub = subRecord.getFieldValue('parentsubscription');
        var isRenewal = !isNullorEmpty(parentSub);
        var isImport = subRecord.getFieldValue('custrecord_bs_is_import') == 'T';
        var subStatus = subRecord.getFieldValue('billingsubscriptionstatus');
        var countryCode = subRecord.getFieldValue('custrecord_sb_country_code');
        nlapiLogExecution('DEBUG', 'subRecord.getFieldValue(\'parentsubscription\')', subRecord.getFieldValue('parentsubscription'));
        nlapiLogExecution('DEBUG', 'subStatus', subStatus);
        nlapiLogExecution('DEBUG', 'subStatus == \'DRAFT\' && ( isRenewal || isImport )', subStatus == 'DRAFT' && ( isRenewal || isImport ));
        if( subStatus == 'DRAFT' && ( isRenewal || isImport ) ) {
            var billingAccount = subRecord.getFieldValue( 'billingaccount' );
            nlapiLogExecution('DEBUG', 'isNullorEmpty( billingAccount )', isNullorEmpty( billingAccount ));
            nlapiLogExecution('DEBUG', 'isImport', isImport);
            if( isNullorEmpty( billingAccount ) || isImport ){
                subRecord.selectLineItem('priceinterval', 1);
                var backupQuantity = subRecord.getCurrentLineItemValue('priceinterval', 'quantity');
                var priceBook = subRecord.getFieldValue( 'pricebook' );
                nlapiLogExecution('DEBUG', 'priceBook', priceBook);
                var renewalPlan = subRecord.getFieldValue( 'subscriptionplan' );
                nlapiLogExecution('DEBUG', 'renewalPlan', renewalPlan);
                var customer = subRecord.getFieldValue( 'customer' );
                nlapiLogExecution('DEBUG', 'customer', customer);
                var startDate = subRecord.getFieldValue( 'startdate' );
                nlapiLogExecution('DEBUG', 'startDate', startDate);
                nlapiLogExecution('DEBUG', 'Create Billing Account', 'Billing Account is Empty. Creating new Billing Account.');
                var newBA = bsnCreateBillingAccount( customer, startDate, countryCode, true );
                nlapiLogExecution('DEBUG', 'new Billing Account', newBA);
                subRecord.setFieldValue('billingaccount', newBA);
                subRecord.setFieldValue('pricebook', priceBook);
                subRecord.setFieldValue('defaultrenewalplan', renewalPlan);
                subRecord.selectLineItem('priceinterval', 1);
                subRecord.setCurrentLineItemValue('priceinterval', 'quantity', backupQuantity);
                subRecord.commitLineItem('priceinterval');
                nlapiSubmitRecord( subRecord );
            }

            var isCustomPrice = subRecord.getFieldValue( 'custrecord_sb_is_custom_price' );
            var customPrice = subRecord.getFieldValue( 'custrecord_sb_custom_price' );
            if( isCustomPrice === 'T' ){
                sbUpdateLatestPricePlan( subRecord, null, customPrice );
            }
            //if( !( isCustomPrice == 'T' ) ) {
                var subLineId = subRecord.getLineItemValue('subscriptionline', 'subscriptionline', 1);
                nlapiLogExecution('DEBUG', 'subLineId', subLineId);
                var subLine = nlapiLoadRecord('subscriptionline', subLineId);
                nlapiLogExecution('DEBUG', 'subLine', subLine);
                if (subLine) {
                    subLine.setFieldValue('subscriptionlinestatus', 'PENDING_ACTIVATION');
                    var savedSubLine = nlapiSubmitRecord(subLine);
                    nlapiLogExecution('DEBUG', 'savedSubLine', savedSubLine);

                    var changeOrder = nlapiCreateRecord('subscriptionchangeorder', {
                        'action': 'ACTIVATE',
                        'subscription': subRecordId
                    });
                    var effectiveDate = subRecord.getFieldValue("startdate");
                    changeOrder.setFieldValue('effectivedate', effectiveDate);
                    changeOrder.setFieldValue('requestoffcycleinvoice', 'T');
                    changeOrder.setLineItemValue('subline', 'apply', 1, 'T');
                    var newCO = nlapiSubmitRecord(changeOrder);
                    var invoice = null;
                    var invoiceText = '';
                    /*TODO: Maybe allow Invoice creation for Imports*/
                    if (newCO && !isImport) {
                        var isTerms = bsnIsTermsCustomer(customer);
                        if (isTerms) {
                            scheduleInvoiceCreation({subId: subRecordId, isSingle: 'T'});
                            nlapiLogExecution('DEBUG', 'is Terms?', 'Terms Customer. Scheduled Invoice creation.');
                            /*
                            invoice = bsCreateSubscriptionInvoice( effectiveDate, subRecordId );
                            if( invoice ){
                                invoiceText = '<a href="/app/accounting/transactions/custinvc.nl?id=' + invoice + '" target="inv' + invoice + '">Invoice</a><br>';
                            }
                            */
                        } else {
                            nlapiLogExecution('DEBUG', 'is Terms?', 'Non-Terms Customer. Skipping Invoice creation...');
                        }
                    }
                }
            //}
        }


        var newRecord = nlapiLoadRecord( 'subscription', subRecordId );
        var doSubmit = false;
        var netType = newRecord.getFieldValue( 'custrecord_bsn_type' );
        var netID = newRecord.getFieldValue( 'custrecord_sub_network_id' );
        if( !isNullorEmpty( netID ) ) {
            var network = {};
            if( netType == netTypeCom )
                network = soapGetNetworkById( netID );
            else
                network = soapGetNetworkByIdBSNC( netID );
            if( !network.IsError ){
                newRecord.setFieldValue('custrecord_sub_network_name', network.Name);
                doSubmit = true;
            }
            if( isRenewal ){
                newRecord.setFieldValue(  'custrecord_sb_bsn_ref', parentSub );
                doSubmit = true;
            }
        }

        if( doSubmit ) nlapiSubmitRecord(newRecord);
    }
    /************  END Renewal code  ************/
}

function bsnIsTermsCustomer( customerId ){
    if( !isNullorEmpty( customerId ) ){
        var customer = nlapiLoadRecord( 'customer', customerId );
        if( customer ){
            var terms = customer.getFieldValue( 'terms' );
            return !isNullorEmpty( terms ) && terms !== '13';
        }
    }
    return false;
}

function subscriptionActiveTimeCredit(subId, subRevision){
    var timeCredits = [];
    var timeCreditSearch = nlapiSearchRecord('customrecord_bsnc_time_credit', null, [['custrecord_bs_tc_subscription', 'is', subId],
            'AND',
            ['custrecord_bs_tc_status', 'is', 2],
            'AND',
            ['custrecord_bs_tc_subscription_revision', 'is', subRevision]],
        [new nlobjSearchColumn( 'custrecord_bs_tc_months')]);

    nlapiLogExecution('DEBUG', 'timeCreditSearch', JSON.stringify(timeCreditSearch));
    var tcMon = 0;
    if ( timeCreditSearch != null && timeCreditSearch.length) {
        for( var i = 0; i < timeCreditSearch.length; i++ ) {
            var tcId = timeCreditSearch[i].getId();
            var tcValue = parseFloat( timeCreditSearch[i].getValue('custrecord_bs_tc_months') );
            if( tcValue != 0 ){
                tcMon += tcValue;
                timeCredits.push( tcId );
            }
        }
    }

    return { 'months': round_float_to_n_places( tcMon, 2 ), 'records': timeCredits };
}

function bsGetPartialPeriod(discountMON, q){
    var floatMonths = discountMON / q;

    return {'months': months, 'days': days};
}

function isNullorEmpty(strVal){
    return (strVal == null || strVal == '');
}