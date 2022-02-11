/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       1 Jul 2021     Sergey Matvyeyev
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord customer
 * @appliedtorecord salesorder
 * @appliedtorecord quote
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function onChangeSetting(type, name, linenum){
  	var ver = (name == 'custpage_subscription_plan') ? '' : '_2';
  	if( name == 'custpage_subscription_plan' || name == 'custpage_subscription_plan_2' ){
      	var subscriptionPlanRecID = nlapiGetFieldValue("custpage_subscription_plan"+ver);
       	var itemType = nlapiLookupField('item', subscriptionPlanRecID, 'type');
      	var tierLevelArr = {'MSRP':'pricebook_msrp'+ver,
                            'Tier 1: 25% off MSRP':'pricebook_tier1'+ver,
                            'Tier 2: 30% off MSRP':'pricebook_tier2'+ver,
                            'Tier 3: 35% off MSRP':'pricebook_tier3'+ver,
                            'Tier 4: 40% off MSRP':'pricebook_tier4'+ver,
                            'Tier 5: 45% off MSRP':'pricebook_tier5'+ver,
                            'Support':'pricebook_support'+ver,
                            'Custom':'pricebook_custom'+ver};

      	if(itemType == 'SubscriPlan'){
    	    var subscriptionplanObj = nlapiLoadRecord('subscriptionplan', subscriptionPlanRecID);
            var subscriptionplanSubItem = subscriptionplanObj.getLineItemValue('member', 'item', 1);
            nlapiSetFieldValue('custpage_subscription_plan_item'+ver, subscriptionplanSubItem);
          	nlapiSetFieldValue('custpage_subscription_plan_itemid'+ver, subscriptionplanSubItem);
          	var pricebookArray = getPricebookOfSubscriptionplan(subscriptionPlanRecID);
          
            for ( var pricebookLine in pricebookArray )
            {
                if(pricebookArray.hasOwnProperty(pricebookLine))
                {
                  	console.log(pricebookArray[pricebookLine]);
                  	//console.log();
                  	var tierInternalid = pricebookArray[pricebookLine].getValue('internalid');
                  	var tierName = pricebookArray[pricebookLine].getValue('name');
                  	var tierFieldId = tierLevelArr[tierName];
                  	//var tierLevelPrice = pricebookArray[pricebookLine].getValue('price');
                  	//var matches = tierLevelPrice.match(/\$\d{1,2}.\d{2}/gm);
                  	nlapiSetFieldValue( 'custpage_' + tierFieldId, tierInternalid );
                  	//ids = selectmap[i] != null ? (ids != '' ? ids + String.fromCharCode(5) : '') + i : ids;
                  	//labels = selectmap[i] != null ? (labels.length > 0 ? labels + String.fromCharCode(5) : '') + selectmap[i] : labels;
                }
            }
          
        } else {
          	alert('Chosen item is not subscription plan');
        }
    }
}

function getPricebookOfSubscriptionplan(subscriptionPlanID){
  	//pricebook
  	var additionalFilters = new Array();
    additionalFilters[0] = new nlobjSearchFilter('subscriptionplan', null, 'is', subscriptionPlanID);
    var columns = new Array();
    columns[0] = new nlobjSearchColumn( 'internalid' );
    columns[1] = new nlobjSearchColumn( 'name' );
    columns[2] = new nlobjSearchColumn('price');
    var searchresults = nlapiSearchRecord('pricebook', null, additionalFilters, columns);

    return searchresults;
}