/**
 * @NApiVersion 2.1
 */
define([
        './bs_cm_general_utils',
        './data_structures/bs_cm_bsnc_network',
        './data_structures/bs_cm_bsnc_user',
        './bs_cm_soap_utils',
        './bs_cm_date_utils',
        'N/runtime',
        'N/https',
        'N/xml'
    ],
    
    (
        { logExecution, isNullOrEmpty },
        { BSNCNetwork },
        { BSNCUser },
        { getBSNCSOAPHeaders, bsncPrepareSOAPRequest },
        { getUTCDate },
        runtime,
        https,
        xml,
    ) => {

        const soapGetNetworkByNameBSNC = (networkName) => {
            logExecution('DEBUG', ' ' , '===================== Get Network By Name ========================');
            logExecution('DEBUG', 'networkId ' , networkName);

            if(isNullOrEmpty(networkName)){
                return new BSNCNetwork( { 'IsError': true, 'Message': 'Error: NetworkName is Empty' } );
            }

            let error = "";
            let loadUsers = false;

            try {
                const soapBody = `
                    <soapenv:Body>
                        <soap:GetNetworkByName>
                            <soap:name>${networkName}</soap:name>
                            <soap:loadUsers>${loadUsers}</soap:loadUsers>
                        </soap:GetNetworkByName>
                    </soapenv:Body>
                `;

                const soapData = bsncPrepareSOAPRequest(soapBody);
                logExecution('DEBUG', 'soap ' , soapData);

                logExecution('DEBUG', 'remaining usage ' , runtime.getCurrentScript().getRemainingUsage());
                const soapHeaders = getBSNCSOAPHeaders( 'GetNetworkByName' );

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

                const errorCodeNode = xml.XPath.select({
                    node : soapResponse,
                    xpath : '//faultstring'
                });

                if(isNullOrEmpty(errorCodeNode.textContent)){
                    const resultsId = xml.XPath.select({
                        node : soapResponse,
                        xpath : '//a:Id'
                    });

                    logExecution('DEBUG', 'resultsId ', resultsId );

                    if( resultsId && resultsId !== "0" ){
                        return BSNCNetwork.fromSOAPResponse( soapResponse );
                    } else {
                        return new BSNCNetwork( { 'IsError': true, 'Message': 'Network "' + networkName + '" was not found.' } );
                    }
                } else {
                    return new BSNCNetwork( { 'IsError': true, 'Message': errorCode } );
                }
            } catch(e) {
                logExecution('DEBUG', 'Exception ', e.message );
                logExecution('DEBUG', 'Exception ', e.stack);
                logExecution('DEBUG', 'Exception ', e.toString());

                error = e.message;
            }

            return new BSNCNetwork( { 'IsError': true, 'Message': error } );
        };

        const soapUpdateNetworkBillingModeBSNC = (networkId, activityPeriod, renewalDate) => {
            logExecution('DEBUG', ' ' , '===================== Update Network Billing Mode ========================');
            logExecution('DEBUG', 'networkId ' , networkId);
            logExecution('DEBUG', 'activityPeriod ' , activityPeriod);
            logExecution('DEBUG', 'renewalDate ' , renewalDate);

            const res = { error:"", result: false };

            if( isNullOrEmpty(networkId) ){
                res.error = "Error: NetworkId is Empty";
                return res;
            }

            if( isNullOrEmpty(activityPeriod) ){
                res.error = "Error: activityPeriod is Empty";
                return res;
            }

            if( isNullOrEmpty(renewalDate) ){
                res.error = "Error: renewalDate is Empty";
                return res;
            }

            try{
                const soapBody = `
                <soapenv:Body xmlns:bsn="BSN.WebServices.Admin.DTO.2019.03" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
                    <soap:UpdateNetworkBillingMode xmlns="https://api.bsn.cloud/Admin/2019/03/SOAP/">';
                    <soap:networkId>${networkId}</soap:networkId>
                        <soap:billingMode>
                            <bsn:SubscriptionsActivityPeriod>${activityPeriod}</bsn:SubscriptionsActivityPeriod>
                            <bsn:SubscriptionsRenewalDate>${renewalDate}</bsn:SubscriptionsRenewalDate>
                        </soap:billingMode>
                    </soap:UpdateNetworkBillingMode>
                </soapenv:Body>
                `
                const soapData = bsncPrepareSOAPRequest(soapBody);

                logExecution('DEBUG', 'soap ' , soapData);

                const soapHeaders = getBSNCSOAPHeaders( 'UpdateNetworkBillingMode' );
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

                if( typeof( errorCode ) == "undefined" || !errorCode.length ){
                    const result = serverResponse.body.match(/>true</i);

                    logExecution('DEBUG', 'update billing mode result ' , result && result[0] === ">true<");
                    if( result && result[0] === ">true<" ) {
                        res.result = true;
                    } else {
                        res.error = "Network Billing Mode Update Failed. Contact your administrator.";
                    }
                } else {
                    res.error = xml.XPath.select({
                        node: errorCode[0],
                        xpath: "faultstring",
                    }).textContent;
                }
            } catch(e) {
                logExecution('DEBUG', 'Exception ', e.message);
                logExecution('DEBUG', 'Exception ', e.stack);
                logExecution('DEBUG', 'Exception ', e.toString());

                res.error = e.message;
            }

            return res;
        };

        const soapSetNetworkContentBSNC = (networkId, networkType, endDate) => {
            logExecution('DEBUG', ' ' , '===================== Set Network Type Content ========================');
            logExecution('DEBUG', 'networkId ' , networkId);
            logExecution('DEBUG', 'networkType' , networkType);

            const res = { error: "", result: false };

            if( isNullOrEmpty(networkId) ){
                res.error = "Error: NetworkId is Empty";
                return res;
            }

            if(isNullOrEmpty(endDate)){
                endDate = null;
            }

            switch(networkType){
                case "Content":
                case "Control": break;
                default: networkType = "Content"; break;
            }

            try {
                const soapBody = `
                <soapenv:Body>
                    <soap:SetNetworkSubscription>
                        <soap:networkId>${networkId}</soap:networkId>
                        <soap:networkSubscription xmlns:bsn="BSN.WebServices.Admin.DTO.2019.03">
                            ${endDate !== null ? '<bsn:ExpireDate>' + endDate + '</bsn:ExpireDate>' : ''}
                            <bsn:Level>${networkType}</bsn:Level>
                        </soap:networkSubscription>
                    </soap:SetNetworkSubscription>
                </soapenv:Body>
  
                `;

                const soapData = bsncPrepareSOAPRequest(soapBody);
                logExecution('DEBUG', 'soap ' , soapData);

                const soapHeaders = bsncSOAPHeaders('SetNetworkSubscription');
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

                const errorCodeNode = xml.XPath.select({
                    node : soapResponse,
                    xpath : '//faultstring'
                });

                if(isNullOrEmpty(errorCodeNode.textContent)){
                    logExecution('DEBUG', 'set network type Content' , true);
                    res.result = true;
                }
            } catch(e) {
                logExecution('DEBUG', 'Exception ', e.message );
                logExecution('DEBUG', 'Exception ', e.stack);
                logExecution('DEBUG', 'Exception ', e.toString());

                res.error = e.message;
            }

            return res;
        }

        const soapCreateDeviceSubscriptionsBSNC = (subscriptions) => {
            logExecution('DEBUG', ' ' , '===================== Create Device Subscriptions ========================');
            logExecution('DEBUG', 'subscriptions ', subscriptions);

            const res = { error:"", newSubscriptions:[] };

            if( !Array.isArray(subscriptions) || ( Array.isArray(subscriptions) && !subscriptions.length ) ){
                res.error = "Error: subscriptions empty, nothing to create.";
                return res;
            } else if( !Array.isArray(subscriptions[0]) || ( Array.isArray(subscriptions[0]) && subscriptions[0].length !== 6 ) ){
                res.error = "Error: subscriptions data is wrong.";
                return res;
            }

            try{
                const newSubscriptions = [];
                const created = 0;

                do{
                    const timeStamp = getUTCDate();
                    let soapSubscriptions = '';

                    for(let i = 0; created < subscriptions.length && i < 100; created++, i++) {
                        soapSubscriptions += `
                        <bsn:DeviceSubscription>
                            <bsn:ActivationDate>${timeStamp}</bsn:ActivationDate>
                            <bsn:ActivityPeriod>${subscriptions[i][0]}</bsn:ActivityPeriod>
                            <bsn:CreationDate>${timeStamp}</bsn:CreationDate>
                            
                            <bsn:Device>
                                <bsn:Id>${subscriptions[i][1]}</bsn:Id>
                                <bsn:Serial>${subscriptions[i][2]}</bsn:Serial>
                            </bsn:Device>
                            
                            <bsn:ExpirationDate i:nil="true"/>
                            <bsn:Id>0</bsn:Id>
                            <bsn:InvoiceNumber>${subscriptions[i][3]}</bsn:InvoiceNumber>
                            <bsn:IsDeleted>false</bsn:IsDeleted>
                            <bsn:KeyId i:nil="true"/>
                            
                            <bsn:Network>
                                <bsn:Id>${subscriptions[i][4]}</bsn:Id>
                                <bsn:Name>${subscriptions[i][5]}</bsn:Name>
                            </bsn:Network>
                            
                            <bsn:RenewalMethod>Automatic</bsn:RenewalMethod>
                            <bsn:Status>Active</bsn:Status>
                            <bsn:SuspensionDate i:nil="true"/>
                            <bsn:Traffic>0</bsn:Traffic>
                            <bsn:Type>Commercial</bsn:Type>
                        </bsn:DeviceSubscription>
                        `
                    }

                    const soapBody = `
                        <soapenv:Body xmlns:bsn="BSN.WebServices.Admin.DTO.2019.03" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
                            <soap:CreateDeviceSubscriptions>
                                <soap:entities>
                                    ${soapSubscriptions}
                                </soap:entities>
                            </soap:CreateDeviceSubscriptions>
                        </soapenv:Body>
                    `;

                    const soapData = bsncPrepareSOAPRequest(soapBody);
                    logExecution('DEBUG', 'soap ' , soapData);

                    const soapHeaders = bsncSOAPHeaders('CreateDeviceSubscriptions');

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
                        const createdSubs = xml.XPath.select({
                            node : soapResponse,
                            xpath : "//a:DeviceSubscription"
                        });

                        for (var i = 0; i < createdSubs.length ; i++){
                            newSubscriptions.push( bsncParseSubscriptionInfo( createdSubs[i], "a:" ) );
                        }
                    } else {
                        res.error = xml.XPath.select({
                            node : errorCode[0],
                            xpath : 'faultstring'
                        }).textContent;
                    }
                } while(created < subscriptions.length);

                res.newSubscriptions = newSubscriptions;
            } catch(e) {
                logExecution('DEBUG', 'Exception ', e.message );
                logExecution('DEBUG', 'Exception ', e.stack);
                logExecution('DEBUG', 'Exception ', e.toString());

                res.error = e.message;
            }
            return res;
        }

        const soapDeleteDeviceSubscriptionsBSNC = ( subscriptionIds, invoiceNum ) => {
            logExecution('DEBUG', ' ' , '===================== Delete Device Subscriptions ========================');
            logExecution('DEBUG', 'subscriptionIds ' , subscriptionIds);
            logExecution('DEBUG', 'invoiceNum ' , invoiceNum);

            const res = { error:"", deleted:0 };

            if(!Array.isArray(subscriptionIds) || !subscriptionIds.length){
                res.error = "Error: subscriptionIds Empty, nothing to delete.";
                return res;
            }

            try{
                const deleted = 0;

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
                        res.error = xml.XPath.select({
                            node : errorCode[0],
                            xpath : '//faultstring'
                        });
                    }
                } while(deleted < subscriptionIds.length);

                res.deleted = deleted;
            } catch(e) {
                logExecution('DEBUG', 'Exception ', e.message );
                logExecution('DEBUG', 'Exception ', e.stack);
                logExecution('DEBUG', 'Exception ', e.toString());

                res.error = e.message;
            }
            return res;
        }

        const soapGetDeviceSubscriptionsBSNC = ( filter, sort ) => {
            logExecution('DEBUG', ' ' , '===================== Get Device Subscriptions ========================');
            logExecution('DEBUG', 'filter ' , filter);
            logExecution('DEBUG', 'sort ' , sort);

            const res = { error:"", subscriptions:[] };

            if( isNullOrEmpty(filter) ){
                res.error = "Error: Filter is Empty";
                return res;
            }

            if( isNullOrEmpty(sort) ){
                sort = "[DeviceSubscription].[Id] ASC";
            }

            try{
                let nextMarker = '';
                let findMore = false;

                const subscriptions = [];

                do{
                    let soapMarker = '';

                    if( isNullOrEmpty(nextMarker) ){
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

                    const soapHeaders = getBSNCSOAPHeaders( 'GetDeviceSubscriptions' );

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
                        res.error = xml.XPath.select({
                            node : errorCode[0],
                            xpath : "faultstring"
                        }).textContent;
                    }
                } while(findMore === 'true');

                res.subscriptions = subscriptions;
            } catch(e){
                logExecution('DEBUG', 'Exception ', e.message );
                logExecution('DEBUG', 'Exception ', e.stack);
                logExecution('DEBUG', 'Exception ', e.toString());

                res.error = e.message;
            }
            return res;
        }

        const soapNetworkSubscriptionsCountBSNC = ( networkId, isTrial ) => {
            logExecution('DEBUG', ' ' , '===================== Network Subscriptions Count ========================');
            logExecution('DEBUG', 'networkId ' , networkId);
            logExecution('DEBUG', 'isTrial ' , isTrial);

            let errorMessage = '';

            if(isNullOrEmpty(networkId)){
                errorMessage = "Error: Network ID is Empty";
            }

            if(isTrial !== true){
                isTrial = false;
            }

            let notGrace = "";

            if(!isTrial){
                notGrace = " AND [DeviceSubscription].[Type] IS NOT 'Grace'";
            }

            if(errorMessage === "") {
                try {
                    const soapBody = `
                    <soapenv:Body xmlns:bsn="BSN.WebServices.Admin.DTO.2019.03" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
                        <soap:GetDeviceSubscriptions>
                            <soap:filter>[DeviceSubscription].[Network].[Id] IS ${networkId}${notGrace}</soap:filter>
                            <soap:sort>[DeviceSubscription].[Id] ASC</soap:sort>
                            <soap:marker i:nil="true"/>
                            <soap:pageSize>1</soap:pageSize>
                        </soap:GetDeviceSubscriptions>
                    </soapenv:Body>
                    `;

                    const soapData = bsncPrepareSOAPRequest(soapBody);
                    logExecution('DEBUG', 'soap ' , soapData);

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

                    if (typeof (errorCode) === "undefined" || !errorCode.length) {
                        const resultNodes = xml.XPath.select({
                            node : soapResponse,
                            xpath : "/s:Envelope/s:Body/GetDeviceSubscriptionsResponse"
                        });

                        const resultsCount = xml.XPath.select({
                            node : soapResponse,
                            xpath : "//a:MatchingItemCount"
                        }).textContent;

                        return {'error': false, 'message': "", quantity: parseInt(resultsCount)};
                    } else {
                        const faultCode = xml.XPath.select({
                            node : errorCode[0],
                            xpath : "faultcode"
                        }).textContent;

                        const faultString = xml.XPath.select({
                            node : errorCode[0],
                            xpath : "faultstring"
                        }).textContent;

                        errorMessage = `${faultCode}: ${faultString}`;
                    }
                } catch (e) {
                    logExecution('DEBUG', 'Exception ', e.message);
                    logExecution('DEBUG', 'Exception ', e.stack);
                    logExecution('DEBUG', 'Exception ', e.toString());

                    errorMessage = e.message;
                }
            }
            return {'error': true, 'message': errorMessage, quantity: 0};
        }

        const soapSetNetworkTrialBSNC = ( networkId ) => {
            logExecution('DEBUG', ' ' , '===================== Set Network Trial ========================');
            logExecution('DEBUG', 'networkId ' , networkId);

            if(isNullOrEmpty(networkId)){
                return "Error: Network ID is Empty";
            }

            try{
                const soapBody = `
                <soapenv:Body>
                    <soap:SetNetworkSubscription>
                        <soap:networkId>${networkId}</soap:networkId>
                        <soap:networkSubscription xmlns:bsn="BSN.WebServices.Admin.DTO.2019.03">
                            <bsn:Level>Trial</bsn:Level>
                        </soap:networkSubscription>
                    </soap:SetNetworkSubscription>
                </soapenv:Body>
                `;

                const soapData = bsncPrepareSOAPRequest(soapBody);
                logExecution('DEBUG', 'soap ' , soapData);

                const soapHeaders = bsncSOAPHeaders( 'SetNetworkSubscription' );
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
                    xpath : '//faultstring'
                }).textContent;

                if( isNullOrEmpty(errorCode) ){
                    const result = serverResponse.body.match(/>true</i);

                    if( result !== ">true<" ){
                        return 'Network was not converted to Trial mode.';
                    }
                } else {
                    return 'Error: ' + errorCode;
                }
            } catch(e) {
                logExecution('DEBUG', 'Exception ', e.message );
                logExecution('DEBUG', 'Exception ', e.name);
                logExecution('DEBUG', 'Exception ', e.toString());
            }

            return false;
        }

        const soapGetNetworksByCustomerEmailBSNC = (customerEmail, selectedNetwork) => {
            logExecution('DEBUG', ' ' , '===================== Get Network By Customer Email ========================');
            logExecution('DEBUG', 'customerEmail ' , customerEmail);

            const res = { error:"", networks:[] };

            if(isNullOrEmpty(customerEmail)){
                logExecution('ERROR', 'ERROR ', "Network Admin Email Empty. Cannot search for Networks." );

                res.error = "Network Admin Email Empty. Cannot search for Networks.";
                return res;
            }

            try{
                let findMore = false;
                let nextMarker = 0;

                const users = [];
                const networks = [];

                // selectedNetwork - nlapiGetFieldValue("bs_default_network");

                do {
                    const soapBody = `
                        <soapenv:Body>
                            <soap:FindUsers>
                                <soap:namePattern>${customerEmail}</soap:namePattern>
                                <soap:marker>${nextMarker}</soap:marker>
                                <soap:pageSize>100</soap:pageSize>
                            </soap:FindUsers>
                        </soapenv:Body>
                    `;

                    const soapData = bsncPrepareSOAPRequest(soapBody);
                    logExecution('DEBUG', 'soap ' , soapData);

                    logExecution('DEBUG', 'remaining usage ' , runtime.getCurrentScript().getRemainingUsage());
                    const soapHeaders = bsncSOAPHeaders('FindUsers');

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

                    if( typeof( errorCode ) == "undefined" || !errorCode.length ){
                        const resultNodes = xml.XPath.select({
                            node : soapResponse,
                            xpath : '/s:Envelope/s:Body/FindUsersResponse'
                        });

                        const resultsCount = xml.XPath.select({
                            node : soapResponse,
                            xpath : '//a:MatchingItemCount'
                        }).textContent;

                        findMore = xml.XPath.select({
                            node : soapResponse,
                            xpath : '//a:IsTruncated'
                        }).textContent;

                        nextMarker = xml.XPath.select({
                            node : soapResponse,
                            xpath : '//a:NextMarker'
                        }).textContent;


                        if( resultsCount && resultsCount != "0" ){
                            const rawUsers = xml.XPath.select({
                                node : soapResponse,
                                xpath : '//b:User'
                            });

                            const noDefaultNetwork = isNullOrEmpty(selectedNetwork);

                            for (let i = 0; i < rawUsers.length ; i++){
                                users[users.length++] = BSNCUser.fromSOAPResponse( rawUsers[i] );
                                const netId = xml.XPath.select({
                                    node : rawUsers[i],
                                    xpath : 'b:Network/b:Id'
                                }).textContent;

                                const netName = xml.XPath.select({
                                    node : rawUsers[i],
                                    xpath : 'b:Network/b:Name'
                                }).textContent;

                                networks.push([netId, netName, netId === selectedNetwork || (noDefaultNetwork && !i) ? "selected" : ""]);
                            }
                        }
                    } else {
                        const faultCode = xml.XPath.select({
                            node : errorCode[0],
                            xpath : "faultcode"
                        }).textContent;

                        const faultstring = xml.XPath.select({
                            node : errorCode[0],
                            xpath : "faultstring"
                        }).textContent;

                        logExecution('ERROR', 'ERROR ', `${faultCode}: ${faultstring}`);
                        res.error = faultstring;
                        return res;
                    }
                } while(findMore == 'true');

                if( networks.length ) {
                    networks.sort((o1, o2) => {
                        return o1[1] > o2[1] ? 1 : o1[1] < o2[1] ? -1 : 0;
                    });
                    res.networks = networks;
                    res.error = "";
                } else {
                    res.error = "No Networks for " + customerEmail;
                }

            } catch(e) {
                logExecution('DEBUG', 'Exception ', e.message );
                logExecution('DEBUG', 'Exception ', e.stack);
                logExecution('DEBUG', 'Exception ', e.toString());

                res.error = e.message;
            }

            return res;
        }

        const soapGetNetworkByIdBSNC = ( networkId, loadUsers ) => {
            logExecution('DEBUG', ' ' , '===================== Get Network By Id ========================');
            logExecution('DEBUG', 'networkId ' , networkId);

            if( isNullOrEmpty(networkId) ){
                return new bsncNetwork( { 'IsError': true, 'Message': 'Error: NetworkId is Empty' } );
            }

            if (isNullOrEmpty( loadUsers ) ) {
                loadUsers = false;
            }

            try{
                const soapBody = `
                    <soapenv:Body>
                        <soap:GetNetworkById>
                            <soap:networkId>${networkId}</soap:networkId>
                            <soap:loadUsers>${loadUsers}</soap:loadUsers>
                        </soap:GetNetworkById>
                    </soapenv:Body>
                `;

                const soapData = bsncPrepareSOAPRequest(soapBody);
                logExecution('DEBUG', 'soap ' , soapData);

                logExecution('DEBUG', 'remaining usage ' , runtime.getCurrentScript().getRemainingUsage());

                const soapHeaders = bsncSOAPHeaders( 'GetNetworkById' );
                const serverResponse = https.post({
                    url: soapHeaders['endPoint'],
                    headers: soapHeaders,
                    body: soapData
                });

                logExecution('DEBUG', 'requestServer ' , serverResponse.body);

                const soapResponse = xml.Parser.fromString({
                    text: serverResponse.body
                });

                const errorCode = xml.XPath.select({
                    node : soapResponse,
                    xpath : '//faultstring'
                }).textContent;

                if(isNullOrEmpty(errorCode)){
                    const resultsId = xml.XPath.select({
                        node : soapResponse,
                        xpath : '//a:Id'
                    }).textContent;

                    logExecution('DEBUG', 'resultsId ', resultsId );

                    if( resultsId && resultsId !== "0" ){
                        return BSNCNetwork.fromSOAPResponse(soapResponse);
                    }
                } else {
                    return new BSNCNetwork( { 'IsError': true, 'Message': errorCode } );
                }
            } catch(e) {
                logExecution('DEBUG', 'Exception ', e.message );
                logExecution('DEBUG', 'Exception ', e.stack);
                logExecution('DEBUG', 'Exception ', e.toString());

                return new BSNCNetwork( { 'IsError': true, 'Message': e.message } );
            }
            return new BSNCNetwork( { 'IsError': true, 'Message': 'No network found with ID ' + networkId } );
        }

        const soapCreateUserBSNC = ( networkAdmin, networkId, password ) => {
            logExecution('DEBUG', ' ' , '===================== Create Network Admin ========================');
            logExecution('DEBUG', 'networkAdmin ' , networkAdmin);
            logExecution('DEBUG', 'networkId ' , networkId);
            logExecution('DEBUG', 'password ' , password);

            let errorMessage = "";

            if( isNullOrEmpty(networkId) ){
                errorMessage += "Error: NetworkId is Empty<br>";
            }

            if( isNullOrEmpty(networkAdmin) ){
                errorMessage += "Error: Admin Email is Empty<br>";
            }

            if( isNullOrEmpty(password) ){
                errorMessage += "Error: password is Empty<br>";
            }

            if( errorMessage === "" ){
                try{
                    const soapBody = `
                        <soapenv:Body xmlns:bsn="BSN.WebServices.Admin.DTO.2019.03">
                            <soap:CreateUser>';
                                <soap:user xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
                                    <bsn:CreationDate>0001</bsn:CreationDate>
                                    <bsn:Description>NetSuite Created</bsn:Description>
                                    <bsn:Email>${networkAdmin}f</bsn:Email>
                                    <bsn:FirstName></bsn:FirstName>
                                    <bsn:Id>0</bsn:Id>
                                    <bsn:IsLockedOut>false</bsn:IsLockedOut>
                                    <bsn:LastLockoutDate i:nil="true" />
                                    <bsn:LastLoginDate i:nil="true" />
                                    <bsn:LastName></bsn:LastName>
                                    <bsn:Login>${networkAdmin}</bsn:Login>
                                    
                                    <bsn:Network>
                                        <bsn:Id>${networkId}</bsn:Id>
                                        <bsn:Name></bsn:Name>
                                    </bsn:Network>
                                    
                                    <bsn:Password>${password}</bsn:Password>
                                    <bsn:RoleName>Administrators</bsn:RoleName>
                                </soap:user>
                            </soap:CreateUser>
                        </soapenv:Body>
                    `;

                    const soapData = bsncPrepareSOAPRequest(soapBody);
                    logExecution('DEBUG', 'soap ' , soapData);

                    logExecution('DEBUG', 'remaining usage ' , runtime.getCurrentScript().getRemainingUsage());
                    const soapHeaders = bsncSOAPHeaders( 'CreateUser' );

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
                        const resultsId = xml.XPath.select({
                            node : soapResponse,
                            xpath : "//a:Id"
                        }).textContent;



                        if( resultsId && resultsId !== "0" ){
                            return bsncParseNetworkUserInfo( soapResponse );
                        } else {
                            errorMessage = "User was not created. Please contact your administrator.";
                        }
                    } else {
                        errorMessage = nlapiSelectValue(errorCode[0], "faultcode") + ': ' + nlapiSelectValue(errorCode[0], "faultstring");
                    }
                }catch(e){
                    nlapiLogExecution('DEBUG', 'Exception ', e.message );
                    nlapiLogExecution('DEBUG', 'Exception ', e.stack);
                    nlapiLogExecution('DEBUG', 'Exception ', e.toString());
                    errorMessage = e.message;
                }
            }
            return new bsncNetworkAdmin( { 'IsError': true, 'Message': errorMessage } );
        }

        return {
            soapGetNetworkByNameBSNC,
            soapUpdateNetworkBillingModeBSNC,
            soapSetNetworkContentBSNC,
            soapCreateDeviceSubscriptionsBSNC,
            soapDeleteDeviceSubscriptionsBSNC,
            soapGetDeviceSubscriptionsBSNC,
            soapNetworkSubscriptionsCountBSNC,
            soapSetNetworkTrialBSNC,
            soapGetNetworksByCustomerEmailBSNC,
            soapGetNetworkByIdBSNC,
        }

    });
