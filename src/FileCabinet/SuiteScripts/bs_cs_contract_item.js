/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Sep 2017     Eugene
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord contractitem 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function contractItemPageInit(type){
	var qty = nlapiGetField("custrecord_ci_quantity");
	if(!isNullorEmpty(qty)){
		nlapiGetField('custrecord_ci_quantity').setDisplayType('normal');
	}
}

function isNullorEmpty(strVal){
	return (strVal == null || strVal == '');
}