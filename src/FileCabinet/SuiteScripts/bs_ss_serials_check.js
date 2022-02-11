/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       25 Feb 2019     Eugene Karakovsky
 *
 */
//replaceSalesRep('scheduled');
/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduledCheckSerials(type) {

    try{
        var usage = null;
        var maxSerials = 35;
        var context = nlapiGetContext();
        var fulfillmentId = context.getSetting('SCRIPT', 'custscript_fulfillment_id');
        var serialIndex = context.getSetting('SCRIPT', 'custscript_serial_index');
        var requestType = context.getSetting('SCRIPT', 'custscript_transaction_type');
        nlapiLogExecution("DEBUG", "fulfillmentId", fulfillmentId);
        nlapiLogExecution("DEBUG", "serialIndex", serialIndex);
        nlapiLogExecution("DEBUG", "requestType", requestType);

        if( requestType == 'DELETE' ){
            var ffRecord = nlapiLoadRecord("itemreceipt", fulfillmentId);
            var orderId = ffRecord.getFieldValue('createdfrom');
            var sOrder = nlapiLookupField("returnauthorization", orderId, "tranid");
            nlapiLogExecution('DEBUG', 'orderId', orderId );
            nlapiLogExecution('DEBUG', 'sOrder', sOrder );
            var orderName = sOrder.substring(4);
            var sorderId = nlapiLookupField("returnauthorization", orderId, "createdfrom");
            var countrySold = nlapiLookupField("salesorder", sorderId, "shipcountry");
        } else {
            var ffRecord = nlapiLoadRecord("itemfulfillment", fulfillmentId);
            var orderId = ffRecord.getFieldValue('createdfrom');
            var sOrder = nlapiLookupField("salesorder", orderId, "tranid");
            nlapiLogExecution('DEBUG', 'orderId', orderId );
            nlapiLogExecution('DEBUG', 'sOrder', sOrder );
            var orderName = sOrder.substring(3);
            var countrySold = nlapiLookupField("salesorder", orderId, "shipcountry");
        }

        var blessingSerials = new Array();
        var blessings = new Array();
        var blessingIds = new Array();
        var lineItemCount = ffRecord.getLineItemCount('item');
        //var itemIds = ['658','659']; // Dev
        var itemIds = ['691','692']; // Prod
        var deviceSerial = "";
        var deviceSerials = new Array();

        for(var n = 1; n <= lineItemCount; n++) {
            var itemId = ffRecord.getLineItemValue('item', 'item', n);
            var fulfill = ffRecord.getLineItemValue("item", "itemreceive", n);

            if (_.contains(itemIds, itemId) && fulfill == "T") {
                var quantity = ffRecord.getLineItemValue("item", "quantity", n);
                var subrec = ffRecord.viewLineItemSubrecord('item', 'inventorydetail', 1); //would get the inventory detail record on the line number on the fulfillment
                var lineItemCount1 = subrec.getLineItemCount('inventoryassignment');
                nlapiLogExecution('DEBUG', 'lineItemCount: ', lineItemCount1);

                for (var i = 1; i <= lineItemCount1; i++) {
                    var serial = subrec.getLineItemText('inventoryassignment', 'issueinventorynumber', i); //would return the inventory number record on the indicated line item.
                    nlapiLogExecution("DEBUG", "issueinventorynumber", serial);
                    blessingSerials.push({"itemId": itemId, "serial": serial.substr(4)});
                }
            }
        }

        if( !isNullorEmpty( serialIndex ) ){
            n = serialIndex;
        } else {
            n = 0;
        }
        for( var k = 0; n < blessingSerials.length && k < maxSerials; n++, k++ ){
            var serialInfo = bs_search_serial(blessingSerials[n].serial);
            deviceSerials.push({"model": serialInfo[0], "serial": blessingSerials[n].serial, "itemId": blessingSerials[n].itemId});
            usage = context.getRemainingUsage();
            nlapiLogExecution("DEBUG", "device serial " + n + " usage", usage);
        }
        nlapiLogExecution('DEBUG', 'deviceSerials', JSON.stringify(deviceSerials));

        var restartScript = k >= maxSerials;
        serialIndex = n;
        nlapiLogExecution('DEBUG', 'k', k);
        nlapiLogExecution('DEBUG', 'restartScript', restartScript);
        nlapiLogExecution('DEBUG', 'serialIndex', serialIndex);
        nlapiLogExecution('DEBUG', 'deviceSerials.length', deviceSerials.length);

        for( n = 0; n < deviceSerials.length; n++ ){
            nlapiLogExecution('DEBUG', 'n', n);
            if( 1 ){
                var royaltyUnits = 0;
                var blessingStatus = 1;
                var manufacturer = "LITE-ON TECHNOLOGY CORPORATION";
                var productCategoryCode = "HNC";
                var dolbyCodeId = "860";
                var dolbyCode = "5A35D+";
                var countryMade = "CN";

                if( deviceSerials[n].itemId == '691' ){ //Prod
                //if( deviceSerials[n].itemId == '658' ){ //Dev
                    if( requestType == "ADD" ){
                        royaltyUnits = 1;
                    }

                    if( requestType == "DELETE" ){
                        royaltyUnits = -1;
                    }
                }
/*
                if(_.contains(['656', '657'], deviceSerials[n].itemId)){ // Dev
                    //if(_.contains(['687', '688'], deviceSerials[n].itemId)){ // Prod
                    manufacturer = "";
                    productCategoryCode = "";
                    dolbyCodeId = "";
                    dolbyCode = "";
                    countryMade = "";
                }
*/
                var license = ['eac3'];
                /*
                switch( deviceSerials[n].itemId ){
                    case '656': license = ['disable-packet-capture']; break; // Dev
                    case '657': license = ['internal-storage-only']; break; // Dev
                    //case '688': license = ['disable-packet-capture']; break; // Prod
                    //case '687': license = ['internal-storage-only']; break; // Prod
                    default: break;
                }
                */
                if( requestType == "DELETE" ){
                    blessingStatus = 2;
                }

                var brandModel = deviceSerials[n].model;
                var uniqueModelNumber = deviceSerials[n].model;
                nlapiLogExecution('DEBUG', 'deviceSerials[' + n + '].model', deviceSerials[n].model );
                nlapiLogExecution('DEBUG', 'deviceSerials[' + n + '].serials', deviceSerials[n].serial );
                var args = {
                    'Serial': deviceSerials[n].serial,
                    'SalesOrder': orderId,
                    'SalesOrderName': orderName,
                    'ItemId': deviceSerials[n].itemId,
                    'BrandModel': brandModel,
                    'Manufacturer': manufacturer,
                    'UniqueModel': uniqueModelNumber,
                    'ProductCategoryCode': productCategoryCode,
                    'DolbyCodeId': dolbyCodeId,
                    'DolbyCode': dolbyCode,
                    'RoyaltyUnits': royaltyUnits,
                    'CountryMade': countryMade,
                    'CountrySold': countrySold,
                    'Licenses': license,
                    'Status': blessingStatus
                };
                nlapiLogExecution('DEBUG', 'args', JSON.stringify(args) );

                var blessObj = new BlessingObj(args);
                nlapiLogExecution('DEBUG', 'blessObj', JSON.stringify(blessObj) );
                usage = context.getRemainingUsage();
                nlapiLogExecution("DEBUG", "usage", usage);
                blessings.push( blessObj );
            } else {
                //TODO: return notice about missing SO
            }
        }

        var restStatus = new Array();

        for( i = 0; i < blessings.length; i++ ){
            var blessing = nlapiCreateRecord('customrecord_bs_ac3_blessing');
            usage = context.getRemainingUsage();
            nlapiLogExecution("DEBUG", "usage Create Record", usage);
            blessing.setFieldValue('custrecord_bs_blessing_device_serial', blessings[i].Serial);
            blessing.setFieldValue('custrecord_bs_blessing_status', blessings[i].Status);
            blessing.setFieldValue('custrecord_bs_blessing_transaction', blessings[i].SalesOrder);
            blessing.setFieldValue('custrecord_bs_blessing_item', blessings[i].ItemId);
            blessing.setFieldValue('custrecord_bs_blessing_brand_model', blessings[i].BrandModel);
            blessing.setFieldValue('custrecord_bs_blessing_manufacturer', blessings[i].Manufacturer);
            blessing.setFieldValue('custrecord_bs_blessing_unique_model', blessings[i].UniqueModel);
            blessing.setFieldValue('custrecord_bs_blessing_pcc', blessings[i].ProductCategoryCode);
            blessing.setFieldValue('custrecord_bs_blessing_dolby_id', blessings[i].DolbyCodeId);
            blessing.setFieldValue('custrecord_bs_blessing_dolby_code', blessings[i].DolbyCode);
            blessing.setFieldValue('custrecord_bs_blessing_royalty_units', blessings[i].RoyaltyUnits);
            blessing.setFieldValue('custrecord_bs_blessing_country_made', blessings[i].CountryMade);
            blessing.setFieldValue('custrecord_bs_blessing_country_sold', blessings[i].CountrySold);
            //blessing.setFieldValue('custrecord_bs_blessing_server_received', restStatus[i]);

            nlapiSubmitRecord(blessing);
            blessingIds[i] = blessing.getId();
            usage = context.getRemainingUsage();
            nlapiLogExecution("DEBUG", "usage Submit Record", usage);
        }

        for( i = 0; i < blessings.length; i++ ){
            var response = blessingRESTRequest( blessings[i], blessingIds[i], requestType );
            nlapiLogExecution('DEBUG', 'blessings[' + i + ']', JSON.stringify(blessings[i]) );
            nlapiLogExecution('DEBUG', 'REST Response', JSON.stringify(response) );
            usage = context.getRemainingUsage();
            nlapiLogExecution("DEBUG", "usage REST Request", usage);
            if( isNullorEmpty(response.error) ){
                restStatus[i] = 1;
            } else {
                restStatus[i] = 2;
            }
            nlapiSubmitField('customrecord_bs_ac3_blessing', blessingIds[i], 'custrecord_bs_blessing_server_received', restStatus[i]);
            usage = context.getRemainingUsage();
            nlapiLogExecution("DEBUG", "usage Update Record", usage);
        }

        if( restartScript ){
            var ssParams = [];
            ssParams.custscript_fulfillment_id = fulfillmentId;
            ssParams.custscript_transaction_type = requestType;
            ssParams.custscript_serial_index = serialIndex;
            var status = nlapiScheduleScript(context.getScriptId(), context.getDeploymentId(), ssParams);
            nlapiLogExecution("DEBUG", "status", status);
        }

    }catch(e){
        nlapiLogExecution('DEBUG', 'Exception ' + e.message );
        nlapiLogExecution('DEBUG', 'Exception ' + e.name);
        nlapiLogExecution('DEBUG', 'Exception ' + e.toString());
    }
}

function blessingRESTRequest( blessing, id, type ){
    //Setting up URL
    //var url = "https://2d2xhbxu2f.execute-api.eu-west-1.amazonaws.com/development/players/" + blessing['Serial'] + "/blessings/" + blessing['Licenses'][0];// + "?access=available"; // Dev
    var url = "https://2d2xhbxu2f.execute-api.eu-west-1.amazonaws.com/production/players/" + blessing['Serial'] + "/blessings/" + blessing['Licenses'][0] + "?access=available"; // Prod
    nlapiLogExecution('DEBUG', 'url', url );
    nlapiLogExecution('DEBUG', 'id', id );
    nlapiLogExecution('DEBUG', 'REST Response', JSON.stringify(blessing) );
    //Setting up Headers
    var headers = {"Cache-Control": "no-cache",
        "x-api-key": "60j5su8Zsu9Z8en5ySDcp6m6P1avcYMl3vhDaIG8", // Prod
        //"x-api-key": "QU090j6ply5q133dsXIiO4MqbIG9Ouir90GZtuxS", // Dev
        //"x-api-key": "QU090j6ply5q133dsXIiO4MqbIG9Ouir90GZtux9", // Dev Broken
        "Content-Type": "application/json"};

    //Setting up Datainput
    var jsonobj = {
        "licenses":blessing['Licenses'],
        "netsuiteRecord": {
            "id": id,
            "Sales Order Number": blessing['SalesOrderName'],
            "Brand Model Number": blessing['BrandModel'],
            "Manufacturer Name": blessing['Manufacturer'],
            "Unique Model Number": blessing['UniqueModel'],
            "Product Category Code (PCC)": blessing['ProductCategoryCode'],
            "Dolby Technology Code ID": blessing['DolbyCodeId'],
            "Dolby Technology Code": blessing['DolbyCode'],
            "Royalty Units": blessing['RoyaltyUnits'],
            "Country Made In": blessing['CountryMade'],
            "Country Sold In": blessing['CountrySold']
        }
    };
    nlapiLogExecution('DEBUG', 'jsonobj', JSON.stringify(jsonobj) );
    //Stringifying JSON
    var myJSONText = JSON.stringify(jsonobj, replacer);
    var response = null;
    try{
        if( type == "DELETE" ){
            response = nlapiRequestURL(url, null, headers, type);
        } else {
            response = nlapiRequestURL(url, myJSONText, headers);
        }
    }catch(e){
        nlapiLogExecution('DEBUG', 'Exception ' + e.message );
        nlapiLogExecution('DEBUG', 'Exception ' + e.name);
        nlapiLogExecution('DEBUG', 'Exception ' + e.toString());
    }

    if( isNullorEmpty(response) ){
        return { "error": "Connection Error" };
    } else {
        return JSON.parse(response.getBody());
    }
}

function bs_search_serial( serial ){
    var existingRecords = new Array();
    var additionalFilters = new Array();
    additionalFilters[0] = new nlobjSearchFilter('inventorynumber', null, 'is', serial);
    var columns = new Array();
    columns[0] = new nlobjSearchColumn( 'inventorynumber' );
    columns[1] = new nlobjSearchColumn( 'item' );
    columns[2] = new nlobjSearchColumn( 'location' );
    var searchresults = nlapiSearchRecord( 'inventorynumber', null, additionalFilters, columns );

    var serialInfo = ['', ''];
    if( !isNullorEmpty(searchresults) && searchresults.length ){
        var item = searchresults[0].getText('item');
        var inventorynumber = searchresults[0].getValue('inventorynumber');
        var location = searchresults[0].getText('location');
        serialInfo = [item, location];
    }
    return serialInfo;
}

function replacer(key, value){
    if (typeof value == "number" && !isFinite(value)){
        return String(value);
    }
    return value;
}

function isNullorEmpty(strVal){
    return (strVal == null || strVal == '');
}

function BlessingObj( args ) {
    this.Serial = args['Serial'];
    this.SalesOrder = args['SalesOrder'];
    this.SalesOrderName = args['SalesOrderName'];
    this.ItemId = args['ItemId'];
    this.BrandModel = args['BrandModel'];
    this.Manufacturer = args['Manufacturer'];
    this.UniqueModel = args['UniqueModel'];
    this.ProductCategoryCode = args['ProductCategoryCode'];
    this.DolbyCodeId = args['DolbyCodeId'];
    this.DolbyCode = args['DolbyCode'];
    this.RoyaltyUnits = args['RoyaltyUnits'];
    this.CountryMade = args['CountryMade'];
    this.CountrySold = args['CountrySold'];
    this.Licenses = args['Licenses'];
    this.Status = args['Status'];
}