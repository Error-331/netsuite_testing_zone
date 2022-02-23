'use strict';

const soap = require('soap');
var async = require('async');

/*
    To update:
    git add -A
    git commit -m ""
    git push origin master
    npm version patch
    npm publish
    On client side
    npm update
*/

class NetSuite
{
    constructor(options)
    {
        this.client = {};
        this.accountId = options.accountId;
        this.baseUrl = options.baseUrl || 'https://webservices.netsuite.com/services/NetSuitePort_2016_2';
        this.appId = options.appId;
        this.password = options.password;
        this.roleId = options.roleId;
        this.username = options.username;
        this.wsdlPath = options.wsdlPath || 'https://webservices.netsuite.com/wsdl/v2016_2_0/netsuite.wsdl';
        this.nsTarget = options.nstarget || '2016_2';
        this.nsEnvironment = 'production'; //options.nsenvironment || 'production'; // This is not totally working well so just assume prod
    }
}

NetSuite.prototype.initialize = function(callback)
{
    soap.createClient(this.wsdlPath, {}, (err, client) =>
    {
        if (err)
        {
            console.log('Error: ' + err);
            return;
        }

        client.addSoapHeader(
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
            });

        client.setEndpoint(this.baseUrl);
        this.client = client;
        callback();
    });
};

NetSuite.prototype.get = function(type, internalId, callback)
{
    var self = this;
    let wrappedData =
        {
            ':record':
                {
                    'attributes':
                        {
                            'xmlns:listRel': 'urn:relationships_' + self.nsTarget + '.lists.webservices.netsuite.com',
                            'xmlns:platformCore': 'urn:core_' + self.nsTarget + '.platform.webservices.netsuite.com',
                            'xsi:type': 'platformCore:RecordRef',
                            'type': type,
                            'internalId': internalId
                        }
                }
        };

    this.client.get(wrappedData, callback);
};

NetSuite.prototype.mapSso = function(email, password, account, role, authenticationToken, partnerId, callback)
{
    // The mapSso operation seems to want to require a separate login before calling mapSso.  It does not like
    // the request-level credentials method and throws an Ambiguous Authentication error.  So do not initialize
    // before calling login.
    var self = this;
    async.waterfall(
        [
            function(next)
            {
                login(self, function(err, client)
                {
                    next(null, client);
                });
            },
            function(client, next)
            {
                let nsEnvironment = '';
                if (self.nsEnvironment !== 'production')
                {
                    nsEnvironment = 'sandbox.';
                }

                let wrappedData =
                    {
                        ':ssoCredentials':
                            {
                                'attributes':
                                    {
                                        'xmlns:platformCore': 'urn:core_' + self.nsTarget + '.platform.webservices.' + nsEnvironment + 'netsuite.com',
                                        'xsi:type': 'platformCore:SsoCredentials'
                                    },
                                'email': email,
                                'password': password,
                                'account': account,
                                'role':
                                    {
                                        'attributes':
                                            {
                                                'xsi:type': 'platformCore:RecordRef',
                                                'internalId': role
                                            }
                                    },
                                'authenticationToken': authenticationToken,
                                'partnerId': partnerId
                            }
                    };

                client.mapSso(wrappedData, function(err, mapSsoResponse)
                {
                    if (err)
                    {
                        callback({error: err});
                    }
                    else
                    {
                        next(null, client, mapSsoResponse);
                    }
                });
            },
            function(client, mapSsoResponse, next)
            {
                client.logout(function()
                {
                    callback(null, mapSsoResponse);
                });
            }
        ]);
};

NetSuite.prototype.update = function(type, internalId, fields, callback)
{
    var self = this;
    let wrappedData =
        {
            ':record':
                {
                    'attributes':
                        {
                            'xmlns:listRel': 'urn:relationships_' + self.nsTarget + '.lists.webservices.netsuite.com',
                            'xmlns:platformCore': 'urn:core_' + self.nsTarget + '.platform.webservices.netsuite.com',
                            'xsi:type': 'listRel:' + type,
                            'internalId': internalId
                        }
                }
        };

    for (let property in fields)
    {
        if (property === 'customFieldList')
        {
            for (let customFieldProperty in fields.customFieldList)
            {
                //wrappedData[':record'].attributes['listRel:' + property] = fields[property];
            }
        }
        else
        {
            wrappedData[':record'].attributes['listRel:' + property] = fields[property];
        }
    }

    this.client.update(wrappedData, callback);
};

function login(settings, callback)
{
    soap.createClient(settings.wsdlPath, {}, (err, client) =>
    {
        if (err)
        {
            console.log('Error: ' + err);
            return;
        }

        client.addSoapHeader(
            {
                applicationInfo:
                    {
                        applicationId: settings.appId
                    }
            });

        client.setEndpoint(settings.baseUrl);

        var passport =
            {
                passport:
                    {
                        account: settings.accountId,
                        email: settings.username,
                        password: settings.password,
                        role:
                            {
                                attributes:
                                    {
                                        internalId: settings.roleId
                                    }
                            }
                    }
            }

        client.login(passport, function(err, response)
        {
            callback(err, client);
        });
    });
};

module.exports = NetSuite;