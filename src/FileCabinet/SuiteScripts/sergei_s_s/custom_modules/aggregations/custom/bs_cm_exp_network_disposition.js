/**
 * @NApiVersion 2.1
 */
define([
        'N/record',
        'N/query',
        './../../aggregations/custom/bs_cm_disposition_action_list',
        './../../utilities/sql/bs_cm_join_operations',
        './../../utilities/bs_cm_runtime_utils',
        './../../utilities/bs_cm_math_utils',
        './../../utilities/bs_cm_general_utils',
        './../../utilities/specific/bs_cm_daily_subscription_expiry_report_utils'
    ],
    /**
 * @param{query} query
 */
    (
        record,
        query,
        { loadDispositionActionNameById },
        { groupSQLJoinedDataNotSorted, groupSQLJoinedDataSortedArray },
        { getCurrentEmployeeName },
        { calcPagesCount },
        { isNullOrEmpty },
        { prepareNoteHeader }
    ) => {
        const EXPIRED_NETWORKS_WITH_DISPOSITION_GROUPING = {
            id: 'custrecord_sub_network_id',

            groupPrefixDelimiter: '_',
            groupIds: [],
            groupPrefixes: []
        };

        const expiredNetworksQuery = `
            SELECT
                Subscription.custrecord_sub_network_id,
                ROW_NUMBER() OVER (ORDER BY Subscription.custrecord_sub_network_id) AS rownumber
            FROM 
                Subscription                   
            WHERE
                Subscription.custrecord_sub_network_id IS NOT NULL
            AND
                Subscription.custrecord_sub_network_name IS NOT NULL
            AND                    
                (
                        Subscription.billingsubscriptionstatus != 'TERMINATED'
                    AND
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
                )    
            GROUP BY
                Subscription.custrecord_sub_network_id
            ORDER BY
                Subscription.custrecord_sub_network_id 
        `;

        function countExpiredNetworks() {
            return query.runSuiteQL({ query: `SELECT COUNT(*) AS total FROM (${expiredNetworksQuery})` }).asMappedResults()[0].total;
        }

        function loadExpiredNetworksWithDispositionDataRaw(pageNum, pageSize) {
            const suiteQLQuery = `
                SELECT
                    NetworkIds.custrecord_sub_network_id,
                    NetworkIds.rownumber,
                    
                    GroupedSubscriptionIds.subscriptionids,
                    GroupedSubscriptionIds.networknames,
                    GroupedSubscriptionIds.expdates,
                    GroupedSubscriptionIds.renewalemaildates,
                    
                    NetworkDisposition.id AS custrecord_id,
                    NetworkDisposition.custrecordaction,
                    NetworkDisposition.custrecordemployee_id,
                    NetworkDisposition.custrecordnote,
                    NetworkDisposition.custrecorddate_modified,
                    NetworkDisposition.custrecorddate_add,
                    
                    DispositionList.name AS actionName,
                    LastEmployee.entityid AS employeename
                    
                FROM 
                    (
                        ${expiredNetworksQuery}
                    )
                AS NetworkIds
                
                INNER JOIN
                    (
                        SELECT 
                            custrecord_sub_network_id, 
                            LISTAGG(FilteredPreparedSubscription.id, ',') WITHIN GROUP (ORDER BY id) AS subscriptionids,
                            LISTAGG(FilteredPreparedSubscription.custrecord_sub_network_name, ',') WITHIN GROUP (ORDER BY FilteredPreparedSubscription.id) AS networknames,
                            LISTAGG(FilteredPreparedSubscription.expdate, ',') WITHIN GROUP (ORDER BY FilteredPreparedSubscription.id) AS expdates,
                            LISTAGG(FilteredPreparedSubscription.renewalemaildate, ',') WITHIN GROUP (ORDER BY FilteredPreparedSubscription.id) AS renewalemaildates
                        FROM 
                            (
                                SELECT 
                                    id,
                                    custrecord_sub_network_id,
                                    custrecord_sub_network_name,
                                CASE
                                    WHEN Subscription.startdate < CURRENT_DATE THEN Subscription.enddate
                                    WHEN Subscription.startdate >= CURRENT_DATE THEN Subscription.startdate - 1
                                END AS expdate,
                
                                CASE
                                    WHEN Subscription.startdate < CURRENT_DATE THEN Subscription.enddate - 74
                                    WHEN Subscription.startdate >= CURRENT_DATE THEN Subscription.startdate - 75
                                END AS renewalemaildate
                    
                                FROM
                                    Subscription 
                                WHERE
                                    custrecord_sub_network_id IS NOT NULL
                                AND                    
                                    (
                                            Subscription.billingsubscriptionstatus != 'TERMINATED'
                                        AND
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
                                    ) 
                            ) AS FilteredPreparedSubscription
                        GROUP BY 
                            FilteredPreparedSubscription.custrecord_sub_network_id  
                    ) AS GroupedSubscriptionIds
                ON
                    (NetworkIds.custrecord_sub_network_id = GroupedSubscriptionIds.custrecord_sub_network_id)
                LEFT OUTER JOIN
                    customrecordbs_cr_expired_network_dispos AS NetworkDisposition
                ON
                    (NetworkIds.custrecord_sub_network_id = NetworkDisposition.custrecordnetwork_id)
                LEFT OUTER JOIN
                    customlistbs_cl_disposition_action AS DispositionList
                ON
                    (NetworkDisposition.custrecordaction = DispositionList.id)
                LEFT OUTER JOIN
                    employee AS LastEmployee
                ON
                    (NetworkDisposition.custrecordemployee_id = LastEmployee.id) 
                WHERE     
                    NetworkIds.rownumber BETWEEN ${(pageNum * pageSize) + 1} AND ${(pageNum + 1) * pageSize}
            `;

            return query.runSuiteQL({ query: suiteQLQuery }).asMappedResults();
        }

        function loadExpiredNetworksWithDispositionData(pageNum, pageSize) {
            const resultSet = loadExpiredNetworksWithDispositionDataRaw(pageNum, pageSize);
            return resultSet.map(
                dataRow => ({
                    'Network name': dataRow['networknames'],
                    'Subscription records': dataRow['subscriptionids'],
                    'Subscription Record Expire Date': dataRow['expdates'],
                    'Renewal Email Date': dataRow['renewalemaildates'],
                    'Earliest expiration': dataRow['expdates'],
                    'Last update': dataRow['custrecorddate_modified'],
                    'Action': dataRow['actionname'],
                    'CS Team Notes': dataRow['custrecordnote'],
                    'employeename': dataRow['employeename'],
                    'networkid': dataRow['custrecord_sub_network_id'],
                    'dispositionid': dataRow['custrecord_id'],
                    'actionid': dataRow['custrecordaction'],
                })
            );
        }

        function loadExpiredNetworksWithDispositionDataByNetwork(pageNum, pageSize) {
            const resultSet = loadExpiredNetworksWithDispositionDataRaw(pageNum, pageSize);

            if (isNullOrEmpty(resultSet)) {
                return null;
            } else {
                return groupSQLJoinedDataNotSorted(resultSet, EXPIRED_NETWORKS_WITH_DISPOSITION_GROUPING);
            }
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
                    isDynamic: false,
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

            const dispositionId = objRecord.save({
                enableSourcing: false,
                ignoreMandatoryFields: true
            });

            // add note
            const noteRecord = record.create({
                type: 'note',
                isDynamic: false
            });

            const title = prepareNoteHeader(currentDate, loadDispositionActionNameById(actionId), getCurrentEmployeeName());

            noteRecord.setValue({ fieldId: 'type', value: 'note' });
            noteRecord.setValue({ fieldId: 'recordtype', value: objRecord.getValue('rectype') });
            noteRecord.setValue({ fieldId: 'record', value: dispositionId });
            noteRecord.setValue({ fieldId: 'notedate', value: currentDate });
            noteRecord.setValue({ fieldId: 'author', value: employeeId });
            noteRecord.setValue({ fieldId: 'title', value: title });
            noteRecord.setValue({ fieldId: 'note', value: note });

            noteRecord.save({
                enableSourcing: false,
                ignoreMandatoryFields: true
            });

            return dispositionId;
        }

        return {
            countExpiredNetworks,

            loadExpiredNetworksWithDispositionDataRaw,
            loadExpiredNetworksWithDispositionData,
            loadExpiredNetworksWithDispositionDataByNetwork,

            upsertDisposition
        }
    });
