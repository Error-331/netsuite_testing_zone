/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       26 Feb 2021     Eugene Karakovsky
 *
 */
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord salesorder
 *
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function baBeforeLoad(type, form, request){
    var context = nlapiGetContext();
    nlapiLogExecution('DEBUG', 'context', context.getExecutionContext());
    var cus = false;
    var customer = null;
    if( request ){
        customer = request.getParameter('customer')||'';
    }
    var customerID = nlapiGetFieldValue( 'customer' );
    nlapiLogExecution('DEBUG', 'customerID', customerID);
    nlapiLogExecution('DEBUG', 'request', JSON.stringify(request));

    if( customerID ) customer = customerID;
    nlapiLogExecution('DEBUG', 'customer', customer);

    if(!isNullorEmpty( customer )) {
        cus = nlapiLoadRecord('customer', customer);
        nlapiLogExecution('DEBUG', 'cus', cus);
    }

    if ( type == 'create' && context.getExecutionContext() !== 'scheduled' ) {
        if( context.getExecutionContext() !== 'csvimport' ) {
            var startDate = request.getParameter('strtdt') || '';
            nlapiLogExecution('DEBUG', 'startDate', startDate);
            nlapiSetFieldValue('startdate', startDate);
        }
        nlapiSetFieldValue('location', 25);//Corporate
        nlapiSetFieldValue('class', 5);//400
        nlapiSetFieldValue('department', 1);//100
        nlapiSetFieldValue('invoiceform', 118);//International Invoice
        nlapiSetFieldValue('customerdefault', "T");//Set Billing Account as Default to cut extra actions
        nlapiSetFieldValue('billingschedule', sbBSNSettings.billingSchedule12mAnniversary);//Monthly Anniversary
        nlapiLogExecution('DEBUG', 'cus', cus);
        if( cus ){
            var defShipping = '';
            var defBilling = '';
            var lineCount = cus.getLineItemCount('addressbook');
            nlapiLogExecution('DEBUG', 'lineCount', lineCount);
            for( var i = 1; i <= lineCount; i++ ){
                var isShipping = cus.getLineItemValue( 'addressbook', 'defaultshipping', i ) == 'T';
                var isBilling = cus.getLineItemValue( 'addressbook', 'defaultbilling', i ) == 'T';
                if( isShipping ) nlapiSetFieldValue('shipaddresslist', cus.getLineItemValue( 'addressbook', 'id', i ));
                if( isBilling ) nlapiSetFieldValue('billaddresslist', cus.getLineItemValue( 'addressbook', 'id', i ));
            }
        }
    }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function baBeforeSubmit(type){
    var context = nlapiGetContext();
    nlapiLogExecution('DEBUG', 'context', context.getExecutionContext());
    var customerId = nlapiGetFieldValue( 'customer' );
    if ( type == 'create' && context.getExecutionContext() == 'csvimport' && !isNullorEmpty( customerId ) ) {
        var cus = nlapiLoadRecord('customer', customerId);
        nlapiLogExecution('DEBUG', 'cus', cus);
        if( cus ) {
            var defShipping = '';
            var defBilling = '';
            var lineCount = cus.getLineItemCount('addressbook');
            nlapiLogExecution('DEBUG', 'lineCount', lineCount);
            for (var i = 1; i <= lineCount; i++) {
                var isShipping = cus.getLineItemValue('addressbook', 'defaultshipping', i) == 'T';
                var isBilling = cus.getLineItemValue('addressbook', 'defaultbilling', i) == 'T';
                if (isShipping) nlapiSetFieldValue('shipaddresslist', cus.getLineItemValue('addressbook', 'id', i));
                if (isBilling) nlapiSetFieldValue('billaddresslist', cus.getLineItemValue('addressbook', 'id', i));
            }
        }
    }
    var addressId = nlapiGetFieldValue( 'billaddresslist' );
    if( !isNullorEmpty( addressId ) ){
        //nlapiLogExecution('DEBUG', 'addressId', addressId );
        var custRec = nlapiLoadRecord( 'customer', customerId );
        //nlapiLogExecution('DEBUG', 'custRec', custRec );
        var lineCount = custRec.getLineItemCount( 'addressbook' );
        //nlapiLogExecution('DEBUG', 'lineCount', lineCount );
        for( var i = 0; i < lineCount; i++ ){
            var lineAddressId = custRec.getLineItemValue( 'addressbook', 'internalid', i );
            var lineCountryCode = custRec.getLineItemValue( 'addressbook', 'country', i );
            if( lineAddressId == addressId ){
                nlapiSetFieldValue( 'custrecord_ba_country_code', lineCountryCode );
            }
        }
    } else {
        nlapiSetFieldValue( 'custrecord_ba_country_code', '' );
    }
}

function isNullorEmpty(strVal){
    return (strVal == null || strVal == '');
}
