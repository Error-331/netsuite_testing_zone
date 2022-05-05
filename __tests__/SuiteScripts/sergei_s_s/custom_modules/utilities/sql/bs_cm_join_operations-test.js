import {
    extractIdValueFromRow,
    extractGroupIdsFromDataKeys,
    prepareGroupsMetaData,
    extractGroupedDataFromRow,

    groupSQLJoinedData,
} from './../../../../../../src/FileCabinet/SuiteScripts/sergei_s_s/custom_modules/utilities/sql/bs_cm_join_operations';
const testSubscriptionsData1 = require('./../../../../../../src/test_data/utilities/sql/left_outer_inner_join_subscription1');

describe('Custom modules / utilities / sql / join operations', () => {
    const dataRowKeys1 = Object.keys(testSubscriptionsData1[0]);

    const primaryId1 = 'subscriptionId';
    const groupPrefixDelimiter = '_';
    const groupIds1 = ['subscriptionCustomerId', 'billingAccountId'];
    const groupPrefixes = ['сustomer', 'billingAccount'];

    const groupsData1 = {
        id: primaryId1,

        groupPrefixDelimiter: groupPrefixDelimiter,
        groupIds: groupIds1,
        groupPrefixes: groupPrefixes,
    };

    const testData1 = [
        {
            id: 1,
            sub_id1: 'sub_id1_val1',
            sub_id1_with_null: 'sub_id1_with_null_val1',
            test_pref1_prop1: 'test_pref1_prop1_val1'
        },

        {
            id: 2,
            sub_id1: 'sub_id1_val2',
            sub_id1_with_null: null,
            test_pref1_prop1: 'test_pref1_prop1_val2'
        },
    ]

    describe('extractIdValueFromRow function tests', () => {
        it('it should extract id values - none compound (case 1)...', () => {
            expect(extractIdValueFromRow(testData1[0], 'id')).toEqual(1);
            expect(extractIdValueFromRow(testData1[1], 'id')).toEqual(2);

            expect(extractIdValueFromRow(testData1[0], ['id'])).toEqual(1);
            expect(extractIdValueFromRow(testData1[1], ['id'])).toEqual(2);
        });

        it('it should extract id values - compound (case 1)...', () => {
            expect(extractIdValueFromRow(testData1[0], ['id', 'sub_id1'])).toEqual('1_sub_id1_val1');
            expect(extractIdValueFromRow(testData1[1], ['id', 'sub_id1'])).toEqual('2_sub_id1_val2');
        });

        it('it should extract id values - compound with null (case 1)...', () => {
            expect(extractIdValueFromRow(testData1[0], ['id', 'sub_id1_with_null'])).toEqual('1_sub_id1_with_null_val1');
            expect(extractIdValueFromRow(testData1[1], ['id', 'sub_id1_with_null'])).toEqual('2');
        });

        it('it should extract id values - compound with null (case 2)...', () => {
            expect(extractIdValueFromRow(testData1[0], ['id', 'sub_id1', 'sub_id1_with_null'])).toEqual('1_sub_id1_val1_sub_id1_with_null_val1');
            expect(extractIdValueFromRow(testData1[1], ['id', 'sub_id1', 'sub_id1_with_null'])).toEqual('2_sub_id1_val2');

            expect(extractIdValueFromRow(testData1[0], ['id', 'sub_id1_with_null', 'sub_id1'])).toEqual('1_sub_id1_with_null_val1_sub_id1_val1');
            expect(extractIdValueFromRow(testData1[1], ['id', 'sub_id1_with_null', 'sub_id1'])).toEqual('2_sub_id1_val2');

            expect(extractIdValueFromRow(testData1[0], ['sub_id1_with_null', 'id', 'sub_id1'])).toEqual('sub_id1_with_null_val1_1_sub_id1_val1');
            expect(extractIdValueFromRow(testData1[1], ['sub_id1_with_null', 'id', 'sub_id1'])).toEqual('2_sub_id1_val2');
        });
    });

    describe('extractGroupIdsFromDataKeys function tests', () => {
        it('it should extract data id keys (case 1 - real data)...', () => {
            const dataKeys = extractGroupIdsFromDataKeys(dataRowKeys1, groupIds1, groupPrefixes, groupPrefixDelimiter);
            expect(dataKeys).toStrictEqual([
                'сustomer_subscriptioncustomerid',
                'billingaccount_billingaccountid'
            ]);
        });
    });

    describe('prepareGroupsMetaData function tests', () => {
        it('it should prepare groups meta data (case 1 - real data)...', () => {
            const groupMetaData = prepareGroupsMetaData(testSubscriptionsData1[0], groupsData1);

            expect(groupMetaData).toStrictEqual({
                groupIdsInData: [
                    'сustomer_subscriptioncustomerid',
                    'billingaccount_billingaccountid'
                ]
            });
        });
    });

    describe('extractGroupsDataFromRow function tests', () => {
        it('it should extract group data from data row (case 1 - real data)...', () => {
            const groupedData = extractGroupedDataFromRow(testSubscriptionsData1[0], groupPrefixes, groupPrefixDelimiter);

            expect(groupedData).toEqual({
                groupedData: {
                    сustomer: {
                        сustomer_subscriptioncustomerid: 18,
                        сustomer_addr1: null,
                        сustomer_addr2: null,
                        сustomer_addr3: null,
                        сustomer_city: null,
                        сustomer_state: null,
                        сustomer_zip: null,
                        сustomer_country: null,
                    },
                    billingAccount: {
                        billingaccount_billingaccountid: null,
                        billingaccount_billingaccountcustomer: null,
                        billingaccount_addr1: null,
                        billingaccount_addr2: null,
                        billingaccount_addr3: null,
                        billingaccount_city: null,
                        billingaccount_state: null,
                        billingaccount_zip: null,
                        billingaccount_country: null
                    }
                },
                noneGroupedData: {
                    subscriptionid: 502,
                    subscriptioncustomer: 18,
                }
            });
        });


        it('it should extract group data from data row (case 2 - real data)...', () => {
            const groupedData = extractGroupedDataFromRow(testSubscriptionsData1[2], groupPrefixes, groupPrefixDelimiter);

            expect(groupedData).toEqual({
                groupedData: {
                    сustomer: {
                        сustomer_subscriptioncustomerid: 2099,
                        сustomer_addr1: "Lot 4 Parklands Estate",
                        сustomer_addr2: "23 South Street",
                        сustomer_addr3: null,
                        сustomer_city: "Rydallmere",
                        сustomer_state: "NSW",
                        сustomer_zip: "2116",
                        сustomer_country: "AU",
                    },
                    billingAccount: {
                        billingaccount_billingaccountid: null,
                        billingaccount_billingaccountcustomer: null,
                        billingaccount_addr1: null,
                        billingaccount_addr2: null,
                        billingaccount_addr3: null,
                        billingaccount_city: null,
                        billingaccount_state: null,
                        billingaccount_zip: null,
                        billingaccount_country: null
                    }
                },
                noneGroupedData: {
                    subscriptionid: 1808,
                    subscriptioncustomer: 2099,
                }
            });
        });

        it('it should extract group data from data row (case 3 - real data)...', () => {
            const groupedData = extractGroupedDataFromRow(testSubscriptionsData1[9], groupPrefixes, groupPrefixDelimiter);

            expect(groupedData).toEqual({
                groupedData: {
                    сustomer: {
                        сustomer_subscriptioncustomerid: 3116,
                        сustomer_addr1: "2709 Commerce Way",
                        сustomer_addr2: null,
                        сustomer_addr3: null,
                        сustomer_city: "Philadelphia",
                        сustomer_state: "PA",
                        сustomer_zip: "19154",
                        сustomer_country: "US",
                    },
                    billingAccount: {
                        billingaccount_billingaccountid: 9532,
                        billingaccount_billingaccountcustomer: 3116,
                        billingaccount_addr1: "2709 Commerce Way",
                        billingaccount_addr2: null,
                        billingaccount_addr3: null,
                        billingaccount_city: "Philadelphia",
                        billingaccount_state: "PA",
                        billingaccount_zip: "19154",
                        billingaccount_country: "US"
                    }
                },
                noneGroupedData: {
                    subscriptionid: 5923,
                    subscriptioncustomer: 3116,
                }
            });
        });
    });

    describe('groupSQLJoinedData function tests', () => {
        it('it should...', () => {
            const groupedData = groupSQLJoinedData(testSubscriptionsData1, groupsData1);

            expect(groupedData).toEqual(
                {
                    "502": {
                        "subscriptionid": 502,
                        "subscriptioncustomer": 18,

                        "groupsIdValues": { 'сustomer': [18], billingAccount: [] },
                        "groupedData": {
                            'сustomer': [
                                {
                                    "сustomer_subscriptioncustomerid": 18,
                                    "сustomer_addr1": null,
                                    "сustomer_addr2": null,
                                    "сustomer_addr3": null,
                                    "сustomer_city": null,
                                    "сustomer_state": null,
                                    "сustomer_zip": null,
                                    "сustomer_country": null,
                                }
                            ],
                            billingAccount: []
                        },
                    },
                    "501": {
                        "subscriptionid": 501,
                        "subscriptioncustomer": 18,

                        "groupsIdValues": { 'сustomer': [18], billingAccount: [] },
                        "groupedData": {
                            'сustomer': [
                                {
                                    "сustomer_subscriptioncustomerid": 18,
                                    "сustomer_addr1": null,
                                    "сustomer_addr2": null,
                                    "сustomer_addr3": null,
                                    "сustomer_city": null,
                                    "сustomer_state": null,
                                    "сustomer_zip": null,
                                    "сustomer_country": null,
                                }
                            ],
                            billingAccount: []
                        },
                    },
                    "1808": {
                        "subscriptionid": 1808,
                        "subscriptioncustomer": 2099,

                        "groupsIdValues": { 'сustomer': [2099], billingAccount: [] },
                        "groupedData": {
                            'сustomer': [
                                {
                                    "сustomer_subscriptioncustomerid": 2099,
                                    "сustomer_addr1": "Lot 4 Parklands Estate",
                                    "сustomer_addr2": "23 South Street",
                                    "сustomer_addr3": null,
                                    "сustomer_city": "Rydallmere",
                                    "сustomer_state": "NSW",
                                    "сustomer_zip": "2116",
                                    "сustomer_country": "AU",
                                }
                            ],
                            billingAccount: []
                        },
                    },
                    "5968": {
                        "subscriptionid": 5968,
                        "subscriptioncustomer": 2503,

                        "groupsIdValues": { 'сustomer': [2503], billingAccount: [] },
                        "groupedData": {
                            'сustomer': [
                                {
                                    "сustomer_subscriptioncustomerid": 2503,
                                    "сustomer_addr1": "Parkstrasse 1",
                                    "сustomer_addr2": null,
                                    "сustomer_addr3": null,
                                    "сustomer_city": "Schonenwerd",
                                    "сustomer_state": null,
                                    "сustomer_zip": "CH-5012",
                                    "сustomer_country": "CH",
                                }
                            ],
                            billingAccount: []
                        },
                    },
                    "5961": {
                        "subscriptionid": 5961,
                        "subscriptioncustomer": 2505,

                        "groupsIdValues": { 'сustomer': [2505], billingAccount: [] },
                        "groupedData": {
                            'сustomer': [
                                {
                                    "сustomer_subscriptioncustomerid": 2505,
                                    "сustomer_addr1": "Vinces Road",
                                    "сustomer_addr2": null,
                                    "сustomer_addr3": null,
                                    "сustomer_city": "Diss, Norfolk",
                                    "сustomer_state": null,
                                    "сustomer_zip": "IP22 4YT",
                                    "сustomer_country": "GB",
                                }
                            ],
                            billingAccount: []
                        },
                    },
                    "5928": {
                        "subscriptionid": 5928,
                        "subscriptioncustomer": 2505,

                        "groupsIdValues": { 'сustomer': [2505], billingAccount: [] },
                        "groupedData": {
                            'сustomer': [
                                {
                                    "сustomer_subscriptioncustomerid": 2505,
                                    "сustomer_addr1": "Vinces Road",
                                    "сustomer_addr2": null,
                                    "сustomer_addr3": null,
                                    "сustomer_city": "Diss, Norfolk",
                                    "сustomer_state": null,
                                    "сustomer_zip": "IP22 4YT",
                                    "сustomer_country": "GB",
                                }
                            ],
                            billingAccount: []
                        },
                    },
                    "5914": {
                        "subscriptionid": 5914,
                        "subscriptioncustomer": 2505,

                        "groupsIdValues": { 'сustomer': [2505], billingAccount: [] },
                        "groupedData": {
                            'сustomer': [
                                {
                                    "сustomer_subscriptioncustomerid": 2505,
                                    "сustomer_addr1": "Vinces Road",
                                    "сustomer_addr2": null,
                                    "сustomer_addr3": null,
                                    "сustomer_city": "Diss, Norfolk",
                                    "сustomer_state": null,
                                    "сustomer_zip": "IP22 4YT",
                                    "сustomer_country": "GB",
                                }
                            ],
                            billingAccount: []
                        },
                    },
                    "5956": {
                        "subscriptionid": 5956,
                        "subscriptioncustomer": 2505,

                        "groupsIdValues": { 'сustomer': [2505], billingAccount: [] },
                        "groupedData": {
                            'сustomer': [
                                {
                                    "сustomer_subscriptioncustomerid": 2505,
                                    "сustomer_addr1": "Vinces Road",
                                    "сustomer_addr2": null,
                                    "сustomer_addr3": null,
                                    "сustomer_city": "Diss, Norfolk",
                                    "сustomer_state": null,
                                    "сustomer_zip": "IP22 4YT",
                                    "сustomer_country": "GB",
                                }
                            ],
                            billingAccount: []
                        },
                    },
                    "5930": {
                        "subscriptionid": 5930,
                        "subscriptioncustomer": 2689,

                        "groupsIdValues": { 'сustomer': [2689], billingAccount: [] },
                        "groupedData": {
                            'сustomer': [
                                {
                                    "сustomer_subscriptioncustomerid": 2689,
                                    "сustomer_addr1": "Units 36 and 37",
                                    "сustomer_addr2": "2861 Sherwood Heights Drive #36-37",
                                    "сustomer_addr3": null,
                                    "сustomer_city": "Oakville",
                                    "сustomer_state": "ON",
                                    "сustomer_zip": "L6J7K1",
                                    "сustomer_country": "CA",
                                }
                            ],
                            billingAccount: []
                        },
                    },
                    "5923": {
                        "subscriptionid": 5923,
                        "subscriptioncustomer": 3116,

                        "groupsIdValues": { 'сustomer': [3116], billingAccount: [9532] },
                        "groupedData": {
                            'сustomer': [
                                {
                                    "сustomer_subscriptioncustomerid": 3116,
                                    "сustomer_addr1": "2709 Commerce Way",
                                    "сustomer_addr2": null,
                                    "сustomer_addr3": null,
                                    "сustomer_city": "Philadelphia",
                                    "сustomer_state": "PA",
                                    "сustomer_zip": "19154",
                                    "сustomer_country": "US",
                                }
                            ],
                            billingAccount: [
                                {
                                    "billingaccount_billingaccountid": 9532,
                                    "billingaccount_billingaccountcustomer": 3116,
                                    "billingaccount_addr1": "2709 Commerce Way",
                                    "billingaccount_addr2": null,
                                    "billingaccount_addr3": null,
                                    "billingaccount_city": "Philadelphia",
                                    "billingaccount_state": "PA",
                                    "billingaccount_zip": "19154",
                                    "billingaccount_country": "US"
                                }
                            ]
                        },
                    },
                    "5911": {
                        "subscriptionid": 5911,
                        "subscriptioncustomer": 3116,

                        "groupsIdValues": { 'сustomer': [3116], billingAccount: [9532] },
                        "groupedData": {
                            'сustomer': [
                                {
                                    "сustomer_subscriptioncustomerid": 3116,
                                    "сustomer_addr1": "2709 Commerce Way",
                                    "сustomer_addr2": null,
                                    "сustomer_addr3": null,
                                    "сustomer_city": "Philadelphia",
                                    "сustomer_state": "PA",
                                    "сustomer_zip": "19154",
                                    "сustomer_country": "US",
                                }
                            ],
                            billingAccount: [
                                {
                                    "billingaccount_billingaccountid": 9532,
                                    "billingaccount_billingaccountcustomer": 3116,
                                    "billingaccount_addr1": "2709 Commerce Way",
                                    "billingaccount_addr2": null,
                                    "billingaccount_addr3": null,
                                    "billingaccount_city": "Philadelphia",
                                    "billingaccount_state": "PA",
                                    "billingaccount_zip": "19154",
                                    "billingaccount_country": "US"
                                }
                            ]
                        },
                    },
                    "5971": {
                        "subscriptionid": 5971,
                        "subscriptioncustomer": 3116,

                        "groupsIdValues": { 'сustomer': [3116], billingAccount: [9532] },
                        "groupedData": {
                            'сustomer': [
                                {
                                    "сustomer_subscriptioncustomerid": 3116,
                                    "сustomer_addr1": "2709 Commerce Way",
                                    "сustomer_addr2": null,
                                    "сustomer_addr3": null,
                                    "сustomer_city": "Philadelphia",
                                    "сustomer_state": "PA",
                                    "сustomer_zip": "19154",
                                    "сustomer_country": "US",
                                }
                            ],
                            billingAccount: [
                                {
                                    "billingaccount_billingaccountid": 9532,
                                    "billingaccount_billingaccountcustomer": 3116,
                                    "billingaccount_addr1": "2709 Commerce Way",
                                    "billingaccount_addr2": null,
                                    "billingaccount_addr3": null,
                                    "billingaccount_city": "Philadelphia",
                                    "billingaccount_state": "PA",
                                    "billingaccount_zip": "19154",
                                    "billingaccount_country": "US"
                                }
                            ]
                        },
                    },
                    "6015": {
                        "subscriptionid": 6015,
                        "subscriptioncustomer": 3116,

                        "groupsIdValues": { 'сustomer': [3116], billingAccount: [9532] },
                        "groupedData": {
                            'сustomer': [
                                {
                                    "сustomer_subscriptioncustomerid": 3116,
                                    "сustomer_addr1": "2709 Commerce Way",
                                    "сustomer_addr2": null,
                                    "сustomer_addr3": null,
                                    "сustomer_city": "Philadelphia",
                                    "сustomer_state": "PA",
                                    "сustomer_zip": "19154",
                                    "сustomer_country": "US",
                                }
                            ],
                            billingAccount: [
                                {
                                    "billingaccount_billingaccountid": 9532,
                                    "billingaccount_billingaccountcustomer": 3116,
                                    "billingaccount_addr1": "2709 Commerce Way",
                                    "billingaccount_addr2": null,
                                    "billingaccount_addr3": null,
                                    "billingaccount_city": "Philadelphia",
                                    "billingaccount_state": "PA",
                                    "billingaccount_zip": "19154",
                                    "billingaccount_country": "US"
                                }
                            ]
                        },
                    },
                    "5967": {
                        "subscriptionid": 5967,
                        "subscriptioncustomer": 3515,

                        "groupsIdValues": { 'сustomer': [3515], billingAccount: [] },
                        "groupedData": {
                            'сustomer': [
                                {
                                    "сustomer_subscriptioncustomerid": 3515,
                                    "сustomer_addr1": "Siemensstr.14",
                                    "сustomer_addr2": "73066 Uhingen",
                                    "сustomer_addr3": null,
                                    "сustomer_city": null,
                                    "сustomer_state": null,
                                    "сustomer_zip": null,
                                    "сustomer_country": "DE",
                                }
                            ],
                            billingAccount: []
                        },
                    },
                    "504": {
                        "subscriptionid": 504,
                        "subscriptioncustomer": 11826,
                        "groupsIdValues": { 'сustomer': [11826], billingAccount: [1404] },
                        "groupedData": {
                            'сustomer': [
                                {
                                    "сustomer_subscriptioncustomerid": 11826,
                                    "сustomer_addr1": "Via Nobel, 10 39 421 57",
                                    "сustomer_addr2": null,
                                    "сustomer_addr3": null,
                                    "сustomer_city": "Noventa di Piave",
                                    "сustomer_state": "Venezia",
                                    "сustomer_zip": "30020",
                                    "сustomer_country": "IT",
                                }
                            ],
                            billingAccount: [
                                {
                                    "billingaccount_billingaccountid": 1404,
                                    "billingaccount_billingaccountcustomer": 11826,
                                    "billingaccount_addr1": "Via Nobel, 10 39 421 57",
                                    "billingaccount_addr2": null,
                                    "billingaccount_addr3": null,
                                    "billingaccount_city": "Noventa di Piave",
                                    "billingaccount_state": "Venezia",
                                    "billingaccount_zip": "30020",
                                    "billingaccount_country": "IT"
                                }
                            ]
                        },
                    },
                    "6016": {
                        "subscriptionid": 6016,
                        "subscriptioncustomer": 11826,

                        "groupsIdValues": { 'сustomer': [11826], billingAccount: [1404] },
                        "groupedData": {
                            'сustomer': [
                                {
                                    "сustomer_subscriptioncustomerid": 11826,
                                    "сustomer_addr1": "Via Nobel, 10 39 421 57",
                                    "сustomer_addr2": null,
                                    "сustomer_addr3": null,
                                    "сustomer_city": "Noventa di Piave",
                                    "сustomer_state": "Venezia",
                                    "сustomer_zip": "30020",
                                    "сustomer_country": "IT",
                                }
                            ],
                            billingAccount: [
                                {
                                    "billingaccount_billingaccountid": 1404,
                                    "billingaccount_billingaccountcustomer": 11826,
                                    "billingaccount_addr1": "Via Nobel, 10 39 421 57",
                                    "billingaccount_addr2": null,
                                    "billingaccount_addr3": null,
                                    "billingaccount_city": "Noventa di Piave",
                                    "billingaccount_state": "Venezia",
                                    "billingaccount_zip": "30020",
                                    "billingaccount_country": "IT"
                                }
                            ]
                        },
                    }
                }
            )
        });
    });

});