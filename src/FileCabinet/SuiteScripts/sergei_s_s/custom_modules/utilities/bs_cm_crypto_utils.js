/**
 * @NApiVersion 2.1
 */
define([ 'N/crypto', 'N/encode'],
    (crypto, encode) => {
        const createSecureKeyWithHash = (inputString) => {
            const myGuid = '{284CFB2D225B1D76FB94D150207E49DF}';
            const sKey = crypto.createSecretKey({
                guid: myGuid,
                encoding: encode.Encoding.UTF_8
            });

            const hmacSHA512 = crypto.createHmac({
                algorithm: crypto.HashAlg.SHA512,
                key: sKey
            });

            hmacSHA512.update({
                input: inputString,
                inputEncoding: encode.Encoding.BASE_64
            });

            return hmacSHA512.digest({
                outputEncoding: encode.Encoding.HEX
            });
        };

        const encodeStringToBase64 = (inputString) => {
            return encode.convert({
                string: inputString,
                inputEncoding: encode.Encoding.UTF_8,
                outputEncoding: encode.Encoding.BASE_64
            });
        }

        return {
            createSecureKeyWithHash,
            encodeStringToBase64,
        };
    });
