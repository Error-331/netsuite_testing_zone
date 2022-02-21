/**
 * @NApiVersion 2.1
 */
define([
        './../../utilities/bs_cm_general_utils',
        './../../utilities/bs_cm_math_utils',
        './bs_cm_network_soap'
    ],
    (
        { logExecution, isArray, isNullOrEmpty },
        { digitsCount },
        { soapUpdateNetworkBSNC, soapGetDeviceSubscriptions, soapDeleteDeviceSubscriptions }
    ) => {
        function networkSuspend( networkId, suspend ) {
            const networkInfo = soapGetNetworkByIdBSNC(networkId, false);

            if( !networkInfo.IsError ) {
                const updateRes = soapUpdateNetworkBSNC(
                    networkInfo.Id,
                    networkInfo.Name,
                    networkInfo.SubscriptionsActivityPeriod,
                    networkInfo.SubscriptionsRenewalDate,
                    suspend
                );

                if (updateRes.result) {
                    return true;
                }
            }

            return false;
        }

        function networkEmpty(netId, subId){
            const prevSubsId = [];
            let prevSubs = [];

            const maxlength = 5;// : 6;
            let subRecordText = '00000';// : '000000';
            const idLength = digitsCount(subId);

            subRecordText = subRecordText.substr(0, maxlength - idLength) + subId;

            const filter = `[DeviceSubscription].[Network].[Id] IS ${netId} AND ([DeviceSubscription].[InvoiceNumber] IS IN ('${subRecordText}'))`;
            const sort = '[DeviceSubscription].[Device].[Serial] DESC';

            logExecution('DEBUG', 'Filter Get Subs', filter);
            prevSubs = soapGetDeviceSubscriptions(filter, sort);

            if(!isNullOrEmpty(prevSubs.error)){
                logExecution( 'ERROR', 'Get Subs Error', prevSubs.error )
            } else {
                if (isArray(prevSubs.subscriptions) && prevSubs.subscriptions.length > 0) {
                    for (let i = 0; i < prevSubs.subscriptions.length; i++) {
                        prevSubsId.push(prevSubs.subscriptions[i].Id);
                    }

                    logExecution('DEBUG', 'prevSubsId.length ', prevSubsId.length);
                    logExecution('DEBUG', 'prevSubsId ', JSON.stringify(prevSubsId));
                }
            }

            const errors = [];
            let delResult = false;

            if (!isNullOrEmpty(netId)) {
                delResult = soapDeleteDeviceSubscriptions(prevSubsId, subId);
            }
            if(isNullOrEmpty(delResult.error)){
                logExecution('DEBUG', 'Deleted Subs ', delResult.deleted);
                return true;
            } else {
                errors.push(delResult.error);
                logExecution('ERROR', 'Deleted Subs ', delResult.error);
            }

            return false;
        }

        return {
            networkSuspend,
            networkEmpty,
        }
    });
