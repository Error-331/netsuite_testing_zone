/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
require(['N/search', 'N/record', 'N/email', 'N/runtime'],
    /**
     * @param{search} search
     */
    function (search, record, email, runtime) {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            /*const subscriptionSearch = search.load({
                id: 'customsearchtest_ser_sub_1'
            });*/
// nlapiLoadSearch("subscription",80885)
            // https://debugger.na0.netsuite.com/app/help/helpcenter.nl?fid=section_4388721627.html#subsect_156700346962
            const subscriptionSearch = search.create({
                type: search.Type.SUBSCRIPTION,
                filters: [
                    search.createFilter({
                        name: 'status',
                        operator: search.Operator.ANYOF,
                        values: 'ACTIVE'
                    }),

                    search.createFilter({
                        name: 'startdate',
                        operator: search.Operator.BEFORE,
                        values: 'lastmonthtodate'
                    }),
                ],
                columns: [
                    search.createColumn({name: 'startdate'}),
                    search.createColumn({name: 'status'})
                ]
            });


            const searchResults = subscriptionSearch.run().getRange({
                start: 0,
                end: 5,
            });

            log.debug(searchResults);

            for (let searchIndex = 0; searchIndex < searchResults.length; searchIndex++) {
                const searchResult = searchResults[searchIndex];

                const customerId = searchResult.getValue('customer');
                const startDateValue = searchResult.getValue('startdate');

                log.debug(startDateValue);

                const startDate = new Date(startDateValue);
                startDate.setHours(0);
                startDate.setMinutes(0);
                startDate.setSeconds(0);
                startDate.setMilliseconds(0);


                /* var customerRecord = record.load({
                     type: record.Type.CUSTOMER,
                     id: customerId,
                     isDynamic: false,
                 });

                 var me = runtime.getCurrentUser();


                 log.debug('pum')
 //log.debug(customerRecord.getValue('email'))
 //log.debug(customerRecord.getText('email'))
                 log.debug(me.id)



                 var timeStamp = new Date().getUTCMilliseconds();
                 var recipientId = me.id;


                 email.send({
                     author: 143890,
                     recipients: recipientId,
                     subject: 'Test Sample Email Module',
                     body: 'email body',

                     relatedRecords: {
                         entityId: recipientId,

                     }
                 });


                 log.debug('email sent')




 */

            }



            const d = 0;

        }
        execute();
        const c = 0;

        return {
            'execute': execute
        }
    });
