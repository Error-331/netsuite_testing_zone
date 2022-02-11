/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       25 Dec 2020     Eugene Karakovsky
 *
 */
//replaceSalesRep('scheduled');
/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduledSubscriptionTakeover(type) {
    var sub = null;
    try{
        var subID = nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_subid');
        var isTakeOver = nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_takeover');
        //var netType = nlapiGetContext().getSetting('SCRIPT', 'custscript_sb_bsnc_nettype');
        var usage = null;
        var today = nlapiDateToString(new Date());
        nlapiLogExecution("DEBUG", "subID", subID);
        nlapiLogExecution("DEBUG", "today", today);
        sub = nlapiLoadRecord('subscription', subID);
        var customer = sub.getFieldValue( 'customer' );
        var endUser = sub.getFieldValue( 'custrecord_bsn_sub_end_user' );
        var save = true;
        var newSub = {error:'', subID:0, coId:0};

        if( endUser != '' && customer != endUser ){
            newSub = bsnCreateTOSubscription( subID );
            nlapiLogExecution('DEBUG', 'newSub ', JSON.stringify(newSub) );
            if( newSub.error ){
                save = false;
                throw nlapiCreateError('ERROR', newSub.error, true);
            }
        } else {
            throw nlapiCreateError('Subscription Take Over','Unfortunately, take over cannot be processed. Wrong End User.', true);
        }

        if( save ) {
            sub.setFieldValue('custrecord_bs_takeover_processed', today);
            sub.setFieldValue('custrecord_bs_last_error', '');
            sub.setFieldValue('custrecord_sb_transitioned_to_co', newSub.coId);
            sub.setFieldValue('custrecord_sb_transitioned_to_sub', newSub.subId);
            sub.setFieldValue('defaultrenewalmethod', '');
            sub.setFieldValue('autorenewal', 'F');
            sub.setFieldValue('custrecord_bsn_script_suppress_renewal', 'T');
            nlapiSubmitRecord(sub);
            nlapiLogExecution('DEBUG', 'Take Over Processed ', subID );
        }

    }catch(e){
        if( !isNullorEmpty( sub ) ){
            //sub.setFieldValue('custrecord_bs_last_error', today);
            //nlapiSubmitRecord( sub );
        }
        nlapiLogExecution('DEBUG', 'Exception ', e.message );
        nlapiLogExecution('DEBUG', 'Exception ', e.stack);
        nlapiLogExecution('DEBUG', 'Exception ', e.toString());
    }
}

function bsnCreateTOSubscription( subId ){
    var sub = nlapiLoadRecord( 'subscription', subId );
    var args = {
        customer: sub.getFieldValue('customer'),
        endUser: sub.getFieldValue('custrecord_bsn_sub_end_user'),
        activationDate: '',
        endDate: '',
        anniversaryDate: '',
        activityPeriod: '3',
        subsCount: 0,
        networkName: sub.getFieldValue( 'custrecord_sub_network_id' ),
        sourceSub: subId,
        targetSub: '',
        netType: netTypeCloud,
        timeCredit: round_float_to_n_places(sub.getFieldValue('custrecord_bsn_time_credit'), 2),
        /*resellerEmail: sub.resellerEmail,
        customerPrice: sub.customerPrice,
        customPriceCheck: sub.customPriceCheck,
        po: sub.po,
        */
        billingAccount: ''
    };
    nlapiLogExecution( 'DEBUG', 'Time Credit', args.timeCredit );

    if( !isNullorEmpty( args.endUser ) && args.endUser != args.customer ){
        var prevStart = sub.getFieldValue( 'startdate' );

        args.anniversaryDate = nlapiDateToString(moment(nlapiStringToDate(prevStart)).add(1, 'y').toDate());
        args.activationDate = args.anniversaryDate;

        /****** Find Billing Account *****/
        var accounts = bsncGetBillingAccountsByCustomer( args.endUser );
        nlapiLogExecution( 'DEBUG', 'args.anniversaryDate', args.anniversaryDate );
        for( var i = 0; i < accounts.length; i++ ){
            nlapiLogExecution( 'DEBUG', 'accounts[i].baName', accounts[i].baName );
            nlapiLogExecution( 'DEBUG', 'isBillingAccountEligible( accounts[i].baId, args.anniversaryDate )', isBillingAccountEligible( accounts[i].baId, args.anniversaryDate ) );
            if( isBillingAccountEligible( accounts[i].baId, args.anniversaryDate ) ){
                nlapiLogExecution( 'DEBUG', 'Selected accounts[i].baName', accounts[i].baName );
                args.billingAccount = accounts[i].baId;
                break;
            }
        }

        if( isNullorEmpty(args.billingAccount) ){
            /* todo: check account creation */
            args.billingAccount = bsnCreateBillingAccount( args.endUser, args.anniversaryDate );
        }

        var changeOrder = changeOrdersBySubId( subId );
        args.subsCount = changeOrder.quantity;

        var netType = sub.getFieldValue( 'custrecord_bsn_type' );
        if( netType == netTypeCom ) args.netType = netTypeCom;

        var newSub = {};
        var subs = bsncCustomerSubscriptionsByNet( args.endUser, args.networkName );
        if( !subs.length ){
            newSub = bsnCreateSBSubscription( args );
            if( newSub.error != '' ){
                sub.setFieldValue( 'custrecord_bs_last_error', newSub.error );
                nlapiSubmitRecord( sub );
            }
        } else {
            args.targetSub = subs[0].subsId;
            newSub = bsnUpdateSBSubscription( args );
        }
        return newSub;

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
    var sourceSub = nlapiGetRecordId();
    var timeCredit = nlapiGetFieldValue('custrecord_bsn_time_credit');
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
        sourceSub = args.sourceSub;
        timeCredit = args.timeCredit;
        //po = args.po;
    }

    var convertItemId = networkType == netTypeCom ? sbBSNSettings.bsn1yrItemText : sbBSNSettings.bsnc1yrItemText;
    var months = 12;

    if (isNullorEmpty(customer)){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please select a Customer!' );
        //throw nlapiCreateError('Subscription Take Over','ERROR: Please select a Customer!', true);
        return {error:'ERROR: Please select a Customer!', subId:0, coId:0};
    }
    if (isNullorEmpty(billingAccount)){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please select a Billing Account!' );
        //throw nlapiCreateError('Subscription Take Over','ERROR: Please select a Billing Account!', true);
        return {error:'ERROR: Please select a Billing Account!', subId:0, coId:0};
    }
    if (isNullorEmpty(adminEmail)){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please enter Network Admin Email!' );
        //throw nlapiCreateError('Subscription Take Over','ERROR: Please enter Network Admin Email!', true);
        return {error:'ERROR: Please enter Network Admin Email!', subId:0, coId:0};
    }
    if (isNullorEmpty(activityPeriod)) {
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Invalid Activity Period!' );
        //throw nlapiCreateError('Subscription Take Over','ERROR: Invalid Activity Period!', true);
        return {error:'ERROR: Invalid Activity Period!', subId:0, coId:0};
    } else {
        switch (activityPeriod) {
            case '3':
                activityPeriod = 'P365D';
                convertItemId = networkType == netTypeCom ? sbBSNSettings.bsn1yrItemText : sbBSNSettings.bsnc1yrItemText;
                months = 12;
                break;
            default:
                nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Invalid Activity Period!' );
                //throw nlapiCreateError('Subscription Take Over','ERROR: Invalid Activity Period!', true);
                return {error:'ERROR: Invalid Activity Period!', subId:0, coId:0};
        }
    }
    if (isNullorEmpty(activationDate)){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please enter Subscriptions Activation Date!' );
        //throw nlapiCreateError('Subscription Take Over','ERROR: Please enter Subscriptions Activation Date!', true);
        return {error:'ERROR: Please enter Subscriptions Activation Date!', subId:0, coId:0};
    }
    if (isNullorEmpty(anniversaryDate)){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please enter Subscriptions Anniversary Date!' );
        //throw nlapiCreateError('Subscription Take Over','ERROR: Please enter Subscriptions Anniversary Date!', true);
        return {error:'ERROR: Please enter Subscriptions Anniversary Date!', subId:0, coId:0};
    }
    if (isNullorEmpty(subsCount)){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please enter Subscriptions Count!' );
        //throw nlapiCreateError('Subscription Take Over','ERROR: Please enter Subscriptions Count!', true);
        return {error:'ERROR: Please enter Subscriptions Count!', subId:0, coId:0};
    }
    /*
    if (isNullorEmpty(customerPrice)){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please enter Price of 1 Subscription!' );
        throw nlapiCreateError('Subscription Take Over','ERROR: Please enter Price of 1 Subscription!', true);
    }
    */
    if (isNullorEmpty(networkName)){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please select a Network Name!' );
        //throw nlapiCreateError('Subscription Take Over','ERROR: Please select a Network Name!', true);
        return {error:'ERROR: Please select a Network!', subId:0, coId:0};
    }

    //var endDate = nlapiDateToString( moment( nlapiStringToDate( anniversaryDate ) ).subtract( 1, 'd' ).toDate() );
    //var startDate = nlapiDateToString(moment(nlapiStringToDate(anniversaryDate)).subtract(1, 'y').toDate());
    var startDate = anniversaryDate;
    if( isNullorEmpty( endDate ) ) endDate = nlapiDateToString( moment( nlapiStringToDate( startDate ) ).add( 1, 'y' ).subtract( 1, 'd' ).toDate() );

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
        newSub.setFieldValue('defaultrenewalmethod', 'CREATE_NEW_SUBSCRIPTION');
        newSub.setFieldValue('autorenewal', 'T');
        newSub.setFieldValue('custrecord_bsn_script_suppress_renewal', 'F');
        //newSub.setFieldValue("custrecord_bs_subscription_po", po);

        var subParams = {
            subPlan: networkType == netTypeCom ? sbBSNSettings.bsn1yrPlanNum : sbBSNSettings.bsnc1yrPlanNum,
            customerPriceBook: customerPriceBook,
            networkName: networkName,
            networkType: networkType,
            endUser: endUser,
            startDate: startDate,
            endDate: endDate,
            billingAccount: billingAccount
        };
        nlapiLogExecution('DEBUG', 'subscription params', JSON.stringify(subParams));
        try {
            var sub = nlapiSubmitRecord(newSub);
            var subRecord = nlapiLoadRecord('subscription', sub);
            var subLineId = subRecord.getLineItemValue('subscriptionline', 'subscriptionline', 1);
            subRecord.setLineItemValue('priceinterval', 'quantity', 1, subsCount);
            /*** TIME CREDIT ***/
            /*
            if( timeCredit > 0 ) {
                var regex = /\$(.*?)\</;
                var line = subRecord.getLineItemValue('priceinterval', 'price', 1);
                var currentPrice = regex.exec(line);
                currentPrice = round_float_to_n_places( parseFloat( currentPrice[1] ) );
                subRecord.setLineItemValue("priceinterval", "discount", 1, round_float_to_n_places(currentPrice * timeCredit / 12, 2));
            }
            */
            /*******************/
            nlapiSubmitRecord(subRecord);
            nlapiSubmitField('subscriptionline', subLineId, 'subscriptionlinestatus', 'PENDING_ACTIVATION');
            var changeOrder = nlapiCreateRecord('subscriptionchangeorder', {
                'action': 'ACTIVATE',
                'subscription': sub
            });
            changeOrder.setFieldValue('effectivedate', activationDate);
            changeOrder.setFieldValue('requestoffcycleinvoice', 'T');
            changeOrder.setFieldValue('custrecord_sb_source_subscription', sourceSub);
            changeOrder.setLineItemValue('subline', 'apply', 1, 'T');
            var coId = nlapiSubmitRecord(changeOrder);
            //nlapiSubmitField('subscription', sourceSub, 'custrecord_bs_last_error', '')
            //var requestUrl = nlapiResolveURL('Suitelet', 'customscript_sb_bsnc_sl_create_bsn_subs', 'customdeploy_sb_bsnc_sl_create_bsn_subs');
            //var response = nlapiRequestURL(requestUrl + '&sub=' + sub, null, null, null);
            return {error: '', subId: sub, coId:coId};
        } catch(e){
            nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', e.message );
            nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', e.stack );
            //throw nlapiCreateError('Subscription Take Over','Unfortunately, take over cannot be processed.<br>' + e.message, true);
            return {error:e.message, subId:0, coId:0};
        }
    } else {
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Activity Period of Network is different from selected.' );
        //throw nlapiCreateError('Subscription Take Over','ERROR: Activity Period of Network is different from selected.', true);
        return {error:'ERROR: Activity Period of Network is different from selected.', subId:0, coId:0};
    }
}

function bsnUpdateSBSubscription( args ){
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
    var sourceSub = nlapiGetRecordId();
    var targetSub = '';
    var po = nlapiGetFieldValue('bsnc_addsubs_po');
    if( !isNullorEmpty( args ) ) {
        customer = args.customer;
        endUser = args.endUser;
        //purchaserEmail = args.purchaserEmail;
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
        sourceSub = args.sourceSub;
        targetSub = args.targetSub;
        //po = args.po;
    }

    var convertItemId = networkType == netTypeCom ? sbBSNSettings.bsn1yrItemText : sbBSNSettings.bsnc1yrItemText;
    var months = 12;

    var co = changeOrdersBySubId( targetSub );
    curSubsCount = parseInt(co.quantity);
    subsCount += curSubsCount;

    if (isNullorEmpty(customer)){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please select a Customer!' );
        //throw nlapiCreateError('Subscription Take Over','ERROR: Please select a Customer!', true);
        return {error:'ERROR: Please select a Customer!', subId:0, coId:0};
    }
    if (isNullorEmpty(billingAccount)){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please select a Billing Account!' );
        //throw nlapiCreateError('Subscription Take Over','ERROR: Please select a Billing Account!', true);
        return {error:'ERROR: Please select a Billing Account!', subId:0, coId:0};
    }
    if (isNullorEmpty(activityPeriod)) {
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Invalid Activity Period!' );
        //throw nlapiCreateError('Subscription Take Over','ERROR: Invalid Activity Period!', true);
        return {error:'ERROR: Invalid Activity Period!', subId:0, coId:0};
    } else {
        switch (activityPeriod) {
            case '3':
                activityPeriod = 'P365D';
                convertItemId = networkType == netTypeCom ? sbBSNSettings.bsn1yrItemText : sbBSNSettings.bsnc1yrItemText;
                months = 12;
                break;
            default:
                nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Invalid Activity Period!' );
                //throw nlapiCreateError('Subscription Take Over','ERROR: Invalid Activity Period!', true);
                return {error:'ERROR: Invalid Activity Period!', subId:0, coId:0};
        }
    }
    if (isNullorEmpty(activationDate)){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please enter Subscriptions Activation Date!' );
        //throw nlapiCreateError('Subscription Take Over','ERROR: Please enter Subscriptions Activation Date!', true);
        return {error:'ERROR: Please enter Subscriptions Activation Date!', subId:0, coId:0};
    }
    if (isNullorEmpty(anniversaryDate)){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please enter Subscriptions Anniversary Date!' );
        //throw nlapiCreateError('Subscription Take Over','ERROR: Please enter Subscriptions Anniversary Date!', true);
        return {error:'ERROR: Please enter Subscriptions Anniversary Date!', subId:0, coId:0};
    }
    if (isNullorEmpty(subsCount)){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please enter Subscriptions Count!' );
        //throw nlapiCreateError('Subscription Take Over','ERROR: Please enter Subscriptions Count!', true);
        return {error:'ERROR: Please enter Subscriptions Count!', subId:0, coId:0};
    }
    /*
    if (isNullorEmpty(customerPrice)){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please enter Price of 1 Subscription!' );
        throw nlapiCreateError('Subscription Take Over','ERROR: Please enter Price of 1 Subscription!', true);
    }
    */
    if (isNullorEmpty(networkName)){
        nlapiLogExecution( 'ERROR', 'Error Creating BSN.com Subscription Record', 'ERROR: Please select a Network Name!' );
        //throw nlapiCreateError('Subscription Take Over','ERROR: Please select a Network Name!', true);
        return {error:'ERROR: Please select a Network!', subId:0, coId:0};
    }

    //var endDate = nlapiDateToString( moment( nlapiStringToDate( anniversaryDate ) ).subtract( 1, 'd' ).toDate() );
    //var startDate = nlapiDateToString(moment(nlapiStringToDate(anniversaryDate)).subtract(1, 'y').toDate());
    var startDate = anniversaryDate;

    //var revRecStartDate = nlapiDateToString(moment(nlapiStringToDate(startDate)).startOf('month').toDate());
    //var revRecEndDate = bsnRevRecEndDate(moment(nlapiStringToDate(startDate)), endDate, months);

    var networkInfo = {};
    if( networkType == netTypeCom )
        networkInfo = soapGetNetworkById(networkName);
    else
        networkInfo = soapGetNetworkByIdBSNC(networkName);
    nlapiLogExecution( 'DEBUG', 'networkInfo', JSON.stringify(networkInfo) );
    //console.log(networkInfo);

    var netPeriod = networkInfo.SubscriptionsActivityPeriod;

    if (activityPeriod == netPeriod) {
        try {
            var changeOrder = nlapiCreateRecord('subscriptionchangeorder', {
                'action': 'MODIFY_PRICING',
                'subscription': targetSub
            });
            changeOrder.setFieldValue('effectivedate', activationDate);
            changeOrder.setFieldValue('requestoffcycleinvoice', 'T');
            changeOrder.setFieldValue('custrecord_sb_source_subscription', sourceSub);
            changeOrder.setLineItemValue('subline', 'quantitynew', 1, subsCount);
            changeOrder.setLineItemValue('subline', 'apply', 1, 'T');
            var coId = nlapiSubmitRecord(changeOrder);
            //var requestUrl = nlapiResolveURL('Suitelet', 'customscript_sb_bsnc_sl_create_bsn_subs', 'customdeploy_sb_bsnc_sl_create_bsn_subs');
            //var response = nlapiRequestURL(requestUrl + '&sub=' + sub, null, null, null);
            return {error: '', subId: targetSub, coId:coId};
        } catch(e){
            nlapiLogExecution( 'ERROR', 'Error Updating BSN.com Subscription Record', e.message );
            //throw nlapiCreateError('Subscription Take Over','Unfortunately, take over cannot be processed.<br>' + e.message, true);
            return {error:e.message, subId:0, coId:0};
        }
    } else {
        nlapiLogExecution( 'ERROR', 'Error Updating BSN.com Subscription Record', 'ERROR: Activity Period of Network is different from selected.' );
        //throw nlapiCreateError('Subscription Take Over','ERROR: Activity Period of Network is different from selected.', true);
        return {error:'ERROR: Activity Period of Network is different from selected.', subId:0, coId:0};
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
/*
function bsnCreateBillingAccount( customer, startDate ){
    var ba = nlapiCreateRecord( 'billingaccount' );
    ba.setFieldValue('customer', customer);
    ba.setFieldValue('customerdefault', 'T');
    ba.setFieldValue('billingschedule', billingSchedule12mAnniversary);
    ba.setFieldValue('startdate', startDate);
    ba.setFieldValue('subsidiary', 1);
    var newBilling = nlapiSubmitRecord( ba );
    return newBilling;
}
*/
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