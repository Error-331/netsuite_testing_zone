/**
 * @NApiVersion 2.1
 */
define([
    'N/record',
    './../utilities/bs_cm_general_utils'
    ],
/**
 * @param{record} record
 */
    (record, { isNullOrEmpty }) => {
        function loadCustomerById(id, isDynamic = false) {
            return record.load({
                type: record.Type.CUSTOMER,
                id,
                isDynamic,
            });
        }

        function loadCustomerDefaultBillingAddress(customerId) {
            const customerRecord = loadCustomerById(customerId, true);

            if (isNullOrEmpty(customerRecord)) {
                return null;
            }

            const subLineCount = customerRecord.getLineCount({sublistId:'addressbook'});

            for (let subLineCounter = 0; subLineCounter < subLineCount; subLineCounter++) {
                const isDefaultBilling = customerRecord.getSublistValue({
                    sublistId: 'addressbook',
                    fieldId: 'defaultbilling',
                    line: subLineCounter
                });

                if (isDefaultBilling === true) {
                    const country = customerRecord.getSublistValue({
                        sublistId: 'addressbook',
                        fieldId: 'country_initialvalue',
                        line: subLineCounter
                    });

                    const state = customerRecord.getSublistValue({
                        sublistId: 'addressbook',
                        fieldId: 'state_initialvalue',
                        line: subLineCounter
                    });

                    const city = customerRecord.getSublistValue({
                        sublistId: 'addressbook',
                        fieldId: 'city_initialvalue',
                        line: subLineCounter
                    });

                    const zip = customerRecord.getSublistValue({
                        sublistId: 'addressbook',
                        fieldId: 'zip_initialvalue',
                        line: subLineCounter
                    });

                    return {
                        country,
                        state,
                        city,
                        zip,
                    }
                }

            }

            return null;
        }

        return {
            loadCustomerById,
            loadCustomerDefaultBillingAddress,
        }
    });
