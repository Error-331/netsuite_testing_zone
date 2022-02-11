/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
require(['N/search', 'N/format', 'N/file'],
    /**
     * @param{search} search
     */
    (search, format, file) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
           /* const savedSearch1 = search.load({
                id: 'customsearch80888'
            })

            log.debug('test');
            log.debug(savedSearch1.columns)



            let resultsCount = 0;

            savedSearch1.run().each(function(result) {
                resultsCount += 1;
                return true;
            });

            log.debug(`count: ${resultsCount}`); // count: 143

            */

//return;
            const convertArrayOfObjectsToCSV = (args) => {
                let result, ctr, keys, columnDelimiter, lineDelimiter, data;

                data = args.data || null;
                if (data === null || !data.length) {
                    return null;
                }

                columnDelimiter = args.columnDelimiter || '\t';
                lineDelimiter = args.lineDelimiter || '\n';

                keys = Object.keys(data[0]);

                result = '';
                result += keys.join(columnDelimiter);
                result += lineDelimiter;

                data.forEach(function(item) {
                    ctr = 0;
                    keys.forEach(function(key) {
                        if (ctr > 0) result += columnDelimiter;

                        result += item[key];
                        ctr++;
                    });
                    result += lineDelimiter;
                });

                return result;
            }

            const revrecGenerateCSV = ( objArray, filename ) => {
                const csv = convertArrayOfObjectsToCSV({
                    data: objArray
                });

                if (csv === null) {
                    return
                }

                const today = format.format( { value: new Date(), type: format.Type.DATETIME } );
                const fileObj = file.create({
                    name: filename || `generic_csv_file_${today}.tsv` ,
                    fileType: file.Type.CSV,
                    contents: csv
                });

                fileObj.folder = 2681900;
                const id = fileObj.save();

                return id;
            }

            const transactionSearch = search.create({
                type: search.Type.TRANSACTION,
                filters: [
                    search.createFilter({
                        name: 'status',
                        operator: search.Operator.ANYOF,
                        values: ["SalesOrd:G","SalesOrd:D","SalesOrd:A","SalesOrd:F","SalesOrd:E","SalesOrd:B"],
                    }),

                    search.createFilter({
                        name: 'item',
                        operator: search.Operator.ANYOF,
                        values: ["547","621","598","599","771","595"],
                    }),

                    search.createFilter({
                        name: 'custbody_contract_name',
                        operator: search.Operator.NONEOF,
                        values: ['@NONE@'],
                    }),

                    search.createFilter({
                        name: 'mainline',
                        operator: search.Operator.IS,
                        values: ['F'],
                    }),

                    search.createFilter({
                        name: 'enddate',
                        operator: search.Operator.WITHIN,
                        values: ['thismonth'],
                    }),

                ],

                columns: [
                    search.createColumn({name: 'tranid', label: 'Transaction id'}),

                    search.createColumn({name: 'entity', label: 'Customer'}),
                    search.createColumn({name: 'custbody_end_user', label: 'End User'}),
                    search.createColumn({name: 'subsidiary', label: 'Subsidiary'}),

                    search.createColumn({name: 'trandate', label: 'Date'}),
                    search.createColumn({name: 'startdate', label: 'Start Date'}),
                    search.createColumn({name: 'enddate', label: 'End Date'}),

                    search.createColumn({name: 'status', label: 'Transaction status'}),
                    search.createColumn({name: 'custbody_renewal_terms', label: 'Transaction renewal term'}),

                    search.createColumn({name: 'custbody_contract_name', label: 'Contract id'}),
                    search.createColumn({name: 'memo', label: 'Memo'}),
                    search.createColumn({name: 'item', label: 'Item'}),
                    search.createColumn({name: 'pricelevel', label: 'Price Level'}),

                    search.createColumn({name: 'entity', label: 'Customer id'}),

                    search.createColumn({name: 'amount', label: 'Amount'}),
                    search.createColumn({name: 'quantity', label: 'Quantity'}),
                ]
            });

            const parseTransactionMemo = (memo) => {
                return memo
                    .trim()
                    .split(/\r\n|\n|\r/)
                    .reduce((result, memoLine) => {
                        const [key, value] = memoLine
                            .trim()
                            .split(':')
                            .map(value => value.trim());

                        result[key] = value;

                        if (key === 'Del Ref') {
                            result[key] = value.trim().split(',').map(subValue => subValue.trim());
                        } else {
                            result[key] = value;
                        }

                        return result;
                    }, {});
            }

            const parseNetworkTypeName = (networkType) => {
                switch (networkType) {
                    case 'BSNEE - Annual Fee':
                    case 'BSNEE - Annual Fee (contract)':
                        return 'bsnee';
                    case 'BSNSUB-01-R':
                    case 'BSNSUB-03-R':
                    case 'BSNSUB-12-R':
                        return 'com';
                    case 'BSNSUB-12-CL':
                        return 'cloud';

                }
            };

            const parsePriceLevelByNetworkType = (networkType, priceLevel) => {
                switch(networkType) {
                    case 'cloud': {
                        switch (priceLevel) {
                            case 'Custom':
                                return 16;
                            case 'Tier 1: 25% off MSRP':
                                return 10;
                            case 'Tier 2: 30% off MSRP':
                                return 11;
                            case 'Tier 3: 35% off MSRP':
                                return 12;
                            case 'Tier 4: 40% off MSRP':
                                return 13;
                            case 'Tier 5: 45% off MSRP':
                                return 14;
                            case 'Support':
                                return 15;
                            default:
                                return 9;
                        }
                    }

                    case 'com': {
                        switch (priceLevel) {
                            case 'Custom':
                                return 8;
                            case 'Tier 1: 25% off MSRP':
                                return 2;
                            case 'Tier 2: 30% off MSRP':
                                return 3;
                            case 'Tier 3: 35% off MSRP':
                                return 4;
                            case 'Tier 4: 40% off MSRP':
                                return 5;
                            case 'Tier 5: 45% off MSRP':
                                return 6;
                            case 'Support':
                                 return 7;
                            default:
                                return 1;
                        }
                    }

                    case 'bsnee': {
                        switch (priceLevel) {
                            case 'MSRP':
                                return 24;
                            case 'Tier 1: 25% off MSRP':
                                return 25;
                            case 'Tier 2: 30% off MSRP':
                                return 26;
                            case 'Tier 3: 35% off MSRP':
                                return 27;
                            case 'Tier 4: 40% off MSRP':
                                return 28;
                            case 'Tier 5: 45% off MSRP':
                                return 29;
                            default:
                                return 30;
                        }
                    }
                }
            };

            const csvObjectsArray = [];

            transactionSearch.run().each(function(result) {
                const customerId = result.getValue('entity');
                const customerName = result.getText('entity');

                const endUserId = result.getValue('custbody_end_user');
                const endUserName = result.getText('custbody_end_user');

                const contractId = result.getValue('custbody_contract_name');
                const contractName = result.getText('custbody_contract_name');

                const subsidiaryId = result.getValue('subsidiary');
                const subsidiaryName = result.getText('subsidiary');

                const startDate = result.getValue('startdate');
                const endDate = result.getValue('enddate');

                const networkTypeId = result.getValue('item');
                const networkTypeName = result.getText('item');

                const memo = result.getValue('memo');
                const parsedMemo = parseTransactionMemo(memo);

                const networkId = parsedMemo['Network ID'];
                const networkName = parsedMemo['Network'];
                const networkAdminEmail = parsedMemo['Customer Email'];

                const bsnRef = parsedMemo['BSN Ref'];
                const delRef = parsedMemo['Del Ref'];

                const priceLevel = result.getText('pricelevel');
                log.debug(`bzduh ${result.getText('quantity')} - ${result.getValue('quantity')}`)

                const parsedNetworkTypeName = parseNetworkTypeName(networkTypeName);
                const parsedPriceLevel = parsePriceLevelByNetworkType(parsedNetworkTypeName, priceLevel);

                const csvObject = {
                    'Internal Id': null,

                    'Customer ID': customerId,
                    'Customer': customerName,

                    'End User ID': endUserId,
                    'End User': endUserName,

                    'Contract ID': contractId,
                    'Contract': contractName,

                    'Subsidiary Id': subsidiaryId,
                    'Subsidiary': subsidiaryName,

                    'Network Type ID': networkTypeId,
                    'Network Type': networkTypeName,

                    'Network ID': networkId,
                    'Network Name': networkName,
                    'Network Admin Email': networkAdminEmail,

                    bsnRef,
                    delRef,

                    'Start Date': startDate,
                    'End Date': endDate,

                    'Price Book': parsedPriceLevel,
                };

                csvObjectsArray.push(csvObject)
                return true;
            });

            revrecGenerateCSV(csvObjectsArray, 'test_task_cur.tsv');
        }

        execute();
        return { execute }
    });
