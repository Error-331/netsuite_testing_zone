/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/query', 'N/file', './../custom_modules/bs_cm_csv_utils'],
    /**
 * @param{query} query
 */
    (query, file,{ convertArrayOfObjectsToCSV }) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            const suiteQLQuery = `
              SELECT
                Subscription.id AS subscriptionId,
                Subscription.customer AS subscriptionCustomer,
                
                Subscription.startdate,
                Subscription.enddate,
                Subscription.nextrenewalstartdate,
                Subscription.custrecord_bsnc_sales_rep,
                Subscription.billingsubscriptionstatus,
                
                SubscriptionCustomer.id AS сustomer_subscriptionCustomerId,
                
                CustomerBillingAccount.id AS billingAccount_billingAccountId,
                CustomerBillingAccount.customer AS billingAccount_billingAccountCustomer,

                CustomerAddress.Addr1 As сustomer_Addr1,
                CustomerAddress.Addr2 As сustomer_Addr2,
                CustomerAddress.Addr3 As сustomer_Addr3,
                CustomerAddress.City As сustomer_City,
                CustomerAddress.State As сustomer_State,
                CustomerAddress.Zip As сustomer_Zip,
                CustomerAddress.Country As сustomer_Country,

                CustomerBillingAccount.Addr1 As billingAccount_Addr1,
                CustomerBillingAccount.Addr2 As billingAccount_Addr2,
                CustomerBillingAccount.Addr3 As billingAccount_Addr3,
                CustomerBillingAccount.City As billingAccount_City,
                CustomerBillingAccount.State As billingAccount_State,
                CustomerBillingAccount.Zip As billingAccount_Zip,
                CustomerBillingAccount.Country As billingAccount_Country
              FROM
                Subscription
              LEFT OUTER JOIN
                Customer AS SubscriptionCustomer
              ON
                (SubscriptionCustomer.id = Subscription.customer)
                 
              LEFT OUTER JOIN
              (
                SELECT
                    *
                FROM
                    BillingAccount
                AS 
                    CustomerBillingAccount
                INNER JOIN
                    EntityAddressbook AS SubscriptionCustomerBillingAccountJoin
                ON
                    (SubscriptionCustomerBillingAccountJoin.internalid = CustomerBillingAccount.billaddresslist)
                INNER JOIN
                    EntityAddress AS BillingAccountAddress
                ON
                    (BillingAccountAddress.nkey = SubscriptionCustomerBillingAccountJoin.AddressBookAddress)
                AND
                    (
                        BillingAccountAddress.Addr1 IS NOT NULL OR
                        BillingAccountAddress.Addr2 IS NOT NULL OR
                        BillingAccountAddress.Addr3 IS NOT NULL OR
                        BillingAccountAddress.City IS NOT NULL OR
                        BillingAccountAddress.State IS NOT NULL OR
                        BillingAccountAddress.Zip IS NOT NULL OR
                        BillingAccountAddress.Country IS NOT NULL
                    )    
              )
              AS
                CustomerBillingAccount
              ON
                (CustomerBillingAccount.customer = SubscriptionCustomer.id)
              LEFT OUTER JOIN
                EntityAddressbook AS SubscriptionCustomerAddressBookJoin
              ON
                (SubscriptionCustomerAddressBookJoin.Entity = SubscriptionCustomer.id)
              AND
                (SubscriptionCustomerAddressBookJoin.defaultbilling = 'T')

              LEFT OUTER JOIN
                EntityAddress AS CustomerAddress
              ON
                (CustomerAddress.nkey = SubscriptionCustomerAddressBookJoin.AddressBookAddress)

              WHERE 
                (
                    Subscription.startdate < CURRENT_DATE 
                    AND
                    Subscription.enddate >= CURRENT_DATE 
                    AND
                    Subscription.enddate < CURRENT_DATE + 7
                ) 
                OR
                (
                    Subscription.startdate > CURRENT_DATE 
                    AND
                    Subscription.billingsubscriptionstatus = 'PENDING_ACTIVATION' 
                    AND
                    (Subscription.nextrenewalstartdate - Subscription.enddate) <= 7
                )

              AND
                
              ROWNUM <= 50
            `;

            const resultSet = query.runSuiteQL(
                {
                    query: suiteQLQuery,
                }
            );

            const csv = convertArrayOfObjectsToCSV({
                data: resultSet.asMappedResults()
            });

            if (csv === null) {
                return
            }

            const fileObj = file.create({
                name: 'test.csv',
                fileType: file.Type.CSV,
                contents: csv
            });

            scriptContext.response.writeFile(fileObj, false);
        }

        return {onRequest}

    });
