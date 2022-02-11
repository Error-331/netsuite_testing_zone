/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       21 Aug 2018     Eugene Karakovsky
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 *
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function bsncClientPageInit(type){
    soapGetNetworksByCustomerIdBSNC();
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort value change
 */
function bsncClientValidateField(type, name, linenum){
    //console.log(type);
    return true;
}

function soapGetNetworksByCustomerIdBSNC(){
    //var networkName = nlapiGetFieldValue("bs_network_name");
    var networkAdmin = nlapiGetFieldValue("bs_network_admin");
    /*
    if( isValEmpty(networkName) ){
        alert( "Network Name Empty!" );
        return;
    }
    */
    if( isValEmpty(networkAdmin) ){
        alert( "Network Admin Empty!" );
        return;
    }

    jQuery('#bs_select_network').html('<option value=""></option>');

    var headers = new bsncSOAPHeaders();
    var endPoint = headers.soapHeaders["endPoint"];
    var stSoapAction = headers.soapHeaders["soapAction"];
    //nlapiLogExecution('DEBUG', 'endPoint ', endPoint);
    var soapHeaders = new Array();
    soapHeaders['Host'] = headers.soapHeaders["Host"];
    soapHeaders['Content-Type'] = headers.soapHeaders["Content-Type"];
    soapHeaders['SOAPAction'] = stSoapAction + 'FindUsers';
    try{
        var findMore = false;
        var nextMarker = 0;
        var users = new Array();
        var networks = new Array();
        do{
            var soap='';
            soap += '<soapenv:Envelope xmlns:soap="https://api.bsn.cloud/Admin/2019/03/SOAP/" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">';
            soap += '<soapenv:Header>';
            soap += '<wsse:Security soapenv:mustUnderstand="1" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">';
            soap += '<wsse:UsernameToken wsu:Id="UsernameToken-' + headers.wsse["UsernameToken"] + '">';
            soap += '<wsse:Username>' + headers.wsse["Username"] + '</wsse:Username>';
            soap += '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + headers.wsse["Password"] + '</wsse:Password>';
            soap += '<wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">' + headers.wsse["Nonce"] + '</wsse:Nonce>';
            soap += '<wsu:Created>' + headers.wsse["Created"] + '</wsu:Created>';
            soap += '</wsse:UsernameToken>';
            soap += '</wsse:Security>';
            soap += '</soapenv:Header>';
            soap += '<soapenv:Body>';
            soap += '<soap:FindUsers>';
            soap += '<soap:namePattern>' + networkAdmin + '</soap:namePattern>';
            soap += '<soap:marker>' + nextMarker + '</soap:marker>';
            soap += '<soap:pageSize>100</soap:pageSize>';
            soap += '</soap:FindUsers>';
            soap += '</soapenv:Body>';
            soap += '</soapenv:Envelope>';

            var requestServer = nlapiRequestURL(endPoint, soap, soapHeaders);
            var soapResponse = nlapiStringToXML(requestServer.getBody());
            //nlapiLogExecution('DEBUG', 'requestServer ' , requestServer.getBody());
            var errorCode = nlapiSelectNodes( soapResponse, "//s:Fault" );
            if( typeof( errorCode ) == "undefined" || !errorCode.length ){
                var resultNodes = nlapiSelectNode( soapResponse, "/s:Envelope/s:Body/FindUsersResponse" );
                //console.log(resultNodes);
                var resultsCount = nlapiSelectValue(soapResponse, "//a:MatchingItemCount");
                findMore = nlapiSelectValue(soapResponse, "//a:IsTruncated");
                nextMarker = nlapiSelectValue(soapResponse, "//a:NextMarker");
                //nlapiLogExecution('DEBUG', 'resultsCount ' , resultsCount);
                if( resultsCount && resultsCount != "0" ){
                    var rawUsers = nlapiSelectNodes( soapResponse, "//b:User" );
                    for (var i = 0; i < rawUsers.length ; i++){
                        var args = {
                            "CreationDate" : nlapiSelectValue(rawUsers[i], "b:CreationDate"),
                            "Description" : nlapiSelectValue(rawUsers[i], "b:Description"),
                            "Email" : nlapiSelectValue(rawUsers[i], "b:Email"),
                            "FirstName" : nlapiSelectValue(rawUsers[i], "b:FirstName"),
                            "Id" : nlapiSelectValue(rawUsers[i], "b:Id"),
                            "IsLockedOut" : nlapiSelectValue(rawUsers[i], "b:IsLockedOut"),
                            "LastName" : nlapiSelectValue(rawUsers[i], "b:LastName"),
                            "Login" : nlapiSelectValue(rawUsers[i], "b:Login"),
                            "RoleName" : nlapiSelectValue(rawUsers[i], "b:RoleName"),
                            "NetworkId" : nlapiSelectValue(rawUsers[i], "b:Network/b:Id"),
                            "NetworkName" : nlapiSelectValue(rawUsers[i], "b:Network/b:Name"),
                        };
                        users[users.length++] = new bsnUser( args );

                        networks.push([nlapiSelectValue(rawUsers[i], "b:Network/b:Id"), nlapiSelectValue(rawUsers[i], "b:Network/b:Name")]);
                    }

                    networks.sort(function(o1, o2) { return o1[1] > o2[1] ? 1 : o1[1] < o2[1] ? -1 : 0; });

                    for (var i = 0; i < networks.length; i++){
                        jQuery('#bs_select_network').append('<option value="' + networks[i][0] + '">' + networks[i][1] + '</option>');
                    }
                    /*
                    //sorting results
                    if( resultsCount && resultsCount != "0" ){
                        var options = jQuery('#bs_select_network');
                        var arr = options.map(function(_, o) { return { t: jQuery(o).text(), v: o.value }; }).get();
                        console.log(arr);
                        arr.sort(function(o1, o2) { return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0; });
                        console.log(arr);
                        options.each(function(i, o) {
                          o.value = arr[i].v;
                          jQuery(o).text(arr[i].t);
                        });
                    }
                    */
                } else {
                    console.log("Nothing Found");
                }
            } else {
                alert(nlapiSelectValue(errorCode[0], "faultcode") + ': ' + nlapiSelectValue(errorCode[0], "faultstring"));
                //console.log(nlapiSelectValue(errorCode[0], "faultcode") + ': ' + nlapiSelectValue(errorCode[0], "faultstring"));
            }
        } while(findMore == 'true');
    }catch(e){
        nlapiLogExecution('DEBUG', 'Exception ' + e.message );
        nlapiLogExecution('DEBUG', 'Exception ' + e.name);
        nlapiLogExecution('DEBUG', 'Exception ' + e.toString());
    }
}

/***************** Prod ****************/
function bsncSOAPHeaders(){
    this.soapHeaders = {
        'endPoint' : 'https://api.bsn.cloud/Admin/2019/03/SOAP/Basic/',
        'Host' : 'api.bsn.cloud',
        'Content-Type' : 'text/xml; charset=utf-8',
        'soapAction' : 'https://api.bsn.cloud/Admin/2019/03/SOAP/AdminService/'
    };
    this.wsse = {
        'Username' : 'admin/nsadmin@bsn.cloud',
        'Password' : 'unirLQ7eMLEjU5',
        'Nonce' : 'bhhy+WNvKgJR6i3/9pn/WQ==',
        'Created' : '2018-05-17T10:00:17.773Z',
        'UsernameToken' : '230A06C4E1EC82958E1526551217774165'
    };
}
/*********************************/

/***************** Stage ****************
function bsncSOAPHeaders(){
    this.soapHeaders = {
        'endPoint' : 'https://ast.bsn.cloud/Admin/2019/03/SOAP/Basic/',
        'Host' : 'ast.bsn.cloud',
        'Content-Type' : 'text/xml; charset=utf-8',
        'soapAction' : 'https://api.bsn.cloud/Admin/2019/03/SOAP/AdminService/'
    };
    this.wsse = {
        'Username' : 'admin/orderadmin@brightsign.biz',
        'Password' : 'P@ssw0rd',
        'Nonce' : 'bhhy+WNvKgJR6i3/9pn/WQ==',
        'Created' : '2018-05-17T10:00:17.773Z',
        'UsernameToken' : '230A06C4E1EC82958E1526551217774165'
    };
}
/*********************************/

function useSelectedNetworkBSNC(){
    var networkId = nlapiGetFieldValue("bs_select_network");
    var networkAdmin = nlapiGetFieldValue("bs_network_admin");

    if( isValEmpty(networkAdmin) ){
        alert( "Network Admin Empty!" );
        return;
    }

    var suitelet = nlapiResolveURL('SUITELET', 'customscript_bsnc_create_network', 'customdeploy_bsnc_create_network');
    suitelet += '&bsn_email=' + networkAdmin;

    if( isNullorEmpty( networkId ) ){
        var win = new Ext.Window({
            id: 'createNetworkForm',
            title : "Create New Network",
            width : 490,
            height: 300,
            layout : 'fit',
            html: '<iframe src="' + suitelet + '" scrolling="no" height="220" width="460" frameborder="0">Loading...</iframe>'
        });
        win.show();
        //Ext.MessageBox.show({title:'Network Info Missing', msg:'Select a Network Name first!', icon : Ext.MessageBox.WARNING});
        return false;
    }

    //window.parent.nlapiSetFieldValue('custbody_bsn_network_id', nlapiGetFieldValue('bs_select_network'));
    //window.parent.nlapiSetFieldValue('custbody_bsn_network_name', jQuery("#bs_select_network option:selected").text());
    //window.parent.nlapiSetLineItemValue('item', "itemdescription", jQuery("#bs_linenum").val(), jQuery("#bs_select_network option:selected").text());
    window.parent.nlapiSetLineItemValue('item', "custcol_bsn_network_info", jQuery("#bs_linenum").val(), 'Name:' + jQuery("#bs_select_network option:selected").text() +
        '{{ID:' + jQuery("#bs_select_network option:selected").val() + '}}');

    var win=window.parent.Ext.getCmp('getNetworkName');
    if(win)win[win.closeAction]();
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

function isNullorEmpty(strVal){
    return (strVal == null || strVal == '');
}