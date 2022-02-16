import record from 'N/record';
import Record from 'N/record/instance';

import {
    getEmailParamsObjectDummy,

    getRenewalEmailParamsForBSN,
    getRenewalEmailParamsForBSNEE,
} from './../../../../../../src/FileCabinet/SuiteScripts/sergei_s_s/custom_modules/subscription/renewal_emails/bs_cm_renewal_emails_parameters_preparation';

jest.mock('N/record');
jest.mock('N/record/instance');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('Custom modules / subscription / renewal emails / renewal emails parameters preparation tests', () => {
    it('it should return proper email params object dummy', () => {
        expect(getEmailParamsObjectDummy()).toStrictEqual({
            check: '',
            attachInvoice: false,
            suspend: false,

            from: 0,
            to: 0,

            sendToDisty: false,
            sendToReseller: false,
            sendToOwner: false,

            isTerms: false,
            sendToSales: false,
        });
    });

    it('it should return proper email params for BSN (-30t, bsn, ru)', () => {
        const bsnRenewalEmailParams = getRenewalEmailParamsForBSN('-30t', 'bsn', 'ru');
        expect(bsnRenewalEmailParams).toStrictEqual({
            check: 'custrecord_bs_sub_30day_email',
            attachInvoice: false,
            suspend: false,

            from: -30,
            to: -15.01,

            sendToDisty: true,
            sendToReseller: true,
            sendToOwner: true,

            isTerms: true,
            sendToSales: false,
        });
    });

    it('it should return proper email params for BSN (-30p, bsn, ru)', () => {
        const bsnRenewalEmailParams = getRenewalEmailParamsForBSN('-30p', 'bsn', 'ru');
        expect(bsnRenewalEmailParams).toStrictEqual({
            check: 'custrecord_bs_sub_30day_email',
            attachInvoice: false,
            suspend: false,

            from: -30,
            to: -15.01,

            sendToDisty: true,
            sendToReseller: true,
            sendToOwner: true,

            isTerms: false,
            sendToSales: false,
        });
    });

    it('it should return proper email params for BSN (-30a, bsn, ru)', () => {
        const bsnRenewalEmailParams = getRenewalEmailParamsForBSN('-30a', 'bsn', 'ru');
        expect(bsnRenewalEmailParams).toStrictEqual({
            check: 'custrecord_bs_sub_30day_email',
            attachInvoice: false,
            suspend: false,

            from: -30,
            to: -15.01,

            sendToDisty: true,
            sendToReseller: true,
            sendToOwner: true,

            isTerms: false,
            sendToSales: false,
        });
    });

    it('it should return proper email params for BSN (-15t, bsn, ru)', () => {
        const bsnRenewalEmailParams = getRenewalEmailParamsForBSN('-15t', 'bsn', 'ru');
        expect(bsnRenewalEmailParams).toStrictEqual({
            check: 'custrecord_bs_sub_15day_email',
            attachInvoice: false,
            suspend: false,

            from: -15,
            to: -7.01,

            sendToDisty: true,
            sendToReseller: false,
            sendToOwner: true,

            isTerms: true,
            sendToSales: false,
        });
    });

    it('it should return proper email params for BSN (-15p, bsn, ru)', () => {
        const bsnRenewalEmailParams = getRenewalEmailParamsForBSN('-15p', 'bsn', 'ru');
        expect(bsnRenewalEmailParams).toStrictEqual({
            check: 'custrecord_bs_sub_15day_email',
            attachInvoice: false,
            suspend: false,

            from: -15,
            to: -7.01,

            sendToDisty: true,
            sendToReseller: false,
            sendToOwner: true,

            isTerms: false,
            sendToSales: false,
        });
    });

    it('it should return proper email params for BSN (-7t, bsn, ru)', () => {
        const bsnRenewalEmailParams = getRenewalEmailParamsForBSN('-7t', 'bsn', 'ru');
        expect(bsnRenewalEmailParams).toStrictEqual({
            check: 'custrecord_bs_sub_7day_email',
            attachInvoice: false,
            suspend: false,

            from: -7,
            to: -0.01,

            sendToDisty: true,
            sendToReseller: false,
            sendToOwner: true,

            isTerms: true,
            sendToSales: true,
        });
    });

    it('it should return proper email params for BSN (-7p, bsn, ru)', () => {
        const bsnRenewalEmailParams = getRenewalEmailParamsForBSN('-7p', 'bsn', 'ru');
        expect(bsnRenewalEmailParams).toStrictEqual({
            check: 'custrecord_bs_sub_7day_email',
            attachInvoice: false,
            suspend: false,

            from: -7,
            to: -0.01,

            sendToDisty: true,
            sendToReseller: false,
            sendToOwner: true,

            isTerms: false,
            sendToSales: false,
        });
    });

    it('it should return proper email params for BSN (-7a, bsn, ru)', () => {
        const bsnRenewalEmailParams = getRenewalEmailParamsForBSN('-7a', 'bsn', 'ru');
        expect(bsnRenewalEmailParams).toStrictEqual({
            check: 'custrecord_bs_sub_7day_email',
            attachInvoice: false,
            suspend: false,

            from: -7,
            to: -0.01,

            sendToDisty: true,
            sendToReseller: false,
            sendToOwner: true,

            isTerms: false,
            sendToSales: false,
        });
    });

    it('it should return proper email params for BSN (0t, bsn, ru)', () => {
        const bsnRenewalEmailParams = getRenewalEmailParamsForBSN('0t', 'bsn', 'ru');
        expect(bsnRenewalEmailParams).toStrictEqual({
            check: 'custrecord_bs_sub_0day_email',
            attachInvoice: true,
            suspend: false,

            from: 0,
            to: 6.99,

            sendToDisty: true,
            sendToReseller: false,
            sendToOwner: true,

            isTerms: true,
            sendToSales: true,
        });
    });

    it('it should return proper email params for BSN (0p, bsn, ru)', () => {
        const bsnRenewalEmailParams = getRenewalEmailParamsForBSN('0p', 'bsn', 'ru');
        expect(bsnRenewalEmailParams).toStrictEqual({
            check: 'custrecord_bs_sub_0day_email',
            attachInvoice: false,
            suspend: false,

            from: 0,
            to: 6.99,

            sendToDisty: true,
            sendToReseller: false,
            sendToOwner: true,

            isTerms: false,
            sendToSales: false,
        });
    });

    it('it should return proper email params for BSN (0a, bsn, ru)', () => {
        const bsnRenewalEmailParams = getRenewalEmailParamsForBSN('0a', 'bsn', 'ru');
        expect(bsnRenewalEmailParams).toStrictEqual({
            check: 'custrecord_bs_sub_0day_email',
            attachInvoice: false,
            suspend: false,

            from: 0,
            to: 6.99,

            sendToDisty: true,
            sendToReseller: false,
            sendToOwner: true,

            isTerms: false,
            sendToSales: false,
        });
    });

    it('it should return proper email params for BSN (7t, bsn, ru)', () => {
        const bsnRenewalEmailParams = getRenewalEmailParamsForBSN('7t', 'bsn', 'ru');
        expect(bsnRenewalEmailParams).toStrictEqual({
            check: 'custrecord_bs_sub_7day_past_email',
            attachInvoice: true,
            suspend: false,

            from: 7,
            to: 29.99,

            sendToDisty: true,
            sendToReseller: false,
            sendToOwner: true,

            isTerms: true,
            sendToSales: true,
        });
    });
   ///


    it('it should return proper email params for BSNEE (-30t)', () => {
        const bsnRenewalEmailParams = getRenewalEmailParamsForBSNEE('-30t');
        expect(bsnRenewalEmailParams).toStrictEqual({
            check: 'custrecord_bs_sub_30day_email',
            attachInvoice: false,
            suspend: false,

            from: -30,
            to: -15.01,

            sendToDisty: true,
            sendToReseller: false,
            sendToOwner: false,

            isTerms: false,
            sendToSales: false,
        });
    });
});