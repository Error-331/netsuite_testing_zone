import {
    extractIdValueFromRow,
    extractGroupIdsFromDataKeys,
    prepareGroupsMetaData,
    extractGroupedDataFromRow,

    groupSQLJoinedDataNotSorted,
    groupSQLJoinedDataSortedArray,
    groupSQLJoinedOrderedDataAsArray,
} from './../../../../../../src/FileCabinet/SuiteScripts/sergei_s_s/custom_modules/utilities/sql/bs_cm_join_operations';

const testSubscriptionsData1 = require('./left_outer_inner_join_subscription1.json');
const {
    unorderedObjectData1,
    orderedArrayData1,
    orderedArrayData1WithoutServiceInfo,
    orderedArrayData1WithoutServiceInfoNotOtM,
} = require('./bs_cm_join_operations_tests_data');

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

    describe('groupSQLJoinedDataNotSorted function tests', () => {
        it('it should correctly group joined SQL data (case 1 - real data)...', () => {
            const groupedData = groupSQLJoinedDataNotSorted(testSubscriptionsData1, groupsData1);
            expect(groupedData).toEqual(unorderedObjectData1);
        });
    });

    describe('groupSQLJoinedDataSortedArray function tests', () => {
        it('it should correctly group joined SQL data and present it as array (case 1 - real data)...', () => {
            const groupedData = groupSQLJoinedDataSortedArray(testSubscriptionsData1, groupsData1);
            expect(groupedData).toEqual(orderedArrayData1);
        });
    });

    describe('groupSQLJoinedOrderedDataAsArray function tests', () => {
        it('it should correctly group joined SQL data and present it as array without service data (case 1 - real data, regular version) ...', () => {
            const groupedData = groupSQLJoinedOrderedDataAsArray(testSubscriptionsData1, groupsData1, { lightVersion: false });
            expect(groupedData).toEqual(orderedArrayData1);
        });

        it('it should correctly group joined SQL data and present it as array without service data (case 1 - real data, light version, one-to-many) ...', () => {
            const groupedData = groupSQLJoinedOrderedDataAsArray(testSubscriptionsData1, groupsData1, { lightVersion: true });
            expect(groupedData).toEqual(orderedArrayData1WithoutServiceInfo);
        });

        it('it should correctly group joined SQL data and present it as array without service data (case 1 - real data, light version, not one-to-many) ...', () => {
            const groupedData = groupSQLJoinedOrderedDataAsArray(testSubscriptionsData1, groupsData1, { lightVersion: true, oneToMany: false });
            expect(groupedData).toEqual(orderedArrayData1WithoutServiceInfoNotOtM);
        });
    });
});