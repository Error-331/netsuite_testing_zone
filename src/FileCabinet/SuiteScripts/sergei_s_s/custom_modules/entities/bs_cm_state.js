/**
 * @NApiVersion 2.1
 */
define(['N/query', './../utilities/bs_cm_general_utils'],
    (query, { isNullOrEmpty, oneTimeMemoizer }) => {
        function loadStatesData() {
            const suiteQLQuery = `
                SELECT
                    State.ID,
                    State.ShortName,
                    State.FullName,
                    State.Country
                FROM
                    State
                ORDER BY
                    State.ShortName
            `;

            const resultSet = query.runSuiteQL(
                {
                    query: suiteQLQuery,
                }
            );

            return resultSet.asMappedResults();
        }

        const loadStatesDataMemoized = oneTimeMemoizer(loadStatesData);

        function findStateDataByFullName(stateName) {
            if (isNullOrEmpty(stateName)) {
                throw new Error('State name is not set - cannot find state data')
            }

            const statesData = loadStatesDataMemoized();
            const preparedStateName = stateName.toLowerCase();

            for (const stateData of statesData) {
                const stateNameFromStore = stateData.fullname.toLowerCase();

                if (preparedStateName === stateNameFromStore) {
                    return stateData;
                }
            }

            return null;
        }

        return {
            loadStatesData,
            loadStatesDataMemoized,
            findStateDataByFullName,
        };
    });
