/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define([
        'N/search',
        'N/file',
        'N/format',
        './../../custom_modules/bs_cm_transaction_utils',
        './../../custom_modules/bs_cm_network_utils',
        '../../custom_modules/utilities/bs_cm_general_utils',
        '../../custom_modules/utilities/bs_cm suite_billing_settings_utils',
        './../../custom_modules/bs_cm_csv_utils'
    ],
    /**
            * @param{search} search
            * @param{file} file
            * @param{format} format
            * @param{email} email
            */
    (
        search,
        file,
        format,
        { parseTransactionBSNItemMemo},
        { SUBSCRIPTION_ITEM_TYPE_CLOUD, SUBSCRIPTION_ITEM_TYPE_COM, parseSubscriptionItemIdByName, parsePriceLevelBySubscriptionItem, parseSubscriptionPlanByNetworkType },
        { isNullOrEmpty, filterUniqueValues },
        { initSuiteBillingBSNSettings },
        { revrecGenerateCSV },
    ) => {
        const SEARCH_ID = 102783;

        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const getInputData = (inputContext) => {
            try {
                const transactionSearch = search.load({
                    id: SEARCH_ID,
                });

                return transactionSearch;
            } catch (e) {
                log.debug('Search error');
                log.debug(e)
            }
        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */

        const map = (mapContext) => {
            try {
                const suiteBillingSettings = initSuiteBillingBSNSettings();

                const searchResult = JSON.parse(mapContext.value);

                const customerId = searchResult.values['entity'].value;
                const customerName = searchResult.values['entity'].text;

                const itemId = searchResult.values['item'].value;
                const itemName = searchResult.values['item'].text;
                const subscriptionItemId = parseSubscriptionItemIdByName(itemName);

                const startDate = searchResult.values['startdate'];
                const endDate = searchResult.values['enddate'];

                const contractId = searchResult.values['custbody_contract_name'].value;
                const contractName = searchResult.values['custbody_contract_name'].text;

                const contractStatus = searchResult.values['custrecord_contract_status.CUSTBODY_CONTRACT_NAME'].text;
                const sweFromContract = searchResult.values['custbody_swe_from_contract'];
                const contractRenewalsExclusion = searchResult.values['custrecord_contracts_renewals_exclusion.CUSTBODY_CONTRACT_NAME'] === 'F' ? 'No' : 'Yes';

                const email = searchResult.values['email.customerMain'];//

                const endUserId = searchResult.values['custbody_end_user'].value;
                const endUserName = searchResult.values['custbody_end_user'].text;

                const documentNumber = searchResult.values['tranid'];
                const status = searchResult.values['statusref'].text;

                const quantity = searchResult.values['quantity'];
                const amount = searchResult.values['amount'];

                const memo = searchResult.values['memo'];
                const parsedMemo = parseTransactionBSNItemMemo(memo);

                const networkId = parsedMemo['Network ID'];
                const networkName = parsedMemo['Network'];
                const networkAdminEmail = parsedMemo['Customer Email'];

                const bsnRef = parsedMemo['BSN Ref'];
                const delRef = parsedMemo['Del Ref'];
                const addInvoice = parsedMemo['Add Invoice'];

                const priceLevelId = searchResult.values['pricelevel'].value;
                const priceLevel = searchResult.values['pricelevel'].text;
                const bsnCustomPrice = searchResult.values['custcol_bsn_custom_price'];
                const bsnIsCustomPrice = searchResult.values['custcol_bsn_is_custom_price'] === 'F' ? 'No' : 'Yes';

                let customerPriceLevel = searchResult.values['pricelevel.customerMain'].text;

                if (isNullOrEmpty(customerPriceLevel)) {
                    customerPriceLevel = 'Base Price';
                }

                const priceBook = parsePriceLevelBySubscriptionItem(subscriptionItemId, priceLevel);
                const subscriptionPlan = parseSubscriptionPlanByNetworkType(itemName);

                const renewalDate = searchResult.values['formuladate'];
                const shippingCountry = searchResult.values['formulatext'];

                if (isNullOrEmpty(priceBook)) {
                    log.audit(`priceBook ${priceBook}`);
                    log.audit(`subscriptionItemId ${subscriptionItemId}`);
                    log.audit(`priceLevel ${priceLevel}`);
                }

                let networkType = 2;

                if (subscriptionItemId === suiteBillingSettings.bsnc1yrItemNum) {
                    networkType = 1;
                }

                let isRenewal = 'Yes';
                if (isNullOrEmpty(sweFromContract)) {
                    isRenewal = 'No';
                }

                const key = `${customerId}_${endDate}_${networkId}_${subscriptionItemId}_${endUserId}`;

                let renewalPriceLevel = priceLevel;
                if (bsnCustomPrice !== 'Yes') {
                    if (isNullOrEmpty(customerPriceLevel)) {
                        renewalPriceLevel = 'Base Price';
                    } else {
                        renewalPriceLevel = customerPriceLevel;
                    }
                } else {
                    renewalPriceLevel = priceLevel;
                }

                const renewalPriceBook = parsePriceLevelBySubscriptionItem(subscriptionItemId, renewalPriceLevel);
                log.audit(`${subscriptionItemId} ${renewalPriceLevel} ${renewalPriceBook}`);

                mapContext.write({
                    key: key,
                    value: {

                        'internalId': searchResult.id,
                        'customerId': customerId,
                        'name': customerName,

                        'item': itemName,
                        'subscriptionItemId': subscriptionItemId,

                        startDate,
                        endDate,

                        'contract': contractName,
                        'contractStatus': contractStatus,

                        isRenewal,

                        'contractRenewalsExclusion': contractRenewalsExclusion,
                        email,

                        'endUser': endUserName,
                        'documentNumber': documentNumber,
                        status,

                        memo,

                        quantity,
                        amount,

                        networkId,
                        networkName,
                        networkAdminEmail,

                        bsnRef,
                        delRef,
                        addInvoice,
                        networkType,

                        priceLevel,
                        bsnCustomPrice,
                        bsnIsCustomPrice,
                        customerPriceLevel,

                        priceBook,
                        subscriptionPlan,

                        renewalDate,
                        shippingCountry,

                        renewalPriceLevel,
                        renewalPriceBook,
                    }
                });
            } catch (e) {
                log.debug('Map error');
                log.debug(e);
            }
        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reduceContext) => {
            let firstParsedValue = null;

            try {
                const reduceValues = reduceContext.values;
                firstParsedValue = JSON.parse(reduceValues[0]);

                firstParsedValue['memo'] = firstParsedValue['memo'].replace(/(\n\n)|(\n)|(\t)/g, ' ');

                let bsnRefs = [];
                let delRefs = [];
                let addInvoices = [];

                let totalQuantity = 0;
                let rowsMergedCount = 0;

                for (const reduceValue of reduceValues) {
                    const parsedReduceValue = JSON.parse(reduceValue);

                    if (!isNullOrEmpty(parsedReduceValue['bsnRef'])) {
                        bsnRefs.push(parsedReduceValue['bsnRef']);
                    }

                    if (!isNullOrEmpty(parsedReduceValue['delRef'])) {
                        delRefs.push(parsedReduceValue['delRef']);
                    }

                    if (!isNullOrEmpty(parsedReduceValue['addInvoice'])) {
                        addInvoices.push(parsedReduceValue['addInvoice']);
                    }

                    if (!isNullOrEmpty(parsedReduceValue['quantity'])) {
                        totalQuantity += parseInt(parsedReduceValue['quantity']);
                    }

                    rowsMergedCount += 1;
                }

                firstParsedValue.bsnRef = filterUniqueValues(bsnRefs.concat(delRefs).concat(addInvoices)).join(';');

                firstParsedValue['quantity'] = totalQuantity;
                firstParsedValue['rowsMergedCount'] = rowsMergedCount;

                const formattedValues = {
                    'Internal ID': firstParsedValue['internalId'],
                    'Customer ID': firstParsedValue['customerId'],
                    'Name': firstParsedValue['name'],
                    'Item': firstParsedValue['item'],
                    'Start Date': firstParsedValue['startDate'],
                    'End Date': firstParsedValue['endDate'],
                    'Contract': firstParsedValue['contract'],
                    'Contract Status': firstParsedValue['contractStatus'],
                    'Is Renewal': firstParsedValue['isRenewal'],
                    'Contract Renewals Exclusion': firstParsedValue['contractRenewalsExclusion'],
                    'Email': firstParsedValue['email'],
                    'End User': firstParsedValue['endUser'],
                    'Document Number': firstParsedValue['documentNumber'],
                    'Status': firstParsedValue['status'],
                    'Memo': firstParsedValue['memo'],
                    'Quantity': firstParsedValue['quantity'],
                    'Amount': firstParsedValue['amount'],
                    'Network ID': firstParsedValue['networkId'],
                    'Network Name': firstParsedValue['networkName'],
                    'Network Admin': firstParsedValue['networkAdminEmail'],
                    'BSN Ref': firstParsedValue['bsnRef'],
                    'Del Ref': delRefs,
                    'Add Invoice': addInvoices,
                    'Network Type': firstParsedValue['networkType'],
                    'Price Level': firstParsedValue['priceLevel'],
                    'BSN Custom Price': firstParsedValue['bsnCustomPrice'],
                    'BSN Is Custom Price': firstParsedValue['bsnIsCustomPrice'],
                    'Customer Price Level': firstParsedValue['customerPriceLevel'],
                    'Price Book': firstParsedValue['priceBook'],
                    'Subscription Plan': firstParsedValue['subscriptionPlan'],
                    'Renewal Date': firstParsedValue['renewalDate'],
                    'Shipping Country': firstParsedValue['shippingCountry'],
                    'Renewal Price Level': firstParsedValue['renewalPriceLevel'],
                    'Renewal Price Book': firstParsedValue['renewalPriceBook'],
                    'Rows Merged Count': firstParsedValue['rowsMergedCount'],
                };

                reduceContext.write({
                    key: reduceContext.key,
                    value: formattedValues
                });
            } catch (e) {
                log.debug('Reduce error');
                log.debug(e);
            }
        }

        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {
            try {
                let csvArray = [];

                summaryContext.output.iterator().each((key, value) => {
                    const parsedValue = JSON.parse(value);
                    csvArray.push(parsedValue);

                    return true;
                });

                revrecGenerateCSV(csvArray, null, {
                    columnDelimiter: '\t',
                    folder: 2845824,
                    filenamePrefix: `contract_${SEARCH_ID}`,
                    fileExtension: `csv`
                });
            } catch (e) {
                log.debug('Summary error');
                log.debug(e);
            }
        }

        return { getInputData, map, reduce, summarize }
    });
