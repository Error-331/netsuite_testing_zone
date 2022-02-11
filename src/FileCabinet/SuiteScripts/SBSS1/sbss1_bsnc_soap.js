/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       15 May 2019     Eugene Karakovsky
 *
 */

function bsncInitFields(){
    var today = new Date(); //Date to use as search filter
    var formattedDate = nlapiDateToString(today); //Converts date to format based on user preference
    nlapiSetFieldValue('bsnc_addsubs_start_date', formattedDate);
    nlapiSetFieldValue('bsnc_createsub_start_date', formattedDate);
    // Init GetNetworkName Form
    var networkAdmin = nlapiGetFieldValue('bsnc_getname_network_admin');
    bsncFillNetworksList( networkAdmin );
}

function sbReloadCreateForm(){
    var customer = nlapiGetFieldValue('bsnc_createsub_customer');
    var billing = nlapiGetFieldValue('bsnc_createsub_customer');
    var priceBook = nlapiGetFieldValue('bsnc_createsub_customer');
    var networkId = nlapiGetFieldValue('bsnc_createsub_select_network');
    var purchaserEmail = nlapiGetFieldValue('bsnc_createsub_purchaser_email');
    var endUser = nlapiGetFieldValue('bsnc_createsub_enduser');
    var suitelet = nlapiResolveURL('SUITELET', 'customscript_sb_bsnc_create_subscription', 'customdeploy_sb_bsnc_create_subscription');
    var add = '';
    add += '&bsnc_email=' + purchaserEmail;
    add += '&bsnc_customer=' + customer;
    add += '&bsnc_enduser=' + endUser;
    add += '&bsnc_network=' + networkId;
    add += '&bsnc_billing=' + billing;
    add += '&bsnc_pricebk=' + priceBook;
    console.log("=================suitelet=================\n" + suitelet + add);
    setWindowChanged(window, false);
    window.location = suitelet + add;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */
function bsncFieldChanged(type, name) {
    console.log('changed: ' + name);

    if (name == 'bsnc_createsub_customer') {
        var customerId = nlapiGetFieldValue('bsnc_createsub_customer');
        if (!isNullorEmpty(nlapiGetFieldValue('bs_onload'))) {
            if (!isNullorEmpty(customerId)) {
                var purchaserEmail = nlapiGetFieldValue('bsnc_createsub_purchaser_email');
                var resellerEmail = nlapiGetFieldValue('bsnc_createsub_reseller_email');
                if (isNullorEmpty(purchaserEmail)) {
                    purchaserEmail = nlapiLookupField('customer', customerId, 'email');
                    nlapiSetFieldValue('bsnc_createsub_purchaser_email', purchaserEmail);
                    var networks = soapGetNetworksByCustomerEmailBSNC(purchaserEmail);
                    jQuery('#bsnc_createsub_select_network').html('<option value="">+ Create New</option>');
                    for (var i = 0; i < networks.length; i++) {
                        jQuery('#bsnc_createsub_select_network').append('<option value="' + networks[i][0] + '"' + networks[i][2] + '>' + networks[i][1] + '</option>');
                    }
                    console.log(networks);
                }
                if (isNullorEmpty(resellerEmail)) {
                    resellerEmail = nlapiLookupField('customer', customerId, 'custentity_bs_email_address');
                    nlapiSetFieldValue('bsnc_createsub_reseller_email', resellerEmail);
                }
            }
        } else {
            sbReloadCreateForm();
            return true;
        }
    }

    if (name == 'bsnc_createsub_purchaser_email') {
        var purchaserEmail = nlapiGetFieldValue('bsnc_createsub_purchaser_email');
        jQuery('#bsnc_createsub_select_network').html('<option value="">+ Create New</option>');
        if( !isNullorEmpty( purchaserEmail ) ){
            var networks = soapGetNetworksByCustomerEmailBSNC(purchaserEmail);
            for (var i = 0; i < networks.length; i++){
                jQuery('#bsnc_createsub_select_network').append('<option value="' + networks[i][0] + '"' + networks[i][2] + '>' + networks[i][1] + '</option>');
            }
            console.log(networks);
        }
    }

    if (name == 'bsnc_cnet_network_admin') {
        var purchaserEmail = nlapiGetFieldValue('bsnc_cnet_network_admin');
        jQuery('#bsnc_cnet_select_network').html('<option value="">+ Create New</option>');
        if( !isNullorEmpty( purchaserEmail ) ){
            var networks = soapGetNetworksByCustomerEmailBSNC(purchaserEmail);
            for (var i = 0; i < networks.length; i++){
                jQuery('#bsnc_cnet_select_network').append('<option value="' + networks[i][0] + '"' + networks[i][2] + '>' + networks[i][1] + '</option>');
            }
            console.log(networks);
            jQuery('#custpage_netinfo_fs').html('');
        }
    }

    if( name == 'bsnc_cnet_select_network' ) {
        jQuery('#custpage_netinfo_fs').text('');
        jQuery('#bsnc_create_network_button').prop( "disabled", false );
        var networkId = nlapiGetFieldValue('bsnc_cnet_select_network');
        var isPopup = nlapiGetFieldValue('bs_ispopup');
        console.log("=================networkId=================\n" + networkId);
        if (networkId != '') {
            console.log("=================!isNullorEmpty( nlapiGetFieldValue('bs_onload') )=================\n" + !isNullorEmpty(nlapiGetFieldValue('bs_onload')));
            if (!isNullorEmpty(nlapiGetFieldValue('bs_onload'))) {
                nlapiSetFieldValue("bs_default_network", ""); // Reset hidden default network
                networkInfo = soapGetNetworkByIdBSNC(networkId);
                console.log("=================networkInfo=================\n" + networkInfo);
                if( !isNullorEmpty( networkInfo ) ){
                    if( typeof(networkInfo.Id) != 'undefined' ) {
                        if( isNullorEmpty( isPopup ) ){
                            jQuery('#custpage_netinfo_fs').html(printNetworkInfo(networkInfo));
                        }
                        jQuery('#bsnc_create_network_button').prop( "disabled", true );
                    }
                }
            } else {
                var purchaserEmail = nlapiGetFieldValue('bsnc_cnet_network_admin');
                var suitelet = nlapiResolveURL('SUITELET', 'customscript_bsnc_sl_create_network_ui', 'customdeploy_bsnc_sl_create_network_ui');
                var add = '';
                add += '&bsn_email=' + purchaserEmail;
                add += '&bsn_network=' + networkId;
                add += '&bsn_ispopup=' + isPopup;
                console.log("=================suitelet=================\n" + suitelet + add);
                setWindowChanged(window, false);
                window.location = suitelet + add;
                return true;
            }
        }
    }

    if (name == 'bsnc_tsui_customer') {
        var customerId = nlapiGetFieldValue('bsnc_tsui_customer');
        console.log(customerId);
        if( !isNullorEmpty(customerId) ){
            var purchaserEmail = nlapiGetFieldValue('bsnc_tsui_purchaser_email');
            console.log(purchaserEmail);
            if( isNullorEmpty( purchaserEmail ) ){
                purchaserEmail = nlapiLookupField('customer', customerId, 'email');
                console.log(purchaserEmail);
                nlapiSetFieldValue('bsnc_tsui_purchaser_email', purchaserEmail);
                var networks = soapGetNetworksByCustomerEmailBSNC(purchaserEmail);
                jQuery('#bsnc_tsui_network').html('');
                for (var i = 0; i < networks.length; i++){
                    var net = soapGetNetworkByIdBSNC( networks[i][0] );
                    if( !net.isTrial && !net.wasTrial ) {
                        jQuery('#bsnc_tsui_network').append('<option value="' + networks[i][0] + '">' + networks[i][1] + '</option>');
                    }
                }
                console.log(networks);
            }
        }
    }

    if (name == 'bsnc_tsui_purchaser_email') {
        var purchaserEmail = nlapiGetFieldValue('bsnc_tsui_purchaser_email');
        jQuery('#bsnc_tsui_network').html('<option value=""></option>');
        if( !isNullorEmpty( purchaserEmail ) ){
            var networks = soapGetNetworksByCustomerEmailBSNC(purchaserEmail);
            jQuery('#bsnc_tsui_network').html('');
            for (var i = 0; i < networks.length; i++){
                var net = soapGetNetworkByIdBSNC( networks[i][0] );
                if( !net.isTrial && !net.wasTrial ) {
                    jQuery('#bsnc_tsui_network').append('<option value="' + networks[i][0] + '">' + networks[i][1] + '</option>');
                }
            }
            console.log(networks);
        }
    }

    if (name == 'bsnc_delsubs_customer') {
        var purchaserEmail = '';
        var customerId = nlapiGetFieldValue('bsnc_delsubs_customer');

        jQuery('#bsnc_delsubs_select_network').html('');

        if( !isNullorEmpty(customerId) ){
            purchaserEmail = nlapiLookupField('customer', customerId, 'email');
            nlapiSetFieldValue('bsnc_delsubs_network_admin', purchaserEmail);
            var networks = soapGetNetworksByCustomerEmailBSNC(purchaserEmail);
            for (var i = 0; i < networks.length; i++){
                jQuery('#bsnc_delsubs_select_network').append('<option value="' + networks[i][0] + '">' + networks[i][1] + '</option>');
            }
            console.log(networks);
        }
    }
/**/
    if (name == 'bsnc_createsub_select_network') {
        var customer = nlapiGetFieldValue('bsnc_createsub_customer');
        var networkId = nlapiGetFieldValue('bsnc_createsub_select_network');
        var activityPeriod = 1;
        var itemId = sbBSNSettings.bsnc1yrItemNum;

        if( isNullorEmpty( networkId ) ){
            nlapiSetFieldValue('bsnc_createsub_activity_period', 1);
            nlapiSetFieldValue('bsnc_createsub_anniversary_date', '');
            nlapiSetFieldValue('bsnc_createsub_customer_price', '');
            nlapiSetFieldValue('bsnc_createsub_price', '');
        } else {
            var networkInfo = soapGetNetworkByIdBSNC( networkId );
            switch( networkInfo.SubscriptionsActivityPeriod ){
                case 'P365D': activityPeriod = 3; itemId = sbBSNSettings.bsnc1yrItemNum; break;
                default: ;//alert("Network has non-standard Activity Period. It must be changed to standard first or use another Network.");
            }
            nlapiSetFieldValue('bsnc_createsub_activity_period', /*activityPeriod*/3);

            var networkRenewalDate = moment(parseSOAPDateBSNC( networkInfo.SubscriptionsRenewalDate ));

            if( networkRenewalDate ){
                if( networkInfo.isContent ){
                    nlapiSetFieldValue('bsnc_createsub_anniversary_date', nlapiDateToString( networkRenewalDate.toDate() ));
                } else {
                    nlapiSetFieldValue('bsnc_createsub_anniversary_date', nlapiDateToString( moment().add(1, 'year').toDate() ));
                }
            } else {
                nlapiSetFieldValue('bsnc_createsub_anniversary_date', '');
            }
            console.log('isContent ' + networkInfo.isContent);

            var customerPriceLevel = nlapiLookupField('customer', customer, 'pricelevel');
            var customerPrices = bsncGetPriceLevels( itemId );
            var newPrice = 0;
            var newPriceLevel = -1;
            if( !isNullorEmpty( customerPriceLevel ) ){
                if( !isNullorEmpty( customerPrices[customerPriceLevel] ) ){
                    newPrice = customerPrices[customerPriceLevel];
                    newPriceLevel = customerPriceLevel;
                } else {
                    if( !isNullorEmpty( customerPrices[1] ) ){ //base price
                        newPrice = customerPrices[1];
                        newPriceLevel = 1;
                    } else {
                        newPrice = 0;
                        newPriceLevel = -1;
                    }
                }
            } else {
                if( !isNullorEmpty( customerPrices[1] ) ){ //base price
                    newPrice = customerPrices[1];
                    newPriceLevel = 1;
                } else {
                    newPrice = 0;
                    newPriceLevel = -1;
                }
            }

            nlapiSetFieldValue('bsnc_createsub_customer_price', newPrice);
            nlapiSetFieldValue('bsnc_createsub_price', newPrice);

            bsAddSubsFillSubscriptionList( networkId );
            var subscription = bsGetSubscriptionByNetid( networkId, customer, 1 );
            console.log('tr3');
            bsGetSubscriptionInfo( subscription.subId );
        }






        jQuery('#custpage_netinfo_fs').text('');
        //jQuery('#bsnc_create_network_button').prop( "disabled", false );
        //var networkId = nlapiGetFieldValue('bsnc_cnet_select_network');
        var isPopup = nlapiGetFieldValue('bs_ispopup');
        console.log("=================networkId=================\n" + networkId);
        if (networkId != '') {
            console.log("=================!isNullorEmpty( nlapiGetFieldValue('bs_onload') )=================\n" + !isNullorEmpty(nlapiGetFieldValue('bs_onload')));
            if (!isNullorEmpty(nlapiGetFieldValue('bs_onload'))) {
                nlapiSetFieldValue("bs_default_network", ""); // Reset hidden default network
                networkInfo = soapGetNetworkByIdBSNC(networkId);
                console.log("=================networkInfo=================\n" + networkInfo);
                if( !isNullorEmpty( networkInfo ) ){
                    if( typeof(networkInfo.Id) != 'undefined' ) {
                        if( isNullorEmpty( isPopup ) ){
                            jQuery('#custpage_netinfo_fs').html(printNetworkInfo(networkInfo));
                        }
                        jQuery('#bsnc_create_network_button').prop( "disabled", true );
                    }
                }
            } else {
                sbReloadCreateForm();
                return true;
            }
        }
    }

    if( name == 'bsnc_createsub_custom_price' ){
        var editedPrice = nlapiGetFieldValue('bsnc_createsub_price');
        var customerPrice = nlapiGetFieldValue('bsnc_createsub_customer_price');
        var customPriceCheck = nlapiGetFieldValue('bsnc_createsub_custom_price');
    }

    if( name == 'bsnc_createsub_price' ){
        var editedPrice = nlapiGetFieldValue('bsnc_createsub_price');
        var customerPrice = nlapiGetFieldValue('bsnc_createsub_customer_price');
        var customPriceCheck = nlapiGetFieldValue('bsnc_createsub_custom_price');
        if( parseInt(editedPrice) > 0 ){
            if( editedPrice === customerPrice ){
                nlapiSetFieldValue('bsnc_createsub_custom_price', 'F');
            } else {
                nlapiSetFieldValue('bsnc_createsub_custom_price', 'T');
            }
        }
        console.log(nlapiGetFieldValue('bsnc_createsub_price'));
        console.log(nlapiGetFieldValue('bsnc_createsub_customer_price'));
        console.log(nlapiGetFieldValue('bsnc_createsub_custom_price'));
    }

    if( name == 'bsnc_createsub_billing' ){
        var billingAccount = nlapiGetFieldValue('bsnc_createsub_billing');
        if( !isNullorEmpty(billingAccount) ){
            var billingRec = nlapiLoadRecord('billingaccount', billingAccount);
            if( billingRec ){
                var billingDate = billingRec.getFieldValue('nextbillcycledate');
                if( !isNullorEmpty( billingDate ) ){
                    var startDate = nlapiStringToDate( nlapiGetFieldValue('bsnc_createsub_start_date') );
                    console.log( startDate );
                    var renewDate = nlapiStringToDate( billingDate );
                    console.log( renewDate );
                    while( !(startDate < renewDate) ){
                        renewDate.setFullYear(renewDate.getFullYear() + 1);
                    }
                    nlapiSetFieldValue('bsnc_createsub_anniversary_date', nlapiDateToString( renewDate ));
                }
            }
        }
    }

    if (name == 'bsnc_getname_network_admin') {
        var purchaserEmail = nlapiGetFieldValue('bsnc_getname_network_admin');

        jQuery('#bsnc_getname_select_network').html('<option value="">+ Create New</option>');

        if( !isNullorEmpty(purchaserEmail) ){
            var networks = soapGetNetworksByCustomerEmailBSNC(purchaserEmail);
            for (var i = 0; i < networks.length; i++){
                jQuery('#bsnc_getname_select_network').append('<option value="' + networks[i][0] + '">' + networks[i][1] + '</option>');
            }
            console.log(networks);
        }
    }

    if (name == 'bsnc_getname_select_network') {
        var networkId = nlapiGetFieldValue('bsnc_getname_select_network');
        var activityPeriod = nlapiGetFieldValue('bsnc_getname_activity_period');
        var renewalDate = nlapiGetFieldValue('bsnc_getname_renewal_date');
        var startDate = nlapiGetFieldValue("bsnc_getname_start_date");

        jQuery('#bsnc_getname_network_info').html('');

        if( !isNullorEmpty(networkId) ){
            var networkInfo = soapGetNetworkByIdBSNC( networkId );

            console.log(networkInfo);

            if( !isNullorEmpty(networkInfo.SubscriptionsActivityPeriod) && !isNullorEmpty(networkInfo.SubscriptionsRenewalDate)){
                var contractPeriod = ['P1D','P30D','P90D','P365D'];
                var periodName = ['1 Day','1 Month','3 Months','1 Year'];
                if( contractPeriod.indexOf(networkInfo.SubscriptionsActivityPeriod) == -1 ){
                    jQuery('#bsnc_getname_network_info').html('<br>Network has wrong Activity Period set!<br>Should be one of:<br>1 Month, 3 Months, 1 Year');
                }else if(contractPeriod.indexOf(networkInfo.SubscriptionsActivityPeriod) != activityPeriod){
                    jQuery('#bsnc_getname_network_info').html('<br>Your Period: ' + periodName[activityPeriod] + '<br>Network Period: <span style="color:red">' + periodName[contractPeriod.indexOf(networkInfo.SubscriptionsActivityPeriod)] + '</span><br><br>This Network cannot be used!');
                }else{
                    var endDate = parseSOAPDateBSNC( networkInfo.SubscriptionsRenewalDate );
                    endDate = moment(endDate);//.subtract(1, 'days');
                    if( endDate.diff(moment(renewalDate), 'days') < 0 || endDate.diff(moment(renewalDate), 'days') >= 1 ){
                        if( endDate < moment(startDate) ){
                            jQuery('#bsnc_getname_network_info').html('<br>Sales Order Start Date (' + startDate + ') is later than Network End Date (' + endDate.format('M/D/YYYY') + ')<br>Please update this Network\'s Renewal Date or Renew it\'s Subscriptions first!');
                        } else if( endDate > moment(renewalDate) ){
                            jQuery('#bsnc_getname_network_info').html('<br>Network End Date (' + endDate.format('M/D/YYYY') + ') is later than Sales Order End Date (' + renewalDate + ')<br>If you use this network, the amount charged will be for more than 1 Subscription term!');
                        }else{
                            var logRenewalDate = moment(endDate).add(1, 'days');
                            jQuery('#bsnc_getname_network_info').html('<br>Your Renewal Date: ' + renewalDate + '<br>Network Renewal Date: <span style="color:red">' + moment(logRenewalDate).format('M/D/YYYY') + '</span><br><br>End Date and amount of the Sales Order will be changed!');
                        }
                    } else {
                        jQuery('#bsnc_getname_network_info').html('<br><span style="color:green">Network can be used!</span>');
                    }
                }
            }else{
                jQuery('#bsnc_getname_network_info').html('<br>Network is of a wrong type.<br>You should convert this network first!');
            }
        }
    }

    if( name == 'bsnc_upd_network_admin' ){
        var adminEmail = nlapiGetFieldValue('bsnc_upd_network_admin');

        jQuery('#bsnc_upd_network_name').html('<option value=""></option>');

        if( !isNullorEmpty( adminEmail ) ){
            var networks = soapGetNetworksByCustomerEmailBSNC(adminEmail);
            console.log(networks);
            for (var i = 0; i < networks.length; i++){
                jQuery('#bsnc_upd_network_name').append('<option value="' + networks[i][0] + '">' + networks[i][1] + '</option>');
            }
        }
    }

    if (name == 'bsnc_upd_network_name') {
        var networkId = nlapiGetFieldValue('bsnc_upd_network_name');
        var activityPeriod = 1;

        jQuery('#bsnc_upd_network_info').html('');

        if( isNullorEmpty( networkId ) ){
            nlapiSetFieldValue('bsnc_upd_activity_period', 1);
            nlapiSetFieldValue('bsnc_upd_renewal_date', '');
        } else {
            var subsCount = soapNetworkSubscriptionsCountBSNC( networkId );
            if( subsCount.quantity != 0 ){
                jQuery('#bsnc_upd_network_info').html('<br><span style="color:red">Network has active Commercial Subscriptions (' + subsCount.quantity + ').<br>To convert/update it you have to remove those Commercial Subscriptions first.</span>');
            }
            var networkInfo = soapGetNetworkByIdBSNC( networkId );
            switch( networkInfo.SubscriptionsActivityPeriod ){
                case 'P30D': activityPeriod = 1; break;
                case 'P90D': activityPeriod = 2; break;
                case 'P365D': activityPeriod = 3; break;
                default: jQuery('#bsn_upd_network_info').html('<br><span style="color:red">Network has non-standard Activity Period. It must be changed to standard first or use another Network.</span>');
            }
            nlapiSetFieldValue('bsnc_upd_activity_period', activityPeriod);

            var networkRenewalDate = parseSOAPDateBSNC( networkInfo.SubscriptionsRenewalDate );
            if( networkRenewalDate ){
                nlapiSetFieldValue('bsnc_upd_renewal_date', nlapiDateToString( networkRenewalDate ));
            } else {
                nlapiSetFieldValue('bsnc_upd_renewal_date', '');
            }
        }
    }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord salesorder
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort value change
 */
function bsncValidateField(type, name, linenum){
    var valid = true;
    console.log('validate: ' + name);
    if (name == 'bsnc_addsubs_select_network') {
        var customer = nlapiGetFieldValue('bsnc_addsubs_customer');
        if( isNullorEmpty( customer ) ){
            alert('Please select Customer first!');
            valid = false;
        }
    }
    return valid;
}

function bsncAddSubscriptionsSubmitBSNC1(){
    var customer = nlapiGetFieldValue('bsnc_addsubs_customer');
    var endUser = nlapiGetFieldValue('bsnc_addsubs_enduser')||customer;
    var adminEmail = nlapiGetFieldValue('bsnc_addsubs_purchaser_email');
    var resellerEmail = nlapiGetFieldValue('bsnc_addsubs_reseller_email');
    var activationDate = nlapiGetFieldValue('bsnc_addsubs_start_date');
    var terminateDate = nlapiGetFieldValue('bsnc_addsubs_terminate_date');
    var endDate = nlapiGetFieldValue('bsnc_addsubs_anniversary_date');
    var anniversaryDate = nlapiGetFieldValue('bsnc_addsubs_anniversary_date');
    var activityPeriod = nlapiGetFieldValue('bsnc_addsubs_activity_period');
    var subsCount = parseInt(nlapiGetFieldValue('bsnc_addsubs_count'));
    var customerPrice = nlapiGetFieldValue('bsnc_addsubs_price');
    var isCustomPrice = nlapiGetFieldValue('bsnc_addsubs_custom_price');
    var networkName = nlapiGetFieldValue('bsnc_addsubs_select_network');
    var billingAccount = nlapiGetFieldValue('bsnc_addsubs_billing_account');
    var po = nlapiGetFieldValue('bsnc_addsubs_po');
    var salesrep = nlapiGetFieldValue('bsnc_addsubs_salesrep')||'';

    var convertItemId = sbBSNSettings.bsnc1yrItemText;
    var months = 12;

    if( isNullorEmpty( customer ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select a Customer!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( billingAccount ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select a Billing Account!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( !isBillingAccountEligible( billingAccount, endDate ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'This Billing Account is Not Eligible for this Renewal Date!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( adminEmail ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Admin Email!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( activityPeriod ) ) {
        return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select subscription Activity Period!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    } else {
        switch( activityPeriod ){
            case '3': activityPeriod = 'P365D'; convertItemId = sbBSNSettings.bsnc1yrItemText; months = 12; break;
            default: return Ext.MessageBox.show({title : 'ERROR', msg : 'Invalid Activity Period!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
        }
    }
    if( isNullorEmpty( activationDate ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Subscriptions Activation Date!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( !isNullorEmpty( terminateDate ) ) {
        var termDate = nlapiStringToDate( terminateDate );
        return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Subscriptions Anniversary Date!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    }
    if( isNullorEmpty( subsCount ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Subscriptions Count!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( customerPrice ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Price of 1 Subscription!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( networkName ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select a Network Name!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});

    //var endDate = nlapiDateToString( moment( nlapiStringToDate( anniversaryDate ) ).subtract( 1, 'd' ).toDate() );
    var startDate = activationDate;//nlapiDateToString( moment( nlapiStringToDate( anniversaryDate ) ).subtract( 1, 'y' ).toDate() );
    var endDate = nlapiDateToString( moment( nlapiStringToDate( anniversaryDate ) ).subtract( 1, 'd' ).toDate() );

    var revRecStartDate = nlapiDateToString( moment(nlapiStringToDate(startDate)).startOf('month').toDate() );
    var revRecEndDate = bsncRevRecEndDate( moment(nlapiStringToDate(startDate)), endDate, months );

    var networkInfo = soapGetNetworkByIdBSNC( networkName );
    console.log(networkInfo);

    var netPeriod = 'P365D';//networkInfo.SubscriptionsActivityPeriod;

    if( activityPeriod == netPeriod ){
        var pricePercentage = getPricePercentageBSNC( customerPrice, activityPeriod, startDate, endDate, subsCount );

        if( pricePercentage['deltaDuration'] < 0 ){
            Ext.MessageBox.show({title : 'ERROR', msg : 'ERROR: Renewal Date is in the past!<br>Please, update network renewal date first.', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
        } else {
            /***Gather existing subscriptions***/
            var existingText = '';
            var existingSubscriptionRecords = bsncGetSubscriptionsByNetid( networkName, 1 );
            if( existingSubscriptionRecords.length ){
                existingText = "There are other Subscription Records feeding Subs to this Network:<br>";
                for( var k = 0; k < existingSubscriptionRecords.length; k++ ){
                    existingText += (k+1) + ') <a href="' + nlapiResolveURL('RECORD', 'subscription', existingSubscriptionRecords[k].subId) + '" target="_blank">' + existingSubscriptionRecords[k].subName + '</a> owned by <a href="' + nlapiResolveURL('RECORD', 'customer', existingSubscriptionRecords[k].customerId) + '">' + existingSubscriptionRecords[k].subCustomer + '</a><br><br>';
                }
                existingText += 'Are you sure you want to continue?';
            }
            /********/

            jQuery(".loader-overlay").fadeIn(1000);
            Ext.MessageBox.show({
                title: 'Preview Data',
                msg: existingText == '' ? 'Subscription Record for will be created now.<br>Are you sure?' : existingText,
                width: 400,
                buttons: Ext.MessageBox.OKCANCEL,
                fn: function (btn, text) {
                    if (btn == 'ok') {
                        var percent = 100;
                        if( pricePercentage['percent'] > 0 ){
                            percent = pricePercentage['percent'];
                        }
                        var firstPrice = roundTo(customerPrice * percent / 100, 2);

                        var month = moment().format('MMM').toLowerCase();

                        var newSub = nlapiCreateRecord( "subscription" );
                        newSub.setFieldValue("customer", customer);
                        newSub.setFieldValue("custrecord_bsn_sub_end_user", endUser);
                        newSub.setFieldValue("custrecord_sub_network_admin", adminEmail);
                        newSub.setFieldValue('initialterm', -102);//1=12 months
                        newSub.setFieldValue("startdate", startDate);
                        newSub.setFieldValue("enddate", endDate);
                        newSub.setFieldValue("billingaccount", billingAccount);


                        var customerRecord = nlapiLoadRecord( 'customer', customer );
                        var customerPriceLevel = customerRecord.getFieldValue( 'pricelevel' );
                        var isCustomerSupport = customerRecord.getFieldValue('custentity_bs_support_customer') == 'T';
                        var customerPriceBook = search( customerPriceLevel, sbBSNSettings.priceBooksCL, 'pricelevel' );
                        customerPriceBook = bsnGetPriceBookByPriceLevel(netTypeCloud, customerPriceLevel);
                        console.log("pricebookndex=" + customerPriceBook);
                        if( !customerPriceBook ) customerPriceBook = bsnGetPriceBookByPriceLevel(netTypeCloud, priceLevelMSRP);
                        if (isCustomerSupport) customerPriceBook = bsnGetPriceBookByPriceLevel(netTypeCloud, priceLevelSupport);
                        //Ext.MessageBox.alert('Subscription Created', 'Price Level: ' + priceBooksCL[customerPriceBook].pricelevel + '<br>' + 'Price Book: ' + priceBooksCL[customerPriceBook].pricebook);

                        newSub.setFieldValue("subscriptionplan", sbBSNSettings.bsnc1yrPlanNum);
                        newSub.setFieldValue("pricebook", customerPriceBook);
                        newSub.setFieldValue("custrecord_sub_network_id", networkName);
                        newSub.setFieldValue("custrecord_bsn_type", netTypeCloud);
                        newSub.setFieldValue("custrecord_bs_subscription_po", po);
                        newSub.setFieldValue("custrecord_bsnc_sales_rep", salesrep);

                        newSub.setFieldValue('defaultrenewalterm', 1);//12 months

                        try {
                            console.log("newSubEnd=" + newSub.getFieldValue('enddate'));
                            console.log("pricebook=" + newSub.getFieldValue('pricebook'));
                            var sub = nlapiSubmitRecord(newSub);
                            console.log("sub=" + sub);
                            var subRecord = nlapiLoadRecord('subscription', sub);
                            subRecord.setFieldValue('enddate', endDate);
                            nlapiSubmitRecord(subRecord);

                            subRecord = nlapiLoadRecord('subscription', sub);
                            console.log("newSubEnd1=" + subRecord.getFieldValue('enddate'));
                            //var subLineId = subRecord.getLineItemValue('subscriptionline','subscriptionline', 1);
                            //subRecord.setLineItemValue( 'priceinterval', 'quantity', 1, subsCount );

                            var newPrice = -1;
                            if( isCustomPrice === 'T' ){
                                newPrice = customerPrice;
                            }
                            var resRecord = sbUpdateLatestPricePlan( subRecord, subsCount, newPrice )

                            //Generate BSN Subs. Use for Sandbox only!
                            //var requestUrl = nlapiResolveURL('Suitelet', 'customscript_sb_bsnc_sl_create_bsn_subs', 'customdeploy_sb_bsnc_sl_create_bsn_subs');
                            /* TODO: remove next line */
                            //var response = nlapiRequestURL(requestUrl + '&sub=' + sub, null, null, null);
                            /*******/
                            //Ext.MessageBox.alert('Subscription Created', 'Subscription <a href="/app/accounting/subscription/subscription.nl?id=' + sub + '" target="blank">' + subRecord.getFieldValue('name') + '</a> is created.');

                            var subsSO = nlapiCreateRecord("salesorder");
                            subsSO.setFieldValue("entity", customer);
                            subsSO.setFieldValue("custbody_end_user", endUser);
                            //subsSO.setFieldValue('custbody_renewal_terms', 12);
                            subsSO.setFieldValue("startdate", startDate);
                            subsSO.setFieldValue("enddate", endDate);
                            console.log(convertItemId);
                            subsSO.selectNewLineItem('item');
                            subsSO.setCurrentLineItemValue('item', 'subscription', sub);
                            /*
                            subsSO.setCurrentLineItemValue('item', 'quantity', subsCount);
                            subsSO.setCurrentLineItemValue('item', 'price', '-1');
                            subsSO.setCurrentLineItemValue('item', 'rate', firstPrice);
                            subsSO.setCurrentLineItemValue('item', 'custcol_list_rate', roundTo(customerPrice/months, 3));
                            subsSO.setCurrentLineItemValue('item', 'custcol_bsn_is_custom_price', customPriceCheck);
                            if( customPriceCheck == 'T' ){
                                subsSO.setCurrentLineItemValue('item', 'custcol_bsn_custom_price', customerPrice);
                            } else {
                                subsSO.setCurrentLineItemValue('item', 'custcol_bsn_custom_price', '');
                            }
                            subsSO.setCurrentLineItemValue('item', 'custcol_bs_fiscal_quarter', Qtr[month]);
                            subsSO.setCurrentLineItemValue('item', 'revrecstartdate', revRecStartDate);
                            subsSO.setCurrentLineItemValue('item', 'revrecenddate', revRecEndDate);
                            subsSO.setCurrentLineItemValue('item', 'description', "Customer Email:" + purchaserEmail + "\nNetwork:" + networkInfo.Name + "\nNetwork ID:" + networkInfo.Id);
                             */
                            subsSO.commitLineItem('item');

                            var recordId = nlapiSubmitRecord(subsSO);
                            var tranId = nlapiLookupField('salesorder', recordId, 'tranid');

                            Ext.MessageBox.show({
                                title: 'Sales Order Created',
                                msg: 'Sales Order <a href="/app/accounting/transactions/salesord.nl?id=' + recordId + '" target="blank">' + tranId + '</a> is created.',
                                width: 400,
                                buttons: Ext.MessageBox.OKCANCEL,
                                fn: function (btn, text) {
                                    if (btn == 'ok') {
                                        //nlapiSetFieldValue( "bs_onload", "yes" );
                                        //sbReloadAddSubsForm();
                                    }
                                },
                                icon: Ext.MessageBox.QUESTION
                            });
                            hideAlertBox('subscription_created');
                            showAlertBox('subscription_created', 'Sales Order Created', 'You successfully created Sales Order "' + tranId + '".', NLAlertDialog.TYPE_LOWEST_PRIORITY);
                        } catch(e){
                            hideAlertBox('subscription_created');
                            showAlertBox('subscription_created', 'Error Creating BSN.com Subscription Record', e.message, NLAlertDialog.TYPE_HIGH_PRIORITY);
                            Ext.MessageBox.show({
                                title: 'ERROR',
                                msg: 'ERROR: ' + e.message,
                                width: 400,
                                buttons: Ext.MessageBox.OK,
                                icon: Ext.MessageBox.ERROR
                            });
                        }
                    }
                    jQuery(".loader-overlay").fadeOut(1000);
                },
                icon: Ext.MessageBox.QUESTION
            });
        }
    } else {
        Ext.MessageBox.show({title : 'ERROR', msg : 'ERROR: Activity Period of Network is different from selected.', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    }
}

function bsncAddSubscriptionsSubmitBSNC(){
    var customer = nlapiGetFieldValue('bsnc_addsubs_customer');
    var endUser = nlapiGetFieldValue('bsnc_addsubs_enduser');
    var adminEmail = nlapiGetFieldValue('bsnc_addsubs_purchaser_email');
    //var resellerEmail = nlapiGetFieldValue('bsnc_addsubs_reseller_email');
    var activationDate = nlapiGetFieldValue('bsnc_addsubs_start_date');
    var terminateDate = nlapiGetFieldValue('bsnc_addsubs_terminate_date');
    var anniversaryDate = nlapiGetFieldValue('bsnc_addsubs_anniversary_date');
    var activityPeriod = nlapiGetFieldValue('bsnc_addsubs_activity_period');
    var subsCount = parseInt(nlapiGetFieldValue('bsnc_addsubs_count'));
    var customerPrice = nlapiGetFieldValue('bsnc_addsubs_price');
    var isCustomPrice = nlapiGetFieldValue('bsnc_addsubs_custom_price');
    var networkName = nlapiGetFieldValue('bsnc_addsubs_select_network');
    var billingAccount = nlapiGetFieldValue('bsnc_addsubs_billing_account');
    var po = nlapiGetFieldValue('bsnc_addsubs_po');
    var salesrep = nlapiGetFieldValue('bsnc_addsubs_salesrep')||'';

    var convertItemId = sbBSNSettings.bsnc1yrItemText;
    var months = 12;

    if( isNullorEmpty( customer ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select a Customer!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( billingAccount ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select a Billing Account!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( !isBillingAccountEligible( billingAccount, anniversaryDate ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'This Billing Account is Not Eligible for this Renewal Date!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( adminEmail ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Network Admin Email!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( activityPeriod ) ) {
        return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select subscription Activity Period!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    } else {
        switch( activityPeriod ){
            case '3': activityPeriod = 'P365D'; convertItemId = sbBSNSettings.bsnc1yrItemText; months = 12; break;
            default: return Ext.MessageBox.show({title : 'ERROR', msg : 'Invalid Activity Period!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
        }
    }
    if( isNullorEmpty( activationDate ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Effective Date!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( !isNullorEmpty( terminateDate ) ) {
        var termDate = nlapiStringToDate( terminateDate );
        var newDate = nlapiStringToDate( activationDate );
        if( newDate < termDate ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Effective Date (' + activationDate + ') cannot be earlier then previous Subscription Termination Date (' + terminateDate + ')!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    }
    if( isNullorEmpty( anniversaryDate ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Subscriptions Anniversary Date!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( subsCount ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Subscriptions Count!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( customerPrice ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Price of 1 Subscription!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( networkName ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select a Network Name!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});

    //var endDate = nlapiDateToString( moment( nlapiStringToDate( anniversaryDate ) ).subtract( 1, 'd' ).toDate() );
    var startDate = activationDate;//nlapiDateToString( moment( nlapiStringToDate( anniversaryDate ) ).subtract( 1, 'y' ).toDate() );
    var endDate = nlapiDateToString( moment( nlapiStringToDate( anniversaryDate ) ).subtract( 1, 'd' ).toDate() );

    var revRecStartDate = nlapiDateToString( moment(nlapiStringToDate(startDate)).startOf('month').toDate() );
    var revRecEndDate = bsncRevRecEndDate( moment(nlapiStringToDate(startDate)), endDate, months );

    var networkInfo = soapGetNetworkByIdBSNC( networkName );
    console.log(networkInfo);
    console.log('po: ' + po);

    var netPeriod = 'P365D';//networkInfo.SubscriptionsActivityPeriod;

    if( activityPeriod == netPeriod ){
        var pricePercentage = getPricePercentageBSNC( customerPrice, activityPeriod, startDate, endDate, subsCount );

        if( pricePercentage['deltaDuration'] < 0 ){
            Ext.MessageBox.show({title : 'ERROR', msg : 'ERROR: Renewal Date is in the past!<br>Please, update network renewal date first.', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
        } else {
            /***Gather existing subscriptions***/
            var existingText = '';
            var existingSubscriptionRecords = bsncGetSubscriptionsByNetid( networkName, 1 );
            if( existingSubscriptionRecords.length ){
                existingText = "There are other Subscription Records feeding Subs to this Network:<br>";
                for( var k = 0; k < existingSubscriptionRecords.length; k++ ){
                    existingText += (k+1) + ') <a href="' + nlapiResolveURL('RECORD', 'subscription', existingSubscriptionRecords[k].subId) + '" target="_blank">' + existingSubscriptionRecords[k].subName + '</a> owned by <a href="' + nlapiResolveURL('RECORD', 'customer', existingSubscriptionRecords[k].customerId) + '">' + existingSubscriptionRecords[k].subCustomer + '</a><br><br>';
                }
                existingText += 'Are you sure you want to continue?';
            }
            /********/

            jQuery(".loader-overlay").fadeIn(1000);
            Ext.MessageBox.show({
                title: 'Preview Data',
                msg: existingText == '' ? 'Subscription Record for will be created now.<br>Are you sure?' : existingText,
                width: 400,
                buttons: Ext.MessageBox.OKCANCEL,
                fn: function (btn, text) {
                    if (btn == 'ok') {
                        var percent = 100;
                        if( pricePercentage['percent'] > 0 ){
                            percent = pricePercentage['percent'];
                        }
                        var firstPrice = roundTo(customerPrice * percent / 100, 2);

                        var month = moment().format('MMM').toLowerCase();

                        var newSub = nlapiCreateRecord( "subscription" );
                        newSub.setFieldValue("customer", customer);
                        newSub.setFieldValue("custrecord_bsn_sub_end_user", endUser);
                        newSub.setFieldValue("custrecord_sub_network_admin", adminEmail);
                        newSub.setFieldValue('initialterm', -102);//1=12 months
                        newSub.setFieldValue("startdate", startDate);
                        newSub.setFieldValue("enddate", endDate);
                        newSub.setFieldValue("billingaccount", billingAccount);


                        var customerRecord = nlapiLoadRecord( 'customer', customer );
                        var customerPriceLevel = customerRecord.getFieldValue( 'pricelevel' );
                        var isCustomerSupport = customerRecord.getFieldValue('custentity_bs_support_customer') == 'T';
                        var customerPriceBook = search( customerPriceLevel, sbBSNSettings.priceBooksCL, 'pricelevel' );
                        customerPriceBook = bsnGetPriceBookByPriceLevel(netTypeCloud, customerPriceLevel);
                        console.log("pricebookndex=" + customerPriceBook);
                        if( !customerPriceBook ) customerPriceBook = bsnGetPriceBookByPriceLevel(netTypeCloud, priceLevelMSRP);
                        if (isCustomerSupport) customerPriceBook = bsnGetPriceBookByPriceLevel(netTypeCloud, priceLevelSupport);
                        //Ext.MessageBox.alert('Subscription Created', 'Price Level: ' + priceBooksCL[customerPriceBook].pricelevel + '<br>' + 'Price Book: ' + priceBooksCL[customerPriceBook].pricebook);

                        newSub.setFieldValue("subscriptionplan", sbBSNSettings.bsnc1yrPlanNum);
                        newSub.setFieldValue("pricebook", customerPriceBook);
                        newSub.setFieldValue("custrecord_sub_network_id", networkName);
                        newSub.setFieldValue("custrecord_bsn_type", netTypeCloud);
                        newSub.setFieldValue("custrecord_bs_subscription_po", po);
                        newSub.setFieldValue("custrecord_bsnc_sales_rep", salesrep);

                        newSub.setFieldValue('defaultrenewalterm', 1);//12 months
                       //newSub.setFieldValue('defaultrenewalpricebook', '');//Keep Pricing
                        //console.log('keep pricing');

                        try {
                            console.log("newSubEnd=" + newSub.getFieldValue('enddate'));
                            console.log("pricebook=" + newSub.getFieldValue('pricebook'));
                            console.log("defaultrenewalpricebook=" + newSub.getFieldValue('defaultrenewalpricebook'));
                            var sub = nlapiSubmitRecord(newSub);
                            console.log("sub=" + sub);
                            var subRecord = nlapiLoadRecord('subscription', sub);
                            subRecord.setFieldValue('enddate', endDate);
                            nlapiSubmitRecord(subRecord);
                            subRecord = nlapiLoadRecord('subscription', sub);
                            console.log("newSubEnd1=" + subRecord.getFieldValue('enddate'));
                            var subLineId = subRecord.getLineItemValue('subscriptionline','subscriptionline', 1);
                            //subRecord.setLineItemValue( 'priceinterval', 'quantity', 1, subsCount );

                            var newPrice = -1;
                            if( isCustomPrice === 'T' ){
                                newPrice = customerPrice;
                            }
                            var resRecord = sbUpdateLatestPricePlan( subRecord, subsCount, newPrice )
                            //nlapiSubmitRecord( subRecord );
                            nlapiSubmitField( 'subscriptionline', subLineId, 'subscriptionlinestatus', 'PENDING_ACTIVATION' );
                            var changeOrder = nlapiCreateRecord('subscriptionchangeorder',{'action': 'ACTIVATE', 'subscription': sub});
                            changeOrder.setFieldValue('effectivedate', activationDate);
                            changeOrder.setFieldValue('requestoffcycleinvoice', 'T');
                            changeOrder.setLineItemValue('subline', 'apply', 1, 'T');
                            var newCO = nlapiSubmitRecord( changeOrder );
                            console.log("newCO=" + newCO);
                            var invoice = null;
                            var invoiceText = '';
                            if( newCO ){
                                //scheduleInvoiceCreation({subId:sub, isSingle: 'T'});
                                /*
                                invoice = bsCreateSubscriptionInvoice( startDate, sub );
                                if( invoice ){
                                    invoiceText = '<a href="/app/accounting/transactions/custinvc.nl?id=' + invoice + '" target="inv' + invoice + '">Invoice</a><br>';
                                }
                                 */
                            }
                            var requestUrl = nlapiResolveURL('Suitelet', 'customscript_sb_bsnc_sl_create_bsn_subs', 'customdeploy_sb_bsnc_sl_create_bsn_subs');
                            /* TODO: remove next line */
                            //var response = nlapiRequestURL(requestUrl + '&sub=' + sub, null, null, null);
                            /*******/
                            //Ext.MessageBox.alert('Subscription Created', 'Subscription <a href="/app/accounting/subscription/subscription.nl?id=' + sub + '" target="blank">' + subRecord.getFieldValue('name') + '</a> is created.');

                            Ext.MessageBox.show({
                                title: 'Subscription Created',
                                msg: 'Subscription <a href="/app/accounting/subscription/subscription.nl?id=' + sub + '" target="sub' + sub + '">' + subRecord.getFieldValue('name') + '</a> is created.<br>' + invoiceText + 'Do you want to reload form?',
                                width: 400,
                                buttons: Ext.MessageBox.OKCANCEL,
                                fn: function (btn, text) {
                                    if (btn == 'ok') {
                                        nlapiSetFieldValue( "bs_onload", "yes" );
                                        sbReloadAddSubsForm();
                                    }
                                },
                                icon: Ext.MessageBox.QUESTION
                            });
                            hideAlertBox('subscription_created');
                            showAlertBox('subscription_created', 'Subscription Created', 'Subscription <a href="/app/accounting/subscription/subscription.nl?id=' + sub + '" target="sub' + sub + '">' + subRecord.getFieldValue('name') + '</a> is created.<br>' + invoiceText, NLAlertDialog.TYPE_LOWEST_PRIORITY);
                        } catch(e){
                            hideAlertBox('subscription_created');
                            showAlertBox('subscription_created', 'Error Creating BSN.com Subscription Record', e.message, NLAlertDialog.TYPE_HIGH_PRIORITY);
                            Ext.MessageBox.show({
                                title: 'ERROR',
                                msg: 'ERROR: ' + e.message,
                                width: 400,
                                buttons: Ext.MessageBox.OK,
                                icon: Ext.MessageBox.ERROR
                            });
                        }
                    }
                    jQuery(".loader-overlay").fadeOut(1000);
                },
                icon: Ext.MessageBox.QUESTION
            });
        }
    } else {
        Ext.MessageBox.show({title : 'ERROR', msg : 'ERROR: Activity Period of Network is different from selected.', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    }
}

function bsncUpdateSubscriptionsSubmitBSNC(){
    var customer = nlapiGetFieldValue('bsnc_addsubs_customer');
    var endUser = nlapiGetFieldValue('bsnc_addsubs_enduser');
    var purchaserEmail = nlapiGetFieldValue('bsnc_addsubs_purchaser_email');
    var resellerEmail = nlapiGetFieldValue('bsnc_addsubs_reseller_email');
    var activationDate = nlapiGetFieldValue('bsnc_addsubs_start_date');
    var endDate = nlapiGetFieldValue('bsnc_addsubs_anniversary_date');
    var anniversaryDate = nlapiGetFieldValue('bsnc_addsubs_anniversary_date');
    var activityPeriod = nlapiGetFieldValue('bsnc_addsubs_activity_period');
    var subsCount = parseInt(nlapiGetFieldValue('bsnc_addsubs_count'));
    var customerPrice = nlapiGetFieldValue('bsnc_addsubs_price');
    var networkName = nlapiGetFieldValue('bsnc_addsubs_select_network');
    var customPriceCheck = nlapiGetFieldValue('bsnc_addsubs_custom_price');
    var billingAccount = nlapiGetFieldValue('bsnc_addsubs_billing_account');
    var po = nlapiGetFieldValue('bsnc_addsubs_po');

    var convertItemId = sbBSNSettings.bsnc1yrItemText;
    var months = 12;

    if( isNullorEmpty( customer ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select a Customer!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( billingAccount ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select a Billing Account!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( purchaserEmail ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Admin Email!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( activityPeriod ) ) {
        return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select subscription Activity Period!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    } else {
        switch( activityPeriod ){
            case '3': activityPeriod = 'P365D'; convertItemId = sbBSNSettings.bsnc1yrItemText; months = 12; break;
            default: return Ext.MessageBox.show({title : 'ERROR', msg : 'Invalid Activity Period!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
        }
    }
    if( isNullorEmpty( activationDate ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Subscriptions Activation Date!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( anniversaryDate ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Subscriptions Anniversary Date!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( subsCount ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Subscriptions Count!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( customerPrice ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Price of 1 Subscription!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( networkName ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select a Network Name!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});

    //var endDate = nlapiDateToString( moment( nlapiStringToDate( anniversaryDate ) ).subtract( 1, 'd' ).toDate() );
    var startDate = nlapiDateToString( moment( nlapiStringToDate( anniversaryDate ) ).subtract( 1, 'y' ).toDate() );

    var revRecStartDate = nlapiDateToString( moment(nlapiStringToDate(startDate)).startOf('month').toDate() );
    var revRecEndDate = bsncRevRecEndDate( moment(nlapiStringToDate(startDate)), endDate, months );

    var networkInfo = soapGetNetworkByIdBSNC( networkName );
    console.log(networkInfo);

    var netPeriod = 'P365D';//networkInfo.SubscriptionsActivityPeriod;

    if( activityPeriod == netPeriod ){
        var pricePercentage = getPricePercentageBSNC( customerPrice, activityPeriod, startDate, endDate, subsCount );

        if( pricePercentage['deltaDuration'] < 0 ){
            Ext.MessageBox.show({title : 'ERROR', msg : 'ERROR: Renewal Date is in the past!<br>Please, update network renewal date first.', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
        } else {
            jQuery(".loader-overlay").fadeIn(1000);
            Ext.MessageBox.show({
                title: 'Preview Data',
                msg: 'Subscription Record for will be updated now.<br>Are you sure?',
                width: 400,
                buttons: Ext.MessageBox.OKCANCEL,
                fn: function (btn, text) {
                    if (btn == 'ok') {
                        var currentSub = bsGetSubscriptionByNetid( networkInfo.Id, customer, 1 );
                        console.log('tr4');
                        /*
                        var percent = 100;
                        if( pricePercentage['percent'] > 0 ){
                            percent = pricePercentage['percent'];
                        }
                        firstPrice = roundTo(customerPrice * percent / 100, 2);

                        var month = moment().format('MMM').toLowerCase();

                        var newSub = nlapiCreateRecord( "subscription" );
                        newSub.setFieldValue("customer", customer);
                        newSub.setFieldValue("custrecord_bsn_sub_end_user", endUser);
                        newSub.setFieldValue('initialterm', 1);//12 months
                        newSub.setFieldValue("startdate", startDate);
                        newSub.setFieldValue("enddate", endDate);
                        newSub.setFieldValue("billingaccount", billingAccount);


                        var customerRecord = nlapiLoadRecord( 'customer', customer );
                        var customerPriceLevel = customerRecord.getFieldValue( 'pricelevel' );
                        var customerPriceBook = search( customerPriceLevel, priceBooksCL, 'pricelevel' );
                        if( customerPriceBook == -1 ) customerPriceBook = 0;
                        //Ext.MessageBox.alert('Subscription Created', 'Price Level: ' + priceBooksCL[customerPriceBook].pricelevel + '<br>' + 'Price Book: ' + priceBooksCL[customerPriceBook].pricebook);

                        newSub.setFieldValue("subscriptionplan", bsn1yrPlanNum);
                        newSub.setFieldValue("pricebook", priceBooksCL[customerPriceBook].pricebook);
                        newSub.setFieldValue("custrecord_sub_network_id", networkName);
                        newSub.setFieldValue("custrecord_bs_subscription_po", po);

                        var sub = nlapiSubmitRecord( newSub );
                        var subRecord = nlapiLoadRecord('subscription', sub);
                        var subLineId = subRecord.getLineItemValue('subscriptionline','subscriptionline', 1);
                        subRecord.setLineItemValue( 'priceinterval', 'quantity', 1, subsCount );
                        nlapiSubmitRecord( subRecord );
                        nlapiSubmitField( 'subscriptionline', subLineId, 'subscriptionlinestatus', 'PENDING_ACTIVATION' );
                        */
                        var changeOrder = nlapiCreateRecord('subscriptionchangeorder',{'action': 'MODIFY_PRICING', 'subscription': currentSub.subId, 'effectivedate': activationDate});
                        //changeOrder.setFieldValue('effectivedate', activationDate);
                        changeOrder.setFieldValue('requestoffcycleinvoice', 'T');
                        changeOrder.setLineItemValue('subline', 'apply', 1, 'T');
                        var oldQuantity = parseInt(changeOrder.getLineItemValue('subline', 'quantity', 1));
                        changeOrder.setLineItemValue('subline', 'quantitynew', 1, oldQuantity + subsCount);
                        try {
                            nlapiSubmitRecord(changeOrder);
                            var requestUrl = nlapiResolveURL('Suitelet', 'customscript_sb_bsnc_sl_create_bsn_subs', 'customdeploy_sb_bsnc_sl_create_bsn_subs');
                            var response = nlapiRequestURL(requestUrl + '&sub=' + currentSub.subId, null, null, null);
                            Ext.MessageBox.show({
                                title: 'Subscription Updated',
                                msg: 'Subscription <a href="/app/accounting/subscription/subscription.nl?id=' + currentSub.subId + '" target="blank">' + currentSub.subName + '</a> is updated.<br>Do you want to reload form?',
                                width: 400,
                                buttons: Ext.MessageBox.OKCANCEL,
                                fn: function (btn, text) {
                                    if (btn == 'ok') {
                                        nlapiSetFieldValue( "bs_onload", "yes" );
                                        sbReloadAddSubsForm();
                                    }
                                },
                                icon: Ext.MessageBox.QUESTION
                            });
                            //Ext.MessageBox.alert('Subscription Created', 'Subscription <a href="/app/accounting/subscription/subscription.nl?id=' + currentSub.subId + '" target="blank">' + currentSub.subName + '</a> is updated.');
                            //sbReloadAddSubsForm();
                        } catch(e){
                            Ext.MessageBox.show({
                                title: 'ERROR',
                                msg: e.message,
                                width: 400,
                                buttons: Ext.MessageBox.OK,
                                icon: Ext.MessageBox.ERROR
                            });
                            /*
                            nlapiLogExecution('DEBUG', 'Exception ', e.message );
                            nlapiLogExecution('DEBUG', 'Exception ', e.name);
                            nlapiLogExecution('DEBUG', 'Exception ', e.toString());
                            */
                        }
                    }
                    jQuery(".loader-overlay").fadeOut(1000);
                },
                icon: Ext.MessageBox.QUESTION
            });
        }
    } else {
        Ext.MessageBox.show({title : 'ERROR', msg : 'ERROR: Activity Period of Network is different from selected.', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    }
}

function bsncSBCreateBillingAccount(){

}

function bsncFormAddSubscriptionsSubmit(){
    var customer = nlapiGetFieldValue('bsnc_addsubs_customer');
    var purchaserEmail = nlapiGetFieldValue('bsnc_addsubs_purchaser_email');
    var resellerEmail = nlapiGetFieldValue('bsnc_addsubs_reseller_email');
    var startDate = nlapiGetFieldValue('bsnc_addsubs_start_date');
    var anniversaryDate = nlapiGetFieldValue('bsnc_addsubs_anniversary_date');
    var activityPeriod = nlapiGetFieldValue('bsnc_addsubs_activity_period');
    var subsCount = nlapiGetFieldValue('bsnc_addsubs_count');
    var customerPrice = nlapiGetFieldValue('bsnc_addsubs_price');
    var networkName = nlapiGetFieldValue('bsnc_addsubs_select_network');
    var customPriceCheck = nlapiGetFieldValue('bsnc_addsubs_custom_price');

    var convertItemId = sbBSNSettings.bsnc1yrItemText;
    var months = 12;

    if( isNullorEmpty( customer ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select a Customer!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( purchaserEmail ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Admin Email!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( activityPeriod ) ) {
        return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select subscription Activity Period!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    } else {
        switch( activityPeriod ){
            case '3': activityPeriod = 'P365D'; convertItemId = sbBSNSettings.bsnc1yrItemText; months = 12; break;
            default: return Ext.MessageBox.show({title : 'ERROR', msg : 'Invalid Activity Period!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
        }
    }
    if( isNullorEmpty( startDate ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Subscriptions Start Date!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( anniversaryDate ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Subscriptions Anniversary Date!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( subsCount ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Subscriptions Count!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( customerPrice ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Price of 1 Subscription!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( networkName ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select a Network Name!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});

    var endDate = nlapiDateToString( moment( nlapiStringToDate( anniversaryDate ) ).subtract( 1, 'd' ).toDate() );

    var revRecStartDate = nlapiDateToString( moment(nlapiStringToDate(startDate)).startOf('month').toDate() );
    var revRecEndDate = bsncRevRecEndDate( moment(nlapiStringToDate(startDate)), endDate, months );

    var networkInfo = soapGetNetworkByIdBSNC( networkName );
    console.log(networkInfo);

    var netPeriod = 'P365D';//networkInfo.SubscriptionsActivityPeriod;

    if( activityPeriod == netPeriod ){
        var pricePercentage = getPricePercentageBSNC( customerPrice, activityPeriod, startDate, endDate, subsCount );

        if( pricePercentage['deltaDuration'] < 0 ){
            Ext.MessageBox.show({title : 'ERROR', msg : 'ERROR: Renewal Date is in the past!<br>Please, update network renewal date first.', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
        } else {
            jQuery(".loader-overlay").fadeIn(1000);
            Ext.MessageBox.show({
                title: 'Preview Data',
                msg: 'SO for ' + pricePercentage['deltaDuration'] + ' days will be created.<br>That is ' + pricePercentage['percent'] + '% of a full subscription.<br>The order is for ' + subsCount + ' subscriptions<br>' + 'Total price = $' + pricePercentage['total'],
                width: 400,
                buttons: Ext.MessageBox.OKCANCEL,
                fn: function (btn, text) {
                    if (btn == 'ok') {
                        var percent = 100;
                        if( pricePercentage['percent'] > 0 ){
                            percent = pricePercentage['percent'];
                        }
                        firstPrice = roundTo(customerPrice * percent / 100, 2);

                        var month = moment().format('MMM').toLowerCase();

                        var subsSO = nlapiCreateRecord("salesorder");
                        subsSO.setFieldValue("entity", customer);
                        subsSO.setFieldValue("custbody_end_user", customer);
                        subsSO.setFieldValue('custbody_renewal_terms', 12);
                        subsSO.setFieldValue("startdate", startDate);
                        subsSO.setFieldValue("enddate", endDate);
                        console.log(convertItemId);
                        subsSO.selectNewLineItem('item');
                        subsSO.setCurrentLineItemValue('item', 'item', convertItemId);
                        subsSO.setCurrentLineItemValue('item', 'quantity', subsCount);
                        subsSO.setCurrentLineItemValue('item', 'price', '-1');
                        subsSO.setCurrentLineItemValue('item', 'rate', firstPrice);
                        subsSO.setCurrentLineItemValue('item', 'custcol_list_rate', roundTo(customerPrice/months, 3));
                        subsSO.setCurrentLineItemValue('item', 'custcol_bsn_is_custom_price', customPriceCheck);
                        if( customPriceCheck == 'T' ){
                            subsSO.setCurrentLineItemValue('item', 'custcol_bsn_custom_price', customerPrice);
                        } else {
                            subsSO.setCurrentLineItemValue('item', 'custcol_bsn_custom_price', '');
                        }
                        subsSO.setCurrentLineItemValue('item', 'custcol_bs_fiscal_quarter', Qtr[month]);
                        subsSO.setCurrentLineItemValue('item', 'revrecstartdate', revRecStartDate);
                        subsSO.setCurrentLineItemValue('item', 'revrecenddate', revRecEndDate);
                        subsSO.setCurrentLineItemValue('item', 'description', "Customer Email:" + purchaserEmail + "\nNetwork:" + networkInfo.Name + "\nNetwork ID:" + networkInfo.Id);
                        subsSO.commitLineItem('item');

                        var recordId = nlapiSubmitRecord(subsSO);
                        var tranId = nlapiLookupField('salesorder', recordId, 'tranid');
                        showAlertBox('success_order_created', 'Sales Order Created', 'You successfully created Sales Order "' + tranId + '".', NLAlertDialog.TYPE_LOWEST_PRIORITY);
                        Ext.MessageBox.alert('Sales Order Created', 'Sales Order <a href="/app/accounting/transactions/salesord.nl?id=' + recordId + '" target="blank">' + tranId + '</a> is created.');
                    }
                    jQuery(".loader-overlay").fadeOut(1000);
                },
                icon: Ext.MessageBox.QUESTION
            });
        }
    } else {
        Ext.MessageBox.show({title : 'ERROR', msg : 'ERROR: Activity Period of Network is different from selected.', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    }
}

function bsncAddSubsReviewNumbers(){
    var customer = nlapiGetFieldValue('bsnc_addsubs_customer');
    var purchaserEmail = nlapiGetFieldValue('bsnc_addsubs_purchaser_email');
    var resellerEmail = nlapiGetFieldValue('bsnc_addsubs_reseller_email');
    var startDate = nlapiGetFieldValue('bsnc_addsubs_start_date');
    var anniversaryDate = nlapiGetFieldValue('bsnc_addsubs_anniversary_date');
    var activityPeriod = nlapiGetFieldValue('bsnc_addsubs_activity_period');
    var subsCount = nlapiGetFieldValue('bsnc_addsubs_count');
    var customerPrice = nlapiGetFieldValue('bsnc_addsubs_price');
    var networkName = nlapiGetFieldValue('bsnc_addsubs_select_network');

    if( isNullorEmpty( customer ) ) return alert( 'Please select a Customer!' );
    if( isNullorEmpty( purchaserEmail ) ) return alert( 'Please enter Admin Email!' );
    if( isNullorEmpty( activityPeriod ) ) {
        return alert( 'Please select subscription Activity Period!' );
    } else {
        switch( activityPeriod ){
            case '1': activityPeriod = 'P30D'; break;
            case '2': activityPeriod = 'P90D'; break;
            case '3': activityPeriod = 'P365D'; break;
            default: return alert( 'Invalid Activity Period!' );
        }
    }
    if( isNullorEmpty( startDate ) ) return alert( 'Please enter Subscriptions Start Date!' );
    if( isNullorEmpty( anniversaryDate ) ) return alert( 'Please enter Subscriptions Anniversary Date!' );
    if( isNullorEmpty( subsCount ) ) return alert( 'Please enter Subscriptions Count!' );
    if( isNullorEmpty( networkName ) ) return alert( 'Please select a Network Name!' );
    if( isNullorEmpty( customerPrice ) ) return alert( 'Please enter Subscription Price!' );

    var endDate = nlapiDateToString( moment( nlapiStringToDate( anniversaryDate ) ).subtract( 1, 'd' ).toDate() );

    var networkInfo = soapGetNetworkByIdBSNC( networkName );
    console.log(networkInfo);

    //var netDate = parseSOAPDate( networkInfo.SubscriptionsRenewalDate );
    var netPeriod = 'P365D';//networkInfo.SubscriptionsActivityPeriod;

    if( activityPeriod == netPeriod ){
        var pricePercentage = getPricePercentageBSNC( customerPrice, activityPeriod, startDate, endDate, subsCount );
        if( pricePercentage['percent'] > 0 ){
            Ext.MessageBox.alert('Preview Data', 'SO for ' + pricePercentage['deltaDuration'] + ' days will be created.<br>That is ' + pricePercentage['percent'] + '% of a full subscription.<br>The order is for ' + subsCount + ' subscriptions<br>' + 'Total price = $' + pricePercentage['total']);
        }
        if( pricePercentage['deltaDuration'] < 0 ){
            Ext.MessageBox.show({title : 'ERROR', msg : 'ERROR: Renewal Date is in the past!<br>Please, update network renewal date first.', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
        }

    } else {
        Ext.MessageBox.show({title : 'ERROR', msg : 'ERROR: Activity Period of Network is different from selected.', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    }

    return;
}

function bsncCreateSubscriptionReviewNumbers(){
    var customer = nlapiGetFieldValue('bsnc_createsub_customer');
    var endUser = nlapiGetFieldValue('bsnc_createsub_enduser');
    var purchaserEmail = nlapiGetFieldValue('bsnc_createsub_purchaser_email');
    var resellerEmail = nlapiGetFieldValue('bsnc_createsub_reseller_email');
    var startDate = nlapiGetFieldValue('bsnc_createsub_start_date');
    var anniversaryDate = nlapiGetFieldValue('bsnc_createsub_anniversary_date');
    var activityPeriod = nlapiGetFieldValue('bsnc_createsub_activity_period');
    var subsCount = nlapiGetFieldValue('bsnc_createsub_count');
    var customerPrice = nlapiGetFieldValue('bsnc_createsub_price');
    var networkId = nlapiGetFieldValue('bsnc_createsub_select_network');
    var networkName = nlapiGetFieldText('bsnc_createsub_select_network');
    var customPriceCheck = nlapiGetFieldValue('bsnc_createsub_custom_price');
    var billing = nlapiGetFieldValue('bsnc_createsub_billing');
    var pricebook = nlapiGetFieldValue('bsnc_createsub_pricebook');

    var convertItemId = sbBSNSettings.bsnc1yrItemText;
    var months = 12;

    if( isNullorEmpty( customer ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select a Customer!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( purchaserEmail ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Admin Email!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( activityPeriod ) ) {
        return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select subscription Activity Period!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    } else {
        switch( activityPeriod ){
            case '3': activityPeriod = 'P365D'; convertItemId = sbBSNSettings.bsnc1yrItemText; months = 12; break;
            default: return Ext.MessageBox.show({title : 'ERROR', msg : 'Invalid Activity Period!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
        }
    }
    if( isNullorEmpty( startDate ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Subscriptions Start Date!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( anniversaryDate ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Subscriptions Anniversary Date!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( subsCount ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Subscriptions Count!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( customerPrice ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Price of 1 Subscription!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( networkId ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select a Network Name!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});

    var subStartDate = nlapiDateToString( moment( nlapiStringToDate( anniversaryDate ) ).subtract( 1, 'y' ).toDate() );
    var subEndDate = nlapiDateToString( moment( nlapiStringToDate( anniversaryDate ) ).subtract( 1, 'd' ).toDate() );

    var revRecStartDate = nlapiDateToString( moment(nlapiStringToDate(startDate)).startOf('month').toDate() );
    var revRecEndDate = bsncRevRecEndDate( moment(nlapiStringToDate(startDate)), subEndDate, months );

    var networkInfo = soapGetNetworkByIdBSNC( networkId );
    console.log(networkInfo);

    var subscription = nlapiCreateRecord( 'subscription' );
    subscription.setFieldValue('customer', 147539); //Dump Truck
    subscription.setFieldValue('billingaccount', billing);
    subscription.setFieldValue('subscriptionplan', sbBSNSettings.bsnc1yrPlanNum); //Suite.cloud 1 Year
    subscription.setFieldValue('pricebook', pricebook);
    subscription.setFieldValue('initialterm', 1); //12 months
    subscription.setFieldValue('startdate', subStartDate);
    subscription.setFieldValue('enddate', subEndDate);
    subscription.setFieldValue('custrecord_bsn_sub_end_user', endUser);
    subscription.setFieldValue('custrecord_sub_network_id', networkInfo.Id);
    subscription.setFieldValue('name', networkInfo.Name + ' ' + anniversaryDate);
    //subsSO.selectNewLineItem('subscriptionline');
    //subsSO.setCurrentLineItemValue('subscriptionline', 'item', convertItemId);
    var newSub = nlapiSubmitRecord(subscription);
    if( newSub ){
        var subRecord = nlapiLoadRecord( 'subscription', newSub );
        subRecord.setLineItemValue( 'priceinterval', 'quantity', 1, subsCount );
        var itemLine = subRecord.getLineItemValue( 'subscriptionline', 'subscriptionline', 1 );
        nlapiSubmitRecord( subRecord );
        console.log( 'itemLine: ' + itemLine );
        nlapiSubmitField( 'subscriptionline', itemLine, 'subscriptionlinestatus', 'PENDING_ACTIVATION' );
        var changeOrder = nlapiCreateRecord( 'subscriptionchangeorder', {'action': 'ACTIVATE', 'subscription':newSub, 'effectivedate': startDate} );
        //changeOrder.setFieldValue('effectivedate', startDate);
        changeOrder.setLineItemValue('subline', 'apply', 1, 'T');
        nlapiSubmitRecord(changeOrder);
    }
    alert('Kewl');

}

function getPricePercentageBSNC( price, activityPeriod, startDate, endDate, subsCount ){
    var percentageInfo = new Array();
    percentageInfo['percent'] = 0;
    percentageInfo['total'] = 0;
    var periodDuration = getCurrentPeriodDaysBSNC( activityPeriod, endDate );
    var subStartDate = moment(nlapiStringToDate(startDate));
    var networkDate = moment(endDate);
    var networkDateCalcFix = moment(endDate).add(1, 'day');
    console.log(subStartDate);
    percentageInfo['deltaDuration'] = networkDateCalcFix.diff( subStartDate, 'days' );
    console.log(periodDuration);
    console.log(percentageInfo['deltaDuration']);
    if( percentageInfo['deltaDuration'] > 0 ){
        percentageInfo['percent'] = (percentageInfo['deltaDuration'] / periodDuration * 100).toFixed(2);
        console.log( percentageInfo['percent'] + '%' );
        percentageInfo['total'] = (price * subsCount * percentageInfo['percent'] / 100).toFixed(2);
        console.log( 'total = ' + percentageInfo['total'] );
    }
    return percentageInfo;
}

function getCurrentPeriodDaysBSNC( activityPeriod, renewalDate ){
    switch( activityPeriod ){
        case 'P30D': activityPeriod = 1; break;
        case 'P90D': activityPeriod = 3; break;
        case 'P365D': activityPeriod = 12; break;
        default: return console.log("Network has non-standard Activity Period. It must be changed to standard first or use another Network.");
    }

    var startDate = moment(renewalDate);
    var endDate = moment(renewalDate);
    startDate.subtract(activityPeriod, 'months');
    return endDate.diff(startDate, 'days');
}

/*
function bsncFormCreateNetworkSubmit(){
    jQuery(".loader-overlay").fadeIn(1000);
    Ext.MessageBox.prompt('New Network Name', 'Please enter New Network name:', function(btnText, sInput){
        if(btnText === 'ok'){
            var networkAdmin = nlapiGetFieldValue('bsnc_cnet_network_admin');
            var networkName = sInput;

            if( isNullorEmpty( networkAdmin ) ) return alert( 'Please enter Network Admin Email!' );
            if( isNullorEmpty( networkName ) ) return alert( 'Network Name cannot be empty!' );

            var result = soapCreateNetworkBSNC( networkAdmin, networkName );

            if( isNullorEmpty( result.Name ) ){
                showAlertBox('error_network_not_created', 'Error Creating BSN.cloud Network', result.Message, NLAlertDialog.TYPE_HIGH_PRIORITY);
            } else {
                showAlertBox('success_network_created', 'Network Created', 'You have successfully created BSN.cloud Network "' + result.Name + '".', NLAlertDialog.TYPE_LOWEST_PRIORITY);

                var param = '&bs_user=' + nlapiGetUser() + '&bs_email=' + networkAdmin + '&bs_network=' + networkName;
                var suitelet = nlapiResolveURL('SUITELET', 'customscript_bs_sl_send_template_email', 'customdeploy_bs_sl_send_template_email');
                var res = nlapiRequestURL(suitelet + param);
                var isSent = res.getBody();

                var isPopup = nlapiGetFieldValue( "bs_ispopup" );
                if( !isNullorEmpty( isPopup ) ) {
                    var buttonStart = '<table cellspacing="0" cellpadding="2" border="0" role="presentation"><tr><td align="left" style="padding-bottom:6px;" class="uir-header-buttons"><table border="0" cellspacing="0" cellpadding="0" role="presentation"><tr><td><table id="tbl_bsn_create_network_button" cellpadding="0" cellspacing="0" border="0" class="uir-button" style="margin-right:6px;cursor:hand;" role="presentation"><tr id="tr_bsn_create_network_button" class="pgBntG"><td id="tdleftcap_bsn_create_network_button"><img src="/images/nav/ns_x.gif" class="bntLT" border="0" height="50%" width="3" alt=""><img src="/images/nav/ns_x.gif" class="bntLB" border="0" height="50%" width="3" alt=""></td><td id="tdbody_bsn_create_network_button" height="20" valign="top" nowrap="" class="bntBgB">';
                    var buttonEnd = '</td><td id="tdrightcap_bsn_create_network_button"> <img src="/images/nav/ns_x.gif" height="50%" class="bntRT" border="0" width="3" alt=""><img src="/images/nav/ns_x.gif" height="50%" class="bntRB" border="0" width="3" alt=""></td></tr></table></td></tr></table></td></tr></table>';
                    jQuery('#div__body').append(buttonStart + '<input type="button" value="Close & Use this Network" onclick="window.parent.bsncFillNetworksList(\'' + networkAdmin + '\');var selectNetwork = window.parent.document.getElementById(\'bsnc_getname_select_network\');selectNetwork.value = \'' + result.Id + '\';var win=window.parent.Ext.getCmp(\'createNetworkForm\');if(win)win[win.closeAction]();" class="rndbuttoninpt bntBgT">' + buttonEnd);
                }
                nlapiSetFieldValue( "bs_onload", "yes" );
                nlapiSetFieldValue( "bs_default_network", result.Id );
                setWindowChanged(window, true);
                nlapiFieldChanged(null,"bsnc_cnet_network_admin");
                nlapiFieldChanged(null,"bsnc_cnet_select_network");
            }
        }
        jQuery(".loader-overlay").fadeOut(1000);
    }, this);
}
*/
function bsncFillNetworksList( networkAdmin ){
    if( !isNullorEmpty( networkAdmin ) ){
        var networks = soapGetNetworksByCustomerEmailBSNC( networkAdmin );
        jQuery('#bsnc_getname_select_network').html('<option value="">+ Create New</option>');
        if( isArray( networks ) ){
            for (var i = 0; i < networks.length; i++){
                jQuery('#bsnc_getname_select_network').append('<option value="' + networks[i][0] + '">' + networks[i][1] + '</option>');
            }
        } else {
            console.log( networks );
        }
    }
}

function bsncUseSelectedNetwork(){
    var networkId = nlapiGetFieldValue("bsnc_getname_select_network");
    var networkAdmin = nlapiGetFieldValue("bsnc_getname_network_admin");
    var activityPeriod = nlapiGetFieldValue("bsnc_getname_activity_period");
    var renewalDate = nlapiGetFieldValue("bsnc_getname_renewal_date");

    if( isValEmpty(networkAdmin) ){
        alert( "Network Admin Empty!" );
        return;
    }

    if( isNullorEmpty( networkId ) ){
        var suitelet = nlapiResolveURL('SUITELET', 'customscript_bsnc_sl_create_network_ui', 'customdeploy_bsnc_sl_create_network_ui');
        suitelet += '&bsn_email=' + networkAdmin;
        suitelet += '&bsn_activity_period=' + activityPeriod;
        suitelet += '&bsn_renewal_date=' + renewalDate;
        suitelet += '&bsn_ispopup=1';

        var param = '';
        popupHelperWindow(this, suitelet, 'createNetworkForm', 490, 350, param);
        return false;
    }

    window.parent.nlapiSetLineItemValue('item', "custcol_bsn_network_info", jQuery("#bsnc_getname_linenum").val(), 'Name:' + jQuery("#bsnc_getname_select_network option:selected").text() +
        '{{ID:' + jQuery("#bsnc_getname_select_network option:selected").val() + '}}');
    var win=window.parent.Ext.getCmp('getNetworkName');
    if(win)win[win.closeAction]();
}

function bsncNormalizeUseNetwork(){
    var networkId = nlapiGetFieldValue("bsnc_getname_select_network");
    var networkAdmin = nlapiGetFieldValue("bsnc_getname_network_admin");
    var activityPeriod = nlapiGetFieldValue("bsnc_getname_activity_period");
    var renewalDate = nlapiGetFieldValue("bsnc_getname_renewal_date");

    if( isValEmpty(networkAdmin) ){
        alert( "Network Admin Empty!" );
        return;
    }

    var networkId = jQuery("#bsnc_getname_select_network option:selected").val();
    if( isNullorEmpty( networkId ) ){
        Ext.MessageBox.alert('Select Network', 'Please, select a network first!');

    }else{
        var networkInfo = soapGetNetworkByIdBSNC( networkId );

        console.log(networkInfo);

        if( !isNullorEmpty(networkInfo.SubscriptionsActivityPeriod) && !isNullorEmpty(networkInfo.SubscriptionsRenewalDate)){
            var contractPeriod = ['P1D','P30D','P90D','P365D'];
            var periodName = ['1 Day','1 Month','3 Months','1 Year'];
            if( contractPeriod.indexOf(networkInfo.SubscriptionsActivityPeriod) == -1 ){
                Ext.MessageBox.alert('Select Network', 'Network has wrong Activity Period set!<br>Should be one of:<br>1 Month, 3 Months, 1 Year');
            }else if(contractPeriod.indexOf(networkInfo.SubscriptionsActivityPeriod) != activityPeriod){
                Ext.MessageBox.alert('Select Network', 'This Network has different Activity Period than your Items.<br>Your Period: ' + periodName[activityPeriod] + '<br>Network Period: ' + periodName[contractPeriod.indexOf(networkInfo.SubscriptionsActivityPeriod)] + '<br>Use another Network or change Items first!');
            }else{
                //Ext.MessageBox.alert('Select Network', networkInfo.SubscriptionsRenewalDate);
                //console.log(networkInfo.SubscriptionsRenewalDate);
                var endDate = parseSOAPDateBSNC( networkInfo.SubscriptionsRenewalDate );
                endDate = moment(endDate).format('M/D/YYYY');
                console.log(endDate);
                window.parent.bsncNormalizeSubSO( endDate );

                var win=window.parent.Ext.getCmp('getNetworkName');
                if(win)win[win.closeAction]();
            }
        }else{
            Ext.MessageBox.alert('Select Network', 'Network is of a wrong type.<br>You should convert this network first!');
        }
    }
}

function bsncNormalizeTestNetwork(){
    var networkId = nlapiGetFieldValue("bsnc_getname_select_network");
    var networkAdmin = nlapiGetFieldValue("bsnc_getname_network_admin");
    var activityPeriod = nlapiGetFieldValue("bsnc_getname_activity_period");
    var startDate = nlapiGetFieldValue("bsnc_getname_start_date");
    var renewalDate = nlapiGetFieldValue("bsnc_getname_renewal_date");

    if( isValEmpty(networkAdmin) ){
        alert( "Network Admin Empty!" );
        return;
    }

    var networkId = jQuery("#bsnc_getname_select_network option:selected").val();
    if( isNullorEmpty( networkId ) ){
        Ext.MessageBox.alert('Select Network', 'Please, select a network first!');

    }else{
        var networkInfo = soapGetNetworkByIdBSNC( networkId );

        console.log(networkInfo);

        if( !isNullorEmpty(networkInfo.SubscriptionsActivityPeriod) && !isNullorEmpty(networkInfo.SubscriptionsRenewalDate)){
            var contractPeriod = ['P1D','P30D','P90D','P365D'];
            var periodName = ['1 Day','1 Month','3 Months','1 Year'];
            if( contractPeriod.indexOf(networkInfo.SubscriptionsActivityPeriod) == -1 ){
                Ext.MessageBox.alert('Select Network', 'Network has wrong Activity Period set!<br>Should be one of:<br>1 Month, 3 Months, 1 Year');
            }else if(contractPeriod.indexOf(networkInfo.SubscriptionsActivityPeriod) != activityPeriod){
                Ext.MessageBox.alert('Select Network', 'This Network has different Activity Period than your Items.<br>Your Period: ' + periodName[activityPeriod] + '<br>Network Period: ' + periodName[contractPeriod.indexOf(networkInfo.SubscriptionsActivityPeriod)] + '<br>Use another Network or change Items first!');
            }else{
                var endDate = parseSOAPDateBSNC( networkInfo.SubscriptionsRenewalDate );
                endDate = moment(endDate).subtract(1, 'days');
                if( endDate < moment(startDate) ){
                    Ext.MessageBox.alert('Select Network', 'Sales Order Start Date (' + startDate + ') is later than Network End Date (' + endDate.format('M/D/YYYY') + ')<br>Please update this Network\'s Renewal Date or Renew it\'s Subscriptions first!');
                } else if( endDate > moment(renewalDate) ){
                    Ext.MessageBox.alert('Select Network', 'Network End Date (' + endDate.format('M/D/YYYY') + ') is later than Sales Order End Date (' + renewalDate + ')<br>If you use this network, the amount charged will be for more than 1 Subscription term!');
                }else{
                    Ext.MessageBox.alert('Select Network', 'Sales Order End Date will be changed to ' + endDate.format('M/D/YYYY') + '<br>If you use this network, the amount charged will be for less than 1 Subscription term!');
                }
            }
        }else{
            Ext.MessageBox.alert('Select Network', 'Network is of a wrong type.<br>You should convert this network first!');
        }
    }
}

function soapUpdateNetworkBillingModeBSNC( networkId, activityPeriod, renewalDate ){
    nlapiLogExecution('DEBUG', ' ' , '===================== Update Network Billing Mode ========================');
    nlapiLogExecution('DEBUG', 'networkId ' , networkId);
    nlapiLogExecution('DEBUG', 'activityPeriod ' , activityPeriod);
    nlapiLogExecution('DEBUG', 'renewalDate ' , renewalDate);

    var res = {error:"", result:false};

    if( isNullorEmpty(networkId) ){
        res.error = "Error: NetworkId is Empty";
        return res;
    }

    if( isNullorEmpty(activityPeriod) ){
        res.error = "Error: activityPeriod is Empty";
        return res;
    }

    if( isNullorEmpty(renewalDate) ){
        res.error = "Error: renewalDate is Empty";
        return res;
    }

    try{
        var soap = bsncGetSOAPHeader();
        soap += '<soapenv:Body xmlns:bsn="BSN.WebServices.Admin.DTO.2019.03" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">';
        soap += '<soap:UpdateNetworkBillingMode xmlns="https://api.bsn.cloud/Admin/2019/03/SOAP/">';
        soap += '<soap:networkId>' + networkId + '</soap:networkId>';
        soap += '<soap:billingMode>';
        soap += '<bsn:SubscriptionsActivityPeriod>' + activityPeriod + '</bsn:SubscriptionsActivityPeriod>';
        soap += '<bsn:SubscriptionsRenewalDate>' + renewalDate + '</bsn:SubscriptionsRenewalDate>';
        soap += '</soap:billingMode>';
        soap += '</soap:UpdateNetworkBillingMode>';
        soap += '</soapenv:Body>';
        soap += '</soapenv:Envelope>';
        //console.log(soap);
        nlapiLogExecution('DEBUG', 'soap ' , soap);

        var soapHeaders = bsncSOAPHeaders( 'UpdateNetworkBillingMode' );
        //console.log(soapHeaders);
        var requestServer = nlapiRequestURL(soapHeaders["endPoint"], soap, soapHeaders);
        var soapResponse = nlapiStringToXML(requestServer.getBody());
        //console.log(requestServer.getBody());
        nlapiLogExecution('DEBUG', 'requestServer ' , requestServer.getBody());
        var errorCode = nlapiSelectNodes( soapResponse, "//s:Fault" );
        if( typeof( errorCode ) == "undefined" || !errorCode.length ){
            //var result = nlapiSelectValue(soapResponse, "/s:Envelope/s:Body/UpdateNetworkBillingModeResponse/UpdateNetworkBillingModeResult");
            var responseBody = requestServer.getBody();
            nlapiLogExecution('DEBUG', 'requestBody ' , responseBody);
            var result = responseBody.match(/>true</i);
            //console.log( responseBody );
            //console.log( result );
            nlapiLogExecution('DEBUG', 'update billing mode result ' , result && result[0] == ">true<");
            if( result && result[0] == ">true<" ){
                res.result = true;
            } else {
                res.error = "Network Billing Mode Update Failed. Contact your administrator.";
            }
        } else {
            res.error = nlapiSelectValue(errorCode[0], "faultstring");
        }
    }catch(e){
        nlapiLogExecution('DEBUG', 'Exception ', e.message );
        nlapiLogExecution('DEBUG', 'Exception ', e.stack);
        nlapiLogExecution('DEBUG', 'Exception ', e.toString());
        res.error = e.message;
    }

    return res;
}

function soapSetNetworkContentBSNC( networkId, networkType, endDate ){
    nlapiLogExecution('DEBUG', ' ' , '===================== Set Network Type Content ========================');
    nlapiLogExecution('DEBUG', 'networkId ' , networkId);
    nlapiLogExecution('DEBUG', 'networkType' , networkType);

    var res = {error:"", result:false};

    if( isNullorEmpty(networkId) ){
        res.error = "Error: NetworkId is Empty";
        return res;
    }

    if( isNullorEmpty(endDate) ){
        endDate = null;
    }

    switch( networkType ){
        case "Content":
        case "Control": break;
        default: networkType = "Content"; break;
    }

    var errorCode = "";
    try{
        var soap = bsncGetSOAPHeader();
        soap += '<soapenv:Body>';
        soap += '<soap:SetNetworkSubscription>';
        soap += '<soap:networkId>' + networkId + '</soap:networkId>';
        soap += '<soap:networkSubscription xmlns:bsn="BSN.WebServices.Admin.DTO.2019.03">';
        if( endDate != null ) {
            soap += '<bsn:ExpireDate>' + endDate + '</bsn:ExpireDate>';
        }
        soap += '<bsn:Level>' + networkType + '</bsn:Level>';
        soap += '</soap:networkSubscription>';
        soap += '</soap:SetNetworkSubscription>';
        soap += '</soapenv:Body>';
        soap += '</soapenv:Envelope>';
        //console.log(soap);
        nlapiLogExecution('DEBUG', 'soap ' , soap);

        var soapHeaders = bsncSOAPHeaders( 'SetNetworkSubscription' );
        //console.log(soapHeaders);
        var requestServer = nlapiRequestURL(soapHeaders["endPoint"], soap, soapHeaders);
        var soapResponse = nlapiStringToXML(requestServer.getBody());
        //console.log(requestServer.getBody());
        nlapiLogExecution('DEBUG', 'requestServer ' , requestServer.getBody());
        errorCode = nlapiSelectValue(soapResponse, "//faultstring");
        if( isNullorEmpty(errorCode) ){
            nlapiLogExecution('DEBUG', 'set network type Content' , true);
            res.result = true;
        }
    }catch(e){
        nlapiLogExecution('DEBUG', 'Exception ', e.message );
        nlapiLogExecution('DEBUG', 'Exception ', e.stack);
        nlapiLogExecution('DEBUG', 'Exception ', e.toString());
        res.error = e.message;
    }

    return res;
}

function soapCreateDeviceSubscriptionsBSNC( subscriptions ){
    nlapiLogExecution('DEBUG', ' ' , '===================== Create Device Subscriptions ========================');
    nlapiLogExecution('DEBUG', 'subscriptions ' , subscriptions);

    var res = {error:"", newSubscriptions:[]};

    if( !Array.isArray(subscriptions) || ( Array.isArray(subscriptions) && !subscriptions.length ) ){
        res.error = "Error: subscriptions empty, nothing to create.";
        return res;
    } else if( !Array.isArray(subscriptions[0]) || ( Array.isArray(subscriptions[0]) && subscriptions[0].length != 6 ) ){
        res.error = "Error: subscriptions data is wrong.";
        return res;
    }

    try{
        var newSubscriptions = new Array();
        var created = 0;
        do{
            var timeStamp = getUTCDate();
            var soap = bsncGetSOAPHeader();
            soap += '<soapenv:Body xmlns:bsn="BSN.WebServices.Admin.DTO.2019.03" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">';
            soap += '<soap:CreateDeviceSubscriptions>';
            soap += "<soap:entities>";
            for(var i = 0; created < subscriptions.length && i < 100; created++, i++){
                soap += '<bsn:DeviceSubscription>';
                soap += '<bsn:ActivationDate>' + timeStamp + '</bsn:ActivationDate>';
                soap += '<bsn:ActivityPeriod>' + subscriptions[i][0] + '</bsn:ActivityPeriod>';
                soap += '<bsn:CreationDate>' + timeStamp + '</bsn:CreationDate>';
                soap += '<bsn:Device>';
                soap += '<bsn:Id>' + subscriptions[i][1] + '</bsn:Id>';
                soap += '<bsn:Serial>' + subscriptions[i][2] + '</bsn:Serial>';
                soap += '</bsn:Device>';
                soap += '<bsn:ExpirationDate i:nil="true"/>';
                soap += '<bsn:Id>0</bsn:Id>';
                soap += '<bsn:InvoiceNumber>' + subscriptions[i][3] + '</bsn:InvoiceNumber>';
                soap += '<bsn:IsDeleted>false</bsn:IsDeleted>';
                soap += '<bsn:KeyId i:nil="true"/>';
                soap += '<bsn:Network>';
                soap += '<bsn:Id>' + subscriptions[i][4] + '</bsn:Id>';
                soap += '<bsn:Name>' + subscriptions[i][5] + '</bsn:Name>';
                soap += '</bsn:Network>';
                soap += '<bsn:RenewalMethod>Automatic</bsn:RenewalMethod>';
                soap += '<bsn:Status>Active</bsn:Status>';
                soap += '<bsn:SuspensionDate i:nil="true"/>';
                soap += '<bsn:Traffic>0</bsn:Traffic>';
                soap += '<bsn:Type>Commercial</bsn:Type>';
                soap += '</bsn:DeviceSubscription>';
            }
            soap += "</soap:entities>";
            soap += '</soap:CreateDeviceSubscriptions>';
            soap += '</soapenv:Body>';
            soap += '</soapenv:Envelope>';
            //console.log(soap);
            nlapiLogExecution('DEBUG', 'soap ' , soap);

            var soapHeaders = bsncSOAPHeaders( 'CreateDeviceSubscriptions' );
            //console.log(soapHeaders);
            var requestServer = nlapiRequestURL(soapHeaders["endPoint"], soap, soapHeaders);
            var soapResponse = nlapiStringToXML(requestServer.getBody());
            //console.log(requestServer.getBody());
            nlapiLogExecution('DEBUG', 'requestServer ' , requestServer.getBody());
            var errorCode = nlapiSelectNodes( soapResponse, "//s:Fault" );
            if( typeof( errorCode ) == "undefined" || !errorCode.length ){
                var createdSubs = nlapiSelectNodes( soapResponse, "//a:DeviceSubscription" );
                for (var i = 0; i < createdSubs.length ; i++){
                    newSubscriptions.push( bsncParseSubscriptionInfo( createdSubs[i], "a:" ) );
                }
            } else {
                res.error = nlapiSelectValue(errorCode[0], "faultstring");
            }
        } while(created < subscriptions.length);

        res.newSubscriptions = newSubscriptions;
    }catch(e){
        nlapiLogExecution('DEBUG', 'Exception ', e.message );
        nlapiLogExecution('DEBUG', 'Exception ', e.stack);
        nlapiLogExecution('DEBUG', 'Exception ', e.toString());
        res.error = e.message;
    }
    return res;
}

function soapDeleteDeviceSubscriptionsBSNC( subscriptionIds, invoiceNum ){
    nlapiLogExecution('DEBUG', ' ' , '===================== Delete Device Subscriptions ========================');
    nlapiLogExecution('DEBUG', 'subscriptionIds ' , subscriptionIds);
    nlapiLogExecution('DEBUG', 'invoiceNum ' , invoiceNum);

    var res = {error:"", deleted:0};

    if( !Array.isArray(subscriptionIds) || !subscriptionIds.length ){
        res.error = "Error: subscriptionIds Empty, nothing to delete.";
        return res;
    }

    try{
        var deleted = 0;
        do{
            var soap = bsncGetSOAPHeader();
            soap += '<soapenv:Body xmlns:bsn="BSN.WebServices.Admin.DTO.2019.03" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">';
            soap += '<soap:DeleteDeviceSubscriptions>';
            soap += "<soap:subscriptionIds>";
            for(var i = 0; deleted < subscriptionIds.length && i < 100; deleted++, i++){
                soap += '<arr:int>' + subscriptionIds[deleted] + '</arr:int>';
            }
            soap += "</soap:subscriptionIds>";
            soap += '</soap:DeleteDeviceSubscriptions>';
            soap += '</soapenv:Body>';
            soap += '</soapenv:Envelope>';
            //console.log(soap);
            nlapiLogExecution('DEBUG', 'delSOAP ' , soap);

            var soapHeaders = bsncSOAPHeaders( 'DeleteDeviceSubscriptions' );
            //console.log(soapHeaders);
            var requestServer = nlapiRequestURL(soapHeaders["endPoint"], soap, soapHeaders);
            var soapResponse = nlapiStringToXML(requestServer.getBody());
            //console.log(requestServer.getBody());
            nlapiLogExecution('DEBUG', 'requestServer ' , requestServer.getBody());
            var errorCode = nlapiSelectNodes( soapResponse, "//s:Fault" );
            if( typeof( errorCode ) == "undefined" || !errorCode.length ){
                var responseBody = requestServer.getBody();
                nlapiLogExecution('DEBUG', 'requestServer ' , responseBody);
                var result = responseBody.match(/>true</i);
                if( result != ">true<" ){
                    res.error = 'Subscriptions were not deleted. Please contact Admin to delete those manually. SubscriptionID=' + invoiceNum;
                }
            } else {
                res.error = nlapiSelectValue(errorCode[0], "faultstring");
            }
        } while(deleted < subscriptionIds.length);
        res.deleted = deleted;
    }catch(e){
        nlapiLogExecution('DEBUG', 'Exception ', e.message );
        nlapiLogExecution('DEBUG', 'Exception ', e.stack);
        nlapiLogExecution('DEBUG', 'Exception ', e.toString());
        res.error = e.message;
    }
    return res;
}

function soapGetDeviceSubscriptionsBSNC( filter, sort ){
    nlapiLogExecution('DEBUG', ' ' , '===================== Get Device Subscriptions ========================');
    nlapiLogExecution('DEBUG', 'filter ' , filter);
    nlapiLogExecution('DEBUG', 'sort ' , sort);

    var res = {error:"", subscriptions:[]};
    if( isNullorEmpty(filter) ){
        res.error = "Error: Filter is Empty";
        return res;
    }

    if( isNullorEmpty(sort) ){
        sort = "[DeviceSubscription].[Id] ASC";
    }

    try{
        var nextMarker = '';
        var subscriptions = new Array();
        var findMore = false;
        do{
            var soap = bsncGetSOAPHeader();
            soap += '<soapenv:Body xmlns:bsn="BSN.WebServices.Admin.DTO.2019.03" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">';
            soap += '<soap:GetDeviceSubscriptions>';
            soap += "<soap:filter>" + filter + "</soap:filter>"; //"[DeviceSubscription].[InvoiceNumber] IS '45678'"
            soap += "<soap:sort>" + sort + "</soap:sort>";
            if( isNullorEmpty(nextMarker) ){
                soap += '<soap:marker i:nil="true"/>';
            } else {
                soap += "<soap:marker>" + nextMarker + "</soap:marker>";
            }
            soap += "<soap:pageSize>100</soap:pageSize>";
            soap += '</soap:GetDeviceSubscriptions>';
            soap += '</soapenv:Body>';
            soap += '</soapenv:Envelope>';
            //console.log(soap);

            var soapHeaders = bsncSOAPHeaders( 'GetDeviceSubscriptions' );
            //console.log(soapHeaders);
            var requestServer = nlapiRequestURL(soapHeaders["endPoint"], soap, soapHeaders);
            var soapResponse = nlapiStringToXML(requestServer.getBody());
            //console.log(requestServer.getBody());
            nlapiLogExecution('DEBUG', 'requestServer ' , requestServer.getBody());
            var errorCode = nlapiSelectNodes( soapResponse, "//s:Fault" );
            if( typeof( errorCode ) == "undefined" || !errorCode.length ){
                var resultNodes = nlapiSelectNode( soapResponse, "/s:Envelope/s:Body/GetDeviceSubscriptionsResponse" );
                //console.log(resultNodes);
                var resultsCount = nlapiSelectValue(soapResponse, "//a:MatchingItemCount");
                findMore = nlapiSelectValue(soapResponse, "//a:IsTruncated");
                nextMarker = nlapiSelectValue(soapResponse, "//a:NextMarker");
                //console.log(nextMarker);
                if( resultsCount && resultsCount != "0" ){
                    var rawSubscriptions = nlapiSelectNodes( soapResponse, "//b:DeviceSubscription" );
                    //console.log(rawSubscriptions);
                    for (var i = 0; i < rawSubscriptions.length ; i++){
                        subscriptions[subscriptions.length++] = bsncParseSubscriptionInfo( rawSubscriptions[i], "b:" );
                    }
                }
            } else {
                res.error = nlapiSelectValue(errorCode[0], "faultstring");
            }
        } while(findMore == 'true');
        res.subscriptions = subscriptions;
    }catch(e){
        nlapiLogExecution('DEBUG', 'Exception ', e.message );
        nlapiLogExecution('DEBUG', 'Exception ', e.stack);
        nlapiLogExecution('DEBUG', 'Exception ', e.toString());
        res.error = e.message;
    }
    return res;
}

function soapNetworkSubscriptionsCountBSNC( networkId, isTrial, invoiceArr ){
    nlapiLogExecution('DEBUG', ' ' , '===================== Network Subscriptions Count ========================');
    nlapiLogExecution('DEBUG', 'networkId ' , networkId);
    nlapiLogExecution('DEBUG', 'isTrial ' , isTrial);
    nlapiLogExecution('DEBUG', 'invoice ' , invoiceArr);

    var errorMessage = "";

    if( isNullorEmpty(networkId) ){
        errorMessage = "Error: Network ID is Empty";
    }

    if( isTrial !== true ){
        isTrial = false;
    }

    var notGrace = "";
    if( !isTrial ){
        notGrace = " AND [DeviceSubscription].[Type] IS NOT 'Grace'";
    }

    var addInvoice = "";
    if( !isNullorEmpty( invoiceArr ) && Array.isArray(invoiceArr) ){
        addInvoice = " AND ([DeviceSubscription].[InvoiceNumber] IS IN ('" + invoiceArr.join("','") + "'))";
    }

    if( errorMessage == "" ) {
        try {
            var soap = bsncGetSOAPHeader();
            soap += '<soapenv:Body xmlns:bsn="BSN.WebServices.Admin.DTO.2019.03" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">';
            soap += '<soap:GetDeviceSubscriptions>';
            soap += "<soap:filter>[DeviceSubscription].[Network].[Id] IS " + networkId + notGrace + addInvoice + "</soap:filter>";
            soap += "<soap:sort>[DeviceSubscription].[Id] ASC</soap:sort>";
            soap += '<soap:marker i:nil="true"/>';
            soap += "<soap:pageSize>1</soap:pageSize>";
            soap += '</soap:GetDeviceSubscriptions>';
            soap += '</soapenv:Body>';
            soap += '</soapenv:Envelope>';
            //console.log(soap);

            var soapHeaders = bsncSOAPHeaders('GetDeviceSubscriptions');
            var requestServer = nlapiRequestURL(soapHeaders["endPoint"], soap, soapHeaders);
            var soapResponse = nlapiStringToXML(requestServer.getBody());
            //console.log(requestServer.getBody());
            nlapiLogExecution('DEBUG', 'requestServer ', requestServer.getBody());
            var errorCode = nlapiSelectNodes(soapResponse, "//s:Fault");
            if (typeof (errorCode) == "undefined" || !errorCode.length) {
                var resultNodes = nlapiSelectNode(soapResponse, "/s:Envelope/s:Body/GetDeviceSubscriptionsResponse");
                var resultsCount = nlapiSelectValue(soapResponse, "//a:MatchingItemCount");
                return {'error': false, 'message': "", quantity: parseInt(resultsCount)};
            } else {
                errorMessage = nlapiSelectValue(errorCode[0], "faultcode") + ': ' + nlapiSelectValue(errorCode[0], "faultstring");
            }
        } catch (e) {
            nlapiLogExecution('DEBUG', 'Exception ', e.message);
            nlapiLogExecution('DEBUG', 'Exception ', e.stack);
            nlapiLogExecution('DEBUG', 'Exception ', e.toString());
            errorMessage = e.message;
        }
    }
    return {'error': true, 'message': errorMessage, quantity: 0};
}

function soapSetNetworkTrialBSNC( networkId ){
    nlapiLogExecution('DEBUG', ' ' , '===================== Set Network Trial ========================');
    nlapiLogExecution('DEBUG', 'networkId ' , networkId);

    if( isNullorEmpty(networkId) ){
        return "Error: Network ID is Empty";
    }

    try{
        var soap = bsncGetSOAPHeader();
        soap += '<soapenv:Body>';
        soap += '<soap:SetNetworkSubscription>';
        soap += '<soap:networkId>' + networkId + '</soap:networkId>';
        soap += '<soap:networkSubscription xmlns:bsn="BSN.WebServices.Admin.DTO.2019.03">';
        //soap += '<bsn:ExpireDate>null</bsn:ExpireDate>';
        soap += '<bsn:Level>Trial</bsn:Level>';
        soap += '</soap:networkSubscription>';
        soap += '</soap:SetNetworkSubscription>';
        soap += '</soapenv:Body>';
        soap += '</soapenv:Envelope>';

        var soapHeaders = bsncSOAPHeaders( 'SetNetworkSubscription' );
        var requestServer = nlapiRequestURL(soapHeaders["endPoint"], soap, soapHeaders);
        var soapResponse = nlapiStringToXML(requestServer.getBody());
        //console.log(requestServer.getBody());
        nlapiLogExecution('DEBUG', 'requestServer ' , requestServer.getBody());
        var errorCode = nlapiSelectValue(soapResponse, "//faultstring");
        if( isNullorEmpty(errorCode) ){
            var responseBody = requestServer.getBody();
            nlapiLogExecution('DEBUG', 'requestServer ' , responseBody);
            var result = responseBody.match(/>true</i);
            if( result != ">true<" ){
                return 'Network was not converted to Trial mode.';
            }
        } else {
            return 'Error: ' + errorCode;
        }
    }catch(e){
        nlapiLogExecution('DEBUG', 'Exception ', e.message );
        nlapiLogExecution('DEBUG', 'Exception ', e.name);
        nlapiLogExecution('DEBUG', 'Exception ', e.toString());
    }
    return false;
}

function soapGetNetworksByCustomerEmailBSNC( customerEmail ){
    nlapiLogExecution('DEBUG', ' ' , '===================== Get Network By Customer Email ========================');
    nlapiLogExecution('DEBUG', 'customerEmail ' , customerEmail);
    var res = {error:"", networks:[]};
    if( isNullorEmpty(customerEmail) ){
        nlapiLogExecution('ERROR', 'ERROR ', "Network Admin Email Empty. Cannot search for Networks." );
        res.error = "Network Admin Email Empty. Cannot search for Networks.";
        return res;
    }

    try{
        var findMore = false;
        var nextMarker = 0;
        var users = new Array();
        var networks = new Array();
        var selected = nlapiGetFieldValue("bs_default_network");
        do{
            var soap = bsncGetSOAPHeader();
            soap += '<soapenv:Body>';
            soap += '<soap:FindUsers>';
            soap += '<soap:namePattern>' + customerEmail + '</soap:namePattern>';
            soap += '<soap:marker>' + nextMarker + '</soap:marker>';
            soap += '<soap:pageSize>100</soap:pageSize>';
            soap += '</soap:FindUsers>';
            soap += '</soapenv:Body>';
            soap += '</soapenv:Envelope>';

            //console.log(nlapiGetContext().getRemainingUsage());
            nlapiLogExecution('DEBUG', 'remaining usage ' , nlapiGetContext().getRemainingUsage());
            //console.log(soap);
            var soapHeaders = bsncSOAPHeaders( 'FindUsers' );
            //console.log(soapHeaders);
            var requestServer = nlapiRequestURL(soapHeaders["endPoint"], soap, soapHeaders);
            var soapResponse = nlapiStringToXML(requestServer.getBody());
            nlapiLogExecution('DEBUG', 'requestServer ' , requestServer.getBody());
            //console.log(soapResponse);
            var errorCode = nlapiSelectNodes( soapResponse, "//s:Fault" );
            if( typeof( errorCode ) == "undefined" || !errorCode.length ){
                var resultNodes = nlapiSelectNode( soapResponse, "/s:Envelope/s:Body/FindUsersResponse" );
                //console.log(resultNodes);
                var resultsCount = nlapiSelectValue(soapResponse, "//a:MatchingItemCount");
                findMore = nlapiSelectValue(soapResponse, "//a:IsTruncated");
                nextMarker = nlapiSelectValue(soapResponse, "//a:NextMarker");
                //nlapiLogExecution('DEBUG', 'resultsCount ' , resultsCount);
                if( resultsCount && resultsCount != "0" ){
                    var rawUsers = nlapiSelectNodes( soapResponse, "//b:User" );
                    var noDefaultNetwork = isNullorEmpty(selected);
                    for (var i = 0; i < rawUsers.length ; i++){
                        users[users.length++] = bsncParseUserInfo( rawUsers[i] );
                        var netId = nlapiSelectValue(rawUsers[i], "b:Network/b:Id");
                        networks.push([netId, nlapiSelectValue(rawUsers[i], "b:Network/b:Name"), netId == selected || (noDefaultNetwork && !i) ? "selected" : ""]);
                    }
                }
            } else {
                nlapiLogExecution('ERROR', 'ERROR ', nlapiSelectValue(errorCode[0], "faultcode") + ': ' + nlapiSelectValue(errorCode[0], "faultstring") );
                res.error = nlapiSelectValue(errorCode[0], "faultstring");
                return res;
            }
        } while(findMore == 'true');

        if( networks.length ) {
            networks.sort(function (o1, o2) {
                return o1[1] > o2[1] ? 1 : o1[1] < o2[1] ? -1 : 0;
            });
            res.networks = networks;
            res.error = "";
        } else {
            res.error = "No Networks for " + customerEmail;
        }

    }catch(e){
        nlapiLogExecution('DEBUG', 'Exception ', e.message );
        nlapiLogExecution('DEBUG', 'Exception ', e.stack);
        nlapiLogExecution('DEBUG', 'Exception ', e.toString());
        res.error = e.message;
    }

    return res;
}

function soapGetNetworkByIdBSNC( networkId, loadUsers ){
    nlapiLogExecution('DEBUG', ' ' , '===================== Get Network By Id ========================');
    nlapiLogExecution('DEBUG', 'networkId ' , networkId);

    if( isNullorEmpty(networkId) ){
        return new bsncNetwork( { 'IsError': true, 'Message': 'Error: NetworkId is Empty' } );
    }

    if( isNullorEmpty( loadUsers ) ) loadUsers = false;

    try{
        var soap = bsncGetSOAPHeader();
        soap += '<soapenv:Body>';
        soap += '<soap:GetNetworkById>';
        soap += '<soap:networkId>' + networkId + '</soap:networkId>';
        soap += '<soap:loadUsers>' + loadUsers + '</soap:loadUsers>';
        soap += '</soap:GetNetworkById>';
        soap += '</soapenv:Body>';
        soap += '</soapenv:Envelope>';
        //console.log(soap);

        nlapiLogExecution('DEBUG', 'remaining usage ' , nlapiGetContext().getRemainingUsage());
        var soapHeaders = bsncSOAPHeaders( 'GetNetworkById' );
        //console.log(soapHeaders);
        var requestServer = nlapiRequestURL(soapHeaders["endPoint"], soap, soapHeaders);
        var soapResponse = nlapiStringToXML(requestServer.getBody());
        //console.log(requestServer.getBody());
        nlapiLogExecution('DEBUG', 'requestServer ' , requestServer.getBody());
        var errorCode = nlapiSelectValue(soapResponse, "//faultstring");
        if( isNullorEmpty(errorCode) ){
            var resultsId = nlapiSelectValue(soapResponse, "//a:Id");
            nlapiLogExecution('DEBUG', 'resultsId ', resultsId );
            if( resultsId && resultsId != "0" ){
                return bsncParseNetworkInfo( soapResponse );
            }
        } else {
            return new bsncNetwork( { 'IsError': true, 'Message': errorCode } );
        }
    }catch(e){
        nlapiLogExecution('DEBUG', 'Exception ', e.message );
        nlapiLogExecution('DEBUG', 'Exception ', e.stack);
        nlapiLogExecution('DEBUG', 'Exception ', e.toString());
        return new bsncNetwork( { 'IsError': true, 'Message': e.message } );
    }
    return new bsncNetwork( { 'IsError': true, 'Message': 'No network found with ID ' + networkId } );
}

function soapGetNetworkByNameBSNC( networkName ){
    nlapiLogExecution('DEBUG', ' ' , '===================== Get Network By Name ========================');
    nlapiLogExecution('DEBUG', 'networkId ' , networkName);

    if( isNullorEmpty(networkName) ){
        return new bsncNetwork( { 'IsError': true, 'Message': 'Error: NetworkName is Empty' } );
    }

    var error = "";
    var loadUsers = false;

    try{
        var soap = bsncGetSOAPHeader();
        soap += '<soapenv:Body>';
        soap += '<soap:GetNetworkByName>';
        soap += '<soap:name>' + networkName + '</soap:name>';
        soap += '<soap:loadUsers>' + loadUsers + '</soap:loadUsers>';
        soap += '</soap:GetNetworkByName>';
        soap += '</soapenv:Body>';
        soap += '</soapenv:Envelope>';
        //console.log(soap);

        nlapiLogExecution('DEBUG', 'remaining usage ' , nlapiGetContext().getRemainingUsage());
        var soapHeaders = bsncSOAPHeaders( 'GetNetworkByName' );
        //console.log(soapHeaders);
        var requestServer = nlapiRequestURL(soapHeaders["endPoint"], soap, soapHeaders);
        var soapResponse = nlapiStringToXML(requestServer.getBody());
        //console.log(requestServer.getBody());
        nlapiLogExecution('DEBUG', 'requestServer ' , requestServer.getBody());
        var errorCode = nlapiSelectValue(soapResponse, "//faultstring");
        if( isNullorEmpty(errorCode) ){
            var resultsId = nlapiSelectValue(soapResponse, "//a:Id");
            nlapiLogExecution('DEBUG', 'resultsId ', resultsId );
            if( resultsId && resultsId != "0" ){
                return bsncParseNetworkInfo( soapResponse );
            } else {
                return new bsncNetwork( { 'IsError': true, 'Message': 'Network "' + networkName + '" was not found.' } );
            }
        } else {
            return new bsncNetwork( { 'IsError': true, 'Message': errorCode } );
        }
    }catch(e){
        nlapiLogExecution('DEBUG', 'Exception ', e.message );
        nlapiLogExecution('DEBUG', 'Exception ', e.stack);
        nlapiLogExecution('DEBUG', 'Exception ', e.toString());
        error = e.message;
    }

    return new bsncNetwork( { 'IsError': true, 'Message': error } );
}


function soapCreateUserBSNC( networkAdmin, networkId, password ){
    nlapiLogExecution('DEBUG', ' ' , '===================== Create Network Admin ========================');
    nlapiLogExecution('DEBUG', 'networkAdmin ' , networkAdmin);
    nlapiLogExecution('DEBUG', 'networkId ' , networkId);
    nlapiLogExecution('DEBUG', 'password ' , password);

    var errorMessage = "";

    if( isNullorEmpty(networkId) ){
        errorMessage += "Error: NetworkId is Empty<br>";
    }

    if( isNullorEmpty(networkAdmin) ){
        errorMessage += "Error: Admin Email is Empty<br>";
    }

    if( isNullorEmpty(password) ){
        errorMessage += "Error: password is Empty<br>";
    }

    if( errorMessage == "" ){
        try{
            var soap = bsncGetSOAPHeader();
            soap += '<soapenv:Body xmlns:bsn="BSN.WebServices.Admin.DTO.2019.03">';
            soap += '<soap:CreateUser>';
            soap += '<soap:user xmlns:i="http://www.w3.org/2001/XMLSchema-instance">';
            soap += '<bsn:CreationDate>0001</bsn:CreationDate>';
            soap += '<bsn:Description>NetSuite Created</bsn:Description>';
            soap += '<bsn:Email>' + networkAdmin + '</bsn:Email>';
            soap += '<bsn:FirstName></bsn:FirstName>';
            soap += '<bsn:Id>0</bsn:Id>';
            soap += '<bsn:IsLockedOut>false</bsn:IsLockedOut>';
            soap += '<bsn:LastLockoutDate i:nil="true" />';
            soap += '<bsn:LastLoginDate i:nil="true" />';
            soap += '<bsn:LastName></bsn:LastName>';
            soap += '<bsn:Login>' + networkAdmin + '</bsn:Login>';
            soap += '<bsn:Network>';
            soap += '<bsn:Id>' + networkId + '</bsn:Id>';
            soap += '<bsn:Name></bsn:Name>';
            soap += '</bsn:Network>';
            soap += '<bsn:Password>' + password + '</bsn:Password>';
            soap += '<bsn:RoleName>Administrators</bsn:RoleName>';
            soap += '</soap:user>';
            soap += '</soap:CreateUser>';
            soap += '</soapenv:Body>';
            soap += '</soapenv:Envelope>';
            console.log(soap);

            var soapHeaders = bsncSOAPHeaders( 'CreateUser' );
            console.log(soapHeaders);
            var requestServer = nlapiRequestURL(soapHeaders["endPoint"], soap, soapHeaders);
            var soapResponse = nlapiStringToXML(requestServer.getBody());
            console.log(requestServer.getBody());
            nlapiLogExecution('DEBUG', 'requestServer ' , requestServer.getBody());
            var errorCode = nlapiSelectNodes( soapResponse, "//s:Fault" );
            if( typeof( errorCode ) == "undefined" || !errorCode.length ){
                var resultsId = nlapiSelectValue(soapResponse, "//a:Id");
                if( resultsId && resultsId != "0" ){
                    return bsncParseNetworkUserInfo( soapResponse );
                } else {
                    errorMessage = "User was not created. Please contact your administrator.";
                }
            } else {
                errorMessage = nlapiSelectValue(errorCode[0], "faultcode") + ': ' + nlapiSelectValue(errorCode[0], "faultstring");
            }
        }catch(e){
            nlapiLogExecution('DEBUG', 'Exception ', e.message );
            nlapiLogExecution('DEBUG', 'Exception ', e.stack);
            nlapiLogExecution('DEBUG', 'Exception ', e.toString());
            errorMessage = e.message;
        }
    }
    return new bsncNetworkAdmin( { 'IsError': true, 'Message': errorMessage } );
}

function soapCreateNetworkBSNC( networkAdmin, networkName, activityPeriod, renewalDate, subLevel, isTrial ) {
    nlapiLogExecution('DEBUG', ' ', '===================== Create Network ========================');
    nlapiLogExecution('DEBUG', 'networkAdmin ', networkAdmin);
    nlapiLogExecution('DEBUG', 'networkName ', networkName);
    nlapiLogExecution('DEBUG', 'activityPeriod ', activityPeriod);
    nlapiLogExecution('DEBUG', 'renewalDate ', renewalDate);
    nlapiLogExecution('DEBUG', 'isTrial ', isTrial);

    var errorMessage = "";

    if (isNullorEmpty(networkName)) {
        errorMessage += "Error: NetworkName is Empty.<br>";
    }

    if (isNullorEmpty(networkAdmin)) {
        errorMessage += "Error: Admin Email is Empty.<br>";
    }

    if (subLevel !== 'Content') {
        subLevel = 'Control';
    }

    if (isNullorEmpty(renewalDate) && subLevel == 'Content') {
        errorMessage += "Error: renewalDate is Empty.<br>";
    } else {
        if (isNullorEmpty(renewalDate)) {
            var today = moment();
            /* Todo: Replace with dynamic time */
            renewalDate = getUTCDate(bsAddMonths(new Date(), 12));
        }
    }

    if (isNullorEmpty(activityPeriod) && subLevel == 'Content') {
        errorMessage += "Error: activityPeriod is Empty.<br>";
    } else {
        if (isNullorEmpty(activityPeriod)) {
            activityPeriod = 'P365D';
        }
    }

    if (isTrial !== 'true') {
        isTrial = 'false';
    }
    if (errorMessage == "") {
        try {
            var soap = bsncGetSOAPHeader();
            soap += '<soapenv:Body xmlns:bsn="BSN.WebServices.Admin.DTO.2019.03">';
            soap += '<soap:CreateNetwork>';
            soap += '<soap:network xmlns:i="http://www.w3.org/2001/XMLSchema-instance">';
            soap += '<bsn:BillingMode>';
            soap += '<bsn:SubscriptionsActivityPeriod>' + activityPeriod + '</bsn:SubscriptionsActivityPeriod>';
            soap += '<bsn:SubscriptionsRenewalDate>' + renewalDate + '</bsn:SubscriptionsRenewalDate>';
            soap += '</bsn:BillingMode>';
            soap += '<bsn:CreationDate>0001</bsn:CreationDate>';
            soap += '<bsn:Id>0</bsn:Id>';
            soap += '<bsn:IsLockedOut>false</bsn:IsLockedOut>';
            soap += '<bsn:LastLockoutDate i:nil="true" />';
            soap += '<bsn:LockoutDate i:nil="true" />';
            soap += '<bsn:Name>' + networkName + '</bsn:Name>';
            soap += '<bsn:Settings>';
            soap += '<bsn:AutomaticDeviceSubscriptionsManagementEnabled>true</bsn:AutomaticDeviceSubscriptionsManagementEnabled>';
            soap += '<bsn:AutomaticTaggedPlaylistApprovementEnabled>false</bsn:AutomaticTaggedPlaylistApprovementEnabled>';
            soap += '<bsn:BrightAuthorAccessRestricted>false</bsn:BrightAuthorAccessRestricted>';
            soap += '<bsn:WebUIAccessRestricted>false</bsn:WebUIAccessRestricted>';
            soap += '</bsn:Settings>';
            soap += '<bsn:Subscription>';
            soap += '<bsn:CreationDate>0001</bsn:CreationDate>';
            soap += '<bsn:ExpireDate i:nil="true"/>';
            soap += '<bsn:Id>0</bsn:Id>';
            soap += '<bsn:IsTrial>' + isTrial + '</bsn:IsTrial>';
            soap += '<bsn:LastModifiedDate>0001</bsn:LastModifiedDate>';
            soap += '<bsn:Level>' + subLevel + '</bsn:Level>';
            soap += '</bsn:Subscription>';
            soap += '<bsn:SetupCompletionDate i:nil="true" />';
            soap += '<bsn:Users>';
            soap += '<bsn:User>';
            soap += '<bsn:CreationDate>0001</bsn:CreationDate>';
            soap += '<bsn:Description>AutoGeneratedUserForNewNetwork</bsn:Description>';
            soap += '<bsn:Email>' + networkAdmin + '</bsn:Email>';
            soap += '<bsn:FirstName></bsn:FirstName>';
            soap += '<bsn:Id>0</bsn:Id>';
            soap += '<bsn:IsLockedOut>false</bsn:IsLockedOut>';
            soap += '<bsn:LastLockoutDate i:nil="true" />';
            soap += '<bsn:LastLoginDate i:nil="true" />';
            soap += '<bsn:LastName></bsn:LastName>';
            soap += '<bsn:Login>' + networkAdmin + '</bsn:Login>';
            soap += '<bsn:Network>';
            soap += '<bsn:Id>0</bsn:Id>';
            soap += '<bsn:Name></bsn:Name>';
            soap += '</bsn:Network>';
            soap += '<bsn:Password></bsn:Password>';
            soap += '<bsn:RoleName>Administrators</bsn:RoleName>';
            soap += '</bsn:User>';
            soap += '</bsn:Users>';
            soap += '</soap:network>';
            soap += '</soap:CreateNetwork>';
            soap += '</soapenv:Body>';
            soap += '</soapenv:Envelope>';

            var soapHeaders = bsncSOAPHeaders('CreateNetwork');
            var requestServer = nlapiRequestURL(soapHeaders["endPoint"], soap, soapHeaders);
            var soapResponse = nlapiStringToXML(requestServer.getBody());
            nlapiLogExecution('DEBUG', 'requestServer ', requestServer.getBody());
            var errorCode = nlapiSelectValue(soapResponse, "//faultstring");
            if (isNullorEmpty(errorCode)) {
                var resultsId = nlapiSelectValue(soapResponse, "//a:Id");
                nlapiLogExecution('DEBUG', 'resultsId ', resultsId);
                if (resultsId && resultsId != "0") {
                    return bsncParseNetworkInfo(soapResponse);
                } else {
                    errorMessage = 'Network was not created. Please contact your administrator.';
                }
            } else {
                errorMessage = errorCode;
            }
        } catch (e) {
            nlapiLogExecution('DEBUG', 'Exception ', e.message);
            nlapiLogExecution('DEBUG', 'Exception ', e.stack);
            nlapiLogExecution('DEBUG', 'Exception ', e.toString());
            errorMessage = e.message;
        }
    }
    return new bsncNetwork({'IsError': true, 'Message': errorMessage});
}

function soapUpdateNetworkBSNC( networkID, networkName, activityPeriod, renewalDate, suspend ) {
    nlapiLogExecution('DEBUG', ' ', '===================== Create Network ========================');
    nlapiLogExecution('DEBUG', 'networkAdmin ', networkID);
    nlapiLogExecution('DEBUG', 'networkName ', networkName);
    nlapiLogExecution('DEBUG', 'activityPeriod ', activityPeriod);
    nlapiLogExecution('DEBUG', 'renewalDate ', renewalDate);
    nlapiLogExecution('DEBUG', 'suspend ', suspend);

    var res = {error:"", result:false};
    var errorMessage = "";
    var subLevel = "Content";

    if (isNullorEmpty(networkID)) {
        errorMessage += "Error: NetworkID is Empty.<br>";
    }

    if (isNullorEmpty(networkName)) {
        errorMessage += "Error: NetworkName is Empty.<br>";
    }

    if (isNullorEmpty(activityPeriod)) {
        errorMessage += "Error: activityPeriod is Empty.<br>";
    }

    if (isNullorEmpty(renewalDate)) {
        errorMessage += "Error: renewalDate is Empty.<br>";
    }

    if (suspend !== true) {
        suspend = false;
    }
    if (errorMessage == "") {
        try {
            var soap = bsncGetSOAPHeader();
            soap += '<soapenv:Body xmlns:bsn="BSN.WebServices.Admin.DTO.2019.03">';
            soap += '<soap:UpdateNetwork>';
            soap += '<soap:entity xmlns:i="http://www.w3.org/2001/XMLSchema-instance">';
            soap += '<bsn:BillingMode>';
            soap += '<bsn:SubscriptionsActivityPeriod>' + activityPeriod + '</bsn:SubscriptionsActivityPeriod>';
            soap += '<bsn:SubscriptionsRenewalDate>' + renewalDate + '</bsn:SubscriptionsRenewalDate>';
            soap += '</bsn:BillingMode>';
            soap += '<bsn:CreationDate>0001</bsn:CreationDate>';
            soap += '<bsn:Id>' + networkID + '</bsn:Id>';
            soap += '<bsn:IsLockedOut>' + suspend + '</bsn:IsLockedOut>';
            soap += '<bsn:LastLockoutDate i:nil="true" />';
            soap += '<bsn:LockoutDate i:nil="true" />';
            soap += '<bsn:Name>' + networkName + '</bsn:Name>';
            /*
            soap += '<bsn:Settings>';
            soap += '<bsn:AutomaticDeviceSubscriptionsManagementEnabled>true</bsn:AutomaticDeviceSubscriptionsManagementEnabled>';
            soap += '<bsn:AutomaticTaggedPlaylistApprovementEnabled>false</bsn:AutomaticTaggedPlaylistApprovementEnabled>';
            soap += '<bsn:BrightAuthorAccessRestricted>false</bsn:BrightAuthorAccessRestricted>';
            soap += '<bsn:WebUIAccessRestricted>false</bsn:WebUIAccessRestricted>';
            soap += '</bsn:Settings>';
            */
            soap += '<bsn:Subscription>';
            /*
            soap += '<bsn:CreationDate>0001</bsn:CreationDate>';
            soap += '<bsn:ExpireDate i:nil="true"/>';
            soap += '<bsn:Id>0</bsn:Id>';
            soap += '<bsn:IsTrial>' + isTrial + '</bsn:IsTrial>';
            soap += '<bsn:LastModifiedDate>0001</bsn:LastModifiedDate>';
            */
            soap += '<bsn:Level>' + subLevel + '</bsn:Level>';
            soap += '</bsn:Subscription>';
            /*
            soap += '<bsn:SetupCompletionDate i:nil="true" />';
            soap += '<bsn:Users>';
            soap += '<bsn:User>';
            soap += '<bsn:CreationDate>0001</bsn:CreationDate>';
            soap += '<bsn:Description>AutoGeneratedUserForNewNetwork</bsn:Description>';
            soap += '<bsn:Email>' + networkAdmin + '</bsn:Email>';
            soap += '<bsn:FirstName></bsn:FirstName>';
            soap += '<bsn:Id>0</bsn:Id>';
            soap += '<bsn:IsLockedOut>false</bsn:IsLockedOut>';
            soap += '<bsn:LastLockoutDate i:nil="true" />';
            soap += '<bsn:LastLoginDate i:nil="true" />';
            soap += '<bsn:LastName></bsn:LastName>';
            soap += '<bsn:Login>' + networkAdmin + '</bsn:Login>';
            soap += '<bsn:Network>';
            soap += '<bsn:Id>0</bsn:Id>';
            soap += '<bsn:Name></bsn:Name>';
            soap += '</bsn:Network>';
            soap += '<bsn:Password></bsn:Password>';
            soap += '<bsn:RoleName>Administrators</bsn:RoleName>';
            soap += '</bsn:User>';
            soap += '</bsn:Users>';
            */
            soap += '</soap:entity>';
            soap += '</soap:UpdateNetwork>';
            soap += '</soapenv:Body>';
            soap += '</soapenv:Envelope>';
            //console.log(soap);

            var soapHeaders = bsncSOAPHeaders('UpdateNetwork');
            var requestServer = nlapiRequestURL(soapHeaders["endPoint"], soap, soapHeaders);
            var soapResponse = nlapiStringToXML(requestServer.getBody());
            nlapiLogExecution('DEBUG', 'requestServer ', requestServer.getBody());
            //console.log(requestServer.getBody());
            var errorCode = nlapiSelectValue(soapResponse, "//faultstring");
            if( typeof( errorCode ) == "undefined" || errorCode == null || !errorCode.length ){
                var responseBody = requestServer.getBody();
                nlapiLogExecution('DEBUG', 'requestBody ' , responseBody);
                var result = responseBody.match(/>true</i);
                nlapiLogExecution('DEBUG', 'suspend network result ' , result && result[0] == ">true<");
                if( result && result[0] == ">true<" ){
                    res.result = true;
                } else {
                    res.error = "Network Suspend Failed. Contact your administrator.";
                }
            } else {
                res.error = nlapiSelectValue(errorCode[0], "faultstring");
            }
        } catch (e) {
            nlapiLogExecution('DEBUG', 'Exception ', e.message);
            nlapiLogExecution('DEBUG', 'Exception ', e.stack);
            nlapiLogExecution('DEBUG', 'Exception ', e.toString());
            res.error = e.message;
        }
    }
    return res;
}

/***************** Stage ****************/
 function bsncGetSOAPHeader(){
    var creds = getCredsBSNC();
    var created = getUTCDate();
    var wsse = {
        'SOAP': creds.soap,
        'Username' : creds.user,
        'Password' : creds.pass,
        'Nonce' : nlapiEncrypt(created + "some secrets are to be kept", "base64"),
        'Created' : created,
        'UsernameToken' : nlapiEncrypt(created + "some users are to be created", "base64")
    };

    var soap='';
    soap += '<soapenv:Envelope xmlns:soap="' + wsse["SOAP"] + '" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">';
    soap += '<soapenv:Header>';
    soap += '<wsse:Security soapenv:mustUnderstand="1" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">';
    soap += '<wsse:UsernameToken wsu:Id="UsernameToken-' + wsse["UsernameToken"] + '">';
    soap += '<wsse:Username>' + wsse["Username"] + '</wsse:Username>';
    soap += '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + wsse["Password"] + '</wsse:Password>';
    soap += '<wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">' + wsse["Nonce"] + '</wsse:Nonce>';
    soap += '<wsu:Created>' + wsse["Created"] + '</wsu:Created>';
    soap += '</wsse:UsernameToken>';
    soap += '</wsse:Security>';
    soap += '</soapenv:Header>';

    return soap;
}
 /*********************************/

function bsncParseUserInfo( soapResponse ){
    var args = {
        "CreationDate" : transformUTCDateToPSTDate( nlapiSelectValue(soapResponse, "b:CreationDate") ),
        "Description" : nlapiSelectValue(soapResponse, "b:Description"),
        "Email" : nlapiSelectValue(soapResponse, "b:Email"),
        "FirstName" : nlapiSelectValue(soapResponse, "b:FirstName"),
        "Id" : nlapiSelectValue(soapResponse, "b:Id"),
        "IsLockedOut" : nlapiSelectValue(soapResponse, "b:IsLockedOut"),
        "LastName" : nlapiSelectValue(soapResponse, "b:LastName"),
        "Login" : nlapiSelectValue(soapResponse, "b:Login"),
        "RoleName" : nlapiSelectValue(soapResponse, "b:RoleName"),
        "NetworkId" : nlapiSelectValue(soapResponse, "b:Network/b:Id"),
        "NetworkName" : nlapiSelectValue(soapResponse, "b:Network/b:Name")
    };

    return new bsncUser( args );
}

function bsncParseSubscriptionInfo( soapResponse, prefix ){
    var args = {
        "ActivationDate" : transformUTCDateToPSTDate( nlapiSelectValue(soapResponse, prefix + "ActivationDate") ),
        "ActivityPeriod" : nlapiSelectValue(soapResponse, prefix + "ActivityPeriod"),
        "CreationDate" : transformUTCDateToPSTDate( nlapiSelectValue(soapResponse, prefix + "CreationDate") ),
        "DeviceId" : nlapiSelectValue(soapResponse, prefix + "Device/" + prefix + "Id"),
        "DeviceSerial" : nlapiSelectValue(soapResponse, prefix + "Device/" + prefix + "Serial"),
        "ExpirationDate" : transformUTCDateToPSTDate( nlapiSelectValue(soapResponse, prefix + "ExpirationDate") ),
        "Id" : nlapiSelectValue(soapResponse, prefix + "Id"),
        "InvoiceNumber" : nlapiSelectValue(soapResponse, prefix + "InvoiceNumber"),
        "IsDeleted" : nlapiSelectValue(soapResponse, prefix + "IsDeleted"),
        "KeyId" : nlapiSelectValue(soapResponse, prefix + "KeyId"),
        "NetworkId" : nlapiSelectValue(soapResponse, prefix + "Network/" + prefix + "Id"),
        "NetworkName" : nlapiSelectValue(soapResponse, prefix + "Network/" + prefix + "Name"),
        "RenewalMethod" : nlapiSelectValue(soapResponse, prefix + "RenewalMethod"),
        "Status" : nlapiSelectValue(soapResponse, prefix + "Status"),
        "SuspensionDate" : transformUTCDateToPSTDate( nlapiSelectValue(soapResponse, prefix + "SuspensionDate") ),
        "Traffic" : nlapiSelectValue(soapResponse, prefix + "Traffic"),
        "Type" : nlapiSelectValue(soapResponse, prefix + "Type")
    };

    return new bsncSubscription( args );
}

function bsncParseNetworkInfo( soapResponse ){
    var args = {
        "SubscriptionsActivityPeriod" : nlapiSelectValue(soapResponse, "//a:BillingMode/a:SubscriptionsActivityPeriod"),
        "SubscriptionsRenewalDate" : transformUTCDateToPSTDate( nlapiSelectValue(soapResponse, "//a:BillingMode/a:SubscriptionsRenewalDate") ),
        "CreationDate" : transformUTCDateToPSTDate( nlapiSelectValue(soapResponse, "//a:CreationDate") ),
        "Id" : nlapiSelectValue(soapResponse, "//a:Id"),
        "IsLockedOut" : nlapiSelectValue(soapResponse, "//a:IsLockedOut"),
        "LastLockoutDate" : transformUTCDateToPSTDate( nlapiSelectValue(soapResponse, "//a:LastLockoutDate") ),
        "LockoutDate" : transformUTCDateToPSTDate( nlapiSelectValue(soapResponse, "//a:LockoutDate") ),
        "Name" : nlapiSelectValue(soapResponse, "//a:Name"),
        "AutomaticDeviceSubscriptionsManagementEnabled" : nlapiSelectValue(soapResponse, "//a:Settings/a:AutomaticDeviceSubscriptionsManagementEnabled"),
        "AutomaticTaggedPlaylistApprovementEnabled" : nlapiSelectValue(soapResponse, "//a:Settings/a:AutomaticTaggedPlaylistApprovementEnabled"),
        "BrightAuthorAccessRestricted" : nlapiSelectValue(soapResponse, "//a:Settings/a:BrightAuthorAccessRestricted"),
        "WebUIAccessRestricted" : nlapiSelectValue(soapResponse, "//a:Settings/a:WebUIAccessRestricted"),
        "SetupCompletionDate" : nlapiSelectValue(soapResponse, "//a:SetupCompletionDate"),
        "NetworkSubscriptions" : [],
        "isTrial" : false,
        "wasTrial" : false,
        "isContent" : false,
        "isControl" : false,
    };

    if( args.LastLockoutDate ) args.LastLockoutDate = args.LastLockoutDate.substr(0, 10);

    var subInfo = [];
    var CreationDate = nlapiSelectNodes( soapResponse, "//a:NetworkSubscription/a:CreationDate" );
    var ExpireDate = nlapiSelectNodes( soapResponse, "//a:NetworkSubscription/a:ExpireDate" );
    var Id = nlapiSelectNodes( soapResponse, "//a:NetworkSubscription/a:Id" );
    var LastModifiedDate = nlapiSelectNodes( soapResponse, "//a:NetworkSubscription/a:LastModifiedDate" );
    var Level = nlapiSelectNodes( soapResponse, "//a:NetworkSubscription/a:Level" );
    for (var i = 0; i < CreationDate.length ; i++){
        subInfo[subInfo.length] = bsncParseNetworkSubscriptionInfo({
            "CreationDate": transformUTCDateToPSTDate( CreationDate[i].firstChild ? CreationDate[i].firstChild.nodeValue : CreationDate[i].firstChild ),
            "ExpireDate": transformUTCDateToPSTDate( ExpireDate[i].firstChild ? ExpireDate[i].firstChild.nodeValue : ExpireDate[i].firstChild ),
            "Id": Id[i].firstChild ? Id[i].firstChild.nodeValue : Id[i].firstChild,
            "LastModifiedDate": transformUTCDateToPSTDate( LastModifiedDate[i].firstChild ? LastModifiedDate[i].firstChild.nodeValue : LastModifiedDate[i].firstChild ),
            "Level": Level[i].firstChild ? Level[i].firstChild.nodeValue : Level[i].firstChild
        });
        if( i && subInfo[i].Level == 'Trial' ){
            args.wasTrial = true;
        }
    }

    var netAdmin = [];
    CreationDate = nlapiSelectNodes( soapResponse, "//a:User/a:CreationDate" );
    var Login = nlapiSelectNodes( soapResponse, "//a:User/a:Login" );
    Id = nlapiSelectNodes( soapResponse, "//a:User/a:Id" );
    var IsLockedOut = nlapiSelectNodes( soapResponse, "//a:User/a:IsLockedOut" );
    var RoleName = nlapiSelectNodes( soapResponse, "//a:User/a:RoleName" );
    for (i = 0; i < Login.length ; i++){
        var role = RoleName[i].firstChild ? RoleName[i].firstChild.nodeValue : RoleName[i].firstChild;
        var locked = IsLockedOut[i].firstChild ? IsLockedOut[i].firstChild.nodeValue : IsLockedOut[i].firstChild;
        if( role == "Administrators" && locked == 'false' ) {
            netAdmin[netAdmin.length] = bsncParseNetworkAdminInfo({
                "CreationDate": transformUTCDateToPSTDate( CreationDate[i].firstChild ? CreationDate[i].firstChild.nodeValue : CreationDate[i].firstChild ),
                "Login": Login[i].firstChild ? Login[i].firstChild.nodeValue : Login[i].firstChild,
                "Id": Id[i].firstChild ? Id[i].firstChild.nodeValue : Id[i].firstChild,
                "IsLockedOut": locked,
                "RoleName": role
            });
        }
    }

    switch( subInfo[0].Level ){
        case 'Trial': args.isTrial = true; break;
        case 'Content': args.isContent = true; break;
        case 'Control': args.isControl = true; break;
        default: break;
    }

    if( subInfo.length ){
        args.NetworkSubscriptions = subInfo;
    }

    if( netAdmin.length ){
        args.NetworkAdministrators = netAdmin;
    }

    return new bsncNetwork( args );
}

function bsncParseNetworkUserInfo( soapResponse ){
    var args = {
        "CreationDate": transformUTCDateToPSTDate( nlapiSelectValue( soapResponse, "//a:CreationDate" ) ),
        "Login": nlapiSelectValue( soapResponse, "//a:Login" ),
        "Id": nlapiSelectValue( soapResponse, "//a:Id" ),
        "IsLockedOut": nlapiSelectValue( soapResponse, "//a:IsLockedOut" ),
        "RoleName": nlapiSelectValue( soapResponse, "//a:RoleName" )
    };

    return new bsncNetworkAdmin( args );
}

function bsncParseNetworkSubscriptionInfo( args ){
    return new bsncNetworkSubscription( args );
}

function bsncParseNetworkAdminInfo( args ){
    return new bsncNetworkAdmin( args );
}

/***************** Stage ****************/
 function bsncSOAPHeaders( method ){
    var creds = getCredsBSNC();
    var soapHeaders = new Array();
    soapHeaders['Host'] = creds.host;
    soapHeaders['Content-Type'] = 'text/xml; charset=utf-8';
    soapHeaders['SOAPAction'] = creds.actn + method;
    soapHeaders['endPoint'] = creds.endp;
    return soapHeaders;
}
 /*******************/

function parseSOAPDateBSNC( dateSOAP ){
    var dateNS = false;
    if( typeof( dateSOAP ) != "undefined" && dateSOAP.length > 9 ){
        dateNS = moment(dateSOAP).toDate();
    }
    return dateNS;
}

function transformUTCDateToPSTDate( dateSOAP ){
    if( isNullorEmpty( dateSOAP ) )
        return dateSOAP;
    else
        return moment(dateSOAP).tz('America/Los_Angeles').format();
}

function getUTCDate( dateToConvert ){
    var now = moment();
    if( !isNullorEmpty(dateToConvert) ){
        now = moment(dateToConvert);
    }

    return now.utc().format();
}

function bsncUser( args ) {
    this.CreationDate = args['CreationDate'];
    this.Description = args['Description'];
    this.Email = args['Email'];
    this.FirstName = args['FirstName'];
    this.Id = args['Id'];
    this.IsLockedOut = args['IsLockedOut'];
    this.LastName = args['LastName'];
    this.Login = args['Login'];
    this.RoleName = args['RoleName'];
    this.NetworkId = args['NetworkId'];
    this.NetworkName = args['NetworkName'];
}

function bsncNetwork( args ) {
    this.IsError = args['IsError'] || false;
    this.Message = args['Message'];
    this.SubscriptionsActivityPeriod = args['SubscriptionsActivityPeriod'];
    this.SubscriptionsRenewalDate = args['SubscriptionsRenewalDate'];
    this.Id = args['Id'];
    this.IsLockedOut = args['IsLockedOut'];
    this.LastLockoutDate = args['LastLockoutDate'];
    this.LockoutDate = args['LockoutDate'];
    this.Name = args['Name'];
    this.AutomaticSubscriptionsManagementEnabled = args['AutomaticDeviceSubscriptionsManagementEnabled'];
    this.AutomaticTaggedPlaylistApprovementEnabled = args['AutomaticTaggedPlaylistApprovementEnabled'];
    this.BrightAuthorAccessRestricted = args['BrightAuthorAccessRestricted'];
    this.WebUIAccessRestricted = args['WebUIAccessRestricted'];
    this.SetupCompletionDate = args['SetupCompletionDate'];
    this.NetworkSubscriptions = args['NetworkSubscriptions'];
    this.isTrial = args['isTrial'];
    this.wasTrial = args['wasTrial'];
    this.isContent = args['isContent'];
    this.isControl = args['isControl'];
    this.NetworkAdministrators = args['NetworkAdministrators'];
    this.quantity = args['quantity'];
}

function bsncNetworkSubscription( args ) {
    this.CreationDate = args['CreationDate'];
    this.ExpireDate = args['ExpireDate'];
    this.Id = args['Id'];
    this.LastModifiedDate = args['LastModifiedDate'];
    this.Level = args['Level'];
}

function bsncSubscription( args ) {
    this.ActivationDate = args['ActivationDate'];
    this.ActivityPeriod = args['ActivityPeriod'];
    this.CreationDate = args['CreationDate'];
    this.DeviceId = args['DeviceId'];
    this.DeviceSerial = args['DeviceSerial'];
    this.ExpirationDate = args['ExpirationDate'];
    this.Id = args['Id'];
    this.InvoiceNumber = args['InvoiceNumber'];
    this.IsDeleted = args['IsDeleted'];
    this.KeyId = args['KeyId'];
    this.NetworkId = args['NetworkId'];
    this.NetworkName = args['NetworkName'];
    this.RenewalMethod = args['RenewalMethod'];
    this.Status = args['Status'];
    this.SuspensionDate = args['SuspensionDate'];
    this.Traffic = args['Traffic'];
    this.Type = args['Type'];
}

function bsncNetworkAdmin( args ) {
    this.IsError = args['IsError'] || false;
    this.Message = args['Message'];
    this.CreationDate = args['CreationDate'];
    this.Login = args['Login'];
    this.Id = args['Id'];
    this.IsLockedOut = args['IsLockedOut'];
    this.RoleName = args['RoleName'];
}
/*
function bsncGetPriceLevels( itemId ){
    var filters = new Array();
    filters[0] = new nlobjSearchFilter( 'internalid', null, 'is', itemId);

    var columns = new Array();
    columns[0] = new nlobjSearchColumn( 'itemid');
    columns[1] = new nlobjSearchColumn( 'baseprice');
    columns[2] = new nlobjSearchColumn( 'otherprices') //otherprices will pull all price levels in the results
    var searchresults = nlapiSearchRecord( 'item', null, filters, columns );

    //Price levels start with baseprice, then price + 2 and up.
    var itemName = searchresults[0].getValue('itemid');
    var prices = [];
    for(var i = 1; i <= 15 ; i++){
        if(i == 1){
            prices[i] = searchresults[0].getValue('baseprice');
        } else {
            prices[i] = searchresults[0].getValue('price' + i);
        }
    }

    return prices;
}
*/
function bsncGetPeriodById( periodId ){
    var period = {"id" : "3", "itemId" : 706, "itemSubId" : sbBSNSettings.bsnc1yrItemNum, "num" : 12, "soap" : "P365D", "s" : "s", "name" : "1 Year"};
    switch( periodId ){
        case '1': period = {"id" : "1", "itemId" : 705, "itemSubId" : 598, "num" : 1, "soap" : "P30D", "s" : "", "name" : "Monthly"}; break;
        case '2': period = {"id" : "2", "itemId" : 704, "itemSubId" : 599, "num" : 3, "soap" : "P90D", "s" : "s", "name" : "Quarterly"}; break;
        case '3': period = {"id" : "3", "itemId" : 706, "itemSubId" : sbBSNSettings.bsnc1yrItemNum, "num" : 12, "soap" : "P365D", "s" : "s", "name" : "1 Year"}; break;
        /*case '4': period = {"id" : "4", "itemId" : 447, "itemSubId" : 600, "num" : 24, "soap" : "P730D", "s" : "s", "name" : "2 Years"}; break;
        case '5': period = {"id" : "5", "itemId" : 450, "itemSubId" : 601, "num" : 36, "soap" : "P1095D", "s" : "s", "name" : "3 Years"}; break;*/
        default: break;
    }

    return period;
}

function bsncGetPeriodBySOAP( soapPeriod ){
    var period = bsncGetPeriodById( '3' );
    switch( soapPeriod ){
        case 'P30D': period = bsncGetPeriodById( '1' ); break;
        case 'P90D': period = bsncGetPeriodById( '2' ); break;
        case 'P365D': period = bsncGetPeriodById( '3' ); break;
        /*case 'P730D': period = bsnGetPeriodById( '4' ); break;
        case 'P1095D': period = bsnGetPeriodById( '5' ); break;*/
        default: break;
    }

    return period;
}
/*
function bsAddMonths( currentDate, num ){
    currentDate = moment(currentDate);
    var futureMonth = moment(currentDate).add(parseInt(num), 'M');
    var futureMonthEnd = moment(futureMonth).endOf('month');

    if(currentDate.date() != futureMonth.date() && futureMonth.isSame(futureMonthEnd.format('YYYY-MM-DD'))) {
        futureMonth = futureMonth.add(1, 'd');
    }

    return futureMonth.toDate()
}

function isNullorEmpty(strVal){
    return (strVal == null || strVal == '');
}

function isObject(o) {
    return o instanceof Object && o.constructor === Object;
}

function roundTo(n, digits) {
    if (digits === undefined) {
        digits = 0;
    }

    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    var test =(Math.round(n) / multiplicator);
    return +(test.toFixed(digits));
}

function popupHelperWindow(owner, baseUrl, windowName, width, height, additionalParams) {
    var url = baseUrl;
    nlExtOpenWindow(url + additionalParams, windowName, width, height, owner, true, '');
}

var Qtr = {
    'jan': 1,
    'feb': 1,
    'mar': 1,
    'apr': 2,
    'may': 2,
    'jun': 2,
    'jul': 3,
    'aug': 3,
    'sep': 3,
    'oct': 4,
    'nov': 4,
    'dec': 4
};

function bsncRevRecEndDate( revRecStartDate, endDate, months ){
    if( months == 1 ){
        endDate = nlapiDateToString( revRecStartDate.endOf('month').toDate() );
    } else {
        var subEndDate = moment(nlapiStringToDate(endDate));
        var subEndDateCalcFix = moment(nlapiStringToDate(endDate)).add(1, 'day');
        var diffMonths = subEndDateCalcFix.diff(revRecStartDate, 'months', true);
        endDate = nlapiDateToString( moment(nlapiStringToDate(endDate)).endOf('month').toDate() );

        var revRecDiff = Math.ceil(moment(nlapiStringToDate(endDate)).diff(revRecStartDate, 'months', true));
        console.log(revRecDiff);
        console.log(Math.ceil(diffMonths));
        if( revRecDiff > Math.ceil(diffMonths) ){
            endDate = nlapiDateToString( subEndDate.subtract(1, 'month').endOf('month').toDate() );
        }

    }

    return endDate;
}
*/






function bsncAddSubsGetSubscriptionData(){
    jQuery('#custpage_contract_info_fs').html('');
    nlapiSetFieldValue( 'bsn_addsubs_contract_item', '' );
    var tranid = nlapiGetFieldValue("bsn_addsubs_network_so");
    console.log( 'tranid = ' + tranid );
    if( !isNullorEmpty( tranid ) ) {
        var invoiceNum = jQuery('#bsn_addsubs_network_so > option').length;
        if( invoiceNum < 3 ){
            var contractItemId = bsGetContractByTranid(tranid);
            console.log('contractItemId = ' + contractItemId);
            if (contractItemId != -1) {
                var ci = nlapiLoadRecord('customrecord_contract_item', contractItemId);
                if (!isNullorEmpty(ci)) {
                    var soId = ci.getFieldValue('custrecord_ci_original_transaction');
                    console.log('soId = ' + soId);
                    var contractId = ci.getFieldValue('custrecord_ci_contract_id');
                    console.log('contractId = ' + contractId);
                    var networkId = ci.getFieldValue('custrecord_bsn_network_id');
                    console.log('networkId = ' + networkId);
                    var quantity = ci.getFieldValue('custrecord_ci_quantity');
                    console.log('quantity = ' + quantity);
                    var description = ci.getFieldValue( 'custrecord_ci_tran_line_description' );
                    var customerEmail = bsnParseCustomerEmail( description );
                    //console.log("=================contractInfo=================\n" + JSON.stringify(networkInfo));
                    var contractInfo = '<br><b>CONTRACT INFO</b><br>';
                    contractInfo += '<div style="border: 1px solid black; padding: 10px; width: 280px;">';
                    contractInfo += '<b>Sales Order:</b> <a href="https://3293628-sb1.app.netsuite.com/app/accounting/transactions/salesord.nl?id=' + soId + '" target="_blank">' + tranid + '</a><br>';
                    contractInfo += '<b>Contract:</b> <a href="https://3293628-sb1.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=211&id=' + contractId + '" target="_blank">' + contractId + '</a><br>';
                    contractInfo += '<b>Contract Item:</b> <a href="https://3293628-sb1.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=215&id=' + contractItemId + '" target="_blank">' + contractItemId + '</a><br>';
                    contractInfo += '<b>Admin Email:</b> ' + customerEmail + '<br>';
                    contractInfo += '<b>Network:</b> ' + networkId + '<br>';
                    contractInfo += '<b>Subscriptions:</b> ' + quantity + '<br>';
                    contractInfo += '</div>';
                    console.log('contractInfo = ' + contractInfo);
                    jQuery('#custpage_contract_info_fs').html(contractInfo);
                    nlapiSetFieldValue( 'bsn_addsubs_contract_item', contractItemId );
                }
            } else {
                Ext.MessageBox.show({
                    title: 'Warning',
                    msg: tranid + ' does not have Contract Item created!',
                    width: 300,
                    buttons: Ext.MessageBox.OK,
                    fn: function (btn, text) {
                        if (btn == 'ok') {
                            nlapiSetFieldValue('bsn_addsubs_network_so', '');
                        }
                    },
                    icon: Ext.MessageBox.WARNING
                });
            }
        } else {
            Ext.MessageBox.show({
                title: 'Warning',
                msg: 'Network should have only 1 Sales Order to add subscriptions to. Please make it 1 before you proceed. You can use instruction displayed on this page.<br><a href="https://3293628-sb1.app.netsuite.com/app/site/hosting/scriptlet.nl?script=352&deploy=1&compid=3293628_SB1&bsn_email=' + nlapiGetFieldValue( 'bsn_addsubs_purchaser_email' ) + '&bsn_network=' + nlapiGetFieldValue( 'bsn_addsubs_select_network' ) + '&bsn_customer=' + nlapiGetFieldValue( 'bsn_addsubs_customer' ) + '" target="_blank">Link to convert to single SO</a>.',
                width: 600,
                buttons: Ext.MessageBox.OK,
                fn: function (btn, text) {
                    if (btn == 'ok') {
                        nlapiSetFieldValue('bsn_addsubs_network_so', '');
                    }
                },
                icon: Ext.MessageBox.WARNING
            });
        }
    }
}
function search(nameKey, myArray, myArrayIndex){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i][myArrayIndex] === nameKey) {
            return i;
        }
    }
    return -1;
}

function searchList(nameKey, myArray, myArrayIndex){
    var retArray = [];
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i][myArrayIndex] === nameKey) {
            retArray.push(myArray[i]);
        }
    }
    return retArray;
}

function bsncGetExpirationDate( StartDate, ExpirationDate, num ){
    //console.log("=================StartDate=================\n" + StartDate);
    //console.log("=================ExpirationDate=================\n" + ExpirationDate);
    //console.log("=================num=================\n" + num);
    var expDate = ExpirationDate;
    //console.log("=================ExpDate=================\n" + expDate);
    var expDateString = ExpirationDate ? nlapiDateToString( expDate, 'date' ) : '';
    //console.log("=================expDateString=================\n" + expDateString);

    if( expDateString == '' || !expDate ){
        if( !isNullorEmpty( num ) ) {
            expDate = moment( bsAddMonths(StartDate, num) ).subtract( 1, 'd' ).toDate();
        }
    }
    //console.log("=================expDate=================\n" + expDate);
    return expDate;
}

function bsncIsSubRelevant( sub, delta ){
    var today = moment();
    var renewalDate = moment( sub.end );
    //console.log("=================diff=================\n" + today.diff( renewalDate, 'M', true ));
    if( today.isAfter(renewalDate, 'day') && today.diff( renewalDate, 'M', true ) > delta )
        return false;

    return true;
}

function bsnPrepareNetworkHTML( invoiceNum ){
    var nInfo = '<br><b>Recommendations</b><br>';
    nInfo += '<div style="border: 1px solid black; padding: 10px; width: 280px;"><ol style="margin-left: 10px;">';
    nInfo += '<li>To add subs there should be not more than 1 SO for the Network. (You have ' + invoiceNum + ')</li>';
    nInfo += '<li>Go to Co-Term form and recoterm the Network to make it 1. <a href="https://3293628-sb1.app.netsuite.com/app/site/hosting/scriptlet.nl?script=352&deploy=1&compid=3293628_SB1&bsn_email=' + nlapiGetFieldValue( 'bsn_addsubs_purchaser_email' ) + '&bsn_network=' + nlapiGetFieldValue( 'bsn_addsubs_select_network' ) + '&bsn_customer=' + nlapiGetFieldValue( 'bsn_addsubs_customer' ) + '" target="_blank">Link >></a></li>';
    nInfo += '<li>Don\'t forget to make the Co-Term SO free and bill it right away.</li>';
    nInfo += '<li>After you Bill the New SO Generate Contract Items for the new Contract.</li>';
    nInfo += '<li>Refresh this Form and try again!</li>';
    nInfo += '</ol></div>';
    return nInfo;
}

function bsGetSubscriptionsByNetid( netId, customerId, sansCustomer ){
    var subs = [];
    var additionalFilters = new Array();
    additionalFilters[0] = new nlobjSearchFilter('custrecord_sub_network_id', null, 'is', netId);
    additionalFilters[1] = new nlobjSearchFilter('status', null, 'is', 'ACTIVE');
    if( customerId ) additionalFilters[2] = new nlobjSearchFilter('customer', null, sansCustomer ? 'isnot' : 'is', customerId);
    var columns = new Array();
    columns[0] = new nlobjSearchColumn( 'name' );
    columns[1] = new nlobjSearchColumn( 'customer' );
    columns[2] = new nlobjSearchColumn( 'status' );
    columns[3] = new nlobjSearchColumn( 'startdate' );
    columns[4] = new nlobjSearchColumn( 'enddate' );
    columns[5] = new nlobjSearchColumn( 'custrecord_bsn_sub_end_user' );
    columns[6] = new nlobjSearchColumn( 'startdate', 'billingaccount' );
    columns[7] = new nlobjSearchColumn( 'custrecord_bsn_time_credit' );
    columns[8] = new nlobjSearchColumn( 'billingaccount' );
    columns[9] = new nlobjSearchColumn( 'bsnc_addsubs_purchaser_email' );
    var searchresults = nlapiSearchRecord('subscription', null, additionalFilters, columns);
    if( searchresults != null ){
        for( var i = 0; i < searchresults.length; i++ ){
            subs.push({
                subId: searchresults[i].getId(),
                subName: searchresults[i].getValue( 'name' ),
                adminEmail: searchresults[i].getValue( 'bsnc_addsubs_purchaser_email' ),
                ownerId: searchresults[i].getValue( 'customer' ),
                ownerName: searchresults[i].getText( 'customer' ),
                status: searchresults[i].getValue( 'status' ),
                startDate: searchresults[i].getValue( 'startdate' ),
                endDate: searchresults[i].getValue( 'enddate' ),
                endUser: searchresults[i].getValue( 'custrecord_bsn_sub_end_user' ),
                baStartDate: searchresults[i].getValue( 'startdate', 'billingaccount' ),
                timeCredit: searchresults[i].getValue( 'custrecord_bsn_time_credit' ),
                billingaccount: searchresults[i].getValue( 'billingaccount' ),
            });
        }
    }

    return subs;
}
function bsGetSubscriptionInfo( subId ){
    var onClick = jQuery('#bsnc_addsubs_button').attr('onclick');
    //console.log('oldOnClick ' + onClick);
    var newOnClick = onClick.replace(/bsncSBFormUpdateSubscriptionsSubmit/gi,'bsncSBFormAddSubscriptionsSubmit');
    //console.log('newOnClick ' + jQuery('#bsnc_addsubs_button').attr('onclick'));
    jQuery('#bsnc_addsubs_button').attr('onclick', newOnClick);
    jQuery('#bsnc_addsubs_button').prop('value', "Add Subscription Record");
    jQuery('#secondarybsnc_addsubs_button').prop('value', "Add Subscription Record");
    jQuery('#custpage_subscription_info_fs').html('');
    if( !isNullorEmpty( subId ) ) {
        var sub = nlapiLoadRecord('subscription', subId);
        if( !isNullorEmpty(sub) ){
            var isTerminated = false;
            var terminationDate = null;
            var soId = sub.getFieldValue('salesorder');
            var subName = sub.getFieldValue( 'name' );
            var subBillingAccount = sub.getFieldValue( 'billingaccount' );
            var subBillingAccountName = '';
            var subStartDate = sub.getFieldValue( 'startdate' );
            var subEndDate = sub.getFieldValue( 'enddate' );
            var ownerId = sub.getFieldValue('customer');
            var ownerName = ownerId ? nlapiLookupField('customer', ownerId, 'entityid') : ownerId;
            var endUser = sub.getFieldValue('custrecord_bsn_sub_end_user');
            var endUserName = endUser ? nlapiLookupField('customer', endUser, 'entityid') : endUser;
            var timeCredit = sub.getFieldValue('custrecord_bsn_time_credit');
            var ownerType = ownerId != endUser && endUser != '' ? 'Reseller' : 'End User';
            var networkAdmin = sub.getFieldValue('custrecord_sub_network_admin');
            var networkId = sub.getFieldValue('custrecord_sub_network_id');
            var networkType = sub.getFieldValue('custrecord_bsn_type');
            var itemId = networkType == netTypeCom ? sbBSNSettings.bsn1yrItemText : sbBSNSettings.bsnc1yrItemText;
            var itemName = networkType == netTypeCom ? 'BSNSUB-12-SB' : 'BSNCSUB-12-SB';
            var quantity = 1;
            var line = 1;
            var price = 99;
            var amount = 99;
            var priceBookLines = sub.getLineItemCount('priceinterval');
            var log = '';

            if( subBillingAccount ){
                var ba = nlapiLoadRecord( "billingaccount", subBillingAccount );
                if( ba ) subBillingAccountName = ba.getFieldValue('name');
            }

            for( var i = priceBookLines; i > 0; i-- ){
                var status = sub.getLineItemValue( 'priceinterval', 'status', i );
                var subLine = sub.getLineItemValue( 'priceinterval', 'linenumber', i );
                var priceItem = sub.getLineItemValue( 'priceinterval', 'item', i );
                log += ' ' + status + ' ' + subLine + ' ' + priceItem;
                if( status == 'ACTIVE' && line == subLine && priceItem == itemId ) {
                    quantity = sub.getLineItemValue('priceinterval', 'quantity', i);
                    amount = sub.getLineItemValue('priceinterval', 'recurringamount', i);
                    price = round_float_to_n_places(amount / quantity, 2);
                    break;
                }
            }
            var doNotRenew = sub.getFieldValue('custrecord_bsn_script_suppress_renewal') == 'T';
            //console.log("=================contractInfo=================\n" + JSON.stringify(networkInfo));
            var subStatus = sub.getFieldValue('billingsubscriptionstatus');
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
            var subInfo = /*log + */'<br><b>SUBSCRIPTION INFO ' + (doNotRenew?'(Will Not Renew)':'') + '</b><br>';


            subInfo += '<style type="text/css">.sbBSNBadge {\n' +
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
                '}</style>';
            subInfo += '<div style="border: 1px solid black; padding: 10px; width: 280px;">';
            subInfo += '<span class="sbBSNBadge">' + subStatus + '</span><br>';
            subInfo += '<b>Subscription:</b> <a href="' + nlapiResolveURL('RECORD', 'subscription', subId) + '" target="_blank">' + subName + '</a><br>';
            if( soId ) subInfo += '<b>Sales Order:</b> <a href="' + nlapiResolveURL('RECORD', 'salesorder', soId) + '" target="_blank">' + soId + '</a><br>';
            subInfo += '<b>Owner Type:</b> ' + ownerType + '<br>';
            var owner = nlapiLoadRecord( 'customer', ownerId );
            subInfo += '<b>Owner:</b> <a href="' + nlapiResolveURL('RECORD', 'customer', ownerId) + '" target="_blank">' + owner.getFieldValue('entityid') + '</a><br>';
            if( endUser ){
                var enduser = nlapiLoadRecord( 'customer', endUser );
                subInfo += '<b>End User:</b> <a href="' + nlapiResolveURL('RECORD', 'customer', endUser) + '" target="_blank">' + enduser.getFieldValue('entityid') + '</a><br>';
            }
            subInfo += '<b>Subscription Item:</b> <a href="' + nlapiResolveURL('RECORD', 'serviceitem', itemId) + '" target="_blank">' + nlapiLookupField('serviceitem', itemId, 'itemid') + '</a><br>';
            if(subBillingAccountName != '') subInfo += '<b>Billing Account:</b> <a href="' + nlapiResolveURL('RECORD', 'billingaccount', subBillingAccount) + '" target="_blank">' + subBillingAccountName + '</a><br>';
            subInfo += '<b>Start Date:</b> ' + subStartDate + '<br>';
            subInfo += '<b>End Date:</b> ' + subEndDate + '<br>';
            subInfo += '<b>Network Admin:</b> ' + networkAdmin + '<br>';
            subInfo += '<b>Network:</b> ' + networkId + '<br>';
            subInfo += '<b>BSN Subscriptions:</b> ' + quantity + '<br>';
            subInfo += '<b>Price:</b> ' + price + '<br>';
            subInfo += '<b>Renewal Amount:</b> ' + amount + '<br>';
            if( timeCredit ) subInfo += '<b>Time Credit:</b> ' + timeCredit + '<br>';
            if( sub.getFieldValue('parentsubscription') ) subInfo += '<b>Renewal for:</b> <a href="' + nlapiResolveURL('RECORD', 'subscription', sub.getFieldValue('parentsubscription')) + '" target="_blank">' + sub.getFieldValue('parentsubscription') + '</a><br>';
            subInfo += '</div>';
            //nlapiSetFieldValue( 'bsn_addsubs_contract_item', contractItemId );
            nlapiSetFieldValue( 'bsnc_addsubs_anniversary_date', nlapiDateToString( moment(nlapiStringToDate(subEndDate)).add(1, 'day').toDate() ) );
            nlapiSetFieldValue( 'bsnc_addsubs_price', price );

            var multy = false;
            var changeOrders = searchChangeOrders( subId );
            console.log(changeOrders);
            if( changeOrders ) {
                for (var k = 0; k < changeOrders.length; k++) {
                    var coRec = nlapiLoadRecord('subscriptionchangeorder', changeOrders[k].getId());
                    var oldQuantity = parseInt(coRec.getLineItemValue('subline', 'quantity', 1));
                    var newQuantity = parseInt(coRec.getLineItemValue('subline', 'quantitynew', 1));
                    var diffQuantity = newQuantity - oldQuantity;
                    var oldDiscount = parseFloat(coRec.getLineItemValue('subline', 'discount', 1));
                    var newDiscount = parseFloat(coRec.getLineItemValue('subline', 'discountnew', 1));
                    oldDiscount = isNaN( oldDiscount ) ? -1 : oldDiscount;
                    newDiscount = isNaN( newDiscount ) ? -1 : newDiscount;
                    var diffDiscount = ( newDiscount == -1 ? 0 : newDiscount ) - ( oldDiscount == -1 ? 0 : oldDiscount );
                    console.log('oldDiscount: ' + oldDiscount);
                    console.log('newDiscount: ' + newDiscount);
                    console.log('diffDiscount: ' + diffDiscount);
                    var oldPriceID = coRec.getLineItemValue('subline', 'priceplan', 1);
                    var newPriceID = coRec.getLineItemValue('subline', 'priceplannew', 1);
                    console.log('oldPriceID: ' + oldPriceID);
                    console.log('newPriceID: ' + newPriceID);
                    var oldPriceRec = isNullorEmpty(oldPriceID) ? '' : nlapiLoadRecord('priceplan', oldPriceID);
                    var newPriceRec = isNullorEmpty(newPriceID) ? '' : nlapiLoadRecord('priceplan', newPriceID);
                    console.log('oldPriceRec: ' + oldPriceRec);
                    console.log('newPriceRec: ' + newPriceRec);
                    var oldPrice = oldPriceRec == '' ? -1 : parseFloat(oldPriceRec.getLineItemValue('pricetiers', 'value', 1));
                    var newPrice = newPriceRec == '' ? -1 : parseFloat(newPriceRec.getLineItemValue('pricetiers', 'value', 1));
                    var diffPrice = ( newPrice == -1 ? oldPrice : newPrice ) - ( oldPrice == -1 ? 0 : oldPrice );
                    console.log('oldPrice: ' + oldPrice);
                    console.log('newPrice: ' + newPrice);
                    console.log('diffPrice: ' + diffPrice);
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
                        var charsCount = ('' + quantity).length + 1;
                        subInfo += '<style>#bsnc_addsubs_count_fs:before {content: "' + quantity + '+";} #bsnc_addsubs_count {padding-left: ' + ((charsCount * 6) + 4) + 'pt; margin-left: -' + ((charsCount * 6) + 2) + 'pt;}</style>';
                        subInfo += '<br><b>SUBSCRIPTION CHANGE ORDERS</b><br>';
                        subInfo += '<div style="border: 1px solid black; padding: 10px; width: 280px; background-color: rgba(0,255,0,0.1)">';
                    } else
                        subInfo += '<div style="border: 1px solid black; padding: 10px; width: 280px; margin-top: -1px;">';
                    subInfo += '<b>ID:</b> <a href="' + nlapiResolveURL('RECORD', 'subscriptionchangeorder', changeOrders[k].getId()) + '" target="_blank">' + changeOrders[k].getId() + '</a><br>';
                    subInfo += '<b>Action:</b> ' + changeOrders[k].getValue('action') + '<br>';
                    if(changeOrders[k].getValue('action') == 'RENEW' && changeOrders[k].getValue('status') != 'VOIDED') {
                        var renewCO = nlapiLoadRecord('subscriptionchangeorder', changeOrders[k].getId());
                        var renewSub = renewCO.getLineItemValue('renewalsteps', 'subscription', 1);
                        var renewSubName = renewCO.getLineItemValue('renewalsteps', 'subscriptiondisplay', 1);
                        var renewSubUrl = renewCO.getLineItemValue('renewalsteps', 'subscriptionurl', 1) + '?id=' + renewSub;
                        subInfo += '<b>Renewal Subscription:</b> <a href="' + renewSubUrl + '" target="_blank">' + renewSubName + '</a><br>';
                    }
                    subInfo += '<b>Effective Date:</b> ' + changeOrders[k].getValue('effectivedate') + '<br>';
                    subInfo += '<b>Price:</b> ' + oldPrice;
                    if (changeOrders[k].getValue('action') == 'MODIFY_PRICING' && changeOrders[k].getValue('status') != 'VOIDED' && newPrice != -1) subInfo += ' -> ' + newPrice;
                    if (diffPrice > 0) subInfo += '<span style="color:green"> (+' + diffPrice + ')</span>';
                    if (diffPrice < 0) subInfo += '<span style="color:red"> (' + diffPrice + ')</span>';
                    subInfo += '<br>';
                    if( !( oldDiscount == -1 && oldDiscount == newDiscount ) ) {
                        subInfo += '<b>Discount:</b> ' + (oldDiscount == -1 ? 0 : oldDiscount);
                        if (changeOrders[k].getValue('action') == 'MODIFY_PRICING' && changeOrders[k].getValue('status') != 'VOIDED' && newDiscount != -1) subInfo += ' -> ' + newDiscount;
                        if (diffDiscount > 0) subInfo += '<span style="color:green"> (+' + diffDiscount + ')</span>';
                        if (diffDiscount < 0) subInfo += '<span style="color:red"> (' + diffDiscount + ')</span>';
                        subInfo += '<br>';
                    }
                    subInfo += '<b>Quantity:</b> ' + oldQuantity;
                    if (changeOrders[k].getValue('action') == 'MODIFY_PRICING' && changeOrders[k].getValue('status') != 'VOIDED' && !isNaN(newQuantity)) subInfo += ' -> ' + newQuantity;
                    if (diffQuantity > 0) subInfo += '<span style="color:green"> (+' + diffQuantity + ')</span>';
                    if (diffQuantity < 0) subInfo += '<span style="color:red"> (' + diffQuantity + ')</span>';
                    subInfo += '<br>';
                    subInfo += '</div>';
                    if (!k) {
                        subInfo += '<div id="cocollapse">';
                        multy = true;
                    }
                    if (changeOrders[k].getValue('action') == 'TERMINATE' && changeOrders[k].getValue('status') != 'VOIDED') {
                        terminationDate = changeOrders[k].getValue('effectivedate');
                        isTerminated = true;
                    }
                }
                if (multy) {
                    subInfo += '</div>';
                    subInfo += '<a id="cocollbut" class="show" style="display: block; padding: 4px; border: 1px solid black; background-color: #eee; width:280px; text-decoration: none; font-weight: 900; margin-top: -1px;" href="#">Show History &#8595;</a>';
                    subInfo += '<script type="text/javascript">' +
                        'var histBut = jQuery("#cocollbut");' +
                        'histBut.on( "click", function(e){' +
                        'if( histBut.hasClass("show") ){' +
                        'console.log("show");' +
                        'histBut.html("Hide History &#8593;");' +
                        'histBut.removeClass("show").addClass("hide");' +
                        'jQuery("#cocollapse").slideDown("fast");' +
                        'e.preventDefault();' +
                        'return;' +
                        '}' +
                        'if( histBut.hasClass("hide") ){' +
                        'console.log("hide");' +
                        'histBut.html("Show History &#8595;");' +
                        'histBut.removeClass("hide").addClass("show");' +
                        'jQuery("#cocollapse").slideUp("fast");' +
                        'e.preventDefault();' +
                        '}' +
                        '} );' +
                        '</script>';
                }
            }
            //console.log('subInfo = ' + subInfo);
            jQuery('#custpage_subscription_info_fs').html(subInfo);

            if( isTerminated ){
                nlapiSetFieldValue( 'bsnc_addsubs_start_date', terminationDate );
                nlapiSetFieldValue( 'bsnc_addsubs_terminate_date', terminationDate );
                //nlapiSetFieldValue('bsnc_addsubs_custom_price', 'F');
                //nlapiDisableField('bsnc_addsubs_custom_price', false);
            } else {
                onClick = jQuery('#bsnc_addsubs_button').attr('onclick');
                newOnClick = onClick.replace(/bsncSBFormAddSubscriptionsSubmit/gi, 'bsncSBFormUpdateSubscriptionsSubmit');
                //newOnClick = "sbModifyPricingNewTab(" + subId + ");return false;";
                jQuery('#bsnc_addsubs_button').attr('onclick', newOnClick);
                jQuery('#bsnc_addsubs_button').prop('value', "Update Subscription Record");
                jQuery('#secondarybsnc_addsubs_button').prop('value', "Update Subscription Record");
                //jQuery('#inpt_bsnc_addsubs_billing_account1').prop('disabled', true);
                //jQuery('#inpt_bsnc_addsubs_billing_account1').addClass("uir-field-active");
                jQuery('#tbl_bsnc_addsubs_billing').hide();
                jQuery('#tbl_secondarybsnc_addsubs_billing').hide();
                nlapiDisableField('bsnc_addsubs_billing_account', true);
                nlapiDisableField('bsnc_addsubs_price', true);
                nlapiDisableField('bsnc_addsubs_custom_price', true);
            }
            //return subName;
            return {html:subInfo, price:price};
        }
    }

    return {html:''};
}

function bsAddSubsFillSubscriptionList( networkId ){
    var subs = Array();
    var invoiceStats = Array();
    var networkInfo = null;
    var networkSubscriptions = [];
    jQuery('#bsnc_addsubs_results_log_fs').text('');
    jQuery('#custpage_netinfo_fs').text('');
    console.log("=================networkId=================\n" + networkId);
    if( networkId != '' ){
        var filter = "[DeviceSubscription].[Network].[Id] IS " + networkId + " AND [DeviceSubscription].[Type] IS NOT 'Grace'";
        console.log("=================filter=================\n" + filter);
        networkSubscriptions = []//soapGetDeviceSubscriptionsBSNC( filter );
        //nlapiSetFieldValue("bs_default_network", ""); // Reset hidden default network
        console.log("=================networkSubscriptions=================\n" + networkSubscriptions);
        networkInfo = soapGetNetworkByIdBSNC( networkId );
        if( typeof(networkInfo.Id) != 'undefined' ) {
            var count = soapNetworkSubscriptionsCountBSNC( networkInfo.Id );
            if( isNullorEmpty( count.error ) ){
                networkInfo.quantity = count.quantity;
            } else {
                bsnMessage( "BSN Request", count.message, 'error' );
                networkInfo.quantity = 0;
            }
        }
    }

    for( var i = 0; i < networkSubscriptions.length; i++ ){
        var delta = 2; // 2 months
        var period = bsncGetPeriodBySOAP( networkSubscriptions[i].ActivityPeriod );

        //console.log("=================!isNullorEmpty( networkSubscriptions[i].ActivationDate )=================\n" + !isNullorEmpty( networkSubscriptions[i].ActivationDate ));
        //console.log("=================networkSubscriptions[i].ActivationDate=================\n" + networkSubscriptions[i].ActivationDate);
        //console.log("=================networkSubscriptions[i].CreationDate=================\n" + networkSubscriptions[i].CreationDate);
        var startDate = parseSOAPDateBSNC( !isNullorEmpty( networkSubscriptions[i].ActivationDate ) ? networkSubscriptions[i].ActivationDate : networkSubscriptions[i].CreationDate );
        var expDate = new Date();
        if( typeof(networkInfo.SubscriptionsRenewalDate) == "undefined" ){
            //console.log("=================networkSubscriptions[i].ExpirationDate=================\n" + networkSubscriptions[i].ExpirationDate);
            expDate = bsncGetExpirationDate( startDate, parseSOAPDateBSNC(networkSubscriptions[i].ExpirationDate || false), period.num );
        } else {
            expDate = moment( parseSOAPDateBSNC( networkInfo.SubscriptionsRenewalDate ) ).subtract( 1, 'd' ).toDate();
        }

        var sub = {
            'id': networkSubscriptions[i].Id,
            'invoice': networkSubscriptions[i].InvoiceNumber || "",
            'deviceId': networkSubscriptions[i].DeviceId || "",
            'deviceSerial': networkSubscriptions[i].DeviceSerial || "",
            'period': period.num ? period.num : "other",
            'creation': parseSOAPDateBSNC( networkSubscriptions[i].CreationDate ),
            'activation': parseSOAPDateBSNC( networkSubscriptions[i].ActivationDate || "" ),
            'start': startDate,
            'end': expDate
        };
        if( bsncIsSubRelevant( sub, delta ) ){
            subs.push( sub );
        }
    }

    console.log("=================networkSubscriptions.length=================\n" + networkSubscriptions.length);
    if( !networkSubscriptions.length ) {
        //jQuery('#bsnc_addsubs_results_log_fs').text('Nothing Found......');
    }

    if( subs.length ){ jQuery('#bsnc_addsubs_results_log_fs').append( "<h6><br>Active Subs (" + subs.length + ")</h6>" ); }

    for( i = 0; i < subs.length; i++ ){
        var invoiceIndex = search(subs[i].invoice, invoiceStats, 'invoice');
        if( invoiceIndex > -1 ){
            invoiceStats[ invoiceIndex ].num++;
        } else {
            invoiceStats.push({ 'invoice': subs[i].invoice, 'num': 1, 'date': nlapiDateToString( subs[i].start, 'date' ), 'period': subs[i].period });
        }
    }

    if( !isNullorEmpty( networkInfo ) ){
        if( typeof(networkInfo.Id) != 'undefined' ) {
            jQuery('#custpage_netinfo_fs').html(printNetworkInfo(networkInfo));
            /*
            console.log("=================networkInfo=================\n" + JSON.stringify(networkInfo));
            var nInfo = '<br><b>NETWORK INFO</b><br>';
            nInfo += '<div style="border: 1px solid black; padding: 10px; width: 280px;">';
            nInfo += '<b>ID:</b> ' + networkInfo.Id + '<br>';
            if (typeof (networkInfo.Name) != 'undefined') {
                nInfo += '<b>Name:</b> ' + networkInfo.Name + '<br>';
            }
            console.log("=================typeof (networkInfo.SubscriptionsActivityPeriod)=================\n" + typeof (networkInfo.SubscriptionsActivityPeriod));
            if (typeof (networkInfo.SubscriptionsActivityPeriod) != 'undefined') {
                var periodInfo = bsncGetPeriodBySOAP( networkInfo.SubscriptionsActivityPeriod );
                nInfo += '<b>Activity Period:</b> ' + periodInfo.name + '<br>';
            }
            console.log("=================typeof (networkInfo.SubscriptionsRenewalDate)=================\n" + typeof (networkInfo.SubscriptionsRenewalDate));
            if (typeof (networkInfo.SubscriptionsRenewalDate) != 'undefined') {
                nInfo += '<b>Expiration Date:</b> ' + networkInfo.SubscriptionsRenewalDate.substr(0,10) + '<br>';
            }
            if( subs.length ){
                nInfo += '<b>Subs count:</b> ' + subs.length + '<br>';
            }
            nInfo += '</div>';
            jQuery('#custpage_netinfo_fs').html(nInfo);
             */
        }
    }
/*
    jQuery('#bsnc_addsubs_network_so').html('<option value=""></option>');
    invoiceStats.sort(function(a,b){if(a.invoice < b.invoice)return -1;if(a.invoice > b.invoice)return 1;return 0});
    for( i = 0; i< invoiceStats.length; i++ ){
        //var usage = nlapiGetContext().getRemainingUsage();
        //console.log('usage = ' + usage);
        jQuery('#bsn_addsubs_network_so').append('<option value="' + 'SO-' + invoiceStats[i].invoice + '">' + 'SO-' + invoiceStats[i].invoice + '</option>');
    }
*/
    if( invoiceStats.length ){
        jQuery('#bsnc_addsubs_results_log_fs').html(bsnPrepareNetworkHTML( invoiceStats.length ));
    }
}





// bsGetSubscriptionsByNetid( netId, customerId )
function bsGetBillingAccounts( customer, renewalDate, period ){}
function bsCreateBillingAccount( renewalDate, period ){}






/**********************************************************************************/
/***************************SuiteCommerce******************************************/
/**********************************************************************************/
function bsGetSubscriptionInfoSCS( subId ){
    if( !isNullorEmpty( subId ) ) {
        var sub = nlapiLoadRecord('subscription', subId);
        if( !isNullorEmpty(sub) ){
            var soId = sub.getFieldValue('salesorder');
            var subName = sub.getFieldValue( 'name' );
            var subStartDate = sub.getFieldValue( 'startdate' );
            var subEndDate = sub.getFieldValue( 'enddate' );
            var ownerId = sub.getFieldValue('customer');
            var timeCredit = sub.getFieldValue('custrecord_bsn_time_credit');
            var endUser = sub.getFieldValue('custrecord_bsn_sub_end_user');
            var ownerType = !isNullorEmpty(endUser) && ownerId != endUser ? 'Reseller' : 'End User';
            var networkId = sub.getFieldValue('custrecord_sub_network_id');
            var itemId = sbBSNSettings.bsnc1yrItemText;
            var itemName = 'SB-BNSSUB-12-CL';
            var quantity = 1;
            var line = 1;
            var price = 99;
            var amount = 99;
            var priceBookLines = sub.getLineItemCount('priceinterval');
            for( var i = priceBookLines; i > 0; i-- ){
                var status = sub.getLineItemValue( 'priceinterval', 'status', i );
                var subLine = sub.getLineItemValue( 'priceinterval', 'linenumber', i );
                var priceItem = sub.getLineItemValue( 'priceinterval', 'item', i );
                if( status == 'ACTIVE' && line == subLine && priceItem == itemId ) {
                    quantity = sub.getLineItemValue('priceinterval', 'quantity', i);
                    amount = sub.getLineItemValue('priceinterval', 'recurringamount', i);
                    price = amount / quantity;
                    break;
                }
            }
            var doNotRenew = sub.getFieldValue('custrecord_bsn_script_suppress_renewal') == 'T';
            var nextBillCycleDate = sub.getFieldValue('nextbillcycledate');
            var lastBillDate = sub.getFieldValue('lastbilldate');
            return {
                subId: subId,
                subName: subName,
                soId: soId,
                ownerType: ownerType,
                ownerId: ownerId,
                endUser:endUser,
                itemId: itemId,
                itemName: itemName,
                subStartDate: subStartDate,
                subEndDate: subEndDate,
                networkId: networkId,
                quantity: quantity,
                price: price,
                amount: amount,
                timeCredit: timeCredit,
                doNotRenew: doNotRenew,
                nextBillCycleDate: nextBillCycleDate,
                lastBillDate: lastBillDate
            }
        }
    }

    return {};
}

function bsNetworkInfoSCS( networkId ){
    var subs = Array();
    var networkInfo = null;
    var networkSubscriptions = [];
    if( networkId != '' ){
        var filter = "[DeviceSubscription].[Network].[Id] IS " + networkId + " AND [DeviceSubscription].[Type] IS NOT 'Grace'";
        var getSubscriptions = soapGetDeviceSubscriptionsBSNC( filter );
        if( isNullorEmpty(getSubscriptions.error) ){
            networkSubscriptions = getSubscriptions.subscriptions;
        } else {
            nlapiLogExecution('DEBUG', 'getSubscriptions Error ' , getSubscriptions.error );
        }
        networkInfo = soapGetNetworkByIdBSNC( networkId );
    }

    for( var i = 0; i < networkSubscriptions.length; i++ ){
        var period = bsncGetPeriodBySOAP( networkSubscriptions[i].ActivityPeriod );
        var startDate = parseSOAPDateBSNC( !isNullorEmpty( networkSubscriptions[i].ActivationDate ) ? networkSubscriptions[i].ActivationDate : networkSubscriptions[i].CreationDate );
        var expDate = new Date();
        if( typeof(networkInfo.SubscriptionsRenewalDate) == "undefined" ){
            expDate = bsncGetExpirationDate( startDate, parseSOAPDateBSNC(networkSubscriptions[i].ExpirationDate || false), period.num );
        } else {
            expDate = moment( parseSOAPDateBSNC( networkInfo.SubscriptionsRenewalDate ) ).subtract( 1, 'd' ).toDate();
        }

        var sub = {
            'id': networkSubscriptions[i].Id,
            'invoice': networkSubscriptions[i].InvoiceNumber || "",
            'deviceId': networkSubscriptions[i].DeviceId || "",
            'deviceSerial': networkSubscriptions[i].DeviceSerial || "",
            'period': period.num ? period.num : "other",
            'creation': parseSOAPDateBSNC( networkSubscriptions[i].CreationDate ),
            'activation': parseSOAPDateBSNC( networkSubscriptions[i].ActivationDate || "" ),
            'start': startDate,
            'end': expDate
        };
        subs.push( sub );
    }

    if( !isNullorEmpty( networkInfo ) ){
        if( typeof(networkInfo.Id) != 'undefined' ) {
            var periodInfo = bsncGetPeriodBySOAP( networkInfo.SubscriptionsActivityPeriod );
            return {
                id: networkInfo.Id,
                name: networkInfo.Name,
                period: periodInfo.name,
                renewalDate: networkInfo.SubscriptionsRenewalDate.substr(0,10),
                subsCount: subs.length
            };
        }
    }
    return {};
}

function printNetworkInfoASBSNC(networkInfo){
    var nInfo = '';
    if( !isNullorEmpty( networkInfo ) ){
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
        var count = soapNetworkSubscriptionsCountBSNC( networkInfo.Id );
        console.log("=================typeof (networkInfo.SubscriptionsRenewalDate)=================\n" + typeof (networkInfo.SubscriptionsRenewalDate));
        if (typeof (networkInfo.SubscriptionsRenewalDate) != 'undefined') {
            nInfo += '<b>Renewal Date:</b> ' + networkInfo.SubscriptionsRenewalDate.substr(0,10) + '<br>';
        }
        if( networkInfo.isContent ){
            nInfo += '<b>Type:</b> Content<br>';
            nInfo += '<b>Subs:</b> ' + count.quantity + '<br>';
        }
        if( networkInfo.isControl ){
            nInfo += '<b>Type:</b> Control<br>';
        }
        if( networkInfo.isTrial ){
            nInfo += '<b>Type:</b> Trial<br>';
        } else {
            nInfo += '<b>Was Trial:</b> ' + networkInfo.wasTrial + '<br>';
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
                if (typeof (subsHistory[i].CreationDate) != 'undefined') {
                    nInfo += '<b>Level:</b> ' + subsHistory[i].Level + '<br>';
                }
                nInfo += '</span>';
            }
        }
        nInfo += '</div>';
    }
    return nInfo;
}