/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       13 Nov 2018     Eugene Karakovsky
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type){

}


function bsncMergeSubs(mergeLine, relativeOriginalTransactions, relativeTransactions, relativeLineNums, relativeQuantities){
    var soId = nlapiGetRecordId();
    var deleteRef = new Array();
    var updateRecords = new Array();
    console.log(soId);
    console.log(mergeLine);
    console.log(relativeOriginalTransactions);
    console.log(relativeTransactions);
    console.log(relativeLineNums);
    console.log(relativeQuantities);

    for( var n = 0; n < mergeLine.length; n++ ){
        deleteRef[mergeLine[n]] = new Array();
    }

    var curSO = nlapiLoadRecord( 'salesorder', nlapiGetRecordId() );
    for( var i = 0; i < relativeOriginalTransactions.length; i++ ){
        var so = nlapiLoadRecord( 'salesorder', relativeTransactions[i] );
        var itemCount = so.getLineItemCount( 'item' );
        console.log(itemCount);
        var newQuantity = parseInt(curSO.getLineItemValue("item", "quantity", mergeLine[i])) + parseInt(so.getLineItemValue("item", "quantity", relativeLineNums[i]));
        console.log(newQuantity);
        curSO.setLineItemValue("item", "quantity", mergeLine[i], newQuantity);
        deleteRef[mergeLine[i]].push(relativeOriginalTransactions[i]);

        //if( nlapiSubmitRecord(curSO) ){

        if( itemCount == 1 ){
            updateRecords.push( 0 );
            //nlapiRequestURL('/app/accounting/transactions/salesordermanager.nl?type=cancel&id=' + relativeTransactions[i]);
        }else{
            updateRecords.push( relativeLineNums[i] );
            //so.removeLineItem("item", relativeLineNums[i]);
            //nlapiSubmitRecord(so)
        }

        //}
    }

    console.log(deleteRef);

    for( var k = 0; k < deleteRef.length; k++ ){
        if( !isNullorEmpty(deleteRef[k]) && deleteRef[k].length ){
            var curDesc = curSO.getLineItemValue( "item", "description", k );
            curSO.setLineItemValue( "item", "description", k, curDesc + "\nDel Ref: " + deleteRef[k].join(",") );
            console.log(curSO.getLineItemValue( "item", "description", k ));
        }
    }

    var res = nlapiSubmitRecord(curSO);

    if( res ){
        for( i = 0; i < relativeOriginalTransactions.length; i++ ){
            if( updateRecords[i] == 0 ){
                nlapiRequestURL('/app/accounting/transactions/salesordermanager.nl?type=cancel&id=' + relativeTransactions[i]);
            }else{
                var so = nlapiLoadRecord( "salesorder", relativeTransactions[i] );
                console.log(so);
                so.removeLineItem("item", relativeLineNums[i]);
                /* TODO: move submit record to after multiple lines removed */
                nlapiSubmitRecord(so);
            }
        }
    }

    window.location = "/app/accounting/transactions/salesord.nl?id=" + res;
}

function isNullorEmpty(strVal){
    return (strVal == null || strVal == '');
}