/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Jul 2017     Eugene
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord customrecord_bs_evaluation 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function evaluationPageInit(type){
}

jQuery( document ).ready(function() {
	var isDraft = nlapiLookupField("customrecord_bs_evaluation", nlapiGetRecordId(), "custrecord_bse_draft");

	if( isDraft == "T" ){
		showAlertBox('alert_draft', 'Evaluation is in Draft Mode', "This Evaluation is in Draft Mode and can not be sent to anybody. Uncheck Draft checkbox to make evaluation visible.", NLAlertDialog.TYPE_MEDIUM_PRIORITY);
	}
});

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord customrecord_bs_evaluation
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function evaluationFieldChanged(type, name, linenum){
}

function saveSubmitButton(){
}

function isNullorEmpty(strVal){
	return (strVal == null || strVal == '');
}
