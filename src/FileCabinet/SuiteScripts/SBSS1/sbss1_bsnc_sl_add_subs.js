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
function addSubsToNetwork(request, response){
    if ( request.getMethod() == 'GET' ){
        var customer = request.getParameter('bsnc_customer');
        var enduser = request.getParameter('bsnc_enduser');
        var adminEmail = request.getParameter('bsnc_email');
        var activityPeriod = request.getParameter('bsnc_activity_period') || 3;
        var renewalDate = request.getParameter('bsnc_renewal_date');
        var startDate = request.getParameter('bsnc_start_date');
        var anniversaryDate = request.getParameter('bsnc_anniversary_date');
        var subsCount = request.getParameter('bsnc_subs_count');
        var price = request.getParameter('bsnc_price');
        var isCustomPrice = request.getParameter('bsnc_custom_price')||'F';
        var network = request.getParameter('bsnc_network');
        var purchaseOrder = request.getParameter('bsnc_po');
        var billing = request.getParameter('bsnc_billing');
        var type = request.getParameter('bsnc_type') || 'cloud';

        var form = nlapiCreateForm(/*(type == 'com' ? 'BSN.com' : 'BSN.cloud') + */' Add Subscriptions');
        var purchaserEmail = form.addField('bsnc_addsubs_purchaser_email','email', 'Network Admin Email');
        purchaserEmail.setLayoutType('normal', 'startcol');
        purchaserEmail.setDefaultValue(adminEmail);
        purchaserEmail.setMandatory(true);
        var selectField = form.addField('custpage_selectfield', 'inlinehtml', 'Network');
        var customerField = form.addField('bsnc_addsubs_customer', 'select', 'Customer', 'customer');
        customerField.setDefaultValue(customer);
        customerField.setMandatory(true);
        var billingField = form.addField('bsnc_addsubs_billing_account','select', 'Billing Account'/*, 'billingaccount'*/);
        bsncFillBillingAccountsList( form, billingField, customer );
        if( billing ) billingField.setDefaultValue(billing);
        billingField.setMandatory(true);
        //billingField.setDisabled(true);
        var endUserField = form.addField('bsnc_addsubs_enduser', 'select', 'End User', 'customer');
        endUserField.setDefaultValue(enduser ? enduser : customer);
        //endUserField.setMandatory(true);
        /*
        var salesRepField = form.addField('bsnc_addsubs_salesrep','select', 'Sales Rep');
        bsncFillSalesRepList( form, salesRepField, customer );
        salesRepField.setMandatory(true);
        */
        var resellerEmail = form.addField('bsnc_addsubs_reseller_email','email', 'Reseller Email');
        resellerEmail.setDisplayType('hidden');
        var lowestDate = form.addField('bsnc_addsubs_lowest_date', 'date', 'Lowest Date');
        lowestDate.setDefaultValue(nlapiDateToString(new Date()));
        lowestDate.setDisplayType('hidden');
        var terminateDateField = form.addField('bsnc_addsubs_terminate_date','date', 'Terminate Date');
        terminateDateField.setDisplayType('hidden');
        var startDateField = form.addField('bsnc_addsubs_start_date','date', 'Effective Date');
        startDateField.setDefaultValue(startDate);
        startDateField.setMandatory(true);
        var anniversaryDateField = form.addField('bsnc_addsubs_anniversary_date','date', 'Renewal Date (Subscription End Date + 1d)');
        anniversaryDateField.setDefaultValue(anniversaryDate);
        anniversaryDateField.setMandatory(true);
        //anniversaryDateField.setDisabled(true);
        var periodField = form.addField('bsnc_addsubs_activity_period','select', 'Activity Period', 'customlist_bsn_activity_period');
        periodField.setDefaultValue(activityPeriod);
        periodField.setMandatory(true);
        /*if( type != 'com' ) */periodField.setDisplayType('hidden');
        var onLoad = form.addField('bs_onload', 'text', 'OnLoad');
        onLoad.setDefaultValue('');
        onLoad.setDisplayType('hidden');
        var netType = form.addField('bs_nettype', 'checkbox', 'BSN.COM');
        netType.setDefaultValue(type == 'com' ? 'T' : 'F');
        netType.setDisplayType('hidden');
        var defaultBilling = form.addField('defaultbillingaccount','text', 'Default Billing Account');
        defaultBilling.setDisplayType('hidden');
        var formAdd = form.addField('bsnc_form_add','text', 'Is Form Add');
        formAdd.setDefaultValue('yes');
        formAdd.setDisplayType('hidden');
        var countField = form.addField('bsnc_addsubs_count','text', 'Add Subscriptions Count');
        countField.setDefaultValue(subsCount);
        countField.setMandatory(true);
        var priceField = form.addField('bsnc_addsubs_price','text', 'Customer Price for 1 Sub');
        priceField.setDefaultValue(price);
        priceField.setMandatory(true);
        priceField.setDisabled(true);
        var customPriceField = form.addField('bsnc_addsubs_custom_price','checkbox', 'Custom Price');
        customPriceField.setDefaultValue(isCustomPrice);
        //customPriceField.setDisplayType('hidden');
        var isNotCoTermed = form.addField('bsnc_addsubs_is_not_cotermed','checkbox', 'Is Not Co-Termed');
        //isNotCoTermed.setDefaultValue('F');
        isNotCoTermed.setDisplayType('hidden');
        var customerPriceField = form.addField('bsnc_addsubs_cphandler','inlinehtml', 'Customer Price');
        customerPriceField.setDefaultValue('<input type="hidden" value="" name="bsnc_addsubs_customer_price" id="bsnc_addsubs_customer_price">');
        var po = form.addField('bsnc_addsubs_po','text', 'PO#');
        po.setDefaultValue(purchaseOrder);
        var onchange = 'this.isvalid=(nlapiValidateField(null,\'bsnc_addsubs_select_network\'));if (!this.isvalid) return false;if(!this.noslaving) { setWindowChanged(window, true); }if (getEventTarget(event)==this)this.focus();nlapiFieldChanged(null,\'bsnc_addsubs_select_network\');';
        selectField.setDefaultValue('<span class="uir-label" style="margin: 6px 0 0 0; display: inline-block;"><label for="bsnc_addsubs_select_network" class="smallgraytextnolink">NETWORK NAME</label><br><select id="bsnc_addsubs_select_network" name="bsnc_addsubs_select_network" onchange="' + onchange + '"><option value=""></option></select></span>' +
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
            '#bsnc_addsubs_count_fs:before {position: relative; content: "0+"; color:#999; padding: 2pt; background:#ddd;}' +
            '#bsnc_addsubs_count {padding-left: 16pt; margin-left: -14pt;}' +
            '#cocollapse {display: none}' +
            '</style>' +
            '<script type="text/javascript">' +
            'jQuery(".uir-page-title-firstline h1").prepend("<img src=\'/core/media/media.nl?' + (type == 'com' ? 'id=3523056&c=3293628_SB2&h=KQGHGSXr3encpzZ0Gxgk_MHg2jJbd0WdoBanJMP6gvrb_gyS' : 'id=3523057&c=3293628_SB2&h=QfeWqgUGqbmSNbe-LxGV4YswduiiT8btjCda73ULITKPfmtb') + '\' style=\'height:25px; margin: 5px 10px 0;\'/>");' +
            'jQuery("body").prepend("<div class=\'loader-overlay\'><span class=\'loader-text\'>Loading...</span></div>");' +
            'jQuery( window ).on("load", function() {' +
            'setTimeout(function(){' +
            'var em = "' + adminEmail + '";' +
            'var netBSNC = "' + network + '";' +
            'nlapiSetFieldValue( "bs_onload", "yes" );' +
            'if( !isNullorEmpty(em) && em != "null" ){' +
            'console.log("email: " + em);' +
            'console.log("netBSNC: " + netBSNC);' +
            'setWindowChanged(window, true); nlapiFieldChanged(null,"bsnc_addsubs_purchaser_email");' +
            'if( !isNullorEmpty(netBSNC) && netBSNC != "null" ){setWindowChanged(window, true);nlapiFieldChanged(null,"bsnc_addsubs_select_network");}' +
            '}' +
            'nlapiSetFieldValue( "bs_onload", "" );' +
            'jQuery(".loader-overlay").fadeOut(1000);' +
            '}, 1000);'+
            '});' +
            '</script>');

        var defaultNetwork = form.addField('bs_default_network', 'text', 'Default Network');
        defaultNetwork.setDefaultValue(network);
        defaultNetwork.setDisplayType('hidden');

        //form.addField('bsnc_addsubs_results_log','inlinehtml', 'Result');
        var netLog = form.addField('custpage_netinfo','inlinehtml', 'Network Info');
        netLog.setLayoutType('normal', 'startcol');
        var subLog = form.addField('custpage_subscription_info','inlinehtml', 'Subscription Info');
        subLog.setLayoutType('normal', 'startcol');

        //form.setScript('customscript_sbbsnc_soap');

        form.setScript('customscript_sb_bsn_connect');
        //form.addButton('bsnc_addsubs_review_numbers', 'Calculate Difference', "bsncAddSubsReviewNumbers();");
        form.addButton('bsnc_addsubs_button', 'Create Subscription Record', "bsncSBFormAddSubscriptionsSubmit();");

        //form.addSubmitButton('Submit');

        response.writePage( form );
    }
    else
        nlapiLogExecution("ERROR", "error","request: " + request +", response: " + response);
}

function bsncFillBillingAccountsList( form, field, customer ){
    var searchBillingAccounts = null;
    if(customer) {
        var res = [];
        var filters = [];
        filters.push(new nlobjSearchFilter('customer', null, 'is', customer));
        var columns = [];
        columns.push(new nlobjSearchColumn('name'));
        columns.push(new nlobjSearchColumn('customerdefault'));
        columns.push(new nlobjSearchColumn('startdate'));
        columns.push(new nlobjSearchColumn('frequency'));
        searchBillingAccounts = nlapiSearchRecord('billingaccount', null, filters, columns);
        nlapiLogExecution("DEBUG", "searchres", JSON.stringify(searchBillingAccounts));
    }
    if( searchBillingAccounts !== null ){
        for( var i = 0; i < searchBillingAccounts.length; i++ ){
            field.addSelectOption( searchBillingAccounts[i].getId(), searchBillingAccounts[i].getValue('name') + ' [Start:' + searchBillingAccounts[i].getValue('startdate') + ']' + '[' + searchBillingAccounts[i].getValue('frequency') + ']', searchBillingAccounts[i].getValue('customerdefault') == 'T' );
            //res.push({ 'id': searchBillingAccounts.getId(), 'name': searchBillingAccounts.getValue('name'), 'selected': searchBillingAccounts.getValue('customerdefault') == 'T' });
        }
    }
    form.addButton('bsnc_addsubs_billing', 'Create Billing Account', "createBillingAccount();");

    return res;
}

function bsncFillSalesRepList( form, field, customer ){
    var searchSalesReps = null;
    var customerSalesRep = '';
    if(customer) {
        var filters = [];
        filters.push(new nlobjSearchFilter('salesrep', null, 'is', 'T'));
        var columns = [];
        columns.push(new nlobjSearchColumn('firstname'));
        columns.push(new nlobjSearchColumn('lastname'));
        searchSalesReps = nlapiSearchRecord('employee', null, filters, columns);
        nlapiLogExecution("DEBUG", "searchres", JSON.stringify(searchSalesReps));
        customerSalesRep = nlapiLookupField( 'customer', customer, 'salesrep' );
    }
    if( searchSalesReps !== null ){
        for( var i = 0; i < searchSalesReps.length; i++ ){
            var salesRepId = searchSalesReps[i].getId();
            field.addSelectOption( salesRepId, searchSalesReps[i].getValue('firstname') + ' ' + searchSalesReps[i].getValue('lastname'), customerSalesRep == salesRepId );
        }
    }
}