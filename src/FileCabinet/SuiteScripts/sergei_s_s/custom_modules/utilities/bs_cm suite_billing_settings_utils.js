/**
 * @NApiVersion 2.1
 */
define(['./../bs_cm_environment_utils', './bs_cm_general_utils'],
    (
        { prepareCustomEnvironmentSettingsSearch },
        { oneTimeMemoizer, toInt }
    ) => {
        // constants
        const priceLevelMSRP = '0';
        const priceLevel25 = '9';
        const priceLevel30 = '10';
        const priceLevel35 = '11';
        const priceLevel40 = '13';
        const priceLevel45 = '15';
        const priceLevelCustom = '-1';
        const priceLevelSupport = 's';

        const netTypeCloud = 1;
        const netTypeCom = 2;
        const netTypeBSNEE = 6;

        const invoiceForm = 118;

        // implementation
        const initSuiteBillingBSNEnvSettings = (customEnvironmentSettings) => {
            return {
                bsn1yrItemNum: parseInt(customEnvironmentSettings['subscription_plan_item_2']) || 849,
                bsnc1yrItemNum: parseInt(customEnvironmentSettings['subscription_plan_item']) || 850,
                bsnee1yrItemNum: parseInt(customEnvironmentSettings['subscription_plan_item_3']) || 884,
                bsn1yrItemText: customEnvironmentSettings['subscription_plan_item_2'] || '849',
                bsnc1yrItemText: customEnvironmentSettings['subscription_plan_item'] || '850',
                bsnee1yrItemText: customEnvironmentSettings['subscription_plan_item_3'] || '884',
                bsn1yrPlanNum: parseInt(customEnvironmentSettings['subscription_plan_2']) || 851,
                bsnc1yrPlanNum: parseInt(customEnvironmentSettings['subscription_plan']) || 888,
                bsnee1yrPlanNum: parseInt(customEnvironmentSettings['subscription_plan_3']) || 889,
                //bsncTimeCredit: parseInt(settings['subscription_plan_itemid_2']) || 815,

                billingSchedule12mAnniversary: 7,

                emailTemplates:[
                    {
                        code: '-30p',
                        customer: customEnvironmentSettings['email_tpl_m30_prepay_customer'],
                        enduser: customEnvironmentSettings['email_tpl_m30_prepay_end_user'],
                        sales: 0,
                        searchId: 80827/*customsearch_subscr_email_m30_prepay*/
                    },
                    {
                        code: '-30t',
                        customer: customEnvironmentSettings['email_tpl_m30_terms_customer'],
                        enduser: customEnvironmentSettings['email_tpl_m30_terms_end_user'],
                        sales: 0,
                        bsnee: 503/*'custemailtmpl_sb_bsnee_renew_terms_m30_cust'*/,
                        bsneesales: 504/*'custemailtmpl_sb_bsnee_renew_terms_m30_sales'*/,
                        searchId: 80820/*customsearch_subscr_email_m30_terms*/
                    },
                    {
                        code: '-15p',
                        customer: customEnvironmentSettings['email_tpl_m30_prepay_customer'],
                        enduser: customEnvironmentSettings['email_tpl_m30_prepay_end_user'],
                        sales: 0,
                        searchId: 80829/*customsearch_subscr_email_m15_prepay*/
                    },
                    {
                        code: '-15t',
                        customer: customEnvironmentSettings['email_tpl_m30_terms_customer'],
                        enduser: customEnvironmentSettings['email_tpl_m30_terms_end_user'],
                        sales: 0,
                        bsnee: 503/*'custemailtmpl_sb_bsnee_renew_terms_m30_cust'*/,
                        bsneesales: 504/*'custemailtmpl_sb_bsnee_renew_terms_m30_sales'*/,
                        searchId: 80828/*customsearch_subscr_email_m15_terms*/
                    },
                    {
                        code: '-7p',
                        customer: customEnvironmentSettings['email_tpl_m30_prepay_customer'],
                        enduser: customEnvironmentSettings['email_tpl_m30_prepay_end_user'],
                        sales: 0,
                        searchId: 80831/*customsearch_subscr_email_m7_prepay*/
                    },
                    {
                        code: '-7t',
                        customer: customEnvironmentSettings['email_tpl_m30_terms_customer'],
                        enduser: customEnvironmentSettings['email_tpl_m30_terms_end_user'],
                        sales: 500,
                        bsnee: 503/*'custemailtmpl_sb_bsnee_renew_terms_m30_cust'*/,
                        bsneesales: 504/*'custemailtmpl_sb_bsnee_renew_terms_m30_sales'*/,
                        searchId: 80830/*customsearch_subscr_email_m7_terms*/
                    },
                    {
                        code: '0p',
                        customer: customEnvironmentSettings['email_tpl_0_prepay_customer'],
                        enduser: customEnvironmentSettings['email_tpl_0_prepay_end_user'],
                        sales: 0, searchId: 80833/*customsearch_subscr_email_0_prepay*/
                    },
                    {
                        code: '0t',
                        customer: customEnvironmentSettings['email_tpl_0_terms_customer'],
                        enduser: customEnvironmentSettings['email_tpl_0_terms_end_user'],
                        sales: 501,
                        bsnee: 506/*'custemailtmpl_sb_bsnee_renew_terms_m30_cust'*/,
                        bsneesales: 505/*'custemailtmpl_sb_bsnee_renew_terms_m30_sales'*/,
                        searchId: 80832/*customsearch_subscr_email_0_terms*/
                    },
                    {
                        code: '7p',
                        customer: customEnvironmentSettings['email_tpl_7_prepay_customer'],
                        enduser: customEnvironmentSettings['email_tpl_7_prepay_end_user'],
                        sales: 0,
                        searchId: 80822/*'customsearch_subscr_email_7_prepay'*/
                    },
                    {
                        code: '7t',
                        customer: customEnvironmentSettings['email_tpl_7_terms_customer'],
                        enduser: customEnvironmentSettings['email_tpl_7_terms_end_user'],
                        sales: 502,
                        searchId: 80824/*'customsearch_subscr_email_7_terms'*/
                    },
                    {
                        code: '30p',
                        customer: customEnvironmentSettings['email_tpl_30_prepay_customer'],
                        enduser: customEnvironmentSettings['email_tpl_30_prepay_end_user'],
                        sales: 0,
                        searchId: 80826/*customsearch_subscr_email_30_prepay*/
                    },
                    {
                        code: '30t',
                        customer: customEnvironmentSettings['email_tpl_30_terms_customer'],
                        enduser: customEnvironmentSettings['email_tpl_30_terms_end_user'],
                        sales: 0,
                        searchId: 80825/*customsearch_subscr_email_30_terms*/
                    },
                    {
                        code: 'Ssp',
                        customer: customEnvironmentSettings['email_tpl_suspend_customer'],
                        enduser: customEnvironmentSettings['email_tpl_suspend_end_user'],
                        sales: 0,
                        searchId: 80825/*customsearch_subscr_email_30_terms*/
                    },
                ],

                priceBooks: [
                    {
                        'pricelevel': priceLevelMSRP,
                        'pricebook': customEnvironmentSettings['pricebook_msrp_2']
                    },
                    {
                        'pricelevel': priceLevel25,
                        'pricebook': customEnvironmentSettings['pricebook_tier1_2']
                    },
                    {
                        'pricelevel': priceLevel30,
                        'pricebook': customEnvironmentSettings['pricebook_tier2_2']
                    },
                    {
                        'pricelevel': priceLevel35,
                        'pricebook': customEnvironmentSettings['pricebook_tier3_2']
                    },
                    {
                        'pricelevel': priceLevel40,
                        'pricebook': customEnvironmentSettings['pricebook_tier4_2']
                    },
                    {
                        'pricelevel': priceLevel45,
                        'pricebook': customEnvironmentSettings['pricebook_tier5_2']
                    },
                    {
                        'pricelevel': priceLevelCustom,
                        'pricebook': customEnvironmentSettings['pricebook_custom_2']
                    },
                    {
                        'pricelevel': priceLevelSupport,
                        'pricebook': customEnvironmentSettings['pricebook_support_2']
                    },
                ],

                priceBooksCL: [
                    {
                        'pricelevel': priceLevelMSRP,
                        'pricebook': customEnvironmentSettings['pricebook_msrp']
                    },
                    {
                        'pricelevel': priceLevel25,
                        'pricebook': customEnvironmentSettings['pricebook_tier1']
                    },
                    {
                        'pricelevel': priceLevel30,
                        'pricebook': customEnvironmentSettings['pricebook_tier2']
                    },
                    {
                        'pricelevel': priceLevel35,
                        'pricebook': customEnvironmentSettings['pricebook_tier3']
                    },
                    {
                        'pricelevel': priceLevel40,
                        'pricebook': customEnvironmentSettings['pricebook_tier4']
                    },
                    {
                        'pricelevel': priceLevel45,
                        'pricebook': customEnvironmentSettings['pricebook_tier5']
                    },
                    {
                        'pricelevel': priceLevelCustom,
                        'pricebook': customEnvironmentSettings['pricebook_custom']
                    },
                    {
                        'pricelevel': priceLevelSupport,
                        'pricebook': customEnvironmentSettings['pricebook_support']
                    },
                ],

                bsnServer: customEnvironmentSettings['sb_com_connection'],
                bsnConnection: {},

                bsncServer: customEnvironmentSettings['sb_cloud_connection'],
                bsncConnection: {},
            }
        };

        const initSuiteBillingBSNServerEnvironmentSettings = (customEnvironmentSettings, suiteBillingBSNEnvSettings, bsnSuffix) => {
            const settingsPostfixes = ['host', 'user', 'pass', 'endp', 'soap', 'actn'];
            let settingsSuffix = null;

            switch(suiteBillingBSNEnvSettings[`${bsnSuffix}Server`]) {
                case 'prod':
                    settingsSuffix = `sbss_${bsnSuffix}_prod_`;
                    break;
                case 'stage':
                    settingsSuffix = `sbss_${bsnSuffix}_stage_`;
                    break;
                case 'qa':
                    settingsSuffix = `sbss_${bsnSuffix}_qa_`;
                    break;
                default:
                    break;
            }

            if (settingsSuffix !== null) {
                for (const settingsPostfix of settingsPostfixes) {
                    suiteBillingBSNEnvSettings[`${bsnSuffix}Connection`][settingsPostfix] = customEnvironmentSettings[`${settingsSuffix}${settingsPostfix}`];
                }
            }

            return suiteBillingBSNEnvSettings;
        };

        const initSuiteBillingBSNSettings = () => {
            const customEnvironmentSettings = {};

            const customEnvironmentSettingsSearch = prepareCustomEnvironmentSettingsSearch();
            customEnvironmentSettingsSearch.run().each((result) => {
                const name = result.getValue({ name: 'name' });
                const value = result.getValue({ name: 'custrecord_bs_enviroment_setting_value' });

                customEnvironmentSettings[name] = value;
                return true;
            });

            let suiteBillingBSNEnvSettings = initSuiteBillingBSNEnvSettings(customEnvironmentSettings);
            suiteBillingBSNEnvSettings = initSuiteBillingBSNServerEnvironmentSettings(customEnvironmentSettings, suiteBillingBSNEnvSettings, 'bsn');
            suiteBillingBSNEnvSettings = initSuiteBillingBSNServerEnvironmentSettings(customEnvironmentSettings, suiteBillingBSNEnvSettings, 'bsnc');

            return suiteBillingBSNEnvSettings;
        }

        const getCredsBSNC = () => {
            const { bsncConnection: { host, user, pass, endp, soap, actn } } = initSuiteBillingBSNSettings();
            return { host, user, pass, endp, soap, actn };
        };

        const getNetworkTypeStrByTypeId = (networkTypeId) => {
            networkTypeId = toInt(networkTypeId);

            switch (networkTypeId) {
                case netTypeCloud:
                    return 'cloud';
                case netTypeCom:
                    return 'com';
                case netTypeBSNEE:
                    return 'bsnee';
                default:
                    return null;
            }
        };

        return {
            priceLevelMSRP,
            priceLevel25,
            priceLevel30,
            priceLevel35,
            priceLevel40,
            priceLevel45,
            priceLevelCustom,
            priceLevelSupport,

            netTypeCloud,
            netTypeCom,
            netTypeBSNEE,

            invoiceForm,

            initSuiteBillingBSNEnvSettings: oneTimeMemoizer(initSuiteBillingBSNEnvSettings),
            initSuiteBillingBSNServerEnvironmentSettings: oneTimeMemoizer(initSuiteBillingBSNServerEnvironmentSettings),
            initSuiteBillingBSNSettings: oneTimeMemoizer(initSuiteBillingBSNSettings),

            getCredsBSNC: oneTimeMemoizer(getCredsBSNC),

            getNetworkTypeStrByTypeId,
        }

    });
