/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       28 Aug 2021     Eugene Karakovsky
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function sbSendTemplateEmail(request, response){
    //https://3293628-sb2.app.netsuite.com/app/site/hosting/scriptlet.nl?script=927&deploy=1&rectype=customer&template=492&recipient=test@test.com&start=7/27/2021&bs_network=MyNet&amount=99&subscription=A1234&po=PO-123&customername=Michael%20Levine&4dig=3546
    var recType = request.getParameter('rectype');//customer or employee
    var template = request.getParameter('template');//email template internal ID
    var recipient = request.getParameter('recipient');
    var startDate = request.getParameter('start');
    var subscription = request.getParameter('subscription');
    var customerName = request.getParameter('customername');
    var amount = request.getParameter('amount');
    var po = request.getParameter('po');
    var fourdig = request.getParameter('4dig');
    var networkAdmin = request.getParameter('bs_email');
    var networkName = request.getParameter('bs_network');

    var fromId = 69739/* Sales */;

    var suspendDate = nlapiStringToDate(startDate);
    suspendDate.setDate( suspendDate.getDate() + 30 );

    var args = {
        fromId: fromId,
        recipient: recipient,
        startDate: startDate,
        suspendDate: nlapiDateToString( suspendDate ),
        subscription: subscription,
        customerName: customerName,
        amount: amount,
        po: po,
        fourdig: fourdig,
        networkName: networkName,
        template: template,
        mailSubject: '',
        mailBody: '',
        cc: null,
        bcc: null,
        files: null,
        records: null,
    };

    if( !isNullorEmpty( recType ) && !isNullorEmpty( template ) && !isNullorEmpty( recipient ) ){
        args.mailSubject = 'New BSN.cloud network notification';
        var mailSent = sendEmailUsingBrightSignTemplate(args);
        if( mailSent ) {
            response.write('true');
            return;
        }
    }

    //response.write(JSON.stringify(args));
    response.write('false');
}

function sendEmailByTemplate(from, to, emailSubject, emailBody, cc, bcc, records, files) {
    emailBody = emailBody.replace(/{current_year}/g, new Date().getFullYear());
    nlapiSendEmail( from, to, emailSubject, emailBody, cc, bcc, records, files );
}

function sendEmailUsingBrightSignTemplate(args) {

    if( args.template ) {
        //var customerId = nlapiGetUser();
        var emailMerger = nlapiCreateEmailMerger(args.template);
        //emailMerger.setEntity('customer', customerId);
        var mergeResult = emailMerger.merge();

        var emailBody = mergeResult.getBody();
        emailBody = emailBody.replace(/{email_body}/g, args.mailBody);
        emailBody = emailBody.replace(/{subscription}/g, args.subscription);
        emailBody = emailBody.replace(/{customerName}/g, args.customerName);
        emailBody = emailBody.replace(/{amount}/g, '$' + args.amount);
        emailBody = emailBody.replace(/{po}/g, args.po);
        emailBody = emailBody.replace(/{4dig}/g, args.fourdig);
        emailBody = emailBody.replace(/{renewaldate}/g, args.startDate);
        emailBody = emailBody.replace(/{suspensiondate}/g, args.suspendDate);

        var emailSubject = mergeResult.getSubject();
        emailSubject = emailSubject.replace(/{subscription}/g, args.subscription);
        emailSubject = emailSubject.replace(/{netname}/g, args.networkName);
        emailSubject = emailSubject.replace(/{customerName}/g, args.customerName);

        if (!isNullorEmpty(args.recipient)) {
            sendEmailByTemplate(args.fromId, args.recipient, emailSubject, emailBody, args.cc, args.bcc, args.records, args.files);
            /*
            else
                sendEmailByTemplate(from, 158887, emailSubject + ' Original to: ' + to, emailBody, cc, bcc, records, files); //to smatveyev

             */

        }

        return true;
    }

    return false;
}

function isNullorEmpty(strVal){
    return (strVal == null || strVal == '');
}