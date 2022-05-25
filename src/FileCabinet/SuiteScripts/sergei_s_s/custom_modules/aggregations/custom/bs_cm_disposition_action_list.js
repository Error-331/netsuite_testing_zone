/**
 * @NApiVersion 2.1
 */
define([
    'N/query',
    './../../utilities/bs_cm_general_utils'
    ],
    /**
 * @param{query} query
 */
    (query, { isNullOrEmpty, toInt }) => {
        function loadDispositionActionForSelect() {
            let suiteQLQuery = `
                SELECT id, name FROM customlistbs_cl_disposition_action
           `;

            const resultSet = query.runSuiteQL(
                {
                    query: suiteQLQuery,
                }
            );

            return resultSet.asMappedResults();
        }

        function loadDispositionActionNameById(id) {
            if (isNullOrEmpty(id)) {
                throw new Error('Id is not set - cannot load disposition action records');
            }

            const dispositionActions = loadDispositionActionForSelect();

            if (isNullOrEmpty(dispositionActions)) {
                throw new Error('Cannot load disposition action records');
            }

            id = toInt(id);
            const dispositionRecord = dispositionActions.find(actionRecord => actionRecord.id === id);

            if (isNullOrEmpty(dispositionRecord)) {
                throw new Error('Cannot find disposition action record');
            }

            return dispositionRecord.name;
        }

        return { loadDispositionActionForSelect, loadDispositionActionNameById }
    });
