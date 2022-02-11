/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Aug 2017     Eugene Karakovsky
 *
 */


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
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function memoPageInit(type){
	var userId = nlapiGetFieldValue("entity");
	//if(isNullorEmpty(userId)){
		nlapiGetField('entity').setDisplayType('normal');
	//}
  
    var order_type = nlapiGetField('custbody_order_type');
  //console.log("order = " + order_type);
  if(!isNullorEmpty(order_type)){
  	order_type.setDisplayType('normal');
  }
  
	  var endUser = nlapiGetFieldValue('custbody_end_user');
	  //console.log(endUser);
	  if(!isNullorEmpty(userId) && isNullorEmpty(endUser)){
	    nlapiSetFieldValue('custbody_end_user', userId);
	  }
	  var terms = nlapiGetFieldValue('custbody_renewal_terms');
	  //console.log(terms);
	  if(isNullorEmpty(terms)){
	  	nlapiSetFieldValue('custbody_renewal_terms', 12);
	  }
  
  if(type == "create" || type == "copy"){
		  var lineItemCount = nlapiGetLineItemCount('item');
		  if( lineItemCount ){
			var month = moment().format('MMM').toLowerCase();
			for (var i = 1; i <= lineItemCount; i++) {
				var fiscal_qtr = nlapiGetLineItemValue('item', 'custcol_bs_fiscal_quarter', i);
				if( isNullorEmpty(fiscal_qtr) ){
					nlapiSetLineItemValue('item', 'custcol_bs_fiscal_quarter', i, Qtr[month]);
				}
			}
		  }
	  }
}

function isNullorEmpty(strVal){
	return (strVal == null || strVal == '');
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function memoFieldChanged(type, name, linenum){
	if(name == "entity"){
		var userId = nlapiGetFieldValue("entity");
		  if(!isNullorEmpty(userId)){
		    nlapiSetFieldValue('custbody_end_user', userId);
		  }
		  var terms = nlapiGetFieldValue('custbody_renewal_terms');
		  //console.log(terms);
		  if(isNullorEmpty(terms)){
		  	nlapiSetFieldValue('custbody_renewal_terms', 12);
		  }
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord creditmemo
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function memoValidateLine(type){
	var recordType = nlapiGetRecordType();
        if (type === 'item') {

            if (recordType === 'creditmemo') {

                var currentValue = nlapiGetCurrentLineItemValue('item', 'custcol_bs_fiscal_quarter');
                if (currentValue === '') {
                    var month = moment().format('MMM').toLowerCase();
                    nlapiSetCurrentLineItemValue('item', 'custcol_bs_fiscal_quarter', Qtr[month], false, true);
                }
                
            }
        }
	
    return true;
}