/**
 * @NApiVersion 2.1
 */
define([
    './../data/regional/bs_cm_countries',
    './../utilities/bs_cm_general_utils',
    './../utilities/bs_cm_functional_utils'
    ],
    
    (
        { COUNTRY_LIST },
        { isNullOrEmpty },
        { lens, view }
        ) => {

        const countryCode2Lens = lens(
            (country) => country?.value,
            (code, country) => {
                country.value = code;
                return country;
            }
        );

        const getCountryCode2 = (countryObj) => {
            return view(countryCode2Lens, countryObj);
        }

        function findCountryDataByName(countryName) {
            if (isNullOrEmpty(countryName)) {
                throw new Error('Country name is not set - cannot find country data')
            }

            const preparedCountryName = countryName.toLowerCase();

            for (const countryData of COUNTRY_LIST) {
                const countryNameFromStore = countryData.text.toLowerCase();

                if (preparedCountryName === countryNameFromStore) {
                    return countryData;
                }
            }

            return null;
        }

        return {
            getCountryCode2,
            findCountryDataByName,
        }
    });
