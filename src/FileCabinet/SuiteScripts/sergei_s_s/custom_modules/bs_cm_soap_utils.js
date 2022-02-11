/**
 * @NApiVersion 2.1
 */
define([
        './bs_cm_general_utils',
        './bs_cm_date_utils',
        './bs_cm suite_billing_settings_utils',
        './bs_cm_crypto_utils',
    ],
    (
        { logExecution, isNullOrEmpty },
        { getUTCDate },
        { getCredsBSNC },
        { encodeStringToBase64 },
    ) => {
        const getBSNCSOAPHeaders = (soapMethod) => {
            const { host, actn, endp } = getCredsBSNC();
            const soapHeaders = [];

            soapHeaders['Host'] = host;
            soapHeaders['Content-Type'] = 'text/xml; charset=utf-8';
            soapHeaders['SOAPAction'] = `${actn}${soapMethod}`;
            soapHeaders['endPoint'] = endp;

            return soapHeaders;
        }

        const bsncGetSOAPHeader = (usernameToken, user, password, nonce, utcDateCreated) => {
            return `
                <soapenv:Header>
                    <wsse:Security soapenv:mustUnderstand="1" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
                        <wsse:UsernameToken wsu:Id="UsernameToken-${usernameToken}">
                            <wsse:Username>${user}</wsse:Username>
                            <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${password}</wsse:Password>
                            <wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">${nonce}</wsse:Nonce>
                            <wsu:Created>${utcDateCreated}</wsu:Created>
                        </wsse:UsernameToken>
                    </wsse:Security>
                </soapenv:Header>
            `;
        }

        const bsncPrepareSOAPRequest = (soapBody) => {
            const creds = getCredsBSNC();

            const utcDateCreated = getUTCDate();
            const nonce = encodeStringToBase64(`${utcDateCreated} some secrets are to be kept`);
            const usernameToken = encodeStringToBase64(`${utcDateCreated} some users are to be created`);

            return `
                <soapenv:Envelope xmlns:soap="${creds.soap}" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
                    ${bsncGetSOAPHeader(usernameToken, creds.user, creds.pass, nonce, utcDateCreated)}
                    ${soapBody}
                </soapenv:Envelope>
            `;
        }

        return {
            getBSNCSOAPHeaders,

            bsncGetSOAPHeader,
            bsncPrepareSOAPRequest,
        }
    });
