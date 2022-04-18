/**
 * @NApiVersion 2.1
 */
define([
    './../data/sales/bs_cm_sales_to_sales_territories',
    './../utilities/bs_cm_general_utils',
    ],
    
    (
        { SALES_TO_SALES_TERRITORIES},
        { isArray , isNullOrEmpty, toSingleValue, toInt, toArray },
    ) => {

        function checkIsListMemberRule(valuesList, checkValue) {
            valuesList = toArray(valuesList);
            checkValue = toSingleValue(checkValue);

            return valuesList.includes(checkValue);
        }

        function checkTerritoryRuleEquals(realValue, checkValue) {
            realValue = toSingleValue(realValue);
            checkValue = toSingleValue(checkValue);

            return realValue === checkValue;
        }

        function checkTerritoryRuleBetween(leftBoundary, rightBoundary, checkValue) {
            leftBoundary = toInt(leftBoundary);
            rightBoundary = toInt(rightBoundary);
            checkValue = toInt(checkValue);

            return checkValue >= leftBoundary && checkValue <= rightBoundary;
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
            findSalesRepTerritoryBySalesRepId,
        }
    });
