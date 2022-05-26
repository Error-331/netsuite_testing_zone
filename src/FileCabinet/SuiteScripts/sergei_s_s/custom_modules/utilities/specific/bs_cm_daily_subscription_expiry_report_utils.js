/**
 * @NApiVersion 2.1
 */
define(['./../../libs/vendor/moment'],
    
    (moment) => {
        function formatDateForReport(userDate) {
            return moment(userDate).format('D-MMM-YYYY');
        }

        function prepareNoteHeader(dateAdd, actionName, userName) {
            return `${formatDateForReport(dateAdd)} | [${actionName}] | ${userName}`;
        }

        return { formatDateForReport, prepareNoteHeader }
    });
