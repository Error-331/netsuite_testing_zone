// external imports
const { resolve } = require('path');
const fs = require('fs');
const readline = require('readline');

// local imports
const { PATH_TO_RESOURCES_RAW } = require('./../../src/constants/resources');
const { PATH_TO_CONSTANTS_RECORD } = require('./../../src/constants/sources');

// implementation
async function processLineByLine() {
    const suiteScriptRecordTypeRawPath = resolve(PATH_TO_RESOURCES_RAW, './suite_script_record_types.js');
    const suiteScriptRecordTypePath = resolve(PATH_TO_CONSTANTS_RECORD, './type.txt');

    const fileStream = fs.createReadStream(suiteScriptRecordTypeRawPath);

    const readLineInterface = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let isLinesSkipped = 0;

    let constantName = null;
    let constantValue = null;

    const constantsToExport = [];

    const constantsFile = fs.createWriteStream(suiteScriptRecordTypePath, {
        flags: 'w'
    });

    constantsFile.write('// external imports');
    constantsFile.write('\r\n');
    constantsFile.write('\r\n');

    constantsFile.write('// local imports');
    constantsFile.write('\r\n');
    constantsFile.write('\r\n');

    constantsFile.write('// implementation');
    constantsFile.write('\r\n');

    for await (const line of readLineInterface) {
        if (isLinesSkipped === 12) {
            isLinesSkipped = 0;
        }

        if (isLinesSkipped === 0) {
            constantName = line;
            constantName = constantName.replace(/(\ |’|-)/g,  '_').toUpperCase();
            constantsToExport.push(constantName);
        }

        if (isLinesSkipped === 2) {
            constantValue = line;

            if (constantValue === 'null') {
                constantsFile.write(`const ${constantName} = ${constantValue};\r\n`);
            } else if (constantValue.includes('(')) {
                constantValue = constantValue.replace(/(\(|\))/g,  '');
                constantValue = constantValue
                    .split(',')
                    .map(constantValue => `'${constantValue}'`)
                    .join(',');

                constantsFile.write(`const ${constantName} = [${constantValue}];\r\n`);
            } else {
                constantsFile.write(`const ${constantName} = '${constantValue}';\r\n`);
            }
        }

        isLinesSkipped += 1;
    }

    constantsFile.write('\r\n');
    constantsFile.write('// exports');
    constantsFile.write('\r\n');

    for (const constantName of constantsToExport) {
        constantsFile.write(`module.exports.${constantName} = '${constantName}';\r\n`);

    }

    constantsFile.end();
}

processLineByLine();

// exports
