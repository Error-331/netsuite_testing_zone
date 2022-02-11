function getCredsBSNC() {
    var creds = {};
    creds.host = sbBSNSettings.bsncConnection.host;
    creds.user = sbBSNSettings.bsncConnection.user;
    creds.pass = sbBSNSettings.bsncConnection.pass;
    creds.endp = sbBSNSettings.bsncConnection.endp;
    creds.soap = sbBSNSettings.bsncConnection.soap;
    creds.actn = sbBSNSettings.bsncConnection.actn;
    /*
    switch ('stage') {
        case 'prod':
            creds.host = "api.bsn.cloud";
            creds.user = "admin/nsadmin@bsn.cloud";
            creds.pass = "unirLQ7eMLEjU5";
            creds.endp = "https://api.bsn.cloud/Admin/2019/03/SOAP/Basic/";
            creds.soap = 'https://api.bsn.cloud/Admin/2019/03/SOAP/';
            creds.actn = 'https://api.bsn.cloud/Admin/2019/03/SOAP/AdminService/';
            break;
        case 'stage':
            creds.host = "ast.bsn.cloud";
            creds.user = "admin/nsadmin@bsn.cloud";
            creds.pass = "unirLQ7eMLEjU5";
            creds.endp = "https://ast.bsn.cloud/Admin/2019/03/SOAP/Basic/";
            creds.soap = 'https://api.bsn.cloud/Admin/2019/03/SOAP/';
            creds.actn = 'https://api.bsn.cloud/Admin/2019/03/SOAP/AdminService/';
            break;
        case 'qa':
            creds.host = "apiqa.bsn.cloud";
            creds.user = "admin/orderadmin@brightsign.biz";
            creds.pass = "P@ssw0rd";
            creds.endp = "https://apiqa.bsn.cloud/Admin/2019/03/SOAP/Basic/";
            creds.soap = 'https://api.bsn.cloud/Admin/2019/03/SOAP/';
            creds.actn = 'https://api.bsn.cloud/Admin/2019/03/SOAP/AdminService/';
            break;
        default:
            break;
    }
    */
    return creds;
}

function bsncGetSOAPHeader(){
    var creds = getCredsBSNC();
    var created = getUTCDate();
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

function bsncSOAPHeaders( method ){
    var creds = getCredsBSNC();
    var soapHeaders = new Array();
    soapHeaders['Host'] = creds.host;
    soapHeaders['Content-Type'] = 'text/xml; charset=utf-8';
    soapHeaders['SOAPAction'] = creds.actn + method;
    soapHeaders['endPoint'] = creds.endp;
    return soapHeaders;
}