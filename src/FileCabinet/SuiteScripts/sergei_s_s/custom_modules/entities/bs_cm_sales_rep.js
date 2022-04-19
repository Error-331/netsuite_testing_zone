/**
 * @NApiVersion 2.1
 */
define([
    './../data/sales/bs_cm_sales_to_sales_territories',
    './../utilities/bs_cm_general_utils',
    './../utilities/bs_cm_math_utils'
    ],
    
    (
        { SALES_TO_SALES_TERRITORIES},
        { isArray , isNullOrEmpty, toSingleValue, toInt, toArray },
        { eq, between }
    ) => {
        function checkIsListMemberRule(valuesList, checkValue) {
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

        function checkTerritoryRuleEquals(realValue, checkValue) {
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

        function checkTerritoryRuleBetween(leftBoundary, rightBoundary, checkValue) {
            if (isNullOrEmpty(leftBoundary) || isNullOrEmpty(rightBoundary) || isNullOrEmpty(checkValue)) {
                throw new Error('Cannot determine whether value is in boundaries - not enough arguments');
            }

            leftBoundary = toInt(leftBoundary);
            rightBoundary = toInt(rightBoundary);
            checkValue = toInt(checkValue);

            return between(leftBoundary, rightBoundary, checkValue);
        }

        function extractAddressDataByTerritoryKey(key, address) {
            let userData;

            switch (key) {
                case 'Entity_Country':
                    userData = address?.country;
                    break;
                case 'Entity_State':
                    userData = address?.state;
                    break;
                case 'Entity_City':
                    userData = address?.city;
                    break;
                case 'Entity_ZipCode':
                    userData = address?.zip;
                    break;
                default:
                    throw new Error(`Unrecognized sales territory criteria: ${fldkey}`);
            }

            if (isNullOrEmpty(userData)) {
                throw new Error(`Cannot extract address data based on key: ${key}`);
            }

            return userData;
        }

        function checkTerritoryRuleByAddress(ruleData, address) {
            if (isNullOrEmpty(ruleData)) {
                return true;
            }

            const { criteria, fldkey, data, data2 } = ruleData;
            let userData = extractAddressDataByTerritoryKey(fldkey, address);

            switch(criteria) {
                case 'BETWEEN':
                    return checkTerritoryRuleBetween(data, data2, userData);
                case 'EQUALS':
                    return checkTerritoryRuleEquals(data, userData);
                case 'ISLISTMEMBER':
                    return checkIsListMemberRule(data, userData);
            }
        }

        function checkTerritoryRulesByAddress(territoryRules, address) {
            for (const territoryRule of territoryRules) {
                if (
                    checkTerritoryRuleByAddress(territoryRule.rulesData, address) &&
                    checkTerritoryRuleByAddress(territoryRule.subRules, address)
                ) {
                    return true;
                }
            }

            return false;
        }

        function findSalesRepTerritory(territoriesData, address) {
            for (const territoryData of territoriesData) {
                if (checkTerritoryRulesByAddress(territoryData.territoryRules)) {
                    return territoryData;
                }
            }

            return null;
        }

        function findSalesRepTerritoryBySalesRepId(salesRepId, address) {
            for (const salesData of SALES_TO_SALES_TERRITORIES) {
                if (salesData.entity === salesRepId) {
                    if (salesData.territoryData.length === 1) {
                        return salesData.territoryData;
                    } else {
                        findSalesRepTerritory(salesData.territoryData, address);
                        console.log('pu pu');
                        return 'su';
                    }
                }
            }

            return null;
        }

        return {
            checkIsListMemberRule,
            checkTerritoryRuleEquals,
            checkTerritoryRuleBetween,
            findSalesRepTerritoryBySalesRepId,
        }
    });
