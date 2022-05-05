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
        { convertArrayOfObjectsToCSV },
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

                const subscriptionsSubList = currentForm.addSublist({
                    id: 'custpage_subscriptionslist',
                    type: serverWidget.SublistType.LIST,
                    title : 'Subscriptions about to expire',
                    label : 'subscriptions'
                });

                const fieldNames = Object.keys(subscriptionsList[0]);

                for (const fieldName of fieldNames) {
                    subscriptionsSubList.addField({
                        id: `custpage_subscriptions_${fieldName.toLowerCase().replace(/ /g, '_')}`,
                        type: serverWidget.FieldType.TEXT,
                        label: fieldName
                    });
                }

                let line = 0;
                for (const subscription of subscriptionsList) {
                    for (const fieldName of fieldNames) {
                        subscriptionsSubList.setSublistValue({
                            id : `custpage_subscriptions_${fieldName.toLowerCase().replace(/ /g, '_')}`,
                            line : line,
                            value : subscription[fieldName]
                        });
                    }

                    line++;
                }
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
                    title: 'Subscriptions about to expire per sales representative'
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

            //currentEmployeeId = 4203;

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
                    const csvData = convertArrayOfObjectsToCSV({ data: subscriptionsList });

                    if (csvData === null) {
                        return
                    }

                    const filenamePrefix = 'generic_csv_file';
                    const fileExtension = 'csv';
                    const fileObj = file.create({
                        name: `${filenamePrefix}_tt.${fileExtension}` ,
                        fileType: file.Type.CSV,
                        contents: csvData
                    });




                    scriptContext.response.writeFile(fileObj, false);
                }

            } else {
                response.write('Wrong request method. Please open current suitelet using link.');
            }
        }

        return {onRequest}

    });
