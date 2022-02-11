/**
 * @NApiVersion 2.1
 */
define(['N/xml', './bs_cm_bsnc_network_subscription'],

    (xml, { BSNCNetworkSubscription }) => {
        class BSNCNetwork {
            static fromSOAPResponse(soapResponse) {
                const settings = {
                    'SubscriptionsActivityPeriod' : xml.XPath.select({ node : soapResponse, xpath : '//a:BillingMode/a:SubscriptionsActivityPeriod'}).textContent,
                    'SubscriptionsRenewalDate' : xml.XPath.select({ node : soapResponse, xpath : '//a:BillingMode/a:SubscriptionsRenewalDate'}).textContent,
                    'CreationDate' : xml.XPath.select({ node : soapResponse, xpath :'//a:CreationDate'}).textContent,
                    'Id' : xml.XPath.select({ node : soapResponse, xpath :'//a:Id'}).textContent,
                    'IsLockedOut' : xml.XPath.select({ node : soapResponse, xpath :'//a:IsLockedOut'}).textContent,
                    'LastLockoutDate' : xml.XPath.select({ node : soapResponse, xpath :'//a:LastLockoutDate'}).textContent,
                    'LockoutDate' : xml.XPath.select({ node : soapResponse, xpath :'//a:LockoutDate'}).textContent,
                    'Name' : xml.XPath.select({ node : soapResponse, xpath :'//a:Name'}).textContent,
                    'AutomaticDeviceSubscriptionsManagementEnabled' : xml.XPath.select({ node : soapResponse, xpath :'//a:Settings/a:AutomaticDeviceSubscriptionsManagementEnabled'}).textContent,
                    'AutomaticTaggedPlaylistApprovementEnabled' : xml.XPath.select({ node : soapResponse, xpath :'//a:Settings/a:AutomaticTaggedPlaylistApprovementEnabled'}).textContent,
                    'BrightAuthorAccessRestricted' : xml.XPath.select({ node : soapResponse, xpath :'//a:Settings/a:BrightAuthorAccessRestricted'}).textContent,
                    'WebUIAccessRestricted' : xml.XPath.select({ node : soapResponse, xpath :'//a:Settings/a:WebUIAccessRestricted'}).textContent,
                    'SetupCompletionDate' : xml.XPath.select({ node : soapResponse, xpath :'//a:SetupCompletionDate'}).textContent,
                    'NetworkSubscriptions' : [],
                    'isTrial' : false,
                    'wasTrial' : false,
                    'isContent' : false,
                    'isControl' : false,
                }

                const subInfo = [];
                const CreationDate = xml.XPath.select({ node : soapResponse, xpath :'//a:NetworkSubscription/a:CreationDate' });
                const ExpireDate = xml.XPath.select({ node : soapResponse, xpath :'//a:NetworkSubscription/a:ExpireDate' });
                const Id = xml.XPath.select({ node : soapResponse, xpath :'//a:NetworkSubscription/a:Id' });
                const LastModifiedDate = xml.XPath.select({ node : soapResponse, xpath :'//a:NetworkSubscription/a:LastModifiedDate' });
                const Level = xml.XPath.select({ node : soapResponse, xpath :'//a:NetworkSubscription/a:Level' });
                
                for (let i = 0; i < CreationDate.length ; i++){
                    subInfo[subInfo.length] = new BSNCNetworkSubscription({
                        'CreationDate': CreationDate[i].firstChild ? CreationDate[i].firstChild.nodeValue : CreationDate[i].firstChild,
                        'ExpireDate': ExpireDate[i].firstChild ? ExpireDate[i].firstChild.nodeValue : ExpireDate[i].firstChild,
                        'Id': Id[i].firstChild ? Id[i].firstChild.nodeValue : Id[i].firstChild,
                        'LastModifiedDate': LastModifiedDate[i].firstChild ? LastModifiedDate[i].firstChild.nodeValue : LastModifiedDate[i].firstChild,
                        'Level': Level[i].firstChild ? Level[i].firstChild.nodeValue : Level[i].firstChild
                    });

                    if( i && subInfo[i].Level == 'Trial' ){
                        settings.wasTrial = true;
                    }
                }

                switch( subInfo[0].Level ){
                    case 'Trial': settings.isTrial = true; break;
                    case 'Content': settings.isContent = true; break;
                    case 'Control': settings.isControl = true; break;
                    default: break;
                }

                if( subInfo.length ){
                    settings.NetworkSubscriptions = subInfo;
                }
                
                return new BSNCNetwork(settings);
            }

            constructor(settings) {
                this.IsError = settings['IsError'] || false;
                this.Message = settings['Message'];
                this.SubscriptionsActivityPeriod = settings['SubscriptionsActivityPeriod'];
                this.SubscriptionsRenewalDate = settings['SubscriptionsRenewalDate'];
                this.Id = settings['Id'];
                this.IsLockedOut = settings['IsLockedOut'];
                this.LastLockoutDate = settings['LastLockoutDate'];
                this.LockoutDate = settings['LockoutDate'];
                this.Name = settings['Name'];
                this.AutomaticSubscriptionsManagementEnabled = settings['AutomaticDeviceSubscriptionsManagementEnabled'];
                this.AutomaticTaggedPlaylistApprovementEnabled = settings['AutomaticTaggedPlaylistApprovementEnabled'];
                this.BrightAuthorAccessRestricted = settings['BrightAuthorAccessRestricted'];
                this.WebUIAccessRestricted = settings['WebUIAccessRestricted'];
                this.SetupCompletionDate = settings['SetupCompletionDate'];
                this.NetworkSubscriptions = settings['NetworkSubscriptions'];
                this.isTrial = settings['isTrial'];
                this.wasTrial = settings['wasTrial'];
                this.isContent = settings['isContent'];
                this.isControl = settings['isControl'];
                this.NetworkAdministrators = settings['NetworkAdministrators'];
                this.quantity = settings['quantity'];
            }
        }

        return {
            BSNCNetwork,
        };
    });
