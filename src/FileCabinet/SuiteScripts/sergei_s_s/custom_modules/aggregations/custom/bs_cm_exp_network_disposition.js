/**
 * @NApiVersion 2.1
 */
define([
        'N/record',
        'N/query',
        './../../aggregations/custom/bs_cm_disposition_action_list',
        './../../utilities/sql/bs_cm_join_operations',
        './../../utilities/bs_cm_runtime_utils',
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
        { prepareNoteHeader }
    ) => {
        const EXPIRED_NETWORKS_WITH_DISPOSITION_GROUPING = {
            id: 'custrecord_sub_network_id',

            groupPrefixDelimiter: '_',
            groupIds: ['subscriptionId'],
            groupPrefixes: ['subscription']
        }


        function loadExpiredNetworksWithDispositionDataRaw() {
            const suiteQLQuery = `
                SELECT
                    Subscription.id AS subscription_subscriptionId,
                    Subscription.custrecord_sub_network_name,
                    Subscription.custrecord_sub_network_id,
                    
                    Subscription.billingsubscriptionstatus,
                    
                    GroupedNetworkIds.subscriptionCnt,
                    
                    NetworkDisposition.id AS custrecord_id,
                    NetworkDisposition.custrecordaction,
                    NetworkDisposition.custrecordemployee_id,
                    NetworkDisposition.custrecordnote,
                    NetworkDisposition.custrecorddate_modified,
                    NetworkDisposition.custrecorddate_add,
                    
                    DispositionList.name AS actionName,
                    LastEmployee.entityid AS employeename,
                    
                CASE
                    WHEN Subscription.startdate < CURRENT_DATE THEN Subscription.enddate
                    WHEN Subscription.startdate >= CURRENT_DATE THEN Subscription.startdate - 1
                    END AS subscription_expdate,
                
                CASE
                    WHEN Subscription.startdate < CURRENT_DATE THEN Subscription.enddate - 74
                    WHEN Subscription.startdate >= CURRENT_DATE THEN Subscription.startdate - 75
                    END AS subscription_renewalemaildate
                
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
                LEFT OUTER JOIN
                    employee AS LastEmployee
                ON
                    (NetworkDisposition.custrecordemployee_id = LastEmployee.id)    
                WHERE
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
           `;

            return query.runSuiteQL({ query: suiteQLQuery }).asMappedResults();
        }

        function loadExpiredNetworksWithDispositionData() {
            const resultSet = loadExpiredNetworksWithDispositionDataRaw();
            return groupSQLJoinedDataSortedArray(resultSet, EXPIRED_NETWORKS_WITH_DISPOSITION_GROUPING).map(
                dataRow => ({
                    'Network name': dataRow['custrecord_sub_network_name'],
                    'Subscription records': dataRow.groupedData['subscription'],
                    'Subscription Record Expire Date': dataRow.groupedData['subscription'],
                    'Renewal Email Date': dataRow.groupedData['subscription'],
                    'Earliest expiration': dataRow.groupedData['subscription'],
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

        function loadExpiredNetworksWithDispositionDataByNetwork() {
            const resultSet = loadExpiredNetworksWithDispositionDataRaw();
            return groupSQLJoinedDataNotSorted(resultSet, EXPIRED_NETWORKS_WITH_DISPOSITION_GROUPING);
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
            loadExpiredNetworksWithDispositionDataRaw,
            loadExpiredNetworksWithDispositionData,
            loadExpiredNetworksWithDispositionDataByNetwork,

            upsertDisposition }
    });
