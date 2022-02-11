function getCredsBSN() {
    var creds = {};
    creds.host = sbBSNSettings.bsnConnection.host;
    creds.user = sbBSNSettings.bsnConnection.user;
    creds.pass = sbBSNSettings.bsnConnection.pass;
    creds.endp = sbBSNSettings.bsnConnection.endp;
    creds.soap = sbBSNSettings.bsnConnection.soap;
    creds.actn = sbBSNSettings.bsnConnection.actn;
    /*
    switch ('qa') {
        case 'prod':
            creds.host = "api.brightsignnetwork.com";
            creds.user = "admin/nsadmin@brightsign.biz";
            creds.pass = "Je7a2Q8K";
            creds.endp = "https://api.brightsignnetwork.com/Admin/2018/09/SOAP/Basic/";
            creds.soap = 'https://api.brightsignnetwork.com/Admin/2018/09/SOAP/';
            creds.actn = 'https://api.brightsignnetwork.com/Admin/2018/09/SOAP/AdminService/';
            break;
        case 'stage':
            creds.host = "ast.brightsignnetwork.com";
            creds.user = "admin/order_2@test.lab";
            creds.pass = "P@ssw0rd";
            creds.endp = "https://ast.brightsignnetwork.com/Admin/2018/09/SOAP/Basic/";
            creds.soap = 'https://api.bsn.cloud/Admin/2019/03/SOAP/';
            creds.actn = 'https://api.brightsignnetwork.com/Admin/2018/09/SOAP/AdminService/';
            break;
        case 'qa':
            creds.host = "development.brightsignnetwork.com";
            creds.user = "admin/nsadmin@brightsign.biz";
            creds.pass = "Af8z6QRj";
            creds.endp = "https://api.development.brightsignnetwork.com/Admin/2018/09/SOAP/Basic/";
            creds.soap = 'https://api.brightsignnetwork.com/Admin/2018/09/SOAP/';
            creds.actn = creds.soap + 'AdminService/';
            break;
        default:
            break;
    }
    */
    return creds;
}

function bsnGetSOAPHeader(){
    var creds = getCredsBSN();
    var created = getSOAPTime();
    var wsse = {
        'SOAP': creds.soap,
        'Username' : creds.user,
        'Password' : creds.pass,
        'Nonce' : nlapiEncrypt(created + "some secrets are to be kept", "base64"),
        'Created' : created,
        'UsernameToken' : nlapiEncrypt(created + "some users are to be created", "base64")
    };

    var soap='';
    soap += '<soapenv:Envelope xmlns:soap="' + wsse["SOAP"] + '" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">';
    soap += '<soapenv:Header>';
    soap += '<wsse:Security soapenv:mustUnderstand="1" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">';
    soap += '<wsse:UsernameToken wsu:Id="UsernameToken-' + wsse["UsernameToken"] + '">';
    soap += '<wsse:Username>' + wsse["Username"] + '</wsse:Username>';
    soap += '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + wsse["Password"] + '</wsse:Password>';
    soap += '<wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">' + wsse["Nonce"] + '</wsse:Nonce>';
    soap += '<wsu:Created>' + wsse["Created"] + '</wsu:Created>';
    soap += '</wsse:UsernameToken>';
    soap += '</wsse:Security>';
    soap += '</soapenv:Header>';

    return soap;
}

function bsnSOAPHeaders( method ){
    var creds = getCredsBSN();
    var soapHeaders = {
    'Host': creds.host,
    'Content-Type': 'text/xml; charset=utf-8',
    'SOAPAction': creds.actn + method,
    'endPoint': creds.endp,
}
            nlapiLogExecution('DEBUG', 'soapHeaders lib' , JSON.stringify(soapHeaders));
    return soapHeaders;
}