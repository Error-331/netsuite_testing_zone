/**
 * @NApiVersion 2.1
 */
define(['N/xml'],
    
    (xml) => {
        class BSNCSOAPError extends Error {
            constructor(soapFaultNode, ...params) {
                super(...params)

                if (Error.captureStackTrace) {
                    Error.captureStackTrace(this, BSNCSOAPError);
                }

                this.name = 'BSNCSOAPError';

                this.faultCode = xml.XPath.select({ node : soapFaultNode, xpath : '//faultcode' }).textContent;
                this.faultString = xml.XPath.select({ node : soapFaultNode, xpath : '//faultstring' }).textContent;
                this.faultactor = xml.XPath.select({ node : soapFaultNode, xpath : '//faultactor' }).textContent;

                this.details = xml.XPath.select({ node : soapFaultNode, xpath : '//details' }).textContent;
            }
        }

        return {
            BSNCSOAPError,
        }

    });
