/**
 * @NApiVersion 2.1
 */
define([
        'N/runtime',
        './../custom_modules/utilities/bs_cm_general_utils'
    ],
    /**
 * @param{runtime} runtime
 */
    (
        runtime,
        { logExecution }
    ) => {
        function printCurrentScriptRemainingUsage() {
            const scriptObj = runtime.getCurrentScript();
            logExecution('DEBUG', 'Units Left', scriptObj.getRemainingUsage());
        }

        return {
            printCurrentScriptRemainingUsage,
        }

    });
