/**
 * @NApiVersion 2.1
 */
define([
        './../../utilities/bs_cm suite_billing_settings_utils',
        './../../utilities/bs_cm_array_utils',
    ],
    
    (
        { initSuiteBillingBSNSettings },
        { findIdxInObjectsArrayByKeyValue },
    ) => {

        function getEmailTemplateByCode(code, type){
            sbBSNSettings = initSuiteBillingBSNSettings();

            const res = findIdxInObjectsArrayByKeyValue(code, sbBSNSettings.emailTemplates, 'code');
            return res == -1 ? 0 : parseInt(sbBSNSettings.emailTemplates[res][type]);
        }

        return {
            getEmailTemplateByCode
        }

    });
