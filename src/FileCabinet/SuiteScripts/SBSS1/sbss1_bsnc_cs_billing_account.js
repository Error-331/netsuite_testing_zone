/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */
function bsncBillingAccountFieldChanged(type, name) {
    console.log('changed: ' + name);
    if ( name == 'custpage_sb_credit_cards' ) {
        var cardID = nlapiGetFieldValue('custpage_sb_credit_cards');
        console.log('cardID: ' + cardID);
        nlapiSetFieldValue('custrecord_sb_cc_id', cardID);
    }
}