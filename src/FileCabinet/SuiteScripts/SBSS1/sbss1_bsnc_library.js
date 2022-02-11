var priceLevelMSRP = '0';
var priceLevel25 = '9';
var priceLevel30 = '10';
var priceLevel35 = '11';
var priceLevel40 = '13';
var priceLevel45 = '15';
var priceLevelCustom = 'c';
var priceLevelSupport = 's';

var netTypeCloud = 1;
var netTypeCom = 2;
var netTypeBSNEE = 6;

var invoiceForm = 118;

function initSuiteBillingBSNSettings(){
    var environment = {};
    var settings = {};
    var searchRes = nlapiSearchRecord('customrecord_bs_enviroment_setting', 'customsearch_suitebilling_settings');
    if( searchRes ){
        for( var row in searchRes ){
            //console.log(searchRes[row]);
            //console.log(searchRes[row].getValue('name'));
            //console.log(searchRes[row].getValue('custrecord_bs_enviroment_setting_value'));
            settings[searchRes[row].getValue('name')] = searchRes[row].getValue('custrecord_bs_enviroment_setting_value');
            //nlapiLogExecution('DEBUG', searchRes[row].getValue('name'), searchRes[row].getValue('custrecord_bs_enviroment_setting_value'));
        }
        //console.log(settings);
        environment = {
            bsn1yrItemNum: parseInt(settings['subscription_plan_item_2']) || 849,
            bsnc1yrItemNum: parseInt(settings['subscription_plan_item']) || 850,
            bsnee1yrItemNum: parseInt(settings['subscription_plan_item_3']) || 884,
            bsn1yrItemText: settings['subscription_plan_item_2'] || '849',
            bsnc1yrItemText: settings['subscription_plan_item'] || '850',
            bsnee1yrItemText: settings['subscription_plan_item_3'] || '884',
            bsn1yrPlanNum: parseInt(settings['subscription_plan_2']) || 851,
            bsnc1yrPlanNum: parseInt(settings['subscription_plan']) || 852,
            bsnee1yrPlanNum: parseInt(settings['subscription_plan_3']) || 889,
            //bsncTimeCredit: parseInt(settings['subscription_plan_itemid_2']) || 815,

            billingSchedule12mAnniversary: 7,

            emailTemplates:[
                { code: '-30p', customer: settings['email_tpl_m30_prepay_customer'],
                                enduser: settings['email_tpl_m30_prepay_end_user'],
                                sales: 0,
                                searchId: 80827/*customsearch_subscr_email_m30_prepay*/ },
                { code: '-30t', customer: settings['email_tpl_m30_terms_customer'],
                                enduser: settings['email_tpl_m30_terms_end_user'],
                                sales: 0,
                                bsnee: settings['email_tpl_bsnee_m30_terms_customer']/*'custemailtmpl_sb_bsnee_renew_terms_m30_cust'*/,
                                bsneesales: settings['email_tpl_bsnee_m30_terms_sales']/*'custemailtmpl_sb_bsnee_renew_terms_m30_sales'*/,
                                searchId: 80820/*customsearch_subscr_email_m30_terms*/ },
                { code: '-15p', customer: settings['email_tpl_m30_prepay_customer'],
                                enduser: settings['email_tpl_m30_prepay_end_user'],
                                sales: 0,
                                searchId: 80829/*customsearch_subscr_email_m15_prepay*/ },
                { code: '-15t', customer: settings['email_tpl_m30_terms_customer'],
                                enduser: settings['email_tpl_m30_terms_end_user'],
                                sales: 0,
                                bsnee: settings['email_tpl_bsnee_m30_terms_customer']/*'custemailtmpl_sb_bsnee_renew_terms_m30_cust'*/,
                                bsneesales: settings['email_tpl_bsnee_m30_terms_sales']/*'custemailtmpl_sb_bsnee_renew_terms_m30_sales'*/,
                                searchId: 80828/*customsearch_subscr_email_m15_terms*/ },
                { code: '-7p', customer: settings['email_tpl_m30_prepay_customer'],
                                enduser: settings['email_tpl_m30_prepay_end_user'],
                                sales: 0,
                                searchId: 80831/*customsearch_subscr_email_m7_prepay*/ },
                { code: '-7t', customer: settings['email_tpl_m30_terms_customer'],
                                enduser: settings['email_tpl_m30_terms_end_user'],
                                sales: settings['email_tpl_m7_terms_sales'],
                                bsnee: settings['email_tpl_bsnee_m30_terms_customer']/*'custemailtmpl_sb_bsnee_renew_terms_m30_cust'*/,
                                bsneesales: settings['email_tpl_bsnee_m30_terms_sales']/*'custemailtmpl_sb_bsnee_renew_terms_m30_sales'*/,
                                searchId: 80830/*customsearch_subscr_email_m7_terms*/ },
                { code: '0p', customer: settings['email_tpl_0_prepay_customer'],
                                enduser: settings['email_tpl_0_prepay_end_user'],
                                sales: 0,
                                searchId: 80833/*customsearch_subscr_email_0_prepay*/ },
                { code: '0t', customer: settings['email_tpl_0_terms_customer'],
                                enduser: settings['email_tpl_0_terms_end_user'],
                                sales: settings['email_tpl_0_terms_sales'],
                                bsnee: settings['email_tpl_bsnee_0_terms_customer']/*'custemailtmpl_sb_bsnee_renew_terms_m30_cust'*/,
                                bsneesales: settings['email_tpl_bsnee_0_terms_exec']/*'custemailtmpl_sb_bsnee_renew_terms_m30_sales'*/,
                                searchId: 80832/*customsearch_subscr_email_0_terms*/ },
                { code: '7p', customer: settings['email_tpl_7_prepay_customer'],
                                enduser: settings['email_tpl_7_prepay_end_user'],
                                sales: 0,
                                searchId: 80822/*'customsearch_subscr_email_7_prepay'*/ },
                { code: '7t', customer: settings['email_tpl_7_terms_customer'],
                                enduser: settings['email_tpl_7_terms_end_user'],
                                sales: settings['email_tpl_7_terms_sales'],
                                searchId: 80824/*'customsearch_subscr_email_7_terms'*/ },
                { code: '30p', customer: settings['email_tpl_30_prepay_customer'],
                                enduser: settings['email_tpl_30_prepay_end_user'],
                                sales: 0,
                                searchId: 80826/*customsearch_subscr_email_30_prepay*/ },
                { code: '30t', customer: settings['email_tpl_30_terms_customer'],
                                enduser: settings['email_tpl_30_terms_end_user'],
                                sales: 0,
                                searchId: 80825/*customsearch_subscr_email_30_terms*/ },
                { code: 'Ssp', customer: settings['email_tpl_suspend_customer'],
                                enduser: settings['email_tpl_suspend_end_user'],
                                sales: 0,
                                searchId: 80825/*customsearch_subscr_email_30_terms*/ },
            ],

            priceBooks: [
                { 'pricelevel': priceLevelMSRP, 'pricebook': settings['pricebook_msrp_2'] },
                { 'pricelevel': priceLevel25, 'pricebook': settings['pricebook_tier1_2'] },
                { 'pricelevel': priceLevel30, 'pricebook': settings['pricebook_tier2_2'] },
                { 'pricelevel': priceLevel35, 'pricebook': settings['pricebook_tier3_2'] },
                { 'pricelevel': priceLevel40, 'pricebook': settings['pricebook_tier4_2'] },
                { 'pricelevel': priceLevel45, 'pricebook': settings['pricebook_tier5_2'] },
                { 'pricelevel': priceLevelCustom, 'pricebook': settings['pricebook_custom_2'] },
                { 'pricelevel': priceLevelSupport, 'pricebook': settings['pricebook_support_2'] },
            ],

            priceBooksCL: [
                { 'pricelevel': priceLevelMSRP, 'pricebook': settings['pricebook_msrp'] },
                { 'pricelevel': priceLevel25, 'pricebook': settings['pricebook_tier1'] },
                { 'pricelevel': priceLevel30, 'pricebook': settings['pricebook_tier2'] },
                { 'pricelevel': priceLevel35, 'pricebook': settings['pricebook_tier3'] },
                { 'pricelevel': priceLevel40, 'pricebook': settings['pricebook_tier4'] },
                { 'pricelevel': priceLevel45, 'pricebook': settings['pricebook_tier5'] },
                { 'pricelevel': priceLevelCustom, 'pricebook': settings['pricebook_custom'] },
                { 'pricelevel': priceLevelSupport, 'pricebook': settings['pricebook_support'] },
            ],

            bsnServer: settings['sb_com_connection'],
            bsnConnection: {},

            bsncServer: settings['sb_cloud_connection'],
            bsncConnection: {},

        }

        switch( environment.bsnServer ){
            case 'prod':
                environment.bsnConnection.host = settings['sbss_bsn_prod_host'];
                environment.bsnConnection.user = settings['sbss_bsn_prod_user'];
                environment.bsnConnection.pass = settings['sbss_bsn_prod_pass'];
                environment.bsnConnection.endp = settings['sbss_bsn_prod_endp'];
                environment.bsnConnection.soap = settings['sbss_bsn_prod_soap'];
                environment.bsnConnection.actn = settings['sbss_bsn_prod_actn'];
                break;
            case 'stage':
                environment.bsnConnection.host = settings['sbss_bsn_stage_host'];
                environment.bsnConnection.user = settings['sbss_bsn_stage_user'];
                environment.bsnConnection.pass = settings['sbss_bsn_stage_pass'];
                environment.bsnConnection.endp = settings['sbss_bsn_stage_endp'];
                environment.bsnConnection.soap = settings['sbss_bsn_stage_soap'];
                environment.bsnConnection.actn = settings['sbss_bsn_stage_actn'];
                break;
            case 'qa':
                environment.bsnConnection.host = settings['sbss_bsn_qa_host'];
                environment.bsnConnection.user = settings['sbss_bsn_qa_user'];
                environment.bsnConnection.pass = settings['sbss_bsn_qa_pass'];
                environment.bsnConnection.endp = settings['sbss_bsn_qa_endp'];
                environment.bsnConnection.soap = settings['sbss_bsn_qa_soap'];
                environment.bsnConnection.actn = settings['sbss_bsn_qa_actn'];
                break;
            default: break;
        }

        switch( environment.bsncServer ){
            case 'prod':
                environment.bsncConnection.host = settings['sbss_bsnc_prod_host'];
                environment.bsncConnection.user = settings['sbss_bsnc_prod_user'];
                environment.bsncConnection.pass = settings['sbss_bsnc_prod_pass'];
                environment.bsncConnection.endp = settings['sbss_bsnc_prod_endp'];
                environment.bsncConnection.soap = settings['sbss_bsnc_prod_soap'];
                environment.bsncConnection.actn = settings['sbss_bsnc_prod_actn'];
                break;
            case 'stage':
                environment.bsncConnection.host = settings['sbss_bsnc_stage_host'];
                environment.bsncConnection.user = settings['sbss_bsnc_stage_user'];
                environment.bsncConnection.pass = settings['sbss_bsnc_stage_pass'];
                environment.bsncConnection.endp = settings['sbss_bsnc_stage_endp'];
                environment.bsncConnection.soap = settings['sbss_bsnc_stage_soap'];
                environment.bsncConnection.actn = settings['sbss_bsnc_stage_actn'];
                break;
            case 'qa':
                environment.bsncConnection.host = settings['sbss_bsnc_qa_host'];
                environment.bsncConnection.user = settings['sbss_bsnc_qa_user'];
                environment.bsncConnection.pass = settings['sbss_bsnc_qa_pass'];
                environment.bsncConnection.endp = settings['sbss_bsnc_qa_endp'];
                environment.bsncConnection.soap = settings['sbss_bsnc_qa_soap'];
                environment.bsncConnection.actn = settings['sbss_bsnc_qa_actn'];
                break;
            default: break;
        }
    }
    //nlapiLogExecution('DEBUG', 'environment', JSON.stringify(environment));
    return environment;
}

var sbBSNSettings = initSuiteBillingBSNSettings();

function search(nameKey, myArray, myArrayIndex){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i][myArrayIndex] === nameKey) {
            return i;
        }
    }
    return -1;
}

// type: customer | enduser | sales | searchId
function bsnGetEmailTemplateByCode(code, type){
    var res = search( code, sbBSNSettings.emailTemplates, 'code' );

    return res == -1 ? 0 : parseInt( sbBSNSettings.emailTemplates[res][type] );
}

function bsnGetPriceBookByPriceLevel(netType, priceLevel){
    var pbArray = [];
    if( netType == netTypeCom ){
        pbArray = sbBSNSettings.priceBooks;
    } else {
        pbArray = sbBSNSettings.priceBooksCL;
    }
    var res = search( priceLevel, pbArray, 'pricelevel' );

    return res == -1 ? 0 : pbArray[res].pricebook;
}
/*
var priceBookComMSRP = '1';
var priceBookCom25 = '2';
var priceBookCom30 = '3';
var priceBookCom35 = '4';
var priceBookCom40 = '5';
var priceBookCom45 = '6';
var priceBookComSupport = '7';
var priceBookComCustom = '16';

var priceBookCloudMSRP = '8';
var priceBookCloud25 = '9';
var priceBookCloud30 = '10';
var priceBookCloud35 = '11';
var priceBookCloud40 = '12';
var priceBookCloud45 = '13';
var priceBookCloudSupport = '14';
var priceBookCloudCustom = '15';
*/


var buttonStart = '<table cellspacing="0" cellpadding="2" border="0" role="presentation"><tr><td align="left" style="padding-bottom:6px;" class="uir-header-buttons"><table border="0" cellspacing="0" cellpadding="0" role="presentation"><tr><td><table id="tbl_bsn_create_network_button" cellpadding="0" cellspacing="0" border="0" class="uir-button" style="margin-right:6px;cursor:hand;" role="presentation"><tr id="tr_bsn_create_network_button" class="pgBntG"><td id="tdleftcap_bsn_create_network_button"><img src="/images/nav/ns_x.gif" class="bntLT" border="0" height="50%" width="3" alt=""><img src="/images/nav/ns_x.gif" class="bntLB" border="0" height="50%" width="3" alt=""></td><td id="tdbody_bsn_create_network_button" height="20" valign="top" nowrap="" class="bntBgB">';
var buttonEnd = '</td><td id="tdrightcap_bsn_create_network_button"> <img src="/images/nav/ns_x.gif" height="50%" class="bntRT" border="0" width="3" alt=""><img src="/images/nav/ns_x.gif" height="50%" class="bntRB" border="0" width="3" alt=""></td></tr></table></td></tr></table></td></tr></table>';


function getSOAPTime( dateToConvert ){
    var now = '';
    if( isNullorEmpty(dateToConvert) ){
        now = new Date();
    } else {
        now = new Date(dateToConvert);
    }

    return now.getFullYear() + '-' +('0' + (now.getMonth()+1)).slice(-2)+ '-' +  ('0' + (now.getDate())).slice(-2) + 'T'+('0' + (now.getHours())).slice(-2)+ ':'+('0' + (now.getMinutes())).slice(-2)+ ':'+('0' + (now.getSeconds())).slice(-2)+ '.'+ ('00' + (now.getMilliseconds())).slice(-3)+ 'Z';
}

function parseSOAPDate( dateSOAP ){
    var dateNS = false;
    if( typeof( dateSOAP ) != "undefined" && dateSOAP.length > 9 ){
        dateNS = new Date( dateSOAP.slice(0,4), dateSOAP.slice(5,7) - 1, dateSOAP.slice(8,10) );
    }
    return dateNS;
}

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
    for(var i = 1; i <= 15 /*Price List Size*/; i++){
        if(i == 1){
            prices[i] = searchresults[0].getValue('baseprice');
        } else {
            prices[i] = searchresults[0].getValue('price' + i);
        }
    }

    return prices;
}

function bsAddMonths( currentDate, num ){
    currentDate = moment(currentDate);
    var futureMonth = moment(currentDate).add(parseInt(num), 'M');
    var futureMonthEnd = moment(futureMonth).endOf('month');

    if(currentDate.date() != futureMonth.date() && futureMonth.isSame(futureMonthEnd.format('YYYY-MM-DD'))) {
        futureMonth = futureMonth.add(1, 'd');
    }

    return futureMonth.toDate()
}

function bsIsEndOfMonth( date ){
    if( !isNullorEmpty(date) ) {
        var lastDayOfTheMonth = moment(date).endOf("month");
        return moment(date).isSame(lastDayOfTheMonth, "day");
    }
    return false;
}

function isBillingAccountEligible( billingAccount, renewDate ){
    var ba = nlapiLoadRecord( 'billingaccount', billingAccount );
    var baStartDate = nlapiStringToDate( ba.getFieldValue('startdate') );
    var subRenewDate = nlapiStringToDate( renewDate );
    var isBAEOM = bsIsEndOfMonth( baStartDate );
    var isSubEOM = bsIsEndOfMonth( subRenewDate );
    var baDay = moment( baStartDate ).date();
    var subDay = moment( subRenewDate ).date();
    return ( isBAEOM && isSubEOM ) || baDay == subDay;
}

function bsnCreateBillingAccount( customer, date, countryCode, replace ){
    nlapiLogExecution('DEBUG', '', '================== Start bsnCreateBillingAccount ============================');
    nlapiLogExecution('DEBUG', 'customer', customer);
    nlapiLogExecution('DEBUG', 'date', date);
    var startDate = date;
    if( isNullorEmpty( startDate ) ) startDate = nlapiDateToString(new Date());
    nlapiLogExecution('DEBUG', 'startDate', startDate);
    var ba = nlapiCreateRecord( 'billingaccount' );
    ba.setFieldValue('customer', customer);
    if( isNullorEmpty( replace ) ){
        ba.setFieldValue('customerdefault', 'T');
    } else {
        ba.setFieldValue('location', 25);
    }
    ba.setFieldValue('billingschedule', sbBSNSettings.billingSchedule12mAnniversary);
    ba.setFieldValue('startdate', startDate);
    ba.setFieldValue('subsidiary', 1);
    ba.setFieldValue('invoiceform', 118);
    if( !isNullorEmpty( countryCode ) ) ba.setFieldValue( 'custrecord_ba_country_code', countryCode );
    var newBilling = nlapiSubmitRecord( ba );
    nlapiLogExecution('DEBUG', '', '================== End bsnCreateBillingAccount ============================');
    return newBilling;
}

function sbCCExpirationMessage( ccnumber, ccexpdate, subexpdate, extend ){
    nlapiLogExecution('DEBUG', 'message args', 'sbCCExpirationMessage( "' + ccnumber + '", "' + ccexpdate + '", "' + subexpdate + '", ' + extend + ' )')
    var message = '';
    if( !isNullorEmpty( ccnumber ) ) {
        var pastdue = extend || 0;
        var renewDate = nlapiStringToDate(subexpdate);
        var dToday = new Date();
        var daysToSubExp = Math.ceil(renewDate - dToday) / (1000 * 60 * 60 * 24);
        var ccDaysLeft = sbCCDaysToExpiration(ccexpdate);

        if (ccDaysLeft <= 0) {
            message = 'Credit Card on your record (ends with ' + ccnumber.substr(-5) + ') has already expired. You must update Credit Card information for the renewal to be processed.';
        } else if (ccDaysLeft < daysToSubExp + pastdue) {
            message = 'Credit Card on your record (ends with ' + ccnumber.substr(-5) + ') is about to expire in ' + ccDaysLeft + ' days. You must update Credit Card information for the renewal to be processed.';
        }
    } else {
        message = 'There is no Credit Card on your record. You must update Credit Card information for the renewal to be processed.';
    }

    return message == '' ? '' : '<div style="color: red;">' + message + '</div><br>';
}

function sbCCDaysToExpiration( ccexpdate ){
    var m = 0, y = 0;
    if(ccexpdate.indexOf('/') != -1)
    {
        var dToday = new Date();

        var c = ccexpdate.split('/');
        if(onlydigits(c[0])) m = parseInt(c[0],10);
        if(onlydigits(c[1])) y = parseInt(c[1],10);
        if( m > 0 && m < 13 && y > 1900 ) {
            var eDate = new Date();
            eDate.setFullYear(y, m, 0);
            var daysToCCExp = Math.ceil(eDate - dToday) / (1000 * 60 * 60 * 24);
            //alert(nlapiDateToString(eDate));
            //alert( daysToExp );
            return daysToCCExp;
        }
    }
    return -1;
}

function onlydigits(str){
    return /^[0-9]+$/.test(str);
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

function popupHelperWindow(owner, baseUrl, windowName, width, height, additionalParams, listeners) {
    var url = baseUrl;
    /*url += '?bin=F';
    url += '&tobin=F';
    url += '&frombin=F';
    url += '&binreq=T';
    url += '&tobinreq=F';
    url += '&isserial=T';
    url += '&item=' + nlapiGetFieldValue('item');
    url += '&location=' + nlapiGetFieldValue('location');*/
    nlExtOpenWindow(url + additionalParams, windowName, width, height, owner, true, '', listeners);
}

function createBillingAccount(){
    var url = '/app/accounting/otherlists/billingaccount.nl?target=customer_newbillingaccount&ispublic=T';
    var customer = nlapiGetFieldValue('bsnc_addsubs_customer');
    url += '&customer=' + customer;

    var effDate = '';
    var today = new Date();
    var renewalDate = nlapiGetFieldValue('bsnc_addsubs_anniversary_date');
    var effectiveDate = nlapiGetFieldValue('bsnc_addsubs_start_date');
    if( !isNullorEmpty( effectiveDate ) ) today = nlapiStringToDate( effectiveDate );
    if( !isNullorEmpty( renewalDate ) ){
        var deltaMonth = 0;
        renewalDate = nlapiStringToDate( renewalDate );
        if( !( bsIsEndOfMonth( today ) && bsIsEndOfMonth( renewalDate ) ) ){
            var todayDate = today.getDate();
            var renewDate = renewalDate.getDate();
            if( todayDate != renewDate ){
                if( todayDate > renewDate ){// 4/7/21 > 5/5/21
                    today.setDate( renewDate );
                    effDate = '&strtdt=' + nlapiDateToString( today );
                } else { // 4/7/21 < 5/8/21
                    if( bsIsEndOfMonth( renewalDate ) ){
                        today.setDate(1);
                        today.setMonth(today.getMonth() - 1);
                        var lastDayOfTheMonth = moment(today).endOf("month").toDate();
                        effDate = '&strtdt=' + nlapiDateToString(lastDayOfTheMonth);
                    } else {
                        var todayMonth = today.getMonth();
                        if (todayDate > 27 && todayMonth == 2) {
                            deltaMonth = 2;
                        } else {
                            deltaMonth = 1;
                        }
                        today.setDate(renewDate);
                        today.setMonth(todayMonth - deltaMonth);
                        effDate = '&strtdt=' + nlapiDateToString(today);
                    }
                }
            }
        } else {
            effDate = '&strtdt=' + nlapiDateToString( today );
        }
    }

    var listeners = {
        'close':function(win){
            console.log("startdate: " + jQuery("#startdate").val());
            console.info('bye');
        },
        'hide':function(win){
            console.info('just hidden');
        }

    };
    //popupHelperWindow(this.window, url, 'cba', 800, 850, '', listeners)
    var baWindow = nlOpenWindow('/app/accounting/otherlists/billingaccount.nl?target=customer_newbillingaccount&customer=' + customer + effDate + '&ispublic=T', 'billingaccountpopup','width=1000,height=1000,resizable=yes,scrollbars=yes');
/*
    baWindow.beforeunload = function(){
        window.location.reload();
    }
    console.log(baWindow);
    */

    jQuery(baWindow).on("unload", function(e) {
        console.log(baWindow);
        console.log(baWindow[0]);
        if( baWindow[0] !== undefined ) {
            setWindowChanged(window, false);
            window.location.reload();
        }
    });

}

function sbModifyPricingNewTab(subId) {
    var win = window.open('/app/accounting/subscription/subscriptionchangeorder.nl?action=MODIFY_PRICING&effectivedate=' + nlapiGetFieldValue('bsnc_addsubs_start_date') + '&subscription=' + subId, '_blank');
    win.focus();
}

function bsnMessage( title, message, type ){
    var icon = Ext.MessageBox.INFO;
    switch( type ){
        case 'error': icon = Ext.MessageBox.ERROR; break;
        case 'warning': icon = Ext.MessageBox.WARNING; break;
        case 'question': icon = Ext.MessageBox.QUESTION; break;
        default: break;
    }

    Ext.MessageBox.show({
        title: title,
        msg: message,
        width: 300,
        buttons: Ext.MessageBox.OK,
        icon: icon
    });
}

function bsCreateSubscriptionInvoice( effectiveDate, subID ){
    var invoice = null;
    var sub = nlapiLoadRecord( 'subscription', subID );
    var customer = sub.getFieldValue('customer');
    var billingAcc = sub.getFieldValue('billingaccount');
    var startDate = sub.getFieldValue('startdate');
    var endDate = sub.getFieldValue('enddate');
    var invObj = {
        recordmode: 'dynamic',
        entity: customer,
        billingaccount:billingAcc
    };
    var newInv = nlapiCreateRecord('invoice', invObj);
    /*TODO: Ask what if DueDate is in past?*/
    newInv.setFieldValue('customform', invoiceForm);
    newInv.setFieldValue('recurringbill', 'F');
    newInv.setFieldValue('asofdate', effectiveDate);
    newInv.setFieldValue('whichchargestoadd', 'AS_OF_DATE');
    newInv.setFieldValue('custbody_sb_single_sub_invoice', subID);
    newInv.setFieldValue('duedate', nlapiDateToString(new Date()));
    newInv.setFieldValue('startdate', effectiveDate);
    newInv.setFieldValue('enddate', endDate);
    /*
    var lineItemCount = newInv.getLineItemCount('item');
    for( var i = lineItemCount; i > 0 ; i-- ){
        var itemSubscription = newInv.getLineItemValue('item', 'subscription', i);

        nlapiLogExecution('DEBUG', 'itemSubscription', itemSubscription );
        nlapiLogExecution('DEBUG', 'recurringbill', newInv.getFieldValue('recurringbill') );
        nlapiLogExecution('DEBUG', 'asofdate', newInv.getFieldValue('asofdate') );

        if( itemSubscription != subID ){
            newInv.removeLineItem('item', i);
        }
    }
    */
    logInvoiceData( newInv, 'Invoice Creation' );

    invoice = nlapiSubmitRecord(newInv);

    return invoice;
}

function scheduleInvoiceCreation(args){
    var parameters = '&custscript_sb_bsnc_script=bsnc_ss_subscription_action&custscript_sb_bsnc_is_single_sub=' + args.isSingle + '&custscript_sb_bsnc_subid=' + args.subId + '&custscript_sb_bsnc_is_any=' + args.isAny + '&custscript_sb_bsnc_eff_date=' + args.effDate;
    var a = {'User-Agent-x': 'SuiteScript-Call'};
    try {
        var url = nlapiResolveURL('SUITELET', 'customscript_sb_bsnc_ssrunner_su', 'customdeploy_sb_bsnc_ssrunner_su', 'external');
        //console.log(url + parameters);
        //url = 'https://3293628-sb2.app.netsuite.com' + url;
        nlapiLogExecution('DEBUG', 'url', url + parameters );
        var response = nlapiRequestURL(url + parameters, null, a);
        nlapiLogExecution('DEBUG', 'objResponse', response.getBody() );
        var objResponse = JSON.parse(response.getBody());
        //console.log(objResponse);
        nlapiLogExecution('DEBUG', 'objResponse', JSON.stringify(objResponse) );
        //bsnMessage("Result", objResponse.status, 'info');
        return objResponse;
    } catch (e) {
        nlapiLogExecution('DEBUG', 'Exception ', e.message );
        nlapiLogExecution('DEBUG', 'Exception ', e.stack);
        nlapiLogExecution('DEBUG', 'Exception ', e.toString());
        //bsnMessage("ERROR", e.message, 'error');
    }

    return {error: 'Invoice Creation not Scheduled.'};
}

function popupEmailSender(){
    jQuery(".loader-overlay").fadeIn(1000);
    var win = new Ext.Window ({
        title:'Send Renewal Emails',
        layout:'form',
        width:400,
        closable: false,
        closeAction:'close',
        target : document.getElementById('buttonId'),
        plain: true,

        items: [{
            xtype:'combo',
            fieldLabel:'Subscription Type',
            name:'subType',
            id:'subType',
            valueField: 'value',
            queryMode:'local',
            store:['.com or .cloud', 'bsnee'],
            displayField:'name',
            autoSelect:true,
            triggerAction: 'all',
            editable: false,
            forceSelection:true
        },{
            xtype:'combo',
            fieldLabel:'Customer Type',
            name:'cusType',
            id:'cusType',
            valueField: 'value',
            queryMode:'local',
            store:['Terms', 'Prepay', 'ACH'],
            displayField:'name',
            autoSelect:true,
            triggerAction: 'all',
            editable: false,
            forceSelection:true
        },{
            xtype:'combo',
            fieldLabel:'Email Type',
            name:'period',
            id:'period',
            valueField: 'value',
            queryMode:'local',
            store:['30 Days Before Renewal', '15 Days Before Renewal', '7 Days Before Renewal', 'Renewal Day', '7 Days After Renewal', '30 Days After Renewal'],
            displayField:'name',
            autoSelect:true,
            triggerAction: 'all',
            editable: false,
            forceSelection:true
        }],

        buttons: [{
            text: 'Send Emails',
            handler: function(){
                var subType = jQuery("#subType").val();
                var cusType = jQuery("#cusType").val();
                var activityPeriod = 'Annual';//jQuery("#period").val();
                var period = jQuery("#period").val();
                if( isNullorEmpty( subType ) ){
                    return bsnMessage( 'ERROR', 'Please select Subscription Type!', 'error' );
                } else {
                    switch( subType ){
                        case '.com or .cloud': subType = 'bsn'; break;
                        case 'bsnee': subType = 'bsnee'; break;
                        default: return bsnMessage( 'ERROR', 'Invalid Subscription Type!', 'error' );
                    }
                }
                if( isNullorEmpty( cusType ) ){
                    return bsnMessage( 'ERROR', 'Please select Customer Type!', 'error' );
                } else {
                    switch( cusType ){
                        case 'Terms': cusType = 't'; break;
                        case 'Prepay': cusType = 'p'; break;
                        case 'ACH': cusType = 'a'; break;
                        default: return bsnMessage( 'ERROR', 'Invalid Customer Type!', 'error' );
                    }
                }
                if( isNullorEmpty( period ) ) {
                    return bsnMessage( 'ERROR', 'Please select Email Type!', 'error' );
                } else {
                    switch( period ){
                        case '30 Days Before Renewal': period = '-30'; break;
                        case '15 Days Before Renewal': period = '-15'; break;
                        case '7 Days Before Renewal': period = '-7'; break;
                        case 'Renewal Day': period = '0'; break;
                        case '7 Days After Renewal': period = '7'; break;
                        case '30 Days After Renewal': period = '30'; break;
                        default: return bsnMessage( 'ERROR', 'Invalid Email Type!', 'error' );
                    }
                }

                bsnMessage( 'ERROR', 'subType='+subType+'; cusType='+cusType+'; period='+period, 'info' );

                formSendEmailsButtonSubmit( { subtype: subType, period: period + cusType } );

                /*
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
                */
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

function bsGetSubscriptionByNetid( netId, customerId, nettype ){
    var status = ['ACTIVE'];
    if( customerId != -1 ) status.push( 'PENDING_ACTIVATION' );//'CLOSED'
    var additionalFilters = new Array();
    additionalFilters.push( new nlobjSearchFilter('custrecord_sub_network_id', null, 'is', netId) );
    additionalFilters.push( new nlobjSearchFilter('status', null, 'anyof', status) );
    additionalFilters.push( new nlobjSearchFilter('custrecord_bsn_type', null, 'is', nettype) );
    additionalFilters.push( new nlobjSearchFilter('custrecord_bs_takeover_processed', null, 'isempty') );
    if( customerId != -1 ) additionalFilters.push( new nlobjSearchFilter('customer', null, 'is', customerId) );
    console.log(additionalFilters);
    var columns = new Array();
    columns.push( new nlobjSearchColumn( 'internalid' ).setSort(true) );
    columns.push( new nlobjSearchColumn( 'name' ) );
    columns.push( new nlobjSearchColumn( 'customer' ) );
    columns.push( new nlobjSearchColumn( 'billingaccount' ) );
    columns.push( new nlobjSearchColumn( 'custrecord_bsn_sub_end_user' ) );
    var searchresults = nlapiSearchRecord('subscription', null, additionalFilters, columns);
    console.log('================== Customers Subscriptions ====================');
    console.log(searchresults);
    if( searchresults != null ){
        if( customerId == -1 ){
            var res = [];
            for( var i = 0; i < searchresults.length; i++ ){
                res.push({
                    subId: searchresults[i].getId(),
                    subName: searchresults[i].getValue( 'name' ),
                    customerId: searchresults[i].getValue( 'customer' ),
                    customerName: searchresults[i].getText( 'customer' ),
                    billingAccount: searchresults[i].getValue( 'billingaccount' ),
                    endUser: searchresults[i].getValue( 'custrecord_bsn_sub_end_user' )
                });
            }
            return res;
        } else
            return {
                subId: searchresults[0].getId(),
                subName: searchresults[0].getValue( 'name' ),
                customerId: searchresults[0].getValue( 'customer' ),
                customerName: searchresults[0].getText( 'customer' ),
                billingAccount: searchresults[0].getValue( 'billingaccount' ),
                endUser: searchresults[0].getValue( 'custrecord_bsn_sub_end_user' )
            };
    } else {
        /*
        additionalFilters = new Array();
        additionalFilters[0] = new nlobjSearchFilter('custrecord_sub_network_id', null, 'is', netId);
        additionalFilters[1] = new nlobjSearchFilter('status', null, 'is', 'ACTIVE');
        columns = new Array();
        columns[0] = new nlobjSearchColumn( 'name' );
        if( searchresults != null ){
            return { subId: searchresults[0].getId(), subName: searchresults[0].getValue( 'name' ) };
        }
        */
    }

    return -1;
}

function bsncGetSubscriptionsByNetid( netId, nettype, onlyActive ){
    var status = ['ACTIVE','PENDING_ACTIVATION'/*,'CLOSED'*/];
    if( onlyActive === true ) status = ['ACTIVE'];
    var subs = [];
    var additionalFilters = new Array();
    additionalFilters.push( new nlobjSearchFilter('custrecord_sub_network_id', null, 'is', netId) );
    additionalFilters.push( new nlobjSearchFilter('status', null, 'anyof', status) );
    additionalFilters.push( new nlobjSearchFilter('custrecord_bsn_type', null, 'is', nettype) );
    additionalFilters.push( new nlobjSearchFilter('custrecord_bs_takeover_processed', null, 'isempty') );
    var columns = new Array();
    columns.push( new nlobjSearchColumn( 'name' ) );
    columns.push( new nlobjSearchColumn( 'customer' ) );
    columns.push( new nlobjSearchColumn( 'billingaccount' ) );
    columns.push( new nlobjSearchColumn( 'email', 'customer' ) );
    columns.push( new nlobjSearchColumn( 'startdate' ) );
    columns.push( new nlobjSearchColumn( 'enddate' ) );
    columns.push( new nlobjSearchColumn( 'custrecord_bsn_sub_end_user' ) );
    columns.push( new nlobjSearchColumn( 'status' ) );
    columns.push( new nlobjSearchColumn( 'custentity_bs_support_customer', 'customer' ) );
    var searchresults = nlapiSearchRecord('subscription', null, additionalFilters, columns);
    if( searchresults != null ){
        for( var i = 0; i < searchresults.length; i++ ){
            subs.push( {
                subId: searchresults[i].getId(),
                subName: searchresults[i].getValue( 'name' ),
                subStartDate: searchresults[i].getValue( 'startdate' ),
                subEndDate: searchresults[i].getValue( 'enddate' ),
                subCustomer: searchresults[i].getText( 'customer' ),
                customerId: searchresults[i].getValue( 'customer' ),
                billingAccount: searchresults[i].getValue( 'billingaccount' ),
                customerEmail: searchresults[i].getValue( 'email', 'customer' ),
                subEndUser: searchresults[i].getText( 'custrecord_bsn_sub_end_user' ),
                subEndUserId: searchresults[i].getValue( 'custrecord_bsn_sub_end_user' ),
                status: searchresults[i].getValue( 'status' ),
                isSupport: searchresults[i].getValue( 'custentity_bs_support_customer', 'customer' ) == 'T'
            } );
        }
    } else {
        /*
        additionalFilters = new Array();
        additionalFilters[0] = new nlobjSearchFilter('custrecord_sub_network_id', null, 'is', netId);
        additionalFilters[1] = new nlobjSearchFilter('status', null, 'is', 'ACTIVE');
        columns = new Array();
        columns[0] = new nlobjSearchColumn( 'name' );
        if( searchresults != null ){
            return { subId: searchresults[0].getId(), subName: searchresults[0].getValue( 'name' ) };
        }
        */
    }

    return subs;
}

function bsRecreateSubs( args ){
    //{subId:recId, isCleanup:true, netType: nettypeFrom, netId: netFrom}
    console.log(args);
    var newArgs = {};
    var sub = null;
    if( args && !isNullorEmpty( args.subId ) ) {
        var toControl = args.toControl || 'F';
        newArgs = {
            subId: args.subId,
            isCleanup: args.isCleanup,
            netType: args.netType,
            netId: args.netId,
            serials: '',
            toControl: toControl
        };
    } else {
        newArgs = {
            subId: nlapiGetRecordId(),
            isCleanup: '',
            netType: '',
            netId: '',
            serials: '',
            toControl: 'F'
        };
        console.log(newArgs);
        sub = nlapiLoadRecord( 'subscription', newArgs.subId );
    }
    if( sub ){
        var isSupport = nlapiLookupField( 'customer', sub.getFieldValue('customer'), 'custentity_bs_support_customer' ) == 'T';
        if( newArgs.toControl != 'T' && isSupport ) {
            Ext.MessageBox.show({
                title: 'Assign Serial Numbers',
                msg: 'Do you want to manually assign Device IDs to new Subscriptions?',
                width: 300,
                buttons: Ext.MessageBox.OKCANCEL,
                multiline: true,
                fn: function (btn, text) {
                    if (btn == 'ok') {
                        var serials = '';
                        if (!isNullorEmpty(text)) {
                            var serialsArray = text.split(/[\s\n,]+/);
                            if (serialsArray.length) serials = serialsArray.join(',');
                        }
                        newArgs.serials = serials;
                        scheduleSubsCreation(newArgs);
                    }
                }
            });
        } else {
            scheduleSubsCreation(newArgs);
        }
    } else {
        if( !isNullorEmpty(newArgs.subId) ){
            scheduleSubsCreation(newArgs);
        }
    }
}

function scheduleSubsCreation(args){
    var parameters = '&custscript_sb_bsnc_script=customscript_sb_bsnc_ss_subs_operations&custscript_sb_bsnc_is_single_op=T&custscript_sb_bsnc_subid=' + args.subId + '&custscript_sb_bsnc_serials=' + args.serials + '&custscript_sb_bsnc_cleanup=' + args.isCleanup + '&custscript_sb_bsnc_netid=' + args.netId + '&custscript_sb_bsnc_net_type=' + args.netType + '&custscript_sb_bsnc_to_control=' + args.toControl;
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

function scheduleSuspendEmail( args ){
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

function bsUpdateNetwork( args ){
    //{subId:recId, isCleanup:true, netType: nettypeFrom, netId: netFrom}
    console.log(args);
    var newArgs = {};
    var sub = null;
    if( args && !isNullorEmpty( args.subId ) ) {
        newArgs = {
            subId: args.subId
        };
    } else {
        newArgs = {
            subId: nlapiGetRecordId()
        };
        console.log(newArgs);
        sub = nlapiLoadRecord( 'subscription', newArgs.subId );
    }
    if( sub ){
        scheduleNetworkUpdate(newArgs);
    } else {
        if( !isNullorEmpty(newArgs.subId) ){
            scheduleNetworkUpdate(newArgs);
        }
    }
}

function scheduleNetworkUpdate(args){
    var parameters = '&custscript_sb_bsnc_script=bsnc_ss_network_operations&custscript_sb_bsnc_is_single_net=T&custscript_sb_bsnc_subid=' + args.subId;
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

function sbUpdateLatestPricePlan( subscription, newQuantity, newPrice ){
    if( subscription ) {
        var lineItemCount = subscription.getLineItemCount('priceinterval');
        //console.log('lineItemCount='+lineItemCount);
        //console.log('newQuantity='+newQuantity);
        //console.log(curSubscription.getLineItemValue('priceinterval', 'priceplan', lineItemCount));
        if( lineItemCount ) {
            subscription.selectLineItem('priceinterval', lineItemCount);
            //console.log('subscription.getCurrentLineItemValue(\'priceinterval\', \'quantity\')='+subscription.getCurrentLineItemValue('priceinterval', 'quantity'));
            if( newQuantity == null ) newQuantity = subscription.getCurrentLineItemValue('priceinterval', 'quantity');
            subscription.setCurrentLineItemValue('priceinterval', 'quantity', newQuantity);
            //console.log('subscription.getCurrentLineItemValue(\'priceinterval\', \'quantity\')='+subscription.getCurrentLineItemValue('priceinterval', 'quantity'));
            if( newPrice !== -1 ) {
                var planID = subscription.getCurrentLineItemValue('priceinterval', 'priceplan');
                if (planID) {
                    var plan = nlapiLoadRecord('priceplan', planID);
                    if (plan) {
                        var lineItemCount = plan.getLineItemCount('pricetiers');
                        //console.log(lineItemCount);
                        plan.setLineItemValue('pricetiers', 'value', lineItemCount, newPrice);
                        var planSubmitted = nlapiSubmitRecord(plan);
                        //console.log(planSubmitted);
                        if (planSubmitted) {
                            var newAmount = newPrice * newQuantity;
                            subscription.setCurrentLineItemValue('priceinterval', 'totalintervalvalue', newAmount);
                        }
                    }
                }
            }
            subscription.commitLineItem('priceinterval');
            var subSubmitted = nlapiSubmitRecord(subscription);
            //console.log('subSubmitted='+subSubmitted);
            return subSubmitted;
        }
    }
    return 0;
}

/****************
 * For Emails you should use a EXTERNAL URL from script Deployment
 * ***********************/

function sendTrialActivatedEmail( email, customerId, netName){
    var templateId = '358';
    var emailMerger = nlapiCreateEmailMerger(templateId);
    emailMerger.setEntity('customer', customerId);
    var mergeResult = emailMerger.merge();
    var emailSubject = mergeResult.getSubject();
    var emailBody = mergeResult.getBody();
//Replace Custom FreeMarker Tags with values
    emailBody = emailBody.replace(/{netname}/g, netName);
    emailBody = emailBody.replace(/{email}/g, email);
    nlapiSendEmail(-5, email, emailSubject, emailBody);
}



function logInvoiceData( inv, title ){
    var context = nlapiGetContext();
    if( context.getExecutionContext() == 'userinterface' ){
        console.log(title);
        console.log(inv);
        console.log("recurringbill: " + inv.getFieldValue('recurringbill'));
        console.log("billingaccount: " + inv.getFieldValue('billingaccount'));
        console.log("asofdate: " + inv.getFieldValue('asofdate'));
        console.log("LineItemCount: " + inv.getLineItemCount('item'));
        console.log("duedate: " + inv.getFieldValue('duedate'));
        console.log("startdate: " + inv.getFieldValue('startdate'));
        console.log("enddate: " + inv.getFieldValue('enddate'));
        console.log('End ' + title);
    } else {
        nlapiLogExecution('DEBUG', '', '================= ' + title + ': =================');
        nlapiLogExecution('DEBUG', 'recurringbill', inv.getFieldValue('recurringbill'));
        nlapiLogExecution('DEBUG', 'billingaccount', inv.getFieldValue('billingaccount'));
        nlapiLogExecution('DEBUG', 'asofdate', inv.getFieldValue('asofdate'));
        nlapiLogExecution('DEBUG', 'LineItemCount', inv.getLineItemCount('item'));
        nlapiLogExecution('DEBUG', 'duedate', inv.getFieldValue('duedate'));
        nlapiLogExecution('DEBUG', 'startdate', inv.getFieldValue('startdate'));
        nlapiLogExecution('DEBUG', 'enddate', inv.getFieldValue('enddate'));
        nlapiLogExecution('DEBUG', '', '================= End ' + title + ': =================');
    }
}