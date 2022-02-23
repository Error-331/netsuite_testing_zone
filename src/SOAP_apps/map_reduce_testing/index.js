const soap = require('soap');
const url = 'https://webservices.netsuite.com/wsdl/v2021_2_0/netsuite.wsdl';
var args = {name: 'value'};

soap.createClient(url, function(err, client) {
    console.log('error', err);
    console.log('client1', client.addSoapHeader);
    console.log('client2', client.NetSuiteService.NetSuitePort.getAll());
   /* client.addSoapHeader(
        {
            applicationInfo:
                {
                    applicationId: this.appId
                },
            passport:
                {
                    account: this.accountId,
                    email: this.username,
                    password: this.password,
                    role:
                        {
                            attributes:
                                {
                                    internalId: this.roleId
                                }
                        }
                }
        });*/


   /* client.MyFunction(args, function(err, result) {
        console.log(result);
    });*/
});