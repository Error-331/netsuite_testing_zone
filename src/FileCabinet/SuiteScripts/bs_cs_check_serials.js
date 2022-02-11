/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Dec 2018     Eugene Karakovsky
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type){
   
}

function bsCheckSerials(){
	SIT.checkSerials();
}

function bs_search_serial( serial ){
	var existingRecords = new Array();
	var additionalFilters = new Array();
		additionalFilters[0] = new nlobjSearchFilter('inventorynumber', null, 'is', serial);
	var columns = new Array();
    	columns[0] = new nlobjSearchColumn( 'inventorynumber' );
    	columns[1] = new nlobjSearchColumn( 'item' );
    	columns[2] = new nlobjSearchColumn( 'location' );
	var searchresults = nlapiSearchRecord( 'inventorynumber', null, additionalFilters, columns );
	
	var serialInfo = ['', ''];
	if( !isNullorEmpty(searchresults) && searchresults.length ){
		var item = searchresults[0].getText('item');
		var inventorynumber = searchresults[0].getValue('inventorynumber');
		var location = searchresults[0].getText('location');
		serialInfo = [item, location];
	}
	return serialInfo;
}

var serialsQuantity = 0;
var finished = false;
var counted = false;
var inventoryNumbers = [];
var duplicates = 0;
var serials = [];
SIT = {};
SIT.checkSerials = function () {
    var inventoryNumberStr = nlapiGetFieldValue('bs_serials');
	if( !counted && inventoryNumberStr != null ){
		inventoryNumbers = inventoryNumberStr.split(/[,\r\n\t ]/);
		if( inventoryNumbers.length ){
			serials = bsRemoveDuplicates( inventoryNumbers );
			serialsQuantity = inventoryNumbers.length;
		}
		console.log(serials.length);
		duplicates = inventoryNumbers.length - serials.length;
	    if( duplicates ){
	    	inventoryNumbers = serials;
	    	serialsQuantity = inventoryNumbers.length;
	    }
		counted = true;
	}
    try {
    	if( counted && !finished && serialsQuantity ){
	        var progressBar = new SIT.ProgressBar();
            progressBar.start();
    	}
    } catch (ex) {
    	console.log(ex);
        SIT.displayError();
    }
};
SIT.displayError = function (errorDetails) {
    var msg = '';
    if (errorDetails) {
        msg = errorDetails;
    } else {
        msg = 'An error was encountered while checking serials. Please try again later.';
    }
    showAlertBox('generateAlertBox', 'Serials Check Failed', msg, NLAlertDialog.ERROR);
};
SIT.displayQueuedInfo = function (details) {
    showAlertBox('generateAlertBox', 'Fulfillment Queued', details, NLAlertDialog.INFORMATION);
};
SIT.ProgressBar = function () {
	var currentSerial = 0;
	var currentLine = 0;
    var runner = new Ext.util.TaskRunner();
    var errors = "";
    var ernum = 0;
    jQuery('#bs_results_log_fs').text('');
    jQuery('#bs_results_good_fs').text('');
    jQuery('#bs_results_bad_fs').text('');
    var update = function () {
    	var usage = nlapiGetContext().getRemainingUsage();

    	// If the script's remaining usage points are bellow 1,000 ...       
    	if (usage < 1000) 
    	{
    		console.log(usage);
    		/*
    		// ...yield the script
    		var state = nlapiYieldScript();
    		// Throw an error or log the yield results
    		if (state.status == 'FAILURE')
    			throw "Failed to yield script";
    		else if (state.status == 'RESUME')
    			console.log('Resuming script');
    			*/
    	}
        if (finished || currentSerial == serialsQuantity) {
        	var left = "";
        	jQuery('#bs_results_log_fs').prepend('<span style="font-weight:bold;">' + (currentSerial + duplicates) + ' total</span><br><br>');
        	if( ernum ){
        		jQuery('#bs_results_log_fs').prepend('<span style="color: red;">' + ernum + ' errors</span> - ');
        		jQuery('#bs_results_bad_fs').prepend('<span style="font-weight:bold;">BAD SERIALS (' + ernum + ')</span><br><br>');
        	}
        	jQuery('#bs_results_log_fs').prepend('<span style="color: green;">' + currentLine + ' good</span> - ');
        	jQuery('#bs_results_good_fs').prepend('<span style="font-weight:bold;">GOOD SERIALS (' + currentLine + ')</span><br><br>');
        	jQuery('#bs_results_log_fs').prepend('<br><span style=";">' + duplicates + ' duplicates</span> - ');
            runner.stop(updateProgressBarTask);
            Ext.MessageBox.hide();
            //closePopup(true);
        } else {
        	var res = bs_search_serial( inventoryNumbers[currentSerial] );
	        if( res[0] != '' ){
	        	jQuery('#bs_results_log_fs').append((currentSerial + 1) + ') <span style="color:green">' + inventoryNumbers[currentSerial] + ' - ' + res[0] + ' - ' + res[1] + '</span><br>');
	        	jQuery('#bs_results_good_fs').append('<span style="color:green">' + inventoryNumbers[currentSerial] + '</span><br>');
	        	currentLine++;
	        } else {
	        	ernum++;
	        	jQuery('#bs_results_log_fs').append((currentSerial + 1) + ') <span style="color:red">' + inventoryNumbers[currentSerial] + ' - Not Found</span><br>');
	        	jQuery('#bs_results_bad_fs').append('<span style="color:red">' + inventoryNumbers[currentSerial] + '</span><br>');
	        }
	        currentSerial++;
	        Ext.MessageBox.updateText('Currently: ' + currentSerial + '/' + serialsQuantity);
        }
    };
    var updateProgressBarTask = {run: update, interval: 10};
    this.start = function () {
        Ext.MessageBox.wait('Please Wait...', 'Checking Serials');
        runner.start(updateProgressBarTask);
    };
};

function bsRemoveDuplicates(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
         var item = a[i];
         if(seen[item] !== 1 && item!== '') {
               seen[item] = 1;
               out[j++] = item;
         }
    }
    return out;
}

function isNullorEmpty(strVal){
	return (strVal == null || strVal == '');
}