/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
require(['N/record', 'N/search', 'SuiteScripts/sergei_s_s/custom_modules/utilities/bs_cm_general_utils'],
    /**
 * @param{search} search
 */
    (record, search, { isNullOrEmpty }) => {
        const parsedSalesDataJSON = [{
            "email": "jscarry@brightsign.biz",
            "empkey": 123923,
            "entity": 123923,
            "territoryData": [{"id": 11, "inactive": "F", "name": "BrightSign US New York Sales Territory"}]
        }, {
            "email": "klee@brightsign.biz",
            "empkey": 152662,
            "entity": 152662,
            "territoryData": [{"id": 1, "inactive": "F", "name": "BrightSign US Southwest Sales Territory"}, {
                "id": 10,
                "inactive": "F",
                "name": "Brightsign: Sales Territories Carribean Islands"
            }]
        }, {
            "email": "mdubois@brightsign.biz",
            "empkey": 148248,
            "entity": 148248,
            "territoryData": [{"id": 13, "inactive": "F", "name": "BrightSign US Northwest Territory"}]
        }, {
            "email": "mchalk@brightsign.biz",
            "empkey": 142375,
            "entity": 142375,
            "territoryData": [{"id": 15, "inactive": "F", "name": "BrightSign US Mid-Atlantic & Federal Government"}]
        }, {
            "email": "tchluda@brightsign.biz",
            "empkey": 4201,
            "entity": 4201,
            "territoryData": [{"id": 5, "inactive": "F", "name": "BrightSign US Ohio Valley Territory"}]
        }, {
            "email": "lpennington@brightsign.biz",
            "empkey": 142514,
            "entity": 142514,
            "territoryData": [{"id": 16, "inactive": "F", "name": "BrightSign US TOLA Territory"}]
        }, {
            "email": "wwang@brightsign.biz",
            "empkey": 136526,
            "entity": 136526,
            "territoryData": [{"id": 14, "inactive": "F", "name": "BrightSign Int'l Territory - East Asia and Pacific"}]
        }, {
            "email": "pcorsbiesmith@brightsign.biz",
            "empkey": 192012,
            "entity": 192012,
            "territoryData": [{"id": 20, "inactive": "F", "name": "BrightSign International Territory - UK"}]
        }, {
            "email": "pgillet@brightsign.biz",
            "empkey": 4203,
            "entity": 4203,
            "territoryData": [{"id": 8, "inactive": "F", "name": "BrightSign International Territory - Wordwide"}]
        }, {
            "email": "dmadera@brightsign.biz",
            "empkey": 172503,
            "entity": 172503,
            "territoryData": [{"id": 17, "inactive": "F", "name": "BrightSign US Mid-West Territory"}]
        }];

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            const subscriptionSearch = search.load({
                id: 102824,
                type: search.Type.SUBSCRIPTION
            });


            // sales rep not found - 173387, 158887, 173390, 158887, 173392, 202550 - some fake sales reps and
            subscriptionSearch.run().each(function(result) {
                const customerId = result.getValue('customer');
                const customerRecord = record.load({
                    type: record.Type.CUSTOMER,
                    id: customerId
                });

                const salesRepId = customerRecord.getValue('salesrep');
                if (!isNullOrEmpty(salesRepId)) {
                    const preparedSalesRepId = parseInt(salesRepId);
                    const salesData = parsedSalesDataJSON.find(salesData => salesData.entity === preparedSalesRepId);

                    if (!isNullOrEmpty(salesData)) {
                        log.debug('do something', salesData)
                    }
                }

                return true;
            });
        }

        execute();
        return { execute }
    });
