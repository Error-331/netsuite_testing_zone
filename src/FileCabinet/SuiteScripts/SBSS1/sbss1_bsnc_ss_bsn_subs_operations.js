/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       25 Dec 2020     Eugene Karakovsky
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
        var parameters = {
            subID: nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_subid_op'),
            isSingle: nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_is_single_op'),
            serials: nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_serials_op')||'',
            isCleanup: nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_cleanup')||'F',
            netID: nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_netid')||'',
            netType: nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_net_type')||'',
            sendEmail: nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_send_emails')||'F',
            toControl: nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_to_control')||'F'
        }

        nlapiLogExecution("DEBUG", "", "================== BSN Subscriptions creation Start =================");
        nlapiLogExecution("DEBUG", "Init data", "subID: " + parameters.subID + ", isSingle: " + parameters.isSingle + ", serials: " + parameters.serials + ", sendEmail: " + parameters.sendEmail + ", toControl: " + parameters.toControl);
        var usage = null;
        var today = nlapiDateToString(new Date());
        nlapiLogExecution("DEBUG", "today", today);
        if( parameters.isSingle == 'T' && !isNullorEmpty( parameters.subID ) && parameters.sendEmail == 'F' ) {
            usage = nlapiGetContext().getRemainingUsage();
            nlapiLogExecution( 'DEBUG', 'Start Units Left', usage );

            processSubscription( parameters );

            usage = nlapiGetContext().getRemainingUsage();
            nlapiLogExecution( 'DEBUG', 'End Units Left', usage );
        }

        if( parameters.isSingle == 'T' && !isNullorEmpty( parameters.subID ) && parameters.sendEmail == 'F' ) {}

        if( parameters.isSingle == 'F' && parameters.sendEmail == 'F' ) {
            usage = nlapiGetContext().getRemainingUsage();
            nlapiLogExecution( 'DEBUG', 'Cycle Start Units Left', usage );

            var processSubscriptions = searchChangeOrdersForMassProcessing();
            nlapiLogExecution('DEBUG', 'processSubscriptions ', JSON.stringify(processSubscriptions) );
            if( processSubscriptions && processSubscriptions.length ){
                for( var i = 0; i < processSubscriptions.length; i++ ){
                    nlapiLogExecution('DEBUG', 'processSubscriptions ' + i, JSON.stringify(processSubscriptions[i]) );
                    if( !processSubscriptions[i].processed ) {
                        parameters.subID = processSubscriptions[i].subId;
                        parameters.netID = processSubscriptions[i].netId;
                        parameters.netType = processSubscriptions[i].netType == 'BSN.COM'? 2 : 1;
                        nlapiLogExecution('DEBUG', 'parameters ' + i, JSON.stringify(parameters));
                        processSubscription( parameters );

                        usage = nlapiGetContext().getRemainingUsage();
                        nlapiLogExecution( 'DEBUG', 'Cycle iteration ' + i + ' Units Left', usage );
                    }
                }
            }
        }

        if( parameters.isSingle == 'F' && parameters.sendEmail == 'T' ) {
            var processInvoices = bsncInitEmailSending();
            if( processInvoices && processInvoices.length ){
                for( var i = 0; i < processInvoices.length; i++ ){
                    nlapiLogExecution('DEBUG', 'emailInvoices ' + i, JSON.stringify(processInvoices[i]) );
                    var processSub = processInvoices[i].subId;
                    nlapiLogExecution('DEBUG', 'processSub ' + i, processSub );
                    //if( processSub == 2202 ) bsncSingleSubscriptionScheduleScript( processInvoices[i].subId, true );
                }
            }
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

function processSubscription( parameters ){
    var sub = parameters.isCleanup == 'T' ? true : nlapiLoadRecord('subscription', parameters.subID);
    if (sub) {
        var networkType = '';
        var networkId = '';
        if( parameters.isCleanup == 'T' ){
            if( isNullorEmpty(parameters.netType) || isNullorEmpty(parameters.netID) ) return;
            networkType = parameters.netType;
            networkId = parameters.netID;
        } else {
            networkType = sub.getFieldValue('custrecord_bsn_type') || netTypeCloud;
            networkId = sub.getFieldValue('custrecord_sub_network_id');
        }
        var processedSerials = [];
        var splitSerials = parameters.serials.split(',');
        for( var k = 0; k < splitSerials.length; k++ ){
            if( splitSerials[k].trim() != '' ) processedSerials.push(splitSerials[k].trim());
        }
        nlapiLogExecution("DEBUG", "Subscription data", "subID: " + parameters.subID + ", netType: " + networkType + ", netId: " + networkId + ", serials: " + parameters.serials + ", isCleanup: " + parameters.isCleanup);
        var args = {netId: networkId, netType: networkType, subID: parameters.subID, sub: sub, serials: processedSerials, isCleanup: parameters.isCleanup, toControl: parameters.toControl};
        nlapiLogExecution("DEBUG", "args", JSON.stringify(args));
        if (networkType == netTypeCom) {
            createBSNSubscriptions(args, sub);
        } else {
            createBSNCSubscriptions(args, sub);
        }
    }
}

function createBSNSubscriptions( args, sub ){
    //nlapiLogExecution('DEBUG', 'args ', JSON.stringify(args) );
    if( args.netId && args.netType && args.subID ) {
        var contracts = [sbBSNSettings.bsn1yrItemText];
        var contractPeriod = 'P365D';

        var subRecordId = args.subID;//112;
        var subRecord = args.sub;//nlapiLoadRecord('subscription', subRecordId);
        var netId = args.netId;//3;//subRecord.getFieldValue('custrecord_sub_network_id');
        var subType = args.netType//2;//subRecord.getFieldValue('custrecord_bsn_type');
        var deviceIDPresent = false;

        var coInfo = args.isCleanup == 'T' ? {quantity: 0} : currentActiveChangeOrderRequest( subRecordId );

        if( coInfo && coInfo.processed ){
            nlapiLogExecution('DEBUG', 'coInfo ', 'Change Order already processed. Stop.');
            return;
        }

        if( coInfo && coInfo.renewed ){
            nlapiLogExecution('DEBUG', 'coInfo ', 'Subscription already renewed. Stop.');
            return;
        }

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
            var bsnRef = subRecord.getFieldValue( 'custrecord_sb_bsn_ref' );
            nlapiLogExecution('DEBUG', 'bsnRef', bsnRef);
            if( !isNullorEmpty( bsnRef ) ){
                bsnRef += ';' + subRecordText;
                nlapiLogExecution('DEBUG', 'bsnRef', bsnRef);
                invoices = bsnRef.split(';');
                nlapiLogExecution('DEBUG', 'invoices', JSON.stringify( invoices ));
            }
            nlapiLogExecution('DEBUG', 'invoices', JSON.stringify( invoices ));
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
                var updateResult = soapUpdateNetworkBillingMode(netId, contractPeriod, getSOAPTime(moment(nlapiStringToDate(endDate)).add(1, 'd').toDate()));
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

                if( quantity ) {
                    var subsCount = soapNetworkSubscriptionsCount(netId, false, [subRecordText]);
                    nlapiLogExecution('DEBUG', 'quantity', quantity);
                    nlapiLogExecution('DEBUG', 'subsCount', subsCount.quantity);
                    if (quantity && quantity == subsCount.quantity) {
                        var co = nlapiLoadRecord('subscriptionchangeorder', coInfo.coId);
                        co.setFieldValue('custrecord_sb_co_processed', 'T');
                        var savedCO = nlapiSubmitRecord(co);
                        nlapiLogExecution('DEBUG', 'Subs Regen Result', 'Change Order ID: ' + savedCO + ' successfully processed on BSN side. ' + quantity + ' Device Subscriptions created.');
                    }
                }

                /*
                var submitError = '';
                if( errors.length ) submitError = errors.join( ' ' );
                //nlapiSubmitField( 'subscription', subRecordId, 'custrecord_bs_last_error', submitError );
                sub.setFieldValue('custrecord_bs_last_error', submitError);
                nlapiSubmitRecord(sub);
                */
            }
        } else {
            /*Todo: ERROR Message*/
        }
    }
}

function createBSNCSubscriptions( args, sub ){
    //nlapiLogExecution('DEBUG', 'args ', JSON.stringify(args) );
    if( args.netId && args.netType && args.subID ) {
        var contracts = [sbBSNSettings.bsnc1yrItemText];
        var contractPeriod = 'P365D';

        var subRecordId = args.subID;//112;
        var subRecord = args.sub;//nlapiLoadRecord('subscription', subRecordId);
        var netId = args.netId;//3;//subRecord.getFieldValue('custrecord_sub_network_id');
        var subType = args.netType//2;//subRecord.getFieldValue('custrecord_bsn_type');
        var deviceIDPresent = false;

        var coInfo = args.isCleanup == 'T' ? {quantity: 0} : currentActiveChangeOrderRequest( subRecordId );
        nlapiLogExecution('DEBUG', 'coInfo ', JSON.stringify(coInfo));

        if( coInfo && coInfo.processed ){
            nlapiLogExecution('DEBUG', 'coInfo ', 'Change Order already processed. Stop.');
            return;
        }

        if( coInfo && coInfo.renewed ){
            nlapiLogExecution('DEBUG', 'coInfo ', 'Subscription already renewed. Stop.');
            return;
        }

        var quantity = coInfo.quantity;
        var netQuantity = 0;

        var maxlength = 6;
        var subRecordText = '000000';
        var idLength = digits_count(subRecordId);
        subRecordText = subRecordText.substr(0, maxlength - idLength) + subRecordId;

        //var changeOrders = searchChangeOrders( subID, true, 'today' );
        var network = soapGetNetworkByIdBSNC(args.netId);
        if (network.Id) {
            var count = soapNetworkSubscriptionsCountBSNC(network.Id);
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
            var bsnRef = subRecord.getFieldValue( 'custrecord_sb_bsn_ref' );
            nlapiLogExecution('DEBUG', 'bsnRef', bsnRef);
            if( !isNullorEmpty( bsnRef ) ){
                bsnRef += ';' + subRecordText;
                nlapiLogExecution('DEBUG', 'bsnRef', bsnRef);
                invoices = bsnRef.split(';');
                nlapiLogExecution('DEBUG', 'invoices', JSON.stringify( invoices ));
            }
            nlapiLogExecution('DEBUG', 'invoices', JSON.stringify( invoices ));
            var filter = "[DeviceSubscription].[Network].[Id] IS " + netId + " AND ([DeviceSubscription].[InvoiceNumber] IS IN ('" + invoices.join("','") + "'))";
            var sort = '[DeviceSubscription].[Device].[Serial] DESC';
            nlapiLogExecution('DEBUG', 'Filter Get Device', filter);
            prevSubs = soapGetDeviceSubscriptionsBSNC(filter, sort);

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
                delResult = soapDeleteDeviceSubscriptionsBSNC(prevSubsId, subRecordText);
            }
            if( isNullorEmpty( delResult.error ) ){
                nlapiLogExecution('DEBUG', 'Deleted Subs ', delResult.deleted);
            } else {
                errors.push( delResult.error );
                nlapiLogExecution('ERROR', 'Deleted Subs ', delResult.error);
            }

            //Set Network Content
            var updateResult = soapSetNetworkContentBSNC( netId, "Content", getUTCDate(nlapiStringToDate(endDate)) );
            if( isNullorEmpty( updateResult.error ) ){
                nlapiLogExecution('DEBUG', 'SetContent', updateResult.result);
            } else {
                errors.push( updateResult.error );
                nlapiLogExecution('ERROR', 'SetContent', updateResult.error);
            }
            if( args.isCleanup != 'T' ) {
                //Update Network Renewal Date
                /*Todo: check if network is empty*/
                updateResult = soapUpdateNetworkBillingModeBSNC(netId, contractPeriod, getUTCDate(moment(nlapiStringToDate(endDate)).add(1, 'd').toDate()));
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
                        var result = soapCreateDeviceSubscriptionsBSNC([subs[k]]);
                        if( isNullorEmpty( result.error ) ){
                            nlapiLogExecution('DEBUG', 'Subscriptions Created ', JSON.stringify(result.newSubscriptions));
                        } else {
                            errors.push( result.error + ' Device Id: ' + subs[k][1] + ' Device Serial: ' + subs[k][2] + '. ' );
                            nlapiLogExecution('ERROR', 'Subscription Not Created ', result.error + ' Device Id: ' + subs[k][1] + ' Device Serial: ' + subs[k][2] + '. ');
                        }
                    }
                }else{
                    var result = soapCreateDeviceSubscriptionsBSNC(subs);
                    if( isNullorEmpty( result.error ) ){
                        nlapiLogExecution('DEBUG', 'Subscriptions Created ', JSON.stringify(result.newSubscriptions));
                    } else {
                        errors.push( result.error );
                        nlapiLogExecution('ERROR', 'Subscriptions Created ', result.error);
                    }
                }

                //Set Network Control
                if( args.toControl == 'T' ){
                    var subsCount = soapNetworkSubscriptionsCountBSNC( args.netId );
                    if( !subsCount.error && !subsCount.quantity ) {
                        var controlResult = soapSetNetworkContentBSNC(netId, "Control");
                        if (isNullorEmpty(controlResult.error)) {
                            nlapiLogExecution('DEBUG', 'SetControl', controlResult.result);
                        } else {
                            errors.push(controlResult.error);
                            nlapiLogExecution('ERROR', 'SetControl', controlResult.error);
                        }
                    }
                } else {
                    var subsCount = soapNetworkSubscriptionsCountBSNC(netId, false, [subRecordText]);
                    nlapiLogExecution('DEBUG', 'quantity', quantity);
                    nlapiLogExecution('DEBUG', 'subsCount', subsCount.quantity);
                    if (quantity && quantity == subsCount.quantity) {
                        var co = nlapiLoadRecord('subscriptionchangeorder', coInfo.coId);
                        co.setFieldValue('custrecord_sb_co_processed', 'T');
                        var savedCO = nlapiSubmitRecord(co);
                        nlapiLogExecution('DEBUG', 'Subs Regen Result', 'Change Order ID: ' + savedCO + ' successfully processed on BSN side. ' + quantity + ' Device Subscriptions created.');
                    }
                }

                /*
                var submitError = '';
                if( errors.length ) submitError = errors.join( ' ' );
                //nlapiSubmitField( 'subscription', subRecordId, 'custrecord_bs_last_error', submitError );
                sub.setFieldValue('custrecord_bs_last_error', submitError);
                nlapiSubmitRecord(sub);
                */
            }
        } else {
            /*Todo: ERROR Message*/
        }
    }
}

function removeBSNSubscriptions( args ){
    var invArray = args.invoices || [];
    var invoices = invArray.join("','");
    args.netId = args.netId || '';
    if( invArray.length && !isNullorEmpty( args.netId ) ) {
        var prevSubsId = [];
        var prevSubs = [];
        var filter = "[DeviceSubscription].[Network].[Id] IS " + args.netId + " AND ([DeviceSubscription].[InvoiceNumber] IS IN ('" + invoices + "'))";
        var sort = '[DeviceSubscription].[Device].[Serial] DESC';
        nlapiLogExecution('DEBUG', 'Filter Get Device', filter);
        prevSubs = soapGetDeviceSubscriptions(filter, sort);

        if (!isNullorEmpty(prevSubs.error)) {
            nlapiLogExecution('ERROR', 'Get Subs for Deletion', prevSubs.error)
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
        if (!isNullorEmpty(invoices)) {
            delResult = soapDeleteDeviceSubscriptions(prevSubsId, invoices);
        }
        if (isNullorEmpty(delResult.error)) {
            nlapiLogExecution('DEBUG', 'Deleted Subs ', delResult.deleted);
        } else {
            errors.push(delResult.error);
            nlapiLogExecution('ERROR', 'Deleted Subs ', delResult.error);
        }
    } else {
        if( !invoices.length ) nlapiLogExecution('DEBUG', 'Remove Subs', 'No Invoice Numbers to use.');
        if( isNullorEmpty( args.netId ) ) nlapiLogExecution('DEBUG', 'Remove Subs', 'No Invoice Numbers to use.')
    }
}

function bsncSingleSubscriptionRenewalEmailScheduleScript( subId ){
    var d = 0;
}

function bsncSingleSubscriptionScheduleScript(subId, sendEmail){
        var status = 'ERROR';

        if( !isNullorEmpty( subId ) ){
            var parameters = {
                custscript_sb_bsnc_subid_op: subId,
                custscript_sb_bsnc_is_single_op: 'T',
                custscript_sb_bsnc_send_emails: sendEmail ? 'T' : 'F'
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