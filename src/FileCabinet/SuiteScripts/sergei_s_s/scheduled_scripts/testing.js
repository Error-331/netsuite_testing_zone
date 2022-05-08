/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
require([
        'N/query',
        'N/record',
        'N/search',
        'SuiteScripts/sergei_s_s/custom_modules/utilities/bs_cm_general_utils',
        'SuiteScripts/sergei_s_s/custom_modules/utilities/bs_cm_runtime_utils',
    ],
    /**
 * @param{search} search
 */
    (
        query, record, search,
        { isNullOrEmpty, isArray },
        { getCurrentEmployeeId }
    ) => {


        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {

            const columnsData = {
                id: 'subscriptionId',

                groupPrefixDelimiter: '_',
                groupIds: ['subscriptionCustomerId', 'billingAccountId'],
                groupPrefixes: ['сustomer', 'billingAccount' ]
            }



            let suiteQLQuery = `
              SELECT
                Subscription.id AS subscriptionId,
                Subscription.customer AS subscriptionCustomer,
                
                Subscription.startdate,
                Subscription.enddate,
                Subscription.nextrenewalstartdate,
                Subscription.billingsubscriptionstatus,
                
                Subscription.custrecord_sub_network_admin,
                Subscription.custrecord_sub_network_name,
                
                SubscriptionCustomer.id AS customer_subscriptionCustomerId,         
                
                CustomerBillingAccount.id AS billingAccount_billingAccountId,
                CustomerBillingAccount.customer AS billingAccount_billingAccountCustomer,
                
                CustomerSalesRep.entityid AS customer_salesrep, 

                CustomerAddress.Addr1 As customer_Addr1,
                CustomerAddress.Addr2 As customer_Addr2,
                CustomerAddress.Addr3 As customer_Addr3,
                CustomerAddress.City As customer_City,
                CustomerAddress.State As customer_State,
                CustomerAddress.Zip As customer_Zip,
                CustomerAddress.Country As customer_Country,

                CustomerBillingAccount.Addr1 As billingAccount_Addr1,
                CustomerBillingAccount.Addr2 As billingAccount_Addr2,
                CustomerBillingAccount.Addr3 As billingAccount_Addr3,
                CustomerBillingAccount.City As billingAccount_City,
                CustomerBillingAccount.State As billingAccount_State,
                CustomerBillingAccount.Zip As billingAccount_Zip,
                CustomerBillingAccount.Country As billingAccount_Country,
              CASE 
                WHEN Subscription.startdate <= CURRENT_DATE THEN 'F'
                WHEN Subscription.startdate > CURRENT_DATE THEN 'T'
                END AS startdate_infuture
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
                
              LEFT OUTER JOIN
                employee AS CustomerSalesRep
              ON
                (CustomerSalesRep.id = SubscriptionCustomer.salesrep)

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
            `;

           /* suiteQLQuery = `
                SELECT
                billingsubscriptionstatus,
                startdate,
                enddate,
                nextrenewalstartdate
                FROM Subscription WHERE
                (startdate < CURRENT_DATE AND
                enddate >= CURRENT_DATE AND
                enddate < CURRENT_DATE + 7)
                OR
                (
                startdate > CURRENT_DATE AND
                billingsubscriptionstatus = 'PENDING_ACTIVATION' AND
                (nextrenewalstartdate - enddate) <= 7
                )

            `;*/
            //   AND ROWNUM <= 50 // 143898

            // 142375
            // 123923

            suiteQLQuery = `
                SELECT 
                    SalesRep.id AS SalesRepId, 
                    SalesRep.entityid AS SalesRepName, 
                    SalesRepSupervisor.id AS SalesRepSupervisorId,
                    SalesRepSupervisor.entityid AS SalesRepSupervisorName
                FROM 
                    Employee as SalesRep
                INNER JOIN
                    Employee AS SalesRepSupervisor
                ON
                    (SalesRep.supervisor = SalesRepSupervisor.id)
                AND
                    (SalesRepSupervisor.issalesrep = 'T')
                AND
                    (SalesRepSupervisor.isinactive = 'F')
                WHERE 
                    SalesRep.issalesrep = 'T' 
                AND 
                    SalesRep.isinactive = 'F'

                
            `

           // getCurrentEmployeeId();
           // return;

            const resultSet = query.runSuiteQL(
                {
                    query: suiteQLQuery,
                }
            );

            log.debug('charge', resultSet.asMappedResults());

/*
            const c = search.load({
                type: 'charge',
                id: 'customsearch_sb_renewal_charge_uni'
            });

            log.debug('filters', JSON.stringify(c.filters))*/

            /*

            filters: [{"name":"formulanumeric","operator":"equalto","values":["1"],"formula":"CASE WHEN {priceplan.startdate}={subscription.startdate} THEN 1 ELSE 0 END ","isor":false,"isnot":false,"leftparens":0,"rightparens":0},{"name":"custrecord_bs_is_import","join":"subscription","operator":"is","values":["T"],"isor":true,"isnot":false,"leftparens":1,"rightparens":0},{"name":"parentsubscriptionid","join":"subscription","operator":"isnotempty","values":[],"isor":false,"isnot":false,"leftparens":0,"rightparens":1}]
             */

          /*  const subscriptionSearch = search.load({
                id: 102824,
                type: search.Type.SUBSCRIPTION
            });*/



            // sales rep not found - 173387, 158887, 173390, 158887, 173392, 202550 - some fake sales reps and
            /*subscriptionSearch.run().each(function(result) {
                const customerId = result.getValue('customer');
                const networkId = result.getValue('custrecord_sub_network_id');
                const networkName = result.getValue('custrecord_sub_network_name');

                const customerRecord = loadCustomerById(customerId, true);
                const filteredDataCustomer = filterRecordData(customerRecord, {
                        address: filterCustomerDefaultBillingAddress,
                        salesRep: filterCustomerSalesRep,
                    },
                );

                if (isNullOrEmpty(filteredDataCustomer.address) || isNullOrEmpty(filteredDataCustomer.salesRep)) {
                    log.debug('Cannot process', result.id);
                    return true;
                }

                const salesTerritory = findSalesRepTerritoryBySalesRepId(filteredDataCustomer.salesRep, filteredDataCustomer.address);
                return true;
            });*/
        }

        execute();
        return { execute }
    });
