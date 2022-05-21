/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
        'N/ui/serverWidget',
        './../../custom_modules/utilities/bs_cm_general_utils',
        './../../custom_modules/utilities/ui/bs_cm_ui_form_sublist',
        './../../custom_modules/aggregations/custom/bs_cm_exp_network_disposition',
    ],
    /**
 * @param{serverWidget} serverWidget
 */
    (
        serverWidget,
        { isNullOrEmpty },
        { addFormSublist },
        { upsertDisposition, loadExpiredNetworksWithDispositionData },
        ) => {
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
                            strRows += `${subscription_expdate}<br/>`
                        }

                        return strRows;
                    },

                    'Action': (value) => {
                        if (isNullOrEmpty(value)) {
                            return 'No changes'
                        } else {
                            return value;
                        }
                    },
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

            if (request.method === 'GET') {
                writePage(response);
            } else if (request.method === 'POST') {

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
