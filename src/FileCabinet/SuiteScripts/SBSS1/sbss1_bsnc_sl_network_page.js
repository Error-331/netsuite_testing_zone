/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       10 Dec 2020     Eugene Karakovsky
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function bsnNetworkPage(request, response){
    if ( request.getMethod() == 'GET' ){
        var type = request.getParameter('bsnc_type') || 'cloud';
        var netId = request.getParameter('bsnc_network');
        var netName = request.getParameter('bsnc_network_name');

        var form = nlapiCreateForm(netName + ' Network Info');
        var network = form.addField('bs_network', 'text', 'Network');
        network.setDefaultValue(netId);
        network.setDisplayType('hidden');
        var netType = form.addField('bs_nettype', 'checkbox', 'BSN.COM');
        netType.setDefaultValue(type == 'com' ? 'T' : 'F');
        netType.setDisplayType('hidden');
        var formType = form.addField('bs_formtype', 'text', 'Form Type');
        formType.setDefaultValue('netinfo');
        formType.setDisplayType('hidden');
        var selectField = form.addField('custpage_scriptfield', 'inlinehtml', 'Network');
        selectField.setDefaultValue('<style type="text/css">' +
            '.loader-overlay {\n' +
            '        width: 100%;\n' +
            '        height: 100%;\n' +
            '        background: center no-repeat rgba(0,0,0,0.1);\n' +
            '        z-index: 9002;\n' +
            '        position: fixed;\n' +
            '		text-align: center;' +
            '		display: table;' +
            '    }' +
            '.loader-text{display: table-cell;vertical-align: middle;font-weight:900;color:#4d5f79;}' +
            '.hide-actions{display: none;}' +
            '</style>' +
            '<script type="text/javascript">' +
            'jQuery(".uir-page-title-firstline h1").prepend("<img src=\'/core/media/media.nl?' + (type == 'com' ? 'id=2273102&c=3293628_SB1&h=006PFJV1yz07FgO7lTs3App71-awyaMg_GotMe8pH09hJhAR' : 'id=2273101&c=3293628_SB1&h=w2K4YcaJVjZcO78xGdt7g9CPmk5DYKj2BlCqzLG5Bd0ZT4cd') + '\' style=\'height:25px; margin: 5px 10px 0;\'/>");' +
            '/*var bsnActions = jQuery("#custpage_actions_bsn");' +
            'var bsncActions = jQuery("#custpage_actions_bsnc");' +
            'bsnActions.on("change", function(){ bsnActions.toggle(); });' +
            'bsncActions.on("change", function(){ bsncActions.toggle(); });' +
            '/*jQuery("body").prepend("<div class=\'loader-overlay\'><span class=\'loader-text\'>Loading...</span></div>");' +
            'jQuery( window ).on("load", function() {' +
            'setTimeout(function(){' +
            'var net = "' + network + '";' +
            'nlapiSetFieldValue( "bs_onload", "yes" );' +
            'if( !isNullorEmpty(em) && em != "null" ){' +
            'console.log("email: " + em);' +
            'console.log("net: " + net);' +
            'setWindowChanged(window, true); nlapiFieldChanged(null,"bs_purchaser_email");' +
            'if( !isNullorEmpty(net) && net != "null" ){setWindowChanged(window, true);nlapiFieldChanged(null,"bs_select_network");}' +
            '}' +
            'if( !isNullorEmpty(cus) && cus != "null" ){' +
            'console.log("customer: " + cus);' +
            'setWindowChanged(window, true);nlapiFieldChanged(null,"bs_customer");' +
            '}' +
            'nlapiSetFieldValue( "bs_onload", "" );' +
            'jQuery(".loader-overlay").fadeOut(1000);' +
            '}, 1000);'+
            '});*/' +
            '</script>');
        var netInfo = form.addField('custpage_netinfo', 'inlinehtml', 'Network Info');
        var log = form.addField('custpage_results_log', 'inlinehtml', 'Result Log');
        log.setLayoutType('normal', 'startcol');
        var stats = form.addField('custpage_results_stats', 'inlinehtml', 'Result Stats');
        stats.setLayoutType('normal', 'startcol');
        form.addField('bsnc_addsubs_results_log','inlinehtml', 'Result');
        //if( type != 'cloud' ) form.addButton('bsnc_convert_network_button', 'Convert BSN.com Network to BSN.cloud', "bsncConvertComToCloudOpen(" + netId + ", '" + type + "', '" + netName + "');");
        form.setScript('customscript_sb_bsn_connect');

        response.writePage( form );
    }
    else
        console.log("request: " + request +", response: " + response);
}