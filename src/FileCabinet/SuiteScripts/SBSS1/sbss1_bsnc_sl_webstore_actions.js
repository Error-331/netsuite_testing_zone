/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       24 June 2019     Eugene Karakovsky
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function bsncWebstoreActions(request, response){
    var context = nlapiGetContext().getExecutionContext();
    if( context == "webstore" ) {
        var action = request.getParameter('bsnc_action');
        var customerId = request.getParameter('bsnc_customer');
        var purchaserEmail = request.getParameter('bsnc_email');
        var networkId = request.getParameter('bsnc_netid');
        var networkName = request.getParameter('bsnc_netname');
        nlapiLogExecution("DEBUG", "action", action);
        switch (action) {
            case "create":
                break;
            case "trial":
                break;
            case "netlist":
                nlapiLogExecution("DEBUG", "customerId", customerId);
                if (!isNullOrEmpty(customerId)) {
                    var customerEmail = nlapiLookupField('customer', customerId, 'email');
                    nlapiLogExecution("DEBUG", "customerEmail", customerEmail);
                    if (!isNullOrEmpty(customerEmail)) {
                        var networks = soapGetNetworksByCustomerEmailBSNC(customerEmail);
                        if (!isNullOrEmpty(networks) && networks.length) {
                            var filtered = [];
                            for (var i = 0; i < networks.length; i++) {
                                var net = soapGetNetworkByIdBSNC(networks[i][0]);
                                if (!net.isTrial && !net.wasTrial) {
                                    filtered.push(networks[i]);
                                }
                            }
                        }
                        response.write(JSON.stringify(filtered));
                    } else {
                        response.write('{error: BSNC_NO_CUSTOMER_EMAIL}');
                    }
                } else {
                    response.write('{error: BSNC_CUSTOMER_NOT_LOGGED_IN}');
                }
                break;
            default:
                break;
        }
    }
}

function isNullOrEmpty(strVal){
    return (strVal == null || strVal == '');
}




var constants = SWE.Renewals.Library.Constants;
var globalVar = SWE.R01B.CS.TranLines.Variables;
var rmaUrlPrefix = '';

/***********************RMA Validations*********************/
var contractID = "40062";
var stExceptionId = '';
var flListRate = "8.25"
var stItemId = "595";
var iQuantity = "1";

//get M/S Pricing Option on Item Level if lineNo is not null
var MSPricingOption = globalVar.MS_MODEL;
if (!SWE.Library.misc.isUndefinedNullOrEmpty(lineNo)) {
    var itemMSPricingOption = null;
    if (!SWE.Library.misc.isUndefinedNullOrEmpty(itemMSPricingOption)) {
        MSPricingOption = itemMSPricingOption;
    }
}

var CHECK_RATE = 'F';
var iOtherQuantity = 0;
var iOtherQuantityTotal = 0;
var bRenewalsExclusion = false;
var itemTerms = "12";
var itemCategory = "2";

var stParameters = '';

var stOthParameter = '';

rmaUrlPrefix = "";

var requesturl = "/app/site/hosting/scriptlet.nl?script=272&deploy=1&compid=3293628&ContractID=40062&ItemId=595&Quantity=1&ListRate=8.25&ExceptionId=&CheckRate=F&Terms=12&Type=verifyRMAItem&ItemCategory=2&RenewalsExclusion=false&OtherQuantity=0&OtherQuantityTotal=0";


var stContractId = "40062";
var stItemId     = "595";
var iQuantity       = "1";
var flListRate      = "8.25";
var iOtherQuantity  = "0";
var iOtherQuantityTotal  = "0";
var stExceptionId   = "";
var IsCheckRate     = "F";
var itemTerms       = "12";
var bRenewalsExclution = false;
var itemCategory    = "2";
nlapiLogExecution('DEBUG', 'Parameters', 'Contract ID: ' + stContractId
    + '\nItem ID: ' + stItemId
    + '\nList Rate: ' + flListRate
    + '\nQuantity: ' + iQuantity
    + '\nCheck Rate: ' + IsCheckRate
    + '\nOther Quantity: ' + iOtherQuantity
    + '\nOther Quantity Total: ' + iOtherQuantityTotal
    + '\Terms: ' + itemTerms
    + '\nException ID: ' + stExceptionId
    + '\nType: \'' + stType + '\''
    + '\nRenewals Exclusion: ' + bRenewalsExclution
    + '\nItem Category: ' + itemCategory);
result = SWE.Renewals.Library.verifyRMAItemFromSuitelet("40062", "595", "8.25", "1", "0", "", "F", false, "12", false, "2", "0");
SWE.Renewals.Library.verifyRMAItem("40062", "595", "8.25", "1", "0", "", "F", false, "12", false, "2");


//Issue 219398: Search in Contract's list of Perpetual Contract Items
if (arrResults == null && SWE.Renewals.Library.searchInList(SWE.Renewals.Library.splitList(constants.ITEMCATS_FOR_MAINTENANCE_BASIS), itemCategory)) {
    var arrPerpContractItems = nlapiLookupField('customrecord_contracts', stContractId, 'custrecord_swe_contract_perp_cntrct_itms');
    if (!SWE.Library.misc.isUndefinedNullOrEmpty(arrPerpContractItems)) {
        arrPerpContractItems = arrPerpContractItems.split(',');
        filters = new SWE.Renewals.Library.SearchFilters();
        filters.addFilter('internalid', null, 'anyof', arrPerpContractItems);
        filters.addFilter('custrecord_ci_item', null, 'anyof', stItemId);
        arrResults = SWE.Renewals.Library.searchContractItem(filters, columns);
    }
}


SWV = {};
SWV.renewContract = function () {
    var contractId = nlapiGetRecordId();
    var parameters = '&custparam_swv_script=customscript_swe_create_renewals&custparam_swv_single=T&custparam_swv_contractid=' + contractId;
    var a = {'User-Agent-x': 'SuiteScript-Call'};
    try {
        var url = nlapiResolveURL('SUITELET', 'customscript_swv_ssrunner_su', 'customdeploy_swv_ssrunner_su');
        var response = nlapiRequestURL(url + parameters, null, a);
        var objResponse = JSON.parse(response.getBody());
        if (objResponse) {
            if (objResponse.status == 'ERROR') {
                SWV.displayError(objResponse.details);
            } else if (objResponse.status == 'QUEUED') {
                SWV.displayQueuedInfo(objResponse.details);
            } else if (objResponse.status == 'SUCCESS') {
                var progressBar = new SWV.ProgressBar();
                progressBar.start();
            }
        }
    } catch (ex) {
        SWV.displayError();
    }
};
SWV.displayError = function (errorDetails) {
    var msg = '';
    if (errorDetails) {
        msg = errorDetails;
    } else {
        msg = 'An error was encountered while renewing the contract. Please try again later.';
    }
    showAlertBox('generateAlertBox', 'Contract Renewal Failed', msg, NLAlertDialog.ERROR);
};
SWV.displayQueuedInfo = function (details) {
    showAlertBox('generateAlertBox', 'Contract Renewal Queued', details, NLAlertDialog.INFORMATION);
};
SWV.createContractItems = function () {
    var contractId = nlapiGetRecordId();
    var parameters = '&custparam_swv_script=customscript_swe_create_contract_items&custparam_swv_single=T&custparam_swv_contractid=' + contractId;
    var a = {'User-Agent-x': 'SuiteScript-Call'};
    if (SWV.createCI_blockInstance()) {
        SWV.createCI_displayError('Another instance of R03 is currently running. Please try again later.');
    } else {
        try {
            var url = nlapiResolveURL('SUITELET', 'customscript_swv_ssrunner_su', 'customdeploy_swv_ssrunner_su');
            var response = nlapiRequestURL(url + parameters, null, a);
            var objResponse = JSON.parse(response.getBody());
            if (objResponse) {
                if (objResponse.status == 'ERROR') {
                    SWV.createCI_displayError(objResponse.details);
                } else if (objResponse.status == 'QUEUED') {
                    SWV.createCI_displayQueuedInfo(objResponse.details);
                } else if (objResponse.status == 'SUCCESS') {
                    var progressBar = new SWV.ProgressBar();
                    progressBar.createCI_start();
                }
            }
        } catch (ex) {
            SWV.createCI_displayError();
        }
    }
};
SWV.createCI_blockInstance = function () {
    var result = null, column = [], filter = [], retVal = false;
    try {
        column.push(new nlobjSearchColumn('queue', null, 'group'));
        filter.push(new nlobjSearchFilter('status', null, 'noneof', ['CANCELED', 'COMPLETE', 'FAILED']));
        filter.push(new nlobjSearchFilter('scriptid', 'script', 'is', 'customscript_swe_create_contract_items'));
        result = nlapiSearchRecord('scheduledscriptinstance', null, filter, column);
        if (result && result.length > 0) {
            retVal = true;
        }
    } catch (e) {
        showAlertBox('generateAlertBox', 'Create Contract Items Failed', 'An error was encountered while searching for instances of Create Contract Item script. Please try again later.');
        retVal = true;
    }
    return retVal;
};
SWV.createCI_displayError = function (errorDetails) {
    var msg = '';
    if (errorDetails) {
        msg = errorDetails;
    } else {
        msg = 'An error was encountered while creating the contract items. Please try again later.';
    }
    showAlertBox('generateAlertBox', 'Create Contract Items Failed', msg, NLAlertDialog.ERROR);
};
SWV.createCI_displayQueuedInfo = function (details) {
    showAlertBox('generateAlertBox', 'Create Contract Items Queued', details, NLAlertDialog.INFORMATION);
};
SWV.ProgressBar = function () {
    var ctx = nlapiGetContext();
    var runner = new Ext.util.TaskRunner();
    var update = function () {
        var t = nlapiLookupField('customrecord_contracts', nlapiGetRecordId(), 'custrecord_contract_date_renewed');
        if (!t) {
            if (ctx.getRemainingUsage() < 100) {
                runner.stop(updateProgressBarTask);
                Ext.MessageBox.hide();
                window.location.search += '&custparam_swv_renew=1';
            }
        } else {
            runner.stop(updateProgressBarTask);
            Ext.MessageBox.hide();
            window.location.search += '&custparam_swv_renew=1';
        }
    };
    var updateProgressBarTask = {run: update, interval: 5000};
    this.start = function () {
        Ext.MessageBox.wait('Please Wait...', 'Renewing Contract');
        runner.start(updateProgressBarTask);
    };
    var createCI_update = function () {
        var t = nlapiLookupField('customrecord_contracts', nlapiGetRecordId(), 'custrecord_contract_status');
        if (t == 1) {
            if (ctx.getRemainingUsage() < 100) {
                runner.stop(createCI_updateProgressBarTask);
                Ext.MessageBox.hide();
                window.location.search += '&custparam_swv_createci=4';
            }
        } else {
            runner.stop(createCI_updateProgressBarTask);
            Ext.MessageBox.hide();
            window.location.search += '&custparam_swv_createci=4';
        }
    };
    var createCI_updateProgressBarTask = {run: createCI_update, interval: 5000};
    this.createCI_start = function () {
        Ext.MessageBox.wait('Please Wait...', 'Creating Contract Items');
        runner.start(createCI_updateProgressBarTask);
    };
};