/**
 * @NApiVersion 2.1
 */
define([
    './bs_cm_network_soap'
    ],
    (
        { soapUpdateNetworkBSNC }
    ) => {
        function networkSuspend( networkId, suspend ){
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

        return {
            networkSuspend,
        }
    });
