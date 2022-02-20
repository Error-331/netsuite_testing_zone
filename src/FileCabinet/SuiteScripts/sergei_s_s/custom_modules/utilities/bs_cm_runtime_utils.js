/**
 * @NApiVersion 2.1
 */
define([
        'N/runtime',
        './bs_cm_general_utils'
    ],
    /**
 * @param{runtime} runtime
 */
    (
        runtime,
        { logExecution }
    ) => {
        function getScriptParameterByName(name) {
            const scriptObj = runtime.getCurrentScript();
            return scriptObj.getParameter({ name });
        }

        function printCurrentScriptRemainingUsage() {
            const scriptObj = runtime.getCurrentScript();
            logExecution('DEBUG', 'Units Left', scriptObj.getRemainingUsage());
        }

        return {
            getScriptParameterByName,
            printCurrentScriptRemainingUsage,
        }
    });
