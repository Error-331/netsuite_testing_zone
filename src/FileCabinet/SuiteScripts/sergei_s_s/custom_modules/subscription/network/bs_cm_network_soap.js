/**
 * @NApiVersion 2.1
 */
define([
        './../../utilities/bs_cm_general_utils',
        './../../utilities/bs_cm_soap_utils',
    ],
    
    (
        { logExecution,  isNullOrEmpty},
        { getBSNCSOAPHeaders, bsncPrepareSOAPRequest },
    ) => {
        function soapUpdateNetworkBSNC( networkID, networkName, activityPeriod, renewalDate, suspend ) {
            logExecution('DEBUG', ' ', '===================== Create Network ========================');
            logExecution('DEBUG', 'networkAdmin ', networkID);
            logExecution('DEBUG', 'networkName ', networkName);
            logExecution('DEBUG', 'activityPeriod ', activityPeriod);
            logExecution('DEBUG', 'renewalDate ', renewalDate);
            logExecution('DEBUG', 'suspend ', suspend);

            const res = { error: '', result: false };
            const subLevel = 'Content';

            if (isNullOrEmpty(networkName)) {
                throw new Error('Error: NetworkName is Empty.');
            }

            if (isNullOrEmpty(activityPeriod)) {
                throw new Error('Error: activityPeriod is Empty.');
            }

            if (isNullOrEmpty(renewalDate)) {
                throw new Error('Error: renewalDate is Empty.');
            }

            if (suspend !== true) {
                suspend = false;
            }


            const soapBody = `
                    <soapenv:Body xmlns:bsn="BSN.WebServices.Admin.DTO.2019.03">
                        <soap:UpdateNetwork>
                            <soap:entity xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
                                <bsn:BillingMode>
                                    <bsn:SubscriptionsActivityPeriod>${activityPeriod}</bsn:SubscriptionsActivityPeriod>
                                    <bsn:SubscriptionsRenewalDate>${renewalDate}</bsn:SubscriptionsRenewalDate>
                                </bsn:BillingMode>
                                
                                <bsn:CreationDate>0001</bsn:CreationDate>
                                <bsn:Id>${networkID}</bsn:Id>
                                <bsn:IsLockedOut>${suspend}</bsn:IsLockedOut>
                                
                                <bsn:LastLockoutDate i:nil="true" />
                                <bsn:LockoutDate i:nil="true" />
                                <bsn:Name>${networkName}</bsn:Name>

                                <bsn:Subscription>
                                    <bsn:Level>${subLevel}</bsn:Level>
                                </bsn:Subscription>
                            </soap:entity>
                        </soap:UpdateNetwork>
                    </soapenv:Body>
                `;

            const soapData = bsncPrepareSOAPRequest(soapBody);
            logExecution('DEBUG', 'soap ' , soapData);

            logExecution('DEBUG', 'remaining usage ' , runtime.getCurrentScript().getRemainingUsage());
            const soapHeaders = getBSNCSOAPHeaders('UpdateNetwork');

            const serverResponse = https.post({
                url: soapHeaders['endPoint'],
                headers: soapHeaders,
                body: soapData
            });

            logExecution('DEBUG', 'requestServer ' , serverResponse.body);

            const soapResponse = xml.Parser.fromString({
                text: serverResponse.body
            });

            const errorCodeNode = xml.XPath.select({
                node : soapResponse,
                xpath : '//faultstring'
            });

            if(isNullOrEmpty(errorCodeNode.textContent)){
                logExecution('DEBUG', 'requestBody ', serverResponse.body);

                const result = serverResponse.body.match(/>true</i);
                logExecution('DEBUG', 'suspend network result ' , result && result[0] == ">true<");

                if(result && result[0] == ">true<"){
                    res.result = true;
                } else {
                    throw new Error('Network Suspend Failed. Contact your administrator.');
                }
            } else {
                throw new Error(`SOAP Error: ${errorCodeNode.textContent}`);

            }

            return res;
        }

        function soapGetDeviceSubscriptions(filter, sort){
            logExecution('DEBUG', ' ' , '===================== Get Device Subscriptions ========================');
            logExecution('DEBUG', 'filter ' , filter);
            logExecution('DEBUG', 'sort ' , sort);

            const res = { error:"", subscriptions:[] };

            if( isNullOrEmpty(filter) ){
                throw new Error('Error: Filter is Empty');
            }

            if(isNullOrEmpty(sort)){
                sort = "[DeviceSubscription].[Id] ASC";
            }

            let nextMarker = '';
            let findMore = false;

            const subscriptions = [];

            do{
                let soapMarker = '';

                if(isNullOrEmpty(nextMarker)){
                    soapMarker = `<soap:marker i:nil="true"/>`;
                } else {
                    soapMarker = `<soap:marker>${nextMarker}</soap:marker>`;
                }

                const soapBody = `
                        <soapenv:Body xmlns:bsn="BSN.WebServices.Admin.DTO.2019.03" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
                            <soap:GetDeviceSubscriptions>
                                <soap:filter>${filter}</soap:filter>
                                <soap:sort>${sort}</soap:sort>
                                ${soapMarker}
                                <soap:pageSize>100</soap:pageSize>
                            </soap:GetDeviceSubscriptions>
                        </soapenv:Body>
                    `;

                const soapData = bsncPrepareSOAPRequest(soapBody);
                logExecution('DEBUG', 'soap ', soapData);

                const soapHeaders = getBSNCSOAPHeaders('GetDeviceSubscriptions');

                const serverResponse = https.post({
                    url: soapHeaders['endPoint'],
                    headers: soapHeaders,
                    body: soapData
                });

                logExecution('DEBUG', 'requestServer ' , serverResponse.body);

                // todo: soap envelope refactor
                // todo: check http status code

                const soapResponse = xml.Parser.fromString({
                    text: serverResponse.body
                });

                const errorCode = xml.XPath.select({
                    node : soapResponse,
                    xpath : '//s:Fault'
                });

                if(typeof(errorCode) === "undefined" || !errorCode.length ){
                    const resultNodes = xml.XPath.select({
                        node : soapResponse,
                        xpath : '/s:Envelope/s:Body/GetDeviceSubscriptionsResponse'
                    });

                    const resultsCount = xml.XPath.select({
                        node : soapResponse,
                        xpath : "//a:MatchingItemCount"
                    }).textContent;

                    findMore = xml.XPath.select({
                        node : soapResponse,
                        xpath : "//a:IsTruncated"
                    }).textContent;

                    nextMarker = xml.XPath.select({
                        node : soapResponse,
                        xpath : "//a:NextMarker"
                    }).textContent;

                    if(resultsCount && resultsCount !== "0"){
                        const rawSubscriptions = nextMarker = xml.XPath.select({
                            node : soapResponse,
                            xpath : "//b:DeviceSubscription"
                        });

                        for (let i = 0; i < rawSubscriptions.length ; i++){
                            subscriptions[subscriptions.length++] = bsncParseSubscriptionInfo( rawSubscriptions[i], "b:" );
                        }
                    }
                } else {
                    const errorMessage = xml.XPath.select({
                        node : errorCode[0],
                        xpath : 'faultstring',
                    }).textContent;

                    throw new Error(`SOAP error: ${errorMessage}`);
                }
            } while(findMore === 'true');

            res.subscriptions = subscriptions;
            return res;
        }

        function soapDeleteDeviceSubscriptions(subscriptionIds, invoiceNum) {
            logExecution('DEBUG', ' ' , '===================== Delete Device Subscriptions ========================');
            logExecution('DEBUG', 'subscriptionIds ' , subscriptionIds);
            logExecution('DEBUG', 'invoiceNum ' , invoiceNum);

            const res = { error:"", deleted:0 };

            if(!Array.isArray(subscriptionIds) || !subscriptionIds.length){
                throw new Error('Error: subscriptionIds Empty, nothing to delete.');
            }

            let deleted = 0;

            do {
                let soapSubscriptionIds = '';

                for(let i = 0; deleted < subscriptionIds.length && i < 100; deleted++, i++){
                    soapSubscriptionIds += `<arr:int>${subscriptionIds[deleted]}</arr:int>`;
                }

                const soapBody = `
                        <soapenv:Body xmlns:bsn="BSN.WebServices.Admin.DTO.2019.03" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">
                            <soap:DeleteDeviceSubscriptions>
                                <soap:subscriptionIds>
                                    ${soapSubscriptionIds}
                                </soap:subscriptionIds>
                            </soap:DeleteDeviceSubscriptions>
                        </soapenv:Body>
                    `;

                const soapData = bsncPrepareSOAPRequest(soapBody);
                logExecution('DEBUG', 'soap ' , soapData);

                const soapHeaders = bsncSOAPHeaders( 'DeleteDeviceSubscriptions' );

                const serverResponse = https.post({
                    url: soapHeaders['endPoint'],
                    headers: soapHeaders,
                    body: soapData
                });

                logExecution('DEBUG', 'requestServer ' , serverResponse.body);

                // todo: soap envelope refactor
                // todo: check http status code

                const soapResponse = xml.Parser.fromString({
                    text: serverResponse.body
                });

                const errorCode = xml.XPath.select({
                    node : soapResponse,
                    xpath : '//s:Fault'
                });

                if( typeof( errorCode ) === "undefined" || !errorCode.length ){
                    const result = serverResponse.body.match(/>true</i);

                    if( result !== ">true<" ){
                        res.error = 'Subscriptions were not deleted. Please contact Admin to delete those manually. SubscriptionID=' + invoiceNum;
                    }
                } else {
                    const errorMessage = xml.XPath.select({
                        node : errorCode[0],
                        xpath : 'faultstring',
                    }).textContent;

                    throw new Error(`SOAP error: ${errorMessage}`);
                }
            } while(deleted < subscriptionIds.length);

            res.deleted = deleted;
            return res;
        }

        return {
            soapUpdateNetworkBSNC,
            soapGetDeviceSubscriptions,
            soapDeleteDeviceSubscriptions,
        }
    });
