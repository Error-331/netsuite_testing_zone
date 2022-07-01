/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
        'N/ui/serverWidget',
        './../../custom_modules/utilities/bs_cm_general_utils',
        './../../custom_modules/utilities/ui/bs_cm_ui_form_sublist',
        './../../custom_modules/utilities/ui/bs_cm_ui_form',
        './../../custom_modules/utilities/bs_cm_runtime_utils',
        './../../custom_modules/utilities/specific/bs_cm_daily_subscription_expiry_report_utils',
        './../../custom_modules/aggregations/custom/bs_cm_exp_network_disposition',
        './../../custom_modules/aggregations/custom/bs_cm_disposition_action_list',
    ],
    /**
 * @param{serverWidget} serverWidget
 */
    (
        serverWidget,
        { isNullOrEmpty, isString, toInt },
        { addFormSublist },
        { addFormSelectBox,createPagination },
        { getCurrentUserInfo, getScriptURLPathQuery },
        { formatDateForReport, prepareNoteHeader },
        { upsertDisposition, loadExpiredNetworksWithDispositionData, countExpiredNetworks },
        { loadDispositionActionForSelect },
        ) => {
        const FIELDS_TO_IGNORE = ['networkid', 'employeename', 'dispositionid', 'actionid'];
        const SUBLIST_ID = 'networkslist';

        function createNetworksSublist(currentForm, networksList = [], totalElements) {
            const urlToNetworkManagement = getScriptURLPathQuery('customscript_sb_bsnc_create_network', 'customdeploy_sb_bsnc_create_network');

            return addFormSublist({
                id: SUBLIST_ID,
                title: 'Networks about to expire',
                label: 'networks',
                total: totalElements,
                showTotal: true,
                showLineNumber: true,
                fieldNames: Object.keys(networksList[0]),
                fieldTypes: [
                    serverWidget.FieldType.TEXT,
                    serverWidget.FieldType.TEXT,
                    serverWidget.FieldType.TEXT,
                    serverWidget.FieldType.DATE,
                    serverWidget.FieldType.DATE,
                    serverWidget.FieldType.DATE,
                    serverWidget.FieldType.INTEGER,
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

                    (value) => {
                        if (isNullOrEmpty(value)) {
                            return null;
                        }

                        let renewalDate = value.split(',')[0];
                        renewalDate = isNullOrEmpty(renewalDate) ? null : formatDateForReport(renewalDate);

                        return [
                            {
                                style: `
                                    --renewaldate: '${renewalDate}';
                                    position: relative;
                                `
                            },
                            {
                                className: ':after',
                                style: `
                                    content: var(--renewaldate);
                                
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
                        if (isNullOrEmpty(value)) {
                            return null;
                        }

                        let expDate = value.split(',')[0];
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
                        let lastUpdateDate = isNullOrEmpty(value) ? '' : formatDateForReport(value);

                        return [
                            {
                                style: `
                                    --lastupdatedate: '${lastUpdateDate}';
                                    position: relative;
                                `
                            },
                            {
                                className: ':after',
                                style: `
                                    content: var(--lastupdatedate);
                                
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

                    (value, dataRow) => {
                        const actionId = isNullOrEmpty(dataRow['actionid']) ? 0 : toInt(dataRow['actionid']);
                        const label = isNullOrEmpty(value) ? 'Disposition' : value;

                        let bgImage = '';
                        let textColor = 'black';

                        switch (actionId) {
                            case 1:
                                bgImage = 'linear-gradient(to right bottom, #ffffff, #e6e6e6 3%, #b3b3b3)';
                                break;
                            case 2:
                                bgImage = 'linear-gradient(to right bottom, #ffff1a, #e6e600 3%, #b3b300)';
                                break;
                            case 3:
                                bgImage = 'linear-gradient(to right bottom, #1aff1a, #00e600 3%, #00b300)';
                                textColor = 'white';
                                break;
                            case 4:
                                bgImage = 'linear-gradient(to right bottom, #ff1a1a, #e60000 3%, #b30000)';
                                textColor = 'white';
                                break;
                            default:
                                bgImage = 'linear-gradient(to right bottom, #ffffff, #e6e6e6 3%, #b3b3b3)';
                                break;
                        }

                        return [
                            {
                                style: `
                                        --label: '${label}';
                                        --bgImage: ${bgImage};
                                        --textColor: ${textColor};
                                        --action: ${actionId};
                                        --network: ${dataRow['networkid']};
                                      
                                        position: relative;
                                `
                            },
                            {
                                className: ':before',
                                style: `
                                        content: '';
                                        box-sizing: border-box;
                                
                                        width: 100%;
                                        height: 100%;

                                        display: block;
                                        position: absolute;
                                  
                                        top: 0px;
                                        left: 0px;

                                        padding: 0px 5px 0px 5px;
                                        border-radius: 3px;
                                
                                        text-decoration: none;
                                        box-shadow: rgba(0, 0, 0, 0.3) 0 0.1em 0.1em;
                                        
                                        cursor: pointer;
                                    
                                        background-color: inherit;
                                        background-image: var(--bgImage);     
                                    `
                            },

                            {
                                className: ':after',
                                style: `
                                        content: var(--label);

                                        display: block;
                                        position: absolute;
                                        
                                        width: 100%;
                                  
                                        top: calc(50% - 6px);
                                        left: 0px;

                                        font-size: 12px;
                                        font-weight: bold;
                                
                                        text-shadow: rgba(0, 0, 0, 0.5) 0 -0.08em 0;
                                        text-align: center;
                                        text-decoration: none;
                                        white-space: nowrap;
                                        
                                        cursor: pointer;
                                        
                                        color: var(--textColor);
                                    `
                            },
                        ]
                    },

                    [
                        {
                          style: `
                                padding-left: 10px !important;
                            `
                        },
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
                    'Network name': (value) => {
                        if (isNullOrEmpty(value)) {
                            return null;
                        }

                        const networkName = value.split(',')[0];
                        return `<a target="_blank" href="${urlToNetworkManagement}&bsn_email=${networkName}">${networkName}</a>`
                    },
                    'Subscription records': (value, dataRow) => `<section data-sectiontype='subcription_records' data-networkid=${dataRow['networkid']}>Loading...</section>`,

                    'Subscription Record Expire Date': (value) => {
                        if (isNullOrEmpty(value)) {
                            return null;
                        }

                        let strRows = ''
                        for (const expDate of value.split(',')) {
                            strRows += `${formatDateForReport(expDate)}<br/>`
                        }

                        return strRows;
                    },

                    'Renewal Email Date': (value) => {
                        if (isNullOrEmpty(value)) {
                            return null;
                        }

                        const renewalDate = value.split(',')[0];
                        return isNullOrEmpty(renewalDate) ? null : renewalDate;
                    },

                    'Earliest expiration': (value) => {
                        if (isNullOrEmpty(value)) {
                            return null;
                        }

                        const expDate = value.split(',')[0];
                        return isNullOrEmpty(expDate) ? null : expDate;
                    },

                    'Last update': (value) => isNullOrEmpty(value) ? null : value,

                    'Action': (value,  dataRow) => {
                        const actionId = isNullOrEmpty(dataRow['actionid']) ? 0 : toInt(dataRow['actionid']);
                        return actionId;
                    },

                    'CS Team Notes': (value, dataRow) => {
                        return `<section data-sectiontype='cs_team_notes' data-networkid=${dataRow['networkid']}>Loading...</section>`;
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

        function writePage(response, page = 0, pageSize = 100, disposition = 0) {
            const currentForm = createForm();
            currentForm.clientScriptModulePath = './../../client_scripts/subscriptions/bs_cl_daily_subscription_expiry_report';

            page = isString(page) ? toInt(page) : page;
            pageSize = isString(pageSize) ? toInt(pageSize) : pageSize;
            disposition = isString(disposition) ? toInt(disposition) : disposition;

            const networksList = loadExpiredNetworksWithDispositionData(page, pageSize, disposition);
            const totalElements = countExpiredNetworks(disposition);

           // response.write(JSON.stringify(networksList.length));
           // return

            createPagination({
                page,
                pageSize,
                totalElements,
            }, currentForm);

            addFormSelectBox({
                    id: 'dispositionselect',
                    label: 'Filter by disposition',
                    disabled: false,
                    defaultValue: disposition,
                },
                [
                    { id: 0, name: 'All' }
                ]
                    .concat(loadDispositionActionForSelect())
                    .map(dataRow => ({ value: dataRow.id, text: dataRow.name })),
                currentForm
            );

            currentForm.addButton({
                id: 'custpage_filterbutton',
                label : 'Filter',
                functionName: 'filterByDisposition'
            });

            if (isNullOrEmpty(networksList)) {
                response.writePage(currentForm);
                return;
            }

            createNetworksSublist(currentForm, networksList, totalElements);
            response.writePage(currentForm);
        }

        function render(scriptContext) {
            const { request, response } = scriptContext;

            const {
                custpage_networkid,
                custpage_action,
                custpage_note,

                page,
                pagesize,
                disposition,
            } = request.parameters;

            if (request.method === 'GET') {
                writePage(response, page, pagesize, disposition);
            } else if (request.method === 'POST') {
                response.write(JSON.stringify({
                    custpage_networkid,
                    custpage_action,
                    custpage_note,
                }));

                const { id, name } = getCurrentUserInfo();

                upsertDisposition(toInt(custpage_networkid), toInt(custpage_action), id, name, custpage_note)
                writePage(response, page, pagesize, disposition);
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
