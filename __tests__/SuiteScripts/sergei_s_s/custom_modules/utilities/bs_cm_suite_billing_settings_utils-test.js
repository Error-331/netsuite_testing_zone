import {
    getNetworkTypeStrByTypeId,
} from './../../../../../src/FileCabinet/SuiteScripts/sergei_s_s/custom_modules/utilities/bs_cm suite_billing_settings_utils';

describe('Custom modules / utilities / suite billing settings utils', () => {
    describe('getNetworkTypeStrByTypeId function tests', () => {
        it('it should return "cloud" type...', () => {
            expect(getNetworkTypeStrByTypeId('1')).toEqual('cloud');
            expect(getNetworkTypeStrByTypeId(1)).toEqual('cloud');
        });

        it('it should return "com" type...', () => {
            expect(getNetworkTypeStrByTypeId('2')).toEqual('com');
            expect(getNetworkTypeStrByTypeId(2)).toEqual('com');
        });

        it('it should return "bsnee" type...', () => {
            expect(getNetworkTypeStrByTypeId('6')).toEqual('bsnee');
            expect(getNetworkTypeStrByTypeId(6)).toEqual('bsnee');
        });

        it('it should return null...', () => {
            expect(getNetworkTypeStrByTypeId('8')).toBeNull();
            expect(getNetworkTypeStrByTypeId(8)).toBeNull();
        });
    });
});