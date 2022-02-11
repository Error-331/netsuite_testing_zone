/*

 */
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 *
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function onBeforeLoad(type, form, request){
    var allowedRoles = [3,//Admin
        1057,//BSNEE Specialist
        1034//Product Management
    ];
    var curRole = nlapiGetRole();
    if( !_.contains(allowedRoles, curRole) ){
        nlapiSetFieldDisabled('custbody_bs_passed_bsnee_tq', true);
    }
}

function onBeforeSubmit(type) {

    // EUD Items uncomment when ready for prod deployment
    if (type == 'create' || type == 'edit') {

        var overrideEUDAdd = nlapiGetFieldValue('custbody_override_eud_script');
        if (overrideEUDAdd == 'T')
            return;

        var EUDItemIDs = [359, 416, 415, 414, 805];
        var lineItemCount = nlapiGetLineItemCount('item');
        nlapiLogExecution('DEBUG', arguments.callee.name + ': lineItemCount', lineItemCount);
        for (var i = 1; i <= lineItemCount; i++) {
            var item = parseInt(nlapiGetLineItemValue('item', 'item', i));
            if (_.contains(EUDItemIDs, item)) {
                nlapiLogExecution('DEBUG', arguments.callee.name + ' :Removing line #', i);
                nlapiRemoveLineItem('item', i);
                lineItemCount = nlapiGetLineItemCount('item');
                i = 1;
            }
        }
    }

}


function onAfterSubmit(type) {

    // EUD Items uncomment when ready for prod deployment
    if (type == 'create' || type == 'edit') {

        var i, netherlandsLocations = [13, 14, 15, 16, 17, 18];
        var id = nlapiGetRecordId();

        var record = nlapiLoadRecord('estimate', id);

        var overrideEUDAdd = record.getFieldValue('custbody_override_eud_script');
        if (overrideEUDAdd == 'T')
            return;

        var location = record.getFieldValue('location');
        location = parseInt(location);

        var lineItemCount = record.getLineItemCount('item');
        nlapiLogExecution('DEBUG', arguments.callee.name + ': lineItemCount', lineItemCount);

        var EUDItems = [];
        for (i = 1; i <= lineItemCount; i++) {

            var qtr = record.getLineItemValue('item', 'custcol_bs_fiscal_quarter', i);
            if (_.contains(netherlandsLocations, location)) {

                var item = record.getLineItemValue('item', 'item', i);
                var qty = record.getLineItemValue('item', 'quantity', i);
                var EUDData = nlapiLookupField('inventoryitem', item,
                    ['custitem_eud_item', 'custitem_eud_charge_price']);

                if (!EUDData || !EUDData['custitem_eud_item'])
                    continue;

                EUDItems.push({
                    //'mainItem': item,
                    'EUDItem': EUDData['custitem_eud_item'],
                    'EUDItemCost': EUDData['custitem_eud_charge_price'],
                    'qty': qty,
                    'location': location,
                    'qtr': qtr
                });
            }
        }

        nlapiLogExecution('DEBUG', 'EDUItems', JSON.stringify(EUDItems));

        var EUDItemsGrouped = _.groupBy(EUDItems, 'EUDItem');
        nlapiLogExecution('DEBUG', 'EUDItemsGrouped', JSON.stringify(EUDItemsGrouped));

        for (var EUDItem in EUDItemsGrouped) {

            for (i = 0; i < EUDItemsGrouped[EUDItem].length; i++) {

                record.selectNewLineItem('item');
                record.setCurrentLineItemValue('item', 'item', EUDItem);
                record.setCurrentLineItemValue('item', 'quantity', EUDItemsGrouped[EUDItem][i].qty);
                record.setCurrentLineItemValue('item', 'rate', EUDItemsGrouped[EUDItem][i].EUDItemCost);
                record.setCurrentLineItemValue('item', 'location', EUDItemsGrouped[EUDItem][i].location);
                record.setCurrentLineItemValue('item', 'custcol_bs_fiscal_quarter', EUDItemsGrouped[EUDItem][i].qtr);
                record.commitLineItem('item');
            }

        }

        nlapiSubmitRecord(record);
    }
}