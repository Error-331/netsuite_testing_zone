/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       25 Dec 2020     Eugene Karakovsky
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function bsnSubscriptionScriptRunner(request, response){
    if ( request.getMethod() == 'GET' ){
        var parameters = request.getAllParameters();

        var subID = request.getParameter('custscript_sb_bsnc_subid');
        var scriptID = request.getParameter('custscript_sb_bsnc_script');
        var serials = request.getParameter('custscript_sb_bsnc_serials')||'';
        var isCleanup = request.getParameter('custscript_sb_bsnc_cleanup')||'F';
        var netID = request.getParameter('custscript_sb_bsnc_netid')||'';
        var netType = request.getParameter('custscript_sb_bsnc_net_type')||'';
        var sendEmails = request.getParameter('custscript_sb_bsnc_send_emails')||'F';

        nlapiLogExecution("DEBUG", "scriptID", scriptID);

        var status = 'ERROR';

        if( scriptID == 'customscript_sb_bsnc_subscription_to' ){
            var isTakeOver = request.getParameter('custscript_sb_bsnc_takeover');
            parameters = {
                custscript_sb_bsnc_subid: subID,
                custscript_sb_bsnc_takeover: isTakeOver,
            }
            status = nlapiScheduleScript(scriptID, 'customdeploy_sb_bsnc_subscription_to', parameters);
            nlapiLogExecution("DEBUG", "status", status);
        }

        if( scriptID == 'customscript_sb_bsnc_ss_subs_operations' ){
            var isSingle = request.getParameter('custscript_sb_bsnc_is_single_op');
            var toControl = request.getParameter('custscript_sb_bsnc_to_control')||'F';
            parameters = {
                custscript_sb_bsnc_subid_op: subID,
                custscript_sb_bsnc_is_single_op: isSingle,
                custscript_sb_bsnc_serials_op: serials,
                custscript_sb_bsnc_cleanup: isCleanup,
                custscript_sb_bsnc_netid: netID,
                custscript_sb_bsnc_net_type: netType,
                custscript_sb_bsnc_send_emails: sendEmails,
                custscript_sb_bsnc_to_control: toControl
            }
            if( isCleanup == 'T' )
                status = nlapiScheduleScript(scriptID, 'customdeploy_sb_bsnc_ss_subs_cleanup', parameters);
            else
                status = nlapiScheduleScript(scriptID, 'customdeploy_sb_bsnc_ss_subs_operations', parameters);
            nlapiLogExecution("DEBUG", "status", status);
        }

        if( scriptID == 'bsnc_ss_network_operations' ){
            var isSingle = request.getParameter('custscript_sb_bsnc_is_single_net');
            parameters = {
                custscript_sb_bsnc_subid_net: subID,
                custscript_sb_bsnc_is_single_net: isSingle
            }
            status = nlapiScheduleScript('customscript_' + scriptID, 'customdeploy_' + scriptID, parameters);
            nlapiLogExecution("DEBUG", "status", status);
        }

        if( scriptID == 'bsnc_ss_subscription_action' ){
            var isSingle = request.getParameter('custscript_sb_bsnc_is_single_sub');
            parameters = {
                custscript_sb_bsnc_subid_sub: subID,
                custscript_sb_bsnc_is_single_sub: isSingle
            }
            status = nlapiScheduleScript('customscript_' + scriptID, 'customdeploy_' + scriptID, parameters);
            nlapiLogExecution("DEBUG", "status", status);
        }

        if( scriptID == 'bsnc_ss_renewal_emails' ){
            var subtype = request.getParameter('custscript_sb_bsnc_subtype')||null;
            var period = request.getParameter('custscript_sb_bsnc_period')||null;
            parameters = {
                custscript_sb_bsnc_subtype: subtype,
                custscript_sb_bsnc_period: period
            }
            status = nlapiScheduleScript('customscript_' + scriptID, 'customdeploy_' + scriptID, parameters);
            nlapiLogExecution("DEBUG", "status", status);
        }

        switch( status ){
            case 'QUEUED': status = 'SUCCESS'; break;
            case 'INQUEUE': status = 'QUEUED'; break;
            case 'INPROGRESS': status = 'QUEUED'; break;
            case 'SCHEDULED': status = 'QUEUED'; break;
            default: break;
        }

        nlapiLogExecution("DEBUG", "response", JSON.stringify({status:status, subID:subID, parameters:JSON.stringify(parameters)}));
        response.write(JSON.stringify({status:status, subID:subID, parameters:JSON.stringify(parameters)}));
    }
    else
        console.log("request: " + request +", response: " + response);
}