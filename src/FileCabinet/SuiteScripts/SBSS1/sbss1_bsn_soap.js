/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       28 Sep 2018     Eugene Karakovsky
 *
 */

function bsnInitFields(){
    var today = new Date(); //Date to use as search filter
    var filters = new Array();
    var formattedDate = nlapiDateToString(today); //Converts date to format based on user preference

    //nlapiSetFieldValue('bsn_addsubs_network_name', 'Test2');
    //nlapiSetFieldValue('bsn_addsubs_network_admin', 'ekarakovsky@brightsign.biz');
    nlapiSetFieldValue('bsn_addsubs_start_date', formattedDate);
    //nlapiSetFieldValue('bsn_addsubs_anniversary_date', formattedDate);

    //nlapiSetFieldValue('bsn_addsubs_network_name', 'Test2');
    //nlapiSetFieldValue('bsn_addsubs_purchaser_email', 'ekarakovsky@brightsign.biz');
    //nlapiSetFieldValue('bsn_addsubs_reseller_email', 'ekarakovsky1@brightsign.biz');
    nlapiSetFieldValue('bsn_addsubs_activity_period', 'P30D');
    nlapiSetFieldValue('bsn_addsubs_count', 10);

    // Init GetNetworkName Form
    var networkAdmin = nlapiGetFieldValue('bsn_getname_network_admin');
    bsnFillNetworksList( networkAdmin )
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */
function bsnFieldChanged(type, name){
    if (name == 'bsn_addsubs_customer') {
        var customerId = nlapiGetFieldValue('bsn_addsubs_customer');

        if( !isNullorEmpty(customerId) ){
            var purchaserEmail = nlapiGetFieldValue('bsn_addsubs_purchaser_email');
            var resellerEmail = nlapiGetFieldValue('bsn_addsubs_reseller_email');
            if( isNullorEmpty( purchaserEmail ) ){
                purchaserEmail = nlapiLookupField('customer', customerId, 'email');
                nlapiSetFieldValue('bsn_addsubs_purchaser_email', purchaserEmail);
                var networks = soapGetNetworksByCustomerEmail(purchaserEmail);
                jQuery('#bsn_addsubs_select_network').html('<option value=""></option>');
                for (var i = 0; i < networks.length; i++){
                    jQuery('#bsn_addsubs_select_network').append('<option value="' + networks[i][0] + '">' + networks[i][1] + '</option>');
                }
                console.log(networks);
            }
            if( isNullorEmpty( resellerEmail ) ){
                resellerEmail = nlapiLookupField('customer', customerId, 'custentity_bs_email_address');
                nlapiSetFieldValue('bsn_addsubs_reseller_email', resellerEmail);
            }


        }
    }

    if (name == 'bsn_addsubs_purchaser_email') {
        var purchaserEmail = nlapiGetFieldValue('bsn_addsubs_purchaser_email');
        jQuery('#bsn_addsubs_select_network').html('<option value=""></option>');
        if( !isNullorEmpty( purchaserEmail ) ){
            var networks = soapGetNetworksByCustomerEmail(purchaserEmail);
            for (var i = 0; i < networks.length; i++){
                jQuery('#bsn_addsubs_select_network').append('<option value="' + networks[i][0] + '">' + networks[i][1] + '</option>');
            }
            console.log(networks);
        }
    }

    if (name == 'bsn_delsubs_customer') {
        var purchaserEmail = '';
        var customerId = nlapiGetFieldValue('bsn_delsubs_customer');

        jQuery('#bsn_delsubs_select_network').html('<option value=""></option>');

        if( !isNullorEmpty(customerId) ){
            purchaserEmail = nlapiLookupField('customer', customerId, 'email');
            nlapiSetFieldValue('bsn_delsubs_network_admin', purchaserEmail);
        }
    }

    if (name == 'bsn_delsubs_network_admin') {
        var purchaserEmail = nlapiGetFieldValue('bsn_delsubs_network_admin');
        jQuery('#bsn_delsubs_select_network').html('<option value=""></option>');
        if( !isNullorEmpty( purchaserEmail ) ){
            var networks = soapGetNetworksByCustomerEmail(purchaserEmail);
            for (var i = 0; i < networks.length; i++){
                jQuery('#bsn_delsubs_select_network').append('<option value="' + networks[i][0] + '">' + networks[i][1] + '</option>');
            }
            console.log(networks);
        }
    }

    if (name == 'bsn_delsubs_select_network') {
        var networkId = nlapiGetFieldValue('bsn_delsubs_select_network');
        if( !isNullorEmpty( networkId ) ){
            bsnDelSubsFillSOList( networkId );
        }
    }

    if (name == 'bsn_addsubs_select_network') {
        var networkId = nlapiGetFieldValue('bsn_addsubs_select_network');
        var activityPeriod = 1;
        var itemId = 598;

        if( isNullorEmpty( networkId ) ){
            nlapiSetFieldValue('bs_addsubs_activity_period', 1);
            nlapiSetFieldValue('bsn_addsubs_anniversary_date', '');
            nlapiSetFieldValue('bsn_addsubs_customer_price', '');
            nlapiSetFieldValue('bsn_addsubs_price', '');
        } else {
            var networkInfo = soapGetNetworkById( networkId );
            switch( networkInfo.SubscriptionsActivityPeriod ){
                case 'P30D': activityPeriod = 1; itemId = 598; break;
                case 'P90D': activityPeriod = 2; itemId = 599; break;
                case 'P365D': activityPeriod = 3; itemId = 595; break;
                case 'P730D': activityPeriod = 4; itemId = 600; break;
                case 'P1095D': activityPeriod = 5; itemId = 601; break;
                default: alert("Network has non-standard Activity Period. It must be changed to standard first ot use another Network.");
            }
            nlapiSetFieldValue('bs_addsubs_activity_period', activityPeriod);

            var networkRenewalDate = moment(parseSOAPDate( networkInfo.SubscriptionsRenewalDate ));

            if( networkRenewalDate ){
                nlapiSetFieldValue('bsn_addsubs_anniversary_date', nlapiDateToString( networkRenewalDate.toDate() ));
            } else {
                nlapiSetFieldValue('bsn_addsubs_anniversary_date', '');
            }

            var customer = nlapiGetFieldValue('bsn_addsubs_customer');
            if( isNullorEmpty( customer ) ){
                Ext.MessageBox.show({title : 'Warning', msg : 'Please select a Customer first!', width : 300, buttons : Ext.MessageBox.OK,
                    fn: function (btn, text) {
                        if (btn == 'ok') {
                            nlapiSetFieldValue('bsn_addsubs_select_network', '');
                        }
                    },
                    icon : Ext.MessageBox.WARNING});
            } else {
                var cRecord = nlapiLoadRecord('customer', customer);
                var cPricing = bsnGetCustomPricing( cRecord, itemId );
                var customerPriceLevel = cRecord.getFieldValue('pricelevel');
                var newPrice = 0;
                if( cPricing.success ){
                    customerPriceLevel = cPricing.level;
                    newPrice = cPricing.price;
                }
                if( !newPrice ) {
                    var customerPrices = bsnGetPriceLevels(itemId);
                    var newPriceLevel = -1;
                    if (!isNullorEmpty(customerPriceLevel)) {
                        if (!isNullorEmpty(customerPrices[customerPriceLevel])) {
                            newPrice = customerPrices[customerPriceLevel];
                            newPriceLevel = customerPriceLevel;
                        } else {
                            if (!isNullorEmpty(customerPrices[1])) { //base price
                                newPrice = customerPrices[1];
                                newPriceLevel = 1;
                            } else {
                                newPrice = 0;
                                newPriceLevel = -1;
                            }
                        }
                    } else {
                        if (!isNullorEmpty(customerPrices[1])) { //base price
                            newPrice = customerPrices[1];
                            newPriceLevel = 1;
                        } else {
                            newPrice = 0;
                            newPriceLevel = -1;
                        }
                    }
                }

                nlapiSetFieldValue('bsn_addsubs_customer_price', newPrice);
                nlapiSetFieldValue('bsn_addsubs_price', newPrice);

                bsnAddSubsFillSOList( networkId );
            }
        }
    }

    if( name == 'bsn_addsubs_network_so' ){
        bsnAddSubsGetSOData();
    }

    if( name == 'bsn_addsubs_custom_price' ){
        var editedPrice = nlapiGetFieldValue('bsn_addsubs_price');
        var customerPrice = nlapiGetFieldValue('bsn_addsubs_customer_price');
        var customPriceCheck = nlapiGetFieldValue('bsn_addsubs_custom_price');
    }

    if( name == 'bsn_addsubs_price' ){
        var editedPrice = nlapiGetFieldValue('bsn_addsubs_price');
        var customerPrice = nlapiGetFieldValue('bsn_addsubs_customer_price');
        var customPriceCheck = nlapiGetFieldValue('bsn_addsubs_custom_price');
        if( parseInt(editedPrice) > 0 ){
            if( editedPrice === customerPrice ){
                nlapiSetFieldValue('bsn_addsubs_custom_price', 'F');
            } else {
                nlapiSetFieldValue('bsn_addsubs_custom_price', 'T');
            }
        }
        console.log(nlapiGetFieldValue('bsn_addsubs_price'));
        console.log(nlapiGetFieldValue('bsn_addsubs_customer_price'));
        console.log(nlapiGetFieldValue('bsn_addsubs_custom_price'));
    }

    if (name == 'bsn_getname_network_admin') {
        var purchaserEmail = nlapiGetFieldValue('bsn_getname_network_admin');

        jQuery('#bsn_getname_select_network').html('<option value=""></option>');

        if( !isNullorEmpty(purchaserEmail) ){
            var networks = soapGetNetworksByCustomerEmail(purchaserEmail);
            for (var i = 0; i < networks.length; i++){
                jQuery('#bsn_getname_select_network').append('<option value="' + networks[i][0] + '">' + networks[i][1] + '</option>');
            }
            console.log(networks);
        }
    }

    if (name == 'bsn_getname_select_network') {
        var networkId = nlapiGetFieldValue('bsn_getname_select_network');
        var activityPeriod = nlapiGetFieldValue('bsn_getname_activity_period');
        var renewalDate = nlapiGetFieldValue('bsn_getname_renewal_date');
        var startDate = nlapiGetFieldValue("bsn_getname_start_date");

        jQuery('#bsn_getname_network_info').html('');

        if( !isNullorEmpty(networkId) ){
            var networkInfo = soapGetNetworkById( networkId );

            console.log(networkInfo);

            if( !isNullorEmpty(networkInfo.SubscriptionsActivityPeriod) && !isNullorEmpty(networkInfo.SubscriptionsRenewalDate)){
                var contractPeriod = ['P1D','P30D','P90D','P365D','P730D','P1095D'];
                var periodName = ['1 Day','1 Month','3 Months','1 Year','2 Years','3 Years'];
                if( contractPeriod.indexOf(networkInfo.SubscriptionsActivityPeriod) == -1 ){
                    jQuery('#bsn_getname_network_info').html('<br>Network has wrong Activity Period set!<br>Should be one of:<br>1 Month, 3 Months, 1 Year, 2 Years, 3 years');
                }else if(contractPeriod.indexOf(networkInfo.SubscriptionsActivityPeriod) != activityPeriod){
                    jQuery('#bsn_getname_network_info').html('<br>Your Period: ' + periodName[activityPeriod] + '<br>Network Period: <span style="color:red">' + periodName[contractPeriod.indexOf(networkInfo.SubscriptionsActivityPeriod)] + '</span><br><br>This Network cannot be used!');
                }else{
                    var endDate = parseSOAPDate( networkInfo.SubscriptionsRenewalDate );
                    endDate = moment(endDate);//.subtract(1, 'days');
                    if( endDate.diff(moment(renewalDate), 'days') < 0 || endDate.diff(moment(renewalDate), 'days') >= 1 ){
                        if( endDate < moment(startDate) ){
                            jQuery('#bsn_getname_network_info').html('<br>Sales Order Start Date (' + startDate + ') is later than Network End Date (' + endDate.format('M/D/YYYY') + ')<br>Please update this Network\'s Renewal Date or Renew it\'s Subscriptions first!');
                        } else if( endDate > moment(renewalDate) ){
                            jQuery('#bsn_getname_network_info').html('<br>Network End Date (' + endDate.format('M/D/YYYY') + ') is later than Sales Order End Date (' + renewalDate + ')<br>If you use this network, the amount charged will be for more than 1 Subscription term!');
                        }else{
                            var logRenewalDate = moment(endDate).add(1, 'days');
                            jQuery('#bsn_getname_network_info').html('<br>Your Renewal Date: ' + renewalDate + '<br>Network Renewal Date: <span style="color:red">' + moment(logRenewalDate).format('M/D/YYYY') + '</span><br><br>End Date and amount of the Sales Order will be changed!');
                        }
                    } else {
                        jQuery('#bsn_getname_network_info').html('<br><span style="color:green">Network can be used!</span>');
                    }
                }
            }else{
                jQuery('#bsn_getname_network_info').html('<br>Network is of a wrong type.<br>You should convert this network first!');
            }
        }
    }

    if( name == 'bsn_upd_network_admin' ){
        var adminEmail = nlapiGetFieldValue('bsn_upd_network_admin');

        jQuery('#bsn_upd_network_name').html('<option value=""></option>');

        if( !isNullorEmpty( adminEmail ) ){
            var networks = soapGetNetworksByCustomerEmail(adminEmail);
            console.log(networks);
            for (var i = 0; i < networks.length; i++){
                jQuery('#bsn_upd_network_name').append('<option value="' + networks[i][0] + '">' + networks[i][1] + '</option>');
            }
        }
    }

    if (name == 'bsn_upd_network_name') {
        var networkId = nlapiGetFieldValue('bsn_upd_network_name');
        var activityPeriod = 1;

        jQuery('#bsn_upd_network_info').html('');

        if( isNullorEmpty( networkId ) ){
            nlapiSetFieldValue('bsn_upd_activity_period', 1);
            nlapiSetFieldValue('bsn_upd_renewal_date', '');
        } else {
            var subsCount = soapNetworkSubscriptionsCount( networkId );
            if( isNullorEmpty(subsCount.error) ){
                jQuery('#bsn_upd_network_info').html('<br><span style="color:red">Network has active Commercial Subscriptions (' + subsCount.quantity + ').<br>To convert/update it you have to remove those Commercial Subscriptions first.</span>');
            }
            var networkInfo = soapGetNetworkById( networkId );
            switch( networkInfo.SubscriptionsActivityPeriod ){
                case 'P30D': activityPeriod = 1; break;
                case 'P90D': activityPeriod = 2; break;
                case 'P365D': activityPeriod = 3; break;
                case 'P730D': activityPeriod = 4; break;
                case 'P1095D': activityPeriod = 5; break;
                default: jQuery('#bsn_upd_network_info').html('<br><span style="color:red">Network has non-standard Activity Period. It must be changed to standard first or use another Network.</span>');
            }
            nlapiSetFieldValue('bsn_upd_activity_period', activityPeriod);

            var networkRenewalDate = parseSOAPDate( networkInfo.SubscriptionsRenewalDate );
            if( networkRenewalDate ){
                nlapiSetFieldValue('bsn_upd_renewal_date', nlapiDateToString( networkRenewalDate ));
            } else {
                nlapiSetFieldValue('bsn_upd_renewal_date', '');
            }
        }
    }
}

function bsncAddSubscriptionsSubmit( args ){
    var customer = nlapiGetFieldValue('bsnc_addsubs_customer');
    var endUser = nlapiGetFieldValue('bsnc_addsubs_enduser');
    var adminEmail = nlapiGetFieldValue('bsnc_addsubs_purchaser_email');
    var resellerEmail = nlapiGetFieldValue('bsnc_addsubs_reseller_email');
    var activationDate = nlapiGetFieldValue('bsnc_addsubs_start_date');
    var endDate = nlapiGetFieldValue('bsnc_addsubs_anniversary_date');
    var anniversaryDate = nlapiGetFieldValue('bsnc_addsubs_anniversary_date');
    var activityPeriod = nlapiGetFieldValue('bsnc_addsubs_activity_period');
    var subsCount = parseInt(nlapiGetFieldValue('bsnc_addsubs_count'));
    var customerPrice = nlapiGetFieldValue('bsnc_addsubs_price');
    var networkName = nlapiGetFieldValue('bsnc_addsubs_select_network');
    var isCustomPrice = nlapiGetFieldValue('bsnc_addsubs_custom_price');
    var billingAccount = nlapiGetFieldValue('bsnc_addsubs_billing_account');
    var po = nlapiGetFieldValue('bsnc_addsubs_po');
    var salesrep = nlapiGetFieldValue('bsnc_addsubs_salesrep')||'';
    if( !isNullorEmpty( args ) ) {
        customer = args.customer;
        endUser = args.endUser;
        adminEmail = args.adminEmail;
        resellerEmail = args.resellerEmail;
        activationDate = args.activationDate;
        endDate = args.endDate;
        anniversaryDate = args.anniversaryDate;
        activityPeriod = args.activityPeriod;
        subsCount = parseInt(args.subsCount);
        customerPrice = args.customerPrice;
        networkName = args.networkName;
        isCustomPrice = args.customPriceCheck;
        billingAccount = args.billingAccount;
        po = args.po;
        salesrep = args.salesrep;
    }

    console.log(endDate);
    var convertItemId = sbBSNSettings.bsn1yrItemText;
    var months = 12;

    if (isNullorEmpty(customer)) return Ext.MessageBox.show({
        title: 'ERROR',
        msg: 'Please select a Customer!',
        width: 400,
        buttons: Ext.MessageBox.OK,
        icon: Ext.MessageBox.ERROR
    });
    if (isNullorEmpty(billingAccount)) return Ext.MessageBox.show({
        title: 'ERROR',
        msg: 'Please select a Billing Account!',
        width: 400,
        buttons: Ext.MessageBox.OK,
        icon: Ext.MessageBox.ERROR
    });
    if (isNullorEmpty(adminEmail)) return Ext.MessageBox.show({
        title: 'ERROR',
        msg: 'Please enter Admin Email!',
        width: 400,
        buttons: Ext.MessageBox.OK,
        icon: Ext.MessageBox.ERROR
    });
    if (isNullorEmpty(activityPeriod)) {
        return Ext.MessageBox.show({
            title: 'ERROR',
            msg: 'Please select subscription Activity Period!',
            width: 400,
            buttons: Ext.MessageBox.OK,
            icon: Ext.MessageBox.ERROR
        });
    } else {
        switch (activityPeriod) {
            case '3':
                activityPeriod = 'P365D';
                convertItemId = sbBSNSettings.bsn1yrItemText;
                months = 12;
                break;
            default:
                return Ext.MessageBox.show({
                    title: 'ERROR',
                    msg: 'Invalid Activity Period!',
                    width: 400,
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.ERROR
                });
        }
    }
    if (isNullorEmpty(activationDate)) return Ext.MessageBox.show({
        title: 'ERROR',
        msg: 'Please enter Subscriptions Activation Date!',
        width: 400,
        buttons: Ext.MessageBox.OK,
        icon: Ext.MessageBox.ERROR
    });
    if (isNullorEmpty(anniversaryDate)) return Ext.MessageBox.show({
        title: 'ERROR',
        msg: 'Please enter Subscriptions Anniversary Date!',
        width: 400,
        buttons: Ext.MessageBox.OK,
        icon: Ext.MessageBox.ERROR
    });
    if (isNullorEmpty(subsCount)) return Ext.MessageBox.show({
        title: 'ERROR',
        msg: 'Please enter Subscriptions Count!',
        width: 400,
        buttons: Ext.MessageBox.OK,
        icon: Ext.MessageBox.ERROR
    });
    if (isNullorEmpty(customerPrice)) return Ext.MessageBox.show({
        title: 'ERROR',
        msg: 'Please enter Price of 1 Subscription!',
        width: 400,
        buttons: Ext.MessageBox.OK,
        icon: Ext.MessageBox.ERROR
    });
    if (isNullorEmpty(networkName)) return Ext.MessageBox.show({
        title: 'ERROR',
        msg: 'Please select a Network Name!',
        width: 400,
        buttons: Ext.MessageBox.OK,
        icon: Ext.MessageBox.ERROR
    });

    endDate = nlapiDateToString( moment( nlapiStringToDate( anniversaryDate ) ).subtract( 1, 'd' ).toDate() );
    var startDate = activationDate;//;nlapiDateToString(moment(nlapiStringToDate(anniversaryDate)).subtract(1, 'y').toDate());

    var revRecStartDate = nlapiDateToString(moment(nlapiStringToDate(startDate)).startOf('month').toDate());
    var revRecEndDate = bsnRevRecEndDate(moment(nlapiStringToDate(startDate)), endDate, months);


    /***Gather existing subscriptions***/
    var existingText = '';
    var existingSubscriptionRecords = bsncGetSubscriptionsByNetid( networkName, 2 );
    if( existingSubscriptionRecords.length ){
        existingText = "There are other Subscription Records feeding Subs to this Network:<br>";
        for( var k = 0; k < existingSubscriptionRecords.length; k++ ){
            existingText += '<a href="' + nlapiResolveURL('RECORD', 'subscription', existingSubscriptionRecords[k].subId) + '" target="_blank">' + existingSubscriptionRecords[k].subName + '</a> owned by <a href="' + nlapiResolveURL('RECORD', 'customer', existingSubscriptionRecords[k].customerId) + '">' + existingSubscriptionRecords[k].subCustomer + '</a><br><br>Are you sure you want to continue?<br>';
        }
    }
    /********/


    var networkInfo = soapGetNetworkById(networkName);
    console.log(networkInfo);

    var netPeriod = networkInfo.SubscriptionsActivityPeriod;

    if (activityPeriod == netPeriod) {
        var pricePercentage = getPricePercentage(customerPrice, activityPeriod, startDate, endDate, subsCount);

        if (pricePercentage['deltaDuration'] < 0) {
            Ext.MessageBox.show({
                title: 'ERROR',
                msg: 'ERROR: Renewal Date is in the past!<br>Please, update network renewal date first.',
                width: 400,
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.ERROR
            });
        } else {
            jQuery(".loader-overlay").fadeIn(1000);
            Ext.MessageBox.show({
                title: 'Preview Data',
                msg: existingText == '' ? 'Subscription Record for will be created now.<br>Are you sure?' : existingText,
                width: 400,
                buttons: Ext.MessageBox.OKCANCEL,
                fn: function (btn, text) {
                    if (btn == 'ok') {
                        var percent = 100;
                        if (pricePercentage['percent'] > 0) {
                            percent = pricePercentage['percent'];
                        }
                        var firstPrice = roundTo(customerPrice * percent / 100, 2);

                        var month = moment().format('MMM').toLowerCase();

                        var newSub = nlapiCreateRecord("subscription");
                        newSub.setFieldValue("customer", customer);
                        newSub.setFieldValue("custrecord_bsn_sub_end_user", endUser);
                        newSub.setFieldValue("custrecord_sub_network_admin", adminEmail);
                        newSub.setFieldValue('initialterm', -102);//1=12 months
                        newSub.setFieldValue("billingaccount", billingAccount);
                        newSub.setFieldValue("startdate", startDate);
                        newSub.setFieldValue("enddate", endDate);


                        var customerRecord = nlapiLoadRecord('customer', customer);
                        var customerPriceLevel = customerRecord.getFieldValue('pricelevel');
                        var isCustomerSupport = customerRecord.getFieldValue('custentity_bs_support_customer') == 'T';
                        var customerPriceBook = search(customerPriceLevel, sbBSNSettings.priceBooks, 'pricelevel');
                        customerPriceBook = bsnGetPriceBookByPriceLevel(netTypeCom, customerPriceLevel);
                        if (!customerPriceBook) customerPriceBook = bsnGetPriceBookByPriceLevel(netTypeCom, priceLevelMSRP);
                        if (isCustomerSupport) customerPriceBook = bsnGetPriceBookByPriceLevel(netTypeCom, priceLevelSupport);
                        //Ext.MessageBox.alert('Subscription Created', 'Price Level: ' + priceBooks[customerPriceBook].pricelevel + '<br>' + 'Price Book: ' + priceBooks[customerPriceBook].pricebook);

                        newSub.setFieldValue("subscriptionplan", sbBSNSettings.bsn1yrPlanNum);
                        newSub.setFieldValue("pricebook", customerPriceBook);
                        newSub.setFieldValue("custrecord_sub_network_id", networkName);
                        newSub.setFieldValue("custrecord_bsn_type", netTypeCom);
                        newSub.setFieldValue("custrecord_bs_subscription_po", po);
                        newSub.setFieldValue("custrecord_bsnc_sales_rep", salesrep);

                        newSub.setFieldValue('defaultrenewalterm', 1);//12 months

                        try {
                            console.log("newSubEnd=" + newSub.getFieldValue('enddate'));
                            var sub = nlapiSubmitRecord(newSub);
                            console.log("sub=" + sub);
                            var subRecord = nlapiLoadRecord('subscription', sub);
                            subRecord.setFieldValue('enddate', endDate);
                            nlapiSubmitRecord(subRecord);
                            subRecord = nlapiLoadRecord('subscription', sub);
                            console.log("newSubEnd1=" + subRecord.getFieldValue('enddate'));
                            var subLineId = subRecord.getLineItemValue('subscriptionline', 'subscriptionline', 1);
                            //subRecord.setLineItemValue( 'priceinterval', 'quantity', 1, subsCount );

                            var newPrice = -1;
                            if( isCustomPrice === 'T' ){
                                newPrice = customerPrice;
                            }
                            var resRecord = sbUpdateLatestPricePlan( subRecord, subsCount, newPrice )
                            //nlapiSubmitRecord( subRecord );
                            nlapiSubmitField('subscriptionline', subLineId, 'subscriptionlinestatus', 'PENDING_ACTIVATION');
                            var changeOrder = nlapiCreateRecord('subscriptionchangeorder', {
                                'action': 'ACTIVATE',
                                'subscription': sub
                            });
                            changeOrder.setFieldValue('effectivedate', activationDate);
                            changeOrder.setFieldValue('requestoffcycleinvoice', 'T');
                            changeOrder.setLineItemValue('subline', 'apply', 1, 'T');
                            nlapiSubmitRecord(changeOrder);
                            var requestUrl = nlapiResolveURL('Suitelet', 'customscript_sb_bsnc_sl_create_bsn_subs', 'customdeploy_sb_bsnc_sl_create_bsn_subs');
                            //var response = nlapiRequestURL(requestUrl + '&sub=' + sub, null, null, null);
                            //Ext.MessageBox.alert('Subscription Created', 'Subscription <a href="/app/accounting/subscription/subscription.nl?id=' + sub + '" target="blank">' + subRecord.getFieldValue('name') + '</a> is created.');
                            Ext.MessageBox.show({
                                title: 'Subscription Created',
                                msg: 'Subscription <a href="/app/accounting/subscription/subscription.nl?id=' + sub + '" target="blank">' + subRecord.getFieldValue('name') + '</a> is created.<br>Do you want to reload form?',
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
                            showAlertBox('subscription_created', 'Subscription Created', 'Subscription <a href="/app/accounting/subscription/subscription.nl?id=' + sub + '" target="blank">' + subRecord.getFieldValue('name') + '</a> is created.', NLAlertDialog.TYPE_LOWEST_PRIORITY);
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
        Ext.MessageBox.show({
            title: 'ERROR',
            msg: 'ERROR: Activity Period of Network is different from selected.',
            width: 400,
            buttons: Ext.MessageBox.OK,
            icon: Ext.MessageBox.ERROR
        });
    }
}

function bsncUpdateSubscriptionsSubmit(){
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

    var convertItemId = sbBSNSettings.bsn1yrItemText;
    var months = 12;

    if( isNullorEmpty( customer ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select a Customer!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( billingAccount ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select a Billing Account!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( purchaserEmail ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Admin Email!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( activityPeriod ) ) {
        return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select subscription Activity Period!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    } else {
        switch( activityPeriod ){
            case '3': activityPeriod = 'P365D'; convertItemId = sbBSNSettings.bsn1yrItemText; months = 12; break;
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

    var networkInfo = soapGetNetworkById( networkName );
    console.log(networkInfo);

    var netPeriod = 'P365D';//networkInfo.SubscriptionsActivityPeriod;

    if( activityPeriod == netPeriod ){
        var pricePercentage = getPricePercentage( customerPrice, activityPeriod, startDate, endDate, subsCount );

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
                        var currentSub = bsGetSubscriptionByNetid( networkInfo.Id, customer, 2 );
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
                        var customerPriceBook = search( customerPriceLevel, priceBooks, 'pricelevel' );
                        if( customerPriceBook == -1 ) customerPriceBook = 0;
                        //Ext.MessageBox.alert('Subscription Created', 'Price Level: ' + priceBooks[customerPriceBook].pricelevel + '<br>' + 'Price Book: ' + priceBooks[customerPriceBook].pricebook);

                        newSub.setFieldValue("subscriptionplan", bsn1yrPlanNum);
                        newSub.setFieldValue("pricebook", priceBooks[customerPriceBook].pricebook);
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

function formUpdateNetworkTestSubmit(){
    var networkId = nlapiGetFieldValue('bsn_upd_network_name');
    var networkPeriod = nlapiGetFieldValue('bsn_upd_activity_period');
    var networkRenewalDate = nlapiGetFieldValue('bsn_upd_renewal_date');

    if( isNullorEmpty( networkId ) ) return alert( 'Please enter Invoice Number!' );
    //if( isNullorEmpty( networkPeriod ) ) return alert( 'Please enter Network Activity Period!' );
    //if( isNullorEmpty( networkRenewalDate ) ) return alert( 'Please enter Network Renewal Date!' );

    var network = soapGetNetworkById( networkId );
    //console.log(network);
    var filter = "[DeviceSubscription].[Network].[Id] IS " + networkId + " AND [DeviceSubscription].[Type] IS NOT 'Grace'";
    var networkSubscriptions = [];
    var getSubscriptions = soapGetDeviceSubscriptions( filter );
    if( isNullorEmpty(getSubscriptions.error) ){
        networkSubscriptions = getSubscriptions.subscriptions;
    } else {
        console.log("=================getSubscriptions Error=================\n" + getSubscriptions.error);
    }

    console.log(networkSubscriptions);

    if( isArray( networkSubscriptions ) ){
        var invoiceList = '<br><strong>Sales Orders:</strong>';
        var notes = '<br><strong>Notes:</strong>';
        var emptyInvoice = '<br>Network has subscriptions with empty Invoice field!';
        var hasEmptyInvoice = false;
        var invoices = new Array();
        for( var i = 0; i < networkSubscriptions.length; i++ ){
            //console.log(result[i]);
            if( invoices.indexOf( networkSubscriptions[i].InvoiceNumber ) == -1 ){
                invoices.push( networkSubscriptions[i].InvoiceNumber );
                if( trim( networkSubscriptions[i].InvoiceNumber ) == '' ){
                    invoiceList += '<br>Empty Invoice';
                    hasEmptyInvoice = true;
                } else {
                    filter = "[DeviceSubscription].[Network].[Id] IS " + networkId + " AND [DeviceSubscription].[InvoiceNumber] IS '" + networkSubscriptions[i].InvoiceNumber + "' AND [DeviceSubscription].[Type] IS NOT 'Grace'";
                    var invSubs = [];
                    getSubscriptions = soapGetDeviceSubscriptions( filter );
                    if( isNullorEmpty(getSubscriptions.error) ){
                        invSubs = getSubscriptions.subscriptions;
                    } else {
                        console.log("=================getInvoiceSubscriptions Error=================\n" + getSubscriptions.error);
                    }
                    invoiceList += '<br>SO-' + networkSubscriptions[i].InvoiceNumber + ' (' + invSubs.length + ')';
                }
            }
        }
        if( !invoices.length ){
            invoiceList = '';
        } else {
            for( i = 0; i < invoices.length; i++ ){
                var soId = bsGetSOByTranid( 'SO-' + invoices[i] );
                console.log( soId );
                var subSO = nlapiLoadRecord( 'salesorder', soId );
                var subSOItemCount = subSO.getLineItemCount('item');
                console.log( subSOItemCount );
                if( subSOItemCount > 1 ){
                    for( var k = 1; k <= subSOItemCount; k++ ){
                        var description = subSO.getLineItemValue( 'item', 'description', k );
                        console.log( description );
                    }
                }

            }
        }
        if( !hasEmptyInvoice ) emptyInvoice = '';
        //console.log( invoices );
        Ext.MessageBox.alert('Subscriptions Info', '<strong>Active subscriptions:</strong> ' + networkSubscriptions.length + invoiceList + emptyInvoice);
    } else {
        Ext.MessageBox.alert('Subscriptions Info', result);
    }
}

function bsGetSOByTranid( tranid ){
    var additionalFilters = new Array();
    additionalFilters[0] = new nlobjSearchFilter('tranid', null, 'is', tranid);
    var columns = new Array();
    var searchresults = nlapiSearchRecord('salesorder', null, additionalFilters, columns);
    if( searchresults != null ){
        return searchresults[0].getId();
    }

    return -1;
}

function formAddSubscriptionsSubmit(){
    var customer = nlapiGetFieldValue('bsn_addsubs_customer');
    var purchaserEmail = nlapiGetFieldValue('bsn_addsubs_purchaser_email');
    var resellerEmail = nlapiGetFieldValue('bsn_addsubs_reseller_email');
    var startDate = nlapiGetFieldValue('bsn_addsubs_start_date');
    var anniversaryDate = nlapiGetFieldValue('bsn_addsubs_anniversary_date');
    var activityPeriod = nlapiGetFieldValue('bs_addsubs_activity_period');
    var subsCount = nlapiGetFieldValue('bsn_addsubs_count');
    var customerPrice = nlapiGetFieldValue('bsn_addsubs_price');
    var networkName = nlapiGetFieldValue('bsn_addsubs_select_network');
    var customPriceCheck = nlapiGetFieldValue('bsn_addsubs_custom_price');
    var addInvoice = nlapiGetFieldValue('bsn_addsubs_network_so');
    var contractItem = nlapiGetFieldValue('bsn_addsubs_contract_item');
    var excludeRenewal = 'F';

    var convertItemId = '598';
    var months = 12;

    if( isNullorEmpty( customer ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select a Customer!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( purchaserEmail ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Admin Email!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( activityPeriod ) ) {
        return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select subscription Activity Period!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    } else {
        switch( activityPeriod ){
            case '1': activityPeriod = 'P30D'; convertItemId = '598'; months = 1; break;
            case '2': activityPeriod = 'P90D'; convertItemId = '599'; months = 3; break;
            case '3': activityPeriod = 'P365D'; convertItemId = '595'; months = 12; break;
            case '4': activityPeriod = 'P730D'; convertItemId = '600'; months = 24; break;
            case '5': activityPeriod = 'P1095D'; convertItemId = '601'; months = 36; break;
            default: return Ext.MessageBox.show({title : 'ERROR', msg : 'Invalid Activity Period!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
        }
    }
    if( isNullorEmpty( startDate ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Subscriptions Start Date!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( anniversaryDate ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Subscriptions Anniversary Date!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( subsCount ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Subscriptions Count!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( customerPrice ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Price of 1 Subscription!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( networkName ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select a Network Name!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});

    if( !isNullorEmpty( addInvoice ) && !isNullorEmpty( contractItem ) ){
        addInvoice = "\nAdd Invoice:" + addInvoice.substr( 3 ).trim();
        contractItem = "\nContract Item:" + contractItem.trim();
        excludeRenewal = 'T';
    }

    var endDate = nlapiDateToString( moment( nlapiStringToDate( anniversaryDate ) ).subtract( 1, 'd' ).toDate() );

    var revRecStartDate = nlapiDateToString( moment(nlapiStringToDate(startDate)).startOf('month').toDate() );
    var revRecEndDate = bsnRevRecEndDate( moment(nlapiStringToDate(startDate)), endDate, months );

    var networkInfo = soapGetNetworkById( networkName );
    console.log(networkInfo);

    var netPeriod = networkInfo.SubscriptionsActivityPeriod;

    if( activityPeriod == netPeriod ){
        var pricePercentage = getPricePercentage( customerPrice, activityPeriod, startDate, endDate, subsCount );

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
                        subsSO.setFieldValue("custbody_bsn_proration_info", 'Sales Order for ' + pricePercentage['deltaDuration'] + ' days.<br>That is ' + pricePercentage['percent'] + '% ($' + firstPrice + ') of a full subscription ($' + customerPrice + ').<br>The order is for ' + subsCount + ' subscriptions<br>' + 'Total price: $' + firstPrice + ' * ' + subsCount + ' = $' + pricePercentage['total']);

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
                        subsSO.setCurrentLineItemValue('item', 'custcol_renewals_exclusion', excludeRenewal);
                        subsSO.setCurrentLineItemValue('item', 'description', "Customer Email:" + purchaserEmail + "\nNetwork:" + networkInfo.Name + "\nNetwork ID:" + networkInfo.Id + addInvoice + contractItem);
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

function soapAddSubsReviewNumbers(){
    var customer = nlapiGetFieldValue('bsn_addsubs_customer');
    var purchaserEmail = nlapiGetFieldValue('bsn_addsubs_purchaser_email');
    var resellerEmail = nlapiGetFieldValue('bsn_addsubs_reseller_email');
    var startDate = nlapiGetFieldValue('bsn_addsubs_start_date');
    var anniversaryDate = nlapiGetFieldValue('bsn_addsubs_anniversary_date');
    var activityPeriod = nlapiGetFieldValue('bs_addsubs_activity_period');
    var subsCount = nlapiGetFieldValue('bsn_addsubs_count');
    var customerPrice = nlapiGetFieldValue('bsn_addsubs_price');
    var networkName = nlapiGetFieldValue('bsn_addsubs_select_network');

    if( isNullorEmpty( customer ) ) return alert( 'Please select a Customer!' );
    if( isNullorEmpty( purchaserEmail ) ) return alert( 'Please enter Admin Email!' );
    if( isNullorEmpty( activityPeriod ) ) {
        return alert( 'Please select subscription Activity Period!' );
    } else {
        switch( activityPeriod ){
            case '1': activityPeriod = 'P30D'; break;
            case '2': activityPeriod = 'P90D'; break;
            case '3': activityPeriod = 'P365D'; break;
            case '4': activityPeriod = 'P730D'; break;
            case '5': activityPeriod = 'P1095D'; break;
            default: return alert( 'Invalid Activity Period!' );
        }
    }
    if( isNullorEmpty( startDate ) ) return alert( 'Please enter Subscriptions Start Date!' );
    if( isNullorEmpty( anniversaryDate ) ) return alert( 'Please enter Subscriptions Anniversary Date!' );
    if( isNullorEmpty( subsCount ) ) return alert( 'Please enter Subscriptions Count!' );
    if( isNullorEmpty( networkName ) ) return alert( 'Please select a Network Name!' );
    if( isNullorEmpty( customerPrice ) ) return alert( 'Please enter Subscription Price!' );

    var endDate = nlapiDateToString( moment( nlapiStringToDate( anniversaryDate ) ).subtract( 1, 'd' ).toDate() );

    var networkInfo = soapGetNetworkById( networkName );
    console.log(networkInfo);

    //var netDate = parseSOAPDate( networkInfo.SubscriptionsRenewalDate );
    var netPeriod = networkInfo.SubscriptionsActivityPeriod;

    if( activityPeriod == netPeriod ){
        var pricePercentage = getPricePercentage( customerPrice, activityPeriod, startDate, endDate, subsCount );
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

function getPricePercentage( price, activityPeriod, startDate, endDate, subsCount ){
    var percentageInfo = new Array();
    percentageInfo['percent'] = 0;
    percentageInfo['total'] = 0;
    var periodDuration = getCurrentPeriodDays( activityPeriod, endDate );
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

function getCurrentPeriodDays( activityPeriod, renewalDate ){
    switch( activityPeriod ){
        case 'P30D': activityPeriod = 1; break;
        case 'P90D': activityPeriod = 3; break;
        case 'P365D': activityPeriod = 12; break;
        case 'P730D': activityPeriod = 24; break;
        case 'P1095D': activityPeriod = 36; break;
        default: return console.log("Network has non-standard Activity Period. It must be changed to standard first or use another Network.");
    }

    var startDate = moment(renewalDate);
    var endDate = moment(renewalDate);
    startDate.subtract(activityPeriod, 'months');
    return endDate.diff(startDate, 'days');
}

function formDeleteSubsTestSubmit(){
    var invoice = parseInt(nlapiGetFieldValue('bsn_delsubs_network_so'));
    var networkId = nlapiGetFieldValue('bsn_delsubs_select_network');

    if( isNullorEmpty( invoice ) ) return alert( 'Please enter Invoice Number!' );
    if( isNullorEmpty( networkId ) ) return alert( 'Please enter Network Name!' );

    var filter = "[DeviceSubscription].[Network].[Id] IS " + networkId + " AND [DeviceSubscription].[InvoiceNumber] IS '" + invoice + "'";
    var result = [];
    var getSubscriptions = soapGetDeviceSubscriptions( filter );
    if( isNullorEmpty(getSubscriptions.error) ){
        result = getSubscriptions.subscriptions;
    } else {
        console.log("=================getSubscriptions Error=================\n" + getSubscriptions.error);
    }

    if( isArray( result ) ){
        Ext.MessageBox.alert('Subscriptions Info', '<strong>Active subscriptions:</strong> ' + result.length + '<br><strong>From Invoice:</strong> SO-' + invoice + '</a>');
    } else {
        Ext.MessageBox.alert('Subscriptions Info', result);
    }
}

function formDeleteSubscriptionsSubmit(){
    Ext.Msg.confirm("Confirmation", "Do you REALLY want to delete these Subscriptions?", function(btnText){
        if(btnText === "no"){

        }
        else if(btnText === "yes"){
            var invoice = nlapiGetFieldValue('bsn_delsubs_network_so');
            var networkId = nlapiGetFieldValue('bsn_delsubs_select_network');

            if( isNullorEmpty( invoice ) ) return alert( 'Please enter Invoice Number!' );
            if( isNullorEmpty( networkId ) ) return alert( 'Please enter Network Name!' );

            invoice = parseInt( invoice );

            var filter = "[DeviceSubscription].[Network].[Id] IS " + networkId + " AND [DeviceSubscription].[InvoiceNumber] IS '" + invoice + "'";
            var result = [];
            var getSubscriptions = soapGetDeviceSubscriptions( filter );
            if( isNullorEmpty(getSubscriptions.error) ){
                result = getSubscriptions.subscriptions;
            } else {
                console.log("=================getSubscriptions Error=================\n" + getSubscriptions.error);
                showAlertBox('error_subscriptions_not_deleted', 'Error Getting Subscriptions Info', result.error, NLAlertDialog.TYPE_HIGH_PRIORITY);
            }

            if( isArray( result.subscriptions ) ){
                Ext.Msg.confirm("Confirmation", "You will DELETE " + result.length + " subscriptions! Confirm?", function(btnText){
                    if(btnText === "no"){
                    }
                    else if(btnText === "yes"){
                        var subsToDelete = new Array();
                        for( var i = 0; i < result.length; i++ ){
                            subsToDelete.push( result[i].Id );
                        }
                        console.log(subsToDelete);
                        result = soapDeleteDeviceSubscriptions( subsToDelete, invoice );

                        if( !isNullorEmpty(result.error) ){
                            showAlertBox('error_subscriptions_not_deleted', 'Error Deleting Subscriptions', result, NLAlertDialog.TYPE_HIGH_PRIORITY);
                        } else {
                            showAlertBox('error_subscriptions_not_deleted', 'Success', '<strong>Successfully deleted subscriptions:</strong> ' + subsToDelete.length + '<br><strong>From Subscription:</strong> ' + invoice + '</a>', NLAlertDialog.TYPE_LOWEST_PRIORITY);
                            nlapiLogExecution( 'DEBUG', 'Successfully deleted subscriptions:', subsToDelete.length );
                            nlapiLogExecution( 'DEBUG', 'From Subscription:', invoice );
                        }
                    }
                }, this);

            }
        }
    }, this);
}

function formCreateNetworkSubmit(){
    var networkAdmin = nlapiGetFieldValue('bsn_cnet_network_admin');
    var networkName = nlapiGetFieldValue('bsn_cnet_network_name');
    var activityPeriod = nlapiGetFieldValue('bsn_cnet_activity_period');
    var renewalDate = nlapiGetFieldValue('bsn_cnet_renewal_date');
    //console.log(networkAdmin);

    if( isNullorEmpty( networkAdmin ) ) return alert( 'Please enter Network Admin Email!' );
    if( isNullorEmpty( networkName ) ) return alert( 'Please enter Network Name!' );
    if( isNullorEmpty( activityPeriod ) ) {
        return alert( 'Please select subscription Activity Period!' );
    } else {
        switch( activityPeriod ){
            case '1': activityPeriod = 'P30D'; break;
            case '2': activityPeriod = 'P90D'; break;
            case '3': activityPeriod = 'P365D'; break;
            case '4': activityPeriod = 'P730D'; break;
            case '5': activityPeriod = 'P1095D'; break;
            default: return alert( 'Invalid Activity Period!' );
        }
    }
    if( isNullorEmpty( renewalDate ) ) {
        return alert( 'Please enter Network Subscriptions Renewal Date!' );
    }

    var result = soapCreateNetwork( networkAdmin, networkName, activityPeriod, getSOAPTime( nlapiStringToDate(renewalDate) ) );

    if( isNullorEmpty( result.Name ) ){
        showAlertBox('error_network_not_created', 'Error Creating BSN Network', result, NLAlertDialog.TYPE_HIGH_PRIORITY);
    } else {
        showAlertBox('success_network_created', 'Network Created', 'You successfully created BSN Network "' + result.Name + '".', NLAlertDialog.TYPE_LOWEST_PRIORITY);
        jQuery('#div__body').append(buttonStart + '<input type="button" value="Close & Use this Network" onclick="window.parent.bsnFillNetworksList(\'' + networkAdmin + '\');var selectNetwork = window.parent.document.getElementById(\'bsn_getname_select_network\');selectNetwork.value = \'' + result.Id + '\';var win=window.parent.Ext.getCmp(\'createNetworkForm\');if(win)win[win.closeAction]();" class="rndbuttoninpt bntBgT">' + buttonEnd);
    }
}

function bsnFillNetworksList( networkAdmin ){
    if( !isNullorEmpty( networkAdmin ) ){
        var networks = soapGetNetworksByCustomerEmail( networkAdmin );
        jQuery('#bsn_getname_select_network').html('<option value=""></option>');
        if( isArray( networks ) ){
            for (var i = 0; i < networks.length; i++){
                jQuery('#bsn_getname_select_network').append('<option value="' + networks[i][0] + '">' + networks[i][1] + '</option>');
            }
        } else {
            console.log( networks );
        }
    }
}

function formUpdateNetworkSubmit(){
    var networkId = nlapiGetFieldValue('bsn_upd_network_name');
    var activityPeriod = nlapiGetFieldValue('bsn_upd_activity_period');
    var renewalDate = nlapiGetFieldValue('bsn_upd_renewal_date');
    if( !isNullorEmpty(networkId) && !isNullorEmpty(renewalDate) && !isNullorEmpty(activityPeriod) ){
        var networkInfo = soapUpdateNetworkBillingMode( networkId, activityPeriod, renewalDate );
    }
}

function bsnUseSelectedNetwork(){
    var networkId = nlapiGetFieldValue("bsn_getname_select_network");
    var networkAdmin = nlapiGetFieldValue("bsn_getname_network_admin");
    var activityPeriod = nlapiGetFieldValue("bsn_getname_activity_period");
    var renewalDate = nlapiGetFieldValue("bsn_getname_renewal_date");

    if( isValEmpty(networkAdmin) ){
        alert( "Network Admin Empty!" );
        return;
    }

    if( isNullorEmpty( networkId ) ){
        var suitelet = nlapiResolveURL('SUITELET', 'customscript_bsn_sl_create_network', 'customdeploy_bsn_sl_create_network');
        suitelet += '&bsn_email=' + networkAdmin;
        suitelet += '&bsn_activity_period=' + activityPeriod;
        suitelet += '&bsn_renewal_date=' + renewalDate;

        var param = '';
        popupHelperWindow(this, suitelet, 'createNetworkForm', 490, 350, param);
        return false;
    }

    window.parent.nlapiSetLineItemValue('item', "custcol_bsn_network_info", jQuery("#bsn_getname_linenum").val(), 'Name:' + jQuery("#bsn_getname_select_network option:selected").text() +
        '{{ID:' + jQuery("#bsn_getname_select_network option:selected").val() + '}}');
    var win=window.parent.Ext.getCmp('getNetworkName');
    if(win)win[win.closeAction]();
}

function bsnNormalizeUseNetwork(){
    var networkId = nlapiGetFieldValue("bsn_getname_select_network");
    var networkAdmin = nlapiGetFieldValue("bsn_getname_network_admin");
    var activityPeriod = nlapiGetFieldValue("bsn_getname_activity_period");
    var renewalDate = nlapiGetFieldValue("bsn_getname_renewal_date");

    if( isValEmpty(networkAdmin) ){
        alert( "Network Admin Empty!" );
        return;
    }

    var networkId = jQuery("#bsn_getname_select_network option:selected").val();
    if( isNullorEmpty( networkId ) ){
        Ext.MessageBox.alert('Select Network', 'Please, select a network first!');

    }else{
        var networkInfo = soapGetNetworkById( networkId );

        console.log(networkInfo);

        if( !isNullorEmpty(networkInfo.SubscriptionsActivityPeriod) && !isNullorEmpty(networkInfo.SubscriptionsRenewalDate)){
            var contractPeriod = ['P1D','P30D','P90D','P365D','P730D','P1095D'];
            var periodName = ['1 Day','1 Month','3 Months','1 Year','2 Years','3 Years'];
            if( contractPeriod.indexOf(networkInfo.SubscriptionsActivityPeriod) == -1 ){
                Ext.MessageBox.alert('Select Network', 'Network has wrong Activity Period set!<br>Should be one of:<br>1 Month, 3 Months, 1 Year, 2 Years, 3 years');
            }else if(contractPeriod.indexOf(networkInfo.SubscriptionsActivityPeriod) != activityPeriod){
                Ext.MessageBox.alert('Select Network', 'This Network has different Activity Period than your Items.<br>Your Period: ' + periodName[activityPeriod] + '<br>Network Period: ' + periodName[contractPeriod.indexOf(networkInfo.SubscriptionsActivityPeriod)] + '<br>Use another Network or change Items first!');
            }else{
                //Ext.MessageBox.alert('Select Network', networkInfo.SubscriptionsRenewalDate);
                //console.log(networkInfo.SubscriptionsRenewalDate);
                var endDate = parseSOAPDate( networkInfo.SubscriptionsRenewalDate );
                endDate = moment(endDate).format('M/D/YYYY');
                console.log(endDate);
                window.parent.normalizeSubSO( endDate );

                var win=window.parent.Ext.getCmp('getNetworkName');
                if(win)win[win.closeAction]();
            }
        }else{
            Ext.MessageBox.alert('Select Network', 'Network is of a wrong type.<br>You should convert this network first!');
        }
    }
}

function bsnNormalizeTestNetwork(){
    var networkId = nlapiGetFieldValue("bsn_getname_select_network");
    var networkAdmin = nlapiGetFieldValue("bsn_getname_network_admin");
    var activityPeriod = nlapiGetFieldValue("bsn_getname_activity_period");
    var startDate = nlapiGetFieldValue("bsn_getname_start_date");
    var renewalDate = nlapiGetFieldValue("bsn_getname_renewal_date");

    if( isValEmpty(networkAdmin) ){
        alert( "Network Admin Empty!" );
        return;
    }

    var networkId = jQuery("#bsn_getname_select_network option:selected").val();
    if( isNullorEmpty( networkId ) ){
        Ext.MessageBox.alert('Select Network', 'Please, select a network first!');

    }else{
        var networkInfo = soapGetNetworkById( networkId );

        console.log(networkInfo);

        if( !isNullorEmpty(networkInfo.SubscriptionsActivityPeriod) && !isNullorEmpty(networkInfo.SubscriptionsRenewalDate)){
            var contractPeriod = ['P1D','P30D','P90D','P365D','P730D','P1095D'];
            var periodName = ['1 Day','1 Month','3 Months','1 Year','2 Years','3 Years'];
            if( contractPeriod.indexOf(networkInfo.SubscriptionsActivityPeriod) == -1 ){
                Ext.MessageBox.alert('Select Network', 'Network has wrong Activity Period set!<br>Should be one of:<br>1 Month, 3 Months, 1 Year, 2 Years, 3 years');
            }else if(contractPeriod.indexOf(networkInfo.SubscriptionsActivityPeriod) != activityPeriod){
                Ext.MessageBox.alert('Select Network', 'This Network has different Activity Period than your Items.<br>Your Period: ' + periodName[activityPeriod] + '<br>Network Period: ' + periodName[contractPeriod.indexOf(networkInfo.SubscriptionsActivityPeriod)] + '<br>Use another Network or change Items first!');
            }else{
                var endDate = parseSOAPDate( networkInfo.SubscriptionsRenewalDate );
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

function soapGetNetworksByCustomerEmail( customerEmail ){
    nlapiLogExecution('DEBUG', ' ' , '===================== Get Network By Customer Email ========================');
    nlapiLogExecution('DEBUG', 'customerEmail ' , customerEmail);

    var res = {error:"Get Networks by Email not started", networks:[]};
    if( isNullorEmpty(customerEmail) ){
        res.error = "Network Admin Email Empty. Cannot search for Networks.";
        return res;
    }

    try{
        var findMore = false;
        var nextMarker = 0;
        var users = [];
        var networks = [];
        //var selected = nlapiGetFieldValue("bsn_default_network");
        var selected = nlapiGetFieldValue("bs_default_network");
        do{
            var soap = bsnGetSOAPHeader();
            soap += '<soapenv:Body>';
            soap += '<soap:FindUsers>';
            soap += '<soap:namePattern>' + customerEmail + '</soap:namePattern>';
            soap += '<soap:marker>' + nextMarker + '</soap:marker>';
            soap += '<soap:pageSize>100</soap:pageSize>';
            soap += '</soap:FindUsers>';
            soap += '</soapenv:Body>';
            soap += '</soapenv:Envelope>';

            console.log(soap);
            var soapHeaders = bsnSOAPHeaders( 'FindUsers' );
            console.log(soapHeaders);
            var requestServer = nlapiRequestURL(soapHeaders["endPoint"], soap, soapHeaders);
            nlapiLogExecution('DEBUG', 'requestServer ' , requestServer.getBody());
            console.log(requestServer.getBody());
            var soapResponse = nlapiStringToXML(requestServer.getBody());
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
                        users[users.length++] = bsnParseUserInfo( rawUsers[i] );
                        var netId = nlapiSelectValue(rawUsers[i], "b:Network/b:Id");
                        networks.push([nlapiSelectValue(rawUsers[i], "b:Network/b:Id"), nlapiSelectValue(rawUsers[i], "b:Network/b:Name"), netId == selected || (noDefaultNetwork && !i) ? "selected" : ""]);
                    }
                }
            } else {
                //alert(nlapiSelectValue(errorCode[0], "faultcode") + ': ' + nlapiSelectValue(errorCode[0], "faultstring"));
                //console.log(nlapiSelectValue(errorCode[0], "faultcode") + ': ' + nlapiSelectValue(errorCode[0], "faultstring"));
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
        console.log( e.message );
        res.error = "BSN.com " + e.message;
    }

    return res;
}

function soapCreateDeviceSubscriptions( subscriptions ){
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
            var usage = nlapiGetContext().getRemainingUsage();
            nlapiLogExecution('DEBUG', 'usage ' , usage);
            var timeStamp = getSOAPTime();
            var soap = bsnGetSOAPHeader();
            soap += '<soapenv:Body xmlns:bsn="BSN.WebServices.Admin.DTO.2018.09" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">';
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
            nlapiLogExecution('DEBUG', 'soap ' , soap);
            //console.log(soap);

            var soapHeaders = bsnSOAPHeaders( 'CreateDeviceSubscriptions' );
            nlapiLogExecution('DEBUG', 'soapHeaders ' , JSON.stringify(soapHeaders));
            //console.log(soapHeaders);
            var requestServer = nlapiRequestURL(soapHeaders["endPoint"], soap, soapHeaders);
            var soapResponse = nlapiStringToXML(requestServer.getBody());
            //console.log(requestServer.getBody());
            nlapiLogExecution('DEBUG', 'requestServer ' , requestServer.getBody());
            var errorCode = nlapiSelectNodes( soapResponse, "//s:Fault" );
            if( typeof( errorCode ) == "undefined" || !errorCode.length ){
                var createdSubs = nlapiSelectNodes( soapResponse, "//a:DeviceSubscription" );
                for (var i = 0; i < createdSubs.length ; i++){
                    newSubscriptions.push( bsnParseSubscriptionInfo( createdSubs[i], "a:" ) );
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

function soapDeleteDeviceSubscriptions( subscriptionIds, invoiceNum ){
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
            var soap = bsnGetSOAPHeader();
            soap += '<soapenv:Body xmlns:bsn="BSN.WebServices.Admin.DTO.2018.09" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">';
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

            var soapHeaders = bsnSOAPHeaders( 'DeleteDeviceSubscriptions' );
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

function soapGetDeviceSubscriptions( filter, sort ){
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
            var soap = bsnGetSOAPHeader();
            soap += '<soapenv:Body xmlns:bsn="BSN.WebServices.Admin.DTO.2018.09" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">';
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

            var soapHeaders = bsnSOAPHeaders( 'GetDeviceSubscriptions' );
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
                        subscriptions[subscriptions.length++] = bsnParseSubscriptionInfo( rawSubscriptions[i], "b:" );
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

function soapNetworkSubscriptionsCount( networkId, invoiceArr ){
    nlapiLogExecution('DEBUG', ' ' , '===================== Network Subscriptions Count ========================');
    nlapiLogExecution('DEBUG', 'networkId ' , networkId);
    nlapiLogExecution('DEBUG', 'invoice ' , invoiceArr);

    var errorMessage = "";

    if( isNullorEmpty(networkId) ){
        errorMessage = "Error: Network ID is Empty";
    }

    var addInvoice = "";
    if( !isNullorEmpty( invoiceArr ) && Array.isArray(invoiceArr) ){
        addInvoice = " AND ([DeviceSubscription].[InvoiceNumber] IS IN ('" + invoiceArr.join("','") + "'))";
    }

    if( errorMessage == "" ) {
        try {
            var soap = bsnGetSOAPHeader();
            soap += '<soapenv:Body xmlns:bsn="BSN.WebServices.Admin.DTO.2018.09" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">';
            soap += '<soap:GetDeviceSubscriptions>';
            soap += "<soap:filter>[DeviceSubscription].[Network].[Id] IS " + networkId + " AND [DeviceSubscription].[Type] IS NOT 'Grace'" + addInvoice + "</soap:filter>";
            soap += "<soap:sort>[DeviceSubscription].[Id] ASC</soap:sort>";
            soap += '<soap:marker i:nil="true"/>';
            soap += "<soap:pageSize>1</soap:pageSize>";
            soap += '</soap:GetDeviceSubscriptions>';
            soap += '</soapenv:Body>';
            soap += '</soapenv:Envelope>';

            var soapHeaders = bsnSOAPHeaders('GetDeviceSubscriptions');
            var requestServer = nlapiRequestURL(soapHeaders["endPoint"], soap, soapHeaders);
            var soapResponse = nlapiStringToXML(requestServer.getBody());
            //console.log(requestServer.getBody());
            nlapiLogExecution('DEBUG', 'requestServer ', requestServer.getBody());
            var errorCode = nlapiSelectNodes(soapResponse, "//s:Fault");
            if (typeof (errorCode) == "undefined" || !errorCode.length) {
                var resultNodes = nlapiSelectNode(soapResponse, "/s:Envelope/s:Body/GetDeviceSubscriptionsResponse");
                var resultsCount = nlapiSelectValue(soapResponse, "//a:MatchingItemCount");
                nlapiLogExecution('DEBUG', 'resultsCount ' , resultsCount);
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
    nlapiLogExecution('DEBUG', 'countResult ' , errorMessage);
    return {'error': true, 'message': errorMessage, quantity: 0};
}

function soapCreateUser( networkAdmin, networkId, password ){
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
            var soap = bsnGetSOAPHeader();
            soap += '<soapenv:Body xmlns:bsn="BSN.WebServices.Admin.DTO.2018.09">';
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

            var soapHeaders = bsnSOAPHeaders( 'CreateUser' );
            console.log(soapHeaders);
            var requestServer = nlapiRequestURL(soapHeaders["endPoint"], soap, soapHeaders);
            var soapResponse = nlapiStringToXML(requestServer.getBody());
            console.log(requestServer.getBody());
            nlapiLogExecution('DEBUG', 'requestServer ' , requestServer.getBody());
            var errorCode = nlapiSelectNodes( soapResponse, "//s:Fault" );
            if( typeof( errorCode ) == "undefined" || !errorCode.length ){
                var resultsId = nlapiSelectValue(soapResponse, "//a:Id");
                if( resultsId && resultsId != "0" ){
                    return bsnParseNetworkUserInfo( soapResponse );
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
    return new bsnNetworkAdmin( { 'IsError': true, 'Message': errorMessage } );
}

function soapCreateNetwork( networkAdmin, networkName, activityPeriod, renewalDate ){
    nlapiLogExecution('DEBUG', ' ' , '===================== Create Network ========================');
    nlapiLogExecution('DEBUG', 'networkAdmin ' , networkAdmin);
    nlapiLogExecution('DEBUG', 'networkName ' , networkName);
    nlapiLogExecution('DEBUG', 'activityPeriod ' , activityPeriod);
    nlapiLogExecution('DEBUG', 'renewalDate ' , renewalDate);

    var errorMessage = "";

    if( isNullorEmpty(networkName) ){
        errorMessage += "Error: NetworkName is Empty<br>";
    }

    if( isNullorEmpty(networkAdmin) ){
        errorMessage += "Error: Admin Email is Empty<br>";
    }

    if( isNullorEmpty(activityPeriod) ){
        errorMessage += "Error: activityPeriod is Empty<br>";
    }

    if( isNullorEmpty(renewalDate) ){
        errorMessage += "Error: renewalDate is Empty<br>";
    }

    if( errorMessage == "" ){
        try{
            var soap = bsnGetSOAPHeader();
            soap += '<soapenv:Body xmlns:bsn="BSN.WebServices.Admin.DTO.2018.09">';
            soap += '<soap:CreateNetwork>';
            soap += '<soap:network xmlns:i="http://www.w3.org/2001/XMLSchema-instance">';
            soap += '<bsn:BillingMode i:type="bsn:ExternalNetworkBillingMode">';
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
            soap += '<bsn:AutomaticSubscriptionsManagementEnabled>true</bsn:AutomaticSubscriptionsManagementEnabled>';
            soap += '<bsn:AutomaticTaggedPlaylistApprovementEnabled>false</bsn:AutomaticTaggedPlaylistApprovementEnabled>';
            soap += '<bsn:BrightAuthorAccessRestricted>false</bsn:BrightAuthorAccessRestricted>';
            soap += '<bsn:WebUIAccessRestricted>false</bsn:WebUIAccessRestricted>';
            soap += '</bsn:Settings>';
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
            console.log(soap);

            var soapHeaders = bsnSOAPHeaders( 'CreateNetwork' );
            console.log(soapHeaders);
            var requestServer = nlapiRequestURL(soapHeaders["endPoint"], soap, soapHeaders);
            var soapResponse = nlapiStringToXML(requestServer.getBody());
            console.log(requestServer.getBody());
            nlapiLogExecution('DEBUG', 'requestServer ' , requestServer.getBody());
            var errorCode = nlapiSelectNodes( soapResponse, "//s:Fault" );
            if( typeof( errorCode ) == "undefined" || !errorCode.length ){
                var resultsId = nlapiSelectValue(soapResponse, "//a:Id");
                if( resultsId && resultsId != "0" ){
                    return bsnParseNetworkInfo( soapResponse );
                } else {
                    errorMessage = "Network was not created. Please contact your administrator.";
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
    return new bsnNetwork( { 'IsError': true, 'Message': errorMessage } );
}

function soapUpdateNetworkBillingMode( networkId, activityPeriod, renewalDate ){
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
        var soap = bsnGetSOAPHeader();
        soap += '<soapenv:Body xmlns:bsn="BSN.WebServices.Admin.DTO.2018.09" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">';
        soap += '<soap:UpdateNetworkBillingMode xmlns="https://api.brightsignnetwork.com/Admin/2018/09/SOAP/">';
        soap += '<soap:networkId>' + networkId + '</soap:networkId>';
        soap += '<soap:billingMode i:type="bsn:ExternalNetworkBillingMode">';
        soap += '<bsn:SubscriptionsActivityPeriod>' + activityPeriod + '</bsn:SubscriptionsActivityPeriod>';
        soap += '<bsn:SubscriptionsRenewalDate>' + renewalDate + '</bsn:SubscriptionsRenewalDate>';
        soap += '</soap:billingMode>';
        soap += '</soap:UpdateNetworkBillingMode>';
        soap += '</soapenv:Body>';
        soap += '</soapenv:Envelope>';
        //console.log(soap);
        nlapiLogExecution('DEBUG', 'soap ' , soap);

        var soapHeaders = bsnSOAPHeaders( 'UpdateNetworkBillingMode' );
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

function soapGetNetworkByName( networkName, loadUsers ){
    nlapiLogExecution('DEBUG', ' ' , '===================== Get Network By Name ========================');
    nlapiLogExecution('DEBUG', 'networkName ' , networkName);

    if( isNullorEmpty(networkName) ){
        return new bsnNetwork( { 'IsError': true, 'Message': 'Error: NetworkName is Empty' } );
    }

    var error = "";
    if( isNullorEmpty( loadUsers ) ) loadUsers = false;

    try{
        var soap = bsnGetSOAPHeader();
        soap += '<soapenv:Body>';
        soap += '<soap:GetNetworkByName>';
        soap += '<soap:name>' + networkName + '</soap:name>';
        soap += '<soap:loadUsers>' + loadUsers + '</soap:loadUsers>';
        soap += '</soap:GetNetworkByName>';
        soap += '</soapenv:Body>';
        soap += '</soapenv:Envelope>';
        //console.log(soap);

        var soapHeaders = bsnSOAPHeaders( 'GetNetworkByName' );
        //console.log(soapHeaders);
        var requestServer = nlapiRequestURL(soapHeaders["endPoint"], soap, soapHeaders);
        var soapResponse = nlapiStringToXML(requestServer.getBody());
        //console.log(requestServer.getBody());
        nlapiLogExecution('DEBUG', 'requestServer ' , requestServer.getBody());
        var errorCode = nlapiSelectNodes( soapResponse, "//s:Fault" );
        if( typeof( errorCode ) == "undefined" || !errorCode.length ){
            var resultsId = nlapiSelectValue(soapResponse, "//a:Id");
            if( resultsId && resultsId != "0" ){
                return bsnParseNetworkInfo( soapResponse );
            } else {
                return new bsnNetwork( { 'IsError': true, 'Message': 'Network "' + networkName + '" was not found.' } );
            }
        } else {
            //alert(nlapiSelectValue(errorCode[0], "faultcode") + ': ' + nlapiSelectValue(errorCode[0], "faultstring"));
            //console.log(nlapiSelectValue(errorCode[0], "faultcode") + ': ' + nlapiSelectValue(errorCode[0], "faultstring"));
            //return nlapiSelectValue(errorCode[0], "faultcode") + ': ' + nlapiSelectValue(errorCode[0], "faultstring");
            return new bsnNetwork( { 'IsError': true, 'Message': errorCode[0] } );
        }
    }catch(e){
        nlapiLogExecution('DEBUG', 'Exception ', e.message );
        nlapiLogExecution('DEBUG', 'Exception ', e.stack);
        nlapiLogExecution('DEBUG', 'Exception ', e.toString());
        error = e.message;
    }

    return new bsnNetwork( { 'IsError': true, 'Message': error } );
}


function soapGetNetworkById( networkId, loadUsers ){
    nlapiLogExecution('DEBUG', ' ' , '===================== Get Network By Id ========================');
    nlapiLogExecution('DEBUG', 'networkId ' , networkId);

    if( isNullorEmpty(networkId) ){
        return new bsnNetwork( { 'IsError': true, 'Message': "Error: NetworkId is Empty" } );
    }

    if( isNullorEmpty( loadUsers ) ) loadUsers = false;

    try{
        var soap = bsnGetSOAPHeader();
        soap += '<soapenv:Body>';
        soap += '<soap:GetNetworkById>';
        soap += '<soap:networkId>' + networkId + '</soap:networkId>';
        soap += '<soap:loadUsers>' + loadUsers + '</soap:loadUsers>';
        soap += '</soap:GetNetworkById>';
        soap += '</soapenv:Body>';
        soap += '</soapenv:Envelope>';
        //console.log(soap);

        var soapHeaders = bsnSOAPHeaders( 'GetNetworkById' );
        //console.log(soapHeaders);
        var requestServer = nlapiRequestURL(soapHeaders["endPoint"], soap, soapHeaders);
        var soapResponse = nlapiStringToXML(requestServer.getBody());
        //console.log(requestServer.getBody());
        nlapiLogExecution('DEBUG', 'requestServer ' , requestServer.getBody());
        var errorCode = nlapiSelectNodes( soapResponse, "//s:Fault" );
        if( typeof( errorCode ) == "undefined" || !errorCode.length ){
            var resultsId = nlapiSelectValue(soapResponse, "//a:Id");
            if( resultsId && resultsId != "0" ){
                return bsnParseNetworkInfo( soapResponse );
            }
        } else {
            return new bsnNetwork( { 'IsError': true, 'Message': errorCode[0] } );
        }
    }catch(e){
        nlapiLogExecution('DEBUG', 'Exception ', e.message );
        nlapiLogExecution('DEBUG', 'Exception ', e.stack);
        nlapiLogExecution('DEBUG', 'Exception ', e.toString());
        return new bsnNetwork( { 'IsError': true, 'Message': e.message } );
    }
    return new bsnNetwork( { 'IsError': true, 'Message': 'No network found with ID ' + networkId } );
}
/*
function bsnGetSOAPHeader(){
    var created = getSOAPTime();
    var wsse = {
        /****** Stage ********
         'SOAP': 'https://api.brightsignnetwork.com/Admin/2018/09/SOAP/',
         'Username' : 'admin/nsadmin@brightsign.biz',
         'Password' : 'admin',
         'Nonce' : nlapiEncrypt(created + "some secrets are to be kept", "base64"),
         'Created' : created,
         'UsernameToken' : nlapiEncrypt(created + "some users are to be created", "base64")
         /**********************/
        /****** Dev ********
        'SOAP': 'https://api.brightsignnetwork.com/Admin/2018/09/SOAP/',
        'Username' : 'admin/order_2@test.lab',
        'Password' : 'P@ssw0rd',
        'Nonce' : nlapiEncrypt(created + "some secrets are to be kept", "base64"),
        'Created' : created,
        'UsernameToken' : nlapiEncrypt(created + "some users are to be created", "base64")
        /**********************
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
*/
function bsnParseUserInfo( soapResponse ){
    var args = {
        "CreationDate" : nlapiSelectValue(soapResponse, "b:CreationDate"),
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

    return new bsnUser( args );
}

function bsnParseSubscriptionInfo( soapResponse, prefix ){
    var args = {
        "ActivationDate" : nlapiSelectValue(soapResponse, prefix + "ActivationDate"),
        "ActivityPeriod" : nlapiSelectValue(soapResponse, prefix + "ActivityPeriod"),
        "CreationDate" : nlapiSelectValue(soapResponse, prefix + "CreationDate"),
        "DeviceId" : nlapiSelectValue(soapResponse, prefix + "Device/" + prefix + "Id"),
        "DeviceSerial" : nlapiSelectValue(soapResponse, prefix + "Device/" + prefix + "Serial"),
        "ExpirationDate" : nlapiSelectValue(soapResponse, prefix + "ExpirationDate"),
        "Id" : nlapiSelectValue(soapResponse, prefix + "Id"),
        "InvoiceNumber" : nlapiSelectValue(soapResponse, prefix + "InvoiceNumber"),
        "IsDeleted" : nlapiSelectValue(soapResponse, prefix + "IsDeleted"),
        "KeyId" : nlapiSelectValue(soapResponse, prefix + "KeyId"),
        "NetworkId" : nlapiSelectValue(soapResponse, prefix + "Network/" + prefix + "Id"),
        "NetworkName" : nlapiSelectValue(soapResponse, prefix + "Network/" + prefix + "Name"),
        "RenewalMethod" : nlapiSelectValue(soapResponse, prefix + "RenewalMethod"),
        "Status" : nlapiSelectValue(soapResponse, prefix + "Status"),
        "SuspensionDate" : nlapiSelectValue(soapResponse, prefix + "SuspensionDate"),
        "Traffic" : nlapiSelectValue(soapResponse, prefix + "Traffic"),
        "Type" : nlapiSelectValue(soapResponse, prefix + "Type")
    };

    return new bsnSubscription( args );
}

function bsnParseNetworkInfo( soapResponse ){
    var args = {
        "SubscriptionsActivityPeriod" : nlapiSelectValue(soapResponse, "//a:BillingMode/a:SubscriptionsActivityPeriod"),
        "SubscriptionsRenewalDate" : nlapiSelectValue(soapResponse, "//a:BillingMode/a:SubscriptionsRenewalDate"),
        "CreationDate" : nlapiSelectValue(soapResponse, "//a:CreationDate"),
        "Id" : nlapiSelectValue(soapResponse, "//a:Id"),
        "IsLockedOut" : nlapiSelectValue(soapResponse, "//a:IsLockedOut"),
        "LastLockoutDate" : nlapiSelectValue(soapResponse, "//a:LastLockoutDate"),
        "LockoutDate" : nlapiSelectValue(soapResponse, "//a:LockoutDate"),
        "Name" : nlapiSelectValue(soapResponse, "//a:Name"),
        "AutomaticSubscriptionsManagementEnabled" : nlapiSelectValue(soapResponse, "//a:Settings/a:AutomaticSubscriptionsManagementEnabled"),
        "AutomaticTaggedPlaylistApprovementEnabled" : nlapiSelectValue(soapResponse, "//a:Settings/a:AutomaticTaggedPlaylistApprovementEnabled"),
        "BrightAuthorAccessRestricted" : nlapiSelectValue(soapResponse, "//a:Settings/a:BrightAuthorAccessRestricted"),
        "WebUIAccessRestricted" : nlapiSelectValue(soapResponse, "//a:Settings/a:WebUIAccessRestricted"),
        "SetupCompletionDate" : nlapiSelectValue(soapResponse, "//a:SetupCompletionDate")
    };

    if( args.LastLockoutDate ) args.LastLockoutDate = args.LastLockoutDate.substr(0, 10);

    var netAdmin = [];
    var CreationDate = nlapiSelectNodes( soapResponse, "//a:User/a:CreationDate" );
    var Login = nlapiSelectNodes( soapResponse, "//a:User/a:Login" );
    var Id = nlapiSelectNodes( soapResponse, "//a:User/a:Id" );
    var IsLockedOut = nlapiSelectNodes( soapResponse, "//a:User/a:IsLockedOut" );
    var RoleName = nlapiSelectNodes( soapResponse, "//a:User/a:RoleName" );
    for (i = 0; i < Login.length ; i++){
        var role = RoleName[i].firstChild ? RoleName[i].firstChild.nodeValue : RoleName[i].firstChild;
        var locked = IsLockedOut[i].firstChild ? IsLockedOut[i].firstChild.nodeValue : IsLockedOut[i].firstChild;
        if( role == "Administrators" && locked == 'false' ) {
            netAdmin[netAdmin.length] = bsnParseNetworkAdminInfo({
                "CreationDate": CreationDate[i].firstChild ? CreationDate[i].firstChild.nodeValue : CreationDate[i].firstChild,
                "Login": Login[i].firstChild ? Login[i].firstChild.nodeValue : Login[i].firstChild,
                "Id": Id[i].firstChild ? Id[i].firstChild.nodeValue : Id[i].firstChild,
                "IsLockedOut": locked,
                "RoleName": role
            });
        }
    }

    if( netAdmin.length ){
        args.NetworkAdministrators = netAdmin;
    }

    return new bsnNetwork( args );
}

function bsnParseNetworkAdminInfo( args ){
    return new bsnNetworkAdmin( args );
}

function bsnParseNetworkUserInfo( soapResponse ){
    var args = {
        "CreationDate": nlapiSelectValue( soapResponse, "//a:CreationDate" ),
        "Login": nlapiSelectValue( soapResponse, "//a:Login" ),
        "Id": nlapiSelectValue( soapResponse, "//a:Id" ),
        "IsLockedOut": nlapiSelectValue( soapResponse, "//a:IsLockedOut" ),
        "RoleName": nlapiSelectValue( soapResponse, "//a:RoleName" )
    };

    return new bsnNetworkAdmin( args );
}
/****** Stage ********
 function bsnSOAPHeaders( method ){
	var soapHeaders = new Array();
	soapHeaders['Host'] = 'ast.brightsignnetwork.com';
	soapHeaders['Content-Type'] = 'text/xml; charset=utf-8';
	soapHeaders['SOAPAction'] = 'https://api.brightsignnetwork.com/Admin/2018/09/SOAP/AdminService/' + method;
	soapHeaders['endPoint'] = 'https://ast.brightsignnetwork.com/Admin/2018/09/SOAP/Basic/';
	return soapHeaders;
}
 /**********************/
/****** Dev ********
function bsnSOAPHeaders( method ){
    var soapHeaders = new Array();
    soapHeaders['Host'] = 'development.brightsignnetwork.com';
    soapHeaders['Content-Type'] = 'text/xml; charset=utf-8';
    soapHeaders['SOAPAction'] = 'https://api.brightsignnetwork.com/Admin/2018/09/SOAP/AdminService/' + method;
    soapHeaders['endPoint'] = 'https://api.development.brightsignnetwork.com/Admin/2018/09/SOAP/Basic/';
    return soapHeaders;
}
/**********************/

function getSOAPTime( dateToConvert, noZ ){
    var now = '';
    if( isNullorEmpty(dateToConvert) ){
        now = new Date();
    } else {
        now = new Date(dateToConvert);
    }

    if( !(noZ === true) ){
        noZ = false;
    }

    return now.getFullYear() + '-' +('0' + (now.getMonth()+1)).slice(-2)+ '-' +  ('0' + (now.getDate())).slice(-2) + 'T'+('0' + (now.getHours())).slice(-2)+ ':'+('0' + (now.getMinutes())).slice(-2)+ ':'+('0' + (now.getSeconds())).slice(-2)+ '.'+ ('00' + (now.getMilliseconds())).slice(-3)+ (noZ?'':'Z');
}

function parseSOAPDate( dateSOAP ){
    var dateNS = false;
    if( typeof( dateSOAP ) != "undefined" && dateSOAP.length > 9 ){
        var dateNS = new Date( dateSOAP.slice(0,4), dateSOAP.slice(5,7) - 1, dateSOAP.slice(8,10) );
    }
    return dateNS;
}

function bsnUser( args ) {
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

function bsnNetwork( args ) {
    this.IsError = args['IsError'] || false;
    this.Message = args['Message'];
    this.SubscriptionsActivityPeriod = args['SubscriptionsActivityPeriod'];
    this.SubscriptionsRenewalDate = args['SubscriptionsRenewalDate'];
    this.Id = args['Id'];
    this.IsLockedOut = args['IsLockedOut'];
    this.LastLockoutDate = args['LastLockoutDate'];
    this.LockoutDate = args['LockoutDate'];
    this.Name = args['Name'];
    this.AutomaticSubscriptionsManagementEnabled = args['AutomaticSubscriptionsManagementEnabled'];
    this.AutomaticTaggedPlaylistApprovementEnabled = args['AutomaticTaggedPlaylistApprovementEnabled'];
    this.BrightAuthorAccessRestricted = args['BrightAuthorAccessRestricted'];
    this.WebUIAccessRestricted = args['WebUIAccessRestricted'];
    this.SetupCompletionDate = args['SetupCompletionDate'];
    this.NetworkAdministrators = args['NetworkAdministrators'];
}

function bsnSubscription( args ) {
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

function bsnNetworkAdmin( args ) {
    this.IsError = args['IsError'] || false;
    this.Message = args['Message'];
    this.CreationDate = args['CreationDate'];
    this.Login = args['Login'];
    this.Id = args['Id'];
    this.IsLockedOut = args['IsLockedOut'];
    this.RoleName = args['RoleName'];
}

function bsnGetPriceLevels( itemId ){
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
    for(var i = 1; i <= 15 /*Price List Size*/; i++){
        if(i == 1){
            prices[i] = searchresults[0].getValue('baseprice');
        } else {
            prices[i] = searchresults[0].getValue('price' + i);
        }
    }

    return prices;
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

function closeAndUpdateCreateNetwork( networkId ){
    window.parent.soapGetNetworksByCustomerId();
    var selectNetwork = window.parent.getElementById('bs_select_network');
    selectNetwork.value = networkId;
    var win=window.parent.Ext.getCmp('createNetworkForm');
    if(win)win[win.closeAction]();
}

function popupHelperWindow(owner, baseUrl, windowName, width, height, additionalParams) {
    var url = baseUrl;
    /*url += '?bin=F';
    url += '&tobin=F';
    url += '&frombin=F';
    url += '&binreq=T';
    url += '&tobinreq=F';
    url += '&isserial=T';
    url += '&item=' + nlapiGetFieldValue('item');
    url += '&location=' + nlapiGetFieldValue('location');*/
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

function bsnRevRecEndDate( revRecStartDate, endDate, months ){
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




























function bsnDelSubsFillSOList( networkId ){
    var subs = Array();
    var invoiceStats = Array();
    var networkInfo = null;
    var networkSubscriptions = [];
    jQuery('#bsn_delsubs_results_log_fs').text('');
    jQuery('#custpage_netinfo_fs').text('');
    console.log("=================networkId=================\n" + networkId);
    if( networkId != '' ){
        var filter = "[DeviceSubscription].[Network].[Id] IS " + networkId + " AND [DeviceSubscription].[Type] IS NOT 'Grace'";
        console.log("=================filter=================\n" + filter);
        networkSubscriptions = [];
        var getSubscriptions = soapGetDeviceSubscriptions( filter );
        if( isNullorEmpty(getSubscriptions.error) ){
            networkSubscriptions = getSubscriptions.subscriptions;
        } else {
            console.log("=================getSubscriptions Error=================\n" + getSubscriptions.error);
        }
        nlapiSetFieldValue("bs_default_network", ""); // Reset hidden default network
        console.log("=================networkSubscriptions=================\n" + networkSubscriptions);
        networkInfo = soapGetNetworkById( networkId );
    }

    for( var i = 0; i < networkSubscriptions.length; i++ ){
        var delta = 2; // 2 months
        var period = bsnGetPeriodBySOAP( networkSubscriptions[i].ActivityPeriod );

        //console.log("=================!isNullorEmpty( networkSubscriptions[i].ActivationDate )=================\n" + !isNullorEmpty( networkSubscriptions[i].ActivationDate ));
        //console.log("=================networkSubscriptions[i].ActivationDate=================\n" + networkSubscriptions[i].ActivationDate);
        //console.log("=================networkSubscriptions[i].CreationDate=================\n" + networkSubscriptions[i].CreationDate);
        var startDate = parseSOAPDate( !isNullorEmpty( networkSubscriptions[i].ActivationDate ) ? networkSubscriptions[i].ActivationDate : networkSubscriptions[i].CreationDate );
        var expDate = new Date();
        if( typeof(networkInfo.SubscriptionsRenewalDate) == "undefined" ){
            //console.log("=================networkSubscriptions[i].ExpirationDate=================\n" + networkSubscriptions[i].ExpirationDate);
            expDate = bsnGetExpirationDate( startDate, parseSOAPDate(networkSubscriptions[i].ExpirationDate || false), period.num );
        } else {
            expDate = moment( parseSOAPDate( networkInfo.SubscriptionsRenewalDate ) ).subtract( 1, 'd' ).toDate();
        }

        var sub = {
            'id': networkSubscriptions[i].Id,
            'invoice': networkSubscriptions[i].InvoiceNumber || "",
            'deviceId': networkSubscriptions[i].DeviceId || "",
            'deviceSerial': networkSubscriptions[i].DeviceSerial || "",
            'period': period.num ? period.num : "other",
            'creation': parseSOAPDate( networkSubscriptions[i].CreationDate ),
            'activation': parseSOAPDate( networkSubscriptions[i].ActivationDate || "" ),
            'start': startDate,
            'end': expDate
        };

        subs.push( sub );
    }

    console.log("=================networkSubscriptions.length=================\n" + networkSubscriptions.length);
    if( !networkSubscriptions.length ) {
        //jQuery('#bsn_addsubs_results_log_fs').text('Nothing Found......');
    }

    if( subs.length ){ jQuery('#custpage_results_log_fs').append( "<h6><br>Active Subs (" + subs.length + ")</h6>" ); }
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
            console.log("=================networkInfo=================\n" + JSON.stringify(networkInfo));
            var nInfo = '<br><b>NETWORK INFO</b><br>';
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
        }
    }

    jQuery('#bsn_delsubs_network_so').html('<option value=""></option>');
    invoiceStats.sort(function(a,b){if(a.invoice < b.invoice)return -1;if(a.invoice > b.invoice)return 1;return 0});
    for( i = 0; i< invoiceStats.length; i++ ){
        jQuery('#bsn_delsubs_network_so').append('<option value="' + invoiceStats[i].invoice + '">' + 'SO-' + invoiceStats[i].invoice + '</option>');
    }
}

function bsnAddSubsFillSOList( networkId ){
    var subs = Array();
    var invoiceStats = Array();
    var networkInfo = null;
    var networkSubscriptions = [];
    jQuery('#bsn_addsubs_results_log_fs').text('');
    jQuery('#custpage_netinfo_fs').text('');
    console.log("=================networkId=================\n" + networkId);
    if( networkId != '' ){
        var filter = "[DeviceSubscription].[Network].[Id] IS " + networkId + " AND [DeviceSubscription].[Type] IS NOT 'Grace'";
        console.log("=================filter=================\n" + filter);
        networkSubscriptions = [];
        var getSubscriptions = soapGetDeviceSubscriptions( filter );
        if( isNullorEmpty(getSubscriptions.error) ){
            networkSubscriptions = getSubscriptions.subscriptions;
        } else {
            console.log("=================getSubscriptions Error=================\n" + getSubscriptions.error);
        }
        nlapiSetFieldValue("bs_default_network", ""); // Reset hidden default network
        console.log("=================networkSubscriptions=================\n" + networkSubscriptions);
        networkInfo = soapGetNetworkById( networkId );
    }

    for( var i = 0; i < networkSubscriptions.length; i++ ){
        var delta = 2; // 2 months
        var period = bsnGetPeriodBySOAP( networkSubscriptions[i].ActivityPeriod );

        //console.log("=================!isNullorEmpty( networkSubscriptions[i].ActivationDate )=================\n" + !isNullorEmpty( networkSubscriptions[i].ActivationDate ));
        //console.log("=================networkSubscriptions[i].ActivationDate=================\n" + networkSubscriptions[i].ActivationDate);
        //console.log("=================networkSubscriptions[i].CreationDate=================\n" + networkSubscriptions[i].CreationDate);
        var startDate = parseSOAPDate( !isNullorEmpty( networkSubscriptions[i].ActivationDate ) ? networkSubscriptions[i].ActivationDate : networkSubscriptions[i].CreationDate );
        var expDate = new Date();
        if( typeof(networkInfo.SubscriptionsRenewalDate) == "undefined" ){
            //console.log("=================networkSubscriptions[i].ExpirationDate=================\n" + networkSubscriptions[i].ExpirationDate);
            expDate = bsnGetExpirationDate( startDate, parseSOAPDate(networkSubscriptions[i].ExpirationDate || false), period.num );
        } else {
            expDate = moment( parseSOAPDate( networkInfo.SubscriptionsRenewalDate ) ).subtract( 1, 'd' ).toDate();
        }

        var sub = {
            'id': networkSubscriptions[i].Id,
            'invoice': networkSubscriptions[i].InvoiceNumber || "",
            'deviceId': networkSubscriptions[i].DeviceId || "",
            'deviceSerial': networkSubscriptions[i].DeviceSerial || "",
            'period': period.num ? period.num : "other",
            'creation': parseSOAPDate( networkSubscriptions[i].CreationDate ),
            'activation': parseSOAPDate( networkSubscriptions[i].ActivationDate || "" ),
            'start': startDate,
            'end': expDate
        };
        if( bsnIsSubRelevant( sub, delta ) ){
            subs.push( sub );
        }
    }

    console.log("=================networkSubscriptions.length=================\n" + networkSubscriptions.length);
    if( !networkSubscriptions.length ) {
        //jQuery('#bsn_addsubs_results_log_fs').text('Nothing Found......');
    }

    if( subs.length ){ jQuery('#custpage_results_log_fs').append( "<h6><br>Active Subs (" + subs.length + ")</h6>" ); }
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
            console.log("=================networkInfo=================\n" + JSON.stringify(networkInfo));
            var nInfo = '<br><b>NETWORK INFO</b><br>';
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
        }
    }

    jQuery('#bsn_addsubs_network_so').html('<option value=""></option>');
    invoiceStats.sort(function(a,b){if(a.invoice < b.invoice)return -1;if(a.invoice > b.invoice)return 1;return 0});
    for( i = 0; i< invoiceStats.length; i++ ){
        //var usage = nlapiGetContext().getRemainingUsage();
        //console.log('usage = ' + usage);
        jQuery('#bsn_addsubs_network_so').append('<option value="' + 'SO-' + invoiceStats[i].invoice + '">' + 'SO-' + invoiceStats[i].invoice + '</option>');
    }

    if( invoiceStats.length ){
        jQuery('#bsn_addsubs_results_log_fs').html(bsnPrepareNetworkHTML( invoiceStats.length ));
    }
}

function bsnAddSubsGetSOData(){
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

function bsnParseCustomerEmail( description ){
    var lines = description.split('\n');
    for( var k = 0; k < lines.length; k++ ){
        if( lines[k].match(/^Customer Email:/i) ){
            var email = lines[k].match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
            if( !isNullorEmpty( email ) && email.length && !isNullorEmpty( email[0] ) ){
                return email[0].trim();
            }
        }
    }
    return '';
}

function bsGetContractByTranid( tranid ){
    var additionalFilters = new Array();
    additionalFilters[0] = new nlobjSearchFilter('tranid', null, 'is', tranid);
    var columns = new Array();
    columns[0] = new nlobjSearchColumn( 'custbody_swe_contract_id_hidden' );
    var searchresults = nlapiSearchRecord('salesorder', null, additionalFilters, columns);
    if( searchresults != null ){
        var soId = searchresults[0].getId();
        var contractId = searchresults[0].getValue( 'custbody_swe_contract_id_hidden' );
        if( !isNullorEmpty( contractId ) ){
            additionalFilters[0] = new nlobjSearchFilter('custrecord_ci_contract_id', null, 'is', contractId);
            columns[0] = new nlobjSearchColumn( 'custrecord_ci_contract_id' );
            searchresults = nlapiSearchRecord('customrecord_contract_item', null, additionalFilters, columns);
            if( searchresults != null ){
                return searchresults[0].getId();
            }
        }
    }

    return -1;
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

function bsnGetPeriodById( periodId ){
    var period = {"id" : "3", "itemId" : 706, "itemSubId" : 595, "num" : 12, "soap" : "P365D", "s" : "s", "name" : "1 Year"};
    switch( periodId ){
        case '1': period = {"id" : "1", "itemId" : 705, "itemSubId" : 598, "num" : 1, "soap" : "P30D", "s" : "", "name" : "Monthly"}; break;
        case '2': period = {"id" : "2", "itemId" : 704, "itemSubId" : 599, "num" : 3, "soap" : "P90D", "s" : "s", "name" : "Quarterly"}; break;
        case '3': period = {"id" : "3", "itemId" : 706, "itemSubId" : 595, "num" : 12, "soap" : "P365D", "s" : "s", "name" : "1 Year"}; break;
        /*case '4': period = {"id" : "4", "itemId" : 447, "itemSubId" : 600, "num" : 24, "soap" : "P730D", "s" : "s", "name" : "2 Years"}; break;
        case '5': period = {"id" : "5", "itemId" : 450, "itemSubId" : 601, "num" : 36, "soap" : "P1095D", "s" : "s", "name" : "3 Years"}; break;*/
        default: break;
    }

    return period;
}

function bsnGetPeriodBySOAP( soapPeriod ){
    var period = bsnGetPeriodById( '3' );
    switch( soapPeriod ){
        case 'P30D': period = bsnGetPeriodById( '1' ); break;
        case 'P90D': period = bsnGetPeriodById( '2' ); break;
        case 'P365D': period = bsnGetPeriodById( '3' ); break;
        /*case 'P730D': period = bsnGetPeriodById( '4' ); break;
        case 'P1095D': period = bsnGetPeriodById( '5' ); break;*/
        default: break;
    }

    return period;
}

function bsAddMonths( currentDate, num ){
    //console.log("=================num=================\n" + num);
    //console.log("=================currentDate=================\n" + currentDate);
    currentDate = moment(currentDate);
    //console.log("=================currentDate=================\n" + currentDate.toDate());
    var futureMonth = moment(currentDate).add(parseInt(num), 'M');
    //console.log("=================futureMonth=================\n" + futureMonth.toDate());
    var futureMonthEnd = moment(futureMonth).endOf('month');
    //console.log("=================futureMonthEnd=================\n" + futureMonthEnd.toDate());

    if(currentDate.date() != futureMonth.date() && futureMonth.isSame(futureMonthEnd.format('YYYY-MM-DD'))) {
        futureMonth = futureMonth.add(1, 'd');
    }
    //console.log("=================futureMonth.toDate()=================\n" + futureMonth.toDate());
    return futureMonth.toDate()
}

function bsnGetExpirationDate( StartDate, ExpirationDate, num ){
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

function bsnIsSubRelevant( sub, delta ){
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

function bsnGetCustomPricing( customer, itemId ){
    console.log(itemId);
    var contracts = ['598','599','595','600','601'];
    if( contracts.indexOf( '' + itemId ) != -1 ) {
        var lineItemCount = customer.getLineItemCount("itempricing");
        for (var i = 1; i <= lineItemCount; i++) {
            var curItem = customer.getLineItemValue('itempricing', 'item', i);
            console.log("curItem="+curItem);
            console.log("itemId="+itemId);
            console.log(curItem == itemId);
            if ( curItem == itemId ) {
                var curPrice = 0;
                var priceLevel = customer.getLineItemValue('itempricing', 'level', i);
                if (priceLevel == "-1") {
                    curPrice = customer.getLineItemValue('itempricing', 'price', i);
                }
                return {success: true, level: priceLevel, price: curPrice};
            }
        }
    }
    return { success: false };
}

function bsAddSubsFillSubscriptionListBSN( networkId ){
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
        networkSubscriptions = [];
        var getSubscriptions = soapGetDeviceSubscriptions( filter );
        if( isNullorEmpty(getSubscriptions.error) ){
            networkSubscriptions = getSubscriptions.subscriptions;
        } else {
            console.log("=================getSubscriptions Error=================\n" + getSubscriptions.error);
        }
        //nlapiSetFieldValue("bs_default_network", ""); // Reset hidden default network
        console.log("=================networkSubscriptions=================\n" + networkSubscriptions);
        networkInfo = soapGetNetworkById( networkId );
    }

    for( var i = 0; i < networkSubscriptions.length; i++ ){
        var delta = 2; // 2 months
        var period = bsnGetPeriodBySOAP( networkSubscriptions[i].ActivityPeriod );

        //console.log("=================!isNullorEmpty( networkSubscriptions[i].ActivationDate )=================\n" + !isNullorEmpty( networkSubscriptions[i].ActivationDate ));
        //console.log("=================networkSubscriptions[i].ActivationDate=================\n" + networkSubscriptions[i].ActivationDate);
        //console.log("=================networkSubscriptions[i].CreationDate=================\n" + networkSubscriptions[i].CreationDate);
        var startDate = parseSOAPDate( !isNullorEmpty( networkSubscriptions[i].ActivationDate ) ? networkSubscriptions[i].ActivationDate : networkSubscriptions[i].CreationDate );
        var expDate = new Date();
        if( typeof(networkInfo.SubscriptionsRenewalDate) == "undefined" ){
            //console.log("=================networkSubscriptions[i].ExpirationDate=================\n" + networkSubscriptions[i].ExpirationDate);
            expDate = bsncGetExpirationDate( startDate, parseSOAPDate(networkSubscriptions[i].ExpirationDate || false), period.num );
        } else {
            expDate = moment( parseSOAPDate( networkInfo.SubscriptionsRenewalDate ) ).subtract( 1, 'd' ).toDate();
        }

        var sub = {
            'id': networkSubscriptions[i].Id,
            'invoice': networkSubscriptions[i].InvoiceNumber || "",
            'deviceId': networkSubscriptions[i].DeviceId || "",
            'deviceSerial': networkSubscriptions[i].DeviceSerial || "",
            'period': period.num ? period.num : "other",
            'creation': parseSOAPDate( networkSubscriptions[i].CreationDate ),
            'activation': parseSOAPDate( networkSubscriptions[i].ActivationDate || "" ),
            'start': startDate,
            'end': expDate
        };
        if( bsnIsSubRelevant( sub, delta ) ){
            subs.push( sub );
        }
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
            var count = soapNetworkSubscriptionsCount( networkInfo.Id );
            if( isNullorEmpty( count.error ) ){
                networkInfo.quantity = count.quantity;
            } else {
                bsnMessage( "BSN Request", count.message, 'error' );
                networkInfo.quantity = 0;
            }
            jQuery('#custpage_netinfo_fs').html(printNetworkInfoBSN(networkInfo));
        }
    }
    if( invoiceStats.length ){
        jQuery('#bsnc_addsubs_results_log_fs').html(bsnPrepareNetworkHTML( invoiceStats.length ));
    }
}