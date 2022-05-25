/**
 * @NApiVersion 2.1
 */
define(['./../../libs/vendor/moment'],
    
    (moment) => {
        function prepareNoteHeader(dateAdd, actionName, userName) {
            const formattedDate = moment(dateAdd).format('D-MMM-YYYY');
            return `${formattedDate} | [${actionName}] | ${userName}`;
        }

        return { prepareNoteHeader }
    });
