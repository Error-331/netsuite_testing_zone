/**
 * @NApiVersion 2.1
 */
define(['./../bs_cm_general_utils'],
    
    ({isArray, isNullOrEmpty}) => {
        function extractGroupIdsFromDataKeys(dataRowKeys, groupIds, groupPrefixes, groupPrefixDelimiter) {
            const groupIdsInData = [];
            let preparedDataRowKeys = dataRowKeys.map(dataRowKey => dataRowKey.toLowerCase());

            for (const groupId of groupIds) {
                if (isArray(groupId)) {
                    groupIdsInData.push(dataRowKeys, groupId, groupPrefixes, groupPrefixDelimiter);
                } else {
                    const preparedGroupId = groupId.toLowerCase();
                    let groupIdInDataIdx = preparedDataRowKeys.indexOf(preparedGroupId);

                    if (groupIdInDataIdx !== -1) {
                        groupIdsInData.push(dataRowKeys[groupIdInDataIdx]);
                    } else {
                        for (const groupPrefix of groupPrefixes) {
                            const preparedGroupPrefix = `${groupPrefix.toLowerCase()}${groupPrefixDelimiter}`;
                            groupIdInDataIdx = preparedDataRowKeys
                                .map(dataRowKey => dataRowKey.replace(preparedGroupPrefix, ''))
                                .indexOf(preparedGroupId);

                            if (groupIdInDataIdx !== -1) {
                                groupIdsInData.push(dataRowKeys[groupIdInDataIdx]);
                                break;
                            }
                        }
                    }
                }
            }

            if (groupIdsInData.length !== groupIds.length) {
                throw new Error('Group indexes count in data row is not equal to actual number of indexes');
            }

            return groupIdsInData;
        }

        function prepareGroupsMetaData(dataRow, groupsData) {
            // check input data
            if (isNullOrEmpty(dataRow)) {
                throw new Error('Data cannot be NULL or empty');
            }

            if (isNullOrEmpty(groupsData)) {
                throw new Error('Groups data cannot be NULL or empty');
            }

            // prepare columns data
            const groupIds = isNullOrEmpty(groupsData?.groupIds) ? [] : groupsData?.groupIds;
            const groupPrefixes = isNullOrEmpty(groupsData?.groupPrefixes) ? [] : groupsData?.groupPrefixes;
            const groupPrefixDelimiter = isNullOrEmpty(groupsData?.groupPrefixDelimiter) ? '_' : groupsData?.groupPrefixDelimiter;

            let groupIdsInData = [];

            if (groupIds.length !== groupPrefixes.length) {
                throw new Error('Group IDs count must be equal to group prefixes count');
            }

            if (groupIds.length === 0) {
                return { groupIdsInData };
            }

            // prepare group IDs names in data
            const dataRowKeys = Object.keys(dataRow);
            groupIdsInData = extractGroupIdsFromDataKeys(dataRowKeys, groupIds, groupPrefixes, groupPrefixDelimiter);

            return { groupIdsInData };
        }

        function extractGroupedDataFromRow(dataRow, groupPrefixes, groupPrefixDelimiter) {
            const preparedGroupPrefixes = groupPrefixes.map(groupPrefix => `${groupPrefix.toLowerCase()}${groupPrefixDelimiter}`);
            const groupedData = groupPrefixes.reduce((groupsObj, groupName) => { groupsObj[groupName] = {}; return groupsObj; }, {});

            const noneGroupedData = {};

            for (const columnKey in dataRow) {
                const preparedColumnKey = columnKey.toLowerCase();

                let found = false;
                for (let groupPrefixIndex = 0; groupPrefixIndex < preparedGroupPrefixes.length; groupPrefixIndex++) {
                    const groupPrefix = groupPrefixes[groupPrefixIndex];
                    const preparedGroupPrefix = preparedGroupPrefixes[groupPrefixIndex];

                    if (preparedColumnKey.toLowerCase().startsWith(preparedGroupPrefix)) {
                        groupedData[groupPrefix][columnKey] = dataRow[columnKey];
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    noneGroupedData[columnKey] = dataRow[columnKey];
                }

                found = false;
            }

            return {
                noneGroupedData,
                groupedData,
            };
        }

        function groupSQLJoinedData(dataRows, groupsData) {
            // check input data
            if (isNullOrEmpty(dataRows)) {
                throw new Error('Data cannot be NULL or empty');
            }

            if (!isArray(dataRows)) {
                throw new Error ('Invalid data type - data must be represented as array');
            }

            if (isNullOrEmpty(groupsData.id)) {
                throw new Error ('Groups data should contain primary id');
            }

            // prepare groups data
            const idColumnName = isNullOrEmpty(groupsData?.id) ? 'id' : groupsData?.id;
            const groupPrefixes = isNullOrEmpty(groupsData?.groupPrefixes) ? [] : groupsData?.groupPrefixes;
            const groupPrefixDelimiter = isNullOrEmpty(groupsData?.groupPrefixDelimiter) ? '_' : groupsData?.groupPrefixDelimiter;
            const { groupIdsInData } = prepareGroupsMetaData(dataRows[0], groupsData);

            // prepare temporary variables
            const groupsDataResult = {};

            // find primary id raw column name
            const preparedIdColumnName = idColumnName.toLowerCase();
            const columnNames = Object.keys(dataRows[0]);
            const idColumnNameIndex = columnNames.findIndex(columnKey => columnKey.toLowerCase() === preparedIdColumnName);

            if (idColumnNameIndex === -1) {
                throw new Error('Cannot find primary key ID index in data row');
            }

            const idColumnNameInData = columnNames[idColumnNameIndex];

            // process data rows
            for (const dataRow of dataRows) {
                const currentRowIdValue = dataRow[idColumnNameInData];

                if (isNullOrEmpty(currentRowIdValue)) {
                    throw new Error(`Primary row ID (${currentRowIdValue}) cannot be empty`)
                }

                // extract groups data
                const { noneGroupedData, groupedData } = extractGroupedDataFromRow(dataRow, groupPrefixes, groupPrefixDelimiter);

                // add new data object if new primary id is found
                if (isNullOrEmpty(groupsDataResult[currentRowIdValue])) {
                    groupsDataResult[currentRowIdValue] = Object.assign({}, noneGroupedData);

                    groupsDataResult[currentRowIdValue].groupsIdValues = groupPrefixes.reduce((groupsIdValues, groupName) => { groupsIdValues[groupName] = []; return groupsIdValues }, {});
                    groupsDataResult[currentRowIdValue].groupedData = groupPrefixes.reduce((groupsDataAccumulator, groupName) => { groupsDataAccumulator[groupName] = []; return groupsDataAccumulator }, {});
                }

                for (let groupPrefixIndex = 0; groupPrefixIndex < groupPrefixes.length; groupPrefixIndex++) {
                    const groupIdInData = groupIdsInData[groupPrefixIndex];
                    const groupIdValue = dataRow[groupIdInData];

                    const groupPrefix = groupPrefixes[groupPrefixIndex];

                    if (!isNullOrEmpty(groupIdValue) && !groupsDataResult[currentRowIdValue].groupsIdValues[groupPrefix].includes(groupIdValue)) {
                        groupsDataResult[currentRowIdValue].groupsIdValues[groupPrefix].push(groupIdValue);
                        groupsDataResult[currentRowIdValue].groupedData[groupPrefix].push(groupedData[groupPrefix]);
                    }
                }
            }

            return groupsDataResult;
        }

        return {
            extractGroupIdsFromDataKeys,
            prepareGroupsMetaData,
            extractGroupedDataFromRow,

            groupSQLJoinedData,
        }
    });
