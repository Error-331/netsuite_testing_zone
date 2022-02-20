/**
 * @NApiVersion 2.1
 */
define([],
    
    () => {
        function isOnlyDigits(str){
            return /^[0-9]+$/.test(str);
        }

        return {
            isOnlyDigits
        }
    });
