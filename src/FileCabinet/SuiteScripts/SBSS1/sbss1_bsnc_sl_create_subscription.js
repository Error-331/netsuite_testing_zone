/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       09 Sep 2020     Eugene Karakovsky
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function createSubscription(request, response){
    if ( request.getMethod() == 'GET' ){
        var customer = request.getParameter('bsnc_customer');
        var endUser = request.getParameter('bsnc_enduser');
        var adminEmail = request.getParameter('bsnc_email');
        var activityPeriod = request.getParameter('bsnc_activity_period') || 3;
        var renewalDate = request.getParameter('bsnc_renewal_date');
        var startDate = request.getParameter('bsnc_start_date');
        var anniversaryDate = request.getParameter('bsnc_anniversary_date');
        var subsCount = request.getParameter('bsnc_subs_count');
        var price = request.getParameter('bsnc_price');
        var billing = request.getParameter('bsnc_billing');
        var pricebk = request.getParameter('bsnc_pricebk');
        var network = request.getParameter('bsnc_network');

        var form = nlapiCreateForm('BSN.cloud Create Subscription');
        //var field = form.addField('bs_network_name','text', 'Network Name');
        var customerField = form.addField('bsnc_createsub_customer', 'select', 'Customer', '-2');
        customerField.setLayoutType('normal', 'startcol');
        customerField.setDefaultValue(customer);
        customerField.setMandatory(true);
        var endUserField = form.addField('bsnc_createsub_enduser', 'select', 'End User', '-2');
        endUserField.setDefaultValue(endUser);
        endUserField.setMandatory(true);
        var purchaserEmail = form.addField('bsnc_createsub_purchaser_email','email', 'Purchaser Email (Network Admin)');
        purchaserEmail.setDefaultValue(adminEmail);
        purchaserEmail.setMandatory(true);
        var resellerEmail = form.addField('bsnc_createsub_reseller_email','email', 'Reseller Email');
        resellerEmail.setDisplayType('hidden');
        var billingAccount = form.addField('bsnc_createsub_billing', 'select', 'Billing Account');
        billingAccount.setMandatory(true);
        var billingAccountOptions = billingAccountsCustomer( customer );
        for( i = 0; i < billingAccountOptions.length; i++ ){
            billingAccount.addSelectOption(billingAccountOptions[i].id, billingAccountOptions[i].name, billingAccountOptions[i].selected);
        }
        //billingAccount.setDefaultValue(billing);
        var priceBook = form.addField('bsnc_createsub_pricebook', 'select', 'Price Book');
        priceBook.setMandatory(true);
        var priceBookOptions = priceBooksByCustomerTier( customer, sbBSNSettings.bsn1yrPlanNum/*'806'*/ );
        for( i = 0; i < priceBookOptions.length; i++ ){
            priceBook.addSelectOption(priceBookOptions[i].id, priceBookOptions[i].name, priceBookOptions[i].selected);
        }
        //priceBook.setDefaultValue(pricebk);
        var startDateField = form.addField('bsnc_createsub_start_date','date', 'Start Date');
        startDateField.setDefaultValue(startDate);
        startDateField.setMandatory(true);
        var anniversaryDateField = form.addField('bsnc_createsub_anniversary_date','date', 'Anniversary Date');
        anniversaryDateField.setDefaultValue(anniversaryDate);
        anniversaryDateField.setMandatory(true);
        anniversaryDateField.setDisabled(true);
        var periodField = form.addField('bsnc_createsub_activity_period','select', 'Activity Period', 'customlist_bsn_activity_period');
        periodField.setDefaultValue(activityPeriod);
        periodField.setMandatory(true);
        periodField.setDisplayType('hidden');
        var countField = form.addField('bsnc_createsub_count','text', 'BSN Subscriptions Count');
        countField.setDefaultValue(subsCount);
        countField.setMandatory(true);
        var priceField = form.addField('bsnc_createsub_price','text', 'Customer Price for 1 Sub');
        priceField.setDefaultValue(price);
        priceField.setMandatory(true);
        priceField.setDisabled(true);
        var customPriceField = form.addField('bsnc_createsub_custom_price','checkbox', 'Custom Price');
        customPriceField.setMandatory(true);
        var customerPriceField = form.addField('bsnc_createsub_cphandler','inlinehtml', 'Customer Price');
        customerPriceField.setDefaultValue('<input type="hidden" value="" name="bsnc_createsub_customer_price" id="bsnc_createsub_customer_price">');
        var selectField = form.addField('custpage_selectfield', 'inlinehtml', 'Network');
        var onchange = 'this.isvalid=(nlapiValidateField(null,\'bsnc_createsub_select_network\'));if (!this.isvalid) return false;if(!this.noslaving) { setWindowChanged(window, true); }if (Syncbsnc_createsub_activity_period(true,null,null,null,null,null) == false) return false;if (getEventTarget(event)==this)this.focus();nlapiFieldChanged(null,\'bsnc_createsub_select_network\');';
        selectField.setDefaultValue('<label for="bsnc_createsub_select_network">NETWORK NAME</label><br><select id="bsnc_createsub_select_network" name="bsnc_createsub_select_network" onchange="' + onchange + '"><option value=""></option></select>' +
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
                    'var em =   "' + adminEmail + '";' +
                    'var net =  "' + network + '";' +
                    'var cus =  "' + customer + '";' +
                    'var eu =   "' + endUser + '";' +
                    'var bill = "' + billing + '";' +
                    'nlapiSetFieldValue( "bs_onload", "yes" );' +
                    'if( !isNullorEmpty(em) && em != "null" ){' +
                        'console.log("email: " + em);' +
                        'console.log("net: " + net);' +
                        'setWindowChanged(window, true); nlapiFieldChanged(null,"bsnc_createsub_purchaser_email");' +
                        'if( !isNullorEmpty(net) && net != "null" ){setWindowChanged(window, true);nlapiFieldChanged(null,"bsnc_createsub_select_network");}' +
                    '}' +
                    'if( !isNullorEmpty(cus) && cus != "null" ){' +
                        'console.log("customer: " + cus);' +
                        'setWindowChanged(window, true);nlapiFieldChanged(null,"bsnc_createsub_customer");' +
                    '}' +
                    'if( !isNullorEmpty(eu) && eu != "null" ){' +
                        'console.log("enduser: " + eu);' +
                        'setWindowChanged(window, true);nlapiFieldChanged(null,"bsnc_createsub_enduser");' +
                    '}' +
                    'if( !isNullorEmpty(bill) && bill != "null" ){' +
                        'console.log("billing: " + bill);' +
                        'setWindowChanged(window, true);nlapiFieldChanged(null,"bsnc_createsub_billing");' +
                    '}' +
                    'nlapiSetFieldValue( "bs_onload", "" );' +
                    'jQuery(".loader-overlay").fadeOut(1000);' +
                '}, 1000);'+
            '});' +
            '</script>');

        var defaultNetwork = form.addField('bs_default_network', 'text', 'Default Network');
        defaultNetwork.setDefaultValue(network);
        defaultNetwork.setDisplayType('hidden');
        var onLoad = form.addField('bs_onload', 'text', 'OnLoad');
        onLoad.setDefaultValue('');
        onLoad.setDisplayType('hidden');
        form.addField('bsnc_createsub_results_log','inlinehtml', 'Result');
        var netLog = form.addField('custpage_netinfo','inlinehtml', 'Network Info');
        netLog.setLayoutType('normal', 'startcol');
        form.addField('custpage_subscription_info','inlinehtml', 'Subscription Info');
        form.setScript('customscript_sbbsnc_soap');
        form.addButton('bsnc_createsub_review_numbers', 'Calculate Difference', "bsncCreateSubscriptionReviewNumbers();");
        form.addButton('bsnc_createsub_button', 'Generate Subscriptions', "bsncFormCreateSubscriptionSubmit();");

        //form.addSubmitButton('Submit');

        response.writePage( form );
    }
    else
        console.log("request: " + request +", response: " + response);
}

function isNullorEmpty(strVal){
    return (strVal == null || strVal == '');
}

function billingAccountsCustomer( customer ){
    var billingAccountOptions = [];
    if(customer){
        //var cusRec = nlapiLoadRecord('customer', customer);
        //billingAccountField = cusRec.getField();
        var cusBillingAccounts = nlapiSearchRecord('billingaccount', -62, [new nlobjSearchFilter('customer', null, 'anyof', customer)]);
        if(!isNullorEmpty(cusBillingAccounts)){
            for( var i = 0; i < cusBillingAccounts.length; i++ ){
                var isDefault = cusBillingAccounts[i].getValue('customerdefault') == 'T';
                var defaultText = isDefault ? ' default' : '';
                var option = {
                    'id': parseInt(cusBillingAccounts[i].getId()),
                    'name': cusBillingAccounts[i].getValue('name') + ' (' + cusBillingAccounts[i].getValue("nextbillcycledate") + ')' + defaultText,
                    'selected': isDefault
                };
                billingAccountOptions.push(option);
            }
            billingAccountOptions.sort(function(a,b){if(a.id < b.id)return -1;if(a.id > b.id)return 1;return 0});
        }
    }
    return billingAccountOptions;
}

function priceBookByCustomerTier( customer, plan ){
    var priceBook = false;
    if( !isNullorEmpty( customer ) ){
        var customerTier = nlapiLookupField( 'customer', customer, 'pricelevel' );
        if( isNullorEmpty( customerTier ) ){
            customerTier = '12'; //MSRP
        }
        if( !isNullorEmpty( plan ) ){
            var priceBooks = priceBooksForPlan( plan );
            for( var i = 0; i < priceBooks.length; i++ ){
                if( customerTier == priceBooks[i].pricelevel ){
                    priceBook = priceBooks[i];
                }
            }
        }
    }
    return priceBook;
}

function priceBooksByCustomerTier( customer, plan ){
    var priceBooks = [];
    if( !isNullorEmpty( customer ) ){
        var customerTier = nlapiLookupField( 'customer', customer, 'pricelevel' );
        if( isNullorEmpty( customerTier ) ){
            customerTier = '12'; //MSRP
        }
        if( !isNullorEmpty( plan ) ){
            priceBooks = priceBooksForPlan( plan );
            for( var i = 0; i < priceBooks.length; i++ ){
                if( customerTier == priceBooks[i].pricelevel ){
                    priceBooks[i].selected = true;
                }
            }
        }
    }
    return priceBooks;
}

function priceBooksForPlan( plan ){
    if( !isNullorEmpty( plan ) ){
        var priceBooks = [];
        var searchPriceBooks = nlapiSearchRecord( 'pricebook', null, [['subscriptionplan', 'is', plan]] );
        if( !isNullorEmpty( searchPriceBooks ) ){
            for( var i = 0; i < searchPriceBooks.length; i++ ){
                var price = '';
                var pbId = searchPriceBooks[i].getId();
                var pbRecord = nlapiLoadRecord('pricebook', searchPriceBooks[i].getId());
                var lineItemCount = pbRecord.getLineItemCount('priceinterval');
                if( lineItemCount ){
                    //var regex = new re("(?<=Above 0: \$)[1-9.]*", "gm");
                    var rawprice = pbRecord.getLineItemValue( 'priceinterval', 'price', 1 );
                    //rawprice = rawprice.match(regex);
                    var split = rawprice.split("$");
                    if( split.length > 1 ) price = parseFloat(split[1]);
                }
                priceBooks.push({'id': pbId, 'name': pbRecord.getFieldValue('name') + ' $' + price, 'pricelevel': pbRecord.getFieldValue('custrecord_sb_pb_price_level'), 'price': price, 'selected': false});
            }
        }
        return priceBooks;
    }
}