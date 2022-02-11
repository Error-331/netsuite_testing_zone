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
function afterSubmitCreditMemoTimeCredit(type){
    nlapiLogExecution('DEBUG', 'type', type);
    if( type == 'create' ){
        var cmRec = nlapiLoadRecord( 'creditmemo', nlapiGetRecordId() );
        if( cmRec ) {
            nlapiLogExecution('DEBUG', 'Record Loaded', 'Record Loaded');
            var billingAccount = cmRec.getFieldValue( 'billingaccount' );
            nlapiLogExecution('DEBUG', 'billingAccount', billingAccount);
            if( !isNullorEmpty( billingAccount ) ) {
                var applyCount = cmRec.getLineItemCount('apply');
                for (var i = 1; i <= applyCount; i++) {
                    var apply = cmRec.getLineItemValue('apply', 'apply', i);
                    if (apply == 'T') {
                        nlapiLogExecution('DEBUG', 'uncheck apply ' + i, cmRec.getLineItemValue('apply', 'internalid', i));
                        cmRec.setLineItemValue( 'apply', 'apply', i, 'F' );
                    }
                }
                /*TODO: add try/catch to invoice load*/
                for (i = applyCount; i > 0; i--) {
                    var invoiceId = cmRec.getLineItemValue('apply', 'internalid', i);
                    var invoiceBilling = nlapiLookupField('invoice', invoiceId, 'billingaccount');
                    if ( billingAccount == invoiceBilling ) {
                        nlapiLogExecution('DEBUG', 'check apply ' + i, invoiceId);
                        cmRec.setLineItemValue( 'apply', 'apply', i, 'T' );
                        break;
                    }
                }
                nlapiSubmitRecord(cmRec);
            }
        }
    }
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
function afterSubmitCreditMemoTimeCredit_(type){
    nlapiLogExecution('DEBUG', 'type', type);
    if( type == 'create' ) {
        var creditMemoId = nlapiGetRecordId();
        var lineItemCount = nlapiGetLineItemCount('item');
        var hasTimeCredit = false;
        for (var i = 1; i <= lineItemCount; i++) {
            if( nlapiGetLineItemValue('item', 'subscription', i) == sbBSNSettings.bsnc1yrPlanNum ){
                hasTimeCredit = true;
                break;
            }
        }
        var subscriptionLines = [];
        var addLines = [];
        for (var n = 1; n <= lineItemCount; n++) {
            var itemId = nlapiGetLineItemValue('item', 'item', n);
            var subId = nlapiGetLineItemValue('item', 'subscription', n);
            var rate = nlapiGetLineItemValue('item', 'rate', n);
            var subItemId = sbBSNSettings.bsn1yrItemText;
            var creditLimitAmount = 0;
            var amount = nlapiGetLineItemValue('item', 'amount', n);
            var quantity = nlapiGetLineItemValue('item', 'quantity', n);
            nlapiLogExecution('DEBUG', ' ', '===================== Update Invoice Line ' + n + ' ========================');
            nlapiLogExecution('DEBUG', 'itemId ' + n, itemId);
            nlapiLogExecution('DEBUG', 'subId ' + n, subId);
            nlapiLogExecution('DEBUG', 'rate ' + n, rate);
            nlapiLogExecution('DEBUG', 'creditLimitAmount ' + n, creditLimitAmount);
            nlapiLogExecution('DEBUG', 'quantity ' + n, quantity);

            if (subId) {

                var subscription = nlapiLoadRecord('subscription', subId);
                if (subscription) {
                    var subCustomer = subscription.getFieldValue('customer');
                    var subEndUser = subscription.getFieldValue('custrecord_bsn_sub_end_user');
                    if( !isNullorEmpty( subEndUser ) && subEndUser != subCustomer ) {
                        var chargeId = 0;
                        var searchFilters = [['quantity', 'equalto', quantity],
                            'AND',
                            ['amount', 'equalto', -amount]/*,
                            'AND',
                            ['creditmemo', 'equalto', creditMemoId]*/];

                        nlapiLogExecution('DEBUG', 'searchFilters ', JSON.stringify(searchFilters));
                        var searchColumns = [new nlobjSearchColumn('subscriptionline')];
                        var negativeCharge = nlapiSearchRecord('charge', null, searchFilters, searchColumns);
                        if( negativeCharge != null && negativeCharge.length ) {
                            var lineId = negativeCharge[0].getValue('subscriptionline');
                            searchFilters = [['quantity', 'equalto', quantity],
                                'AND',
                                ['amount', 'equalto', amount],
                                'AND',
                                ['subscriptionline', 'is', lineId]];
                            searchColumns = [new nlobjSearchColumn('custrecord_bs_time_credit')];
                            var positiveCharge = nlapiSearchRecord('charge', null, searchFilters, searchColumns);
                            nlapiLogExecution('DEBUG', 'chargeSearch ', JSON.stringify(positiveCharge));
                            if (positiveCharge != null && positiveCharge.length) {
                                chargeId = positiveCharge[0].getId();
                            }
                            var charge = false;
                            if (chargeId) charge = nlapiLoadRecord('charge', chargeId);

                            if (charge) {
                                var timeCreditId = charge.getFieldValue('custrecord_bs_time_credit');
                                if (timeCreditId) {
                                    var timeCredit = nlapiLoadRecord('customrecord_bsnc_time_credit', timeCreditId);
                                    if (timeCredit) {
                                        var tcAmount = timeCredit.getFieldValue('custrecord_bs_tc_amount');
                                        if (tcAmount) {
                                            var subscriptionLine = charge.getFieldValue('subscriptionline');
                                            var creditMemo = nlapiLoadRecord('creditmemo', creditMemoId);
                                            if (creditMemo) {
                                                creditMemo.selectNewLineItem('item');
                                                creditMemo.setCurrentLineItemValue('item', 'item', sbBSNSettings.bsnc1yrPlanNum);
                                                creditMemo.setCurrentLineItemValue('item', 'quantity', 1);
                                                creditMemo.setCurrentLineItemValue('item', 'description', "Time Credit");
                                                creditMemo.setCurrentLineItemValue('item', 'price', -1);
                                                creditMemo.setCurrentLineItemValue('item', 'rate', tcAmount);
                                                creditMemo.setCurrentLineItemValue('item', 'custcol_bs_subscription_line', subscriptionLine);
                                                creditMemo.commitLineItem('item');
                                            }
                                            nlapiSubmitRecord(creditMemo);
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
    }
}

function isNullorEmpty(strVal){
    return (strVal == null || strVal == '');
}