function bsncParseUserInfo( soapResponse ){
    var args = {
        "CreationDate" : nlapiSelectValue(soapResponse, "b:CreationDate"),
        "Description" : nlapiSelectValue(soapResponse, "b:Description"),
        "Email" : nlapiSelectValue(soapResponse, "b:Email"),
        "FirstName" : nlapiSelectValue(soapResponse, "b:FirstName"),
        "Id" : nlapiSelectValue(soapResponse, "b:Id"),
        "IsLockedOut" : nlapiSelectValue(soapResponse, "b:IsLockedOut"),
        "LastName" : nlapiSelectValue(soapResponse, "b:LastName"),
        "Login" : nlapiSelectValue(soapResponse, "b:Login"),
        "RoleName" : nlapiSelectValue(soapResponse, "b:RoleName"),
        "NetworkId" : nlapiSelectValue(soapResponse, "b:Network/b:Id"),
        "NetworkName" : nlapiSelectValue(soapResponse, "b:Network/b:Name")
    };

    return new bsncUser( args );
}

function bsncParseSubscriptionInfo( soapResponse, prefix ){
    var args = {
        "ActivationDate" : nlapiSelectValue(soapResponse, prefix + "ActivationDate"),
        "ActivityPeriod" : nlapiSelectValue(soapResponse, prefix + "ActivityPeriod"),
        "CreationDate" : nlapiSelectValue(soapResponse, prefix + "CreationDate"),
        "DeviceId" : nlapiSelectValue(soapResponse, prefix + "Device/" + prefix + "Id"),
        "DeviceSerial" : nlapiSelectValue(soapResponse, prefix + "Device/" + prefix + "Serial"),
        "ExpirationDate" : nlapiSelectValue(soapResponse, prefix + "ExpirationDate"),
        "Id" : nlapiSelectValue(soapResponse, prefix + "Id"),
        "InvoiceNumber" : nlapiSelectValue(soapResponse, prefix + "InvoiceNumber"),
        "IsDeleted" : nlapiSelectValue(soapResponse, prefix + "IsDeleted"),
        "KeyId" : nlapiSelectValue(soapResponse, prefix + "KeyId"),
        "NetworkId" : nlapiSelectValue(soapResponse, prefix + "Network/" + prefix + "Id"),
        "NetworkName" : nlapiSelectValue(soapResponse, prefix + "Network/" + prefix + "Name"),
        "RenewalMethod" : nlapiSelectValue(soapResponse, prefix + "RenewalMethod"),
        "Status" : nlapiSelectValue(soapResponse, prefix + "Status"),
        "SuspensionDate" : nlapiSelectValue(soapResponse, prefix + "SuspensionDate"),
        "Traffic" : nlapiSelectValue(soapResponse, prefix + "Traffic"),
        "Type" : nlapiSelectValue(soapResponse, prefix + "Type")
    };

    return new bsncSubscription( args );
}

function bsncParseNetworkInfo( soapResponse ){
    var args = {
        "SubscriptionsActivityPeriod" : nlapiSelectValue(soapResponse, "//a:BillingMode/a:SubscriptionsActivityPeriod"),
        "SubscriptionsRenewalDate" : nlapiSelectValue(soapResponse, "//a:BillingMode/a:SubscriptionsRenewalDate"),
        "CreationDate" : nlapiSelectValue(soapResponse, "//a:CreationDate"),
        "Id" : nlapiSelectValue(soapResponse, "//a:Id"),
        "IsLockedOut" : nlapiSelectValue(soapResponse, "//a:IsLockedOut"),
        "LastLockoutDate" : nlapiSelectValue(soapResponse, "//a:LastLockoutDate"),
        "LockoutDate" : nlapiSelectValue(soapResponse, "//a:LockoutDate"),
        "Name" : nlapiSelectValue(soapResponse, "//a:Name"),
        "AutomaticDeviceSubscriptionsManagementEnabled" : nlapiSelectValue(soapResponse, "//a:Settings/a:AutomaticDeviceSubscriptionsManagementEnabled"),
        "AutomaticTaggedPlaylistApprovementEnabled" : nlapiSelectValue(soapResponse, "//a:Settings/a:AutomaticTaggedPlaylistApprovementEnabled"),
        "BrightAuthorAccessRestricted" : nlapiSelectValue(soapResponse, "//a:Settings/a:BrightAuthorAccessRestricted"),
        "WebUIAccessRestricted" : nlapiSelectValue(soapResponse, "//a:Settings/a:WebUIAccessRestricted"),
        "SetupCompletionDate" : nlapiSelectValue(soapResponse, "//a:SetupCompletionDate"),
        "NetworkSubscriptions" : [],
        "isTrial" : false,
        "wasTrial" : false,
        "isContent" : false,
        "isControl" : false,
    };

    var subInfo = [];
    var CreationDate = nlapiSelectNodes( soapResponse, "//a:NetworkSubscription/a:CreationDate" );
    var ExpireDate = nlapiSelectNodes( soapResponse, "//a:NetworkSubscription/a:ExpireDate" );
    var Id = nlapiSelectNodes( soapResponse, "//a:NetworkSubscription/a:Id" );
    var LastModifiedDate = nlapiSelectNodes( soapResponse, "//a:NetworkSubscription/a:LastModifiedDate" );
    var Level = nlapiSelectNodes( soapResponse, "//a:NetworkSubscription/a:Level" );
    for (var i = 0; i < CreationDate.length ; i++){
        subInfo[subInfo.length] = bsncParseNetworkSubscriptionInfo({
            "CreationDate": CreationDate[i].firstChild ? CreationDate[i].firstChild.nodeValue : CreationDate[i].firstChild,
            "ExpireDate": ExpireDate[i].firstChild ? ExpireDate[i].firstChild.nodeValue : ExpireDate[i].firstChild,
            "Id": Id[i].firstChild ? Id[i].firstChild.nodeValue : Id[i].firstChild,
            "LastModifiedDate": LastModifiedDate[i].firstChild ? LastModifiedDate[i].firstChild.nodeValue : LastModifiedDate[i].firstChild,
            "Level": Level[i].firstChild ? Level[i].firstChild.nodeValue : Level[i].firstChild
        });
        if( i && subInfo[i].Level == 'Trial' ){
            args.wasTrial = true;
        }
    }

    switch( subInfo[0].Level ){
        case 'Trial': args.isTrial = true; break;
        case 'Content': args.isContent = true; break;
        case 'Control': args.isControl = true; break;
        default: break;
    }

    if( subInfo.length ){
        args.NetworkSubscriptions = subInfo;
    }

    return new bsncNetwork( args );
}

function bsncParseNetworkSubscriptionInfo( args ){
    return new bsncNetworkSubscription( args );
}

function bsncUser( args ) {
    this.CreationDate = args['CreationDate'];
    this.Description = args['Description'];
    this.Email = args['Email'];
    this.FirstName = args['FirstName'];
    this.Id = args['Id'];
    this.IsLockedOut = args['IsLockedOut'];
    this.LastName = args['LastName'];
    this.Login = args['Login'];
    this.RoleName = args['RoleName'];
    this.NetworkId = args['NetworkId'];
    this.NetworkName = args['NetworkName'];
}

function bsncNetwork( args ) {
    this.IsError = args['IsError'] || false;
    this.Message = args['Message'];
    this.SubscriptionsActivityPeriod = args['SubscriptionsActivityPeriod'];
    this.SubscriptionsRenewalDate = args['SubscriptionsRenewalDate'];
    this.Id = args['Id'];
    this.IsLockedOut = args['IsLockedOut'];
    this.LastLockoutDate = args['LastLockoutDate'];
    this.LockoutDate = args['LockoutDate'];
    this.Name = args['Name'];
    this.AutomaticSubscriptionsManagementEnabled = args['AutomaticDeviceSubscriptionsManagementEnabled'];
    this.AutomaticTaggedPlaylistApprovementEnabled = args['AutomaticTaggedPlaylistApprovementEnabled'];
    this.BrightAuthorAccessRestricted = args['BrightAuthorAccessRestricted'];
    this.WebUIAccessRestricted = args['WebUIAccessRestricted'];
    this.SetupCompletionDate = args['SetupCompletionDate'];
    this.NetworkSubscriptions = args['NetworkSubscriptions'];
    this.isTrial = args['isTrial'];
    this.wasTrial = args['wasTrial'];
    this.isContent = args['isContent'];
    this.isControl = args['isControl'];
}

function bsncNetworkSubscription( args ) {
    this.CreationDate = args['CreationDate'];
    this.ExpireDate = args['ExpireDate'];
    this.Id = args['Id'];
    this.LastModifiedDate = args['LastModifiedDate'];
    this.Level = args['Level'];
}

function bsncSubscription( args ) {
    this.ActivationDate = args['ActivationDate'];
    this.ActivityPeriod = args['ActivityPeriod'];
    this.CreationDate = args['CreationDate'];
    this.DeviceId = args['DeviceId'];
    this.DeviceSerial = args['DeviceSerial'];
    this.ExpirationDate = args['ExpirationDate'];
    this.Id = args['Id'];
    this.InvoiceNumber = args['InvoiceNumber'];
    this.IsDeleted = args['IsDeleted'];
    this.KeyId = args['KeyId'];
    this.NetworkId = args['NetworkId'];
    this.NetworkName = args['NetworkName'];
    this.RenewalMethod = args['RenewalMethod'];
    this.Status = args['Status'];
    this.SuspensionDate = args['SuspensionDate'];
    this.Traffic = args['Traffic'];
    this.Type = args['Type'];
}