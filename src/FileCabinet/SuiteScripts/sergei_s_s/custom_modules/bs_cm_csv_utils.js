/**
 * @NApiVersion 2.1
 */
define(['N/format', 'N/file'],
    
    (format, file) => {

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

        const revrecGenerateCSV = (objArray, filename, args) => {
            const csv = convertArrayOfObjectsToCSV(Object.assign({
                data: objArray
            }, args));

            if (csv === null) {
                return
            }

            const today = format.format( { value: new Date(), type: format.Type.DATETIME } );
            const filenamePrefix = args.filenamePrefix || 'generic_csv_file';
            const fileExtension = args.fileExtension || 'csv';
            const fileObj = file.create({
                name: filename || `${filenamePrefix}_${today}.${fileExtension}` ,
                fileType: file.Type.CSV,
                contents: csv
            });

            fileObj.folder = args.folder || 2681900;
            const id = fileObj.save();

            return id;
        }

        return {
            convertArrayOfObjectsToCSV,
            revrecGenerateCSV,
        }
    });
