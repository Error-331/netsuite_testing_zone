// external imports

// local imports

// implementation
define(['./../../../constants/record/type', './../Record'], function(recordType, Record) {
    function create(recordParams) {
        const newRecord = new Record(recordParams);
        return newRecord;
    }

    return {
        Type: recordType,
        create,
    }
});

// exports
