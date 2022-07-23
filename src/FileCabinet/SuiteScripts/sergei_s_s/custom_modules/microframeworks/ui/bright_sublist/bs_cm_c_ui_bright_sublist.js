/**
 * @NApiVersion 2.1
 */
define([
        './../../../utilities/bs_cm_general_utils'
    ],
    
    (
        [isNullOrEmpty, isString]
    ) => {

        class BrightSublistClient {
            #sublistId = null;

            #$sublistRows = [];
            #$sublistCells = [];

            #parseSublistCells() {

            }

            #selectElements() {
                this.#$sublistRows = document.querySelectorAll(`table#${this.sublistId}_splits tr`);
            }

            #setSublistId(sublistId) {
                if (isNullOrEmpty(sublistId)) {
                    throw new Error('Cannot set sublist id - sublist id cannot be null or empty');
                }

                if (!isString(sublistId)) {
                    throw new Error('Cannot set sublist id - sublist id must be of type string');
                }

                this.#sublistId = sublistId;
            }

            constructor(options = {}) {
                const {
                    sublistId,
                } = options;

                this.#setSublistId(sublistId)
            }

            init() {
                document.querySelectorAll('tr td.uir-list-row-cell:nth-child(3) section[data-sectiontype="subcription_records"]').forEach($child => {
                    let links = ''

                    for (const subscription_subscriptionid of expiredNetworks[$child.dataset.networkid]?.subscriptionids?.split(',')) {
                        links += `<a target="_blank" href="/app/accounting/subscription/subscription.nl?id=${subscription_subscriptionid}">${subscription_subscriptionid}</a><br/>`
                    }

                    $child.innerHTML = links;
                });
            }

            get sublistId() {
                return this.#sublistId;
            }
        }

        return {}

    });
