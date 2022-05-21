/**
 * @NApiVersion 2.1
 */
define([
        'N/record',
        'N/query',
        './../../utilities/sql/bs_cm_join_operations'
    ],
    /**
 * @param{query} query
 */
    (record, query, { groupSQLJoinedDataSortedArray }) => {
        function loadExpiredNetworksWithDispositionData() {
            const suiteQLQuery = `
                SELECT
                    Subscription.id AS subscription_subscriptionId,
                    Subscription.custrecord_sub_network_name,
                    Subscription.custrecord_sub_network_id,
                    
                    GroupedNetworkIds.subscriptionCnt,
                    
                    NetworkDisposition.custrecordaction,
                    NetworkDisposition.custrecordemployee_id,
                    NetworkDisposition.custrecordnote,
                    NetworkDisposition.custrecorddate_modified,
                    NetworkDisposition.custrecorddate_add,
                    
                    DispositionList.name AS actionName,
                    
                CASE
                    WHEN Subscription.startdate < CURRENT_DATE THEN Subscription.enddate
                    WHEN Subscription.startdate >= CURRENT_DATE THEN Subscription.startdate - 1
                    END AS subscription_expdate   
                FROM
                    Subscription 
                INNER JOIN
                (
                    SELECT 
                        Subscription.custrecord_sub_network_id,
                        COUNT(Subscription.custrecord_sub_network_id) AS subscriptionCnt
                    FROM
                        Subscription 
                    WHERE
                    (
                            (
                            Subscription.startdate < CURRENT_DATE 
                            AND
                            Subscription.enddate >= CURRENT_DATE 
                            AND
                            Subscription.billingsubscriptionstatus != 'TERMINATED'
                            AND
                            Subscription.enddate < ADD_MONTHS(CURRENT_DATE, 12)
                            ) 
                        OR
                            (
                            Subscription.startdate >= CURRENT_DATE 
                            AND
                            Subscription.billingsubscriptionstatus = 'PENDING_ACTIVATION' 
                            AND
                            Subscription.startdate < ADD_MONTHS(CURRENT_DATE, 12)
                            )
                    )         
                    GROUP BY 
                        Subscription.custrecord_sub_network_id  
                    HAVING 
                        COUNT(Subscription.custrecord_sub_network_id) > 1
                ) 
                AS 
                    GroupedNetworkIds
                ON
                    (Subscription.custrecord_sub_network_id = GroupedNetworkIds.custrecord_sub_network_id)
                LEFT OUTER JOIN
                    customrecordbs_cr_expired_network_dispos AS NetworkDisposition
                ON
                    (Subscription.custrecord_sub_network_id = NetworkDisposition.custrecordnetwork_id)
                LEFT OUTER JOIN
                    customlistbs_cl_disposition_action AS DispositionList
                ON
                    (NetworkDisposition.custrecordaction = DispositionList.id)
           `;

            let resultSet = query.runSuiteQL({ query: suiteQLQuery }).asMappedResults();
            const groupsData = {
                id: 'custrecord_sub_network_id',

                groupPrefixDelimiter: '_',
                groupIds: ['subscriptionId'],
                groupPrefixes: ['subscription']
            }

            return groupSQLJoinedDataSortedArray(resultSet, groupsData).map(
                dataRow => ({
                    'Network name': dataRow['custrecord_sub_network_name'],
                    'Subscription records': dataRow.groupedData['subscription'],
                    'Subscription Record Expire Date': dataRow.groupedData['subscription'],
                    'Action': dataRow['actionName'],
                    'Employee': dataRow['custrecordemployee_id'],
                    'CS Team Notes': dataRow['custrecordnote'],
                })
            );


// 23 // 10
        }

        function upsertDisposition(networkId, actionId, employeeId, note) {
            let suiteQLQuery = `
                SELECT 
                    id 
                FROM 
                    customrecordbs_cr_expired_network_dispos
                WHERE
                    custrecordnetwork_id = ${networkId}
                AND
                    ROWNUM = 1    
           `;

            const resultSet = query.runSuiteQL({ query: suiteQLQuery }).asMappedResults();
            let objRecord;

            if (resultSet.length === 0) {
                objRecord = record.create({
                    type: 'customrecordbs_cr_expired_network_dispos',
                    isDynamic: false
                });
            } else {
                objRecord = record.load({
                    type: 'customrecordbs_cr_expired_network_dispos',
                    id: resultSet[0].id,
                    isDynamic: false,
                });
            }

            objRecord.setValue({ fieldId: 'custrecordnetwork_id', value: networkId });
            objRecord.setValue({ fieldId: 'custrecordaction', value: actionId });
            objRecord.setValue({ fieldId: 'custrecordemployee_id', value: employeeId });
            objRecord.setValue({ fieldId: 'custrecordnote', value: note });

            const currentDate = new Date();
            objRecord.setValue({ fieldId: 'custrecorddate_modified', value: currentDate });

            if (resultSet.length === 0) {
                objRecord.setValue({ fieldId: 'custrecorddate_add', value: currentDate });
            }

            return objRecord.save({
                enableSourcing: false,
                ignoreMandatoryFields: true
            });
        }

        return { loadExpiredNetworksWithDispositionData, upsertDisposition }
    });
