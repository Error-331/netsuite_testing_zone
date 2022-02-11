/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       07 Aug 2018     Eugene Karakovsky
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function createNetwork(request, response){
    if ( request.getMethod() == 'GET' )
    {
        var adminEmail = request.getParameter('bsn_email');
        var networkBSN = request.getParameter('bsn_network');
        var networkBSNC = request.getParameter('bsnc_network');
        var renewalDate = request.getParameter('bsn_renewal_date');
        var bsIsDev = request.getParameter('isdev')||'F';
        var isPopup = request.getParameter('bsn_ispopup')||'';

        var form = nlapiCreateForm('BSN Network Management');
        form.addFieldGroup( "common_group", "Network Admin" );
        form.addFieldGroup( "bsn_group", "Networks" );
        var radioLabel = form.addField('custpage_radiolabel', 'inlinehtml', 'SELECT:', null, 'common_group');
        radioLabel.setDefaultValue('<label class="smallgraytextnolink" style="right:50px; float: right; margin: 0 50px 0 0; bottom: -60px; position:relative;"><span style="font-size:20px;font-weight:900; color:#AAA"><== OR ==></span></label><span class="uir-label" style="margin: 6px 0 0 0; display: inline-block;"><label class="smallgraytextnolink"><span style="font-size:25px;font-weight:900;">SELECT:</span></label></span>');
        radioLabel.setLayoutType('normal', 'startcol');
            form.addField('bsnc_cnet_network_type','radio', '.com', 'com', 'common_group');
            form.addField('bsnc_cnet_network_type','radio', '.cloud', 'cloud', 'common_group');
        var radioButton = form.addField('custpage_radiobutton', 'inlinehtml', 'button', null, 'common_group');
        radioButton.setDefaultValue('<br>' + buttonStart + '<input type="button" value="Create Network" id="bsn_create_network_button" name="bsn_create_network_button" onclick="try{ if (!!window) { var origScriptIdForLogging = window.NLScriptIdForLogging; var origDeploymentIdForLogging = window.NLDeploymentIdForLogging; window.NLScriptIdForLogging = \'customscript_sb_bsnc_create_network\'; window.NLDeploymentIdForLogging = \'customdeploy_sb_bsnc_create_network\'; }formCreateButtonSubmit();}finally{ if (!!window) { window.NLScriptIdForLogging = origScriptIdForLogging; window.NLDeploymentIdForLogging = origDeploymentIdForLogging; }}; return false;" class="rndbuttoninpt bntBgT" onmousedown="this.setAttribute(\'_mousedown\',\'T\'); setButtonDown(true, false, this);" onmouseup="this.setAttribute(\'_mousedown\',\'F\'); setButtonDown(false, false, this);" onmouseout="if(this.getAttribute(\'_mousedown\')==\'T\') setButtonDown(false, false, this);" onmouseover="if(this.getAttribute(\'_mousedown\')==\'T\') setButtonDown(true, false, this);" _mousedown="F">' + buttonEnd);
        //var testButton = form.addField('custpage_transferbutton', 'inlinehtml', 'button', null, 'common_group');
        //testButton.setDefaultValue('<br>' + buttonStart + '<input type="button" value="Transfer Network" id="bsn_transfer_network_button" name="bsn_transfer_network_button" onclick="try{ if (!!window) { var origScriptIdForLogging = window.NLScriptIdForLogging; var origDeploymentIdForLogging = window.NLDeploymentIdForLogging; window.NLScriptIdForLogging = \'customscript_sb_bsnc_transfer_network\'; window.NLDeploymentIdForLogging = \'customdeploy_sb_bsnc_transfer_network\'; }transferBSNSubscriptions();}finally{ if (!!window) { window.NLScriptIdForLogging = origScriptIdForLogging; window.NLDeploymentIdForLogging = origDeploymentIdForLogging; }}; return false;" class="rndbuttoninpt bntBgT" onmousedown="this.setAttribute(\'_mousedown\',\'T\'); setButtonDown(true, false, this);" onmouseup="this.setAttribute(\'_mousedown\',\'F\'); setButtonDown(false, false, this);" onmouseout="if(this.getAttribute(\'_mousedown\')==\'T\') setButtonDown(false, false, this);" onmouseover="if(this.getAttribute(\'_mousedown\')==\'T\') setButtonDown(true, false, this);" _mousedown="F">' + buttonEnd);
        var searchLabel = form.addField('custpage_searchlabel', 'inlinehtml', 'ENTER:', null, 'common_group');
        searchLabel.setDefaultValue('<span class="uir-label" style="margin: 6px 0 0 0; display: inline-block;"><label class="smallgraytextnolink"><span style="font-size:25px;font-weight:900;">ENTER:</span></label></span>');
        searchLabel.setLayoutType('normal', 'startcol');
        var emailField = form.addField('bsnc_cnet_network_admin','text', 'Admin Email, or Network Name', null, 'common_group');
        emailField.setDefaultValue(adminEmail);
        emailField.setMandatory(true);
        var searchButton = form.addField('custpage_searchbutton', 'inlinehtml', 'button', null, 'common_group');
        searchButton.setDefaultValue(
            '<br>' + buttonStart + '<input type="button" value="Search" id="bsn_search_network_button" name="bsn_search_network_button" onclick="try{ if (!!window) { var origScriptIdForLogging = window.NLScriptIdForLogging; var origDeploymentIdForLogging = window.NLDeploymentIdForLogging; window.NLScriptIdForLogging = \'customscript_sb_bsnc_create_network\'; window.NLDeploymentIdForLogging = \'customdeploy_sb_bsnc_create_network\'; }formSearchButtonSubmit();}finally{ if (!!window) { window.NLScriptIdForLogging = origScriptIdForLogging; window.NLDeploymentIdForLogging = origDeploymentIdForLogging; }}; return false;" class="rndbuttoninpt bntBgT" onmousedown="this.setAttribute(\'_mousedown\',\'T\'); setButtonDown(true, false, this);" onmouseup="this.setAttribute(\'_mousedown\',\'F\'); setButtonDown(false, false, this);" onmouseout="if(this.getAttribute(\'_mousedown\')==\'T\') setButtonDown(false, false, this);" onmouseover="if(this.getAttribute(\'_mousedown\')==\'T\') setButtonDown(true, false, this);" _mousedown="F">' + buttonEnd +
            ''
        );
        var isAdmin = nlapiGetRole() == 3;
        if( isAdmin ) {
            var toolsLabel = form.addField('custpage_toolslabel', 'inlinehtml', 'ENTER:', null, 'common_group');
            toolsLabel.setDefaultValue('<span class="uir-label" style="margin: 6px 0 0 0; display: inline-block;"><label class="smallgraytextnolink"><span style="font-size:25px;font-weight:900;">TOOLS:</span></label></span>');
            toolsLabel.setLayoutType('normal', 'startcol');
            var toolsButton = form.addField('custpage_toolsbutton', 'inlinehtml', 'button', null, 'common_group');
            toolsButton.setDefaultValue(
                '<br>' + buttonStart + '<input type="button" value="Initiate Invoices -> Subs Script" id="bsn_process_invoices_button" name="bsn_process_invoices_button" onclick="try{ if (!!window) { var origScriptIdForLogging = window.NLScriptIdForLogging; var origDeploymentIdForLogging = window.NLDeploymentIdForLogging; window.NLScriptIdForLogging = \'customscript_sb_bsnc_create_network\'; window.NLDeploymentIdForLogging = \'customdeploy_sb_bsnc_create_network\'; }formCreateSubsButtonSubmit();}finally{ if (!!window) { window.NLScriptIdForLogging = origScriptIdForLogging; window.NLDeploymentIdForLogging = origDeploymentIdForLogging; }}; return false;" class="rndbuttoninpt bntBgT" onmousedown="this.setAttribute(\'_mousedown\',\'T\'); setButtonDown(true, false, this);" onmouseup="this.setAttribute(\'_mousedown\',\'F\'); setButtonDown(false, false, this);" onmouseout="if(this.getAttribute(\'_mousedown\')==\'T\') setButtonDown(false, false, this);" onmouseover="if(this.getAttribute(\'_mousedown\')==\'T\') setButtonDown(true, false, this);" _mousedown="F">' + buttonEnd +
                '<br>' + buttonStart + '<input type="button" value="Initiate Invoices -> Email Script" id="bsn_process_invoices_email_button" name="bsn_process_invoices_email_button" onclick="try{ if (!!window) { var origScriptIdForLogging = window.NLScriptIdForLogging; var origDeploymentIdForLogging = window.NLDeploymentIdForLogging; window.NLScriptIdForLogging = \'customscript_sb_bsnc_create_network\'; window.NLDeploymentIdForLogging = \'customdeploy_sb_bsnc_create_network\'; }popupEmailSender();}finally{ if (!!window) { window.NLScriptIdForLogging = origScriptIdForLogging; window.NLDeploymentIdForLogging = origDeploymentIdForLogging; }}; return false;" class="rndbuttoninpt bntBgT" onmousedown="this.setAttribute(\'_mousedown\',\'T\'); setButtonDown(true, false, this);" onmouseup="this.setAttribute(\'_mousedown\',\'F\'); setButtonDown(false, false, this);" onmouseout="if(this.getAttribute(\'_mousedown\')==\'T\') setButtonDown(false, false, this);" onmouseover="if(this.getAttribute(\'_mousedown\')==\'T\') setButtonDown(true, false, this);" _mousedown="F">' + buttonEnd
            );
        }
        /*
        var renewalField = form.addField('bsnc_cnet_renewal_date','date', 'Renewal Date');
        renewalField.setDefaultValue(renewalDate);
        renewalField.setMandatory(true);*/
        var defaultNetworkBSNC = form.addField('bs_default_network', 'text', 'Default Network BSN.cloud');
        defaultNetworkBSNC.setDefaultValue(networkBSNC);
        defaultNetworkBSNC.setDisplayType('hidden');
        var defaultNetworkBSN = form.addField('bsn_default_network', 'text', 'Default Network BSN');
        defaultNetworkBSN.setDefaultValue(networkBSN);
        defaultNetworkBSN.setDisplayType('hidden');
        var onLoad = form.addField('bs_onload', 'text', 'OnLoad');
        onLoad.setDefaultValue('');
        onLoad.setDisplayType('hidden');
        var isDev = form.addField('bs_isdev', 'checkbox', 'IsDev');
        isDev.setDefaultValue(bsIsDev);
        isDev.setDisplayType('hidden');
        var isPopupField = form.addField('bs_ispopup', 'text', 'Is Popup');
        isPopupField.setDefaultValue(isPopup);
        isPopupField.setDisplayType('hidden');

        var bsncNetworkField = form.addField('custpage_selectfield', 'inlinehtml', 'Network', null, 'bsn_group');
        bsncNetworkField.setDefaultValue('<div class="uir-label" style="margin: 6px 0 0 0; display: inline-block;"><label for="bsnc_cnet_select_network" class="smallgraytextnolink"><img src="/core/media/media.nl?id=3523057&c=3293628_SB2&h=QfeWqgUGqbmSNbe-LxGV4YswduiiT8btjCda73ULITKPfmtb" style="width:100px; margin: 15px 0;"/><br>BSN.cloud NETWORK NAME</label><br><select id="bsnc_cnet_select_network" name="bsnc_cnet_select_network" onchange="setWindowChanged(window, true);nlapiFieldChanged(null,\'bsnc_cnet_select_network\');"><option value=""></option></select><div id="bsnc_error"></div></span>' +
            '<style type="text/css">' +
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
            '</style>' +
            '<script type="text/javascript">' +
            'jQuery("body").prepend("<div class=\'loader-overlay\'><span class=\'loader-text\'>Loading...</span></div>");' +
            'jQuery( window ).on("load", function() {' +
            'setTimeout(function(){' +
            'var em = "' + adminEmail + '";' +
            'var netBSN = "' + networkBSN + '";' +
            'var netBSNC = "' + networkBSNC + '";' +
            'nlapiSetFieldValue( "bs_onload", "yes" );' +
            'if( !isNullorEmpty(em) && em != "null" ){' +
            'console.log("email: " + em);' +
            'console.log("netBSN: " + netBSN);' +
            'console.log("netBSNC: " + netBSNC);' +
            'setWindowChanged(window, true); nlapiFieldChanged(null,"bsnc_cnet_network_admin");' +
            'if( !isNullorEmpty(netBSN) && netBSN != "null" ){setWindowChanged(window, true);nlapiFieldChanged(null,"bsn_cnet_select_network");}' +
            'if( !isNullorEmpty(netBSNC) && netBSNC != "null" ){setWindowChanged(window, true);nlapiFieldChanged(null,"bsnc_cnet_select_network");}' +
            '}' +
            'if(nlapiGetFieldValue( "bs_onload") != "loading"){ nlapiSetFieldValue( "bs_onload", "" );' +
            'jQuery(".loader-overlay").fadeOut(1000);}' +
            '}, 1000);'+
            '});' +
            '</script>');
        bsncNetworkField.setLayoutType('normal', 'startcol');

        var netInfo = form.addField('custpage_netinfo', 'inlinehtml', 'Network Info', null, 'bsn_group');

        var bsnNetworkField = form.addField('custpage_selectfield1', 'inlinehtml', 'Network', null, 'bsn_group');
        bsnNetworkField.setDefaultValue('<span class="uir-label" style="margin: 6px 0 0 0; display: inline-block;"><label for="bsn_cnet_select_network" class="smallgraytextnolink"><img src="/core/media/media.nl?id=3523056&c=3293628_SB2&h=KQGHGSXr3encpzZ0Gxgk_MHg2jJbd0WdoBanJMP6gvrb_gyS" style="width:100px; margin: 15px 0;"/><br>BSN NETWORK NAME</label><br><select id="bsn_cnet_select_network" name="bsn_cnet_select_network" onchange="setWindowChanged(window, true);nlapiFieldChanged(null,\'bsn_cnet_select_network\');"><option value=""></option></select><div id="bsn_error"></div></span>');
        bsnNetworkField.setLayoutType('normal', 'startcol');
        var netInfoBSN = form.addField('custpage_netinfo_bsn', 'inlinehtml', 'Network Info', null, 'bsn_group');
        var extraInfo = form.addField('custpage_extrainfo', 'inlinehtml', 'Extra Info', null, 'bsn_group');
        form.setScript('customscript_sb_bsn_connect');
        //form.addButton('bsn_create_network_button', 'Create BSN Network', "bsnFormCreateNetworkSubmit();");
        //form.addButton('bsnc_create_network_button', 'Create BSN.cloud Network', "bsncFormCreateNetworkSubmit();");

        response.writePage( form );
    }
    else
        console.log("request: " + request +", response: " + response);
}