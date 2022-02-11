// external imports
const { createWriteStream } = require('fs');
const csvStringify = require('csv-stringify');

const { keys } = require('lodash');

// local imports

// implementation
function writeObjectsArrayToCSV(dataArray, filePath, addKeysRow = true) {
    return new Promise((resolve, reject) => {
        const stringifier = csvStringify();
        const writeStream = createWriteStream(filePath);

        const dataKeys = keys(dataArray[0]);

        stringifier.pipe(writeStream);

        stringifier.on('error', reject);
        writeStream.on('error', reject);

        writeStream.on('finish', resolve);

        if (addKeysRow) {
            stringifier.write(dataKeys);
        }

        for (const dataItem of dataArray) {
            const dataRow = [];

            for (const dataKey of dataKeys) {
                dataRow.push(dataItem[dataKey]);
            }

            stringifier.write(dataRow);
        }

        stringifier.end()
    });
}

// exports
module.exports.writeObjectsArrayToCSV = writeObjectsArrayToCSV;
