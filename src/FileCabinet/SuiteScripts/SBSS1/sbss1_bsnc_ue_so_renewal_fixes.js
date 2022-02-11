/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       08 Oct 2018     Eugene Karakovsky
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
function bsncRenewalBeforeLoad(type, form, request){
    //nlapiLogExecution('DEBUG', 'type:', type);
    if( type == 'edit' || type == 'view' ){
        form.setScript('customscript_bsnc_cs_so_renewal_fixes');
        var salesOrder = nlapiLoadRecord( 'salesorder', nlapiGetRecordId() );
        var soStatus = salesOrder.getFieldValue("status");
        if( soStatus == "Pending Approval" ){
            var fromContract = nlapiGetFieldValue( 'custbody_swe_from_contract' );
            var lineItemCount = nlapiGetLineItemCount('item');
            var contracts = ['772','732','733','771'];
            var relativeSOs = "";
            nlapiLogExecution('DEBUG', 'fromContract:', fromContract);
            nlapiLogExecution('DEBUG', 'lineItemCount:', lineItemCount);
            if( isNullorEmpty(fromContract) && type == 'edit' ){
                for (var i = 1; i <= lineItemCount; i++) {
                    salesOrder.selectLineItem('item', i);
                    var itemId = salesOrder.getCurrentLineItemValue('item', 'item');
                    if(_.contains(contracts, itemId)){
                        form.addButton( 'custpage_bsnc_normalize_subs', 'BSNC Normalize Subscriptions', 'bsncNormalizeSOButton();' );
                        break;
                    }
                }
            }

            if( !isNullorEmpty(fromContract) ){
                var relativeOriginalTransactions = new Array();
                var relativeTransactions = new Array();
                var relativeLineNums = new Array();
                var relativeQuantities = new Array();
                var mergeLine = new Array();
                var delArrRes = new Array();
                for (var i = 1; i <= lineItemCount; i++) {
                    salesOrder.selectLineItem('item', i);
                    var itemId = salesOrder.getCurrentLineItemValue('item', 'item');
                    if(_.contains(contracts, itemId)){
                        var networkId = "";
                        var tranList = "";
                        var enddate = nlapiLookupField( 'customrecord_contracts', fromContract, 'custrecord_contracts_end_date' );
                        var itemDescription = salesOrder.getCurrentLineItemValue('item', 'description');
                        var curDescObj = bsncParseDescription( itemDescription );
                        var sameSubs = bsncGetItemsWithSameNetwork( nlapiGetRecordId(), itemDescription, enddate );
                        nlapiLogExecution('DEBUG', 'sameSubs:', sameSubs.length);
                        nlapiLogExecution('DEBUG', 'enddate:', enddate);
                        for( var k = 0; k < sameSubs.length; k++ ){
                            var originalTranid = nlapiLookupField( 'salesorder', sameSubs[k].originalSalesOrder, 'tranid' );
                            var so = nlapiLoadRecord( 'salesorder', sameSubs[k].salesOrder );
                            var tranid = so.getFieldValue( 'tranid' );
                            var soQuantity = so.getLineItemValue( "item", "quantity", sameSubs[k].soLineNumber );
                            var soItemDescription = so.getLineItemValue( "item", "description", sameSubs[k].soLineNumber );
                            var descObj = bsncParseDescription( soItemDescription );
                            if( !isNullorEmpty(descObj.delRef) ){
                                var delArr = descObj.delRef.split(",");
                                for( var n = 0; n < delArr.length; n++ ){
                                    if( delArrRes.indexOf( delArr[n] ) == -1 ){
                                        delArrRes.push( delArr[n] );
                                    }
                                }
                            }
                            tranList += " <a href='/app/accounting/transactions/salesord.nl?id=" + sameSubs[k].salesOrder + "' target='blank'>" + tranid + "</a>(" + soQuantity + ")";
                            relativeOriginalTransactions.push(originalTranid.substring(3));
                            relativeTransactions.push(sameSubs[k].salesOrder);
                            relativeLineNums.push(sameSubs[k].soLineNumber);
                            relativeQuantities.push(soQuantity);
                            mergeLine.push(i);
                        }
                        if( sameSubs.length ){
                            relativeSOs += "<br>BSNC Network ID: " + sameSubs[0].networkId + "<br>Sales Orders:" + tranList;
                        }
                    }
                }

                for( var i = 0; i < delArrRes.length; i++ ){
                    if( relativeOriginalTransactions.indexOf( delArrRes[i] ) == -1 ){
                        relativeOriginalTransactions.push( delArrRes[i] );
                    }
                }

                if( relativeSOs != "" ){
                    var alertField = form.addField('custpage_alertfield_bsnc', 'inlinehtml', 'Alert');
                    var mergeOnClick = "bsncMergeSubs([" + mergeLine.join(",") + "],[" + relativeOriginalTransactions.join(",") + "],[" + relativeTransactions.join(",") + "],[" + relativeLineNums.join(",") + "],[" + relativeQuantities.join(",") + "]);";
                    var mergeButton = "<table id='tbl_approve' cellpadding='0' cellspacing='0' border='0' class='uir-button' style='margin-right:6px;cursor:hand;' role='presentation'><tbody><tr id='tr_approve' class='pgBntG pgBntB'><td id='tdleftcap_approve'><img src='/images/nav/ns_x.gif' class='bntLT' border='0' height='50%' width='3' alt=''><img src='/images/nav/ns_x.gif' class='bntLB' border='0' height='50%' width='3' alt=''></td><td id='tdbody_approve' height='20' valign='top' nowrap='' class='bntBgB'><input type='button' style='' class='rndbuttoninpt bntBgT' value='Merge Subscriptions' id='custpage_merge_subs' name='custpage_merge_subs' onclick='" + mergeOnClick + " return false;' onmousedown='this.setAttribute(&quot;_mousedown&quot;,&quot;T&quot;); setButtonDown(true, false, this);' onmouseup='this.setAttribute(&quot;_mousedown&quot;,&quot;F&quot;); setButtonDown(false, false, this);' onmouseout='if(this.getAttribute(&quot;_mousedown&quot;)==&quot;T&quot;) setButtonDown(false, false, this);' onmouseover='if(this.getAttribute(&quot;_mousedown&quot;)==&quot;T&quot;) setButtonDown(true, false, this);' _mousedown='F'></td><td id='tdrightcap_approve'><img src='/images/nav/ns_x.gif' height='50%' class='bntRT' border='0' width='3' alt=''><img src='/images/nav/ns_x.gif' height='50%' class='bntRB' border='0' width='3' alt=''></td></tr></tbody></table><br>";
                    alertField.setDefaultValue("<script type='text/javascript'>showAlertBox('alert_bsnc_same_network_items', 'There are transactions for same BSNC network(s) subscriptions', \"You can merge same network subscriptions into one in this Sales Order while it is Pending Approval.<br>If you approve it and go further you will have to wait for another renewal cycle to merge them.<br>By merging the subscriptions script will remove those from the listed Sales Orders and upgrade the quantity in the current Sales Order.<br>To perform merging you should use Merge Subscriptions button:<br>" + mergeButton + relativeSOs + "\", NLAlertDialog.TYPE_MEDIUM_PRIORITY);</script>");
                }
            }
        }
    }
}

function bsncGetItemsWithSameNetwork( soId, itemDescription, enddate ){
    var contractItems = new Array();
    var lines = itemDescription.split('\n');
    var nId = "";
    for( var i = 0; i < lines.length; i++ ){
        if( lines[i].match(/^Network ID:/i) && isNullorEmpty( nId )){
            nId = lines[i].substring(12).trim(); //cut off "Network ID: "
            break;
        }
    }

    if( nId != "" ){
        var additionalFilters = new Array();
        additionalFilters[0] = new nlobjSearchFilter('custrecord_bsn_network_id', null, 'is', nId);
        additionalFilters[1] = new nlobjSearchFilter('custrecord_ci_status', null, 'is', 'Renewal Generated');
        additionalFilters[2] = new nlobjSearchFilter('custrecord_ci_enddate', null, 'on', enddate);
        var columns = new Array();
        columns[0] = new nlobjSearchColumn( 'custrecord_ci_original_transaction' );
        columns[1] = new nlobjSearchColumn( 'custrecord_ci_quantity' );
        columns[2] = new nlobjSearchColumn( 'custrecord_ci_original_so_lineno' );
        columns[3] = new nlobjSearchColumn( 'custrecord_ci_contract_id' );
        var searchresults = nlapiSearchRecord('customrecord_contract_item', null, additionalFilters, columns);
        for ( var i = 0; searchresults != null && i < searchresults.length; i++ ) {
            var renewSO = nlapiLookupField( 'customrecord_contracts', searchresults[i].getValue('custrecord_ci_contract_id'), 'custrecord_contract_renewal_tran' );
            var soStatus = nlapiLookupField( 'salesorder', renewSO, 'status' );
            if( soId != renewSO && soStatus == "pendingApproval" ){
                var contract_item = searchresults[i];
                var lineItemNum = bsncGetCurrentLineItemNum( contract_item.getId(), renewSO );
                if( lineItemNum ){
                    var args = {
                        "itemId": contract_item.getId(),
                        "originalSalesOrder": contract_item.getValue('custrecord_ci_original_transaction'),
                        "salesOrder": renewSO,
                        "quantity": contract_item.getValue('custrecord_ci_quantity'),
                        "soLineNumber": lineItemNum,
                        "networkId": nId
                    };
                    var cItem = new bsncContractItem( args );
                    contractItems.push(cItem);
                }
            }
        }
    }
    return contractItems;
}

function bsncGetCurrentLineItemNum( itemId, renewSO ){
    var ci = nlapiLoadRecord('customrecord_contract_item', itemId);
    var so = nlapiLoadRecord('salesorder', renewSO);
    var ciDescription = ci.getFieldValue("custrecord_ci_tran_line_description");
    var ciQuantity = ci.getFieldValue("custrecord_ci_quantity");
    var numLines = so.getLineItemCount('item');
    for( var i = 1; i <= numLines; i++ ){
        var curDescription = so.getLineItemValue("item", "description", i);
        var curQuantity = so.getLineItemValue("item", "quantity", i);
        nlapiLogExecution('DEBUG', 'ciDescription:', ciDescription);
        nlapiLogExecution('DEBUG', 'curDescription:', curDescription);
        nlapiLogExecution('DEBUG', 'ciQuantity:', ciQuantity);
        nlapiLogExecution('DEBUG', 'curQuantity:', curQuantity);

        if( bsncCompareDescriptions( ciDescription, curDescription ) ){
            return i;
        }
    }
    return 0;
}

function bsncCompareDescriptions( description1, description2 ){
    var descObj1 = bsncParseDescription( description1 );
    var descObj2 = bsncParseDescription( description2 );
    if( isNullorEmpty( descObj1.networkId ) || isNullorEmpty( descObj2.networkId ) || descObj1.networkId != descObj2.networkId ){
        return false;
    }
    if( isNullorEmpty( descObj1.Email ) || isNullorEmpty( descObj2.Email ) || descObj1.Email != descObj2.Email ){
        return false;
    }
    return true;
}

function bsncParseDescription( description ){
    var lines = description.split('\n');
    var args = {
        'networkName': "",
        'networkId': "",
        'Email': "",
        'bsnRef': "",
        'delRef': ""
    }
    for( var i = 0; i < lines.length; i++ ){
        if( lines[i].match(/^Network:/i) && isNullorEmpty( args.networkName )){
            args.networkName = lines[i].substring(8).trim(); //cut off "Network: "
        }
        if( lines[i].match(/^Network ID:/i) && isNullorEmpty( args.networkId )){
            args.networkId = lines[i].substring(11).trim(); //cut off "Network ID: "
        }
        if( lines[i].match(/^Customer Email:/i) ){
            var email = lines[i].match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
            if( !isNullorEmpty( email[0] ) && isNullorEmpty( args.Email ) ){
                args.Email = email[0];
            }
        }
        if( lines[i].match(/^BSN Ref:/i) && isNullorEmpty( args.bsnRef )){
            args.bsnRef = lines[i].substring(8).trim(); //cut off "BSN Ref: "
        }
        if( lines[i].match(/^Del Ref:/i) && isNullorEmpty( args.delRef )){
            args.delRef = lines[i].substring(8).trim(); //cut off "Del Ref: "
        }
    }
    return args;
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
function bsncRenewalBeforeSubmit(type){
    nlapiLogExecution('DEBUG', 'type:', type);
    if( type == 'create' ){
        var fromContract = nlapiGetFieldValue( 'custbody_swe_from_contract' );
        nlapiLogExecution('DEBUG', 'From Contract:', fromContract);

        var deleteLines = new Array();
        var mergeLines = new Array();

        var lineItemCount = nlapiGetLineItemCount('item');
        for (var i = 1; i <= lineItemCount; i++) {
            nlapiSelectLineItem('item', i);
            var itemId = nlapiGetCurrentLineItemValue('item', 'item');
            nlapiLogExecution('DEBUG', 'itemId: ', itemId);

            var contracts = ['772','732','733','771'];
            if(type == 'create' && _.contains(contracts, itemId)){
                if( isNullorEmpty(fromContract) ){
                    var customer_id = nlapiGetFieldValue('entity');
                    var customerEmail = nlapiLookupField( 'customer', customer_id, 'email' );
                    var description = nlapiGetCurrentLineItemValue('item', 'description');
                    var email = '';
                    var lines = description.split('\n');
                    for( var k = 0; k < lines.length; k++ ){
                        if( lines[k].match(/^Customer Email:/i) ){
                            var parsedEmail = lines[k].match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
                            if( !isNullorEmpty( parsedEmail[0] ) ){
                                email = parsedEmail[0];
                                break;
                            }
                        }
                    }
                    if( isNullorEmpty( email ) ){
                        if(!isNullorEmpty(customerEmail)){
                            if(!isNullorEmpty(description)){
                                description += "\n";
                            }
                            description += "Customer Email: " + customerEmail;
                            nlapiSetCurrentLineItemValue('item', 'description', description);
                        } else {
                            var errorHTML = 'Customer Email empty!<br>' +
                                'Please update <span style="font-weight: bold;"><a href="/app/common/entity/custjob.nl?id=' + customer_id + '" target="_blank">Customer Record</a></span> with email first<br>' +
                                'or<br>' +
                                'put Network Admin Email into Subscriptions Item Description manually like this:<br>' +
                                '<span style="font-weight: bold;">Customer Email: aaa@bbb.com</span>';
                            //showAlertBox('error_updating_items', 'Error Updating Items', 'Customer Email empty. Please update Customer Record with email first or put Customer Email into Subscriptions Item Description manually!', NLAlertDialog.TYPE_HIGH_PRIORITY);
                            nlapiLogExecution('ERROR', 'SO Record Id: ', nlapiGetRecordId());
                            nlapiLogExecution('ERROR', 'Error Updating Items: ', 'Customer Email empty. Please update Customer Record with email first or put Customer Email into Subscriptions Item Description manually!');
                            throw nlapiCreateError('Error Updating Items', errorHTML, true);
                        }
                    }


                    /*** DO NOT DELETE YET!
                     var soEndDate = nlapiGetFieldValue( 'enddate' );
                     var curEndDate = nlapiGetCurrentLineItemValue( 'item', 'custcol_swe_contract_end_date' );
                     if( soEndDate != curEndDate ){
		    			var itemId = nlapiGetCurrentLineItemValue( 'item', 'item' );
		    			var quantity = nlapiGetCurrentLineItemValue( 'item', 'quantity' );
		    			var price = nlapiGetCurrentLineItemValue( 'item', 'price' );
		    			var list_rate = nlapiGetCurrentLineItemValue( 'item', 'custcol_list_rate' );
		    			var is_custom_price = nlapiGetCurrentLineItemValue( 'item', 'custcol_bsn_is_custom_price' );
		    			var custom_price = nlapiGetCurrentLineItemValue( 'item', 'custcol_bsn_custom_price' );
		    			var fiscal_quarter = nlapiGetCurrentLineItemValue( 'item', 'custcol_bs_fiscal_quarter' );
		    			var revrecstartdate = nlapiGetCurrentLineItemValue( 'item', 'revrecstartdate' );
		    			var revrecenddate = nlapiGetCurrentLineItemValue( 'item', 'revrecenddate' );
		    			var description = nlapiGetCurrentLineItemValue( 'item', 'description' );
		    			//var itemId = nlapiGetCurrentLineItemValue( 'item', 'item' );
		    			contractItems.push( [itemId, quantity, price, list_rate, is_custom_price, custom_price, fiscal_quarter, revrecstartdate, revrecenddate, description] );
		    		}


                     */

                } else {
                    bsncUpdateTerms();

                    var customer_id = nlapiGetFieldValue('entity');
                    var customerPriceLevel = nlapiLookupField('customer', customer_id, 'pricelevel');
                    nlapiLogExecution('DEBUG', 'customerPriceLevel: ', customerPriceLevel);
                    var itemPriceLevel = nlapiGetCurrentLineItemValue('item', 'price');
                    nlapiLogExecution('DEBUG', 'itemPriceLevel: ', itemPriceLevel);
                    var isCustomPrice = nlapiGetCurrentLineItemValue('item', 'custcol_bsn_is_custom_price');
                    var customPrice = nlapiGetCurrentLineItemValue('item', 'custcol_bsn_custom_price');
                    nlapiLogExecution('DEBUG', 'isCustomPrice: ', isCustomPrice);
                    nlapiLogExecution('DEBUG', 'customPrice: ', customPrice);
                    if( isCustomPrice == 'T' && !isNullorEmpty( customPrice ) ){
                        nlapiSetCurrentLineItemValue('item', 'rate', customPrice);
                        nlapiSetCurrentLineItemValue('item', 'price', -1);
                    } else if( isCustomPrice == 'F' ){
                        var itemPrices = bsncGetPriceLevels( itemId );
                        var newPrice = 0;
                        var newPriceLevel = -1;
                        nlapiLogExecution('DEBUG', 'itemPrices[customerPriceLevel]: ', itemPrices[customerPriceLevel]);
                        if( !isNullorEmpty( customerPriceLevel ) ){
                            if( !isNullorEmpty( itemPrices[customerPriceLevel] ) ){
                                newPrice = itemPrices[customerPriceLevel];
                                newPriceLevel = customerPriceLevel;
                            } else {
                                if( !isNullorEmpty( itemPrices[1] ) ){ //base price
                                    newPrice = itemPrices[1];
                                    newPriceLevel = 1;
                                } else {
                                    newPrice = 0;
                                    newPriceLevel = -1;
                                }
                            }
                        } else {
                            if( !isNullorEmpty( itemPrices[1] ) ){ //base price
                                newPrice = itemPrices[1];
                                newPriceLevel = 1;
                            } else {
                                newPrice = 0;
                                newPriceLevel = -1;
                            }
                        }
                        nlapiSetCurrentLineItemValue('item', 'price', newPriceLevel);
                        nlapiSetCurrentLineItemValue('item', 'rate', newPrice);
                    }

                    // Merge negative line with its parent
                    var quantity = nlapiGetCurrentLineItemValue('item', 'quantity');
                    //if( quantity < 0 ){
                    var description = nlapiGetCurrentLineItemValue('item', 'description');
                    var price = nlapiGetCurrentLineItemValue('item', 'rate');
                    var amount = nlapiGetCurrentLineItemValue('item', 'amount');
                    for( var k = 1; k < i; k++ ){
                        var compDescription = nlapiGetLineItemValue( 'item', 'description', k );
                        var compPrice = nlapiGetLineItemValue( 'item', 'rate', k );
                        var compQuantity = nlapiGetLineItemValue( 'item', 'quantity', k );
                        var compAmount = nlapiGetLineItemValue( 'item', 'amount', k );
                        for( var n = 0; n < mergeLines.length; n++ ){
                            if( mergeLines[n][0] == k ){
                                compQuantity = mergeLines[n][1].toString();
                                compAmount = mergeLines[n][2].toString();
                                break;
                            }
                        }
                        //nlapiLogExecution('DEBUG', 'i:', i);
                        //nlapiLogExecution('DEBUG', 'k:', k);
                        //nlapiLogExecution('DEBUG', 'description == compDescription:', description == compDescription);
                        //nlapiLogExecution('DEBUG', 'price == compPrice:', price == compPrice);
                        //nlapiLogExecution('DEBUG', 'compQuantity > 0:', compQuantity > 0);
                        if( description == compDescription && price == compPrice && compQuantity > 0 ){
                            //nlapiLogExecution('DEBUG', 'compAmount', compAmount );
                            //nlapiLogExecution('DEBUG', 'amount', amount );
                            var newAmount = parseFloat(amount) + parseFloat(compAmount);
                            //if( newAmount < 0 ){
                            //newAmount = compAmount;
                            //}
                            mergeLines.push([k, (parseInt(quantity) + parseInt(compQuantity)), newAmount]);
                            deleteLines.push(i);
                            //nlapiLogExecution('DEBUG', 'Delete Line:', i);
                            break;
                        }
                    }
                    //}
                }
            }

            nlapiCommitLineItem('item');
        }

        // Delete negative lines
        //nlapiLogExecution('DEBUG', 'mergeLines:', mergeLines.toString());
        //nlapiLogExecution('DEBUG', 'deleteLines:', deleteLines.toString());
        for( var i = 0; i < mergeLines.length; i++ ){
            nlapiSelectLineItem('item', mergeLines[i][0]);
            nlapiSetCurrentLineItemValue( 'item', 'quantity', mergeLines[i][1] );
            nlapiSetCurrentLineItemValue( 'item', 'amount', mergeLines[i][2] );
            nlapiCommitLineItem('item');
        }

        deleteLines.sort( function(a,b){return a - b} ); //sort asc
        deleteLines.reverse(); //sort desc
        for( var i = 0; i < deleteLines.length; i++ ){
            nlapiRemoveLineItem( 'item', deleteLines[i] );
        }
    }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord salesorder
 *
 * Sending Email to sales rep when the order is higher than $1500
 *
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function bsncRenewalAfterSubmit(type, form, request){
    nlapiLogExecution('DEBUG', 'type:', type);
    if( type == 'approve' ){
        var soId = nlapiGetRecordId();
        var fromContract = nlapiGetFieldValue( 'custbody_swe_from_contract' );
        var newContract = nlapiGetFieldValue( 'custbody_contract_name' );
        if( !isNullorEmpty( newContract ) ) {
            var lineItemCount = nlapiGetLineItemCount('item');
            for (var i = 1; i <= lineItemCount; i++) {
                nlapiSelectLineItem('item', i);
                var itemId = nlapiGetCurrentLineItemValue('item', 'item');
                var contracts = ['772','732','733','771'];
                if(_.contains(contracts, itemId)){
                    if( isNullorEmpty( fromContract ) ){
                        var months = bsncGetSubscriptionTerm( itemId );
                        nlapiSubmitField( 'customrecord_contracts', newContract, 'custrecord_contract_renewal_terms', months );
                        var customUpdateContract = nlapiGetFieldValue( 'custbody_bsn_custom_update_contract' );
                        if( customUpdateContract == 'T' ){
                            var endDate = nlapiGetFieldValue( 'enddate' );
                            nlapiSubmitField( 'customrecord_contracts', newContract, 'custrecord_contracts_end_date', endDate );
                            nlapiSubmitField( 'salesorder', soId, 'custbody_bsn_custom_update_contract', 'F' );
                        }
                        break;
                    }
                }
            }
        }
    }

    if( type == 'create' ){
        var soId = nlapiGetRecordId();
        var so = nlapiLoadRecord( 'salesorder', soId );
        var fromContract = nlapiGetFieldValue( 'custbody_swe_from_contract' );
        nlapiLogExecution('DEBUG', 'soId:', soId);
        nlapiLogExecution('DEBUG', 'fromContract:', fromContract);
        if( !isNullorEmpty( fromContract ) ){
            var updateLines = [];
            var lineItemCount = nlapiGetLineItemCount('item');
            for (var i = 1; i <= lineItemCount; i++) {
                nlapiSelectLineItem('item', i);
                var itemId = nlapiGetCurrentLineItemValue('item', 'item');
                var itemDescription = so.getLineItemValue("item", "description", i);
                var contracts = ['771'];
                nlapiLogExecution('DEBUG', 'itemId:', itemId);
                nlapiLogExecution('DEBUG', 'itemDescription:', itemDescription);
                if(_.contains(contracts, itemId)){
                    var curDescObj = bsncParseDescription( itemDescription );
                    nlapiLogExecution('DEBUG', 'curDescObj:', JSON.stringify(curDescObj));
                    if( !isNullorEmpty( curDescObj.networkId ) ){
                        var netInfo = soapGetNetworkByIdBSNC( curDescObj.networkId );
                        nlapiLogExecution('DEBUG', 'netInfo:', JSON.stringify(netInfo));
                        if( netInfo.isTrial ){
                            var subsCount = soapNetworkSubscriptionsCountBSNC( curDescObj.networkId, netInfo.isTrial );
                            nlapiLogExecution('DEBUG', 'subsCount:', JSON.stringify(subsCount));
                            if( isNullorEmpty(subsCount.error) ){
                                updateLines.push({'lineNum':i,'subs':subsCount.quantity});
                            }
                        }
                    }
                }
            }
            nlapiLogExecution('DEBUG', 'updateLines:', JSON.stringify(updateLines));
            if( updateLines.length ){
                for( var i = 0; i < updateLines.length; i++ ){
                    so.setLineItemValue( 'item', 'quantity', updateLines[i].lineNum, updateLines[i].subs );
                }
                nlapiSubmitRecord( so );
            }
        } /*else {
            var context = nlapiGetContext().getExecutionContext();
            nlapiLogExecution('DEBUG', 'context:', context);
            if( context == "webstore") {
                var itemId = nlapiGetLineItemValue('item', 'item', 1);
                nlapiLogExecution('DEBUG', 'itemId:', itemId);
                if( itemId == '772' ){
                    so.setFieldValue( 'enddate', '11/30/2019' );
                    so.setLineItemValue( 'item', 'custcol_swe_contract_end_date', 1, '11/30/2019' );
                    var recId = nlapiSubmitRecord( so );
                    nlapiLogExecution('DEBUG', 'recId:', recId);
                }
            }
        }*/
    }
}

function bsncUpdateTerms(){
    var itemId = nlapiGetCurrentLineItemValue('item', 'item');
    var months = bsncGetSubscriptionTerm( itemId );
    nlapiSetFieldValue('custbody_tran_term_in_months', months);
    nlapiSetFieldValue('custbody_renewal_terms', months);
    nlapiSetCurrentLineItemValue('item', 'custcol_swe_contract_end_date', nlapiGetFieldValue('enddate'));
    nlapiSetCurrentLineItemValue('item', 'custcol_swe_contract_item_term_months', months);
}

function bsncGetSubscriptionTerm( itemId ){
    var months = 12;// default is 1 year
    switch(itemId){
        case '772':// BSN Cloud Trial
        case '733':// BSN.Cloud monthly subscription with contract
            months = 1;
            break;
        case '732':// BSN.Cloud quarterly subscription with contract
            months = 3;
            break;
        case '771':// BSN.Cloud 1 year subscription with contract
        default:break;
    }
    return months;
}

function bsncGetPriceLevels( itemId ){
    var filters = new Array();
    filters[0] = new nlobjSearchFilter( 'internalid', null, 'is', itemId);

    var columns = new Array();
    columns[0] = new nlobjSearchColumn( 'itemid');
    columns[1] = new nlobjSearchColumn( 'baseprice');
    columns[2] = new nlobjSearchColumn( 'otherprices') //otherprices will pull all price levels in the results
    var searchresults = nlapiSearchRecord( 'item', null, filters, columns );

    //Price levels start with baseprice, then price + 2 and up.
    var itemName = searchresults[0].getValue('itemid');
    var prices = [];
    for(var i = 1; i <= 15 /*Price List Size*/; i++){
        if(i == 1){
            prices[i] = searchresults[0].getValue('baseprice');
        } else {
            prices[i] = searchresults[0].getValue('price' + i);
        }
    }

    return prices;
}

function bsncContractItem( args ) {
    this.itemId = args['itemId'];
    this.originalSalesOrder = args['originalSalesOrder'];
    this.salesOrder = args['salesOrder'];
    this.quantity = args['quantity'];
    this.soLineNumber = args['soLineNumber'];
    this.networkId = args['networkId'];
}

function bsncItemDescription( args ) {
    this.networkName = args['networkName'];
    this.networkId = args['networkId'];
    this.Email = args['Email'];
    this.bsnRef = args['bsnRef'];
    this.delRef = args['delRef'];
}

function isNullorEmpty(strVal){
    return (strVal == null || strVal == '');
}