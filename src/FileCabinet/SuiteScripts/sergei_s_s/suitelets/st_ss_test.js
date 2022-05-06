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
        './../custom_modules/bs_cm_csv_utils',
        './../custom_modules/utilities/bs_cm_general_utils'
    ],
    /**
 * @param{query} query
 */
    (
        serverWidget,
        file,
        { getCurrentEmployeeId, getScriptCurrentURLPath },
        { loadActiveSalesRepsNames },
        { loadExpSubsForSalesReps },
        { getScriptURLPathQuery },
        { addFormSublist },
        { prepareCSVFileObject },
        { isNullOrEmpty }
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            function subscriptionsSublist(currentForm, salesRepId = null) {
                const subscriptionsList = loadExpSubsForSalesReps(salesRepId);

                if (isNullOrEmpty(subscriptionsList)) {
                    return;
                }

                 const urlToNetworkManagement = getScriptURLPathQuery('customscript_sb_bsnc_create_network', 'customdeploy_sb_bsnc_create_network');

                return addFormSublist({
                    id: 'subscriptionslist',
                    title: 'Subscriptions about to expire',
                    label: 'subscriptions',
                    showTotal: true,
                    showLineNumber: true,
                    fieldNames: Object.keys(subscriptionsList[0]).filter( fieldName => fieldName !== 'startdate_infuture'),
                    fieldTypes: [
                        serverWidget.FieldType.TEXT,
                        serverWidget.FieldType.EMAIL,
                        serverWidget.FieldType.TEXT,
                        serverWidget.FieldType.DATE,
                        serverWidget.FieldType.TEXT
                    ],
                    ignoreFieldNames: ['startdate_infuture'],
                    customFieldHandlers: {
                        'Start date': (value, dataRow) => dataRow['startdate_infuture'] === 'T' ? `<b style="color: red">${value}<b>` : value,
                        'End date': (value, dataRow) => dataRow['startdate_infuture'] === 'F' ? `<b style="color: red">${value}<b>` : value,
                        'Network': (value) => `<a href="${urlToNetworkManagement}">${value}</a>`,
                    }
                }, subscriptionsList, currentForm);
            }

            function addSalesRepSelectBoxOptions(selectElm) {
                const salesReps = loadActiveSalesRepsNames();

                selectElm.addSelectOption({
                    value: 0,
                    text: 'All'
                });

                for (const salesRepRow of salesReps) {
                    selectElm.addSelectOption({
                        value: salesRepRow.id,
                        text: salesRepRow.entityid
                    });
                }
            }

            function createForm(selectBox = false) {
                const currentForm = serverWidget.createForm({
                    title: 'List of networks that will expire this week'
                });

                if (selectBox) {
                    const salesRepSelect = currentForm.addField({
                        id: 'custpage_salesrepselect',
                        type: serverWidget.FieldType.SELECT,
                        label: 'Sales representative'
                    });

                    addSalesRepSelectBoxOptions(salesRepSelect);
                }

                currentForm.addField({
                    id: 'custpage_generatecsvflag',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'Generate CSV'
                });

                currentForm.addSubmitButton({
                    label : 'Submit'
                });

                return currentForm;
            }

            const { request, response } = scriptContext;
            const { custpage_salesrepselect, custpage_generatecsvflag } = request.parameters;

            let currentEmployeeId = getCurrentEmployeeId();

            if (isNullOrEmpty(currentEmployeeId)) {
                response.write('Emplolyee id is not defined.');
                return;
            }

            let currentForm;

            currentEmployeeId = 4203;



            if ([4203, 7, 142375].includes(currentEmployeeId)) {
                currentForm = createForm(true);
            } else {
                currentForm = createForm(false);
            }

            if (request.method === 'GET') {
                response.writePage(currentForm);
            } else if (request.method === 'POST') {
                let selectedSalesRep;

                if ([4203, 7, 142375].includes(currentEmployeeId)) {
                    selectedSalesRep = custpage_salesrepselect === '0' ? null : custpage_salesrepselect;
                } else {
                    selectedSalesRep = currentEmployeeId;
                }

                if (custpage_generatecsvflag === 'F') {
                    subscriptionsSublist(currentForm, selectedSalesRep);
                    response.writePage(currentForm);
                } else {
                    const subscriptionsList = loadExpSubsForSalesReps(selectedSalesRep);
                    const csvFileObj = prepareCSVFileObject(subscriptionsList, null, {
                        filenamePrefix: 'networks'
                    });

                    // TODO need to cleanup
                    scriptContext.response.writeFile(csvFileObj, false);
                }

            } else {
                response.write('Wrong request method. Please open current suitelet using link.');
            }
        }

        return {onRequest}

    });
