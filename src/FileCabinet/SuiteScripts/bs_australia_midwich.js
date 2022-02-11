/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Jan 2019     Eugene Karakovsky
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function australiaSOSaveRecord(){
	var kaja = '1039'/*Inside Sales - International*/;
	var allowedRoles = ['3'/*Administrator*/, '1028'/*Operations Manager*/, kaja];
	var userRole = nlapiGetRole();
	var shipcountry = nlapiGetFieldValue('shipcountry');
	var midwichCustomers = ['2099','2505','3421','52711','122583','134530','142974'];
	var customer = nlapiGetFieldValue('entity');

	if( shipcountry == 'AU' && midwichCustomers.indexOf(customer) == -1 ){
		alert('All orders shipping to Australia should be re-directed to our Australian distributor, Midwich Australia, since there are GST issues with BrightSign shipping directly into Australia\n\nBrightSign Operation Manager Role or Administrator Role can override this.');

		var isBSN = false;
		var contracts = ['595','598','599','600','601','772','732','733','771','706','446'];
		var lineItemCount = nlapiGetLineItemCount('item');
		for (var i = 1; i <= lineItemCount; i++) {
			nlapiSelectLineItem('item', i);
			var itemId = nlapiGetCurrentLineItemValue('item', 'item');
			if( contracts.indexOf( itemId ) == -1 ){
				isBSN = false;
				break;
			}
			if( contracts.indexOf( itemId ) != -1 ){
				isBSN = true;
			}
		}

		if( allowedRoles.indexOf( userRole ) == -1 || ( userRole == kaja && !isBSN ) ){ //Override?
			return false;
		}
	}
	
    return true;
}
