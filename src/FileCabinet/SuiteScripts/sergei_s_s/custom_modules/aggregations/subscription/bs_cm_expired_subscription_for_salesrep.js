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
        { groupSQLJoinedData },
        { isNullOrEmpty }
    ) => {

        function loadExpSubsForSalesReps(salesRepId) {
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

            if (!isNullOrEmpty(salesRepId)) {
                suiteQLQuery = `${suiteQLQuery} AND CustomerSalesRep.id=${salesRepId}`;
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
                id: 'subscriptionId',

                groupPrefixDelimiter: '_',
                groupIds: ['subscriptionCustomerId', 'billingAccountId'],
                groupPrefixes: ['customer', 'billingAccount'],
            };

            const groupedData = groupSQLJoinedData(mappedResults, groupsData);
            const dataSlice = [];

            for (const id in groupedData) {
                const data = groupedData[id];

                dataSlice.push({
                    'Network': data.custrecord_sub_network_name,
                    'Admin': data.custrecord_sub_network_admin,
                    'Start date': data.startdate,
                    'End date': data.enddate,
                    'Sales rep': data.groupedData.customer[0].customer_salesrep,
                    'startdate_infuture':data.startdate_infuture,
                });
            }

            return dataSlice;
        }

        return { loadExpSubsForSalesReps }

    });
