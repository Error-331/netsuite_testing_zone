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
function afterSubmitPaymentTimeCredit(type){
    nlapiLogExecution('DEBUG', 'type', type);
    if( type == 'create' /*|| type == 'delete'*/ ){
        var paymentId = nlapiGetRecordId();
        nlapiLogExecution('DEBUG', 'paymentId', paymentId);
        var lineItemCount = nlapiGetLineItemCount('apply');
        for( var i = 1; i <= lineItemCount; i++ ){
            var apply = nlapiGetLineItemValue( 'apply', 'apply', i );
            //nlapiLogExecution( 'DEBUG', 'Is Applied', apply );
            if( apply == 'T' ) {
                var invoiceId = nlapiGetLineItemValue('apply', 'internalid', i);
                nlapiLogExecution('DEBUG', 'invoice ID', invoiceId);
                if( invoiceId ){
                    var invoice = nlapiLoadRecord( 'invoice', invoiceId );
                    if( invoice ){
                        var invoiceSubscriptions = [];
                        var invoiceItemCount = invoice.getLineItemCount('item');
                        for( var n = 1 ; n <= invoiceItemCount; n++ ) {
                            var subscriptionId = invoice.getLineItemValue( 'item', 'subscription', n );
                            if( subscriptionId && invoiceSubscriptions.indexOf( subscriptionId ) == -1 ) {
                                var chargeId = 0;
                                var chargeSearch = nlapiSearchRecord('charge', null, [['invoice.internalid', 'is', invoiceId], 'AND', ['invoice.line', 'equalto', n]]);
                                nlapiLogExecution('DEBUG', 'chargeSearch ', JSON.stringify(chargeSearch));
                                if (chargeSearch != null && chargeSearch.length) {
                                    chargeId = chargeSearch[0].getId();
                                }
                                var charge = false;
                                if (chargeId) charge = nlapiLoadRecord('charge', chargeId);

                                if (charge) {
                                    var subscription = nlapiLoadRecord('subscription', subscriptionId);
                                    var rootSubId = subscription.getFieldValue('rootsubscription');
                                    if (subscription) {
                                        var currentRevision = subscription.getFieldValue('subscriptionrevision');
                                        var subscriptionLine = charge.getFieldValue('subscriptionline');
                                        var lineQuantity = invoice.getLineItemValue( 'item', 'quantity', n );
                                        var subLineData = bsGetRevisionData(subscriptionLine, lineQuantity, charge.getFieldValue('servicestartdate'), charge.getFieldValue('serviceenddate'));
                                        nlapiLogExecution('DEBUG', 'timeCredit ', JSON.stringify(subLineData));
                                        if (subLineData.length && 0) {
                                            var timeCredit = nlapiCreateRecord('customrecord_bsnc_time_credit');
                                            timeCredit.setFieldValue('custrecord_bs_tc_status', 2);
                                            timeCredit.setFieldValue('custrecord_bs_tc_amount', subLineData[0].timeCreditAmountUSD);
                                            nlapiLogExecution('DEBUG', 'subLineData[0].timeCreditAmountUSD ', subLineData[0].timeCreditAmountUSD);
                                            timeCredit.setFieldValue('custrecord_bs_tc_months', subLineData[0].timeCreditAmountMON);
                                            nlapiLogExecution('DEBUG', 'subLineData[0].timeCreditAmountMON', subLineData[0].timeCreditAmountMON);
                                            timeCredit.setFieldValue('custrecord_bs_tc_item', subLineData[0].item);
                                            nlapiLogExecution('DEBUG', 'subLineData[0].item', subLineData[0].item);
                                            timeCredit.setFieldValue('custrecord_bs_tc_customer_price', subLineData[0].fullPricePerOne);
                                            nlapiLogExecution('DEBUG', 'subLineData[0].fullPricePerOne', subLineData[0].fullPricePerOne);
                                            timeCredit.setFieldValue('custrecord_bs_tc_customer', subscription.getFieldValue('customer'));
                                            nlapiLogExecution('DEBUG', 'subscription.getFieldValue( \'customer\' )', subscription.getFieldValue('customer'));
                                            timeCredit.setFieldValue('custrecord_bs_tc_end_user', subscription.getFieldValue('custrecord_bsn_sub_end_user'));
                                            nlapiLogExecution('DEBUG', 'subscription.getFieldValue( \'custrecord_bsn_sub_end_user\' )', subscription.getFieldValue('custrecord_bsn_sub_end_user'));
                                            timeCredit.setFieldValue('custrecord_bs_tc_network_id', subscription.getFieldValue('custrecord_sub_network_id'));
                                            nlapiLogExecution('DEBUG', 'subscription.getFieldValue( \'custrecord_sub_network_id\' )', subscription.getFieldValue('custrecord_sub_network_id'));
                                            timeCredit.setFieldValue('custrecord_bs_tc_invoice', invoiceId);
                                            nlapiLogExecution('DEBUG', 'invoiceId', invoiceId);
                                            timeCredit.setFieldValue('custrecord_bs_tc_subscription', subscriptionId);
                                            nlapiLogExecution('DEBUG', 'subscriptionId', subscriptionId);
                                            timeCredit.setFieldValue('custrecord_bs_tc_subscription_line', subscriptionLine);
                                            nlapiLogExecution('DEBUG', 'subscriptionLine', subscriptionLine);
                                            timeCredit.setFieldValue('custrecord_bs_tc_change_order', subLineData[0].changeOrder);
                                            nlapiLogExecution('DEBUG', 'subscription.changeOrder', subLineData[0].changeOrder);
                                            timeCredit.setFieldValue('custrecord_bs_tc_subscription_revision', subLineData[0].revision);
                                            nlapiLogExecution('DEBUG', 'currentRevision', subLineData[0].revision);
                                            timeCredit.setFieldValue('custrecord_bs_tc_deposit', paymentId);
                                            nlapiLogExecution('DEBUG', 'paymentId', paymentId);
                                            timeCredit.setFieldValue('custrecord_bs_tc_original_subscription', rootSubId);
                                            nlapiLogExecution('DEBUG', 'rootSubId', rootSubId);
                                            //TODO: Add Original Subscription ID for accumulation
                                            var tcRecord = nlapiSubmitRecord(timeCredit);
                                            nlapiLogExecution('DEBUG', 'Time Credit Record', tcRecord);
                                            invoiceSubscriptions.push( subscriptionId );
                                            charge.setFieldValue('custrecord_bs_time_credit', tcRecord);
                                            nlapiSubmitRecord( charge );
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    if( type == 'delete' ){
        var id = nlapiGetRecordId();
        nlapiLogExecution('DEBUG', 'id', id);
        var lineItemCount = nlapiGetLineItemCount('apply');
        for( var i = 1; i <= lineItemCount; i++ ) {
            var apply = nlapiGetLineItemValue('apply', 'apply', i);
            //nlapiLogExecution( 'DEBUG', 'Is Applied', apply );
            if (apply == 'T') {
                var invoiceId = nlapiGetLineItemValue('apply', 'internalid', i);
                nlapiLogExecution('DEBUG', 'invoice ID', invoiceId);
                var tcSearch = nlapiSearchRecord('customrecord_bsnc_time_credit', null, [['custrecord_bs_tc_invoice', 'is', invoiceId]]);
                if ( tcSearch != null && tcSearch.length) {
                    for( var n = 0; n < tcSearch.length; n++ ) {
                        tcId = tcSearch[n].getId();
                        if( tcId ){
                            var charge = nlapiSearchRecord('charge', null, [['custrecord_bs_time_credit', 'is', tcId]]);
                            nlapiLogExecution('DEBUG', 'chargeSearch ', JSON.stringify(charge));
                            if(charge) {
                                for (var k = 0; k < charge.length; k++) {
                                    nlapiSubmitField('charge', charge[k].getId(), 'custrecord_bs_time_credit', '')
                                }
                            }
                            nlapiDeleteRecord( 'customrecord_bsnc_time_credit', tcId );
                        }
                    }
                }
            }
        }
    }
}

function bsGetRevisionData( subLine, lineQuantity, effectiveDate, endDate ){
    var subs = [];
    var additionalFilters = new Array();
    additionalFilters[0] = new nlobjSearchFilter('internalid', 'subscriptionline', 'is', subLine);
    //additionalFilters[1] = new nlobjSearchFilter('effectivedate', 'changeorder', 'is', effectiveDate);
    //additionalFilters[2] = new nlobjSearchFilter('changeorder', null, 'is', 143);
    var columns = new Array();
    columns[0] = new nlobjSearchColumn( 'quantity' );
    columns[1] = new nlobjSearchColumn( 'subscriptionrevision' );
    columns[2] = new nlobjSearchColumn( 'internalid', 'subscriptionline' );
    columns[3] = new nlobjSearchColumn( 'changeorder' );
    columns[4] = new nlobjSearchColumn( 'totalcontractvalue' );
    columns[5] = new nlobjSearchColumn( 'recurringamount' );
    columns[6] = new nlobjSearchColumn( 'item', 'subscriptionline' );
    columns[7] = new nlobjSearchColumn( 'effectivedate', 'changeorder' );
    columns[8] = new nlobjSearchColumn( 'enddate', 'subscriptionline' );
    var searchresults = nlapiSearchRecord('subscriptionlinerevision', null, additionalFilters, columns);
    if( searchresults != null ){
        for( var i = 0; i < searchresults.length; i++ ){
            var rev = searchresults[i].getValue( 'subscriptionrevision' );
            var revDate = searchresults[i].getValue('effectivedate', 'changeorder');
            var subLineEndDate = searchresults[i].getValue('enddate', 'subscriptionline');
            var quantity = parseInt( searchresults[i].getValue('quantity') );
            if( revDate == effectiveDate && subLineEndDate == endDate && quantity == lineQuantity ) {
                var str1 = searchresults[i].getValue( 'recurringamount' );
                var str2 = searchresults[i].getValue( 'totalcontractvalue' );
                var recurringAmt = parseFloat( str1 == '' ? 0 : str1  );
                var proratedAmt = parseFloat( str2 == '' ? 0 : str2 );
                var fullPricePerOne = round_float_to_n_places( recurringAmt / quantity );
                var timeCreditAmt = proratedAmt ? round_float_to_n_places( round_float_to_n_places( recurringAmt, 2 ) - round_float_to_n_places( proratedAmt, 2 ), 2 ) : 0;
                var timeCreditAmtMon = fullPricePerOne ? round_float_to_n_places( timeCreditAmt / fullPricePerOne * 12, 2 ) : 0;
                subs.push({
                    quantity: quantity,
                    revision: rev,
                    subLine: searchresults[i].getText('internalid', 'subscriptionline'),
                    changeOrder: searchresults[i].getValue('changeorder'),
                    proratedTotal: proratedAmt,
                    recurringAmount: recurringAmt,
                    timeCreditAmountUSD: timeCreditAmt,
                    timeCreditAmountMON: timeCreditAmtMon,
                    fullPricePerOne: fullPricePerOne,
                    item: searchresults[i].getValue('item', 'subscriptionline'),
                    effectiveDate: effectiveDate,
                    endDate: endDate,
                });
            }
        }
    }
    subs.sort(function(a,b){if(a.changeOrder > b.changeOrder)return -1;if(a.changeOrder < b.changeOrder)return 1;return 0});
    return subs;
}