/**
 * @NApiVersion 2.1
 */
define([],
    () => {
        const parseTransactionBSNItemMemo = (memo) => {
            return memo
                .trim()
                .split(/\r\n|\n|\r/)
                .reduce((result, memoLine) => {
                    const [key, value] = memoLine
                        .trim()
                        .split(':')
                        .map(value => value.trim());

                    result[key] = value;

                    if (key === 'Del Ref') {
                        result[key] = value.trim().split(',').map(subValue => subValue.trim());
                    } else {
                        result[key] = value;
                    }

                    return result;
                }, {});
        }

        return {
            parseTransactionBSNItemMemo,
        }
    });
