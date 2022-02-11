/* used to connect both BSN and BSN.cloud libraries */
function bsnCreateFormReload( methodUsage ){
    var usage = nlapiGetContext().getRemainingUsage();
    console.log( 'usage0: ' + usage );
    if( usage - methodUsage < 1 ){
        bsnCreateNetworkFormReload();
    }
}

function bsnCreateNetworkFormReload(){
    var purchaserEmail = nlapiGetFieldValue('bsnc_cnet_network_admin');
    var networkIdBSN = nlapiGetFieldValue('bsn_cnet_select_network');
    var networkIdBSNC = nlapiGetFieldValue('bsnc_cnet_select_network');
    var isPopup = nlapiGetFieldValue('bs_ispopup');
    var suitelet = nlapiResolveURL('SUITELET', 'customscript_sb_bsnc_create_network', 'customdeploy_sb_bsnc_create_network');
    var add = '';
    add += '&bsn_email=' + purchaserEmail;
    add += '&bsn_network=' + networkIdBSN;
    add += '&bsnc_network=' + networkIdBSNC;
    add += '&bsn_ispopup=' + isPopup;
    console.log("=================suitelet=================\n" + suitelet + add);
    setWindowChanged(window, false);
    window.location = suitelet + add;
}

function sbReloadAddSubsForm(){
    if (!isNullorEmpty(nlapiGetFieldValue('bs_onload'))) {
        var isCom = nlapiGetFieldValue( 'bs_nettype' ) == 'T';
        var customer = nlapiGetFieldValue('bsnc_addsubs_customer');
        var enduser = nlapiGetFieldValue('bsnc_addsubs_enduser');
        var email = nlapiGetFieldValue('bsnc_addsubs_purchaser_email');
        var startdate = nlapiGetFieldValue('bsnc_addsubs_start_date');
        var enddate = nlapiGetFieldValue('bsnc_addsubs_anniversary_date');
        var billing = nlapiGetFieldValue('bsnc_addsubs_billing_account');
        var count = nlapiGetFieldValue('bsnc_addsubs_count');
        var networkId = nlapiGetFieldValue('bsnc_addsubs_select_network');
        var po = nlapiGetFieldValue('bsnc_addsubs_po');
        var suitelet = nlapiResolveURL('SUITELET', 'customscript_sb_bsnc_add_subs', 'customdeploy_sb_bsnc_add_subs');
        var add = '';
        add += '&bsnc_customer=' + customer;
        add += '&bsnc_enduser=' + enduser;
        add += '&bsnc_email=' + email;
        add += '&bsnc_start_date=' + startdate;
        add += '&bsnc_anniversary_date=' + enddate;
        add += '&bsnc_billing=' + billing;
        add += '&bsnc_subs_count=' + count;
        add += '&bsnc_network=' + networkId;
        add += '&bsnc_po=' + po + '&';
        if( isCom ) add += '&bsnc_type=com';
        console.log("=================suitelet=================\n" + suitelet + add);
        setWindowChanged(window, false);
        window.location = suitelet + add;
    }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function bsnConnectInit(type){
    if( nlapiGetFieldValue( 'bs_formtype' ) == 'netinfo' ) {
        var networkId = nlapiGetFieldValue('bs_network');
        var networkType = nlapiGetFieldValue('bs_nettype');
        if (!isNullorEmpty(networkId) && networkType == 'T') {
            bsnNetInfo(networkId);
        } else {
            bsncNetInfo(networkId);
        }
    }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */
function bsnConnectFieldChanged(type, name) {
    console.log('changed: ' + name);
    if (name == 'bsnc_addsubs_customer') {
        var isCom = nlapiGetFieldValue( 'bs_nettype' ) == 'T';
        var customerId = nlapiGetFieldValue('bsnc_addsubs_customer');

        if( !isNullorEmpty(customerId) ){
            var purchaserEmail = nlapiGetFieldValue('bsnc_addsubs_purchaser_email');
            var resellerEmail = nlapiGetFieldValue('bsnc_addsubs_reseller_email');
            if( isNullorEmpty( purchaserEmail ) ){
                purchaserEmail = nlapiLookupField('customer', customerId, 'email');
                nlapiSetFieldValue('bsnc_addsubs_purchaser_email', purchaserEmail);
                var networks = [];
                if( isCom ){
                    networks = soapGetNetworksByCustomerEmail(purchaserEmail);
                } else {
                    networks = soapGetNetworksByCustomerEmailBSNC(purchaserEmail);
                }
                jQuery('#bsnc_addsubs_select_network').html('');
                for (var i = 0; i < networks.length; i++){
                    jQuery('#bsnc_addsubs_select_network').append('<option value="' + networks[i][0] + '"' + networks[i][2] + '>' + networks[i][1] + '</option>');
                }
                console.log(networks);
            }
            if( isNullorEmpty( resellerEmail ) ){
                resellerEmail = nlapiLookupField('customer', customerId, 'custentity_bs_email_address');
                nlapiSetFieldValue('bsnc_addsubs_reseller_email', resellerEmail);
            }
            var endUser = nlapiGetFieldValue( 'bsnc_addsubs_enduser' );
            if( isNullorEmpty( endUser ) ){
                nlapiSetFieldValue( 'bsnc_addsubs_enduser', customerId );
            }

            nlapiSetFieldValue( "bs_onload", "yes" );
            sbReloadAddSubsForm();

            if(dropdowns && dropdowns.bsnc_addsubs_billing_account2 && dropdowns.bsnc_addsubs_billing_account2.valueArray[0] == ""){
                noBillingAccount( true );
            }
        }
    }

    if (name == 'bsnc_addsubs_purchaser_email') {
        var isCom = nlapiGetFieldValue( 'bs_nettype' ) == 'T';
        var purchaserEmail = nlapiGetFieldValue('bsnc_addsubs_purchaser_email');
        jQuery('#bsnc_addsubs_select_network').html('');
        if( !isNullorEmpty( purchaserEmail ) ){
            var networks = [];
            if( isCom ){
                networks = soapGetNetworksByCustomerEmail(purchaserEmail);
            } else {
                networks = soapGetNetworksByCustomerEmailBSNC(purchaserEmail);
            }
            if( isNullorEmpty(networks.error) ) {
                for (var i = 0; i < networks.networks.length; i++) {
                    /*TODO: fix no default selected network*/
                    jQuery('#bsnc_addsubs_select_network').append('<option value="' + networks.networks[i][0] + '"' + networks.networks[i][2] + '>' + networks.networks[i][1] + '</option>');
                    if( networks.networks[i][2] == "selected" ) bsNetworkSelected();
                }
            } else {
                bsnMessage( 'BSN Connection', networks.error, 'error' );
            }
            console.log(networks);
        }
    }

    if (name == 'bsnc_addsubs_select_network') {
        if( isNullorEmpty(nlapiGetFieldValue('bs_onload')) ) {
            nlapiSetFieldValue("bs_onload", "yes");
            sbReloadAddSubsForm();
        } else {
            //bsNetworkSelected();
        }
    }

    if( name == 'bsnc_addsubs_custom_price' ){
        var isCom = nlapiGetFieldValue( 'bs_nettype' ) == 'T';
        var customer = nlapiGetFieldValue('bsnc_addsubs_customer');
        var networkId = nlapiGetFieldValue('bsnc_addsubs_select_network');
        var editedPrice = nlapiGetFieldValue('bsnc_addsubs_price');
        var customerPrice = nlapiGetFieldValue('bsnc_addsubs_customer_price');
        var customPriceCheck = nlapiGetFieldValue('bsnc_addsubs_custom_price');

        if( customPriceCheck === 'F' ){
            var customerPrice = sbGetCustomerPrice( customer, networkId, isCom );
            console.log(customerPrice);
            if( customerPrice !== null ){
                nlapiSetFieldValue('bsnc_addsubs_price', customerPrice);
            }
            nlapiDisableField('bsnc_addsubs_price', true);
        } else {
            nlapiDisableField('bsnc_addsubs_price', false);
        }
    }

    if( name == 'bsnc_addsubs_price' ){
        var editedPrice = nlapiGetFieldValue('bsnc_addsubs_price');
        var customerPrice = nlapiGetFieldValue('bsnc_addsubs_customer_price');
        var customPriceCheck = nlapiGetFieldValue('bsnc_addsubs_custom_price');
        if( parseInt(editedPrice) > 0 ){
            console.log("editedPrice === customerPrice: " + (editedPrice === customerPrice));
            if( editedPrice === customerPrice ){
                if( customPriceCheck === 'T' ) {
                    nlapiSetFieldValue('bsnc_addsubs_custom_price', 'F');
                }
                var terminateDate = nlapiGetFieldValue('bsnc_addsubs_terminate_date');
                if( customPriceCheck === 'T' && isNullorEmpty( terminateDate ) ) {
                    nlapiDisableField('bsnc_addsubs_price', true);
                }
            } else {
                nlapiSetFieldValue('bsnc_addsubs_custom_price', 'T');
                nlapiDisableField('bsnc_addsubs_price', false);
            }
        }
        console.log(nlapiGetFieldValue('bsnc_addsubs_price'));
        console.log(nlapiGetFieldValue('bsnc_addsubs_customer_price'));
        console.log(nlapiGetFieldValue('bsnc_addsubs_custom_price'));
        console.log(nlapiGetFieldValue('bsnc_addsubs_terminate_date'));
    }

    if (name == 'defaultbillingaccount') {
        sbReloadAddSubsForm();
    }

    if (name == 'bsnc_cnet_network_admin') {
        if( nlapiGetFieldValue("bs_onload") == "yes" ){
            nlapiSetFieldValue("bs_onload", "loading");
            formSearchButtonSubmit();
        }
    }

    if( name == 'bsnc_cnet_select_network' ) {
        bsnPrintNetworkData(false);
    }

    if( name == 'bsn_cnet_select_network' ) {
        bsnPrintNetworkData(true);
    }
}

function bsNetworkSelected(){
    var isCom = nlapiGetFieldValue( 'bs_nettype' ) == 'T';
    var customer = nlapiGetFieldValue('bsnc_addsubs_customer');
    var networkId = nlapiGetFieldValue('bsnc_addsubs_select_network');
    var activityPeriod = 1;
    var itemId = isCom ? sbBSNSettings.bsn1yrItemNum : sbBSNSettings.bsnc1yrItemNum;

    if( isNullorEmpty( networkId ) ){
        nlapiSetFieldValue('bsnc_addsubs_activity_period', 1);
        nlapiSetFieldValue('bsnc_addsubs_anniversary_date', '');
        nlapiSetFieldValue('bsnc_addsubs_customer_price', '');
        nlapiSetFieldValue('bsnc_addsubs_price', '');
    } else {
        var networkInfo = {};
        if( isCom ) {
            networkInfo = soapGetNetworkById(networkId);
        } else {
            networkInfo = soapGetNetworkByIdBSNC(networkId);
        }
        console.log('networkInfo\n' + JSON.stringify(networkInfo));
        switch( networkInfo.SubscriptionsActivityPeriod ){
            case 'P365D': activityPeriod = 3; itemId = isCom ? sbBSNSettings.bsn1yrItemNum : sbBSNSettings.bsnc1yrItemNum; break;
            default: ;//alert("Network has non-standard Activity Period. It must be changed to standard first or use another Network.");
        }
        nlapiSetFieldValue('bsnc_addsubs_activity_period', /*activityPeriod*/3);

        var networkRenewalDate = moment(parseSOAPDateBSNC( networkInfo.SubscriptionsRenewalDate ));

        console.log('networkRenewalDate\n' + networkRenewalDate.toDate());
        if( networkRenewalDate ){
            if( networkInfo.isContent || isCom ){
                nlapiSetFieldValue('bsnc_addsubs_anniversary_date', nlapiDateToString( networkRenewalDate.toDate() ));
            } else {
                nlapiSetFieldValue('bsnc_addsubs_anniversary_date', nlapiDateToString( moment().add(1, 'year').toDate() ));
            }
        } else {
            nlapiSetFieldValue('bsnc_addsubs_anniversary_date', '');
        }
        console.log('isContent ' + networkInfo.isContent);
        console.log('bsnc_addsubs_anniversary_date\n' + nlapiGetFieldValue('bsnc_addsubs_anniversary_date'));

        var customerPriceLevel = null;
        var isCustomerSupport = false;

        if( isCom )
            bsAddSubsFillSubscriptionListBSN( networkId );
        else
            bsAddSubsFillSubscriptionList( networkId );


        var billingAccount = null;
        var subEndUser = "";
        if( !isNullorEmpty( customer ) ){
            var customerRecord = nlapiLoadRecord( 'customer', customer );
            customerPriceLevel = customerRecord.getFieldValue('pricelevel');
            console.log('prclvl ' + customerPriceLevel);
            isCustomerSupport = customerRecord.getFieldValue('custentity_bs_support_customer') == 'T';
            var subscription = bsGetSubscriptionByNetid( networkId, customer, isCom ? netTypeCom : netTypeCloud );
            console.log('tr1');
            console.log(subscription);
            bsGetSubscriptionInfo( subscription.subId );
            billingAccount = subscription.billingAccount;
            subEndUser = subscription.endUser;
        }
        var customerPrices = bsncGetPriceLevels( itemId );
        var newPrice = 0;
        if( !isCustomerSupport ) {
            if (!isNullorEmpty(customerPriceLevel)) {
                if (!isNullorEmpty(customerPrices[customerPriceLevel])) {
                    newPrice = customerPrices[customerPriceLevel];
                } else {
                    if (!isNullorEmpty(customerPrices[1])) { //base price
                        newPrice = customerPrices[1];
                    }
                }
            } else {
                if (!isNullorEmpty(customerPrices[1])) { //base price
                    newPrice = customerPrices[1];
                }
            }
        }

        nlapiSetFieldValue('bsnc_addsubs_customer_price', newPrice);
        nlapiSetFieldValue('bsnc_addsubs_price', newPrice);
        nlapiSetFieldValue('bsnc_addsubs_enduser', subEndUser);

        if( !isNullorEmpty( billingAccount ) ) {
            nlapiSetFieldValue('bsnc_addsubs_billing_account', billingAccount);
            console.log('billingAccount: ' + billingAccount);
        }
    }

    if(customer && dropdowns && dropdowns.bsnc_addsubs_billing_account2 && dropdowns.bsnc_addsubs_billing_account2.valueArray[0] == ""){
        noBillingAccount( true );
    }
}

function sbGetCustomerPrice( customer, networkId, isCom ){
    var newPrice = 0;
    if( !isNullorEmpty( customer ) ){
        var customerRecord = nlapiLoadRecord( 'customer', customer );
        customerPriceLevel = customerRecord.getFieldValue('pricelevel');
        isCustomerSupport = customerRecord.getFieldValue('custentity_bs_support_customer') == 'T';
        var subscription = bsGetSubscriptionByNetid( networkId, customer, isCom ? netTypeCom : netTypeCloud );
        console.log('tr2');
        if( subscription !== -1 ) {
            var subInfo = bsGetSubscriptionInfo(subscription.subId);
            if (subInfo.price !== null) {
                newPrice = subInfo.price;
                isCustomerSupport = true;
            }
        }

        if( !isCustomerSupport ) {
            var itemId = isCom ? sbBSNSettings.bsn1yrItemNum : sbBSNSettings.bsnc1yrItemNum;
            var customerPrices = bsncGetPriceLevels( itemId );
            if (!isNullorEmpty(customerPriceLevel)) {
                if (!isNullorEmpty(customerPrices[customerPriceLevel])) {
                    newPrice = customerPrices[customerPriceLevel];
                } else {
                    if (!isNullorEmpty(customerPrices[1])) { //base price
                        newPrice = customerPrices[1];
                    }
                }
            } else {
                if (!isNullorEmpty(customerPrices[1])) { //base price
                    newPrice = customerPrices[1];
                }
            }
        }
    }

    return newPrice;
}

function searchSubmittedEmail(){
    var purchaserEmail = nlapiGetFieldValue('bsnc_cnet_network_admin');
    hideAlertBox('network_dups_found');
    jQuery('#bsn_cnet_select_network').html('');
    jQuery('#bsnc_cnet_select_network').html('');
    if( !isNullorEmpty( purchaserEmail ) ){
        var extra = '';
        var networksBSN = soapGetNetworksByCustomerEmail(purchaserEmail);
        var networksBSNC = soapGetNetworksByCustomerEmailBSNC(purchaserEmail);
        if( isNullorEmpty(networksBSN.error) ) {
            jQuery('#bsn_cnet_select_network').show();
            jQuery('#bsn_error').text('');
            for (var i = 0; i < networksBSN.networks.length; i++) {
                jQuery('#bsn_cnet_select_network').append('<option value="' + networksBSN.networks[i][0] + '"' + networksBSN.networks[i][2] + '>' + networksBSN.networks[i][1] + '</option>');
            }
        } else {
            jQuery('#bsn_cnet_select_network').hide();
            jQuery('#bsn_error').html('<br>' + networksBSN.error);
        }
        if( isNullorEmpty(networksBSNC.error) ) {
            jQuery('#bsnc_cnet_select_network').show();
            jQuery('#bsnc_error').text('');
            var k = 0;
            for (i = 0; i < networksBSNC.networks.length; i++) {
                jQuery('#bsnc_cnet_select_network').append('<option value="' + networksBSNC.networks[i][0] + '"' + networksBSNC.networks[i][2] + '>' + networksBSNC.networks[i][1] + '</option>');
                var dup = search(networksBSNC.networks[i][1], networksBSN.networks, 1);
                if (dup != -1) {
                    if( k ) extra += ', ';
                    k++;
                    extra += '<a href="#" onclick="nlapiSetFieldValue(\'bsnc_cnet_network_admin\', \'' + networksBSNC.networks[i][1] + '\'); formSearchButtonSubmit(); return false;">' + networksBSNC.networks[i][1] + "</a>";
                }
            }
        } else {
            jQuery('#bsnc_cnet_select_network').hide();
            jQuery('#bsnc_error').html('<br>' + networksBSNC.error);
        }
        console.log("networksBSN:\n" + JSON.stringify(networksBSN));
        console.log("networksBSNC:\n" + JSON.stringify(networksBSNC));
        jQuery('#custpage_netinfo_fs').html('');
        jQuery('#custpage_netinfo_bsn_fs').html('');
        setWindowChanged(window, false)
        nlapiFieldChanged(null,"bsnc_cnet_select_network");
        nlapiFieldChanged(null,"bsn_cnet_select_network");
        if( !isNullorEmpty( extra ) ){
            showAlertBox('network_dups_found', 'Networks with same names found', 'We have found that both BSN and BSN.cloud have similarly named networks for this Admin Email:<br><b>' + extra + '</b>', NLAlertDialog.TYPE_MEDIUM_PRIORITY);
        }
        //jQuery('#custpage_extrainfo_fs').html(extra);
    }
}

function searchSubmittedName( networkName ){
    if( networkName ) {
        var networkBSNC = soapGetNetworkByNameBSNC( networkName );
        console.log( networkBSNC );
        var networkBSN = soapGetNetworkByName( networkName );
        console.log( networkBSN );

        hideAlertBox('network_dups_found');
        jQuery('#custpage_netinfo_fs').html('');
        jQuery('#custpage_netinfo_bsn_fs').html('');
        jQuery('#bsn_cnet_select_network').html('');
        jQuery('#bsnc_cnet_select_network').html('');
        if( !networkBSNC.IsError ){
            jQuery('#bsnc_cnet_select_network').show();
            jQuery('#bsnc_error').text('');
            jQuery('#bsnc_cnet_select_network').append('<option value="' + networkBSNC.Id + '" selected>' + networkBSNC.Name + '</option>');
        } else {
            jQuery('#bsnc_cnet_select_network').hide();
            jQuery('#bsnc_error').html('<br>' + networkBSNC.Message);
        }
        if( !networkBSN.IsError ) {
            jQuery('#bsn_cnet_select_network').show();
            jQuery('#bsn_error').text('');
            jQuery('#bsn_cnet_select_network').append('<option value="' + networkBSN.Id + '" selected>' + networkBSN.Name + '</option>');
        } else {
            jQuery('#bsn_cnet_select_network').hide();
            jQuery('#bsn_error').html('<br>' + networkBSN.Message);
        }
        setWindowChanged(window, false)
        nlapiFieldChanged(null,"bsnc_cnet_select_network");
        nlapiFieldChanged(null,"bsn_cnet_select_network");
    }
}

function bsncSBFormAddSubscriptionsSubmit(){
    var isCom = nlapiGetFieldValue( 'bs_nettype' );
    var isNotCoTermed = nlapiGetFieldValue( 'bsnc_addsubs_is_not_cotermed' );
    if( isNotCoTermed == 'T' ){
        Ext.MessageBox.show({title : 'ERROR', msg : 'Selected Network is not Co-Termed!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    } else {
        /*ToDo: Check if Subscriptions exist for other users, then compare dates. (Can use Invoice IDs on Subscriptions and the Search for Subs by netId). Show confirmation with info.*/
        if( isCom == 'T' ){
            bsncAddSubscriptionsSubmit();
        } else {
            bsncAddSubscriptionsSubmitBSNC();
        }
    }
}

function bsncSBFormUpdateSubscriptionsSubmit(){
    var isCom = nlapiGetFieldValue( 'bs_nettype' );
    var isNotCoTermed = nlapiGetFieldValue( 'bsnc_addsubs_is_not_cotermed' );
    if( isNotCoTermed == 'T' ){
        Ext.MessageBox.show({title : 'ERROR', msg : 'Selected Network is not Co-Termed!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    } else {
        if (isCom == 'T') {
            bsncUpdateSubscriptionsSubmit();
        } else {
            bsncUpdateSubscriptionsSubmitBSNC();
        }
    }
}

function formCreateButtonSubmit(){
    switch( nlapiGetFieldValue('bsnc_cnet_network_type') ){
        case 'com': bsnFormCreateNetworkSubmit(); break;
        case 'cloud': bsncFormCreateNetworkSubmit(); break;
        default: return;
    }
}

function formSearchButtonSubmit(){
    jQuery("body").prepend("<div class='loader-overlay'><span class='loader-text'>Loading...</span></div>");
    setTimeout(function() {
        var searchVal = nlapiGetFieldValue('bsnc_cnet_network_admin');
        if (searchVal.search('@') == -1) {
            searchSubmittedName(searchVal);
        } else {
            searchSubmittedEmail(searchVal);
        }
        nlapiSetFieldValue("bs_onload", "");
        jQuery(".loader-overlay").fadeOut(1000);
    }, 1000);
}

function bsnFormCreateNetworkSubmit(){
    var networkAdmin = nlapiGetFieldValue('bsnc_cnet_network_admin');

    if( networkAdmin.search('@') == -1 ){
        networkAdmin = '';
    }

    var oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    jQuery(".loader-overlay").fadeIn(1000);
    var win = new Ext.Window ({
        title:'Create BSN.com Network',
        layout:'form',
        width:400,
        closable: false,
        closeAction:'close',
        target : document.getElementById('buttonId'),
        plain: true,

        items: [{
            xtype : 'textfield',
            fieldLabel: 'Network Admin',
            name: 'admin',
            id: 'admin',
            vtype: 'email',
            value: networkAdmin
        },{
            xtype : 'textfield',
            fieldLabel: 'Network Name',
            name: 'pop_name',
            id: 'pop_name'
        },/*{
            xtype:'combo',
            fieldLabel:'Activity Period',
            name:'period',
            id:'period',
            valueField: 'value',
            queryMode:'local',
            store:['Monthly', 'Quarterly', 'Annual'],
            displayField:'name',
            autoSelect:true,
            triggerAction: 'all',
            editable: false,
            forceSelection:true
        },*/{
            xtype : 'datefield',
            fieldLabel: 'Renewal Date',
            name: 'date',
            id: 'date',
            value: oneYearFromNow
        }],

        buttons: [{
            text: 'Create',
            handler: function(){
                var networkAdmin = jQuery("#admin").val();
                var networkName = jQuery("#pop_name").val();
                var activityPeriod = 'Annual';//jQuery("#period").val();
                var renewalDate = jQuery("#date").val();
                if( isNullorEmpty( networkAdmin ) ) return bsnMessage( 'ERROR', 'Please enter Network Admin Email!', 'error' );
                var emailreg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
                var testResult = emailreg.test(networkAdmin);
                if( !testResult ) return bsnMessage( 'ERROR', 'Admin Email has wrong format!', 'error' );
                if( isNullorEmpty( networkName ) ) return bsnMessage( 'ERROR', 'Please enter Network Name!', 'error' );
                if( isNullorEmpty( activityPeriod ) ) {
                    return bsnMessage( 'ERROR', 'Please enter Network Name!', 'error' );
                } else {
                    switch( activityPeriod ){
                        case 'Monthly': activityPeriod = 'P30D'; break;
                        case 'Quarterly': activityPeriod = 'P90D'; break;
                        case 'Annual': activityPeriod = 'P365D'; break;
                        case '4': activityPeriod = 'P730D'; break;
                        case '5': activityPeriod = 'P1095D'; break;
                        default: return bsnMessage( 'ERROR', 'Invalid Activity Period!', 'error' );
                    }
                }
                if( isNullorEmpty( renewalDate ) ) {
                    return bsnMessage( 'ERROR', 'Please enter Network Subscriptions Renewal Date!', 'error' );
                }

                var result = soapCreateNetwork( networkAdmin, networkName, activityPeriod, getSOAPTime( nlapiStringToDate(renewalDate) ) );

                if( !isNullorEmpty( result.IsError ) ){
                    showAlertBox('network_created', 'Error Creating BSN.com Network', result.Message, NLAlertDialog.TYPE_HIGH_PRIORITY);
                } else {
                    showAlertBox('network_created', 'Network Created', 'You successfully created BSN.com Network "' + result.Name + '".', NLAlertDialog.TYPE_LOWEST_PRIORITY);
                    bsnResFillNetworksList('' + networkAdmin + '');
                    var selectNetwork = window.parent.document.getElementById('bsn_cnet_select_network');
                    selectNetwork.value = '' + result.Id + '';
                    //return result.Id;

                    nlapiSetFieldValue( "bs_onload", "yes" );
                    nlapiSetFieldValue( "bsn_default_network", result );
                    nlapiSetFieldValue( "bsnc_cnet_network_admin", networkName );
                    searchSubmittedName( networkName );
                    setWindowChanged(window, true);
                    //nlapiFieldChanged(null,"bsn_cnet_network_admin");
                    nlapiFieldChanged(null,"bsn_cnet_select_network");
                }
                jQuery(".loader-overlay").fadeOut(1000);
                win.close();
            }
        },{
            text: 'Cancel',
            handler: function(){
                jQuery(".loader-overlay").fadeOut(1000);
                win.close();
            }
        }],
        buttonAlign: 'center',
    });
    win.show();
}

function bsncFormCreateNetworkSubmit(){
    var networkAdmin = nlapiGetFieldValue('bsnc_cnet_network_admin');

    if( networkAdmin.search('@') == -1 ){
        networkAdmin = '';
    }

    jQuery(".loader-overlay").fadeIn(1000);
    win = new Ext.Window ({
        title:'Create BSN.cloud Network',
        layout:'form',
        width:400,
        closable: false,
        closeAction:'close',
        target : document.getElementById('buttonId'),
        plain: true,

        items: [{
            xtype : 'textfield',
            fieldLabel: 'Admin Email',
            name: 'adminc',
            id: 'adminc',
            vtype: 'email',
            value: networkAdmin
        },{
            xtype : 'textfield',
            fieldLabel: 'Network Name',
            name: 'pop_namec',
            id: 'pop_namec'
        }],

        buttons: [{
            text: 'Create',
            handler: function(){
                var networkAdmin = jQuery("#adminc").val();
                var networkName = jQuery("#pop_namec").val();

                if( isNullorEmpty( networkAdmin ) ) return bsnMessage( 'ERROR', 'Please enter Network Admin Email!', 'error' );
                var emailreg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
                var testResult = emailreg.test(networkAdmin);
                if( !testResult ) return bsnMessage( 'ERROR', 'Admin Email has wrong format!', 'error' );
                if( isNullorEmpty( networkName ) ) return bsnMessage( 'ERROR', 'Network Name cannot be empty!', 'error' );

                var result = soapCreateNetworkBSNC( networkAdmin, networkName );

                if( isNullorEmpty( result.Name ) ){
                    hideAlertBox('network_created');
                    showAlertBox('network_created', 'Error Creating BSN.cloud Network', result.Message, NLAlertDialog.TYPE_HIGH_PRIORITY);
                } else {
                    hideAlertBox('network_created');
                    showAlertBox('network_created', 'Network Created', 'You have successfully created BSN.cloud Network "' + result.Name + '".', NLAlertDialog.TYPE_LOWEST_PRIORITY);

                    var param = '&bs_user=' + nlapiGetUser() + '&bs_email=' + networkAdmin + '&bs_network=' + networkName;
                    var suitelet = nlapiResolveURL('SUITELET', 'customscript_bs_sl_send_template_email', 'customdeploy_bs_sl_send_template_email');
                    var res = nlapiRequestURL(suitelet + param);
                    var isSent = res.getBody();

                    var isPopup = nlapiGetFieldValue( "bs_ispopup" );
                    if( !isNullorEmpty( isPopup ) ) {
                        jQuery('#div__body').append(buttonStart + '<input type="button" value="Close & Use this Network" onclick="window.parent.bsncFillNetworksList(\'' + networkAdmin + '\');var selectNetwork = window.parent.document.getElementById(\'bsnc_getname_select_network\');selectNetwork.value = \'' + result.Id + '\';var win=window.parent.Ext.getCmp(\'createNetworkForm\');if(win)win[win.closeAction]();" class="rndbuttoninpt bntBgT">' + buttonEnd);
                    }
                    nlapiSetFieldValue( "bs_onload", "yes" );
                    nlapiSetFieldValue( "bs_default_network", result.Id );
                    nlapiSetFieldValue( "bsnc_cnet_network_admin", networkName );
                    searchSubmittedName( networkName );
                    setWindowChanged(window, true);
                    //nlapiFieldChanged(null,"bsnc_cnet_network_admin");
                    nlapiFieldChanged(null,"bsnc_cnet_select_network");
                }
                jQuery(".loader-overlay").fadeOut(1000);
                win.close();
            }
        },{
            text: 'Cancel',
            handler: function(){
                jQuery(".loader-overlay").fadeOut(1000);
                win.close();
            }
        }],
        buttonAlign: 'center',
    });
    win.show();
}

function bsnFormCreateUserSubmit(){
    jQuery(".loader-overlay").fadeIn(1000);
    var win = new Ext.Window ({
        title:'Create BSN.com Network',
        layout:'form',
        width:400,
        closable: false,
        closeAction:'close',
        target : document.getElementById('buttonId'),
        plain: true,

        items: [{
            xtype : 'textfield',
            fieldLabel: 'User Email',
            name: 'admin',
            id: 'admin',
            vtype: 'email',
            value: ''
        },{
            xtype : 'textfield',
            fieldLabel: 'Password',
            name: 'pop_name',
            id: 'pop_name'
        }],

        buttons: [{
            text: 'Create',
            handler: function(){
                var networkId = jQuery("#bsn_cnet_select_network").val();
                var networkAdmin = jQuery("#admin").val();
                var password = jQuery("#pop_name").val();
                if( isNullorEmpty( networkAdmin ) ) return bsnMessage( 'ERROR', 'Please enter User Email!', 'error' );
                var emailreg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
                var testResult = emailreg.test(networkAdmin);
                if( !testResult ) return bsnMessage( 'ERROR', 'User Email has wrong format!', 'error' );

                var result = soapCreateUser( networkAdmin, networkId, password );

                if( !isNullorEmpty( result.IsError ) ){
                    showAlertBox('network_created', 'Error Creating BSN.com User', result.Message, NLAlertDialog.TYPE_HIGH_PRIORITY);
                } else {
                    showAlertBox('network_created', 'User Created', 'You successfully created BSN.com User "' + result.Login + '".', NLAlertDialog.TYPE_LOWEST_PRIORITY);
                    bsnPrintNetworkData(true);
                    nlapiSetFieldValue( "bs_onload", "yes" );
                }
                jQuery(".loader-overlay").fadeOut(1000);
                win.close();
            }
        },{
            text: 'Cancel',
            handler: function(){
                jQuery(".loader-overlay").fadeOut(1000);
                win.close();
            }
        }],
        buttonAlign: 'center',
    });
    win.show();
}

function bsncFormCreateUserSubmit(){
    jQuery(".loader-overlay").fadeIn(1000);
    var win = new Ext.Window ({
        title:'Create BSN.cloud Network',
        layout:'form',
        width:400,
        closable: false,
        closeAction:'close',
        target : document.getElementById('buttonId'),
        plain: true,

        items: [{
            xtype : 'textfield',
            fieldLabel: 'User Email',
            name: 'admin',
            id: 'admin',
            vtype: 'email',
            value: ''
        },{
            xtype : 'textfield',
            fieldLabel: 'Password',
            name: 'pop_name',
            id: 'pop_name'
        }],

        buttons: [{
            text: 'Create',
            handler: function(){
                var networkId = jQuery("#bsnc_cnet_select_network").val();
                var networkAdmin = jQuery("#admin").val();
                var password = jQuery("#pop_name").val();
                if( isNullorEmpty( networkAdmin ) ) return bsnMessage( 'ERROR', 'Please enter User Email!', 'error' );
                var emailreg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
                var testResult = emailreg.test(networkAdmin);
                if( !testResult ) return bsnMessage( 'ERROR', 'User Email has wrong format!', 'error' );

                var result = soapCreateUserBSNC( networkAdmin, networkId, password );

                if( !isNullorEmpty( result.IsError ) ){
                    showAlertBox('network_created', 'Error Creating BSN.cloud User', result.Message, NLAlertDialog.TYPE_HIGH_PRIORITY);
                } else {
                    showAlertBox('network_created', 'User Created', 'You successfully created BSN.cloud User "' + result.Login + '".', NLAlertDialog.TYPE_LOWEST_PRIORITY);
                    bsnPrintNetworkData(false);
                    nlapiSetFieldValue( "bs_onload", "yes" );
                }
                jQuery(".loader-overlay").fadeOut(1000);
                win.close();
            }
        },{
            text: 'Cancel',
            handler: function(){
                jQuery(".loader-overlay").fadeOut(1000);
                win.close();
            }
        }],
        buttonAlign: 'center',
    });
    win.show();
}

function bsnPrintNetworkData(isBSN){
    nlapiSetFieldValue( "bs_onload", "yes" );
    bsnCreateFormReload( 20 );
    console.log( 'usage1: ' + nlapiGetContext().getRemainingUsage() );
    //jQuery('#bsn_create_network_button').prop( "disabled", false );
    //jQuery('#bsnc_create_network_button').prop( "disabled", false );
    var networkIdBSN = "";
    var networkIdBSNC = "";
    var networkInfoBSN = null;
    var networkInfoBSNC = null;
    var formAdd = nlapiGetFieldValue('bsnc_form_add');
    var isCom = nlapiGetFieldValue( 'bs_nettype' ) == 'T';
    var isPopup = nlapiGetFieldValue('bs_ispopup');
    if( formAdd == 'yes' ){
        jQuery('#custpage_netinfo_fs').text('');
        if( isCom ){
            networkIdBSN = nlapiGetFieldValue('bsnc_addsubs_select_network');
        } else {
            networkIdBSNC = nlapiGetFieldValue('bsnc_addsubs_select_network');
        }
    } else {
        if( isBSN ){
            jQuery('#custpage_netinfo_bsn_fs').text('');
            networkIdBSN = nlapiGetFieldValue('bsn_cnet_select_network');
        } else {
            jQuery('#custpage_netinfo_fs').text('');
            networkIdBSNC = nlapiGetFieldValue('bsnc_cnet_select_network');
        }
    }
    console.log("=================networkIdBSN=================\n" + networkIdBSN);
    console.log("=================networkIdBSNC=================\n" + networkIdBSNC);
    if (networkIdBSN != '' || networkIdBSNC != '') {
        console.log("=================!isNullorEmpty( nlapiGetFieldValue('bs_onload') )=================\n" + !isNullorEmpty(nlapiGetFieldValue('bs_onload')));
        if (!isNullorEmpty(nlapiGetFieldValue('bs_onload'))) {
            if( networkIdBSN != '' ){
                nlapiSetFieldValue("bsn_default_network", ""); // Reset hidden default network
                networkInfoBSN = soapGetNetworkById(networkIdBSN, true);
                console.log("=================networkInfoBSN=================\n" + networkInfoBSN);
            }
            if( networkIdBSNC != '' ){
                nlapiSetFieldValue("bs_default_network", ""); // Reset hidden default network
                networkInfoBSNC = soapGetNetworkByIdBSNC(networkIdBSNC, true);
                console.log("=================networkInfoBSNC=================\n" + JSON.stringify(networkInfoBSNC));
            }
            console.log( 'usage2: ' + nlapiGetContext().getRemainingUsage() );
            if( !isNullorEmpty( networkInfoBSN ) ){
                if( typeof(networkInfoBSN.Id) != 'undefined' ) {
                    if( isNullorEmpty( isPopup ) ){
                        //if( isCom ) {
                            var count = soapNetworkSubscriptionsCount( networkInfoBSN.Id );
                            if( isNullorEmpty( count.error ) ){
                                networkInfoBSN.quantity = count.quantity;
                            } else {
                                bsnMessage( "BSN Request", count.message, 'error' );
                                networkInfoBSN.quantity = 0;
                            }
                            jQuery('#custpage_netinfo_bsn_fs').html(printNetworkInfoBSN(networkInfoBSN));
                            nlapiSetFieldValue("bsn_default_network", networkInfoBSN.Id);
                            /*
                        } else {
                            var count = soapNetworkSubscriptionsCountBSNC( networkInfoBSNC.Id, networkInfoBSNC.isTrial );
                            if( isNullorEmpty( count.error ) ){
                                networkInfoBSNC.quantity = count.quantity;
                            } else {
                                bsnMessage( "BSN Request", count.message, 'error' );
                                networkInfoBSNC.quantity = 0;
                            }
                            jQuery('#custpage_netinfo_fs').html(printNetworkInfoBSN(networkInfoBSNC));
                            nlapiSetFieldValue("bs_default_network", networkInfoBSN.Id);
                        }
                        */
                    }
                    //jQuery('#bsn_create_network_button').prop( "disabled", true );
                }
            }
            if( !isNullorEmpty( networkInfoBSNC ) ){
                if( typeof(networkInfoBSNC.Id) != 'undefined' ) {
                    if( isNullorEmpty( isPopup ) ){
                        var count = soapNetworkSubscriptionsCountBSNC( networkInfoBSNC.Id, networkInfoBSNC.isTrial );
                        if( isNullorEmpty( count.error ) ){
                            networkInfoBSNC.quantity = count.quantity;
                        } else {
                            bsnMessage( "BSN Request", count.message, 'error' );
                            networkInfoBSNC.quantity = 0;
                        }
                        console.log(networkInfoBSNC);
                        jQuery('#custpage_netinfo_fs').html(printNetworkInfo(networkInfoBSNC));
                        nlapiSetFieldValue("bs_default_network", networkInfoBSNC.Id);
                    }
                    //jQuery('#bsnc_create_network_button').prop( "disabled", true );
                }
            }
        } else {
            bsnCreateNetworkFormReload();
            return true;
        }
    }
}

function searchChangeOrders( subId, returnLatest, nearestDate ){
    var latest = returnLatest==true;
    var filters = [];
    filters[0] = new nlobjSearchFilter('subscription', null, 'is', subId);
    filters[1] = new nlobjSearchFilter('status', null, 'is', 'ACTIVE');
    //filters[2] = new nlobjSearchFilter('action', null, 'anyof', ['ACTIVATE','MODIFY_PRICING']);
    if( latest ){
        filters[2] = new nlobjSearchFilter('effectivedate', null, 'onOrBefore', !isNullorEmpty( nearestDate ) ? nearestDate : 'today');
    }
    //console.log(filters);
    var columns = [];
    columns[0] = new nlobjSearchColumn( 'status' );
    columns[1] = new nlobjSearchColumn( 'effectivedate' ).setSort(true);
    columns[2] = new nlobjSearchColumn( 'action' ).setSort(true);
    columns[3] = new nlobjSearchColumn( 'custrecord_sb_co_processed' );
    //columns[4] = new nlobjSearchColumn( 'enddate' );
    //columns[5] = new nlobjSearchColumn( 'custrecord_bsn_sub_end_user' );
    //columns[6] = new nlobjSearchColumn( 'startdate', 'billingaccount' );
    //columns[7] = new nlobjSearchColumn( 'custrecord_bsn_time_credit' );
    //columns[8] = new nlobjSearchColumn( 'billingaccount' );
    return nlapiSearchRecord( 'subscriptionchangeorder', null, filters, columns );
}

function searchChangeOrdersForMassProcessing(){
    var eligibleCOs = ['Activate', 'Modify Pricing'];
    var subsToProcess = [];
    var searchRes = latestChangeOrderToDate();
    //nlapiLogExecution( 'DEBUG', 'Change Order Search', JSON.stringify(searchRes) );
    if( searchRes ) {
        for (var i = 0; i < searchRes.length; i++) {
            var returnRow = JSON.parse(searchRes[i].getValue('formulatext', null, 'max'));
            if( !returnRow.processed && eligibleCOs.indexOf( returnRow.action ) != -1 ) subsToProcess.push( returnRow );
        }
    }

    return subsToProcess;
}

function latestChangeOrderToDate( nearestDate, subId ){
    var changeOrders = [];

    var searchRec = nlapiLoadSearch( 'subscriptionchangeorder', 'customsearch_sb_co_up_to_today' );
    if( searchRec ) {
        var filters = searchRec.getFilters();
        var columns = searchRec.getColumns();
        var filters1 = addFilter( filters, new nlobjSearchFilter('effectivedate', null, 'onOrBefore', !isNullorEmpty(nearestDate) ? nearestDate : 'today') );
        if( !isNullorEmpty( subId ) ) filters1 = addFilter( filters1, new nlobjSearchFilter('subscription', null, 'is', subId) );
        filters1 = addFilter( filters1, new nlobjSearchFilter('enddate', 'subscription', 'onOrAfter', !isNullorEmpty(nearestDate) ? nearestDate : 'today') );
        //console.log(filters);

        changeOrders = nlapiSearchRecord( 'subscriptionchangeorder', null, filters1, columns )
    }
    return changeOrders;
}

function changeOrdersBySubId( subId ){
    var subInfo = '';
    var multy = false;
    var returnObj = {html: '', quantity: 0, renewed: false};
    var changeOrders = searchChangeOrders( subId );
    if( changeOrders ) {
        for (var k = 0; k < changeOrders.length; k++) {
            var coRec = nlapiLoadRecord('subscriptionchangeorder', changeOrders[k].getId());
            var oldQuantity = parseInt(coRec.getLineItemValue('subline', 'quantity', 1));
            var newQuantity = parseInt(coRec.getLineItemValue('subline', 'quantitynew', 1));
            var diffQuantity = newQuantity - oldQuantity;
            if (!k) {
                var lowestDate = moment(nlapiStringToDate(changeOrders[k].getValue('effectivedate'))).add(1, 'day').toDate();
                //console.log('lowestDate='+lowestDate);
                if(changeOrders[k].getValue('action') == 'ACTIVATE' && changeOrders[k].getValue('status') != 'VOIDED'){
                    lowestDate = nlapiStringToDate(changeOrders[k].getValue('effectivedate'));
                    nlapiSetFieldValue('bsnc_addsubs_start_date', nlapiDateToString(lowestDate));
                }
                //console.log('lowestDate='+lowestDate);
                nlapiSetFieldValue('bsnc_addsubs_lowest_date', nlapiDateToString(lowestDate));
                if (lowestDate > nlapiStringToDate(nlapiGetFieldValue('bsnc_addsubs_start_date'))) nlapiSetFieldValue('bsnc_addsubs_start_date', nlapiDateToString(lowestDate));
                if (changeOrders[k].getValue('action') == 'MODIFY_PRICING' && changeOrders[k].getValue('status') != 'VOIDED' && !isNaN(newQuantity)) quantity = newQuantity;
                if (changeOrders[k].getValue('action') == 'ACTIVATE' && changeOrders[k].getValue('status') != 'VOIDED') quantity = oldQuantity;
                if (changeOrders[k].getValue('action') == 'RENEW' && changeOrders[k].getValue('status') != 'VOIDED') {
                    returnObj.renewed = true;
                    quantity = oldQuantity;
                }
                if (changeOrders[k].getValue('action') == 'TERMINATE' && changeOrders[k].getValue('status') != 'VOIDED') {
                    returnObj.terminated = true;
                    quantity = oldQuantity;
                }
                //subInfo += '<br><b>SUBSCRIPTION CHANGE ORDERS</b><br>';
                subInfo += '<div style="border: 1px solid black; padding: 10px; width: 185px;">';
                returnObj.quantity = quantity;
            } else
                subInfo += '<div style="border: 1px solid black; padding: 10px; width: 185px; margin-top: -1px;">';
            subInfo += '<b>ID:</b> <a href="' + nlapiResolveURL('RECORD', 'subscriptionchangeorder', changeOrders[k].getId()) + '" target="_blank">' + changeOrders[k].getId() + '</a><br>';
            subInfo += '<b>Action:</b> ' + changeOrders[k].getValue('action') + '<br>';
            //subInfo += '<b>Status:</b> ' + changeOrders[k].getValue('status') + '<br>';
            subInfo += '<b>Effective Date:</b> ' + changeOrders[k].getValue('effectivedate') + '<br>';
            subInfo += '<b>Quantity:</b> ' + oldQuantity;
            if (changeOrders[k].getValue('action') == 'MODIFY_PRICING' && changeOrders[k].getValue('status') != 'VOIDED' && !isNaN(newQuantity)) subInfo += ' -> ' + newQuantity;
            if (diffQuantity > 0) subInfo += '<span style="color:green"> (+' + diffQuantity + ')</span>';
            if (diffQuantity < 0) subInfo += '<span style="color:red"> (' + diffQuantity + ')</span>';
            subInfo += '<br>';
            subInfo += '</div>';
            if (!k && changeOrders.length > 1) {
                subInfo += '<div id="cocollapse' + subId + '">';
                multy = true;
            }
        }
        if (multy) {
            subInfo += '</div>';
            subInfo += '<style>#cocollapse' + subId + '{display: none}</style>';
            subInfo += '<a id="cocollbut' + subId + '" class="show" style="display: block; padding: 4px; border: 1px solid black; background-color: #eee; width:185px; text-decoration: none; font-weight: 900; margin-top: -1px;" href="#" onclick="if( this.className == \'show\' ){this.innerHTML=\'Hide History &#8593;\';this.className=\'hide\';document.getElementById(\'cocollapse' + subId + '\').style.display = \'block\';var coBut=document.getElementById(\'cocollbut' + subId + '\');var scrollDiv=coBut.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.firstChild;if(scrollDiv.scrollHeight <= scrollDiv.clientHeight){var titleDiv=coBut.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.firstChild;titleDiv.click();setTimeout(function(){titleDiv.click();}, 500);}return false;}if( this.className == \'hide\' ){this.innerHTML=\'Show History &#8595;\';this.className=\'show\';document.getElementById(\'cocollapse' + subId + '\').style.display = \'none\';}return false;">Show History &#8595;</a>';
        }
    }

    returnObj.html = subInfo;

    return returnObj;
}

function currentActiveChangeOrder( subId ){
    var subInfo = '';
    var multy = false;
    var returnObj = {html: '', quantity: 0, renewed: false};
    var changeOrders = searchChangeOrders( subId, true, 'today' );
    if( changeOrders ) {
        var quantity = 0;

        for (var k = 0; k < changeOrders.length; k++) {
            var coRec = nlapiLoadRecord('subscriptionchangeorder', changeOrders[k].getId());
            var oldQuantity = parseInt(coRec.getLineItemValue('subline', 'quantity', 1));
            var newQuantity = parseInt(coRec.getLineItemValue('subline', 'quantitynew', 1));
            var diffQuantity = newQuantity - oldQuantity;
            if (!k) {
                var lowestDate = moment(nlapiStringToDate(changeOrders[k].getValue('effectivedate'))).add(1, 'day').toDate();
                //console.log('lowestDate='+lowestDate);
                if(changeOrders[k].getValue('action') == 'ACTIVATE' && changeOrders[k].getValue('status') != 'VOIDED'){
                    lowestDate = nlapiStringToDate(changeOrders[k].getValue('effectivedate'));
                    nlapiSetFieldValue('bsnc_addsubs_start_date', nlapiDateToString(lowestDate));
                }
                //console.log('lowestDate='+lowestDate);
                if (lowestDate > nlapiStringToDate(nlapiGetFieldValue('bsnc_addsubs_start_date'))) nlapiSetFieldValue('bsnc_addsubs_start_date', nlapiDateToString(lowestDate));
                if (changeOrders[k].getValue('action') == 'MODIFY_PRICING' && changeOrders[k].getValue('status') != 'VOIDED' && !isNaN(newQuantity)) quantity = newQuantity;
                if (changeOrders[k].getValue('action') == 'ACTIVATE' && changeOrders[k].getValue('status') != 'VOIDED') quantity = oldQuantity;
                if (changeOrders[k].getValue('action') == 'RENEW' && changeOrders[k].getValue('status') != 'VOIDED') {
                    returnObj.renewed = true;
                    quantity = oldQuantity;
                }
                //subInfo += '<br><b>SUBSCRIPTION CHANGE ORDERS</b><br>';
                subInfo += '<div style="border: 1px solid black; padding: 10px; width: 185px;">';

                returnObj.quantity = quantity;
            } else
                subInfo += '<div style="border: 1px solid black; padding: 10px; width: 185px; margin-top: -1px;">';
            subInfo += '<b>ID:</b> <a href="' + nlapiResolveURL('RECORD', 'subscriptionchangeorder', changeOrders[k].getId()) + '" target="_blank">' + changeOrders[k].getId() + '</a><br>';
            subInfo += '<b>Action:</b> ' + changeOrders[k].getValue('action') + '<br>';
            //subInfo += '<b>Status:</b> ' + changeOrders[k].getValue('status') + '<br>';
            subInfo += '<b>Effective Date:</b> ' + changeOrders[k].getValue('effectivedate') + '<br>';
            subInfo += '<b>Quantity:</b> ' + oldQuantity;
            if (changeOrders[k].getValue('action') == 'MODIFY_PRICING' && changeOrders[k].getValue('status') != 'VOIDED' && !isNaN(newQuantity)) subInfo += ' -> ' + newQuantity;
            if (diffQuantity > 0) subInfo += '<span style="color:green"> (+' + diffQuantity + ')</span>';
            if (diffQuantity < 0) subInfo += '<span style="color:red"> (-' + diffQuantity + ')</span>';
            subInfo += '<br>';
            subInfo += '</div>';
            if (!k && changeOrders.length > 1) {
                subInfo += '<div id="cocollapse' + subId + '">';
                multy = true;
            }
        }
        if (multy) {
            subInfo += '</div>';
            subInfo += '<style>#cocollapse' + subId + '{display: none}</style>';
            subInfo += '<a id="cocollbut' + subId + '" class="show" style="display: block; padding: 4px; border: 1px solid black; background-color: #eee; width:185px; text-decoration: none; font-weight: 900; margin-top: -1px;" href="#" onclick="if( this.className == \'show\' ){this.innerHTML=\'Hide History &#8593;\';this.className=\'hide\';document.getElementById(\'cocollapse' + subId + '\').style.display = \'block\';var coBut=document.getElementById(\'cocollbut' + subId + '\');var scrollDiv=coBut.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.firstChild;if(scrollDiv.scrollHeight <= scrollDiv.clientHeight){var titleDiv=coBut.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.firstChild;titleDiv.click();setTimeout(function(){titleDiv.click();}, 500);}return false;}if( this.className == \'hide\' ){this.innerHTML=\'Show History &#8595;\';this.className=\'show\';document.getElementById(\'cocollapse' + subId + '\').style.display = \'none\';}return false;">Show History &#8595;</a>';
        }
    }

    returnObj.html = subInfo;

    return returnObj;
}

function currentActiveChangeOrderRequest( subId ){
    var returnObj = {html: '', quantity: 0, renewed: false, terminated: false, processed: false};
    var changeOrders = searchChangeOrders( subId, true, 'today' );
    if( changeOrders ) {
        var isProcessed = changeOrders[0].getValue('custrecord_sb_co_processed') == 'T';
        if( !isProcessed ) {
            var quantity = 0;
            var coRec = nlapiLoadRecord('subscriptionchangeorder', changeOrders[0].getId());
            if (coRec) {
                var oldQuantity = parseInt(coRec.getLineItemValue('subline', 'quantity', 1));
                var newQuantity = parseInt(coRec.getLineItemValue('subline', 'quantitynew', 1));
                var lowestDate = moment(nlapiStringToDate(changeOrders[0].getValue('effectivedate'))).add(1, 'day').toDate();
                if (changeOrders[0].getValue('action') == 'ACTIVATE' && changeOrders[0].getValue('status') != 'VOIDED') {
                    lowestDate = nlapiStringToDate(changeOrders[0].getValue('effectivedate'));
                    nlapiSetFieldValue('bsnc_addsubs_start_date', nlapiDateToString(lowestDate));
                }
                if (lowestDate > nlapiStringToDate(nlapiGetFieldValue('bsnc_addsubs_start_date'))) nlapiSetFieldValue('bsnc_addsubs_start_date', nlapiDateToString(lowestDate));
                if (changeOrders[0].getValue('action') == 'MODIFY_PRICING' && changeOrders[0].getValue('status') != 'VOIDED' && !isNaN(newQuantity)) quantity = newQuantity;
                if (changeOrders[0].getValue('action') == 'ACTIVATE' && changeOrders[0].getValue('status') != 'VOIDED') quantity = oldQuantity;
                if (changeOrders[0].getValue('action') == 'RENEW' && changeOrders[0].getValue('status') != 'VOIDED') {
                    returnObj.renewed = true;
                    quantity = oldQuantity;
                }
                if (changeOrders[0].getValue('action') == 'TERMINATE' && changeOrders[0].getValue('status') != 'VOIDED') {
                    returnObj.terminated = true;
                    quantity = 0;
                }

                returnObj.coId = changeOrders[0].getId();
                returnObj.quantity = quantity;
            }
        }
        returnObj.processed = isProcessed;
    }

    return returnObj;
}

function changeOrderHistory( subId ){
    if( subId ){
        var ordersHTML = changeOrdersBySubId( subId );
        var win = new Ext.Window({
            title: 'Subscription History',
            closable:true,
            width:600,
            height:350,
            //border:false,
            plain:true,
            layout: 'fit',
            layoutConfig: {
                // layout-specific configs go here
                titleCollapse: true,
                animate: true,
                activeOnTop: false,
                autoScroll:true
            },
            items: {
                title: 'Change Orders',
                html: ordersHTML,
                border: false,
                autoScroll:true
            }
        });

        win.show(this);
    }
}

function bsncSubscriptionHistory( nettype ){
    var networkFieldId = 'bsnc_cnet_select_network';
    if( nettype == netTypeCom ){
        networkFieldId = 'bsn_cnet_select_network';
    } else {
        nettype = netTypeCloud;
    }
    var subscriptionRecords = bsncGetSubscriptionsByNetid( nlapiGetFieldValue( networkFieldId ), nettype );

    var items = [];
    for( var i = 0; i < subscriptionRecords.length; i++ ){
        var subBillingAccountId = subscriptionRecords[i].billingAccount;
        var subBillingAccountName = '';
        if( subBillingAccountId ){
            var ba = nlapiLoadRecord( "billingaccount", subBillingAccountId );
            if( ba ) subBillingAccountName = ba.getFieldValue('name');
        }
        var coData = changeOrdersBySubId( subscriptionRecords[i].subId );
        if( !coData.renewed ) {
            var subStatus = subscriptionRecords[i].status;
            var color1 = '#C00';
            var color2 = '#ff1a1a';
            var color3 = '#e60000';
            var color4 = '#b30000';
            var text = '#ffffff';
            switch(subStatus){
                case 'PENDING_ACTIVATION':
                    color1 = '#CC0';
                    color2 = '#ffff1a';
                    color3 = '#e6e600';
                    color4 = '#b3b300';
                    break;
                case 'ACTIVE':
                    color1 = '#0C0';
                    color2 = '#1aff1a';
                    color3 = '#00e600';
                    color4 = '#00b300';
                    break;
                case 'DRAFT':
                    color1 = '#CCC';
                    color2 = '#ffffff';
                    color3 = '#e6e6e6';
                    color4 = '#b3b3b3';
                    text = '#333333';
                    break;
                case 'CLOSED':
                default:break;
            }
            var badge = '<style type="text/css">.sbBSNBadge' + subscriptionRecords[i].subId + ' {\n' +
                '    font-size: 10px;\n' +
                //'    position: absolute;\n' +
                '    top: -10px;\n' +
                '    right: 2px;\n' +
                '    display: inline-block;\n' +
                '    width: auto;\n' +
                '    font-weight: bold;\n' +
                '    color: ' + text + ';\n' +
                '    text-shadow: rgba(0, 0, 0, 0.5) 0 -0.08em 0;\n' +
                '    -webkit-border-radius: 3px;\n' +
                '    border-radius: 3px;\n' +
                '    padding: 0px;\n' +
                '    padding: 1px 2px;\n' +
                '    background-image: none;\n' +
                '    background-color: ' + color1 + ';\n' +
                '    background-image: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, ' + color2 + '), color-stop(3%, ' + color3 + '), color-stop(100%, ' + color4 + '));\n' +
                '    background-image: -webkit-linear-gradient(top, ' + color2 + ',' + color3 + ' 3%,' + color4 + ');\n' +
                '    background-image: linear-gradient(top, ' + color2 + ',' + color3 + ' 3%,' + color4 + ');\n' +
                '    -webkit-box-shadow: rgba(0, 0, 0, 0.3) 0 0.1em 0.1em;\n' +
                '    box-shadow: rgba(0, 0, 0, 0.3) 0 0.1em 0.1em;\n' +
                '    z-index: 12;\n' +
                '}</style> <span class="sbBSNBadge' + subscriptionRecords[i].subId + '">' + subStatus + '</span>';
            var takeover = '';
            if (!isNullorEmpty(subscriptionRecords[i].subEndUserId) && subscriptionRecords[i].customerId != subscriptionRecords[i].subEndUserId) {
                takeover = '<br>' + buttonStart + '<input type="button" value="Take Over" onclick="bsTakeOverSubscription(' + subscriptionRecords[i].subId + ')" class="rndbuttoninpt bntBgT">' + buttonEnd;
            }
            var titlePrefix = takeover == '' ? 'End User: ' : 'Distributor: ';
            titlePrefix = subscriptionRecords[i].isSupport ? ' Support: ' : titlePrefix;
            items.push({
                title: '<b>' + titlePrefix + subscriptionRecords[i].subCustomer + '</b> (' + coData.quantity + ')' + badge,
                layout: 'hbox',
                align: 'stretch',
                autoScroll: true,
                items: [{
                    xtype: 'panel',
                    align: 'stretch',
                    bodyStyle: 'padding: 10px;',
                    title: 'SUBSCRIPTION',
                    width: 335,
                    html: 'Name: <a href="' + nlapiResolveURL('RECORD', 'subscription', subscriptionRecords[i].subId) + '" target="_blank">' + subscriptionRecords[i].subName + '</a><br>' +
                        //'ID: ' + subscriptionRecords[i].subId + '<br>' +
                        'Start Date: ' + subscriptionRecords[i].subStartDate + '<br>' +
                        'End Date: ' + subscriptionRecords[i].subEndDate + '<br>' +
                        'Subs Quantity: ' + coData.quantity + '<br>' +
                        'Customer Name: <a href="' + nlapiResolveURL('RECORD', 'customer', subscriptionRecords[i].customerId) + '" target="_blank">' + subscriptionRecords[i].subCustomer + '</a><br>' +
                        'Customer Email: ' + subscriptionRecords[i].customerEmail + '<br>' +
                        (subBillingAccountName != '' ? 'Billing Account: <a href="' + nlapiResolveURL('RECORD', 'billingaccount', subBillingAccountId) + '" target="_blank">' + subBillingAccountName + '</a><br>' : '' ) +
                        'End User Name: <a href="' + nlapiResolveURL('RECORD', 'customer', subscriptionRecords[i].subEndUserId) + '" target="_blank">' + subscriptionRecords[i].subEndUser + '</a><br>' +
                        '<br>' + buttonStart + '<input type="button" value="Add Subscriptions" onclick="add' + (nettype == 2 ? 'BSN' : 'BSNC') + 'Subscriptions(' + subscriptionRecords[i].customerId + ')" class="rndbuttoninpt bntBgT">' + buttonEnd +
                        ''//takeover
                }, {
                    xtype: 'panel',
                    align: 'stretch',
                    bodyStyle: 'padding: 10px;',
                    title: 'SUBSCRIPTION CHANGE ORDERS',
                    width: 222,
                    html: coData.html
                }]
            });
        }
    }

    if( !items.length ){
        items.push({
            title: 'No Subscriptions',
            layout: 'hbox',
            align: 'stretch',
            autoScroll: true,
            html: '<span style="color:red">this network does not have subscription history<span>'
        });
    }

    jQuery("body").prepend("<div class='loader-overlay'><span class='loader-text'>Loading...</span></div>");

    var win = new Ext.Window({
        title: 'Subscription History',
        closable:true,
        width:600,
        height:390,
        //border:false,
        plain:true,
        layout: 'accordion',
        layoutConfig: {
            // layout-specific configs go here
            titleCollapse: true,
            animate: true,
            activeOnTop: false,
            autoScroll:true,
            align: 'stretch'
        },
        items: items,
        listeners:{
            close:function(){
                nlapiSetFieldValue("bs_onload", "");
                jQuery(".loader-overlay").fadeOut(1000);
            },
            scope:this
        }
    });

    win.show(this);
    /*

    */
}

function printNetworkInfo(networkInfo){
    var nInfo = '';
    if( !isNullorEmpty( networkInfo ) ){
        console.log("=================nlapiGetFieldValue('bsnc_form_add')=================\n" + nlapiGetFieldValue('bsnc_form_add'));
        if( nlapiGetFieldValue('bsnc_form_add') == 'yes' ) {
            createEmail = nlapiGetFieldValue('bsnc_addsubs_purchaser_email');
        } else {
            var netAdmin = nlapiGetFieldValue('bsnc_cnet_network_admin').search('@') == -1 ? '' : nlapiGetFieldValue('bsnc_cnet_network_admin');
            if ( isNullorEmpty( netAdmin ) && typeof (networkInfo.NetworkAdministrators) != 'undefined') {
                var netAdmins = networkInfo.NetworkAdministrators;
                if (netAdmins.length) {
                    netAdmin = netAdmins[0].Login;
                }
            }

            console.log("=================networkInfo=================\n" + JSON.stringify(networkInfo));
            nInfo = '<br>' + buttonStart + '<input type="button" value="Network Info" onclick="openNetworkInfoPage(' + networkInfo.Id + ', \'cloud\', \'' + networkInfo.Name + '\')" class="rndbuttoninpt bntBgT">' + buttonEnd;
            nInfo += '<br>' + buttonStart + '<input type="button" value="Subscription History" onclick="bsncSubscriptionHistory( 1 );return false;" class="rndbuttoninpt bntBgT">' + buttonEnd;
            nInfo += '<br>' + buttonStart + '<input type="button" value="Add Subscriptions" onclick="addBSNCSubscriptions()" class="rndbuttoninpt bntBgT">' + buttonEnd;
            nInfo += '<br>' + buttonStart + '<input type="button" value="Complete List of Subscriptions" onclick="allNetworkSubscriptions(' + networkInfo.Id + ')" class="rndbuttoninpt bntBgT">' + buttonEnd;
        }
        nInfo += '<br><b>NETWORK INFO</b><br>';
        var isSuspended = networkInfo.IsLockedOut == 'true';
        nInfo += '<div style="border: 1px solid black; padding: 10px; width: 280px;' + (isSuspended?'background-color:#fee;':'') + '">';
        if( isSuspended ) nInfo += '<b style="color:darkred">Suspended: </b>' + networkInfo.LastLockoutDate + '<br>';
        nInfo += '<b>ID:</b> ' + networkInfo.Id + '<br>';
        if (typeof (networkInfo.Name) != 'undefined') {
            nInfo += '<b>Name:</b> ' + networkInfo.Name + '<br>';
        }
        /*
        console.log("=================typeof (networkInfo.SubscriptionsActivityPeriod)=================\n" + typeof (networkInfo.SubscriptionsActivityPeriod));
        if (typeof (networkInfo.SubscriptionsActivityPeriod) != 'undefined') {
            var periodInfo = bsnGetPeriodBySOAP( networkInfo.SubscriptionsActivityPeriod );
            nInfo += '<b>Activity Period:</b> ' + periodInfo.name + '<br>';
        }
        */
        console.log(networkInfo);
        if( networkInfo.isContent || networkInfo.isTrial ) {
            console.log("=================typeof (networkInfo.SubscriptionsRenewalDate)=================\n" + typeof (networkInfo.SubscriptionsRenewalDate));
            if (typeof (networkInfo.SubscriptionsRenewalDate) != 'undefined') {
                nInfo += '<b>Renewal Date:</b> ' + networkInfo.SubscriptionsRenewalDate.substr(0, 10) + '<br>';
            }
            if (typeof (networkInfo.quantity) == 'number') {
                nInfo += '<b>Quantity:</b> ' + networkInfo.quantity + '<br>';
            }
        }
        if( networkInfo.isContent ){
            nInfo += '<b>Type:</b> Content<br>';
        }
        if( networkInfo.isControl ){
            nInfo += '<b>Type:</b> Control<br>';
        }
        if( networkInfo.isTrial ){
            nInfo += '<b>Type:</b> Trial<br>';
        } else {
            nInfo += '<b>Was Trial:</b> ' + networkInfo.wasTrial + '<br>';
        }
        console.log("=================typeof (networkInfo.NetworkAdministrators)=================\n" + typeof (networkInfo.NetworkAdministrators));
        if (typeof (networkInfo.NetworkAdministrators) != 'undefined') {
            var netAdmins = networkInfo.NetworkAdministrators;
            if( netAdmins.length ){
                nInfo += '</div><br>';
                nInfo += '<br><b>ADMINISTRATORS</b><br>';
                nInfo += '<div style="border: 1px solid black; padding: 10px; width: 280px;">';
            }
            for( var i = 0; i < netAdmins.length; i++ ){
                console.log("=================netAdmins i=================\n" + i);
                if( i ){
                    nInfo += '<span style="border-top: 1px solid #999; display: block; padding-top: 10px; margin-top: 10px;">';
                } else {
                    nInfo += '<span>';
                }
                console.log("=================typeof (netAdmins[i].Login)=================\n" + typeof (netAdmins[i].Login));
                if (!isNullorEmpty(netAdmins[i].Login) && typeof (netAdmins[i].Login) != 'undefined') {
                    nInfo += '<input type="radio" name ="bsncadministrator" id="bsncadministrator' + i + '" value="' + netAdmins[i].Login + '"' + (i ? '' : ' checked="checked"') + '> ';
                    nInfo += '<label for="bsncadministrator' + i + '">' + netAdmins[i].Login + '</label><br>';
                }
                nInfo += '</span>';
            }
        }
        console.log("=================typeof (networkInfo.NetworkSubscriptions)=================\n" + typeof (networkInfo.NetworkSubscriptions));
        if (typeof (networkInfo.NetworkSubscriptions) != 'undefined') {
            var subsHistory = networkInfo.NetworkSubscriptions;
            if( subsHistory.length ){
                nInfo += '</div><br>';
                nInfo += '<br><b>HISTORY</b><br>';
                nInfo += '<div style="border: 1px solid black; padding: 10px; width: 280px;">';
            }
            for( var i = 0; i < subsHistory.length; i++ ){
                console.log("=================SubHistory i=================\n" + i);
                if( i ){
                    nInfo += '<span style="border-top: 1px solid #999; display: block; padding-top: 10px; margin-top: 10px;">';
                } else {
                    nInfo += '<span>';
                }
                console.log("=================typeof (subsHistory[i].CreationDate)=================\n" + typeof (subsHistory[i].CreationDate));
                if (typeof (subsHistory[i].CreationDate) != 'undefined') {
                    nInfo += '<b>Creation Date:</b> ' + subsHistory[i].CreationDate.substr(0,10) + '<br>';
                }
                console.log("=================typeof (subsHistory[i].ExpireDate)=================\n" + typeof (subsHistory[i].ExpireDate));
                if (!isNullorEmpty(subsHistory[i].ExpireDate) && typeof (subsHistory[i].ExpireDate) != 'undefined') {
                    nInfo += '<b>Expiration Date:</b> ' + subsHistory[i].ExpireDate.substr(0,10) + '<br>';
                }
                console.log("=================typeof (subsHistory[i].Id)=================\n" + typeof (subsHistory[i].Id));
                if (typeof (subsHistory[i].Id) != 'undefined') {
                    nInfo += '<b>ID:</b> ' + subsHistory[i].Id + '<br>';
                }
                console.log("=================typeof (subsHistory[i].Level)=================\n" + typeof (subsHistory[i].Level));
                if (typeof (subsHistory[i].Level) != 'undefined') {
                    nInfo += '<b>Level:</b> ' + subsHistory[i].Level + '<br>';
                }
                nInfo += '</span>';
            }
        }
        nInfo += '</div>';
        if( nlapiGetFieldValue('bsnc_form_add') != 'yes' && nlapiGetFieldValue('bs_isdev') == 'T' ) {
            nInfo += '<div class="">' + buttonStart + '<input type="button" value="Add User" onclick="bsncFormCreateUserSubmit();" class="rndbuttoninpt bntBgT">' + buttonEnd;
        }
    }
    return nInfo;
}

function allNetworkSubscriptions( netId ){
    var url = '/app/common/search/searchresults.nl?searchtype=Subscription&CUSTRECORD_SUB_NETWORK_IDtype=STARTSWITH&report=&grid=&searchid=80880&CUSTRECORD_SUB_NETWORK_ID=';
    window.open(url + netId,'_blank');
}

function openNetworkInfoPage( networkID, networkType, networkName ){
    var param = '&bsnc_network=' + networkID + '&bsnc_type=' + networkType + '&bsnc_network_name=' + networkName;
    var scriptURL = nlapiResolveURL('SUITELET', 'customscript_sbss1_bsnc_sl_network_page', 'customdeploy_sbss1_bsnc_sl_network_page');
    //if (0/*document.forms['main_form'].elements['linked'].value == 'F'*/ || confirm('This Quote has already been processed.  Are you sure you want to process again?'))
        window.open(scriptURL + param, 'net' + networkID);
}

function addBSNCSubscriptions(customerId){
    if(customerId == null) customerId = '';
    setWindowChanged(window, false);
    var scriptURL = nlapiResolveURL('SUITELET', 'customscript_sb_bsnc_add_subs', 'customdeploy_sb_bsnc_add_subs');
    window.location = scriptURL + '&bsnc_type=cloud&bsnc_email=' + nlapiGetFieldValue('bsncadministrator') +
        '&bsnc_network=' + nlapiGetFieldValue('bsnc_cnet_select_network') + '&bsnc_customer=' + customerId;
}

function addBSNSubscriptions(customerId){
    if(customerId == null) customerId = '';
    setWindowChanged(window, false);
    var scriptURL = nlapiResolveURL('SUITELET', 'customscript_sb_bsnc_add_subs', 'customdeploy_sb_bsnc_add_subs');
    window.location = scriptURL + '&bsnc_type=com&bsnc_email=' + nlapiGetFieldValue('bsnadministrator') +
        '&bsnc_network=' + nlapiGetFieldValue('bsn_cnet_select_network') + '&bsnc_customer=' + customerId;
}

function networkIsCoTermed( isNotCoTermed ){
    if( isNotCoTermed ){
        nlapiSetFieldValue( 'bsnc_addsubs_is_not_cotermed', 'T' );
        showAlertBox('error_add_subs', 'ERROR', 'This Network is NOT Co-Termed!', NLAlertDialog.TYPE_HIGH_PRIORITY);
    } else {
        nlapiSetFieldValue( 'bsnc_addsubs_is_not_cotermed', 'F' );
        hideAlertBox('error_add_subs');
    }
}

function noBillingAccount( hasBillingAccount ){
    if( hasBillingAccount ){
        //nlapiSetFieldValue( 'bsnc_addsubs_is_not_cotermed', 'T' );
        showAlertBox('error_add_subs', 'ERROR', 'This Customer has no Billing Accounts!<br>You must use "Create Billing Account" button to create one first.', NLAlertDialog.TYPE_HIGH_PRIORITY);
    } else {
        //nlapiSetFieldValue( 'bsnc_addsubs_is_not_cotermed', 'F' );
        //hideAlertBox('error_add_subs');
    }
}

function transferBSNSubscriptions(){
    jQuery("body").prepend("<div class='loader-overlay'><span class='loader-text'>Loading...</span></div>");
/*
    var netFrom = 3;//scheduled
    var nettypeFrom = 2;
    var netTo = 205;//Company-18062020-133
    var nettypeTo = 1;
*/
    var netFrom = nlapiGetFieldValue('bsn_default_network');
    var nettypeFrom = netTypeCom;
    var netTo = nlapiGetFieldValue('bs_default_network');
    var nettypeTo = netTypeCloud;

    var fromSubRecords = bsncGetSubscriptionsByNetid( netFrom,nettypeFrom, true );
    var name = [];
    for( var i = 0; i < fromSubRecords.length; i++ ){
        var subsCount = changeOrdersBySubId( fromSubRecords[i].subId );
        var q = '';
        if(subsCount.quantity) q = ' (' + subsCount.quantity + ' subs)';
        //name.push({ "value": subRecords[i].subId, "name": subRecords[i].subName });
        name.push([fromSubRecords[i].subId, fromSubRecords[i].subName + q]);
        //name.push(subRecords[i].subName);
    }
    console.log(name);
    var store = new Ext.data.SimpleStore({
        data: name,
        fields: ['value', 'name']
    });
    console.log(store);
    jQuery(".loader-overlay").fadeIn(1000);
    var win = new Ext.Window ({
        title:'Transfer Subscriptions',
        layout:'form',
        id:'transferForm',
        width:600,
        closable: false,
        closeAction:'close',
        target : document.getElementById('buttonId'),
        plain: true,

        items: [{
            xtype:'combo',
            fieldLabel:'Subscription Record',
            name:'subRecord',
            id:'subRecord',
            valueField: 'value',
            displayField:'name',
            queryMode:'local',
            store:name,
            autoSelect:true,
            triggerAction: 'all',
            editable: false,
            forceSelection:true,
            width: 400
        }/*,{
            xtype : 'datefield',
            fieldLabel: 'Renewal Date',
            name: 'date',
            id: 'date',
            value: '12/12/2021'
        },{
            xtype : 'textfield',
            fieldLabel: 'Target Price',
            name: 'targetPrice',
            id: 'targetPrice',
            value: 15
        },{
            xtype : 'checkbox',
            fieldLabel: 'Do not charge difference',
            name: 'doNotCharge',
            id: 'doNotCharge'
        }*/],

        buttons: [{
            text: 'Transfer',
            handler: function(button){
                //var toSubRecords = bsncGetSubscriptionsByNetid( netTo,nettypeTo, true );
                var subRecordFromID = Ext.getCmp('subRecord').getValue();
                console.log("fromRecID = " + subRecordFromID);
                //alert(subRecordFromID);
                if( subRecordFromID > 0 ){
                    var subRecordFrom = nlapiLoadRecord('subscription', subRecordFromID);
                    if( subRecordFrom ){
                        subRecordFrom.setFieldValue('autorenewal', 'T');
                        subRecordFrom.setFieldValue('advancerenewalperiodnumber', 30);
                        subRecordFrom.setFieldValue('defaultrenewalmethod', 'CREATE_NEW_SUBSCRIPTION');
                        subRecordFrom.setFieldValue('custrecord_bsn_type', nettypeTo);
                        subRecordFrom.setFieldValue('custrecord_sub_network_id', netTo);
                        subRecordFrom.setFieldValue('defaultrenewalplan', sbBSNSettings.bsnc1yrPlanNum);

                        var newPriceBook = bsnGetPriceBookByPriceLevel(netTypeCloud, priceLevelMSRP);
                        var oldPriceBook = subRecordFrom.getFieldValue('defaultrenewalpricebook');
                        console.log("oldPriceBook = " + oldPriceBook);
                        switch( oldPriceBook ){
                            case bsnGetPriceBookByPriceLevel(netTypeCom, priceLevelMSRP): newPriceBook = bsnGetPriceBookByPriceLevel(netTypeCloud, priceLevelMSRP); break;
                            case bsnGetPriceBookByPriceLevel(netTypeCom, priceLevel25): newPriceBook = bsnGetPriceBookByPriceLevel(netTypeCloud, priceLevel25); break;
                            case bsnGetPriceBookByPriceLevel(netTypeCom, priceLevel30): newPriceBook = bsnGetPriceBookByPriceLevel(netTypeCloud, priceLevel30); break;
                            case bsnGetPriceBookByPriceLevel(netTypeCom, priceLevel35): newPriceBook = bsnGetPriceBookByPriceLevel(netTypeCloud, priceLevel35); break;
                            case bsnGetPriceBookByPriceLevel(netTypeCom, priceLevel40): newPriceBook = bsnGetPriceBookByPriceLevel(netTypeCloud, priceLevel40); break;
                            case bsnGetPriceBookByPriceLevel(netTypeCom, priceLevel45): newPriceBook = bsnGetPriceBookByPriceLevel(netTypeCloud, priceLevel45); break;
                            case bsnGetPriceBookByPriceLevel(netTypeCom, priceLevelSupport): newPriceBook = bsnGetPriceBookByPriceLevel(netTypeCloud, priceLevelSupport); break;
                            case bsnGetPriceBookByPriceLevel(netTypeCom, priceLevelCustom): newPriceBook = bsnGetPriceBookByPriceLevel(netTypeCloud, priceLevelCustom); break;
                            default: break;
                        }
                        subRecordFrom.setFieldValue('defaultrenewalpricebook', newPriceBook);
                        var recId = nlapiSubmitRecord( subRecordFrom );
                        /*ToDo: Add rerun if unavailable*/
                        bsRecreateSubs( {subId:recId} );
                        bsRecreateSubs( {subId:recId, isCleanup:'T', netType: nettypeFrom, netId: netFrom} );
                        //alert(recId);
                    }
                }
                jQuery(".loader-overlay").fadeOut(1000);
                win.close();
            }
        },{
            text: 'Cancel',
            handler: function(){
                jQuery(".loader-overlay").fadeOut(1000);
                win.close();
            }
        }],
        buttonAlign: 'center',
    });
    win.show();
}

function printNetworkInfoBSN(networkInfo){
    var nInfo = '';
    if( !isNullorEmpty( networkInfo ) ){        console.log("=================nlapiGetFieldValue('bsnc_form_add')=================\n" + nlapiGetFieldValue('bsnc_form_add'));
        if( nlapiGetFieldValue('bsnc_form_add') == 'yes' ) {
            createEmail = nlapiGetFieldValue('bsnc_addsubs_purchaser_email');
        } else {
            var netAdmin = nlapiGetFieldValue('bsnc_cnet_network_admin').search('@') == -1 ? '' : nlapiGetFieldValue('bsnc_cnet_network_admin');
            if (isNullorEmpty(netAdmin) && typeof (networkInfo.NetworkAdministrators) != 'undefined') {
                var netAdmins = networkInfo.NetworkAdministrators;
                if (netAdmins.length) {
                    netAdmin = netAdmins[0].Login;
                }
            }
            console.log("=================networkInfo=================\n" + JSON.stringify(networkInfo));
            nInfo = '<br>' + buttonStart + '<input type="button" value="Network Info" onclick="openNetworkInfoPage(' + networkInfo.Id + ', \'com\', \'' + networkInfo.Name + '\')" class="rndbuttoninpt bntBgT">' + buttonEnd;
            nInfo += '<br>' + buttonStart + '<input type="button" value="Subscription History" onclick="bsncSubscriptionHistory( 2 );return false;" class="rndbuttoninpt bntBgT">' + buttonEnd;
            nInfo += '<br>' + buttonStart + '<input type="button" value="Add Subscriptions" onclick="addBSNSubscriptions();" class="rndbuttoninpt bntBgT">' + buttonEnd;
            nInfo += '<br>' + buttonStart + '<input type="button" value="Transfer Subscriptions" onclick="transferBSNSubscriptions();" class="rndbuttoninpt bntBgT">' + buttonEnd;
        }
        if( typeof(networkInfo.Id) != 'undefined' ) {
            console.log("=================networkInfo=================\n" + JSON.stringify(networkInfo));
            nInfo += '<br><b>NETWORK INFO</b><br>';
            var isSuspended = networkInfo.IsLockedOut == 'true';
            nInfo += '<div style="border: 1px solid black; padding: 10px; width: 280px;' + (isSuspended?'background-color:#fee;':'') + '">';
            if( isSuspended ) nInfo += '<b style="color:darkred">Suspended: </b>' + networkInfo.LastLockoutDate + '<br>';
            nInfo += '<b>ID:</b> ' + networkInfo.Id + '<br>';
            if (typeof (networkInfo.Name) != 'undefined') {
                nInfo += '<b>Name:</b> ' + networkInfo.Name + '<br>';
            }
            console.log("=================typeof (networkInfo.SubscriptionsActivityPeriod)=================\n" + typeof (networkInfo.SubscriptionsActivityPeriod));
            if (typeof (networkInfo.SubscriptionsActivityPeriod) != 'undefined') {
                var periodInfo = bsnGetPeriodBySOAP( networkInfo.SubscriptionsActivityPeriod );
                nInfo += '<b>Activity Period:</b> ' + periodInfo.name + '<br>';
                networkIsCoTermed( false );
            } else {
                networkIsCoTermed( true );
            }
            console.log("=================typeof (networkInfo.SubscriptionsRenewalDate)=================\n" + typeof (networkInfo.SubscriptionsRenewalDate));
            if (typeof (networkInfo.SubscriptionsRenewalDate) != 'undefined') {
                nInfo += '<b>Expiration Date:</b> ' + networkInfo.SubscriptionsRenewalDate.substr(0,10) + '<br>';
            }
            if( typeof (networkInfo.quantity) == 'number' ){
                nInfo += '<b>Quantity:</b> ' + networkInfo.quantity + '<br>';
            }
            nInfo += '</div>';
            //jQuery('#custpage_netinfo_bsn_fs').html(nInfo);
        }
        console.log("=================typeof (networkInfo.NetworkAdministrators)=================\n" + typeof (networkInfo.NetworkAdministrators));
        if (typeof (networkInfo.NetworkAdministrators) != 'undefined') {
            var netAdmins = networkInfo.NetworkAdministrators;
            if( netAdmins.length ){
                nInfo += '</div><br>';
                nInfo += '<br><b>Administrators</b><br>';
                nInfo += '<div style="border: 1px solid black; padding: 10px; width: 280px;">';
            }
            for( var i = 0; i < netAdmins.length; i++ ){
                console.log("=================netAdmins i=================\n" + i);
                if( i ){
                    nInfo += '<span style="border-top: 1px solid #999; display: block; padding-top: 10px; margin-top: 10px;">';
                } else {
                    nInfo += '<span>';
                }
                console.log("=================typeof (netAdmins[i].Login)=================\n" + typeof (netAdmins[i].Login));
                if (!isNullorEmpty(netAdmins[i].Login) && typeof (netAdmins[i].Login) != 'undefined') {
                    if (!isNullorEmpty(netAdmins[i].Login) && typeof (netAdmins[i].Login) != 'undefined') {
                        nInfo += '<input type="radio" name ="bsnadministrator" id="bsnadministrator' + i + '" value="' + netAdmins[i].Login + '"' + (i ? '' : ' checked="checked"') + '> ';
                        nInfo += '<label for="bsnadministrator' + i + '">' + netAdmins[i].Login + '</label><br>';
                    }
                }
                nInfo += '</span>';
            }
        }
        nInfo += '</div>';
        if( nlapiGetFieldValue('bsnc_form_add') != 'yes' && nlapiGetFieldValue('bs_isdev') == 'T' ) {
            nInfo += '<br>' + buttonStart + '<input type="button" value="Add User" onclick="bsnFormCreateUserSubmit();" class="rndbuttoninpt bntBgT">' + buttonEnd;
        }
    }
    return nInfo;
}

function resFormCreateNetworkSubmit(){
    var networkAdmin = jQuery("#admin").val();
    var networkName = jQuery("#pop_name").val();
    var activityPeriod = jQuery("#period").val();
    var renewalDate = jQuery("#date").val();

    if( isNullorEmpty( networkAdmin ) ) return bsnMessage( 'ERROR', 'Please enter Network Admin Email!', 'error' );
    var emailreg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    var testResult = emailreg.test(networkAdmin);
    if( !testResult ) return bsnMessage( 'ERROR', 'Admin Email has wrong format!', 'error' );
    if( isNullorEmpty( networkName ) ) return bsnMessage( 'ERROR', 'Please enter Network Name!', 'error' );
    if( isNullorEmpty( activityPeriod ) ) {
        return bsnMessage( 'ERROR', 'Please enter Network Name!', 'error' );
    } else {
        switch( activityPeriod ){
            case 'Monthly': activityPeriod = 'P30D'; break;
            case 'Quarterly': activityPeriod = 'P90D'; break;
            case 'Annual': activityPeriod = 'P365D'; break;
            case '4': activityPeriod = 'P730D'; break;
            case '5': activityPeriod = 'P1095D'; break;
            default: return bsnMessage( 'ERROR', 'Invalid Activity Period!', 'error' );
        }
    }
    if( isNullorEmpty( renewalDate ) ) {
        return bsnMessage( 'ERROR', 'Please enter Network Subscriptions Renewal Date!', 'error' );
    }

    var result = soapCreateNetwork( networkAdmin, networkName, activityPeriod, getUTCDate( nlapiStringToDate(renewalDate) ) );

    if( isNullorEmpty( result.Name ) ){
        showAlertBox('error_network_not_created', 'Error Creating BSN Network', result, NLAlertDialog.TYPE_HIGH_PRIORITY);
    } else {
        showAlertBox('success_network_created', 'Network Created', 'You successfully created BSN Network "' + result.Name + '".', NLAlertDialog.TYPE_LOWEST_PRIORITY);
        bsnResFillNetworksList('' + networkAdmin + '');
        var selectNetwork = window.parent.document.getElementById('bsn_cnet_select_network');
        selectNetwork.value = '' + result.Id + '';
        return result.Id;
    }

    return -1;
}

function bsnResFillNetworksList( networkAdmin ){
    if( !isNullorEmpty( networkAdmin ) ){
        var networks = soapGetNetworksByCustomerEmail( networkAdmin );
        jQuery('#bsn_cnet_select_network').html('');
        if( isArray( networks ) ){
            for (var i = 0; i < networks.length; i++){
                jQuery('#bsn_cnet_select_network').append('<option value="' + networks[i][0] + '">' + networks[i][1] + '</option>');
            }
        } else {
            console.log( networks );
        }
    }
}

function bsnSBTakeOver( subID ) {

    if (0/*document.forms['main_form'].elements['linked'].value == 'F'*/ || confirm('This Quote has already been processed.  Are you sure you want to process again?'))
        window.open('/app/site/hosting/scriptlet.nl?script=782&deploy=1&id='+subID+'&whence=', 'sub' + subID);
}

function bsTakeOverSubscription( subID ){
    //var subID = nlapiGetRecordId();
    var sub = nlapiLoadRecord( 'subscription', subID );
    var customer = sub.getFieldValue( 'customer' );
    var endUser = sub.getFieldValue( 'custrecord_bsn_sub_end_user' );
    console.log( 'subID = ' + subID );
    console.log( 'customer = ' + customer );
    console.log( 'endUser = ' + endUser );

    if( endUser != '' && customer != endUser ){
        bsnSBTakeOver( subID );
    } else {
        Ext.MessageBox.show({
            title: 'ERROR',
            msg: 'Subscription has wrong End User! Take Over cannot proceed.',
            width: 300,
            buttons: Ext.MessageBox.OK,
            /*
            fn: function (btn, text) {
                if (btn == 'ok') {
                    nlapiSetFieldValue('bsn_addsubs_network_so', '');
                }
            },
            */
            icon: Ext.MessageBox.ERROR
        });
    }
    /*
    var customer = sub.getFieldValue( 'customer' );
    var network =sub.getFieldValue( 'custrecord_sub_network_id' );
    var scriptPreventRenewal = sub.getFieldValue( 'custrecord_bsn_script_suppress_renewal' );
    console.log( '!isNullorEmpty( endUser ) = ' + !isNullorEmpty( endUser ) );
    console.log( 'endUser != customer = ' + ( endUser != customer ) );
    console.log( 'scriptPreventRenewal == "T" = ' + ( scriptPreventRenewal == 'T' ) );
    if( !isNullorEmpty( endUser ) && endUser != customer ){
        if( scriptPreventRenewal == 'F' ){
            alert( 'reseller can be applied' );
            sub.setFieldValue( 'custrecord_bsn_script_suppress_renewal', 'T' );
            sub.setFieldValue( 'defaultrenewalmethod', '' ); //CREATE_NEW_SUBSCRIPTION
            sub.setFieldValue( 'autorenewal', 'F' );
            nlapiSubmitRecord( sub );
            return true;
        }
    } else {
        if( scriptPreventRenewal == 'F' ){
            alert( 'customer can be applied' );
        }
    }
    */
}

function bsncGetPendingCharges( subId ){
    var filters = [];
    if( !isNullorEmpty( subId ) ){
        filters.push(new nlobjSearchFilter('subscription',null,'is',subId));
    }

    var invLines = nlapiSearchRecord( 'transaction', 'customsearch_sb_items_to_process_2', filters );
    //console.log(invLines);
    var toProcess = [];
    var items = [];
    if( invLines && invLines.length ){
        for( var i = 0; i < invLines.length; i++ ){
            var item = {};
            item.invId = invLines[i].getId();
            item.subId = invLines[i].getValue('subscription');
            item.line = invLines[i].getValue('line');
            item.startdate = invLines[i].getValue('revrecstartdate');
            item.enddate = invLines[i].getValue('revrecenddate');
            item.quantity = invLines[i].getValue('quantity');
            item.customer = invLines[i].getValue('entity');
            item.bsnType = invLines[i].getValue('custrecord_bsn_type', 'subscription');
            item.netId = invLines[i].getValue('custrecord_sub_network_id', 'subscription');
            item.billingAccount = invLines[i].getValue('billingaccount');
            item.amount = invLines[i].getValue('amount');
            item.subStartDate = invLines[i].getValue('startdate', 'subscription');
            item.subEndDate = invLines[i].getValue('enddate', 'subscription');
            item.isRenewal = invLines[i].getValue('renewalnumber', 'subscription') > 0;
            items.push(item.subId);
            var curIndex = search(item.subId, toProcess, 'subId');
            //nlapiLogExecution("DEBUG", 'item ' + i, JSON.stringify(item));
            if( curIndex == -1 ){
                toProcess.push({subId:item.subId, charges:[item]});
            } else {
                toProcess[curIndex].charges.push(item);
            }
        }
        //nlapiLogExecution("DEBUG", 'toProcess.length', toProcess.length);
        for( i = 0; i < toProcess.length; i++ ){
            if( toProcess[i].charges.length > 1 ){
                toProcess[i].charges.sort(function(a,b){if(nlapiStringToDate(a.startdate) < nlapiStringToDate(b.startdate))return -1;if(nlapiStringToDate(a.startdate) > nlapiStringToDate(b.startdate))return 1;return 0});
            }
        }
    }
    //nlapiLogExecution("DEBUG", 'items', JSON.stringify(items));
    //nlapiLogExecution("DEBUG", 'toProcess', JSON.stringify(toProcess));
    return toProcess;
}

function bsncInitSubsCreation( subId ){
    var queue = [];
    var toProcess = bsncGetPendingCharges( subId );
    if( toProcess && toProcess.length ){
        var today = new Date();
        for( var i = 0; i < toProcess.length; i++ ){
            var charges = toProcess[i].charges;
            if( charges && charges.length ){
                if( charges.length > 1 ){
                    var selectedIndex = -1;
                    var processing = { subId:toProcess[i].subId, quantity:0, charges:[] };
                    var curDate = nlapiStringToDate( charges[0].startdate );
                    for( var k = 0; k < charges.length; k++ ){
                        var chargeDate = nlapiStringToDate( charges[k].startdate );
                        if( chargeDate <= today ){
                            processing.charges.push( charges[k] );
                            if( chargeDate > curDate ) {
                                curDate = chargeDate;
                                selectedIndex = k;
                            }
                        }
                    }
                    if( selectedIndex != -1 ){
                        processing.quantity = charges[selectedIndex].quantity;
                        //console.log( charges[selectedIndex] );
                        queue.push(processing);
                    }
                } else {
                    if( nlapiStringToDate( charges[0].startdate ) <= today ) {
                        //console.log(charges[0]);
                        queue.push({subId:toProcess[i].subId, quantity:toProcess[i].charges[0].quantity, charges: charges});
                    }
                }
            }
        }
    }
    /*TODO: Omit Subscriptions that are Closed for more than 30 days*/
    return queue;
}

function bsncInitEmailSending( subId ){
    var queue = [];
    var toProcess = bsncGetPendingCharges( subId );
    if( toProcess && toProcess.length ){
        var today = new Date();
        for( var i = 0; i < toProcess.length; i++ ){
            var charges = toProcess[i].charges;
            if( charges && charges.length ){
                for( var k = 0; k < charges.length; k++ ){
                    if( nlapiStringToDate( charges[k].startdate ).getTime() === nlapiStringToDate( charges[k].subStartDate ).getTime() && charges[k].isRenewal ) {
                        queue.push({subId:toProcess[i].subId, quantity:toProcess[i].charges[k].quantity, charges: charges});
                    }
                }
            }
        }
    }
    nlapiLogExecution("DEBUG", 'queue', JSON.stringify(queue));
    return queue;
}

function formCreateSubsButtonSubmit(  ){
    var parameters = '&custscript_sb_bsnc_script=customscript_sb_bsnc_ss_subs_operations&custscript_sb_bsnc_is_single_op=F';
    var a = {'User-Agent-x': 'SuiteScript-Call'};
    try {
        var url = nlapiResolveURL('SUITELET', 'customscript_sb_bsnc_ssrunner_su', 'customdeploy_sb_bsnc_ssrunner_su');
        console.log(url + parameters);
        var response = nlapiRequestURL(url + parameters, null, a);
        var objResponse = JSON.parse(response.getBody());
        console.log(objResponse);
        bsnMessage("Result", objResponse.status, 'info');
    } catch (ex) {
        bsnMessage("ERROR", ex.message, 'error');
    }
}

function formSendEmailsButtonSubmit( args ){
    var parameters = '&custscript_sb_bsnc_script=bsnc_ss_renewal_emails&custscript_sb_bsnc_subtype=' + args.subtype + '&custscript_sb_bsnc_period=' + args.period;
    var a = {'User-Agent-x': 'SuiteScript-Call'};
    try {
        var url = nlapiResolveURL('SUITELET', 'customscript_sb_bsnc_ssrunner_su', 'customdeploy_sb_bsnc_ssrunner_su');
        console.log(url + parameters);
        var response = nlapiRequestURL(url + parameters, null, a);
        var objResponse = JSON.parse(response.getBody());
        console.log(objResponse);
        bsnMessage("Result", objResponse.status, 'info');
    } catch (ex) {
        bsnMessage("ERROR", ex.message, 'error');
    }
}

function bsncCreateSubsForSingleSubscription( subId ){
        var parameters = '&custscript_sb_bsnc_script=customscript_sb_bsnc_ss_subs_operations&custscript_sb_bsnc_is_single_op=T&custscript_sb_bsnc_subid=' + subId;
        var a = {'User-Agent-x': 'SuiteScript-Call'};
        try {
            var url = nlapiResolveURL('SUITELET', 'customscript_sb_bsnc_ssrunner_su', 'customdeploy_sb_bsnc_ssrunner_su');
            //console.log(url + parameters);
            nlapiLogExecution("DEBUG", "Scheduling URL", url + parameters);
            var response = nlapiRequestURL(url + parameters, null, a);
            var objResponse = JSON.parse(response.getBody());
            nlapiLogExecution("DEBUG", "Scheduling Result", objResponse.status);
        } catch (ex) {
            nlapiLogExecution("ERROR", 'error', ex.message);
        }
}

function bsncConvertComToCloudOpen(networkID, networkType, networkName){
    var param = '&bsnc_network=' + networkID + '&bsnc_type=' + networkType + '&bsnc_network_name=' + networkName;
    var scriptURL = nlapiResolveURL('SUITELET', 'customscript_bsnc_sl_network_convert', 'customdeploy_bsnc_sl_network_convert');
    //if (0/*document.forms['main_form'].elements['linked'].value == 'F'*/ || confirm('This Quote has already been processed.  Are you sure you want to process again?'))
    window.open(scriptURL + param, 'netconv' + networkID);
}

function networkConvertToControl( netID ){
    var res = soapSetNetworkContentBSNC( netID, 'Control' );
    if( res.result ){
        location.reload();
    } else {
        bsnMessage( 'ERROR', res.message, 'error' );
    }
}

function networkSuspend( networkId, suspend, dontReload ){
    var networkInfo = soapGetNetworkByIdBSNC( networkId, false );
    console.log(networkInfo);
    if( !networkInfo.IsError ) {
        var updateRes = soapUpdateNetworkBSNC(networkInfo.Id, networkInfo.Name, networkInfo.SubscriptionsActivityPeriod, networkInfo.SubscriptionsRenewalDate, suspend);
        if (updateRes.result) {
            if( !dontReload ) {
                console.log(updateRes);
                location.reload();
            }
        } else {
            bsnMessage('ERROR', updateRes.error, 'error');
        }
    } else {
        bsnMessage('ERROR', "Couldn't load Network Info.<br>" + networkInfo.Message, 'error');
    }
}

function addFilter( filters, newFilter ){
    var newFilters = [];
    for( var i = 0; i < filters.length; i++ ){
        newFilters.push( filters[i] );
    }
    newFilters.push(newFilter);

    return newFilters;
}