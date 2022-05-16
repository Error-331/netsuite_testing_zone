/**
 * @NApiVersion 2.1
 */
define([
        'N/format',
        'N/file',
        './utilities/bs_cm_general_utils'
    ],
    
    (format, file, { isNullOrEmpty }) => {

        const convertArrayOfObjectsToCSV = (args) => {
            let result, ctr, keys, columnDelimiter, lineDelimiter, data;

            data = args.data || null;
            if (data === null || !data.length) {
                return null;
            }

            columnDelimiter = args.columnDelimiter || ',';
            lineDelimiter = args.lineDelimiter || '\n';

            keys = Object.keys(data[0]);

            result = '';
            result += keys.join(columnDelimiter);
            result += lineDelimiter;

            data.forEach(function(item) {
                ctr = 0;
                keys.forEach(function(key) {
                    if (ctr > 0) result += columnDelimiter;

                    result += item[key];
                    ctr++;
                });
                result += lineDelimiter;
            });

            return result;
        }

        const prepareCSVFileObject = (objArray, filename, args) => {
            const fieldNames = Object.keys(objArray[0])
            const { customFieldHandlers } = args;

            if (!isNullOrEmpty(customFieldHandlers)) {
                for (const dataRow of objArray) {
                    for (const fieldName of fieldNames) {
                        let value = dataRow[fieldName];
                        if (!isNullOrEmpty(customFieldHandlers[fieldName])) {
                            value = customFieldHandlers[fieldName](value, dataRow);
                            dataRow[fieldName] = value;
                        }
                    }
                }
            }

            const csv = convertArrayOfObjectsToCSV(Object.assign({
                data: objArray
            }, args));

            if (csv === null) {
                return
            }

            const today = format.format( { value: new Date(), type: format.Type.DATETIME } );
            const filenamePrefix = isNullOrEmpty(args.filenamePrefix) ? 'generic_csv_file' : args.filenamePrefix;
            const fileExtension = isNullOrEmpty(args.fileExtension) ? 'csv' : args.fileExtension;
            const fileObj = file.create({
                name: isNullOrEmpty(filename) ? `${filenamePrefix}_${today}.${fileExtension}` : filename ,
                fileType: file.Type.CSV,
                contents: csv
            });


            fileObj.folder = args.folder || 2681900;
            return fileObj;
        };

        const revrecGenerateCSV = (objArray, filename, args) => {
            const fileObj = prepareCSVFileObject(objArray, filename, args);
            return fileObj.save();
        }

        return {
            convertArrayOfObjectsToCSV,
            prepareCSVFileObject,
            revrecGenerateCSV,
        }
    });
