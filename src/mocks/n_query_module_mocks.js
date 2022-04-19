define(['lodash'], ({ clone }) => {
    const mockedMappedResultsDefaultValue = {};

    let mockedMappedResults;

    function asMappedResults() {
        return mockedMappedResults;
    }

    function runSuiteQL() {
        return {
            asMappedResults
        }
    }

    function setMockMappedResults(newResults) {
        mockedMappedResults = newResults;
    }

    function resetMockData() {
        mockedMappedResults = clone(mockedMappedResultsDefaultValue);
    }

    return {
        runSuiteQL,

        setMockMappedResults,
        resetMockData,
    }
});

