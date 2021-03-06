/**
 * @NApiVersion 2.1
 */
define([
        './../../utilities/bs_cm_general_utils'
    ],
    (
        {isNullOrEmpty}
    ) => {
        function getEmailParamsObjectDummy() {
            return {
                check:  '',
                attachInvoice: false,
                suspend: false,

                from: 0,
                to: 0,

                sendToDisty: false,
                sendToReseller: false,
                sendToOwner: false,

                isTerms: false,
                sendToSales: false,
            };
        }

        function getRenewalEmailParamsForBSN(period, subtype, countryCode) {
            const paramsObject = getEmailParamsObjectDummy();

            period = period.toLowerCase();
            subtype = subtype.toLowerCase();
            countryCode = countryCode.toLowerCase();

            let isROW = false;
            if(!isNullOrEmpty(countryCode) && countryCode != 'us') {
                isROW = true;
            }

            switch (period) {
                case '-30t':
                case '-30p':
                case '-30a':
                    paramsObject.check = 'custrecord_bs_sub_30day_email';
                    paramsObject.from = -30;
                    paramsObject.to = -15.01;
                    paramsObject.sendToReseller = true;
                    paramsObject.sendToDisty = true;
                    paramsObject.sendToOwner = isROW;
                    break;
                case '-15t':
                case '-15p':
                case '-15a':
                    paramsObject.check = 'custrecord_bs_sub_15day_email';
                    paramsObject.from = -15;
                    paramsObject.to = -7.01;
                    paramsObject.sendToDisty = isROW;
                    paramsObject.sendToOwner = true;
                    break;
                case '-7t':
                case '-7p':
                case '-7a':
                    paramsObject.check = 'custrecord_bs_sub_7day_email';
                    paramsObject.from = -7;
                    paramsObject.to = -0.01;
                    paramsObject.sendToDisty = isROW;
                    paramsObject.sendToOwner = true;
                    break;
                case '0t':
                    paramsObject.attachInvoice = true;
                case '0p':
                case '0a':
                    paramsObject.check = 'custrecord_bs_sub_0day_email';
                    paramsObject.from = 0;
                    paramsObject.to = 6.99;
                    paramsObject.sendToDisty = true;
                    paramsObject.sendToOwner = true;
                    break;
                case '7t':
                    paramsObject.attachInvoice = true;
                case '7p':
                case '7a':
                    paramsObject.check = 'custrecord_bs_sub_7day_past_email';
                    paramsObject.from = 7;
                    paramsObject.to = 29.99;
                    paramsObject.sendToDisty = isROW;
                    paramsObject.sendToOwner = true;
                    break;
                case '30t':
                    paramsObject.attachInvoice = true;
                //case '30p':
                case '30a':
                    paramsObject.check = 'custrecord_bs_sub_30day_past_email';
                    paramsObject.from = 30;
                    paramsObject.to = 450;
                    paramsObject.sendToDisty = true;
                    paramsObject.sendToOwner = true;
                    //suspend = true; //Do Not Suspent Terms Customers
                    break;
                default:
                    throw new Error(`Cannot determine renewal period (email params) for BSN: "${period}"`);
                    break;
            }

            if( subtype == 'bsn' && period == '7p' ) {
                paramsObject.suspend = true;
            }

            switch (period) {
                case '-30t':
                case '-15t':
                case '30t':
                    paramsObject.isTerms = true;
                    break;
                case '-7t':
                case '0t':
                case '7t':
                    paramsObject.isTerms = true;
                    paramsObject.sendToSales = true;
                    break;
                default:
                    break;
            }

            return paramsObject;
        }

        function getRenewalEmailParamsForBSNEE(period) {
            const paramsObject = getEmailParamsObjectDummy();

            paramsObject.sendToDisty = true;
            switch (period) {
                case '-30t':
                    paramsObject.check = 'custrecord_bs_sub_30day_email';
                    paramsObject.from = -30;
                    paramsObject.to = -15.01;

                    break;
                case '-15t':
                    paramsObject.check = 'custrecord_bs_sub_15day_email';
                    paramsObject.from = -15;
                    paramsObject.to = -7.01;

                    break;
                case '-7t':
                    paramsObject.check = 'custrecord_bs_sub_7day_email';
                    paramsObject.from = -7;
                    paramsObject.to = -0.01;

                    break;
                case '0t':
                    paramsObject.check = 'custrecord_bs_sub_0day_email';
                    paramsObject.from = 0;
                    paramsObject.to = 30;

                    break;
                default:
                    throw new Error(`Cannot determine renewal period (email params) for BSNEE: "${period}"`);

                    break;
            }

            switch (period) {
                case '-15t':
                case '-7t':
                case '0t':
                    paramsObject.isTerms = true;
                    paramsObject.sendToSales = true;
                    break;
                default:
                    break;
            }

            return paramsObject;
        }

        function bsnRenewalEmailFromTo(period, subtype, countryCode){
            if(subtype == 'bsn') {
                return getRenewalEmailParamsForBSN(period, subtype, countryCode);
            } else if( subtype == 'bsnee' ) {
                return getRenewalEmailParamsForBSNEE(period);
            }
        }

        function getInitialRenewalEmailsParamsBySearchResult(searchResult) {
            const subValues = {};

            subValues.customerId = searchResult.getValue('billto');
            subValues.customerName = searchResult.getText('billto');
            subValues.customerEmail = searchResult.getValue({ name: 'email', join: 'customer' });
            subValues.terms = parseInt(searchResult.getValue('formulatext'));
            subValues.daysLeft = parseInt(searchResult.getValue('formulanumeric'));
            subValues.enduserId = searchResult.getValue({ name: 'custrecord_bsn_sub_end_user', join: 'subscription' });
            subValues.enduserName = searchResult.getText({ name: 'custrecord_bsn_sub_end_user', join: 'subscription' });
            subValues.enduserEmail = '';
            subValues.billingAccount = searchResult.getValue('billingaccount');
            subValues.billingAccountCountry = searchResult.getValue({ name: 'custrecord_ba_country_code', join: 'billingaccount' }) || '';
            subValues.billingAccountCC = searchResult.getValue({ name: 'custrecord_payop_ccid', join: 'billingaccount' });
            subValues.ccNumber = '';
            subValues.startDate = searchResult.getValue({ name: 'startdate', join: 'subscription' });
            subValues.endDate = searchResult.getValue({ name: 'enddate', join: 'subscription' });
            subValues.daysAfter = parseInt(searchResult.getValue('formulanumeric')) * (-1);
            subValues.plan = searchResult.getValue({ name: 'subscriptionplan', join: 'subscription' });
            subValues.renewalNumber = searchResult.getValue({ name: 'renewalnumber', join: 'subscription' });
            subValues.status = searchResult.getValue({ name: 'status', join: 'subscription' });
            subValues.adminEmail = searchResult.getValue({ name: 'custrecord_sub_network_admin', join: 'subscription' });
            subValues.networkId = searchResult.getValue({ name: 'custrecord_sub_network_id', join: 'subscription' });
            subValues.bsnType = searchResult.getValue({ name: 'custrecord_bsn_type', join: 'subscription' });
            subValues.bsnTypeName = searchResult.getText({ name: 'custrecord_bsn_type', join: 'subscription' });
            subValues.salesRep = searchResult.getValue({ name: 'salesrep', join: 'customer' });
            subValues.salesRepName = searchResult.getText({ name: 'salesrep', join: 'customer' });
            subValues.amount = searchResult.getValue('amount');
            subValues.subscriptionId = searchResult.getValue('subscription');
            subValues.subscription = searchResult.getValue({ name: 'name', join: 'subscription' });
            subValues.overrideSuspension = searchResult.getValue({ name: 'custrecord_sub_override_suspension', join: 'subscription' }) || 0;
            subValues.po = searchResult.getValue({ name: 'custrecord_bs_subscription_po', join: 'subscription' });
            subValues.networkName = searchResult.getValue({ name: 'custrecord_sub_network_name', join: 'subscription' });
            subValues.networkAdmin = searchResult.getValue({ name: 'custrecord_sub_network_admin', join: 'subscription' });

            return subValues;
        }

        return {
            getEmailParamsObjectDummy,
            getRenewalEmailParamsForBSN,
            getRenewalEmailParamsForBSNEE,
            bsnRenewalEmailFromTo,
            getInitialRenewalEmailsParamsBySearchResult,
        }
    });
