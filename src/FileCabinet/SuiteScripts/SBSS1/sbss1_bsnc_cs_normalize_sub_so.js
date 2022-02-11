/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       16 Oct 2018     Eugene Karakovsky
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

function bsncNormalizeSOButton(){
    var contracts = ['772','732','733','771'];
    var contractPeriod = ['P30D','P90D','P30D','P365D'];
    var email = [nlapiLookupField('customer', nlapiGetFieldValue('entity'), 'email')];
    var lineItemCount = nlapiGetLineItemCount('item');
    var openWindow = false;
    var stopLoop = false;
    nlapiLogExecution('DEBUG', 'lineItemCount' , lineItemCount );
    for (var n = 1; n <= lineItemCount; n++) {
        var curItem = nlapiSelectLineItem("item", n);
        var itemId = nlapiGetCurrentLineItemValue('item', 'item');
        nlapiLogExecution('DEBUG', 'itemId' , itemId );
        console.log(itemId);
        var quantity = nlapiGetCurrentLineItemValue("item", "quantity");
        nlapiLogExecution('DEBUG', 'quantity' , quantity );
        console.log(quantity);
        nlapiLogExecution('DEBUG', '_.contains(contracts, itemId)' , _.contains(contracts, itemId) );
        if( _.contains(contracts, itemId) ){
            openWindow = true;
            var description = nlapiGetCurrentLineItemValue('item', 'description');
            var lines = description.split('\n');
            nlapiLogExecution('DEBUG', 'break0 itemId' , itemId );
            for( var k = 0; k < lines.length; k++ ){
                if( lines[k].match(/^Customer Email:/i) ){
                    var parsedEmail = lines[k].match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
                    nlapiLogExecution('DEBUG', 'break1 itemId' , itemId );
                    if( !isNullorEmpty( parsedEmail[0] ) ){
                        if( email.indexOf(parsedEmail[0]) == -1 ){
                            email.push(parsedEmail[0]);
                        }
                        nlapiLogExecution('DEBUG', 'break2 itemId' , itemId );
                        stopLoop = true;
                        break;
                    }
                }
            }
        }
        if( stopLoop ) break;
    }
    if( openWindow ){
        bsnсSOGetNetworkName(this, email.join(','), true, contractPeriod[ contracts.indexOf(itemId) ], nlapiGetFieldValue('enddate'), nlapiGetFieldValue('start'));
    } else {
        Ext.MessageBox.alert('Subscription Normalization', 'You need at least 1 Subscription Item.');
    }
}

function bsncNormalizeSubSO( newEndDate ){
    try{
        var curSO = nlapiLoadRecord('salesorder', nlapiGetRecordId());
        nlapiSetFieldValue('enddate', newEndDate);
        var newTerm = nlapiGetFieldValue('custbody_tran_term_in_months');
        console.log(newTerm);
        var lineItemCount = nlapiGetLineItemCount('item');
        nlapiLogExecution('DEBUG', 'lineItemCount' , lineItemCount );
        var contracts = ['772','732','733','771'];
        var periods = [1,3,1,12];
        for (var n = 1; n <= lineItemCount; n++) {
            var curItem = nlapiSelectLineItem("item", n);
            var itemId = nlapiGetCurrentLineItemValue('item', 'item');
            nlapiLogExecution('DEBUG', 'itemId' , itemId );
            console.log(itemId);
            if( _.contains(contracts, itemId) ){
                nlapiSetFieldValue('custbody_bsn_custom_update_contract', 'T');

                var curPrice = nlapiGetCurrentLineItemValue("item", "rate");
                var percentage = newTerm / periods[contracts.indexOf( itemId )];
                var newPrice = roundTo(curPrice * percentage, 2);
                console.log(periods[contracts.indexOf( contracts, itemId )]);
                console.log(curPrice);
                console.log(percentage);
                console.log(newPrice);

                nlapiSetCurrentLineItemValue('item', 'custcol_swe_contract_end_date', newEndDate);
                nlapiSetCurrentLineItemValue('item', 'custcol_swe_contract_item_term_months', newTerm);
                nlapiSetCurrentLineItemValue('item', 'price', '-1');
                nlapiSetCurrentLineItemValue('item', 'rate', newPrice);

                var startDate = nlapiGetCurrentLineItemValue("item", "custcol_swe_contract_start_date");
                var revRecStartDate = moment(nlapiStringToDate(startDate)).startOf('month').format('M/D/YYYY');
                var revRecEndDate = bsncRevRecEndDate( moment(nlapiStringToDate(startDate)), newEndDate, newTerm );
                nlapiSetCurrentLineItemValue('item', 'revrecstartdate', revRecStartDate);
                nlapiSetCurrentLineItemValue('item', 'revrecenddate', revRecEndDate);

                nlapiCommitLineItem("item");

                /* Uncomment this line to prevent different contracts line items in one SO */
                //nlapiSetFieldValue('custbody_bsn_custom_update_contract', 'F');
            }
        }
        nlapiSetFieldValue('enddate', newEndDate);
        var endDate = nlapiGetFieldValue('enddate');
        console.log(endDate);

    } catch(e){
        nlapiLogExecution('DEBUG', 'Exception ' + e.message );
        nlapiLogExecution('DEBUG', 'Exception ' + e.name);
        nlapiLogExecution('DEBUG', 'Exception ' + e.toString());
    }
}

function bsncSOGetNetworkName(owner, networkadmin, normalize, activityPeriod, renewalDate, startDate) {

    if( isNullorEmpty( networkadmin ) ){
        return alert( 'Invalid Network Admin Email on line ' + linenum + '!' );
    }

    switch( activityPeriod ){
        case 'P30D': activityPeriod = '1'; break;
        case 'P90D': activityPeriod = '2'; break;
        case 'P365D': activityPeriod = '3'; break;
        default: return alert( 'Invalid Subscription Activity Period!' );
    }

    if( isNullorEmpty( renewalDate ) ){
        return alert( 'Invalid Subscription Renewal Date!' );
    }

    renewalDate = moment( renewalDate ).add( 1, 'days' ).format('M/D/YYYY');

    var param = '&networkadmin=' + networkadmin + '&normalize=' + normalize + '&activityperiod=' + activityPeriod + '&renewaldate=' + renewalDate + '&startdate=' + startDate;
    popupHelperWindow(owner, '/app/site/hosting/scriptlet.nl?script=327&deploy=1&compid=3293628_SB1', 'getNetworkName', 560, 450, param);
}

function popupHelperWindow(owner, baseUrl, windowName, width, height, additionalParams) {
    var url = baseUrl;
    /*url += '?bin=F';
    url += '&tobin=F';
    url += '&frombin=F';
    url += '&binreq=T';
    url += '&tobinreq=F';
    url += '&isserial=T';
    url += '&item=' + nlapiGetFieldValue('item');
    url += '&location=' + nlapiGetFieldValue('location');*/
    nlExtOpenWindow(url + additionalParams, windowName, width, height, owner, true, '');
}