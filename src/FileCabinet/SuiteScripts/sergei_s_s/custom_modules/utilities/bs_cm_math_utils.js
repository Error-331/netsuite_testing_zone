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

        function eq(value1, value2) {
            return value1 === value2;
        }

        function lt(value, boundary) {
            return value < boundary;
        }

        function gt(value, boundary) {
            return value > boundary;
        }

        function lte(value, boundary) {
            return value <= boundary;
        }

        function gte(value, boundary) {
            return value >= boundary;
        }

        function between(leftBoundary, rightBoundary, value) {
            return (gt(value, leftBoundary) && lt(value, rightBoundary)) ||
                eq(value, leftBoundary) ||
                eq (value, rightBoundary);
        }



        return {
            digitsCount,
            eq,
            lt,
            gt,
            lte,
            gte,
            between,
        }
    });
