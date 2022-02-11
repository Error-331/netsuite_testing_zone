/**
 * @NApiVersion 2.1
 */
define(['./bs_cm suite_billing_settings_utils'],

    ({ initSuiteBillingBSNSettings }) => {
        const SUBSCRIPTION_ITEM_TYPE_CLOUD = 1;
        const SUBSCRIPTION_ITEM_TYPE_COM = 2;
        const SUBSCRIPTION_ITEM_TYPE_BSNEE = 6;

        const parseSubscriptionItemIdByName = (itemName) => {
            const bsnSettings = initSuiteBillingBSNSettings();

            switch (itemName) {
                case 'BSNEE - Annual Fee':
                case 'BSNEE - Annual Fee (contract)':
                    return bsnSettings.bsnee1yrItemNum;
                case 'BSNSUB-01-R':
                case 'BSNSUB-03-R':
                case 'BSNSUB-12-R':
                    return bsnSettings.bsn1yrItemNum;
                case 'BSNSUB-12-CL':
                    return bsnSettings.bsnc1yrItemNum;
            }
        };

        const parsePriceLevelBySubscriptionItem = (subscriptionItemId, usrPriceLevel) => {
            const bsnSettings = initSuiteBillingBSNSettings();

            switch(subscriptionItemId) {
                case bsnSettings.bsnc1yrItemNum: {
                    switch (usrPriceLevel) {
                        case 'Custom':
                            return bsnSettings.priceBooksCL[6].pricebook;
                        case 'Tier 1: 25% off MSRP':
                            return bsnSettings.priceBooksCL[1].pricebook;
                        case 'Tier 2: 30% off MSRP':
                            return bsnSettings.priceBooksCL[2].pricebook;
                        case 'Tier 3: 35% off MSRP':
                            return bsnSettings.priceBooksCL[3].pricebook;
                        case 'Tier 4: 40% off MSRP':
                            return bsnSettings.priceBooksCL[4].pricebook;
                        case 'Tier 5: 45% off MSRP':
                            return bsnSettings.priceBooksCL[5].pricebook;
                        default:
                            return bsnSettings.priceBooksCL[0].pricebook;
                    }
                }

                case bsnSettings.bsn1yrItemNum: {
                    switch (usrPriceLevel) {
                        case 'Custom':
                            return bsnSettings.priceBooks[6].pricebook;
                        case 'Tier 1: 25% off MSRP':
                            return bsnSettings.priceBooks[1].pricebook;
                        case 'Tier 2: 30% off MSRP':
                            return bsnSettings.priceBooks[2].pricebook;
                        case 'Tier 3: 35% off MSRP':
                            return bsnSettings.priceBooks[3].pricebook;
                        case 'Tier 4: 40% off MSRP':
                            return bsnSettings.priceBooks[4].pricebook;
                        case 'Tier 5: 45% off MSRP':
                            return bsnSettings.priceBooks[5].pricebook;
                        default:
                            return bsnSettings.priceBooks[0].pricebook;
                    }
                }

                case bsnSettings.bsnee1yrItemNum: {
                    switch (usrPriceLevel) {
                        case 'MSRP':
                            return 24;
                        case 'Tier 1: 25% off MSRP':
                            return 25;
                        case 'Tier 2: 30% off MSRP':
                            return 26;
                        case 'Tier 3: 35% off MSRP':
                            return 27;
                        case 'Tier 4: 40% off MSRP':
                            return 28;
                        case 'Tier 5: 45% off MSRP':
                            return 29;
                        default:
                            return 30;
                    }
                }
            }
        };

        const parseSubscriptionPlanByNetworkType = (subscriptionItem) => {
            const bsnSettings = initSuiteBillingBSNSettings();

            switch (subscriptionItem) {
                case 'BSNEE - Annual Fee':
                case 'BSNEE - Annual Fee (contract)':
                    return bsnSettings.bsnee1yrPlanNum;
                case 'BSNSUB-12-CL':
                    return bsnSettings.bsnc1yrPlanNum;
                default:
                    return bsnSettings.bsn1yrPlanNum;

            }
        };

        return {
            SUBSCRIPTION_ITEM_TYPE_CLOUD,
            SUBSCRIPTION_ITEM_TYPE_COM,
            SUBSCRIPTION_ITEM_TYPE_BSNEE,

            parseSubscriptionItemIdByName,
            parsePriceLevelBySubscriptionItem,
            parseSubscriptionPlanByNetworkType,
        }

    });
