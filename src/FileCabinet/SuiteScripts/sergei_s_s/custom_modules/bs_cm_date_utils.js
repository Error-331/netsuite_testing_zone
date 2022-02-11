/**
 * @NApiVersion 2.1
 */
define([
    './moment.js',
    './bs_cm_general_utils',
    ],
    (moment, { isNullOrEmpty }) => {
        const getUTCDate = (dateToConvert) => {
            let now = moment();

            if(!isNullOrEmpty(dateToConvert)){
                now = moment(dateToConvert);
            }

            return now.utc().format();
        }

        const transformUTCDateToPSTDate = (dateSOAP) => {
            if( isNullOrEmpty( dateSOAP ) )
                return dateSOAP;
            else
                return moment(dateSOAP).tz('America/Los_Angeles').format();
        }

        return {
            getUTCDate,
            transformUTCDateToPSTDate,
        }
    });
