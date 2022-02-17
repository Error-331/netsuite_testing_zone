import {
    findIdxInObjectsArrayByKeyValue,
} from './../../../../../src/FileCabinet/SuiteScripts/sergei_s_s/custom_modules/utilities/bs_cm_array_utils';

const testArray1 = [
    {
        id: 35,
        value: 'test 1'
    },
    {
        id: 478,
        value: 'test 2'
    },
    {
        id: 5,
        value: 'test 3'
    },
];

describe('Custom modules / utilities / search utilities tests', () => {
    it('it should find proper item index in objects array (case 1)', () => {
        const foundIdx = findIdxInObjectsArrayByKeyValue(5, testArray1, 'id');
        expect(foundIdx).toBe(2);
    });

    it('it should find proper item index in objects array (case 2)', () => {
        const foundIdx = findIdxInObjectsArrayByKeyValue('test 1', testArray1, 'value');
        expect(foundIdx).toBe(0);
    });

    it('it should not find proper item index in objects array (case 1)', () => {
        const foundIdx = findIdxInObjectsArrayByKeyValue(75, testArray1, 'id');
        expect(foundIdx).toBe(-1);
    });

    it('it should not find proper item index in objects array (case 2)', () => {
        const foundIdx = findIdxInObjectsArrayByKeyValue('test 12', testArray1, 'value');
        expect(foundIdx).toBe(-1);
    });
});