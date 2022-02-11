/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       5 Apr 2021     Eugene Karakovsky
 *
 */
//replaceSalesRep('scheduled');
/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduledSubscriptionProcessing(type) {
    var sub = null;
    try{
        var subID = nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_subid_sub');
        var isSingle = nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_is_single_sub');
        var effDate = nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_eff_date') || '';
        var isAny = nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_is_any') || 'F';

        nlapiLogExecution("DEBUG", "", "================== BSN Subscription Actions Start =================");
        nlapiLogExecution("DEBUG", "Init data", "subID: " + subID + ", isSingle: " + isSingle);
        var usage = null;
        var today = nlapiDateToString(new Date());
        nlapiLogExecution("DEBUG", "today", today);
        if( isSingle == 'T' && !isNullorEmpty( subID ) ) {
            sub = nlapiLoadRecord('subscription', subID);
            nlapiLogExecution("DEBUG", "sub", sub);
            if (sub) {
                var subStatus = sub.getFieldValue('billingsubscriptionstatus');
                nlapiLogExecution("DEBUG", "subStatus", subStatus);
                var isRenewal = !isNullorEmpty(sub.getFieldValue('parentsubscription'));
                if( ( isRenewal && subStatus == 'PENDING_ACTIVATION' ) || ( !isRenewal && 'ACTIVE' ) ){
                    nlapiLogExecution('DEBUG', 'sub.getFieldValue(\'startdate\')', sub.getFieldValue('startdate'));
                    var invoice = bsCreateSubscriptionInvoice( sub.getFieldValue('startdate'), subID );
                    nlapiLogExecution('DEBUG', 'invoice id', invoice );
                }
                if( isAny == 'T' ){
                    if( effDate == '' ) effDate = today;
                    nlapiLogExecution('DEBUG', 'effDate', effDate);
                    var invoice = bsCreateSubscriptionInvoice( effDate, subID );
                    nlapiLogExecution('DEBUG', 'invoice id', invoice );
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