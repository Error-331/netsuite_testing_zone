/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       21 Aug 2018     Eugene Karakovsky
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function getNetworkName(request, response){
    if ( request.getMethod() == 'GET' )
    {
        var linenum = request.getParameter('linenum');
        var networkAdmin = request.getParameter('networkadmin');
        var activityPeriod = request.getParameter('activityperiod');
        var renewalDate = request.getParameter('renewaldate');
        var startDate = request.getParameter('startdate');
        var normalize = request.getParameter('normalize');
        var emails = networkAdmin.split(",");
        var emailOptions = "";
        for( var i = 0; i < emails.length; i++ ){
            emailOptions += '<option value="' + emails[i] + '">' + emails[i] + '</option>';
        }
        //var customerId = 123628;
        var form = nlapiCreateForm('Get BSN.cloud Network Name');
        //var field = form.addField('bs_network_name','text', 'Network Name');
        var field = form.addField('custpage_networkadmin', 'inlinehtml', 'Network Admin');
        field.setLayoutType('normal', 'startcol');
        field.setDefaultValue('<label for="bsnc_getname_network_admin">NETWORK ADMIN</label><br><select id="bsnc_getname_network_admin" name="bsnc_getname_network_admin" onchange="setWindowChanged(window, true);nlapiFieldChanged(null,\'bsnc_getname_network_admin\');">' + emailOptions + '</select>');
        var selectField = form.addField('custpage_selectfield', 'inlinehtml', 'Network');
        selectField.setDefaultValue('<br><label for="bsnc_getname_select_network">NETWORK NAME</label><br>' +
            '<select id="bsnc_getname_select_network" name="bsnc_getname_select_network" onchange="setWindowChanged(window, true);nlapiFieldChanged(null,\'bsnc_getname_select_network\');"><option value=""></option></select>' +
            '<div id="bsnc_getname_network_info">' + '</div>' +
            '<input type="hidden" id="bsnc_getname_linenum" name="bsnc_getname_linenum" value="' + linenum + '">' +
            '<input type="hidden" id="bsnc_getname_activity_period" name="bsnc_getname_activity_period" value="' + activityPeriod + '">' +
            '<input type="hidden" id="bsnc_getname_start_date" name="bsnc_getname_start_date" value="' + startDate + '">' +
            '<input type="hidden" id="bsnc_getname_renewal_date" name="bsnc_getname_renewal_date" value="' + renewalDate + '">');
        form.addField('bsnc_getname_results_log','inlinehtml', 'Result');
        form.setScript('customscript_bsnc_soap');
        if( normalize ){
            form.addButton('bsnc_getname_test_network_button', 'Test Network', "bsncNormalizeTestNetwork();");
            form.addButton('bsnc_getname_use_network_button', 'Use Network', "bsncNormalizeUseNetwork();");
        } else {
            form.addButton('bsnc_getname_use_network_button', 'Save', "bsncUseSelectedNetwork();");
        }
        //form.addSubmitButton('Submit');

        response.writePage( form );
    }
    else
        console.log("request: " + request +", response: " + response);
}