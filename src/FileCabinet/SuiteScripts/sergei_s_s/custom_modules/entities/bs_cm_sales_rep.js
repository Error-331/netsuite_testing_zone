/**
 * @NApiVersion 2.1
 */
define([
    'N/query',
    './../data/sales/bs_cm_sales_to_sales_territories',
    './../utilities/bs_cm_general_utils',
    './../utilities/bs_cm_math_utils',
    './bs_cm_state',
    './bs_cm_country',
    ],
    
    (
        query,
        { SALES_TO_SALES_TERRITORIES},
        { isArray , isNullOrEmpty, toSingleValue, toInt, toArray },
        { eq, between },
        { findStateDataByFullName, getStateId },
        { findCountryDataByName, getCountryCode2 }
    ) => {
        function checkIsListMemberRule(checkValue, valuesList) {
            if (isNullOrEmpty(valuesList) || isNullOrEmpty(checkValue)) {
                throw new Error('Cannot determine whether value is in list - not enough arguments');
            }

            if (!isArray(valuesList)) {
                throw new Error('Values list is not array');
            }

            valuesList = toArray(valuesList);
            checkValue = toSingleValue(checkValue);

            for (const listValue of valuesList) {
                let compResult = false;

                if (typeof listValue === 'number' && typeof checkValue !== 'number') {
                    compResult = listValue === toInt(checkValue);
                } else if (typeof listValue === 'string' && typeof checkValue !== 'string') {
                    compResult = listValue === checkValue.toString();
                } else {
                    compResult = listValue === checkValue;
                }

                if (compResult === true) {
                    return true;
                }
            }

            return false;
        }

        function checkTerritoryRuleEquals(checkValue, realValue) {
            if (isNullOrEmpty(realValue) || isNullOrEmpty(checkValue)) {
                throw new Error('Cannot determine whether value is equal - not enough arguments');
            }

            realValue = toSingleValue(realValue);
            checkValue = toSingleValue(checkValue);

            if (typeof realValue === 'string' && typeof checkValue !== 'string') {
                checkValue = checkValue.toString();
            }

            if (typeof realValue === 'number' && typeof checkValue !== 'number') {
                checkValue = toInt(checkValue);
            }

            return eq(realValue, checkValue);
        }

        function checkTerritoryRuleBetween(checkValue, leftBoundary, rightBoundary) {
            if (isNullOrEmpty(leftBoundary) || isNullOrEmpty(rightBoundary) || isNullOrEmpty(checkValue)) {
                throw new Error('Cannot determine whether value is in boundaries - not enough arguments');
            }

            leftBoundary = toInt(leftBoundary);
            rightBoundary = toInt(rightBoundary);
            checkValue = toInt(checkValue);

            return between(leftBoundary, rightBoundary, checkValue);
        }

        function extractAddressDataByTerritoryKey(key, address) {
            if (isNullOrEmpty(address)) {
                throw new Error('Address is not set - cannot extract address data');
            }

            let userData;

            switch (key.toLowerCase()) {
                case 'entity_country':
                    userData = isNullOrEmpty(address?.country) ? null : getCountryCode2(findCountryDataByName(address.country));
                    break;
                case 'entity_state':
                    userData = isNullOrEmpty(address?.state) ? null : getStateId(findStateDataByFullName(address.state));
                    break;
                case 'entity_city':
                    userData = address?.city;
                    break;
                case 'entity_zipcode':
                    userData = address?.zip;
                    break;
                default:
                    throw new Error(`Unrecognized sales territory criteria: ${key}`);
            }

            return userData;
        }

        function executeRuleFunctionByCriteria(criteria, userData, ...inputData) {
            switch(criteria) {
                case 'BETWEEN':
                    return checkTerritoryRuleBetween(userData, ...inputData);
                case 'EQUALS':
                    return checkTerritoryRuleEquals(userData, ...inputData);
                case 'ISLISTMEMBER':
                    return checkIsListMemberRule(userData, ...inputData);
                default:
                    throw new Error(`Unknown criteria: ${criteria}`)
            }
        }

        function checkTerritoryRule(ruleData, userData) {
            if (isNullOrEmpty(ruleData)) {
                return false;
            }

            const { criteria, data, data2 } = ruleData;
            return executeRuleFunctionByCriteria(criteria, userData, data, data2);
        }

        function checkTerritorySubRule(territoryRules, userData) {
            if (isNullOrEmpty(territoryRules)) {
                return true;
            }

            for (const subRule of territoryRules) {
                const { subcriteria, linedata, linedata2 } = subRule;

                if (executeRuleFunctionByCriteria(subcriteria, userData, linedata, linedata2) === true) {
                    return true;
                }
            }

            return false;
        }

        function checkTerritoryRulesByAddress(territoryRules, address) {
            for (const territoryRule of territoryRules) {
                const valueFieldName = territoryRule.rulesData.rules.fldkey;
                let userData = extractAddressDataByTerritoryKey(valueFieldName, address);

                if (isNullOrEmpty(userData)) {
                    continue;
                }

                if (
                    checkTerritoryRule(territoryRule?.rulesData?.rules, userData) &&
                    checkTerritorySubRule(territoryRule?.subRules, userData)
                ) {
                    return true;
                }
            }

            return false;
        }

        function findSalesRepTerritory(territoriesData, address) {
            for (const territoryData of territoriesData) {
                if (checkTerritoryRulesByAddress(territoryData.territoryRules, address)) {
                    return territoriesData;
                }
            }

            return null;
        }

        function findSalesRepTerritoryBySalesRepId(salesRepId, address) {
            if (isNullOrEmpty(salesRepId)) {
                return null;
            }

            for (const salesData of SALES_TO_SALES_TERRITORIES) {
                if (salesData.entity === salesRepId) {
                    if (salesData.territoryData.length === 1) {
                        return salesData.territoryData;
                    } else {
                        return findSalesRepTerritory(salesData.territoryData, address);
                    }
                }
            }

            return null;
        }

        function loadActiveSalesRepsNames() {
            const suiteQLQuery = `
                SELECT 
                    id, entityid 
                FROM 
                    employee 
                WHERE 
                    issalesrep = 'T' 
                AND 
                    isinactive = 'F'
            `

            const resultSet = query.runSuiteQL(
                {
                    query: suiteQLQuery,
                }
            );

            return resultSet.asMappedResults();
        }

        return {
            checkIsListMemberRule,
            checkTerritoryRuleEquals,
            checkTerritoryRuleBetween,
            extractAddressDataByTerritoryKey,
            checkTerritoryRule,
            checkTerritorySubRule,
            findSalesRepTerritoryBySalesRepId,
            loadActiveSalesRepsNames,
        }
    });
