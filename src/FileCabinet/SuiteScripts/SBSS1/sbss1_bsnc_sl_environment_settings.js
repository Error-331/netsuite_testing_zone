/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       09 Jun 2021     Serhii Matvyeyv
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */

function processingSettings(request, response){
    var editMode = false;
    var context = nlapiGetContext();

    var additionalFilters = new Array();
    var columns = new Array();
    columns[0] = new nlobjSearchColumn( 'internalid' );
    columns[1] = new nlobjSearchColumn( 'name' );
    columns[2] = new nlobjSearchColumn('custrecord_bs_environment_setting_type' );
    columns[3] = new nlobjSearchColumn('custrecord_bs_environment_setting_label' );
    columns[4] = new nlobjSearchColumn('custrecord_bs_enviroment_setting_tab' );
    columns[5] = new nlobjSearchColumn('custrecord_bs_enviroment_setting_source' );
    columns[6] = new nlobjSearchColumn('custrecord_bs_enviroment_setting_value' );
    columns[7] = new nlobjSearchColumn('custrecord_bs_enviroment_setting_help' );
    columns[8] = new nlobjSearchColumn('custrecord_bs_environment_setti_readonly' );
    columns[9] = new nlobjSearchColumn('custrecord_bs_environment_setting_group' );
    columns[10] = new nlobjSearchColumn('custrecord_bs_environment_setting_posnum' ).setSort();
    var searchresults = nlapiSearchRecord('customrecord_bs_enviroment_setting', null, additionalFilters, columns);

    //nlapiLogExecution('DEBUG', 'Environment Setting List', JSON.stringify(searchresults));

    if(request.getMethod() == 'POST') {
        //nlapiLogExecution( 'DEBUG', 'POST' );

        if(request.getParameter('custparam_editmode') == 'T'){
            var editMode = true;
        } else {
            var editableTypes = ['Text', 'Email', 'Textarea', 'Phone', 'Date', 'Datetimetz', 'Currency', 'Float',
                'Integer', 'Checkbox', 'Select', 'Timeofday', 'Multiselect', 'Image', 'Password',
                'Longtext', 'Richtext', 'Percent', 'Radio'];

            for ( var n = 0; searchresults != null && n < searchresults.length; n++ ) {
                var curSettingType = searchresults[n].getText('custrecord_bs_environment_setting_type');
                if( editableTypes.indexOf( curSettingType ) != -1 ){
                    var internalid = searchresults[n].getText('internalid');
                    var settingName = searchresults[n].getValue('name');

                    if( curSettingType == 'Radio'){
                        var settingValFromPOST = request.getParameter(settingName);
                        var settingValFromRadioObj = JSON.parse(searchresults[n].getValue('custrecord_bs_enviroment_setting_value'));
                        var settingValFromRec = settingValFromRadioObj[settingName];
                    } else{
                        var settingValFromPOST = request.getParameter('custpage_' + settingName).trim();
                        var settingValFromRec = searchresults[n].getValue('custrecord_bs_enviroment_setting_value');
                    }

                    if( settingValFromRec == settingValFromPOST ){
                        //nlapiLogExecution('DEBUG', 'settingName: custpage_'+ settingName, 'has same value');
                    } else {
                        //nlapiLogExecution('DEBUG', 'settingName: custpage_'+ settingName, settingValFromRec + ' (are different value) ' + settingValFromPOST);
                        var record = nlapiLoadRecord('customrecord_bs_enviroment_setting', internalid);
                        if( curSettingType == 'Radio')
                            var settingValFromPOST = '{"' + settingName + '":"' + request.getParameter(settingName) + '"}';
                        record.setFieldValue('custrecord_bs_enviroment_setting_value', settingValFromPOST);
                        nlapiSubmitRecord(record);
                    }
                }
            }

            var additionalFilters = new Array();
            var columns = new Array();
            columns[0] = new nlobjSearchColumn( 'internalid' );
            columns[1] = new nlobjSearchColumn( 'name' );
            columns[2] = new nlobjSearchColumn('custrecord_bs_environment_setting_type' );
            columns[3] = new nlobjSearchColumn('custrecord_bs_environment_setting_label' );
            columns[4] = new nlobjSearchColumn('custrecord_bs_enviroment_setting_tab' );
            columns[5] = new nlobjSearchColumn('custrecord_bs_enviroment_setting_source' );
            columns[6] = new nlobjSearchColumn('custrecord_bs_enviroment_setting_value' );
            columns[7] = new nlobjSearchColumn('custrecord_bs_enviroment_setting_help' );
            columns[8] = new nlobjSearchColumn('custrecord_bs_environment_setti_readonly' );
            columns[9] = new nlobjSearchColumn('custrecord_bs_environment_setting_group' );
            columns[10] = new nlobjSearchColumn('custrecord_bs_environment_setting_posnum' ).setSort();
            var searchresults = nlapiSearchRecord('customrecord_bs_enviroment_setting', null, additionalFilters, columns);
        }
    }

    form = nlapiCreateForm('Environment Settings', false);
    var fieldMode = form.addField('custparam_editmode', 'text', null, null, null).setDisplayType('hidden');
    var tabsList = getListValues('customlist_bs_environment_setting_tabs');
    for (var a = 0; tabsList != null && a < tabsList.length; a++) {
        if(tabsList[a] == null)
            continue;

        form.addTab('custpage_tabnumber'+a, tabsList[a]);
    }

    var uniquGroups = [];

    for ( var i = 0; searchresults != null && i < searchresults.length; i++ ) {
        var settingType = searchresults[i].getText('custrecord_bs_environment_setting_type');
        var settingTab = 'custpage_tabnumber'+searchresults[i].getValue('custrecord_bs_enviroment_setting_tab');
        var settingLabel = searchresults[i].getValue('custrecord_bs_environment_setting_label');
        var settingVal = searchresults[i].getValue('custrecord_bs_enviroment_setting_value');
        var settingName = searchresults[i].getValue('name');
        var settingSource = searchresults[i].getValue('custrecord_bs_enviroment_setting_source');
        var settingHelp = searchresults[i].getValue('custrecord_bs_enviroment_setting_help');
        var settingReadonly = searchresults[i].getValue('custrecord_bs_environment_setti_readonly');
        var settingGroup = searchresults[i].getValue('custrecord_bs_environment_setting_group');
        var settingGroupName = searchresults[i].getText('custrecord_bs_environment_setting_group');
        var position = settingGroup != '3' ? settingGroup : settingTab;

        if(settingGroup != '3'){
            //nlapiLogExecution('DEBUG', 'exist group: ' + settingGroup);
            if( uniquGroups.indexOf( settingGroup ) == -1 ){
                //nlapiLogExecution('DEBUG', 'new uniq: ' + settingGroup);
                var bsn_cloud_group = form.addFieldGroup(settingGroup, settingGroupName, settingTab);
                bsn_cloud_group.setSingleColumn(true);
                uniquGroups.push( settingGroup );
            }
        }

        if(settingType == 'Radio'){
            var settingSourceJSON = JSON.parse( settingSource );

            var radioField = form.addField( settingName+'label', 'label', settingLabel, null, position ).setDisplayType('inline');
            var optionAmounts = Object.keys(settingSourceJSON).length;

            for(skey in settingSourceJSON){
                if (editMode)
                    form.addField(settingName, 'radio', settingSourceJSON[skey], skey, position);
                else
                    form.addField(settingName, 'radio', settingSourceJSON[skey], skey, position).setDisplayType('inline');
            }

            form.setFieldValues( JSON.parse(settingVal) );

        } else if(settingType == 'Select' || settingType == 'Multiselect') {
            //nlapiLogExecution('DEBUG', 'source before trim', settingSource);
            if(settingSource.trim() != ''){
                var jsonObj = isJson(settingSource);
                //nlapiLogExecution('DEBUG', 'jsonObj', jsonObj);
                var sourceList = (jsonObj) ? null : settingSource;
                var selectFieldOfsetting = form.addField('custpage_' + settingName,
                    settingType,
                    settingLabel,
                    sourceList,
                    position ).setLayoutType('normal','startrow');
                if( jsonObj ){
                    for(key in jsonObj)
                        selectFieldOfsetting.addSelectOption( jsonObj[key], key );
                }
                if(settingVal.trim() != '') {
                    selectFieldOfsetting.setDefaultValue(settingVal.trim());
                    //nlapiLogExecution('DEBUG', 'default', 'selectFieldOfsetting.setDefaultValue(' + settingVal.trim() + ')');
                }

                if (!editMode)
                    selectFieldOfsetting.setDisplayType('inline');
                else if(settingReadonly == 'T')
                    selectFieldOfsetting.setDisplayType('disabled');

                //nlapiLogExecution('DEBUG', 'settingReadonly select', settingReadonly == 'T');

                if(settingHelp.length > 2)
                    selectFieldOfsetting.setHelpText(settingHelp, true);

            }

        } else {
            var notificationMessage = form.addField('custpage_' + settingName,
                settingType,
                settingLabel,
                null,
                position );
            notificationMessage.setDefaultValue( settingVal );

            if (!editMode)
                notificationMessage.setDisplayType('inline');
            else if(settingReadonly == 'T')
                notificationMessage.setDisplayType('disabled');					//nlapiLogExecution('DEBUG', 'rabotaet');

            if(settingHelp.length > 2)
                notificationMessage.setHelpText(settingHelp, true);
        }

    }

    //position


    //form.addSubmitButton('Submit');
    if (editMode) {
        fieldMode.setDefaultValue('F');
        form.setScript('customscript_environment_settings');
        form.addSubmitButton('Save');
        form.addResetButton('Reset');
    } else {
        fieldMode.setDefaultValue('T');
        form.addSubmitButton('Edit');
    }

    response.writePage(form);
    //}
}

function getListValues(listScriptId) {
    var searchColumn = new nlobjSearchColumn('name');
    var searchResults = nlapiSearchRecord(listScriptId, null, null, searchColumn);
    var listArray = new Array();
    for (i in searchResults) {
        listArray[searchResults[i].id] = searchResults[i].getValue(searchColumn);
    }
    return listArray;
}

function isJson(str) {
    try {
        var obj = JSON.parse(str);
    } catch (e) {
        return false;
    }
    return obj;
}