import {
    checkTerritoryRuleBetween,
    checkTerritoryRuleEquals,
    checkIsListMemberRule,
    extractAddressDataByTerritoryKey,
    checkTerritoryRule,
    checkTerritorySubRule,
    findSalesRepTerritoryBySalesRepId,
} from './../../../../../src/FileCabinet/SuiteScripts/sergei_s_s/custom_modules/entities/bs_cm_sales_rep';

import { SALES_TO_SALES_TERRITORIES } from './../../../../../src/FileCabinet/SuiteScripts/sergei_s_s/custom_modules/data/sales/bs_cm_sales_to_sales_territories';

jest.mock('N/query', () => {
    const statesMockData = require('../../../../../src/test_data/entities/states/states_general1.json');
    const mockNQuery = require('./../../../../../src/mocks/n_query_module_mocks');

    mockNQuery.resetMockData();
    mockNQuery.setMockMappedResults(statesMockData);

    return mockNQuery;
}, { virtual: true });

afterAll(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
});

describe('Custom modules / entities / sales rep tests', () => {
    const testAddress1 = {
        country: 'United States',
        state: 'District of Columbia',
        city: 'Washington',
        zip: 20001,
    };

    const testAddress2 = {
        country: 'United States',
        state: 'Pennsylvania',
        city: 'Philadelphia',
        zip: 17110,
    };

    const testAddress3 = {
        country: 'United States',
        state: 'New Jersey',
        city: 'Newark',
        zip: '07101',
    };

    const testAddress4 = {
        country: 'New Zealand',
        state: 'New Jersey',
        city: 'Hamilton',
        zip: 'L8N',
    };

    const testAddress5 = {
        country: 'United States',
        state: 'New Mexico',
        city: 'Albuquerque',
        zip: 87101,
    };

    const testAddress6 = {
        country: 'Haiti',
        state: 'Sud-Est',
        city: 'Jacmel',
        zip: 23,
    };

    const testAddress7 = {
        country: 'Korea, Democratic People\'s Republic',
        state: null,
        city: 'Incheon',
        zip: '400-011',
    };


    describe('checkTerritoryRuleBetween function tests', () => {
        const testData1 = ['17101'];
        const testData2 = '17177'

        it('it should check whether value is in boundaries (case 1)', () => {
            expect(checkTerritoryRuleBetween(17101, testData1, testData2)).toBe(true);
            expect(checkTerritoryRuleBetween('17101', testData1, testData2)).toBe(true);
            expect(checkTerritoryRuleBetween([17101], testData1, testData2,)).toBe(true);
            expect(checkTerritoryRuleBetween(['17101'], testData1, testData2)).toBe(true);
        });

        it('it should check whether value is in boundaries (case 2)', () => {
            expect(checkTerritoryRuleBetween(17125, testData1, testData2)).toBe(true);
            expect(checkTerritoryRuleBetween('17125', testData1, testData2)).toBe(true);
            expect(checkTerritoryRuleBetween([17125], testData1, testData2)).toBe(true);
            expect(checkTerritoryRuleBetween(['17125'], testData1, testData2)).toBe(true);
        });

        it('it should check whether value is in boundaries (case 3)', () => {
            expect(checkTerritoryRuleBetween(17177, testData1, testData2)).toBe(true);
            expect(checkTerritoryRuleBetween('17177', testData1, testData2)).toBe(true);
            expect(checkTerritoryRuleBetween([17177], testData1, testData2)).toBe(true);
            expect(checkTerritoryRuleBetween(['17177'], testData1, testData2)).toBe(true);
        });

        it('it should check whether value is not in boundaries (case 1)', () => {
            expect(checkTerritoryRuleBetween(17100, testData1, testData2)).toBe(false);
            expect(checkTerritoryRuleBetween('17100', testData1, testData2)).toBe(false);
            expect(checkTerritoryRuleBetween([17100], testData1, testData2)).toBe(false);
            expect(checkTerritoryRuleBetween(['17100'], testData1, testData2)).toBe(false);
        });

        it('it should check whether value is not in boundaries (case 2)', () => {
            expect(checkTerritoryRuleBetween(17065, testData1, testData2)).toBe(false);
            expect(checkTerritoryRuleBetween('17065', testData1, testData2)).toBe(false);
            expect(checkTerritoryRuleBetween([17065], testData1, testData2)).toBe(false);
            expect(checkTerritoryRuleBetween(['17065'], testData1, testData2)).toBe(false);
        });

        it('it should check whether value is not in boundaries (case 3)', () => {
            expect(checkTerritoryRuleBetween(17178, testData1, testData2)).toBe(false);
            expect(checkTerritoryRuleBetween('17178', testData1, testData2)).toBe(false);
            expect(checkTerritoryRuleBetween([17178], testData1, testData2)).toBe(false);
            expect(checkTerritoryRuleBetween(['17178'], testData1, testData2)).toBe(false);
        });

        it('it should not check whether value is in boundaries and throw error', () => {
            const test1 = () => checkTerritoryRuleBetween(17178, null, testData2);
            const test2 = () => checkTerritoryRuleBetween(17178, testData1, null);
            const test3 = () => checkTerritoryRuleBetween(null, testData1, testData2);

            expect(test1).toThrowError();
            expect(test2).toThrowError();
            expect(test3).toThrowError();
        });
    });

    describe('checkTerritoryRuleEquals function tests', () => {
        it('it should check whether value equals to specific value (case 1)', () => {
            expect(checkTerritoryRuleEquals(17101, 17101)).toBe(true);
            expect(checkTerritoryRuleEquals('17101', 17101)).toBe(true);
            expect(checkTerritoryRuleEquals(17101, '17101')).toBe(true);
            expect(checkTerritoryRuleEquals('17101', '17101')).toBe(true);

            expect(checkTerritoryRuleEquals([17101], 17101)).toBe(true);
            expect(checkTerritoryRuleEquals(['17101'], 17101)).toBe(true);
            expect(checkTerritoryRuleEquals([17101], '17101')).toBe(true);
            expect(checkTerritoryRuleEquals(['17101'], '17101')).toBe(true);

            expect(checkTerritoryRuleEquals(17101, [17101])).toBe(true);
            expect(checkTerritoryRuleEquals('17101', [17101])).toBe(true);
            expect(checkTerritoryRuleEquals(17101, ['17101'])).toBe(true);
            expect(checkTerritoryRuleEquals('17101', ['17101'])).toBe(true);

            expect(checkTerritoryRuleEquals([17101], [17101])).toBe(true);
            expect(checkTerritoryRuleEquals(['17101'], [17101])).toBe(true);
            expect(checkTerritoryRuleEquals([17101], ['17101'])).toBe(true);
            expect(checkTerritoryRuleEquals(['17101'], ['17101'])).toBe(true);
        });

        it('it should check whether value equals to specific value (case 2)', () => {
            const testData1 = 'test1';

            expect(checkTerritoryRuleEquals(testData1, testData1)).toBe(true);
            expect(checkTerritoryRuleEquals([testData1], testData1)).toBe(true);
            expect(checkTerritoryRuleEquals(testData1, [testData1])).toBe(true);
            expect(checkTerritoryRuleEquals([testData1], [testData1])).toBe(true);
        });

        it('it should check whether value not equals to specific value (case 1)', () => {
            expect(checkTerritoryRuleEquals(17102, 17101)).toBe(false);
            expect(checkTerritoryRuleEquals('17102', 17101)).toBe(false);
            expect(checkTerritoryRuleEquals(17102, '17101')).toBe(false);
            expect(checkTerritoryRuleEquals('17102', '17101')).toBe(false);

            expect(checkTerritoryRuleEquals([17102], 17101)).toBe(false);
            expect(checkTerritoryRuleEquals(['17102'], 17101)).toBe(false);
            expect(checkTerritoryRuleEquals([17102], '17101')).toBe(false);
            expect(checkTerritoryRuleEquals(['17102'], '17101')).toBe(false);

            expect(checkTerritoryRuleEquals(17102, [17101])).toBe(false);
            expect(checkTerritoryRuleEquals('17102', [17101])).toBe(false);
            expect(checkTerritoryRuleEquals(17102, ['17101'])).toBe(false);
            expect(checkTerritoryRuleEquals('17102', ['17101'])).toBe(false);

            expect(checkTerritoryRuleEquals([17102], [17101])).toBe(false);
            expect(checkTerritoryRuleEquals(['17102'], [17101])).toBe(false);
            expect(checkTerritoryRuleEquals([17102], ['17101'])).toBe(false);
            expect(checkTerritoryRuleEquals(['17102'], ['17101'])).toBe(false);
        });

        it('it should check whether value equals to specific value (case 2)', () => {
            const testData1 = 'test1';
            const testData2 = 'test2';

            expect(checkTerritoryRuleEquals(testData1, testData2)).toBe(false);
            expect(checkTerritoryRuleEquals([testData1], testData2)).toBe(false);
            expect(checkTerritoryRuleEquals(testData1, [testData2])).toBe(false);
            expect(checkTerritoryRuleEquals([testData1], [testData2])).toBe(false);
        });

        it('it should not check whether value equals to specific value and throw error', () => {
            const testData1 = 'test1';
            const testData2 = 'test2';

            const test1 = () => checkTerritoryRuleEquals(null, testData2);
            const test2 = () => checkTerritoryRuleEquals(testData1, null);

            expect(test1).toThrowError();
            expect(test2).toThrowError();
        });
    });

    describe('checkIsListMemberRule function tests', () => {
        const testData1 = ['6', '19', '21', '29', '30', '32', '40', '45', '46'];
        const testData2 = [6, 19, 21, 29, 30, 32, 40, 45, 46];

        it('it should check whether value is in list (case 1)', () => {
            expect(checkIsListMemberRule('6', testData1)).toBe(true);
            expect(checkIsListMemberRule('32', testData1)).toBe(true);
            expect(checkIsListMemberRule('46', testData1)).toBe(true);

            expect(checkIsListMemberRule(6, testData1)).toBe(true);
            expect(checkIsListMemberRule(32, testData1)).toBe(true);
            expect(checkIsListMemberRule(46, testData1)).toBe(true);
        });

        it('it should check whether value is in list (case 2)', () => {
            expect(checkIsListMemberRule('6', testData2)).toBe(true);
            expect(checkIsListMemberRule('32', testData2)).toBe(true);
            expect(checkIsListMemberRule('46', testData2)).toBe(true);

            expect(checkIsListMemberRule(6, testData2)).toBe(true);
            expect(checkIsListMemberRule(32, testData2)).toBe(true);
            expect(checkIsListMemberRule(46, testData2)).toBe(true);
        });

        it('it should check whether value is not in list (case 1)', () => {
            expect(checkIsListMemberRule('7', testData1)).toBe(false);
            expect(checkIsListMemberRule('31', testData1)).toBe(false);
            expect(checkIsListMemberRule('47', testData1)).toBe(false);

            expect(checkIsListMemberRule(7, testData1)).toBe(false);
            expect(checkIsListMemberRule(31, testData1)).toBe(false);
            expect(checkIsListMemberRule(47, testData1)).toBe(false);
        });

        it('it should check whether value is not in list (case 2)', () => {
            expect(checkIsListMemberRule('7', testData2)).toBe(false);
            expect(checkIsListMemberRule('31', testData2)).toBe(false);
            expect(checkIsListMemberRule('47', testData2)).toBe(false);

            expect(checkIsListMemberRule(7, testData2)).toBe(false);
            expect(checkIsListMemberRule(3, testData2)).toBe(false);
            expect(checkIsListMemberRule(47, testData2)).toBe(false);
        });

        it('it should not check whether value is in list and throw error (case 1)', () => {
            const test1 = () => checkIsListMemberRule('6', null,);
            const test2 = () => checkIsListMemberRule(null, testData1);

            expect(test1).toThrowError();
            expect(test2).toThrowError();
        });

        it('it should not check whether value is in list and throw error (case 2)', () => {
            const test1 = () => checkIsListMemberRule('6', []);
            const test2 = () => checkIsListMemberRule('6', {});

            expect(test1).toThrowError();
            expect(test2).toThrowError();
        });
    });

    describe('extractAddressDataByTerritoryKey function tests', () => {
        it('it should extract correct part of the address', () => {
            expect(extractAddressDataByTerritoryKey('Entity_Country', testAddress1)).toEqual('US');
            expect(extractAddressDataByTerritoryKey('Entity_State', testAddress1)).toEqual(8);
            expect(extractAddressDataByTerritoryKey('Entity_City', testAddress1)).toEqual(testAddress1.city);
            expect(extractAddressDataByTerritoryKey('Entity_ZipCode', testAddress1)).toEqual(testAddress1.zip);
        });

        it('it should not extract correct part of the address and throw error', () => {
            const test1 = () => extractAddressDataByTerritoryKey('Entity_Region', testAddress1);
            const test2 = () => extractAddressDataByTerritoryKey(null, testAddress1);
            const test3 = () => extractAddressDataByTerritoryKey('Entity_State', null);

            expect(test1).toThrowError();
            expect(test2).toThrowError();
            expect(test3).toThrowError();
        });
    });

    describe('checkTerritoryRule function tests', () => {
        const testTerritoryRuleData1 = {
            "rules": {
                "id": 41,
                "criteria": "BETWEEN",
                "name": "BrightSign Pennsylvania - Metro Philadelphia",
                "data2": "17177",
                "flddef": "Zip/Postal Code",
                "fldkey": "Entity_ZipCode",
                "data": [
                    "17101"
                ]
            }
        };

        const testTerritoryRuleData2 = {
            "rules": {
                "id": 6,
                "criteria": "ISLISTMEMBER",
                "name": "BrightSign US Northeast Territory",
                "data2": "",
                "flddef": "State",
                "fldkey": "Entity_State",
                "data": [
                    "6",
                    "19",
                    "21",
                    "29",
                    "30",
                    "32",
                    "40",
                    "45",
                    "46"
                ]
            },
        };

        const testTerritoryRuleData3 = {
            "rules": {
                "id": 12,
                "criteria": "ISLISTMEMBER",
                "name": "BrightSign Sales Territory Australia & Pacific",
                "data2": "",
                "flddef": "Country",
                "fldkey": "Entity_Country",
                "data": [
                    "AU",
                    "FJ",
                    "KI",
                    "MH",
                    "FM",
                    "NR",
                    "NZ",
                    "PW",
                    "PG",
                    "WS",
                    "SB",
                    "TO",
                    "TV",
                    "VU"
                ]
            },
        };

        it('it should check territory rules by address (case 1)...', () => {
            expect(checkTerritoryRule(testTerritoryRuleData1.rules, 17110)).toEqual(true);
        });

        it('it should check territory rules by address (case 2)...', () => {
            expect(checkTerritoryRule(testTerritoryRuleData2.rules, 30)).toEqual(true);
        });

        it('it should check territory rules by address (case 3)...', () => {
            expect(checkTerritoryRule(testTerritoryRuleData3.rules, 'NZ')).toEqual(true);
        });

        it('it should not check territory rules by address (case 1)...', () => {
            expect(checkTerritoryRule(testTerritoryRuleData1.rules, 20001)).toEqual(false);
        });

        it('it should not check territory rules by address (case 2)...', () => {
            expect(checkTerritoryRule(testTerritoryRuleData2.rules, 'PA')).toEqual(false);
        });

        it('it should not check territory rules by address (case 3)...', () => {
            expect(checkTerritoryRule(testTerritoryRuleData3.rules, 'US')).toEqual(false);
        });
    });

    describe('checkTerritorySubRule function tests', () => {
        const testTerritorySubRuleData1 = [
            {
                "subcriteria": "EQUALS",
                "linedata": 17042,
                "linedata2": null,
                "subruleid": 44
            },
            {
                "subcriteria": "BETWEEN",
                "linedata": 17742,
                "linedata2": 19640,
                "subruleid": 57
            },
            {
                "subcriteria": "EQUALS",
                "linedata": 17048,
                "linedata2": null,
                "subruleid": 46
            },
        ];


        it('it should check territory sub-rules by address (case 1)...', () => {
            expect(checkTerritorySubRule(testTerritorySubRuleData1, 17042)).toEqual(true);
        });

        it('it should check territory sub-rules by address (case 2)...', () => {
            expect(checkTerritorySubRule(testTerritorySubRuleData1, 18041)).toEqual(true);
        });

        it('it should check territory sub-rules by address (case 3)...', () => {
            expect(checkTerritorySubRule(testTerritorySubRuleData1, 17048)).toEqual(true);
        });

        it('it should check territory sub-rules by address (case 4)...', () => {
            expect(checkTerritorySubRule([], 17048)).toEqual(true);
        });

        it('it should check territory sub-rules by address (case 5)...', () => {
            expect(checkTerritorySubRule(null, 17048)).toEqual(true);
        });

        it('it not should check territory sub-rules by address (case 1)...', () => {
            expect(checkTerritorySubRule(testTerritorySubRuleData1, 17041)).toEqual(false);
        });

        it('it not should check territory sub-rules by address (case 2)...', () => {
            expect(checkTerritorySubRule(testTerritorySubRuleData1, 19641)).toEqual(false);
        });

        it('it not should check territory sub-rules by address (case 3)...', () => {
            expect(checkTerritorySubRule(testTerritorySubRuleData1, 17049)).toEqual(false);
        });
    });

    describe('findSalesRepTerritoryBySalesRepId function tests', () => {
        it('it should find correct sales territory data (case 1)', () => {
            const result = findSalesRepTerritoryBySalesRepId(123923, testAddress2);
            expect(result).toStrictEqual(SALES_TO_SALES_TERRITORIES[0].territoryData);
        });

        it('it should find correct sales territory data (case 2)', () => {
            const result = findSalesRepTerritoryBySalesRepId(123923, testAddress1);
            expect(result).toStrictEqual(SALES_TO_SALES_TERRITORIES[0].territoryData);
        });

        it('it should find correct sales territory data (case 3)', () => {
            const result = findSalesRepTerritoryBySalesRepId(152662, testAddress5);
            expect(result).toStrictEqual(SALES_TO_SALES_TERRITORIES[1].territoryData);
        });

        it('it should find correct sales territory data (case 4)', () => {
            const result = findSalesRepTerritoryBySalesRepId(152662, testAddress6);
            expect(result).toStrictEqual(SALES_TO_SALES_TERRITORIES[1].territoryData);
        });

        it('it should find correct sales territory data (case 5)', () => {
            const result = findSalesRepTerritoryBySalesRepId(136526, testAddress7);
            expect(result).toStrictEqual(SALES_TO_SALES_TERRITORIES[6].territoryData);
        });

        it('it should not find correct sales territory data (case 1)', () => {
            const result = findSalesRepTerritoryBySalesRepId(123922, testAddress2);
            expect(result).toBeNull();
        });

        it('it should not find correct sales territory data (case 2)', () => {
            const result = findSalesRepTerritoryBySalesRepId(152662, testAddress1);
            expect(result).toBeNull();
        });
    });
});