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
        { addFormSublist, markSublistRowsInBoldRed },
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
            const FIELDS_TO_IGNORE = ['Start date', 'End date', 'startdate_infuture', 'network_type', 'network_id'];
            const SUBLIST_ID = 'subscriptionslist';
            const PERIOD_1_WEEK = 7;

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
                    return isSalesSubordinate ? currentEmployeeId : '0';
                }

                return isSalesSubordinate ? currentEmployeeId : selectedSalesRep;
            }

            function createSubscriptionsSublist(currentForm, subscriptionsList = []) {
                const urlToNetworkManagement = getScriptURLPathQuery('customscript_sb_bsnc_create_network', 'customdeploy_sb_bsnc_create_network');

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
                        serverWidget.FieldType.INTEGER,
                        serverWidget.FieldType.TEXT,
                        serverWidget.FieldType.TEXT
                    ],
                    ignoreFieldNames: FIELDS_TO_IGNORE,
                    customFieldHandlers: {
                        'Customers': (value) => {
                            let links = '';

                            const numOfCustomers = value.length;

                            if (numOfCustomers <= 0) {
                                return links;
                            }

                            let line = 0;
                            for (const customer of value) {
                                const { customer_subscriptioncustomerid, customer_name } = customer;

                                links += `<a href="/app/common/entity/custjob.nl?id=${customer_subscriptioncustomerid}">${customer_name}</a>`;
                                line += 1;

                                if (line < numOfCustomers) {
                                    links += '<br/>';
                                }
                            }

                            return links;
                        },

                        'Network': (value, dataRow) => {
                            const networkAdminEmail = dataRow['Network'];
                            return `<a href="${urlToNetworkManagement}&bsn_email=${networkAdminEmail}">${value}</a>`;
                        },
                    },
                }, subscriptionsList, currentForm);
            }

            function createForm(isSalesSubordinate = false, selectedSalesRepId, selectedPeriod) {
                const currentForm = serverWidget.createForm({
                    title: 'List of networks that will expire this week'
                });

                addFormSelectBox({
                        id: 'salesrepselect',
                        label: 'Sales representative',
                        disabled: isSalesSubordinate,
                        defaultValue: selectedSalesRepId,
                    },
                    [
                        { id: -1, entityid: '-Not Assigned-' },
                        { id: 0, entityid: 'All' }
                    ]
                        .concat(loadActiveSalesRepsNames())
                        .map(dataRow => ({ value: dataRow.id, text: dataRow.entityid })),
                    currentForm
                );

                addFormSelectBox({
                        id: 'period',
                        label: 'Period',
                        disabled: false,
                        defaultValue: selectedPeriod,
                    },
                    [
                        { value: PERIOD_1_WEEK, text: 'one week' },
                        { value: 14, text: 'two weeks' },
                        { value: 31, text: 'one month' },
                        { value: 365, text: 'one year' },
                    ],

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

            function addCustomStyling(currentForm) {
                markSublistRowsInBoldRed({
                    sublistId: SUBLIST_ID,
                    startRowNum: 2,
                    column: 4,
                }, currentForm);
            }

            function writePage(response, isSalesSubordinate, selectedSalesRepId, showSublist = false, selectedPeriod = PERIOD_1_WEEK) {
                const currentForm = createForm(isSalesSubordinate, selectedSalesRepId, selectedPeriod);

                if (isNullOrEmpty(selectedSalesRepId) || !showSublist) {
                    response.writePage(currentForm);
                    return;
                }

                const subscriptionsList = loadExpSubsForSalesReps(selectedSalesRepId === '0' ? null : selectedSalesRepId, selectedPeriod);

                if (isNullOrEmpty(subscriptionsList)) {
                    response.writePage(currentForm);
                    return;
                }

                //addCustomStyling(currentForm);
                createSubscriptionsSublist(currentForm, subscriptionsList);

                response.writePage(currentForm);
            }

            function writeCSV(response, selectedSalesRepId, selectedPeriod = PERIOD_1_WEEK) {
                const subscriptionsList = loadExpSubsForSalesReps(selectedSalesRepId === '0' ? null : selectedSalesRepId, selectedPeriod);
                removeFieldsFromObjectsArray(subscriptionsList, FIELDS_TO_IGNORE);

                const csvFileObj = prepareCSVFileObject(subscriptionsList, null, {
                    filenamePrefix: 'networks',

                    customFieldHandlers: {
                        'Customers': (value) => {
                            const customers = [];
                            for (const customer of value) {
                                const { customer_name } = customer;
                                customers.push(customer_name);
                            }

                            return customers.join('; ')
                        }
                    }
                });

                response.writeFile(csvFileObj, false);
            }

            function render() {
                const { request, response } = scriptContext;
                const {
                    custpage_salesrepselect,
                    custpage_period,
                    custpage_generatecsvflag,
                    salesrepidreq
                } = request.parameters;

                let currentEmployeeId = getCurrentEmployeeId();
                //currentEmployeeId = 4203;
                //143898

                const isSalesSubordinate = checkIfSalesSubordinate(currentEmployeeId);
                const selectedSalesRepId = determineSelSalesRepId(currentEmployeeId, isSalesSubordinate, custpage_salesrepselect, salesrepidreq);

                if (request.method === 'GET') {
                    writePage(response, isSalesSubordinate, selectedSalesRepId, false, custpage_period);
                } else if (request.method === 'POST') {
                    if (custpage_generatecsvflag === 'F') {
                        writePage(response, isSalesSubordinate, selectedSalesRepId, true, custpage_period);
                    } else {
                        writeCSV(response, selectedSalesRepId, custpage_period);
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
