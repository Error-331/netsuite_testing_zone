/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 *
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function subCashSaleBeforeSubmit(type) {
    var billingAccount = nlapiGetFieldValue( 'billingaccount' );
    if( type == 'create' && billingAccount ){
        nlapiLogExecution('DEBUG', '', '============Billing Operation===========');
        nlapiLogExecution('DEBUG', 'Billing Account', billingAccount);
        var ba = nlapiLoadRecord('billingaccount', billingAccount);
        if( ba ){
            var creditCardID = ba.getFieldValue( 'custrecord_sb_cc_id' );
            nlapiLogExecution('DEBUG', 'Billing Account CC', creditCardID);
            if( creditCardID ){
                var cus = nlapiLoadRecord( 'customer', ba.getFieldValue( 'customer' ) );
                if( cus ){
                    var lineCount = cus.getLineItemCount('creditcards');
                    for( var k = 1; k <= lineCount; k++ ){
                        var ccID = cus.getLineItemValue( 'creditcards', 'internalid', k );
                        if( ccID == creditCardID ) {
                            nlapiLogExecution('DEBUG', 'Billing Account CC Applied', 'YES');
                            //var ccName = cus.getLineItemValue('creditcards', 'ccname', k);
                            //var ccNumber = cus.getLineItemValue('creditcards', 'ccnumber', k);
                            //var ccExpDate = cus.getLineItemValue('creditcards', 'ccexpiredate', k);
                            var ccType = cus.getLineItemValue('creditcards', 'paymentmethod', k);
                            nlapiSetFieldValue( 'paymentmethod', ccType );
                            nlapiSetFieldValue( 'creditcard', creditCardID );
                            break;
                        }
                    }
                }
            }
        }
    }
}