/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       31 Mar 2021     Eugene Karakovsky
 *
 */
//replaceSalesRep('scheduled');
/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduledBSNNetworkProcessing(type) {
    var sub = null;
    try{
        var subID = nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_subid_net');
        var isSingle = nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_is_single_net');
        //var netID = nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_netid_net')||'';
        //var netType = nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_net_type_net')||'';

        nlapiLogExecution("DEBUG", "", "================== BSN Network Update Start =================");
        nlapiLogExecution("DEBUG", "Init data", "subID: " + subID + ", isSingle: " + isSingle);
        var usage = null;
        var today = nlapiDateToString(new Date());
        nlapiLogExecution("DEBUG", "today", today);
        if( isSingle == 'T' && !isNullorEmpty( subID ) ) {
            sub = nlapiLoadRecord('subscription', subID);
            if (sub) {
                var networkType = '';
                var networkId = '';
                networkType = sub.getFieldValue('custrecord_bsn_type') || netTypeCloud;
                networkId = sub.getFieldValue('custrecord_sub_network_id');
                nlapiLogExecution("DEBUG", "Subscription data", "subID: " + subID + ", netType: " + networkType + ", netId: " + networkId);
                var args = {netId: networkId, netType: networkType, subID: subID, sub: sub};
                nlapiLogExecution("DEBUG", "args", JSON.stringify(args));
                if (networkType == netTypeCom) {
                    updateBSNSubscriptions(args, sub);
                } else {
                    updateBSNCSubscriptions(args, sub);
                }
            }
        }

        if( isSingle == 'F' ) {
            /*
            var processInvoices = bsncInitSubsCreation();
            if( processInvoices && processInvoices.length ){
                for( var i = 0; i < processInvoices.length; i++ ){
                    var processSub = processInvoices[i].subId;
                    if( processSub == 9 ) bsncSingleSubscriptionScheduleScript( processInvoices[i].subId );
                    nlapiLogExecution('DEBUG', 'processSub ' + i, processSub );
                }
            }
            */
        }
    } catch(e) {
        nlapiLogExecution('DEBUG', 'Exception ', e.message );
        nlapiLogExecution('DEBUG', 'Exception ', e.stack);
        nlapiLogExecution('DEBUG', 'Exception ', e.toString());
    }
}

function updateBSNSubscriptions( args, sub ){
    nlapiLogExecution('DEBUG', 'args ', JSON.stringify(args) );
    if( 0 && args.netId && args.netType && args.subID ) {
        var contracts = [sbBSNSettings.bsn1yrItemText];
        var contractPeriod = 'P365D';

        var subRecordId = args.subID;//112;
        var subRecord = args.sub;//nlapiLoadRecord('subscription', subRecordId);
        var netId = args.netId;//3;//subRecord.getFieldValue('custrecord_sub_network_id');
        var subType = args.netType//2;//subRecord.getFieldValue('custrecord_bsn_type');
        var deviceIDPresent = false;

        var coInfo = args.isCleanup == 'T' ? {quantity: 0} : currentActiveChangeOrderRequest( subRecordId );
        var quantity = coInfo.quantity;
        var netQuantity = 0;

        var maxlength = 5;// : 6;
        var subRecordText = '00000';// : '000000';
        var idLength = digits_count(subRecordId);
        subRecordText = subRecordText.substr(0, maxlength - idLength) + subRecordId;

        //var changeOrders = searchChangeOrders( subID, true, 'today' );
        var network = soapGetNetworkById(args.netId);
        if (network.Id) {
            var count = soapNetworkSubscriptionsCount(network.Id);
            if (isNullorEmpty(count.error)) {
                network.quantity = count.quantity;
            } else {
                nlapiLogExecution('ERROR', 'Subs Count ', count.message);
                network.quantity = 0;
            }
            netQuantity = network.quantity;

            nlapiLogExecution('DEBUG', 'quantity ', quantity);
            var subs = [];
            for (i = 0; i < quantity; i++) {
                var deviceId = '0';
                if( args.serials.length > i ){
                    deviceIDPresent = true;
                    deviceId = args.serials[i];
                }
                var deviceSerial = '';
                subs[subs.length++] = [contractPeriod, deviceId, deviceSerial, subRecordText, netId, ''];
            }
            nlapiLogExecution('DEBUG', 'subs ', JSON.stringify(subs));

            var endDate = args.isCleanup == 'T' ? '' : subRecord.getFieldValue('enddate');
            nlapiLogExecution('DEBUG', 'endDate ', endDate);




            var prevSubsId = [];
            var prevSubs = [];
            var invoices = [subRecordText];
            var filter = "[DeviceSubscription].[Network].[Id] IS " + netId + " AND ([DeviceSubscription].[InvoiceNumber] IS IN ('" + invoices.join("','") + "'))";
            var sort = '[DeviceSubscription].[Device].[Serial] DESC';
            nlapiLogExecution('DEBUG', 'Filter Get Device', filter);
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
            if (!isNullorEmpty(subRecordText)) {
                delResult = soapDeleteDeviceSubscriptions(prevSubsId, subRecordText);
            }
            if( isNullorEmpty( delResult.error ) ){
                nlapiLogExecution('DEBUG', 'Deleted Subs ', delResult.deleted);
            } else {
                errors.push( delResult.error );
                nlapiLogExecution('ERROR', 'Deleted Subs ', delResult.error);
            }

            if( args.isCleanup != 'T' ){
                //Update Network Renewal Date
                /*Todo: check if network is empty*/
                var updateResult = soapUpdateNetworkBillingMode(netId, contractPeriod, getUTCDate(moment(nlapiStringToDate(endDate)).add(1, 'd').toDate()));
                if( isNullorEmpty( updateResult.error ) ){
                    nlapiLogExecution('DEBUG', 'BillingUpdateResult', updateResult.result + nlapiDateToString(new Date));
                } else {
                    errors.push( updateResult.error );
                    nlapiLogExecution('ERROR', 'BillingUpdateResult', updateResult.error);
                }

                //Create new subscriptions
                /*Todo: make it scalable with continuous Scheduled Script restarts*/
                if( deviceIDPresent ){
                    for( var k = 0; k < subs.length; k++ ){
                        var result = soapCreateDeviceSubscriptions([subs[k]]);
                        if( isNullorEmpty( result.error ) ){
                            nlapiLogExecution('DEBUG', 'Subscriptions Created ', JSON.stringify(result.newSubscriptions));
                        } else {
                            errors.push( result.error + ' Device Id: ' + subs[k][1] + ' Device Serial: ' + subs[k][2] + '. ' );
                            nlapiLogExecution('ERROR', 'Subscription Not Created ', result.error + ' Device Id: ' + subs[k][1] + ' Device Serial: ' + subs[k][2] + '. ');
                        }
                    }
                }else{
                    var result = soapCreateDeviceSubscriptions(subs);
                    if( isNullorEmpty( result.error ) ){
                        nlapiLogExecution('DEBUG', 'Subscriptions Created ', JSON.stringify(result.newSubscriptions));
                    } else {
                        errors.push( result.error );
                        nlapiLogExecution('ERROR', 'Subscriptions Created ', result.error);
                    }
                }
                var submitError = '';
                if( errors.length ) submitError = errors.join( ' ' );
                //nlapiSubmitField( 'subscription', subRecordId, 'custrecord_bs_last_error', submitError );

                sub.setFieldValue('custrecord_bs_last_error', submitError);
                nlapiSubmitRecord(sub);
            }
        } else {
            /*Todo: ERROR Message*/
        }
    }
}

function updateBSNCSubscriptions( args, sub ){
    nlapiLogExecution('DEBUG', 'args ', JSON.stringify(args) );
    if( args.netId && args.netType && args.subID ) {
        var subRecordId = args.subID;//112;
        var subRecord = args.sub;//nlapiLoadRecord('subscription', subRecordId);
        var netId = args.netId;//3;//subRecord.getFieldValue('custrecord_sub_network_id');
        var subType = args.netType//2;//subRecord.getFieldValue('custrecord_bsn_type');
        var suspend = false;

        var network = soapGetNetworkByIdBSNC(args.netId);
        if (network.Id) {
            var errors = [];
            suspend = network.IsLockedOut == 'true';

            if( network.isContent ) {
                var isRenewal = sub.getFieldValue('parentsubscription') != "";
                var subStatus = sub.getFieldValue('billingsubscriptionstatus');
                nlapiLogExecution('DEBUG', 'subStatus', subStatus);
                nlapiLogExecution('DEBUG', 'Network Already Suspended', suspend);
                if( subStatus == 'DRAFT' && isRenewal && !suspend ) {
                    var today = new Date();
                    var startDate = nlapiStringToDate(sub.getFieldValue('startdate'));
                    var diffTime = today - startDate;
                    var startDelta = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                    nlapiLogExecution('DEBUG', 'startDelta', startDelta);
                    if( startDelta >= 30 ) suspend = true;
                    nlapiLogExecution('DEBUG', 'suspend', suspend);
                    //Update Network Renewal Date
                    /*Todo: check if network is empty*/
                    updateResult = soapUpdateNetworkBSNC(network.Id, network.Name, network.SubscriptionsActivityPeriod, getUTCDate( network.SubscriptionsRenewalDate ), suspend);
                    if (isNullorEmpty(updateResult.error)) {
                        nlapiLogExecution('DEBUG', 'UpdateResult', updateResult.result + nlapiDateToString(new Date));
                    } else {
                        errors.push(updateResult.error);
                        nlapiLogExecution('ERROR', 'UpdateResult', updateResult.error);
                    }

                    var submitError = '';
                    if (errors.length) submitError = errors.join(' ');
                    sub.setFieldValue('custrecord_bs_last_error', submitError);
                    nlapiSubmitRecord(sub);
                }
            }
        } else {
            /*Todo: ERROR Message*/
        }
    }
}

function bsncSingleSubscriptionScheduleScript(subId){
    var status = 'ERROR';

    if( !isNullorEmpty( subId ) ){
        var parameters = {
            custscript_sb_bsnc_subid_op: subId,
            custscript_sb_bsnc_is_single_op: 'T'
        }
        status = nlapiScheduleScript('customscript_sb_bsnc_ss_subs_operations', 'customdeploy_sb_bsnc_ss_subs_operations', parameters);
        nlapiLogExecution("DEBUG", "status", status);
    }

    switch( status ){
        case 'QUEUED': status = 'SUCCESS'; break;
        case 'INQUEUE': status = 'QUEUED'; break;
        case 'INPROGRESS': status = 'QUEUED'; break;
        case 'SCHEDULED': status = 'QUEUED'; break;
        default: break;
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