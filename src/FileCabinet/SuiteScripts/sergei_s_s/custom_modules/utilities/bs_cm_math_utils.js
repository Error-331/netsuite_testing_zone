/**
 * @NApiVersion 2.1
 */
define([],
    
    () => {
        function digitsCount(usrNumber) {
            let count = 0;
            if (usrNumber >= 1) {
                ++count;
            }

            while (usrNumber / 10 >= 1) {
                usrNumber /= 10;
                ++count;
            }

            return count;
        }

        return {
            digitsCount,
        }
    });
