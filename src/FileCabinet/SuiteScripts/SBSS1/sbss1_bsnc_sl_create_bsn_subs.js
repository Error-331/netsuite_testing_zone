/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       17 Nov 2020     Eugene Karakovsky
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function createBSNSubs(request, response){
    if ( request.getMethod() == 'GET' )
    {
        var subRecordId = request.getParameter('sub');
        if( !isNullorEmpty( subRecordId ) ) {
            var contracts = [sbBSNSettings.bsn1yrItemText];
            var contractPeriod = 'P365D';
            var quantity = 0;

            var subRecord = nlapiLoadRecord('subscription', subRecordId);
            var netId = subRecord.getFieldValue('custrecord_sub_network_id');
            var priceBookLines = subRecord.getLineItemCount('priceinterval');
            var subType = subRecord.getFieldValue('custrecord_bsn_type');
            //var log = '';
            var line = 1;
            for( var i = priceBookLines; i > 0; i-- ){
                var status = subRecord.getLineItemValue( 'priceinterval', 'status', i );
                var subLine = subRecord.getLineItemValue( 'priceinterval', 'linenumber', i );
                //log += ' ' + status + ' ' + subLine + ' ' + priceItem;
                if( status == 'ACTIVE' && line == subLine ) {
                    quantity = subRecord.getLineItemValue('priceinterval', 'quantity', i);
                    //amount = subRecord.getLineItemValue('priceinterval', 'recurringamount', i);
                    //price = amount / quantity;
                    break;
                }
            }

            var maxlength = subType == netTypeCom ? 5 : 6;
            var subRecordText = subType == netTypeCom ? '00000' : '000000';
            var idLength = digits_count(subRecordId);
            subRecordText = subRecordText.substr(0, maxlength - idLength) + subRecordId;

            var subs = [];
            for (i = 0; i < quantity; i++) {
                var deviceId = '0';
                var deviceSerial = '';
                subs[subs.length++] = [contractPeriod, deviceId, deviceSerial, subRecordText, netId, ''];
            }
            nlapiLogExecution('DEBUG', 'subs ', subs);

            var endDate = subRecord.getFieldValue('enddate');
            if( netId ) {
                var prevSubsId = [];
                var prevSubs = [];
                var invoices = [subRecordText];
                var filter = "[DeviceSubscription].[Network].[Id] IS " + netId + " AND ([DeviceSubscription].[InvoiceNumber] IS IN ('" + invoices.join("','") + "'))";
                var sort = '[DeviceSubscription].[Device].[Serial] DESC';
                nlapiLogExecution('DEBUG', 'Filter Get Device' , filter );
                if( subType == netTypeCom ) {
                    var getSubscriptions = soapGetDeviceSubscriptions( filter, sort );
                    if( isNullorEmpty(getSubscriptions.error) ){
                        prevSubs = getSubscriptions.subscriptions;
                    } else {
                        nlapiLogExecution('DEBUG', 'getSubscriptions Error ' , getSubscriptions.error );
                    }
                } else {
                    var getSubscriptions = soapGetDeviceSubscriptionsBSNC( filter, sort );
                    if( isNullorEmpty(getSubscriptions.error) ){
                        prevSubs = getSubscriptions.subscriptions;
                    } else {
                        nlapiLogExecution('DEBUG', 'getSubscriptions Error ' , getSubscriptions.error );
                    }
                }
                if( isArray( prevSubs ) && prevSubs.length > 0 ){
                    for ( var i = 0; i < prevSubs.length; i++ ){
                        prevSubsId.push(prevSubs[i].Id);
                    }
                }
                nlapiLogExecution('DEBUG', 'prevSubsId.length ' , prevSubsId.length );
                nlapiLogExecution('DEBUG', 'prevSubsId ' , prevSubsId );
                //Delete expired subscriptions
                var delResult = false;
                if( !isNullorEmpty(subRecordText) ){
                    if( subType == netTypeCom ) {
                        delResult = soapDeleteDeviceSubscriptions(prevSubsId, subRecordText);
                    } else {
                        delResult = soapDeleteDeviceSubscriptionsBSNC(prevSubsId, subRecordText);
                    }
                    if( isNullorEmpty( delResult.error ) ){
                        nlapiLogExecution('DEBUG', 'DeleteSubscriptionsResult', delResult.result + nlapiDateToString(new Date));
                    } else {
                        nlapiLogExecution('DEBUG', 'DeleteSubscriptionsResult', delResult.error);
                    }
                }
                nlapiLogExecution('DEBUG', 'delResult ' , JSON.stringify(delResult ));
                if( subType == netTypeCom ) {
                    //Update Network Renewal Date
                    var updateResult = soapUpdateNetworkBillingMode(netId, contractPeriod, getUTCDate(moment(nlapiStringToDate(endDate)).add(1, 'd').toDate()));
                    if( isNullorEmpty( updateResult.error ) ){
                        nlapiLogExecution('DEBUG', 'BillingUpdateResult', updateResult.result + nlapiDateToString(new Date));
                    } else {
                        nlapiLogExecution('DEBUG', 'BillingUpdateResult', updateResult.error);
                    }
                    //Create new subscriptions
                    var result = soapCreateDeviceSubscriptions(subs);
                    if( isNullorEmpty( result.error ) ){
                        nlapiLogExecution('DEBUG', 'Subscriptions Created ', JSON.stringify(result.newSubscriptions));
                    } else {
                        nlapiLogExecution('DEBUG', 'Subscriptions Created ', result.error);
                    }
                } else {
                    //Update Network Renewal Date
                    var updateResult = soapSetNetworkContentBSNC(netId, getUTCDate(nlapiStringToDate(endDate)));
                    if( isNullorEmpty( updateResult.error ) ){
                        nlapiLogExecution('DEBUG', 'ContentUpdateResult', updateResult.result + nlapiDateToString(new Date));
                    } else {
                        nlapiLogExecution('DEBUG', 'ContentUpdateResult', updateResult.error);
                    }

                    updateResult = soapUpdateNetworkBillingModeBSNC(netId, contractPeriod, getUTCDate(moment(nlapiStringToDate(endDate)).add(1, 'd').toDate()));
                    if( isNullorEmpty( updateResult.error ) ){
                        nlapiLogExecution('DEBUG', 'BillingUpdateResult', updateResult.result + nlapiDateToString(new Date));
                    } else {
                        nlapiLogExecution('DEBUG', 'BillingUpdateResult', updateResult.error);
                    }
                    //Create new subscriptions
                    var result = soapCreateDeviceSubscriptionsBSNC(subs);
                    if( isNullorEmpty( result.error ) ){
                        nlapiLogExecution('DEBUG', 'Subscriptions Created ', JSON.stringify(result.newSubscriptions));
                    } else {
                        nlapiLogExecution('DEBUG', 'Subscriptions Created ', result.error);
                    }
                }
            }
        }
    }
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