/**
 * @NApiVersion 2.1
 */
define([
    'N/query',
    './../../utilities/sql/bs_cm_join_operations',
    './../../utilities/bs_cm_general_utils',
    ],
    /**
 * @param{query} query
 */
    (
        query,
        { groupSQLJoinedDataNotSorted },
        { isNullOrEmpty }
    ) => {

        function loadExpSubsForSalesReps(salesRepId, periodDays = 7) {
            let suiteQLQuery = `
              SELECT DISTINCT
                Subscription.id AS subscriptionId,
                Subscription.customer AS subscriptionCustomer,
                
                Subscription.startdate,
                Subscription.enddate,
                Subscription.nextrenewalstartdate,
                Subscription.billingsubscriptionstatus,
                
                Subscription.custrecord_sub_network_admin,
                Subscription.custrecord_sub_network_name,
                Subscription.custrecord_sub_network_id,
                Subscription.custrecord_bsn_type,
                
                SubscriptionCustomer.id AS customer_subscriptionCustomerId,    
                SubscriptionCustomer.entitytitle AS customer_name,     
                
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
                END AS startdate_infuture,
                
              CASE
                WHEN Subscription.startdate < CURRENT_DATE THEN Subscription.enddate
                WHEN Subscription.startdate >= CURRENT_DATE THEN Subscription.startdate - 1
                END AS expdate,
                
              CASE
                WHEN Subscription.startdate < CURRENT_DATE THEN CEIL((Subscription.enddate - CURRENT_DATE))
                WHEN Subscription.startdate >= CURRENT_DATE THEN CEIL(((Subscription.startdate - 1) - CURRENT_DATE))
              END AS daystillexpdate
              
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
                        (
                        Subscription.startdate < CURRENT_DATE 
                        AND
                        Subscription.enddate >= CURRENT_DATE 
                        AND
                        Subscription.billingsubscriptionstatus != 'TERMINATED'
                        AND
                        Subscription.enddate < (CURRENT_DATE + ${periodDays})
                        ) 
                    OR
                        (
                        Subscription.startdate >= CURRENT_DATE 
                        AND
                        Subscription.billingsubscriptionstatus = 'PENDING_ACTIVATION' 
                        AND
                        Subscription.startdate < (CURRENT_DATE + ${periodDays})
                        )
                )
              AND
                CustomerSalesRep.entityid ${salesRepId !== '-1' ? 'IS NOT NULL' : 'IS NULL'}
              AND
                Subscription.custrecord_sub_network_name IS NOT NULL
            `;

            if (!isNullOrEmpty(salesRepId) && salesRepId !== '-1') {
                suiteQLQuery = `${suiteQLQuery} AND CustomerSalesRep.id=${salesRepId} ORDER BY expdate ASC`;
            } else {
                suiteQLQuery = `${suiteQLQuery} ORDER BY expdate ASC`;
            }

            const resultSet = query.runSuiteQL(
                {
                    query: suiteQLQuery,
                }
            );

            const mappedResults = resultSet.asMappedResults();

            if (isNullOrEmpty(mappedResults)) {
                return null;
            }

            const groupsData = {
                id: 'custrecord_sub_network_name',

                groupPrefixDelimiter: '_',
                groupIds: ['subscriptionCustomerId', 'billingAccountId'],
                groupPrefixes: ['customer', 'billingAccount'],
            };

            const groupedData = groupSQLJoinedDataNotSorted(mappedResults, groupsData);
            const dataSlice = new Array(Object.keys(groupedData).length);

            for (const id in groupedData) {
                const data = groupedData[id];
                const orderId = groupedData[id].orderId;

                dataSlice[orderId] = {
                    'Network': data.custrecord_sub_network_name,
                    'Network admin': data.custrecord_sub_network_admin,
                    'Start date': data.startdate,
                    'End date': data.enddate,
                    'Expiration date': data.expdate,
                    'Days till expiration': data.daystillexpdate,
                    'Customers': data.groupedData.customer,
                    'Sales rep': data.groupedData.customer[0].customer_salesrep,
                    'network_type': data.custrecord_bsn_type,
                    'network_id': data.custrecord_sub_network_id,
                    'startdate_infuture': data.startdate_infuture,
                };
            }

            return dataSlice;
        }

        function loadExpSubsWithGroupedCustomers(salesRepId, periodDays = 7) {
            let suiteQLQuery = `
               SELECT 
                SubscriptionCustomer.id AS customer_id,
                SubscriptionCustomer.entitytitle AS customer_name,
               
                Subscription.id AS subscription_subscriptionId,
                Subscription.customer AS subscription_subscriptionCustomer,
                
                Subscription.startdate AS subscription_startdate,
                Subscription.enddate AS subscription_enddate,
                Subscription.nextrenewalstartdate AS subscription_nextrenewalstartdate,
                Subscription.billingsubscriptionstatus AS subscription_billingsubscriptionstatus,
                
                Subscription.custrecord_sub_network_admin AS subscription_network_admin,
                Subscription.custrecord_sub_network_name AS subscription_network_name,
                Subscription.custrecord_sub_network_id AS subscription_sub_network_id,
                Subscription.custrecord_bsn_type AS subscription_bsn_type,
                
                SubscriptionCustomer.id AS customer_subscriptionCustomerId,         
                
                CustomerSalesRep.entityid AS customer_salesrep, 

              CASE 
                WHEN Subscription.startdate <= CURRENT_DATE THEN 'F'
                WHEN Subscription.startdate > CURRENT_DATE THEN 'T'
                END AS subscription_startdate_infuture,
                
              CASE
                WHEN Subscription.startdate < CURRENT_DATE THEN Subscription.enddate
                WHEN Subscription.startdate >= CURRENT_DATE THEN Subscription.startdate - 1
                END AS subscription_expdate,
                
              CASE
                WHEN Subscription.startdate < CURRENT_DATE THEN CEIL((Subscription.enddate - CURRENT_DATE))
                WHEN Subscription.startdate >= CURRENT_DATE THEN CEIL(((Subscription.startdate - 1) - CURRENT_DATE))
              END AS subscription_daystillexpdate
              
              FROM
                Customer AS SubscriptionCustomer
              INNER JOIN
                Subscription
              ON
                (SubscriptionCustomer.id = Subscription.customer)
                
              INNER JOIN
                employee AS CustomerSalesRep
              ON
                (CustomerSalesRep.id = SubscriptionCustomer.salesrep)

              WHERE
                (
                        (
                        Subscription.startdate < CURRENT_DATE 
                        AND
                        Subscription.enddate >= CURRENT_DATE 
                        AND
                        Subscription.billingsubscriptionstatus != 'TERMINATED'
                        AND
                        Subscription.enddate < CURRENT_DATE + ${periodDays}
                        ) 
                    OR
                        (
                        Subscription.startdate >= CURRENT_DATE 
                        AND
                        Subscription.billingsubscriptionstatus = 'PENDING_ACTIVATION' 
                        AND
                        Subscription.startdate < CURRENT_DATE + ${periodDays}
                        )
                )
              AND
                CustomerSalesRep.entityid IS NOT NULL
              AND
                Subscription.custrecord_sub_network_name IS NOT NULL
            `;

            if (!isNullOrEmpty(salesRepId)) {
                suiteQLQuery = `${suiteQLQuery} AND CustomerSalesRep.id=${salesRepId} ORDER BY subscription_expdate ASC`;
            } else {
                suiteQLQuery = `${suiteQLQuery} ORDER BY expdate ASC`;
            }

            const resultSet = query.runSuiteQL(
                {
                    query: suiteQLQuery,
                }
            );

            const mappedResults = resultSet.asMappedResults();

            if (isNullOrEmpty(mappedResults)) {
                return null;
            }

            const groupsData = {
                id: 'customer_id',

                groupPrefixDelimiter: '_',
                groupIds: ['subscriptionId'],
                groupPrefixes: ['subscription'],
            };

            return groupSQLJoinedDataNotSorted(mappedResults, groupsData);
        }

        return {
            loadExpSubsForSalesReps,
            loadExpSubsWithGroupedCustomers,
        }

    });
