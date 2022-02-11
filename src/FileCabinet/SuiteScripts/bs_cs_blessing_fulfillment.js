/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Oct 2018     Eugene Karakovsky
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function blessingFulfillmentSaveRecord(){
	var proceed = true;
	var line = "";
	var deviceModel = "";
	try{
		var lineItemCount = nlapiGetLineItemCount('item');
        //var itemIds = ['622','623','656','657']; // Dev
        var itemIds = ['622','623','687','688']; // Prod
		
		var orderId = nlapiGetFieldValue('createdfrom');
		var orderName = "";
		var sOrder = "";
		console.log("orderId: " + orderId);
		console.log("lineItemCount: " + lineItemCount);
		
		for(var n = 1; n <= lineItemCount; n++) {
	    	var itemId = nlapiGetLineItemValue('item', 'item', n);
	    	var fulfill = nlapiGetLineItemValue("item", "itemreceive", n);
	    	console.log("itemId: " + itemId);
	    	console.log("fulfill: " + fulfill);
	    	console.log("_.contains(itemIds, itemId): " + _.contains(itemIds, itemId));
	    	if(_.contains(itemIds, itemId) && fulfill == "T"){
	    		var itemDescription = nlapiGetLineItemValue("item", "itemdescription", n);
	    		if(!isNullorEmpty(orderId)){
	    			var quantity = nlapiGetLineItemValue("item", "quantity", n);
					var deviceSerials = blessParseSerials( itemDescription );
					console.log("quantity: " + quantity);
			    	console.log("deviceSerials: " + deviceSerials);
					if( !blessCompareQuantity( deviceSerials, quantity ) ){
						line += "<br>Line Item: " + n + ", Quantity: " + quantity + ", Serials: " + blessCountDescriptionSerials( deviceSerials ) + "<br>";
						proceed = false;
					}
					if( !blessValidateModels( deviceSerials ) ){
						deviceModel += "<br>Line Item: " + n + " is missing Device Model for Serials list.<br>";
						proceed = false;
					}
	    		}
	    	}
		}
	}catch(e){
		nlapiLogExecution('DEBUG', 'Exception ' + e.message );
		nlapiLogExecution('DEBUG', 'Exception ' + e.name);
		nlapiLogExecution('DEBUG', 'Exception ' + e.toString());
	}
	
	if( !proceed ){
		var errorText = "ERROR";
		if( !isNullorEmpty( line ) ){
			errorText += '<br>Quantity of Serials provided and Blessings quantity do not match.<br>Please go back to your Sales order and update Item description with serials first.' + line;
		}
		if( !isNullorEmpty( deviceModel ) ){
			errorText += deviceModel;
		}
		Ext.MessageBox.alert('AC3 Blessing Serials', errorText);
	}
	//return false;
	return proceed;
}

function blessParseSerials( itemDescription ){
	var deviceSerials = new Array();
	
	itemDescription = itemDescription.replace(/\r/gm, '');
	var serialsHeader = "";
	var model = "";
	var serials = new Array();
	var parseSerials = false;
	var lines = itemDescription.split('\n');
	for( var k = 0; k < lines.length; k++ ){
		serialsHeader = lines[k].match(/^Serials:/i);
		//console.log("serialsHeader: " + serialsHeader);
		//console.log("isNullorEmpty(serialsHeader): " + isNullorEmpty(serialsHeader));
		if( parseSerials && lines[k].match(/:/i) ){
			deviceSerials.push({"model": model, "serials": serials});
			model = "";
			parseSerials = false;
			serials = new Array();
		}
		if( serialsHeader && !parseSerials){
			parseSerials = true;
    	}

        if( isNullorEmpty(serialsHeader) && parseSerials ){
            if( !isNullorEmpty( lines[k].trim() ) ){
                serials.push( lines[k].trim() );
            }
        }
		if( lines[k].match(/^Model:/i) && isNullorEmpty( model )){
			model = lines[k].substring(6).trim();
    	}
		console.log("model: " + model);
		console.log("parseSerials: " + parseSerials);
		console.log("serials: " + serials);
		console.log("line: " + lines[k]);
    }
	if( isNullorEmpty(serialsHeader) && parseSerials ){
		deviceSerials.push({"model": model, "serials": serials});
	}
	console.log(deviceSerials);
	return deviceSerials;
}

function blessCompareQuantity( deviceSerials, quantity ){
	var totalSerials = blessCountDescriptionSerials( deviceSerials );
	console.log("totalSerials: " + totalSerials);
	if( totalSerials == quantity ){
		return true;
	}
	
	return false;
}

function blessValidateModels( deviceSerials ){
	for( var i = 0; i < deviceSerials.length; i++ ){
		if( isNullorEmpty( deviceSerials[i].model ) ){
			return false;
		}
	}
	
	return true;
}

function blessCountDescriptionSerials( deviceSerials ){
	var totalSerials = 0;
	for( var i = 0; i < deviceSerials.length; i++ ){
		totalSerials += deviceSerials[i].serials.length;
	}

	return totalSerials;
}

function isNullorEmpty(strVal){
	return (strVal == null || strVal == '');
}

function replacer(key, value){
    if (typeof value == "number" && !isFinite(value)){
        return String(value);
    }
    return value;
}