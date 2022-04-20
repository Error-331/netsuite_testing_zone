import { getCountryCode2, findCountryDataByName } from './../../../../../src/FileCabinet/SuiteScripts/sergei_s_s/custom_modules/entities/bs_cm_country';

describe('Custom modules / entities / country tests', () => {
    describe('findCountryDataByName function tests', () => {
        it('it should find correct country data (case 1)...', () => {
            const country = findCountryDataByName('Kazakhstan');

            expect(country.text).toEqual('Kazakhstan');
            expect(country.value).toEqual('KZ');
        });

        it('it should find correct country data (case 2)...', () => {
            const country = findCountryDataByName('sint maarten');

            expect(country.text).toEqual('Sint Maarten');
            expect(country.value).toEqual('SX');
        });

        it('it should find correct country data (case 3)...', () => {
            const country = findCountryDataByName('CONGO, DEMOCRATIC REPUBLIC OF');

            expect(country.text).toEqual('Congo, Democratic Republic of');
            expect(country.value).toEqual('CD');
        });

        it('it should not find correct country data (case 1)...', () => {
            const country = findCountryDataByName('Kazakh');
            expect(country).toBeNull();
        });

        it('it should not find correct country data (case 2)...', () => {
            const country = findCountryDataByName('United States of America');
            expect(country).toBeNull();
        });

        it('it should not find correct country and throw error...', () => {
            const test = () => findCountryDataByName('');
            expect(test).toThrowError();
        });
    });

    describe('getCountryCode2 function tests', () => {
        it('it return correct country code - two letter (case 1)...', () => {
            const country = findCountryDataByName('Kazakhstan');
            expect(getCountryCode2(country)).toEqual('KZ');
        });

        it('it return correct country code - two letter (case 2)...', () => {
            const country = findCountryDataByName('sint maarten');
            expect(getCountryCode2(country)).toEqual('SX');
        });

        it('it return correct country code - two letter (case 3)...', () => {
            const country = findCountryDataByName('CONGO, DEMOCRATIC REPUBLIC OF');
            expect(getCountryCode2(country)).toEqual('CD');
        });
    });
});