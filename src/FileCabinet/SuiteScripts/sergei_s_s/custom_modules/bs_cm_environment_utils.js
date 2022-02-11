/**
 * @NApiVersion 2.1
 */
define(['N/search'],
    (search) => {
        const prepareCustomEnvironmentSettingsSearch = () => {
            return search.create({
                type: 'customrecord_bs_enviroment_setting',
                id: 'customsearch_suitebilling_settings',
                filters: [],
                columns: [
                    search.createColumn({name: 'name'}),
                    search.createColumn({name: 'custrecord_bs_enviroment_setting_value'}),
                ]
            });
        }

        return {
            prepareCustomEnvironmentSettingsSearch
        };
    });
