import { findStateDataByFullName } from './../../../../../src/FileCabinet/SuiteScripts/sergei_s_s/custom_modules/entities/bs_cm_state';

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

describe('Custom modules / entities / states tests', () => {
    describe('findStateDataByFullName function tests', () => {
        it('it should find state data (case 1)', () => {
            const data = findStateDataByFullName('Minnesota');

            expect(data.id).toEqual(23);
            expect(data.shortname).toEqual('MN');
            expect(data.fullname).toEqual('Minnesota');
        });

        it('it should find state data (case 2)', () => {
            const data = findStateDataByFullName('minnesota');

            expect(data.id).toEqual(23);
            expect(data.shortname).toEqual('MN');
            expect(data.fullname).toEqual('Minnesota');
        });

        it('it should not find state data (case 1)', () => {
            const data = findStateDataByFullName('Minnesotas');
            expect(data).toBeNull();
        });

        it('it should not find state data (case 2)', () => {
            const data = findStateDataByFullName('minnesotas');
            expect(data).toBeNull();
        });

        it('it should not find state data and throw error (case 2)', () => {
            const test1 = () => findStateDataByFullName();

            expect(test1).toThrowError();
        });
    });
});