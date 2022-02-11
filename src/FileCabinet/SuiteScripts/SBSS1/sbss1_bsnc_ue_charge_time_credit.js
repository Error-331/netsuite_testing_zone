/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       26 Aug 2020     Eugene Karakovsky
 *
 */
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 *
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function beforeSubmitChargeTimeCredit(type){
    var itemId = nlapiGetFieldValue( 'billingitem' );
    var subLineId = nlapiGetFieldValue( 'subscriptionline' );
    var rate = nlapiGetFieldValue('rate');
    var amount = nlapiGetFieldValue('amount');
    var quantity = nlapiGetFieldValue('quantity');
    if( subLineId ) {
        nlapiLogExecution('DEBUG', ' ' , '===================== subLineId = ' + subLineId);
        var subLine = nlapiLoadRecord( 'subscriptionline', subLineId );
        var subId = subLine.getFieldValue('subscription');
        var subLineEndDate = subLine.getFieldValue('enddate');
        var chargeEndDate = nlapiGetFieldValue('serviceenddate');
        nlapiLogExecution('DEBUG', ' ' , '===================== subId = ' + subId);
        nlapiLogExecution('DEBUG', ' ' , '===================== itemId = ' + itemId);

        if (itemId == sbBSNSettings.bsnc1yrPlanNum/*'808'*/ && parseInt( amount ) == 0 && subLineEndDate == chargeEndDate) {
            var subItemId = sbBSNSettings.bsn1yrItemText;
            var q = 1;
            var line = 2;
            var price = 99;
            var total = 99;
            if (subId) {
                nlapiLogExecution('DEBUG', ' ' , '===================== subId = ' + subId);
                var subscription = nlapiLoadRecord('subscription', subId);
                if (subscription) {
                    var subRevision = subscription.getFieldValue('subscriptionrevision');
                    var subLineBSNId = subscription.getLineItemValue( 'subscriptionline', 'subscriptionline', line );
                    //var subLineBSN = nlapiLoadRecord( 'subscriptionline', subLineBSNId );
                    nlapiLogExecution('DEBUG', ' ' , '===================== subRevision = ' + subRevision);
                    nlapiLogExecution('DEBUG', ' ' , '===================== subLineBSNId = ' + subLineBSNId);
                    nlapiLogExecution('DEBUG', ' ' , '===================== Before Change ' + itemId + ' ========================');
                    nlapiLogExecution('DEBUG', 'rate ', rate);
                    nlapiLogExecution('DEBUG', 'amount ', amount);
                    nlapiLogExecution('DEBUG', 'quantity ', quantity);
                    if( parseInt(amount) == 0 ) {
                        var timeCredit = bsGetRevisionData( subLineBSNId, subRevision );
                        nlapiLogExecution('DEBUG', ' ' , JSON.stringify(timeCredit));
                        nlapiSetFieldValue('rate', timeCredit[0].timeCreditAmount);
                        nlapiSetFieldValue('amount', timeCredit[0].timeCreditAmount);
                        nlapiSetFieldValue('quantity', 1);
                    }
                    /*
                    var priceBookLines = subscription.getLineItemCount('priceinterval');
                    for (var i = priceBookLines; i > 0; i--) {
                        var status = subscription.getLineItemValue('priceinterval', 'status', i);
                        var subLine = subscription.getLineItemValue('priceinterval', 'linenumber', i);
                        var priceItem = subscription.getLineItemValue('priceinterval', 'item', i);
                        if (status == 'ACTIVE' && line == subLine && priceItem == subItemId) {
                            quantity = subscription.getLineItemValue('priceinterval', 'quantity', i);
                            amount = subscription.getLineItemValue('priceinterval', 'recurringamount', i);
                            price = round_currency(total / q, 2);

                            //nlapiSetFieldValue('rate', 57.75);
                            //nlapiSetFieldValue('amount', 57.75 * quantity);
                            break;
                        }
                    }
                    */
                }
            }
        }
    }

    nlapiLogExecution('DEBUG', ' ' , '===================== Update Invoice Lines ========================');
    nlapiLogExecution('DEBUG', 'billingitem ', itemId);
    nlapiLogExecution('DEBUG', 'subscriptionline ', subLineId);
    nlapiLogExecution('DEBUG', 'rate ', rate);
    nlapiLogExecution('DEBUG', 'quantity ', quantity);
    nlapiLogExecution('DEBUG', 'amount ', amount);
}

function bsGetRevisionData( subLine, revision ){
    var subs = [];
    var additionalFilters = new Array();
    additionalFilters[0] = new nlobjSearchFilter('internalid', 'subscriptionline', 'is', subLine);
    //additionalFilters[1] = new nlobjSearchFilter('subscriptionrevision', null, 'is', revision);
    //additionalFilters[2] = new nlobjSearchFilter('changeorder', null, 'is', 143);
    var columns = new Array();
    columns[0] = new nlobjSearchColumn( 'quantity' );
    columns[1] = new nlobjSearchColumn( 'subscriptionrevision' );
    columns[2] = new nlobjSearchColumn( 'internalid', 'subscriptionline' );
    columns[3] = new nlobjSearchColumn( 'changeorder' );
    columns[4] = new nlobjSearchColumn( 'totalcontractvalue' );
    columns[5] = new nlobjSearchColumn( 'recurringamount' );
    /*
    columns[6] = new nlobjSearchColumn( 'changeorder' );
    columns[7] = new nlobjSearchColumn( 'custrecord_bsn_time_credit' );
    columns[8] = new nlobjSearchColumn( 'billingaccount' );
    */
    var searchresults = nlapiSearchRecord('subscriptionlinerevision', null, additionalFilters, columns);
    if( searchresults != null ){
        for( var i = 0; i < searchresults.length; i++ ){
            var rev = searchresults[i].getValue( 'subscriptionrevision' );
            if( rev == revision ) {
                var str1 = searchresults[i].getValue( 'recurringamount' );
                var str2 = searchresults[i].getValue( 'totalcontractvalue' );
                var recurringAmt = parseFloat( str1 == '' ? 0 : str1  );
                var proratedAmt = parseFloat( str2 == '' ? 0 : str2 );
                var timeCreditAmt = proratedAmt ? round_float_to_n_places( recurringAmt - proratedAmt, 2 ) : 0;
                subs.push({
                    quantity: searchresults[i].getValue('quantity'),
                    revision: searchresults[i].getValue('subscriptionrevision'),
                    subLine: searchresults[i].getText('internalid', 'subscriptionline'),
                    changeOrder: searchresults[i].getValue('changeorder'),
                    proratedTotal: proratedAmt,
                    recurringAmount: recurringAmt,
                    timeCreditAmount: timeCreditAmt,
                    /*
                    endUser: searchresults[i].getValue( 'changeorder' ),
                    baStartDate: searchresults[i].getValue( 'startdate', 'billingaccount' ),
                    timeCredit: searchresults[i].getValue( 'custrecord_bsn_time_credit' ),
                    billingaccount: searchresults[i].getValue( 'billingaccount' ),
                    */
                });
            }
        }
    }

    return subs;
}
//bsGetRevisionData( 260, 6 );