/**
 * @NApiVersion 2.1
 */
define([
        'N/runtime',
        'N/url',
        './bs_cm_general_utils'
    ],
    /**
 * @param{runtime} runtime
 */
    (
        runtime,
        url,
        { logExecution }
    ) => {
        function getScriptParameterByName(name) {
            const scriptObj = runtime.getCurrentScript();
            return scriptObj.getParameter({ name });
        }

        function getCurrentEmployeeId() {
            const { id } = runtime.getCurrentUser();
            return id;
        }

        function getCurrentUserName() {
            const { name } = runtime.getCurrentUser();
            return name;
        }

        function getCurrentUserInfo() {
            const { id, name } = runtime.getCurrentUser();
            return { id, name };
        }

        function getCurrentEmployeeName() {
            const { name } = runtime.getCurrentUser();
            return name;
        }

        function getScriptURLPathQuery(scriptId, deploymentId, returnExternalURL = true) {
            return url.resolveScript({
                scriptId,
                deploymentId,
                returnExternalURL,
            });
        }

        function getScriptCurrentURLPathQuery() {
            const currentScript = runtime.getCurrentScript();
            return getScriptURLPathQuery(currentScript.id, currentScript.deploymentId, true);
        }

        function getScriptCurrentURLPath() {
            const currentQueryPath = getScriptCurrentURLPathQuery();
            const sepPosition = currentQueryPath.indexOf('?');

            if (sepPosition !== -1) {
                return currentQueryPath.substr(0, sepPosition);
            } else {
                return currentQueryPath;
            }
        }

        function printCurrentScriptRemainingUsage() {
            const scriptObj = runtime.getCurrentScript();
            logExecution('DEBUG', 'Units Left', scriptObj.getRemainingUsage());
        }

        return {
            getScriptParameterByName,
            getCurrentEmployeeId,
            getCurrentUserName,
            getCurrentUserInfo,
            getCurrentEmployeeName,
            getScriptURLPathQuery,
            getScriptCurrentURLPathQuery,
            getScriptCurrentURLPath,
            printCurrentScriptRemainingUsage,
        }
    });
