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

    var convertItemId = '771';
    var months = 12;

    if( isNullorEmpty( customer ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select a Customer!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( purchaserEmail ) ) return Ext.MessageBox.show({title : 'ERROR', msg : 'Please enter Admin Email!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    if( isNullorEmpty( activityPeriod ) ) {
        return Ext.MessageBox.show({title : 'ERROR', msg : 'Please select subscription Activity Period!', width : 400, buttons : Ext.MessageBox.OK, icon : Ext.MessageBox.ERROR});
    } else {
        switch( activityPeriod ){
            case '1': activityPeriod = 'P30D'; convertItemId = '733'; months = 1; break;
            case '2': activityPeriod = 'P90D'; convertItemId = '732'; months = 3; break;
            case '3': activityPeriod = 'P365D'; convertItemId = '771'; months = 12; break;
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
        case 'P365D': activityPeriod = 12; break;
        default: return console.log("Network has non-standard Activity Period. It must be changed to standard first or use another Network.");
    }

    var startDate = moment(renewalDate);
    var endDate = moment(renewalDate);
    startDate.subtract(activityPeriod, 'months');
    return endDate.diff(startDate, 'days');
}

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