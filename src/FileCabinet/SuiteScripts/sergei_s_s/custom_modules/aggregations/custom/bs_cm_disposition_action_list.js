/**
 * @NApiVersion 2.1
 */
define(['N/query'],
    /**
 * @param{query} query
 */
    (query) => {
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

        return { loadDispositionActionForSelect }
    });
