/**
 * @NApiVersion 2.1
 */
define([],
    
    () => {
        class BSNCNetworkSubscription {
            constructor(settings) {
                this.CreationDate = settings['CreationDate'];
                this.ExpireDate = settings['ExpireDate'];
                this.Id = settings['Id'];
                this.LastModifiedDate = settings['LastModifiedDate'];
                this.Level = settings['Level'];
            }
        }

        return {
            BSNCNetworkSubscription,
        }

    });
