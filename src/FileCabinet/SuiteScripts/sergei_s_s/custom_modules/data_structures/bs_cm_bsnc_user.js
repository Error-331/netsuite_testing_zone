/**
 * @NApiVersion 2.1
 */
define(['../bs_cm_date_utils', 'N/xml'],
    
    (
        { transformUTCDateToPSTDate },
        xml
    ) => {
        class BSNCUser {
            static fromSOAPResponse(soapResponse) {
                const settings = {
                    "CreationDate" : transformUTCDateToPSTDate(xml.XPath.select({ node : soapResponse, xpath : "b:CreationDate"}).textContent),
                    "Description" : xml.XPath.select({ node : soapResponse, xpath : "b:Description"}).textContent,
                    "Email" : xml.XPath.select({ node : soapResponse, xpath : "b:Email"}).textContent,
                    "FirstName" : xml.XPath.select({ node : soapResponse, xpath : "b:FirstName"}).textContent,
                    "Id" : xml.XPath.select({ node : soapResponse, xpath : "b:Id"}).textContent,
                    "IsLockedOut" : xml.XPath.select({ node : soapResponse, xpath : "b:IsLockedOut"}).textContent,
                    "LastName" : xml.XPath.select({ node : soapResponse, xpath : "b:LastName"}).textContent,
                    "Login" : xml.XPath.select({ node : soapResponse, xpath : "b:Login"}).textContent,
                    "RoleName" : xml.XPath.select({ node : soapResponse, xpath : "b:RoleName"}).textContent,
                    "NetworkId" : xml.XPath.select({ node : soapResponse, xpath : "b:Network/b:Id"}).textContent,
                    "NetworkName" : xml.XPath.select({ node : soapResponse, xpath : "b:Network/b:Name"}).textContent,
                };

                return new BSNCUser(settings);
            }

            constructor(settings) {
                this.CreationDate = settings['CreationDate'];
                this.Description = settings['Description'];
                this.Email = settings['Email'];
                this.FirstName = settings['FirstName'];
                this.Id = settings['Id'];
                this.IsLockedOut = settings['IsLockedOut'];
                this.LastName = settings['LastName'];
                this.Login = settings['Login'];
                this.RoleName = settings['RoleName'];
                this.NetworkId = settings['NetworkId'];
                this.NetworkName = settings['NetworkName'];
            }
        }

        return { BSNCUser };
    });
