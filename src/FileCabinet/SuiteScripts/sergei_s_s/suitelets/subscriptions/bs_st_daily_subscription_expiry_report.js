/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
        'N/ui/serverWidget',
        './../../custom_modules/utilities/bs_cm_general_utils',
        './../../custom_modules/utilities/ui/bs_cm_ui_form_sublist',
        './../../custom_modules/utilities/bs_cm_runtime_utils',
        './../../custom_modules/utilities/specific/bs_cm_daily_subscription_expiry_report_utils',
        './../../custom_modules/aggregations/custom/bs_cm_exp_network_disposition',
    ],
    /**
 * @param{serverWidget} serverWidget
 */
    (
        serverWidget,
        { isNullOrEmpty, toInt },
        { addFormSublist },
        { getCurrentEmployeeId },
        { formatDateForReport, prepareNoteHeader },
        { upsertDisposition, loadExpiredNetworksWithDispositionData },
        ) => {
        const FIELDS_TO_IGNORE = ['networkid', 'employeename', 'datemodified', 'dispositionid'];
        const SUBLIST_ID = 'networkslist';

        function createNetworksSublist(currentForm, networksList = []) {
            return addFormSublist({
                id: SUBLIST_ID,
                title: 'Networks about to expire',
                label: 'networks',
                showTotal: true,
                showLineNumber: true,
                fieldNames: Object.keys(networksList[0]),
                fieldTypes: [
                    serverWidget.FieldType.TEXT,
                    serverWidget.FieldType.TEXT,
                    serverWidget.FieldType.TEXT,
                    serverWidget.FieldType.TEXT,
                    serverWidget.FieldType.TEXT,
                    serverWidget.FieldType.TEXT
                ],

                columnDimensions: [
                    [ '2%', 70 ],
                    [ '5%', 70 ],
                    [ '8%', 70 ],
                    [ '10%', 70 ],
                    [ '10%', 70 ],
                    [ '5%', 70 ],
                    [ '60%', 70 ]
                ],
                ignoreFieldNames: FIELDS_TO_IGNORE,
                customFieldHandlers: {
                    'Subscription records': (value) => {
                        let links = ''
                        for (const { subscription_subscriptionid } of value) {
                            links += `<a href="/app/accounting/subscription/subscription.nl?id=${subscription_subscriptionid}">${subscription_subscriptionid}</a><br/>`
                        }

                        return links;
                    },

                    'Subscription Record Expire Date': (value) => {
                        let strRows = ''
                        for (const { subscription_expdate } of value) {
                            strRows += `${formatDateForReport(subscription_expdate)}<br/>`
                        }

                        return strRows;
                    },

                    'Renewal Email Date': (value) => {
                        let strRows = ''
                        for (const { subscription_renewalemaildate } of value) {
                            strRows += `${formatDateForReport(subscription_renewalemaildate)}<br/>`
                        }

                        return strRows;
                    },

                    'Action': (value,  dataRow) => {
                        const dataAttributes = `data-networkid=${dataRow['networkid']}`;
                        const label = isNullOrEmpty(value) ? 'No changes' : value;

                        return `<a ${dataAttributes} href="#" class="custpage_actionbtn" style="white-space: nowrap;">${label}</a>`;
                    },

                    'CS Team Notes': (value, dataRow) => {
                        if (!isNullOrEmpty(value)) {
                            const noteHeader = prepareNoteHeader(dataRow['datemodified'], dataRow['Action'], dataRow['employeename']);
                            value = `${noteHeader} | ${value}`;

                            const linkToNotes = `<a style="display: block; text-align: center; margin-top: 20px" href="/app/common/custom/custrecordentry.nl?rectype=569&id=${dataRow['dispositionid']}">Notes</a>`;
                            return (value.length + linkToNotes.length) > 300 ? `${value.substring(0, 297 - linkToNotes.length)}...${linkToNotes}` : `${value}${linkToNotes}`;
                        } else {
                            return ' ';
                        }
                    }
                },
            }, networksList, currentForm);
        }

        function createForm() {
            const currentForm = serverWidget.createForm({
                title: 'Daily subscription expire report'
            });

            return currentForm;
        }

        function writePage(response) {
            const currentForm = createForm();
            currentForm.clientScriptModulePath = './../../client_scripts/subscriptions/bs_cl_daily_subscription_expiry_report';

            const networksList = loadExpiredNetworksWithDispositionData();

            if (isNullOrEmpty(networksList)) {
                response.writePage(currentForm);
                return;
            }

            //response.write(JSON.stringify(networksList));
            //return

            createNetworksSublist(currentForm, networksList);
            response.writePage(currentForm);
        }

        function render(scriptContext) {
            const { request, response } = scriptContext;

            const {
                custpage_networkid,
                custpage_action,
                custpage_note,
            } = request.parameters;

            if (request.method === 'GET') {
                writePage(response);
            } else if (request.method === 'POST') {
                response.write(JSON.stringify({
                    custpage_networkid,
                    custpage_action,
                    custpage_note,
                }));

                const employeeId = getCurrentEmployeeId();

                upsertDisposition(toInt(custpage_networkid), toInt(custpage_action), employeeId, custpage_note)
                writePage(response);
            } else {
                response.write('Wrong request method. Please open current suitelet using link.');
            }
        }

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            render(scriptContext);
        }

        return { onRequest }

    });
