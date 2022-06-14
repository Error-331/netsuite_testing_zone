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
        { getCurrentEmployeeId, getScriptURLPathQuery },
        { formatDateForReport, prepareNoteHeader },
        { upsertDisposition, loadExpiredNetworksWithDispositionData },
        ) => {
        const FIELDS_TO_IGNORE = ['networkid', 'employeename', 'dispositionid', 'actionid'];
        const SUBLIST_ID = 'networkslist';

        function createNetworksSublist(currentForm, networksList = []) {
            const urlToNetworkManagement = getScriptURLPathQuery('customscript_sb_bsnc_create_network', 'customdeploy_sb_bsnc_create_network');

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
                    serverWidget.FieldType.DATE,
                    serverWidget.FieldType.DATE,
                    serverWidget.FieldType.TEXT,
                    serverWidget.FieldType.TEXT
                ],

                columnDimensions: [
                    [ '2%', 70 ],
                    [ '5%', 70 ],
                    [ '8%', 70 ],
                    [ '10%', 70 ],
                    [ '10%', 70 ],
                    [ '10%', 70 ],
                    [ '10%', 70 ],
                    [ '5%', 70 ],
                    [ '40%', 70 ]
                ],

                columnStyles: [
                    null,
                    null,
                    null,
                    null,
                    null,
                    (value) => {
                        let expDate = value?.[0]?.['subscription_expdate'];
                        expDate = isNullOrEmpty(expDate) ? null : formatDateForReport(expDate);

                        return [
                            {
                                style: `
                                    --expdate: '${expDate}';
                                    position: relative;
                                `
                            },
                            {
                                className: ':after',
                                style: `
                                    content: var(--expdate);
                                
                                    width: 100%;
                                    height: 100%;

                                    display: block;
                                    position: absolute;
                                  
                                    top: 0px;
                                    background-color: inherit;
                                `
                            }
                        ]
                    },

                    (value) => {
                        let expDate = isNullOrEmpty(value) ? '' : formatDateForReport(value);

                        return [
                            {
                                style: `
                                    --expdate: '${expDate}';
                                    position: relative;
                                `
                            },
                            {
                                className: ':after',
                                style: `
                                    content: var(--expdate);
                                
                                    width: 100%;
                                    height: 100%;

                                    display: block;
                                    position: absolute;
                                  
                                    top: 0px;
                                    background-color: inherit;
                                `
                            }
                        ]
                    },

                    [
                        {
                            className: 'a.dispositionLink',
                            style: `
                                display: flex;
                                box-sizing: border-box;
                                
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                
                                width: 100%;
                                height: 100%;
                                
                                padding: 0px 5px 0px 5px;
                                
                                border-radius: 3px;
                                
                                text-decoration: none;
                                box-shadow: rgba(0, 0, 0, 0.3) 0 0.1em 0.1em;
                             `
                        },

                        {
                            className: 'a.dispositionLink span',
                            style: `
                                display: block;
                                
                                flex-basis: auto; 
                                flex-grow: 0; 
                                flex-shrink: 0;

                                font-size: 12px;
                                font-weight: bold;
                                
                                text-shadow: rgba(0, 0, 0, 0.5) 0 -0.08em 0;
                                text-decoration: none;

                                color: white;
                             `
                        },

                        {
                            className: 'a.disposition',
                            style: `
                                background-image: linear-gradient(to right bottom, #1aff1a, #00e600 3%, #00b300) !important;
                            `
                        },

                        {
                            className: 'a.mergebuyer',
                            style: `
                                background-image: linear-gradient(to right bottom, #ffff1a, #e6e600 3%, #b3b300) !important;
                            `
                        },

                        {
                            className: 'a.mergebuyer span',
                            style: `
                                color: #363603;
                            `
                        },

                        {
                            className: 'a.nochanges',
                            style: `
                                background-image: linear-gradient(to right bottom, #ffffff, #e6e6e6 3%, #b3b3b3) !important;
                            `
                        },

                        {
                            className: 'a.nochanges span',
                            style: `
                                color: #363603;
                            `
                        },

                        {
                            className: 'a.escalate',
                            style: `
                                background-image: linear-gradient(to right bottom, #ff1a1a, #e60000 3%, #b30000) !important;
                            `
                        }
                    ],

                    [
                        {
                            className: 'a.noteslink',
                            style: `
                                display: block; 
                                text-align: center; 
                                margin-top: 20px;
                        `
                        },

                        {
                            className: 'a.moreLink',
                            style: `
                                padding-left: 10px;
                            `
                        },



                    ],


                ],

                ignoreFieldNames: FIELDS_TO_IGNORE,
                customFieldHandlers: {
                    'Network name': (value) => `<a target="_blank" href="${urlToNetworkManagement}&bsn_email=${value}">${value}</a>`,
                    'Subscription records': (value, dataRow) => `<section data-sectiontype='subcription_records' data-networkid=${dataRow['networkid']}>Loading...</section>`,

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

                    'Earliest expiration': (value) => {
                        const expDate = value?.[0]?.['subscription_expdate'];
                        return isNullOrEmpty(expDate) ? null : expDate;
                    },

                    'Last update': (value) => isNullOrEmpty(value) ? null : value,

                    'Action': (value,  dataRow) => {
                        const actionId = toInt(dataRow['actionid']);
                        const dataAttributes = `data-networkid=${dataRow['networkid']}`;
                        const label = isNullOrEmpty(value) ? 'No changes' : value;

                        let actionClass = '';

                        switch (actionId) {
                            case 1:
                                actionClass = 'disposition';
                                break;
                            case 2:
                                actionClass = 'mergebuyer';
                                break;
                            case 3:
                                actionClass = 'nochanges';
                                break;
                            case 4:
                                actionClass = 'escalate';
                                break;
                            default:
                                actionClass = 'nochanges';
                                break;
                        }

                        return `<a ${dataAttributes}  href="#" class="custpage_actionbtn dispositionLink ${actionClass}" style="white-space: nowrap;">
                                    <span ${dataAttributes} class="custpage_actionbtn">${label}</span>
                                </a>`;
                    },

                    'CS Team Notes': (value, dataRow) => {
                        return `<section data-sectiontype='cs_team_notes' data-networkid=${dataRow['networkid']}>Loading...</section>`
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
