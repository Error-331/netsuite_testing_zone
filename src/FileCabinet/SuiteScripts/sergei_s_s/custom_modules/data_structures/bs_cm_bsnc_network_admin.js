/**
 * @NApiVersion 2.1
 */
define([
        '../utilities/bs_cm_date_utils',
        'N/xml',
    ],
    
    (
        { transformUTCDateToPSTDate },
        xml,
    ) => {
        class BSNCNetworkAdmin {
            static fromSOAPResponse(soapResponse) {
                const settings = {
                    "CreationDate": transformUTCDateToPSTDate( xml.XPath.select({ node : soapResponse, xpath :"//a:CreationDate"}).textContent ),
                    "Login": xml.XPath.select({ node : soapResponse, xpath :"//a:Login" }).textContent,
                    "Id": xml.XPath.select({ node : soapResponse, xpath :"//a:Id" }).textContent,
                    "IsLockedOut": xml.XPath.select({ node : soapResponse, xpath :"//a:IsLockedOut" }).textContent,
                    "RoleName": xml.XPath.select({ node : soapResponse, xpath :"//a:RoleName" }).textContent,
                }

                return new BSNCNetworkAdmin(settings);
            }

            constructor(settings) {
                this.IsError = settings['IsError'] || false;
                this.Message = settings['Message'];
                this.CreationDate = settings['CreationDate'];
                this.Login = settings['Login'];
                this.Id = settings['Id'];
                this.IsLockedOut = settings['IsLockedOut'];
                this.RoleName = settings['RoleName'];
            }
        }

        return {
            BSNCNetworkAdmin
        }
    });
