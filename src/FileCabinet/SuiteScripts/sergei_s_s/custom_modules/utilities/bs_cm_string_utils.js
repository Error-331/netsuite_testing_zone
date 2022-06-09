/**
 * @NApiVersion 2.1
 */
define([],
    
    () => {
        const ALPHANUMERIC_LETTERS_EN_ALL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const LOWERCASE_LETTERS_EN = 'abcdefghijklmnopqrstuvwxyz';

        function isOnlyDigits(str){
            return /^[0-9]+$/.test(str);
        }

        function generateRandomString(len, charSet) {
            charSet = charSet || ALPHANUMERIC_LETTERS_EN_ALL;

            let randomString = '';
            for (let i = 0; i < len; i++) {
                let randomPoz = Math.floor(Math.random() * charSet.length);
                randomString += charSet.substring(randomPoz,randomPoz+1);
            }

            return randomString;
        }

        return {
            ALPHANUMERIC_LETTERS_EN_ALL,
            LOWERCASE_LETTERS_EN,

            isOnlyDigits,
            generateRandomString,
        }
    });
