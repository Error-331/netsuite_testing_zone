/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       10 Dec 2020     Eugene Karakovsky
 *
 */
var subs = Array();
var subs_csv = Array();
var expired = Array();
var invoiceStats = Array();
var periodStats = Array();
var endDateStats = Array();
var networkInfo = null;
var earliestEndDate = null;
var latestEndDate = null;
var earliestRenewalDate = moment();
var earliestNewRenewalDate = moment();
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function conversionPageInit(type){
    var networkId = nlapiGetFieldValue('bs_network');
    var networkType = nlapiGetFieldValue('bs_nettype');
    if( !isNullorEmpty(networkId) && networkType == 'T' ){
        bsnNetInfo( networkId );
    } else {
        bsncNetInfo( networkId );
    }
}

function bsnNetInfo(networkId){
    if( !isNullorEmpty(networkId) ){
        var networkSubscriptions = [];
        jQuery('#custpage_results_log_fs').text('');
        jQuery('#custpage_results_stats_fs').text('');
        jQuery('#custpage_netinfo_fs').text('');
        console.log("=================networkId=================\n" + networkId);
        if( networkId != '' ){
            console.log("=================networkId=================\n" + networkId);
            var filter = "[DeviceSubscription].[Network].[Id] IS " + networkId + " AND [DeviceSubscription].[Type] IS NOT 'Grace'";
            console.log("=================filter=================\n" + filter);
            var getSubscriptions = soapGetDeviceSubscriptions( filter );
            if( isNullorEmpty(getSubscriptions.error) ){
                networkSubscriptions = getSubscriptions.subscriptions;
            } else {
                console.log("=================getSubscriptions Error=================\n" + getSubscriptions.error);
            }
            console.log("=================networkSubscriptions=================");
            console.log(networkSubscriptions);
            networkInfo = soapGetNetworkById( networkId, true );
            console.log("=================networkInfo=================");
            console.log(networkInfo);
        }

        if( !isNullorEmpty( networkInfo ) ){
            if( typeof(networkInfo.Id) != 'undefined' ) {
                console.log("=================networkInfo=================\n" + JSON.stringify(networkInfo));
                var nInfo = '<br><b>NETWORK INFO</b><br>';
                var isSuspended = networkInfo.IsLockedOut == 'true';
                nInfo += '<div style="border: 1px solid black; padding: 10px; width: 280px;' + (isSuspended?'background-color:#fee;':'') + '">';
                if( isSuspended ) nInfo += '<b style="color:darkred">Suspended: </b>' + networkInfo.LastLockoutDate + '<br>';
                nInfo += '<b>ID:</b> ' + networkInfo.Id + '<br>';
                if (typeof (networkInfo.Name) != 'undefined') {
                    nInfo += '<b>Name:</b> ' + networkInfo.Name + '<br>';
                }
                console.log("=================typeof (networkInfo.SubscriptionsActivityPeriod)=================\n" + typeof (networkInfo.SubscriptionsActivityPeriod));
                if (typeof (networkInfo.SubscriptionsActivityPeriod) != 'undefined') {
                    var periodInfo = bsnGetPeriodBySOAP( networkInfo.SubscriptionsActivityPeriod );
                    nInfo += '<b>Activity Period:</b> ' + periodInfo.name + '<br>';
                }
                console.log("=================typeof (networkInfo.SubscriptionsRenewalDate)=================\n" + typeof (networkInfo.SubscriptionsRenewalDate));
                if (typeof (networkInfo.SubscriptionsRenewalDate) != 'undefined') {
                    nInfo += '<b>Expiration Date:</b> ' + networkInfo.SubscriptionsRenewalDate.substr(0,10) + '<br>';
                }
                nInfo += '</div>';
                jQuery('#custpage_netinfo_fs').html(nInfo);
            }
        }
        console.log("=================networkSubscriptions.length=================\n" + networkSubscriptions.length);

        subs = Array();
        subs_csv = Array();
        expired = Array();
        invoiceStats = Array();
        periodStats = Array();
        endDateStats = Array();
        var line = "";
        for( var i = 0; i < networkSubscriptions.length; i++ ){
            var delta = 2; // 2 months
            var period = bsnGetPeriodBySOAP( networkSubscriptions[i].ActivityPeriod );

            //console.log("=================!isNullorEmpty( networkSubscriptions[i].ActivationDate )=================\n" + !isNullorEmpty( networkSubscriptions[i].ActivationDate ));
            //console.log("=================networkSubscriptions[i].ActivationDate=================\n" + networkSubscriptions[i].ActivationDate);
            //console.log("=================networkSubscriptions[i].CreationDate=================\n" + networkSubscriptions[i].CreationDate);
            var startDate = parseSOAPDate( !isNullorEmpty( networkSubscriptions[i].ActivationDate ) ? networkSubscriptions[i].ActivationDate : networkSubscriptions[i].CreationDate );
            var expDate = new Date();
            if( typeof(networkInfo.SubscriptionsRenewalDate) == "undefined" ){
                //console.log("=================networkSubscriptions[i].ExpirationDate=================\n" + networkSubscriptions[i].ExpirationDate);
                expDate = bsnGetExpirationDate( startDate, parseSOAPDate(networkSubscriptions[i].ExpirationDate || false), period.num );
            } else {
                expDate = moment( parseSOAPDate( networkInfo.SubscriptionsRenewalDate ) ).subtract( 1, 'd' ).toDate();
            }

            var sub = {
                'id': networkSubscriptions[i].Id,
                'invoice': networkSubscriptions[i].InvoiceNumber || "",
                'deviceId': networkSubscriptions[i].DeviceId || "",
                'deviceSerial': networkSubscriptions[i].DeviceSerial || "",
                'period': period.num ? period.num : "other",
                'creation': parseSOAPDate( networkSubscriptions[i].CreationDate ),
                'activation': parseSOAPDate( networkSubscriptions[i].ActivationDate || "" ),
                'start': startDate,
                'end': expDate
            };
            var sub_csv = {
                'id': networkSubscriptions[i].Id,
                'invoice': networkSubscriptions[i].InvoiceNumber || "",
                'deviceId': networkSubscriptions[i].DeviceId || "",
                'deviceSerial': networkSubscriptions[i].DeviceSerial || "",
                'period': period.num ? period.num : "other",
                'creation': moment( parseSOAPDate( networkSubscriptions[i].CreationDate ) ).format( 'L' ),
                'activation': networkSubscriptions[i].ActivationDate ? moment( parseSOAPDate( networkSubscriptions[i].ActivationDate ) ).format( 'L' ) : false,
                'start': moment( startDate ).format( 'L' ),
                'end': moment( expDate ).format( 'L' )
            };
            if( bsnIsSubRelevant( sub, delta ) ){
                subs.push( sub );
                subs_csv.push( sub_csv );
            } else {
                expired.push( sub );
            }
        }

        if( !networkSubscriptions.length ) {
            jQuery('#custpage_results_log_fs').text('Nothing Found......');
        }

        if( subs.length ){ jQuery('#custpage_results_log_fs').append( "<h6><br>Active Subs (" + subs.length + ")</h6>" ); }
        for( i = 0; i < subs.length; i++ ){
            line = (i + 1) + ")";
            line += " Invoice: " + ( subs[i].invoice || "empty" );
            line += " | ID: " + subs[i].id;
            line += " | Period: " + subs[i].period;
            line += " | Serial: " + subs[i].deviceSerial;
            line += " | Creation Date: " + nlapiDateToString( subs[i].creation, 'date' );
            line += " | Activation Date: " + ( !isNullorEmpty( subs[i].activation ) ? nlapiDateToString( subs[i].activation, 'date' ) : "Not Activated" );
            line += " | Start Date: " + nlapiDateToString( subs[i].start, 'date' );
            line += " | Expiration Date: " + nlapiDateToString( subs[i].end, 'date' );
            line += "<br>";
            jQuery('#custpage_results_log_fs').append(line);

            var invoiceIndex = search(subs[i].invoice, invoiceStats, 'invoice');
            if( invoiceIndex > -1 ){
                invoiceStats[ invoiceIndex ].num++;
            } else {
                invoiceStats.push({ 'invoice': subs[i].invoice, 'num': 1, 'date': nlapiDateToString( subs[i].start, 'date' ), 'period': subs[i].period });
            }

            var periodIndex = search(subs[i].period, periodStats, 'period');
            if( periodIndex > -1 ){
                periodStats[ periodIndex ].num++;
            } else {
                periodStats.push({ 'period': subs[i].period, 'num': 1 });
            }

            var endDateIndex = search(nlapiDateToString( subs[i].end, 'date' ), endDateStats, 'datestring');
            //console.log('===================== subs[i].end ========================\n' + subs[i].end);
            //console.log('===================== endDateIndex ========================\n' + endDateIndex);
            if( endDateIndex > -1 ){
                endDateStats[ endDateIndex ].num++;
            } else {
                endDateStats.push({ 'enddate': subs[i].end, 'datestring': nlapiDateToString( subs[i].end, 'date' ), 'num': 1 });
            }
        }

        if( expired.length ){ jQuery('#custpage_results_log_fs').append( "<h6><br>Expired Subs (" + expired.length + ")</h6>" ); }
        for( var k = 0; k < expired.length; k++, i++ ){
            line = (i + 1) + ")";
            line += "<span style='color:#aaa'>";
            line += " Invoice: " + ( expired[k].invoice || "empty" );
            line += " | ID: " + expired[k].id;
            line += " | Period: " + expired[k].period;
            line += " | Serial: " + expired[k].deviceSerial;
            line += " | Creation Date: " + nlapiDateToString( expired[k].creation, 'date' );
            line += " | Activation Date: " + ( !isNullorEmpty( expired[k].activation ) ? nlapiDateToString( expired[k].activation, 'date' ) : "Not Activated" );
            line += " | Start Date: " + nlapiDateToString( expired[k].start, 'date' );
            line += " | Expiration Date: " + nlapiDateToString( expired[k].end, 'date' );
            line += "</span><br>";
            jQuery('#custpage_results_log_fs').append(line);

            var invoiceIndex = search(expired[k].invoice, invoiceStats, 'invoice');
            if( invoiceIndex > -1 ){
                invoiceStats[ invoiceIndex ].num++;
            } else {
                invoiceStats.push({ 'invoice': expired[k].invoice, 'num': 1, 'date': nlapiDateToString( expired[k].start, 'date' ), 'period': expired[k].period });
            }
        }

        invoiceStats.sort(function(a,b){if(a.invoice < b.invoice)return -1;if(a.invoice > b.invoice)return 1;return 0});
        for( i = 0; i< invoiceStats.length; i++ ){
            var usage = nlapiGetContext().getRemainingUsage();
            console.log('usage = ' + usage);
            var params = {};
            var invId = parseInt(invoiceStats[i].invoice);
            if( i < 1 ) line = "<br><b>Subscription Stats<br></b>"; else line = "";
            line += (i + 1) + ")";
            if( nlapiGetFieldValue( 'bsn_skip_invoice_checking' ) == 'F' ){
                var soId = bsGetSOByTranid( 'SO-' + invoiceStats[i].invoice );
                if( soId == -1 ){
                    line += " Invoice: SO-" + invoiceStats[i].invoice;
                } else {
                    line += " Invoice: <a href='/app/accounting/transactions/salesord.nl?id=" + soId + "' target='_blank'>SO-" + invoiceStats[i].invoice + "</a>";
                }
            } else {
                var subName = nlapiLookupField( 'subscription', invId, 'name' );
                line += " Subscription: <a href='/app/accounting/subscription/subscription.nl?id=" + invId + "' target='sub" + invId + "'>" + subName + "</a>";
            }
            line += " Quantity: " + invoiceStats[i].num;
            //line += " ID: " + invId;
            //line += " | <a href='' onclick='event.preventDefault();try{ if (!!window) { var origScriptIdForLogging = window.NLScriptIdForLogging; var origDeploymentIdForLogging = window.NLDeploymentIdForLogging; window.NLScriptIdForLogging = \"customscript_bsn_network_conversion\"; window.NLDeploymentIdForLogging = \"CUSTOMDEPLOY_BSN_NETWORK_CONVERSION\"; }bsnUpdateSubsWindow({\"invoice\":\"" + invoiceStats[i].invoice + "\",\"networkId\":\"" + networkId + "\",\"networkName\":\"" + networkName + "\",\"date\":\"" + invoiceStats[i].date + "\",\"period\":\"" + invoiceStats[i].period + "\"});}finally{ if (!!window) { window.NLScriptIdForLogging = origScriptIdForLogging; window.NLDeploymentIdForLogging = origDeploymentIdForLogging; }}; return false;' onmousedown='this.setAttribute(\"_mousedown\",\"T\"); setButtonDown(true, false, this);' onmouseup='this.setAttribute(\"_mousedown\",\"F\"); setButtonDown(false, false, this);' onmouseout='if(this.getAttribute(\"_mousedown\")==\"T\") setButtonDown(false, false, this);' onmouseover='if(this.getAttribute(\"_mousedown\")==\"T\") setButtonDown(true, false, this);' _mousedown='F'>Update</a>";
            line += "<br>";
            jQuery('#custpage_results_stats_fs').append(line);
        }

        periodStats.sort(function(a,b){if(a.period < b.period)return -1;if(a.period > b.period)return 1;return 0});
        for( i = 0; i< periodStats.length; i++ ){
            if( i < 1 ) line = "<br><b>Period Stats<br></b>"; else line = "";
            line += (i + 1) + ")";
            line += " Period: " + periodStats[i].period ;
            line += " Num: " + periodStats[i].num;
            line += "<br>";
            jQuery('#custpage_results_stats_fs').append(line);
        }

        endDateStats.sort(function(a,b){if(a.enddate < b.enddate)return -1;if(a.enddate > b.enddate)return 1;return 0});
        for( i = 0; i< endDateStats.length; i++ ){
            if( i < 1 ) line = "<br><b>Expiration Date Stats<br></b>"; else line = "";
            line += (i + 1) + ")";
            //line += " Expiration Date: " + nlapiDateToString( endDateStats[i].enddate, 'date' ) ;
            line += " Expiration Date: " + endDateStats[i].datestring;
            line += " Num: " + endDateStats[i].num;
            line += "<br>";
            jQuery('#custpage_results_stats_fs').append(line);
        }

    }
}

function bsncNetInfo(networkId){
    if( !isNullorEmpty(networkId) ){
        var networkSubscriptions = [];
        jQuery('#custpage_results_log_fs').text('');
        jQuery('#custpage_results_stats_fs').text('');
        jQuery('#custpage_netinfo_fs').text('');
        console.log("=================networkId=================\n" + networkId);
        if( networkId != '' ){
            console.log("=================networkId=================\n" + networkId);
            var filter = "[DeviceSubscription].[Network].[Id] IS " + networkId + " AND [DeviceSubscription].[Type] IS NOT 'Grace'";
            console.log("=================filter=================\n" + filter);
            var getSubscriptions = soapGetDeviceSubscriptionsBSNC( filter );
            if( isNullorEmpty(getSubscriptions.error) ){
                networkSubscriptions = getSubscriptions.subscriptions;
            } else {
                console.log("=================getSubscriptions Error=================\n" + getSubscriptions.error);
            }
            console.log("=================networkSubscriptions=================");
            console.log(networkSubscriptions);
            networkInfo = soapGetNetworkByIdBSNC( networkId, true );
            console.log("=================networkInfo=================");
            console.log(networkInfo);
        }

        if( !isNullorEmpty( networkInfo ) ){
            if( typeof(networkInfo.Id) != 'undefined' ) {
                var count = soapNetworkSubscriptionsCountBSNC( networkInfo.Id, networkInfo.isTrial );
                if( isNullorEmpty( count.error ) && networkInfo.isContent ){
                    networkInfo.quantity = count.quantity;
                }
                console.log("=================networkInfo=================\n" + JSON.stringify(networkInfo));
                var nInfo = '<br><b>NETWORK INFO</b><br>';
                var isSuspended = networkInfo.IsLockedOut == 'true';
                nInfo += '<div style="border: 1px solid black; padding: 10px; width: 280px;' + (isSuspended?'background-color:#fee;':'') + '">';
                var suspendButton = "";
                if( isSuspended ){
                    nInfo += '<b style="color:darkred">Suspended: </b>' + networkInfo.LastLockoutDate + '<br>';
                    suspendButton = '</div><br>' + buttonStart + '<input type="button" value="Unsuspend" id="bsn_convert_network_suspend" name="bsn_convert_network_suspend" onclick="try{ if (!!window) { var origScriptIdForLogging = window.NLScriptIdForLogging; var origDeploymentIdForLogging = window.NLDeploymentIdForLogging; window.NLScriptIdForLogging = \'customscript_bsnc_sl_network_convert\'; window.NLDeploymentIdForLogging = \'customdeploy_bsnc_sl_network_convert\'; }networkSuspend(' + networkInfo.Id + ', false);}finally{ if (!!window) { window.NLScriptIdForLogging = origScriptIdForLogging; window.NLDeploymentIdForLogging = origDeploymentIdForLogging; }}; return false;" class="rndbuttoninpt bntBgT" onmousedown="this.setAttribute(\'_mousedown\',\'T\'); setButtonDown(true, false, this);" onmouseup="this.setAttribute(\'_mousedown\',\'F\'); setButtonDown(false, false, this);" onmouseout="if(this.getAttribute(\'_mousedown\')==\'T\') setButtonDown(false, false, this);" onmouseover="if(this.getAttribute(\'_mousedown\')==\'T\') setButtonDown(true, false, this);" _mousedown="F">' + buttonEnd + '<div>';
                } else {
                    suspendButton = '</div><br>' + buttonStart + '<input type="button" value="Suspend" id="bsn_convert_network_suspend" name="bsn_convert_network_suspend" onclick="try{ if (!!window) { var origScriptIdForLogging = window.NLScriptIdForLogging; var origDeploymentIdForLogging = window.NLDeploymentIdForLogging; window.NLScriptIdForLogging = \'customscript_bsnc_sl_network_convert\'; window.NLDeploymentIdForLogging = \'customdeploy_bsnc_sl_network_convert\'; }networkSuspend(' + networkInfo.Id + ', true);}finally{ if (!!window) { window.NLScriptIdForLogging = origScriptIdForLogging; window.NLDeploymentIdForLogging = origDeploymentIdForLogging; }}; return false;" class="rndbuttoninpt bntBgT" onmousedown="this.setAttribute(\'_mousedown\',\'T\'); setButtonDown(true, false, this);" onmouseup="this.setAttribute(\'_mousedown\',\'F\'); setButtonDown(false, false, this);" onmouseout="if(this.getAttribute(\'_mousedown\')==\'T\') setButtonDown(false, false, this);" onmouseover="if(this.getAttribute(\'_mousedown\')==\'T\') setButtonDown(true, false, this);" _mousedown="F">' + buttonEnd + '<div>';
                }
                nInfo += '<b>ID:</b> ' + networkInfo.Id + '<br>';
                if (typeof (networkInfo.Name) != 'undefined') {
                    nInfo += '<b>Name:</b> ' + networkInfo.Name + '<br>';
                }
                /*
                console.log("=================typeof (networkInfo.SubscriptionsActivityPeriod)=================\n" + typeof (networkInfo.SubscriptionsActivityPeriod));
                if (typeof (networkInfo.SubscriptionsActivityPeriod) != 'undefined') {
                    var periodInfo = bsnGetPeriodBySOAP( networkInfo.SubscriptionsActivityPeriod );
                    nInfo += '<b>Activity Period:</b> ' + periodInfo.name + '<br>';
                }
                */
                console.log("=================typeof (networkInfo.SubscriptionsRenewalDate)=================\n" + typeof (networkInfo.SubscriptionsRenewalDate));
                if (typeof (networkInfo.SubscriptionsRenewalDate) != 'undefined') {
                    nInfo += '<b>Renewal Date:</b> ' + networkInfo.SubscriptionsRenewalDate.substr(0,10) + '<br>';
                }

                console.log(networkInfo);
                var toControlButton = "";
                if( typeof (networkInfo.quantity) == 'number' ){
                    nInfo += '<b>Quantity:</b> ' + networkInfo.quantity + '<br>';

                    if( networkInfo.quantity == 0 ) {
                        toControlButton = '</div><br>' + buttonStart + '<input type="button" value="Convert To Control" id="bsn_convert_network_control" name="bsn_convert_network_control" onclick="try{ if (!!window) { var origScriptIdForLogging = window.NLScriptIdForLogging; var origDeploymentIdForLogging = window.NLDeploymentIdForLogging; window.NLScriptIdForLogging = \'customscript_sb_bsnc_create_network\'; window.NLDeploymentIdForLogging = \'customdeploy_sb_bsnc_create_network\'; }networkConvertToControl(' + networkInfo.Id + ');}finally{ if (!!window) { window.NLScriptIdForLogging = origScriptIdForLogging; window.NLDeploymentIdForLogging = origDeploymentIdForLogging; }}; return false;" class="rndbuttoninpt bntBgT" onmousedown="this.setAttribute(\'_mousedown\',\'T\'); setButtonDown(true, false, this);" onmouseup="this.setAttribute(\'_mousedown\',\'F\'); setButtonDown(false, false, this);" onmouseout="if(this.getAttribute(\'_mousedown\')==\'T\') setButtonDown(false, false, this);" onmouseover="if(this.getAttribute(\'_mousedown\')==\'T\') setButtonDown(true, false, this);" _mousedown="F">' + buttonEnd + '<div>';
                    }
                }
                if( networkInfo.isContent ){
                    nInfo += '<b>Type:</b> Content<br>';
                }
                if( networkInfo.isControl ){
                    nInfo += '<b>Type:</b> Control<br>';
                }
                if( networkInfo.isTrial ){
                    nInfo += '<b>Type:</b> Trial<br>';
                } else {
                    nInfo += '<b>Was Trial:</b> ' + networkInfo.wasTrial + '<br>';
                }
                nInfo += toControlButton;
                nInfo += suspendButton;
                console.log("=================typeof (networkInfo.NetworkAdministrators)=================\n" + typeof (networkInfo.NetworkAdministrators));
                if (typeof (networkInfo.NetworkAdministrators) != 'undefined') {
                    var netAdmins = networkInfo.NetworkAdministrators;
                    if( netAdmins.length ){
                        nInfo += '</div><br>';
                        nInfo += '<br><b>ADMINISTRATORS</b><br>';
                        nInfo += '<div style="border: 1px solid black; padding: 10px; width: 280px;">';
                    }
                    for( var i = 0; i < netAdmins.length; i++ ){
                        console.log("=================netAdmins i=================\n" + i);
                        if( i ){
                            nInfo += '<span style="border-top: 1px solid #999; display: block; padding-top: 10px; margin-top: 10px;">';
                        } else {
                            nInfo += '<span>';
                        }
                        console.log("=================typeof (netAdmins[i].Login)=================\n" + typeof (netAdmins[i].Login));
                        if (!isNullorEmpty(netAdmins[i].Login) && typeof (netAdmins[i].Login) != 'undefined') {
                            nInfo += netAdmins[i].Login + '<br>';
                        }
                        nInfo += '</span>';
                    }
                }
                console.log("=================typeof (networkInfo.NetworkSubscriptions)=================\n" + typeof (networkInfo.NetworkSubscriptions));
                if (typeof (networkInfo.NetworkSubscriptions) != 'undefined') {
                    var subsHistory = networkInfo.NetworkSubscriptions;
                    if( subsHistory.length ){
                        nInfo += '</div><br>';
                        nInfo += '<br><b>NETWORK HISTORY</b><br>';
                        nInfo += '<div style="border: 1px solid black; padding: 10px; width: 280px;">';
                    }
                    for( var i = 0; i < subsHistory.length; i++ ){
                        console.log("=================SubHistory i=================\n" + i);
                        if( i ){
                            nInfo += '<span style="border-top: 1px solid #999; display: block; padding-top: 10px; margin-top: 10px;">';
                        } else {
                            nInfo += '<span>';
                        }
                        console.log("=================typeof (subsHistory[i].CreationDate)=================\n" + typeof (subsHistory[i].CreationDate));
                        if (typeof (subsHistory[i].CreationDate) != 'undefined') {
                            nInfo += '<b>Creation Date:</b> ' + subsHistory[i].CreationDate.substr(0,10) + '<br>';
                        }
                        console.log("=================typeof (subsHistory[i].ExpireDate)=================\n" + typeof (subsHistory[i].ExpireDate));
                        if (!isNullorEmpty(subsHistory[i].ExpireDate) && typeof (subsHistory[i].ExpireDate) != 'undefined') {
                            nInfo += '<b>Expiration Date:</b> ' + subsHistory[i].ExpireDate.substr(0,10) + '<br>';
                        }
                        console.log("=================typeof (subsHistory[i].Id)=================\n" + typeof (subsHistory[i].Id));
                        if (typeof (subsHistory[i].Id) != 'undefined') {
                            nInfo += '<b>ID:</b> ' + subsHistory[i].Id + '<br>';
                        }
                        console.log("=================typeof (subsHistory[i].Level)=================\n" + typeof (subsHistory[i].Level));
                        if (typeof (subsHistory[i].Level) != 'undefined') {
                            nInfo += '<b>Level:</b> ' + subsHistory[i].Level + '<br>';
                        }
                        nInfo += '</span>';
                    }
                }
                nInfo += '</div>';
                jQuery('#custpage_netinfo_fs').html(nInfo);
            }
        }
        console.log("=================networkSubscriptions.length=================\n" + networkSubscriptions.length);

        subs = Array();
        subs_csv = Array();
        expired = Array();
        invoiceStats = Array();
        periodStats = Array();
        endDateStats = Array();
        var line = "";
        for( var i = 0; i < networkSubscriptions.length; i++ ){
            var delta = 0; // 2 months
            var period = bsnGetPeriodBySOAP( networkSubscriptions[i].ActivityPeriod );

            //console.log("=================!isNullorEmpty( networkSubscriptions[i].ActivationDate )=================\n" + !isNullorEmpty( networkSubscriptions[i].ActivationDate ));
            //console.log("=================networkSubscriptions[i].ActivationDate=================\n" + networkSubscriptions[i].ActivationDate);
            //console.log("=================networkSubscriptions[i].CreationDate=================\n" + networkSubscriptions[i].CreationDate);
            var startDate = parseSOAPDate( !isNullorEmpty( networkSubscriptions[i].ActivationDate ) ? networkSubscriptions[i].ActivationDate : networkSubscriptions[i].CreationDate );
            var expDate = new Date();
            if( typeof(networkInfo.SubscriptionsRenewalDate) == "undefined" ){
                //console.log("=================networkSubscriptions[i].ExpirationDate=================\n" + networkSubscriptions[i].ExpirationDate);
                expDate = bsnGetExpirationDate( startDate, parseSOAPDate(networkSubscriptions[i].ExpirationDate || false), period.num );
            } else {
                expDate = moment( parseSOAPDate( networkInfo.SubscriptionsRenewalDate ) ).subtract( 1, 'd' ).toDate();
            }

            var sub = {
                'id': networkSubscriptions[i].Id,
                'invoice': networkSubscriptions[i].InvoiceNumber || "",
                'deviceId': networkSubscriptions[i].DeviceId || "",
                'deviceSerial': networkSubscriptions[i].DeviceSerial || "",
                'period': period.num ? period.num : "other",
                'creation': parseSOAPDate( networkSubscriptions[i].CreationDate ),
                'activation': parseSOAPDate( networkSubscriptions[i].ActivationDate || "" ),
                'start': startDate,
                'end': expDate
            };
            var sub_csv = {
                'id': networkSubscriptions[i].Id,
                'invoice': networkSubscriptions[i].InvoiceNumber || "",
                'deviceId': networkSubscriptions[i].DeviceId || "",
                'deviceSerial': networkSubscriptions[i].DeviceSerial || "",
                'period': period.num ? period.num : "other",
                'creation': moment( parseSOAPDate( networkSubscriptions[i].CreationDate ) ).format( 'L' ),
                'activation': networkSubscriptions[i].ActivationDate ? moment( parseSOAPDate( networkSubscriptions[i].ActivationDate ) ).format( 'L' ) : false,
                'start': moment( startDate ).format( 'L' ),
                'end': moment( expDate ).format( 'L' )
            };
            if( bsnIsSubRelevant( sub, delta ) ){
                subs.push( sub );
                subs_csv.push( sub_csv );
            } else {
                expired.push( sub );
            }
        }

        if( !networkSubscriptions.length ) {
            jQuery('#custpage_results_log_fs').text('Nothing Found......');
        }

        if( subs.length ){ jQuery('#custpage_results_log_fs').append( "<h6><br>Active Subs (" + subs.length + ")</h6>" ); }
        for( i = 0; i < subs.length; i++ ){
            line = (i + 1) + ")";
            line += " Invoice: " + ( subs[i].invoice || "empty" );
            line += " | ID: " + subs[i].id;
            line += " | Period: " + subs[i].period;
            line += " | Serial: " + subs[i].deviceSerial;
            line += " | Creation Date: " + nlapiDateToString( subs[i].creation, 'date' );
            line += " | Activation Date: " + ( !isNullorEmpty( subs[i].activation ) ? nlapiDateToString( subs[i].activation, 'date' ) : "Not Activated" );
            line += " | Start Date: " + nlapiDateToString( subs[i].start, 'date' );
            line += " | Expiration Date: " + nlapiDateToString( subs[i].end, 'date' );
            line += "<br>";
            jQuery('#custpage_results_log_fs').append(line);

            var invoiceIndex = search(subs[i].invoice, invoiceStats, 'invoice');
            if( invoiceIndex > -1 ){
                invoiceStats[ invoiceIndex ].num++;
            } else {
                invoiceStats.push({ 'invoice': subs[i].invoice, 'num': 1, 'date': nlapiDateToString( subs[i].start, 'date' ), 'period': subs[i].period });
            }

            var periodIndex = search(subs[i].period, periodStats, 'period');
            if( periodIndex > -1 ){
                periodStats[ periodIndex ].num++;
            } else {
                periodStats.push({ 'period': subs[i].period, 'num': 1 });
            }

            var endDateIndex = search(nlapiDateToString( subs[i].end, 'date' ), endDateStats, 'datestring');
            //console.log('===================== subs[i].end ========================\n' + subs[i].end);
            //console.log('===================== endDateIndex ========================\n' + endDateIndex);
            if( endDateIndex > -1 ){
                endDateStats[ endDateIndex ].num++;
            } else {
                endDateStats.push({ 'enddate': subs[i].end, 'datestring': nlapiDateToString( subs[i].end, 'date' ), 'num': 1 });
            }
        }

        if( expired.length ){ jQuery('#custpage_results_log_fs').append( "<h6><br>Expired Subs (" + expired.length + ")</h6>" ); }
        for( var k = 0; k < expired.length; k++, i++ ){
            line = (i + 1) + ")";
            line += "<span style='color:#aaa'>";
            line += " Invoice: " + ( expired[k].invoice || "empty" );
            line += " | ID: " + expired[k].id;
            line += " | Period: " + expired[k].period;
            line += " | Serial: " + expired[k].deviceSerial;
            line += " | Creation Date: " + nlapiDateToString( expired[k].creation, 'date' );
            line += " | Activation Date: " + ( !isNullorEmpty( expired[k].activation ) ? nlapiDateToString( expired[k].activation, 'date' ) : "Not Activated" );
            line += " | Start Date: " + nlapiDateToString( expired[k].start, 'date' );
            line += " | Expiration Date: " + nlapiDateToString( expired[k].end, 'date' );
            line += "</span><br>";
            jQuery('#custpage_results_log_fs').append(line);

            var invoiceIndex = search(expired[k].invoice, invoiceStats, 'invoice');
            if( invoiceIndex > -1 ){
                invoiceStats[ invoiceIndex ].num++;
            } else {
                invoiceStats.push({ 'invoice': expired[k].invoice, 'num': 1, 'date': nlapiDateToString( expired[k].start, 'date' ), 'period': expired[k].period });
            }
        }

        invoiceStats.sort(function(a,b){if(a.invoice < b.invoice)return -1;if(a.invoice > b.invoice)return 1;return 0});
        for( i = 0; i< invoiceStats.length; i++ ){
            var usage = nlapiGetContext().getRemainingUsage();
            console.log('usage = ' + usage);
            var params = {};
            var invId = parseInt(invoiceStats[i].invoice);
            if( i < 1 ) line = "<br><b>Subscription Stats<br></b>"; else line = "";
            line += (i + 1) + ")";
            if( nlapiGetFieldValue( 'bsn_skip_invoice_checking' ) == 'F' ){
                var soId = bsGetSOByTranid( 'SO-' + invoiceStats[i].invoice );
                if( soId == -1 ){
                    line += " Invoice: SO-" + invoiceStats[i].invoice;
                } else {
                    line += " Invoice: <a href='/app/accounting/transactions/salesord.nl?id=" + soId + "' target='_blank'>SO-" + invoiceStats[i].invoice + "</a>";
                }
            } else {
                var subName = nlapiLookupField( 'subscription', invId, 'name' );
                line += " Subscription: <a href='/app/accounting/subscription/subscription.nl?id=" + invId + "' target='sub" + invId + "'>" + subName + "</a>";
            }
            line += " Quantity: " + invoiceStats[i].num;
            //line += " ID: " + invId;
            //line += " | <a href='' onclick='event.preventDefault();try{ if (!!window) { var origScriptIdForLogging = window.NLScriptIdForLogging; var origDeploymentIdForLogging = window.NLDeploymentIdForLogging; window.NLScriptIdForLogging = \"customscript_bsn_network_conversion\"; window.NLDeploymentIdForLogging = \"CUSTOMDEPLOY_BSN_NETWORK_CONVERSION\"; }bsnUpdateSubsWindow({\"invoice\":\"" + invoiceStats[i].invoice + "\",\"networkId\":\"" + networkId + "\",\"networkName\":\"" + networkName + "\",\"date\":\"" + invoiceStats[i].date + "\",\"period\":\"" + invoiceStats[i].period + "\"});}finally{ if (!!window) { window.NLScriptIdForLogging = origScriptIdForLogging; window.NLDeploymentIdForLogging = origDeploymentIdForLogging; }}; return false;' onmousedown='this.setAttribute(\"_mousedown\",\"T\"); setButtonDown(true, false, this);' onmouseup='this.setAttribute(\"_mousedown\",\"F\"); setButtonDown(false, false, this);' onmouseout='if(this.getAttribute(\"_mousedown\")==\"T\") setButtonDown(false, false, this);' onmouseover='if(this.getAttribute(\"_mousedown\")==\"T\") setButtonDown(true, false, this);' _mousedown='F'>Update</a>";
            line += "<br>";
            jQuery('#custpage_results_stats_fs').append(line);
        }

        periodStats.sort(function(a,b){if(a.period < b.period)return -1;if(a.period > b.period)return 1;return 0});
        for( i = 0; i< periodStats.length; i++ ){
            if( i < 1 ) line = "<br><b>Period Stats<br></b>"; else line = "";
            line += (i + 1) + ")";
            line += " Period: " + periodStats[i].period ;
            line += " Num: " + periodStats[i].num;
            line += "<br>";
            jQuery('#custpage_results_stats_fs').append(line);
        }

        endDateStats.sort(function(a,b){if(a.enddate < b.enddate)return -1;if(a.enddate > b.enddate)return 1;return 0});
        for( i = 0; i< endDateStats.length; i++ ){
            if( i < 1 ) line = "<br><b>Expiration Date Stats<br></b>"; else line = "";
            line += (i + 1) + ")";
            //line += " Expiration Date: " + nlapiDateToString( endDateStats[i].enddate, 'date' ) ;
            line += " Expiration Date: " + endDateStats[i].datestring;
            line += " Num: " + endDateStats[i].num;
            line += "<br>";
            jQuery('#custpage_results_stats_fs').append(line);
        }

    }
}