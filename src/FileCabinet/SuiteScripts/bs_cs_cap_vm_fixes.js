/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Nov 2017     Eugene Karakovsky
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function vmPageInit(type){
	var context = nlapiGetContext();
    if (context.getExecutionContext() != 'webstore') {
		//nlapiGetField('entity').setDisplayType('normal');
		//nlapiLogExecution('DEBUG', 'yES');
    }
}



/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord salesorder
 *
 * @returns {Boolean} True to continue save, false to abort save
 */
function testBeforeSave(){
    Ext.MessageBox.alert( "dafsd" , "shippingcost: " + nlapiGetFieldValue('shippingcost') );
    return false;
}