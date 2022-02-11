/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       16 Apr 2021     Eugene Karakovsky
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function emailRenewalNotification(type) {
    var usage = null, i;
    var context = nlapiGetContext();
    var daysBeforeRenewal = parseInt(context.getSetting('SCRIPT', 'custscript_bs_days_before'));
    //var daysBeforeRenewal = parseInt(nlapiLookupField("customrecord_swe_preferences", 482, "custrecord_swe_pref_value"));
    nlapiLogExecution("DEBUG", "daysBeforeRenewal", JSON.stringify(daysBeforeRenewal));
    if( daysBeforeRenewal > 0 ){
        var processArray = [];
        var date = new Date();
        date.setDate( date.getDate() + daysBeforeRenewal );
        var renewDate = nlapiDateToString(date); //Converts date to format based on user preference
        // Define search filters
        var filters = [
            /*["formulanumeric: CEIL({custrecord_swe_target_renewal_date} - CURRENT_DATE)", "equalto", daysBeforeRenewal],
            'AND',
            ['custrecord_contract_status','anyOf',['2','5']],
            'AND',
            ['startdate','on', renewDate]
            */
            new nlobjSearchFilter('startdate', null, 'on', renewDate)
        ];
        // Define search columns
        var columns = new Array();/*
        columns[0] = new nlobjSearchColumn( 'custrecord_contracts_bill_to_customer' );
        columns[1] = new nlobjSearchColumn( 'custrecord_contracts_end_user' );
        columns[2] = new nlobjSearchColumn( 'custrecord_contract_renewal_terms' );
        columns[3] = new nlobjSearchColumn( 'email', 'custrecord_contracts_bill_to_customer' );
        columns[3].setLabel( 'Customer Email' );
        columns[4] = new nlobjSearchColumn( 'formulatext' );
        columns[4].setFormula( '{custrecord_contracts_end_user.email}' );
        columns[4].setLabel( 'End User Email' );*/
        //Execute the search. You must specify the internal ID of the record type.
        //var searchresults = nlapiSearchRecord( 'customrecord_contracts', null, filters, columns );
        var searchresults = bigSearch( 'subscription', filters, columns, 'customsearch_bsnc_pending_renewals_prepa' );
        var mail_sent = new Array();
        nlapiLogExecution("DEBUG", "", "====================================== Start Script ===============================");
        nlapiLogExecution("DEBUG", "searchresults", JSON.stringify(searchresults));
        // Loop through all search results. When the results are returned, use methods
        // on the nlobjSearchResult object to get values for specific fields.
        for ( i = 0; searchresults != null && i < searchresults.length; i++ ) {
            var searchresult = searchresults[i];
            var record = searchresult.getId();
            var rectype = searchresult.getRecordType();
            nlapiLogExecution("DEBUG", "Subscription Info", JSON.stringify(searchresults[i]));
            var ttt = {
                "id": "2215",
                "recordtype": "subscription",
                "columns": {
                    "customer": {"name": "C-120 Indianapolis Museum of Art", "internalid": "2100"},
                    "email": "eugene.fiks@gmail.com",
                    "custrecord_bsn_sub_end_user": {"name": "C-26875 Eugene Fiks", "internalid": "124644"},
                    "billingaccount": {"name": "31", "internalid": "1219"},
                    "currency": {"name": "USA", "internalid": "1"},
                    "subsidiary": {"name": "BrightSign LLC", "internalid": "1"},
                    "startdate": "4/30/2021",
                    "enddate": "4/29/2022",
                    "name": "Suite.cloud 1 Year - 4/5/2021 Renew 1",
                    "subscriptionplan": {"name": "Suite.cloud 1 Year", "internalid": "808"},
                    "renewalnumber": 1,
                    "status": {"name": "Pending Activation", "internalid": "PENDING_ACTIVATION"},
                    "initialterm": {"name": "12 Months", "internalid": "1"},
                    "defaultrenewalterm": {"name": "12 Months", "internalid": "1"},
                    "autorenewal": true,
                    "lastratingrunstatus": "Success",
                    "custrecord_bsn_type": {"name": "BSN.cloud", "internalid": "1"},
                    "formulanumeric": 13,
                    "internalidnumber": 2640
                }
            };
/*TODO: update the code after checkboxes about Email Sent are added to the Subscription Record*/
            var renewalNumber = searchresult.getValue( 'renewalnumber' );
            if( renewalNumber ){
                var subscription = {
                    subID: searchresult.getId(),
                    customer: {
                        id:searchresult.getValue('customer'),
                        email:searchresult.getValue('email', 'customer')
                    },
                    billingaccount: searchresult.getValue('billingaccount'),
                    endUser: {
                        id:searchresult.getValue('custrecord_bsn_sub_end_user'),
                        email:searchresult.getValue('email', 'custrecord_bsn_sub_end_user')
                    },
                    emailSent:{
                        day30:searchresult.getValue('custrecord_bs_sub_30day_email'),
                        day15:searchresult.getValue('custrecord_bs_sub_15day_email'),
                        day7:searchresult.getValue('custrecord_bs_sub_7day_email'),
                        day0:searchresult.getValue('custrecord_bs_sub_0day_email'),
                        daym7:searchresult.getValue('custrecord_bs_sub_7day_past_email'),
                        daym30:searchresult.getValue('custrecord_bs_sub_30day_past_email')
                    },
                    startDate: searchresult.getValue('startdate'),
                    endDate: searchresult.getValue('enddate'),
                    bsnType: searchresult.getValue('custrecord_bsn_type'),
                    netID: searchresult.getValue('custrecord_sub_network_id'),
                    netName: searchresult.getValue('custrecord_sub_network_name'),
                    coID: searchresult.getValue('internalidnumber', 'subscriptionchangeorder'),
                    quantity: 0,
                    renewalAmount: 0
                };

                var co = nlapiLoadRecord( 'subscriptionchangeorder', subscription.coID );
                var renewalAmount = co.getLineItemValue( 'subline', 'recurringamount', 1 );
                subscription.renewalAmount = parseFloat( renewalAmount );
                subscription.quantity = co.getLineItemValue( 'subline', 'quantity', 1 );
                var baIndex = search( subscription.billingaccount, processArray, 'billingaccount' );
                if( baIndex == -1 ){
                    processArray.push( {
                        billingaccount:subscription.billingaccount,
                        customer:subscription.customer,
                        startdate:subscription.startDate,
                        total: subscription.renewalAmount,
                        subscriptions:[subscription]
                    } );
                } else {
                    processArray[baIndex].total += subscription.renewalAmount;
                    processArray[baIndex].subscriptions.push( subscription );
                }
            }


            /*
            var billToCustomer = searchresult.getValue( 'custrecord_contracts_bill_to_customer' );
            var endUser = searchresult.getValue( 'custrecord_contracts_end_user' );
            var renewalTerms = searchresult.getValue( 'custrecord_contract_renewal_terms' );
            var customerEmail = searchresult.getValue( 'email', 'custrecord_contracts_bill_to_customer' );
            var endUserEmail = searchresult.getValue( 'formulatext' );
            if ( isNullorEmpty( searchRecById( record, mail_sent ) ) ) {
                if( customerEmail.length ){
                    nlapiLogExecution("DEBUG", "Contract Info", "Contract ID: " + record + ", Customer ID: " + billToCustomer + ", Customer Email: " + customerEmail);
                    mail_sent.push( { 'id': record, 'email': customerEmail } );
                    sendUpsellEmail( customerEmail, billToCustomer);
                    //nlapiSubmitField('customrecord_contracts', record, 'custrecord_bsn_renewal_email_sent', 'T');
                }
            }

             */
            usage = context.getRemainingUsage();
            nlapiLogExecution("DEBUG", "Units Left", usage);
            if( usage < 50 ){ // Let us restart the Scheduled Script when we nearing the end of 10000 Governance Points
                var status = nlapiScheduleScript(context.getScriptId(), context.getDeploymentId());
                if ( status == 'QUEUED' ) break;
            }

        }

        for( i = 0; i < processArray.length; i++ ){
            var customerEmail = processArray[i].customer.email;
            var amount = processArray[i].total;
            var customerRecord = nlapiLoadRecord( 'customer', processArray[i].customer.id );
            if( customerRecord ) {
                var last4digits = '';
                var cardsCount = customerRecord.getLineItemCount( 'creditcards' );
                for( var n = 1; n <= cardsCount; n++ ){
                    var isDefaultCard = customerRecord.getLineItemValue('creditcards', 'ccdefault', n) == 'T';
                    nlapiLogExecution("DEBUG", "isDefaultCard", isDefaultCard);
                    if( isDefaultCard ) {
                        last4digits = customerRecord.getLineItemValue('creditcards', 'ccnumber', n);
                        last4digits = last4digits.replace('*', '');
                        nlapiLogExecution("DEBUG", "last4digits", last4digits);
                    }
                }
                sendRenewalEmail(bsnGetEmailTemplateByCode('30p', 'customer'), customerEmail, {
                    total: processArray[i].total,
                    startdate: processArray[i].startdate,
                    network_name: processArray[i].subscriptions.length > 1 ? 'BSN Networks' : processArray[i].subscriptions[0].netName,
                    last4digits: last4digits
                });

                usage = context.getRemainingUsage();
                nlapiLogExecution("DEBUG", "Units Left", usage);
                if (usage < 50) { // Let us restart the Scheduled Script when we nearing the end of 10000 Governance Points
                    var status = nlapiScheduleScript(context.getScriptId(), context.getDeploymentId());
                    if (status == 'QUEUED') break;
                }
            }
        }
        nlapiLogExecution("DEBUG", "Process Array", JSON.stringify(processArray));
        nlapiLogExecution("DEBUG", "", "====================================== End Script ===============================");
    }
}

function sendRenewalEmail( templateId, email, info){
    //var templateId = '354';
    if( !isNullorEmpty( templateId ) ) {
        var emailMerger = nlapiCreateEmailMerger(templateId);
        if( !isNullorEmpty( emailMerger ) ) {
            //emailMerger.setEntity('customer', customerId);
            var mergeResult = emailMerger.merge();
            var emailSubject = mergeResult.getSubject();
            emailSubject = emailSubject.replace(/{network_name}/g, info.network_name);

            var emailBody = mergeResult.getBody();
//Replace Custom FreeMarker Tags with values
            emailBody = emailBody.replace(/{total}/g, '$' + info.total);
            emailBody = emailBody.replace(/{startdate}/g, info.startdate);
            emailBody = emailBody.replace(/{last4digits}/g, info.last4digits);
            var records = new Object();
            //records['customer'] = customerId;
            sendEmailByTemplate(10, email, emailSubject, emailBody, null, null, records, null);
            return true;
        }
    }
    return false;
}

function bigSearch( type, filters, columns, saved ){
    var resultsArray = new Array();

    var search, k;
    // create search; alternatively nlapiLoadSearch() can be used to load a saved search
    if( !isNullorEmpty( saved ) ){
        var existingSearch = nlapiLoadSearch(type, saved);
        search = nlapiCreateSearch(type, existingSearch.getFilters(), existingSearch.getColumns());
        for( k = 0; k < filters.length; k++ ){
            if( typeof filters[k] != 'string' ){
                search.addFilter(filters[k]);
            }
        }
        for( k = 0; k < columns.length; k++ ){
            search.addColumn(columns[k]);
        }

    } else {
        search = nlapiCreateSearch(type, filters, columns);
    }
    var searchResults = search.runSearch(); // 10 points

    // resultIndex points to record starting current resultSet in the entire results array
    var resultIndex = 0;
    var resultStep = 1000; // Number of records returned in one step (maximum is 1000)
    var resultSet = new Array(); // temporary variable used to store the result set
    do
    {
        // fetch one result set
        resultSet = searchResults.getResults(resultIndex, resultIndex + resultStep);
        if( isNullorEmpty( resultSet ) ) break; //fix to be able to use .length

        var debug1 = 0;
        // increase pointer
        resultIndex = resultIndex + resultStep;

        // process or log the results
        if( resultsArray.length == 0 ){
            resultsArray = resultSet;
        } else {
            resultsArray = resultsArray.concat(resultSet);
        }

        var debug = 0;
        // once no records are returned we already got all of them
    } while (resultSet.length > 0);

    return resultsArray;
}

function searchRecById(id, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].id === id) {
            return myArray[i];
        }
    }

    return null;
}

function search(nameKey, myArray, myArrayIndex){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i][myArrayIndex] === nameKey) {
            return i;
        }
    }
    return -1;
}

function isNullorEmpty(strVal){
    return (strVal == null || strVal == '');
}

[{
    "id": "2215",
    "recordtype": "subscription",
    "columns": {
        "customer": {"name": "C-120 Indianapolis Museum of Art", "internalid": "2100"},
        "email": "eugene.fiks@gmail.com",
        "custrecord_bsn_sub_end_user": {"name": "C-26875 Eugene Fiks", "internalid": "124644"},
        "billingaccount": {"name": "31", "internalid": "1219"},
        "currency": {"name": "USA", "internalid": "1"},
        "subsidiary": {"name": "BrightSign LLC", "internalid": "1"},
        "startdate": "4/30/2021",
        "enddate": "4/29/2022",
        "name": "Suite.cloud 1 Year - 4/5/2021 Renew 1",
        "subscriptionplan": {"name": "Suite.cloud 1 Year", "internalid": "808"},
        "renewalnumber": 1,
        "status": {"name": "Pending Activation", "internalid": "PENDING_ACTIVATION"},
        "initialterm": {"name": "12 Months", "internalid": "1"},
        "defaultrenewalterm": {"name": "12 Months", "internalid": "1"},
        "autorenewal": true,
        "lastratingrunstatus": "Success",
        "custrecord_bsn_type": {"name": "BSN.cloud", "internalid": "1"},
        "formulanumeric": 13,
        "internalidnumber": 2640
    }
}, {
    "id": "2325",
    "recordtype": "subscription",
    "columns": {
        "customer": {"name": "C-120 Indianapolis Museum of Art", "internalid": "2100"},
        "email": "bdilger@imamuseum.org",
        "billingaccount": {"name": "31", "internalid": "1219"},
        "currency": {"name": "USA", "internalid": "1"},
        "subsidiary": {"name": "BrightSign LLC", "internalid": "1"},
        "startdate": "4/30/2021",
        "enddate": "4/29/2022",
        "name": "Suite.cloud 1 Year - 4/6/2021 Renew 1",
        "subscriptionplan": {"name": "Suite.cloud 1 Year", "internalid": "808"},
        "renewalnumber": 1,
        "status": {"name": "Pending Activation", "internalid": "PENDING_ACTIVATION"},
        "initialterm": {"name": "12 Months", "internalid": "1"},
        "defaultrenewalterm": {"name": "12 Months", "internalid": "1"},
        "autorenewal": true,
        "lastratingrunstatus": "Success",
        "custrecord_bsn_type": {"name": "BSN.cloud", "internalid": "1"},
        "formulanumeric": 13,
        "internalidnumber": 2759
    }
}, {
    "id": "2436",
    "recordtype": "subscription",
    "columns": {
        "customer": {"name": "C-120 Indianapolis Museum of Art", "internalid": "2100"},
        "email": "bdilger@imamuseum.org",
        "billingaccount": {"name": "31", "internalid": "1219"},
        "currency": {"name": "USA", "internalid": "1"},
        "subsidiary": {"name": "BrightSign LLC", "internalid": "1"},
        "startdate": "4/30/2021",
        "enddate": "4/29/2022",
        "name": "Suite.cloud 1 Year - 4/7/2021 - 1 Renew 1",
        "subscriptionplan": {"name": "Suite.cloud 1 Year", "internalid": "808"},
        "renewalnumber": 1,
        "status": {"name": "Pending Activation", "internalid": "PENDING_ACTIVATION"},
        "initialterm": {"name": "12 Months", "internalid": "1"},
        "defaultrenewalterm": {"name": "12 Months", "internalid": "1"},
        "autorenewal": true,
        "lastratingrunstatus": "Success",
        "custrecord_bsn_type": {"name": "BSN.cloud", "internalid": "1"},
        "formulanumeric": 13,
        "internalidnumber": 2877
    }
}]

    [{
    "billingaccount": "1219",
    "customer": {"id": "2100", "email": "bdilger@imamuseum.org"},
    "subscriptions": [{
        "subID": "2215",
        "customer": {"id": "2100", "email": "bdilger@imamuseum.org"},
        "billingaccount": "1219",
        "endUser": {"id": "124644", "email": "eugene.fiks@gmail.com"},
        "startDate": "4/30/2021",
        "endDate": "4/29/2022",
        "bsnType": "1",
        "coID": null
    }, {
        "subID": "2325", "customer": {"id": "2100", "email": "bdilger@imamuseum.org"}, "billingaccount": "1219", "endUser": {"id": "", "email": ""}, "startDate": "4/30/2021", "endDate": "4/29/2022", "bsnType": "1", "coID": null
    }, {
        "subID": "2436",
        "customer": {"id": "2100", "email": "bdilger@imamuseum.org"},
        "billingaccount": "1219",
        "endUser": {"id": "", "email": ""},
        "startDate": "4/30/2021",
        "endDate": "4/29/2022",
        "bsnType": "1",
        "coID": null
    }]
}]