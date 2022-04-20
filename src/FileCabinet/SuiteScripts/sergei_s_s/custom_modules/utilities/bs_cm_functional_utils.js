/**
 * @NApiVersion 2.1
 */
define([],
    () => {
        const lens = (getter, setter) => {
            return ({
                get: obj => getter(obj),
                set: (val, obj) => setter(val, obj)
            })
        };

        const view = (lens, obj) => {
            return lens.get(obj)
        };

        const set = (lens, val, obj) => {
            return lens.set(val, obj)
        };

        return {
            lens,
            view,
            set
        }
    });
