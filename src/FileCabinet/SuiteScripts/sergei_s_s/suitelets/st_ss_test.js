/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
        'N/ui/serverWidget',
        'N/file',
        './../custom_modules/utilities/bs_cm_runtime_utils',
        './../custom_modules/entities/bs_cm_sales_rep',
        './../custom_modules/aggregations/subscription/bs_cm_expired_subscription_for_salesrep',
        './../custom_modules/utilities/bs_cm_runtime_utils',
        './../custom_modules/utilities/ui/bs_cm_ui_form_sublist',
        './../custom_modules/utilities/ui/bs_cm_ui_form',
        './../custom_modules/bs_cm_csv_utils',
        './../custom_modules/utilities/bs_cm suite_billing_settings_utils',
        './../custom_modules/utilities/bs_cm_array_utils',
        './../custom_modules/utilities/bs_cm_general_utils',
    ],
    /**
 * @param{query} query
 */
    (
        serverWidget,
        file,
        { getCurrentEmployeeId, getScriptCurrentURLPath },
        { loadActiveSalesRepsNames, checkIfSalesSubordinate },
        { loadExpSubsForSalesReps },
        { getScriptURLPathQuery },
        { addFormSublist },
        { addFormSelectBox },
        { prepareCSVFileObject },
        { getNetworkTypeStrByTypeId },
        { removeFieldsFromObjectsArray },
        { isNullOrEmpty },
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            const FIELDS_TO_IGNORE = ['startdate_infuture', 'network_type', 'network_id'];
            const SUBLIST_ID = 'subscriptionslist';

            function determineSelSalesRepId(currentEmployeeId, isSalesSubordinate, selSalesRepIdList, selSalesRepIdReq) {
                if (isNullOrEmpty(currentEmployeeId)) {
                    throw new Error('Employee id is not defined');
                }

                let selectedSalesRep;
                if (!isNullOrEmpty(selSalesRepIdList)) {
                    selectedSalesRep = selSalesRepIdList;
                } else if (!isNullOrEmpty(selSalesRepIdReq)) {
                    selectedSalesRep = selSalesRepIdReq;
                } else {
                    return null;
                }

                return isSalesSubordinate ? currentEmployeeId : selectedSalesRep;
            }

            function createSubscriptionsSublist(currentForm, subscriptionsList = []) {
                const urlToNetworkManagement = getScriptURLPathQuery('customscript_sbss1_bsnc_sl_network_page', 'customdeploy_sbss1_bsnc_sl_network_page');

                return addFormSublist({
                    id: SUBLIST_ID,
                    title: 'Subscriptions about to expire',
                    label: 'subscriptions',
                    showTotal: true,
                    showLineNumber: true,
                    fieldNames: Object.keys(subscriptionsList[0]),
                    fieldTypes: [
                        serverWidget.FieldType.TEXT,
                        serverWidget.FieldType.EMAIL,
                        serverWidget.FieldType.DATE,
                        serverWidget.FieldType.DATE,
                        serverWidget.FieldType.TEXT
                    ],
                    ignoreFieldNames: FIELDS_TO_IGNORE,
                    customFieldHandlers: {
                        'Network': (value, dataRow) => {
                            const networkId = dataRow['network_id'];
                            const networkType = getNetworkTypeStrByTypeId(dataRow['network_type']);
                            const networkName = dataRow['Network'];

                            return `<a href="${urlToNetworkManagement}&bsnc_network=${networkId}&bsnc_type=${networkType}&bsnc_network_name=${networkName}">${value}</a>`;
                        },
                    },
                }, subscriptionsList, currentForm);
            }

            function createForm(isSalesSubordinate = false) {
                const currentForm = serverWidget.createForm({
                    title: 'List of networks that will expire this week'
                });

                addFormSelectBox({
                        id: 'salesrepselect',
                        label: 'Sales representative',
                        disabled: isSalesSubordinate,
                    },
                    [{ id: 0, entityid: 'All' }]
                        .concat(loadActiveSalesRepsNames())
                        .map(dataRow => ({ value: dataRow.id, text: dataRow.entityid })),
                    currentForm
                );

                currentForm.addField({
                    id: 'custpage_generatecsvflag',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'Generate CSV',
                });

                currentForm.addSubmitButton({
                    label : 'Submit'
                });

                return currentForm;
            }

            function composeStyleForSublistRow(cellStyle, sublistId, rowNum, columnNam) {
                return `
                    table#custpage_${sublistId}_splits tr:nth-child(${rowNum}) td:nth-child(${columnNam}).uir-list-row-cell {
                        ${cellStyle}
                    }
                `;
            }

            function addCustomStyling(currentForm, subscriptionsList) {
                let line = 2;

                const cellStyle = `
                    color: red !important;
                    font-weight: bold;
                `;

                let styleContents = '<style>';
                for(const dataRow of subscriptionsList) {
                    if (dataRow['startdate_infuture'] === 'T') {
                        styleContents += composeStyleForSublistRow(cellStyle, SUBLIST_ID, line, 4);
                    } else {
                        styleContents += composeStyleForSublistRow(cellStyle, SUBLIST_ID, line, 5);
                    }

                    line++;
                }

                styleContents += '</style>';

                const $inlineHTML = currentForm.addField({
                    id: 'custpage_header',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: ' '
                });

                $inlineHTML.defaultValue = styleContents;

                $inlineHTML.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
                });
            }

            function writePage(response, isSalesSubordinate, selectedSalesRepId) {
                const currentForm = createForm(isSalesSubordinate);

                if (isNullOrEmpty(selectedSalesRepId)) {
                    response.writePage(currentForm);
                    return;
                }

                const subscriptionsList = loadExpSubsForSalesReps(selectedSalesRepId === '0' ? null : selectedSalesRepId);

                if (isNullOrEmpty(subscriptionsList)) {
                    response.writePage(currentForm);
                    return;
                }

                addCustomStyling(currentForm, subscriptionsList);
                createSubscriptionsSublist(currentForm, subscriptionsList);

                response.writePage(currentForm);
            }

            function writeCSV(response, selectedSalesRepId) {
                const subscriptionsList = loadExpSubsForSalesReps(selectedSalesRepId === '0' ? null : selectedSalesRepId);
                removeFieldsFromObjectsArray(subscriptionsList, FIELDS_TO_IGNORE);

                const csvFileObj = prepareCSVFileObject(subscriptionsList, null, {
                    filenamePrefix: 'networks'
                });

                response.writeFile(csvFileObj, false);
            }

            function render() {
                const { request, response } = scriptContext;
                const { custpage_salesrepselect, custpage_generatecsvflag, salesrepidreq } = request.parameters;

                let currentEmployeeId = getCurrentEmployeeId();
                currentEmployeeId = 4203;

                const isSalesSubordinate = checkIfSalesSubordinate(currentEmployeeId);
                const selectedSalesRepId = determineSelSalesRepId(currentEmployeeId, isSalesSubordinate, custpage_salesrepselect, salesrepidreq);

                if (request.method === 'GET') {
                    writePage(response, isSalesSubordinate, selectedSalesRepId);
                } else if (request.method === 'POST') {
                    if (custpage_generatecsvflag === 'F') {
                        writePage(response, isSalesSubordinate, selectedSalesRepId);
                    } else {
                        writeCSV(response, selectedSalesRepId);
                    }
                } else {
                    response.write('Wrong request method. Please open current suitelet using link.');
                }
            }

            // main
            render();
        }

        return {onRequest}

    });
