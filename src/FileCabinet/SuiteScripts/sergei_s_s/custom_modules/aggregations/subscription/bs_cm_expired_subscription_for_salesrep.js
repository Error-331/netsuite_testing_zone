/**
 * @NApiVersion 2.1
 */
define([
    'N/query',
    './../../utilities/sql/bs_cm_join_operations',
    ],
    /**
 * @param{query} query
 */
    (
        query,
        { groupSQLJoinedData }
    ) => {

        function loadExpSubsForSalesReps() {
            const suiteQLQuery = `
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
                SubscriptionCustomer.salesrep AS customer_salesrep,          
                
                CustomerBillingAccount.id AS billingAccount_billingAccountId,
                CustomerBillingAccount.customer AS billingAccount_billingAccountCustomer,

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
            `;

            const resultSet = query.runSuiteQL(
                {
                    query: suiteQLQuery,
                }
            );

            const groupsData = {
                id: 'subscriptionId',

                groupPrefixDelimiter: '_',
                groupIds: ['subscriptionCustomerId', 'billingAccountId'],
                groupPrefixes: ['customer', 'billingAccount'],
            };

            const groupedData = groupSQLJoinedData(resultSet.asMappedResults(), groupsData);
            const dataSlice = [];

            for (const id in groupedData) {
                const data = groupedData[id];

                dataSlice.push({
                    'Start date': data.startdate,
                    'End date': data.enddate,
                    'Renewal date': data.nextrenewalstartdate,
                    'Sales rep': data.groupedData.customer[0].customer_salesrep,
                    'Status': data.billingsubscriptionstatus,
                    'Admin': data.custrecord_sub_network_admin,
                    'Network': data.custrecord_sub_network_name,
                })
            }

            return dataSlice;
        }

        return { loadExpSubsForSalesReps }

    });
