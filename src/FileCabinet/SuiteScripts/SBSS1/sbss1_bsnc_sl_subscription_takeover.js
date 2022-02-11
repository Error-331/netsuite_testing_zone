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
function bsnSubscriptionTakeOver(request, response){
    if ( request.getMethod() == 'GET' ){
        var type = request.getParameter('bsnc_type') || 'cloud';
        var subID = request.getParameter('id');

        var sub = nlapiLoadRecord( 'subscription', subID );
        var customer = sub.getFieldValue( 'customer' );
        var endUser = sub.getFieldValue( 'custrecord_bsn_sub_end_user' );

        if( endUser != '' && customer != endUser ){
            var newSub = bsnCreateTOSubscription( subID );
            nlapiLogExecution('DEBUG', 'newSub ', newSub );
            var html = '<script>window.locations = "/app/accounting/subscription/subscription.nl?id=' + newSub + '&customer=' + customer + '&enduser=' + endUser + '"</script>';

            response.write( html );
        } else {
            throw nlapiCreateError('Subscription Take Over','Unfortunately, take over cannot be processed. Wrong End User.', true);
        }

    }
    else
        console.log("request: " + request +", response: " + response);
}

function bsnCreateTOSubscription( subId ){
    var sub = nlapiLoadRecord( 'subscription', subId );
    var args = {
        customer: sub.getFieldValue('customer'),
        endUser: sub.getFieldValue('custrecord_bsn_sub_end_user'),
        adminEmail: sub.getFieldValue('custrecord_sub_network_admin'),
        activationDate: '',
        endDate: '',
        anniversaryDate: '',
        activityPeriod: '3',
        subsCount: 0,
        networkName: sub.getFieldValue( 'custrecord_sub_network_id' ),
        networkType: sub.getFieldValue( 'custrecord_bsn_type' ),
        /*resellerEmail: sub.resellerEmail,
        customerPrice: sub.customerPrice,
        customPriceCheck: sub.customPriceCheck,
        po: sub.po,
        */
        billingAccount: ''
    };

    if( !isNullorEmpty( args.endUser ) && args.endUser != args.customer ){
        var subs = bsncCustomerSubscriptionsByNet( args.endUser, args.networkName );
        if( !subs.length ){
            var accounts = bsncGetBillingAccountsByCustomer( args.endUser );
            if( accounts.length ){
                for( var i = 0; i < accounts.length; i++ ){
                    if( accounts[i].baCustomerDefault == 'T' ){
                        args.billingAccount = accounts[i].baId;
                    }
                }
            } else {
                /* todo: check account creation */
                args.billingAccount = bsnCreateBillingAccount( args.endUser );
            }

            var prevStart = sub.getFieldValue( 'startdate' );
            //var prevEnd = sub.getFieldValue( 'custrecord_sub_network_id' );
            //var prevStart = sub.getFieldValue( 'custrecord_sub_network_id' );

            args.anniversaryDate = nlapiDateToString(moment(nlapiStringToDate(prevStart)).add(1, 'y').toDate());
            args.activationDate = args.anniversaryDate;

            var changeOrder = changeOrdersBySubId( subId );
            args.subsCount = changeOrder.quantity;

            var newSub = bsnCreateSBSubscription( args );
            return newSub;
        } else {}

        //if(  ){}
    }
}

function bsnCreateSBSubscription( args ){
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
    var customPriceCheck = nlapiGetFieldValue('bsnc_addsubs_custom_price');
    var billingAccount = nlapiGetFieldValue('bsnc_addsubs_billing_account');
    var po = nlapiGetFieldValue('bsnc_addsubs_po');
    if( !isNullorEmpty( args ) ) {
        customer = args.customer;
        endUser = args.endUser;
        adminEmail = args.adminEmail;
        //resellerEmail = args.resellerEmail;
        activationDate = args.activationDate;
        endDate = args.endDate;
        anniversaryDate = args.anniversaryDate;
        activityPeriod = args.activityPeriod;
        subsCount = parseInt(args.subsCount);
        //customerPrice = args.customerPrice;
        networkName = args.networkName;
        networkType = args.netType;
        //customPriceCheck = args.customPriceCheck;
        billingAccount = args.billingAccount;
        //po = args.po;
    }

    var convertItemId = networkType == netTypeCom ? sbBSNSettings.bsn1yrItemText : sbBSNSettings.bsnc1yrItemText;
    var months = 12;

    if (isNullorEmpty(customer)){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please select a Customer!' );
        throw nlapiCreateError('Subscription Take Over','ERROR: Please select a Customer!', true);
    }
    if (isNullorEmpty(billingAccount)){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please select a Billing Account!' );
        throw nlapiCreateError('Subscription Take Over','ERROR: Please select a Billing Account!', true);
    }
    if( isNullorEmpty( adminEmail ) ){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Invalid Activity Period!' );
        throw nlapiCreateError('Subscription Take Over','ERROR: Invalid Activity Period!', true);
    }
    if (isNullorEmpty(activityPeriod)) {
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please enter Network Admin Email!' );
        throw nlapiCreateError('Subscription Take Over','ERROR: Please enter Network Admin Email!', true);
    } else {
        switch (activityPeriod) {
            case '3':
                activityPeriod = 'P365D';
                convertItemId = networkType == netTypeCom ? sbBSNSettings.bsn1yrItemText : sbBSNSettings.bsnc1yrItemText;
                months = 12;
                break;
            default:
                nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Invalid Activity Period!' );
                throw nlapiCreateError('Subscription Take Over','ERROR: Invalid Activity Period!', true);
        }
    }
    if (isNullorEmpty(activationDate)){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please enter Subscriptions Activation Date!' );
        throw nlapiCreateError('Subscription Take Over','ERROR: Please enter Subscriptions Activation Date!', true);
    }
    if (isNullorEmpty(anniversaryDate)){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please enter Subscriptions Anniversary Date!' );
        throw nlapiCreateError('Subscription Take Over','ERROR: Please enter Subscriptions Anniversary Date!', true);
    }
    if (isNullorEmpty(subsCount)){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please enter Subscriptions Count!' );
        throw nlapiCreateError('Subscription Take Over','ERROR: Please enter Subscriptions Count!', true);
    }
    /*
    if (isNullorEmpty(customerPrice)){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please enter Price of 1 Subscription!' );
        throw nlapiCreateError('Subscription Take Over','ERROR: Please enter Price of 1 Subscription!', true);
    }
    */
    if (isNullorEmpty(networkName)){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please select a Network Name!' );
        throw nlapiCreateError('Subscription Take Over','ERROR: Please select a Network Name!', true);
    }

    //var endDate = nlapiDateToString( moment( nlapiStringToDate( anniversaryDate ) ).subtract( 1, 'd' ).toDate() );
    //var startDate = nlapiDateToString(moment(nlapiStringToDate(anniversaryDate)).subtract(1, 'y').toDate());
    var startDate = anniversaryDate;

    //var revRecStartDate = nlapiDateToString(moment(nlapiStringToDate(startDate)).startOf('month').toDate());
    //var revRecEndDate = bsnRevRecEndDate(moment(nlapiStringToDate(startDate)), endDate, months);

    var priceBooks = sbBSNSettings.priceBooks;
    var networkInfo = {};
    if( networkType == netTypeCom ) {
        networkInfo = soapGetNetworkById(networkName);
    } else {
        priceBooks = sbBSNSettings.priceBooksCL;
        networkInfo = soapGetNetworkByIdBSNC(networkName);
    }
    nlapiLogExecution( 'DEBUG', 'networkInfo', JSON.stringify(networkInfo) );
    //console.log(networkInfo);

    var netPeriod = networkInfo.SubscriptionsActivityPeriod;

    if (activityPeriod == netPeriod) {
        //var pricePercentage = getPricePercentage(customerPrice, activityPeriod, startDate, endDate, subsCount);

        //var month = moment().format('MMM').toLowerCase();

        //customerPrice = bsnCustomerPrice( customer, itemId );

        var newSub = nlapiCreateRecord("subscription");
        newSub.setFieldValue("customer", endUser);
        newSub.setFieldValue("custrecord_bsn_sub_end_user", endUser);
        newSub.setFieldValue("custrecord_sub_network_admin", adminEmail);
        newSub.setFieldValue('initialterm', 1);//12 months
        newSub.setFieldValue("startdate", startDate);
        newSub.setFieldValue("enddate", endDate);
        newSub.setFieldValue("billingaccount", billingAccount);


        var customerRecord = nlapiLoadRecord('customer', endUser);
        var customerPriceLevel = customerRecord.getFieldValue('pricelevel');
        var isCustomerSupport = customerRecord.getFieldValue('custentity_bs_support_customer') == 'T';
        var customerPriceBook = search(customerPriceLevel, priceBooks, 'pricelevel');
        if (customerPriceBook == -1) customerPriceBook = networkType == netTypeCom ? bsnGetPriceBookByPriceLevel(netTypeCom, priceLevelMSRP) : bsnGetPriceBookByPriceLevel(netTypeCloud, priceLevelMSRP);
        if (isCustomerSupport) customerPriceBook = networkType == netTypeCom ? bsnGetPriceBookByPriceLevel(netTypeCom, priceLevelSupport) : bsnGetPriceBookByPriceLevel(netTypeCloud, priceLevelSupport);
        //Ext.MessageBox.alert('Subscription Created', 'Price Level: ' + priceBooks[customerPriceBook].pricelevel + '<br>' + 'Price Book: ' + priceBooks[customerPriceBook].pricebook);

        newSub.setFieldValue("subscriptionplan", networkType == netTypeCom ? sbBSNSettings.bsn1yrPlanNum : sbBSNSettings.bsnc1yrPlanNum);
        newSub.setFieldValue("pricebook", customerPriceBook);
        newSub.setFieldValue("custrecord_sub_network_id", networkName);
        newSub.setFieldValue("custrecord_bsn_type", networkType);
        //newSub.setFieldValue("custrecord_bs_subscription_po", po);

        try {
            var sub = nlapiSubmitRecord(newSub);
            var subRecord = nlapiLoadRecord('subscription', sub);
            var subLineId = subRecord.getLineItemValue('subscriptionline', 'subscriptionline', 1);
            subRecord.setLineItemValue('priceinterval', 'quantity', 1, subsCount);
            nlapiSubmitRecord(subRecord);
            nlapiSubmitField('subscriptionline', subLineId, 'subscriptionlinestatus', 'PENDING_ACTIVATION');
            var changeOrder = nlapiCreateRecord('subscriptionchangeorder', {
                'action': 'ACTIVATE',
                'subscription': sub
            });
            changeOrder.setFieldValue('effectivedate', activationDate);
            changeOrder.setFieldValue('requestoffcycleinvoice', 'T');
            changeOrder.setLineItemValue('subline', 'apply', 1, 'T');
            nlapiSubmitRecord(changeOrder);
            //var requestUrl = nlapiResolveURL('Suitelet', 'customscript_sb_bsnc_sl_create_bsn_subs', 'customdeploy_sb_bsnc_sl_create_bsn_subs');
            //var response = nlapiRequestURL(requestUrl + '&sub=' + sub, null, null, null);
            return newSub;
        } catch(e){
            nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', e.message );
            throw nlapiCreateError('Subscription Take Over','Unfortunately, take over cannot be processed.<br>' + e.message, true);
        }
    } else {
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Activity Period of Network is different from selected.' );
        throw nlapiCreateError('Subscription Take Over','ERROR: Activity Period of Network is different from selected.', true);
    }
}

function bsnCustomerPrice( customer, itemId ){
    var newPrice = 0;
    var newPriceLevel = -1;
    if( !isNullorEmpty( customer ) ){
        customerPriceLevel = nlapiLookupField('customer', customer, 'pricelevel');
        var customerPrices = bsncGetPriceLevels( itemId );
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
    }
    return newPrice;
}

function bsncGetBillingAccountsByCustomer( customerId ){
    var accounts = [];
    var additionalFilters = new Array();
    additionalFilters[0] = new nlobjSearchFilter('customer', null, 'is', customerId);
    var columns = new Array();
    columns[0] = new nlobjSearchColumn( 'name' );
    columns[1] = new nlobjSearchColumn( 'customer' );
    columns[2] = new nlobjSearchColumn( 'customerdefault' );
    columns[3] = new nlobjSearchColumn( 'billingschedule' );
    columns[4] = new nlobjSearchColumn( 'frequency' );
    columns[5] = new nlobjSearchColumn( 'startdate' );
    columns[6] = new nlobjSearchColumn( 'class' );
    columns[7] = new nlobjSearchColumn( 'location' );
    columns[8] = new nlobjSearchColumn( 'department' );
    columns[9] = new nlobjSearchColumn( 'inactive' );
    columns[10] = new nlobjSearchColumn( 'nextbillcycledate' );
    columns[11] = new nlobjSearchColumn( 'subsidiary' );
    columns[12] = new nlobjSearchColumn( 'idnumber' );
    var searchresults = nlapiSearchRecord('billingaccount', null, additionalFilters, columns);
    if( searchresults != null ){
        for( var i = 0; i < searchresults.length; i++ ){
            accounts.push( {
                baId: searchresults[i].getId(),
                baNumber: searchresults[i].getValue( 'idnumber' ),
                baName: searchresults[i].getValue( 'name' ),
                baStartDate: searchresults[i].getValue( 'startdate' ),
                baNextBill: searchresults[i].getValue( 'nextbillcycledate' ),
                baCustomer: searchresults[i].getText( 'customer' ),
                baCustomerId: searchresults[i].getValue( 'customer' ),
                baCustomerDefault: searchresults[i].getValue( 'customerdefault' ),
                baInactive: searchresults[i].getText( 'inactive' ),
                baSchedule: searchresults[i].getValue( 'billingschedule' ),
                baFrequency: searchresults[i].getValue( 'frequency' ),
                baClass: searchresults[i].getValue( 'class' ),
                baLocation: searchresults[i].getValue( 'location' ),
                baDepartment: searchresults[i].getValue( 'department' )
            } );
        }
    } else {
    }

    return accounts;
}

function bsncCustomerSubscriptionsByNet( customerId, netId ){
    var bsnNetwork = netId;//nlapiLookupField( 'subscription', subId, 'custrecord_sub_network_id' );
    var subs = [];
    if( !isNullorEmpty( bsnNetwork ) ) {
        var additionalFilters = new Array();
        additionalFilters[0] = new nlobjSearchFilter('customer', null, 'is', customerId);
        additionalFilters[1] = new nlobjSearchFilter('custrecord_sub_network_id', null, 'is', bsnNetwork);
        var columns = new Array();
        columns[0] = new nlobjSearchColumn('name');
        columns[1] = new nlobjSearchColumn('customer');
        columns[2] = new nlobjSearchColumn('billingaccount');
        columns[3] = new nlobjSearchColumn('status');
        columns[4] = new nlobjSearchColumn('subscriptionplan');
        columns[5] = new nlobjSearchColumn('startdate');
        columns[6] = new nlobjSearchColumn('enddate');
        var searchresults = nlapiSearchRecord('subscription', null, additionalFilters, columns);
        if (searchresults != null) {
            for (var i = 0; i < searchresults.length; i++) {
                subs.push({
                    subsId: searchresults[i].getId(),
                    subsName: searchresults[i].getValue('name'),
                    subsStartDate: searchresults[i].getValue('startdate'),
                    subsEndDate: searchresults[i].getValue('enddate'),
                    subsCustomer: searchresults[i].getText('customer'),
                    subsCustomerId: searchresults[i].getValue('customer'),
                    subsBillingAccount: searchresults[i].getValue('billingaccount'),
                    subsStatus: searchresults[i].getText('status'),
                    subsPlan: searchresults[i].getValue('subscriptionplan')
                });
            }
        } else {
        }
    }

    return subs;
}

function isNullorEmpty(strVal){
    return (strVal == null || strVal == '');
}