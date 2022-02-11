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
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function beforeLoadInvoiceTimeCredit(type, form, request){
    /*
    nlapiLogExecution('DEBUG', 'type', type);
    nlapiLogExecution('DEBUG', 'recurringbill', nlapiGetFieldValue('recurringbill'));
    nlapiSetFieldValue('recurringbill', 'F');
    nlapiSetFieldValue('asofdate', '3/31/2022');
    nlapiLogExecution('DEBUG', 'recurringbill', nlapiGetFieldValue('recurringbill'));
    if( request ) {
        var recurringbill = request.getParameter('bs_recurringbill');
        var trandate = request.getParameter('bs_trandate');
        var whichchargestoadd = request.getParameter('bs_whichchargestoadd');
        if (!isNullorEmpty(recurringbill)) {
            nlapiSetFieldValue('recurringbill', recurringbill);
            nlapiLogExecution('DEBUG', 'recurringbill', recurringbill);
            nlapiSetFieldValue('trandate', trandate);
            nlapiLogExecution('DEBUG', 'trandate', trandate);
            nlapiSetFieldValue('whichchargestoadd', whichchargestoadd);
            nlapiLogExecution('DEBUG', 'whichchargestoadd', whichchargestoadd);
        }
    }
    */
}

function beforeSubmitInvoiceTimeCredit(type) {
    nlapiLogExecution('DEBUG', 'type', type);
    var i, lineItemCount;
    var status = nlapiGetFieldValue('status');
    var isSubInvoice = false;
    var useSub = '';

    if (type == 'create' || type == 'edit') {
        var newInv = nlapiGetNewRecord({recordmode: 'dynamic'});
        //logInvoiceData( newInv, 'Invoice Before Submit Start' );
        //newInv.setFieldValue('recurringbill', 'F');
        var singleSubID = newInv.getFieldValue('custbody_sb_single_sub_invoice');
        if( isNullorEmpty( singleSubID ) ) singleSubID = false;
        var tcItemIDs = [/*bsncTimeCredit*/];

        lineItemCount = newInv.getLineItemCount('item');
        nlapiLogExecution('DEBUG', 'singleSubID', singleSubID);
        nlapiLogExecution('DEBUG', 'lineItemCount', lineItemCount);
        if( !isNullorEmpty( singleSubID ) ){
            /*
            var subRecord = nlapiLoadRecord('subscription', singleSubID);
            var sDate = subRecord.getFieldValue('startdate');
            var eDate = subRecord.getFieldValue('enddate');
            newInv.setFieldValue('duedate', sDate);
            newInv.setFieldValue('startdate', sDate);
            newInv.setFieldValue('enddate', eDate);
            newInv.setFieldValue('asofdate', sDate);
            */

            for (i = lineItemCount; i > 0; i--) {
                var subID = newInv.getLineItemValue('item', 'subscription', i);
                var item = parseInt(newInv.getLineItemValue('item', 'item', i));
                var subscription = parseInt(newInv.getLineItemValue('item', 'subscription', i));
                nlapiLogExecution('DEBUG', arguments.callee.name + ': subscription ' + i, subscription);
                if (_.contains(tcItemIDs, item)) {
                    nlapiLogExecution('DEBUG', arguments.callee.name + ' :Removing line #', i);
                    newInv.removeLineItem('item', i);
                }

                nlapiLogExecution('DEBUG', arguments.callee.name + ': singleSubID != subID ' + i, singleSubID != subID);
                if( singleSubID != subID ){
                    nlapiLogExecution('DEBUG', arguments.callee.name + ' :Removing wrong sub line #', i);
                    newInv.removeLineItem('item', i);
                }
                isSubInvoice = true;
                useSub = subID;
                /*TODO: check if renew*/
            }
        } else {
            /*
            for (i = 1; i <= lineItemCount; i++) {
                var lineSub = newInv.getLineItemValue('item', 'subscription', i);
                if( !isNullorEmpty( lineSub ) ){
                    var lineSubRecord = nlapiLoadRecord('subscription', lineSub);
                    var invStartDate = newInv.getFieldValue('startdate');
                    var invEndDate = newInv.getFieldValue('enddate');
                    var subStartDate = lineSubRecord.getFieldValue('startdate');
                    var subEndDate = lineSubRecord.getFieldValue('enddate');
                    if( isNullorEmpty( invStartDate ) || nlapiStringToDate( invStartDate ) > nlapiStringToDate( subStartDate ) ) {
                        newInv.setFieldValue('startdate', subStartDate);
                        newInv.setFieldValue('enddate', subEndDate);
                    }

                    if( isNullorEmpty( invEndDate ) || nlapiStringToDate( invEndDate ) < nlapiStringToDate( subEndDate ) ) {
                        newInv.setFieldValue('enddate', subEndDate);
                    }
                }
            }

            for (i = lineItemCount; i > 0; i--) {
                var subID = newInv.getLineItemValue('item', 'subscription', i);
                var item = parseInt(newInv.getLineItemValue('item', 'item', i));
                var subscription = parseInt(newInv.getLineItemValue('item', 'subscription', i));
                //nlapiLogExecution('DEBUG', arguments.callee.name + ': subscription ' + i, subscription);
                if (_.contains(tcItemIDs, item)) {
                    nlapiLogExecution('DEBUG', arguments.callee.name + ' :Removing line #', i);
                    newInv.removeLineItem('item', i);
                }
            }

            */
        }

        //logInvoiceData( newInv, 'Invoice Before Submit End' );
    }

    // Time Credit Items Code End
}


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
function afterSubmitInvoiceTimeCredit(type){
    nlapiLogExecution('DEBUG', 'type', type);
    if( type == 'create' || type == 'edit' ) {
        var invoiceId = nlapiGetRecordId();

        var newInv = nlapiLoadRecord( 'invoice', invoiceId );
        //logInvoiceData( newInv, 'Invoice After Submit Start' );

        var lineItemCount = nlapiGetLineItemCount('item');
        //nlapiLogExecution('DEBUG', arguments.callee.name + ': lineItemCount', lineItemCount);
        var hasTimeCredit = false;
        for (var i = 1; i <= lineItemCount; i++) {
            if( nlapiGetLineItemValue('item', 'subscription', i) == sbBSNSettings.bsnc1yrPlanNum ){
                hasTimeCredit = true;
                break;
            }
        }
        var subscriptionLines = [];
        for (var n = 1; n <= lineItemCount; n++) {
            var itemId = nlapiGetLineItemValue('item', 'item', n);
            var subId = nlapiGetLineItemValue('item', 'subscription', n);
            var rate = nlapiGetLineItemValue('item', 'rate', n);
            var subItemId = sbBSNSettings.bsnc1yrItemText;
            var creditLimitAmount = 0;
            var amount = 99;
            /*
            nlapiLogExecution('DEBUG', ' ', '===================== Update Invoice Line ' + n + ' ========================');
            nlapiLogExecution('DEBUG', 'itemId ' + n, itemId);
            nlapiLogExecution('DEBUG', 'subId ' + n, subId);
            nlapiLogExecution('DEBUG', 'rate ' + n, rate);
            nlapiLogExecution('DEBUG', 'creditLimitAmount ' + n, creditLimitAmount);
*/
            if (subId && 0) {

                var subscription = nlapiLoadRecord('subscription', subId);
                if (subscription) {
                    var subCustomer = subscription.getFieldValue('customer');
                    var subEndUser = subscription.getFieldValue('custrecord_bsn_sub_end_user');
                    if( !isNullorEmpty( subEndUser ) && subEndUser != subCustomer ) {
                        var chargeId = 0;
                        var chargeSearch = nlapiSearchRecord('charge', null, [['invoice.internalid', 'is', invoiceId], 'AND', ['invoice.line', 'equalto', n]]);
                        nlapiLogExecution('DEBUG', 'chargeSearch ', JSON.stringify(chargeSearch));
                        if (chargeSearch != null && chargeSearch.length) {
                            chargeId = chargeSearch[0].getId();
                        }
                        var charge = false;
                        if (chargeId) charge = nlapiLoadRecord('charge', chargeId);

                        if (charge) {
                            var subscriptionLine = charge.getFieldValue('subscriptionline');
                            var lineQuantity = nlapiGetLineItemValue('item', 'quantity', n);
                            if (subscriptionLines.indexOf(subscriptionLine) == -1) {
                                var subscriptionRevision = subscription.getFieldValue('subscriptionrevision');
                                nlapiLogExecution('DEBUG', 'subscriptionLine ' + n, subscriptionLine);
                                nlapiLogExecution('DEBUG', 'subscriptionRevision ' + n, subscriptionRevision);
                                var timeCredit = bsGetRevisionData(subscriptionLine, lineQuantity, charge.getFieldValue('servicestartdate'), charge.getFieldValue('serviceenddate'));
                                nlapiLogExecution('DEBUG', 'timeCredit ', JSON.stringify(timeCredit));
                                if (timeCredit.length && !hasTimeCredit) {
                                    var invoice = nlapiLoadRecord('invoice', invoiceId);
                                    if (invoice) {
                                        invoice.selectNewLineItem('item');
                                        invoice.setCurrentLineItemValue('item', 'item', sbBSNSettings.bsncTimeCredit);
                                        invoice.setCurrentLineItemValue('item', 'quantity', 1);
                                        invoice.setCurrentLineItemValue('item', 'description', "Time Credit.\nChange Order: " + timeCredit[0].changeOrder + "\nSubscription: " + subscription.getFieldValue('name'));
                                        invoice.setCurrentLineItemValue('item', 'price', -1);
                                        invoice.setCurrentLineItemValue('item', 'rate', timeCredit[0].timeCreditAmountUSD);
                                        invoice.setCurrentLineItemValue('item', 'custcol_bs_subscription_line', subscriptionLine);
                                        invoice.commitLineItem('item');
                                    }
                                    nlapiSubmitRecord(invoice);
                                    subscriptionLines.push(subscriptionLine);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function isNullorEmpty(strVal){
    return (strVal == null || strVal == '');
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
    nlapiLogExecution('DEBUG', 'searchresults ', JSON.stringify(searchresults));
    if( searchresults != null ){
        for( var i = 0; i < searchresults.length; i++ ){
            var rev = searchresults[i].getValue( 'subscriptionrevision' );
            var revDate = searchresults[i].getValue('effectivedate', 'changeorder');
            var subLineEndDate = searchresults[i].getValue('enddate', 'subscriptionline');
            var quantity = parseInt( searchresults[i].getValue('quantity') );
            nlapiLogExecution('DEBUG', 'revDate == effectiveDate', revDate + '==' + effectiveDate);
            nlapiLogExecution('DEBUG', 'subLineEndDate == endDate', subLineEndDate + '==' + endDate);
            nlapiLogExecution('DEBUG', 'quantity == lineQuantity', quantity + '==' + lineQuantity);
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

    return subs;
}