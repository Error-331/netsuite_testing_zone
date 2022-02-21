/**
 * @NApiVersion 2.1
 */
define([
        'N/file',
        'N/format',
        'N/email',
        'N/render',
        './../../utilities/bs_cm_general_utils',
        './../../utilities/bs_cm_string_utils',
        './bs_cm_renewal_emails_renderers',
    ],
    
    (
        file,
        format,
        email,
        render,
        { isNullOrEmpty, logExecution },
        { isOnlyDigits },
        { renderTransactionPDF },
    ) => {
        function calcSBCCDaysToExpiration(ccexpdate){
            let m = 0;
            let y = 0;

            if(ccexpdate.indexOf('/') != -1)
            {
                const dToday = new Date();
                const c = ccexpdate.split('/');

                if(isOnlyDigits(c[0])) {
                    m = parseInt(c[0],10);
                }

                if(isOnlyDigits(c[1])) {
                    y = parseInt(c[1],10);
                }

                if( m > 0 && m < 13 && y > 1900 ) {
                    const eDate = new Date();
                    eDate.setFullYear(y, m, 0);

                    return Math.ceil(eDate - dToday) / (1000 * 60 * 60 * 24);
                }
            }
            return -1;
        }

        function prepareSBCCExpirationMessage( ccnumber, ccexpdate, subexpdate, extend ){
            logExecution('DEBUG', 'message args', `sbCCExpirationMessage("${ccnumber}", "${ccexpdate}", "${subexpdate}", ${extend})`);

            let message = '';
            if(!isNullOrEmpty(ccnumber)) {
                let pastdue = extend || 0;
                let renewDate = format.parse({value: fsubexpdate});
                let dToday = new Date();
                let daysToSubExp = Math.ceil(renewDate - dToday) / (1000 * 60 * 60 * 24);
                let ccDaysLeft = calcSBCCDaysToExpiration(ccexpdate);

                if (ccDaysLeft <= 0) {
                    message = `Credit Card on your record (ends with ${ccnumber.substr(-5)}) has already expired. You must update Credit Card information for the renewal to be processed.`;
                } else if (ccDaysLeft < daysToSubExp + pastdue) {
                    message = `Credit Card on your record (ends with ${ccnumber.substr(-5)}) is about to expire in ${ccDaysLeft} days. You must update Credit Card information for the renewal to be processed.`;
                }
            } else {
                message = 'There is no Credit Card on your record. You must update Credit Card information for the renewal to be processed.';
            }

            return message == '' ? '' : `<div style="color: red;">${message}</div><br>`;
        }
    
        function sendEmailByTemplate(author, recipients, subject, body, cc, bcc, records, attachments) {
            const preparedBody = body.replace(/{current_year}/g, new Date().getFullYear());

            email.send({
                author,
                recipients,
                subject,
                body: preparedBody,
                cc,
                bcc,
                attachments,
            });
        }

        function sendEmailUsingBrightSignTemplate(args) {
            if( args.template ) {
                const expiration = prepareSBCCExpirationMessage(args.ccNumber, args.ccExpDate, args.startDate, args.overrideSuspension);
                const emailMerger = render.mergeEmail({
                    templateId: args.template, //TODO: it seem that this is wrong - we need an id here
                });

                const mergeResult = emailMerger.merge();
                let emailBody = mergeResult.getBody();

                emailBody = emailBody.replace(/{email_body}/g, args.mailBody);
                emailBody = emailBody.replace(/{subscription}/g, args.subscription);
                emailBody = emailBody.replace(/{customerName}/g, args.customerName);
                emailBody = emailBody.replace(/{execName}/g, args.execName);
                emailBody = emailBody.replace(/{amount}/g, '$' + args.amount);
                emailBody = emailBody.replace(/{po}/g, args.po);
                emailBody = emailBody.replace(/{4dig}/g, args.ccNumber);
                emailBody = emailBody.replace(/{renewaldate}/g, args.startDate);
                emailBody = emailBody.replace(/{suspensiondate}/g, args.suspendDate);
                emailBody = emailBody.replace(/{ccexpiration}/g, expiration);
                emailBody = emailBody.replace(/{netname}/g, args.networkName);
                emailBody = emailBody.replace(/{netadmin}/g, args.networkAdmin);
                emailBody = emailBody.replace(/{daysafter}/g, args.daysAfter);
                emailBody = emailBody.replace(/{terms}/g, args.daysAfter);

                let emailSubject = mergeResult.getSubject();

                emailSubject = emailSubject.replace(/{subscription}/g, args.subscription);
                emailSubject = emailSubject.replace(/{netname}/g, args.networkName);
                emailSubject = emailSubject.replace(/{customerName}/g, args.customerName);

                if (!isNullOrEmpty(args.recipient)) {
                    try {
                        sendEmailByTemplate(args.fromId, args.recipient, emailSubject, emailBody, args.cc, args.bcc, args.records, args.files);
                    } catch(e) {
                        logExecution('DEBUG', 'Exception ', e.message );
                        logExecution('DEBUG', 'Exception ', e.stack);
                        logExecution('DEBUG', 'Exception ', e.toString());

                        return false;
                    }

                }

                return true;
            }

            return false;
        }

        function sendRecurringEmail(incoming, recType, template, invoice, attachment){
            let recipient = '';
            let records = {};

            switch( recType ){
                case 'customer':
                    recipient = incoming.customerEmail;
                    records['customer'] = incoming.customerId;
                    break;
                case 'enduser':
                    recipient = incoming.networkAdmin;
                    //records['customer'] = incoming.enduserId;
                    break;
                case 'sales':
                    recipient = incoming.salesRep;
                    records['employee'] = incoming.salesRep;
                    break;
                default: break;
            }

            if(isNullOrEmpty(attachment)){
                attachment = null;
            } else {
                attachment = [file.load(parseInt(attachment))];
            }

            logExecution('DEBUG', 'records', JSON.stringify(records));

            let fromId = 84741/* Orders */;
            let suspendDay = 30;

            if(!isNullOrEmpty( incoming.overrideSuspension)) {
                suspendDay = parseInt(incoming.overrideSuspension);
            }

            logExecution('DEBUG', 'suspendDay', suspendDay);

            let suspendDate = format.parse({ value: incoming.startDate })
            suspendDate.setDate( suspendDate.getDate() + suspendDay );
            logExecution('DEBUG', 'suspendDate', suspendDate);

            const args = {
                fromId: fromId,
                recipient: recipient,
                startDate: incoming.startDate,
                suspendDate: format.format({ value: suspendDate }),
                overrideSuspension: parseInt(incoming.overrideSuspension),
                ccExpDate: '',
                ccNumber: incoming.ccNumber,
                subscription: incoming.subscription,
                customerName: incoming.customerName,
                execName: incoming.salesRepName,
                amount: incoming.amount,
                po: incoming.po,
                networkName: incoming.networkName,
                networkAdmin: incoming.networkAdmin,
                daysAfter: incoming.daysAfter,
                template: template,
                terms: incoming.terms,
                daysLeft: incoming.daysLeft,
                mailSubject: '',
                mailBody: '',
                cc: null,
                bcc: null,
                files: isNullOrEmpty( invoice ) ? attachment :  renderTransactionPDF(invoice),
                records: records,
            };

            if(!isNullOrEmpty(incoming.ccNumber)){
                const regex  = new RegExp(/\((.*?)\)/);
                const expMatch = args.ccNumber.match(regex);

                if(expMatch && expMatch.length) {
                    args.ccExpDate = expMatch[1];
                }
            }

            if( !isNullOrEmpty( recType ) && !isNullOrEmpty( template ) && !isNullOrEmpty( recipient ) ){
                args.mailSubject = 'New BSN.cloud network notification';
                const mailSent = sendEmailUsingBrightSignTemplate(args);

                if( mailSent ) {
                    return true;
                }
            }

            return false;
        }

        return {
            sendEmailByTemplate,
            sendEmailUsingBrightSignTemplate,
            sendRecurringEmail,
        }
    });
