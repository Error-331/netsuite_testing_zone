// external imports

// local imports

// implementation
define([], function() {
    class Record {
        #type = null;
        #isDynamic = false;
        #fieldValue = {};

        constructor({ type, isDynamic }) {
            this.#type = type;
            this.#isDynamic = isDynamic;
        }

        save({ enableSourcing, ignoreMandatoryFields }) {
            console.log(this.#fieldValue);
        }

        setValue({ fieldId, value }) {
            this.#fieldValue[fieldId] = value;
        }
    }

    return Record;
});

// exports
