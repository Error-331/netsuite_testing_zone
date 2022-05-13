/**
 * @NApiVersion 2.1
 */
define([
        'N/ui/serverWidget',
        './../bs_cm_general_utils',
    ],
    
    (serverWidget, { isNullOrEmpty }) => {

        function addFormSublist(options, data, $form) {
            // check options
            if (isNullOrEmpty(data)) {
                throw new Error('Data is not set - cannot create sublist');
            }

            if (isNullOrEmpty($form)) {
                throw new Error('Form is not set - cannot create sublist');
            }

            // extract options
            if (isNullOrEmpty(options)) {
                options = {};
            }

            let {
                id,
                title = '',
                label = '',
                showTotal = false,
                showLineNumber = false,
                fieldNames,
                fieldTypes,
                ignoreFieldNames = [],
                customFieldHandlers = {},
                container,
            } = options;

            id = `custpage_${id}`;
            label = showTotal ? `${label} (total: ${data.length})` : label;

            // add sublist object
            const $sublist = $form.addSublist({
                id,
                type: serverWidget.SublistType.LIST,
                title,
                label,
                container,
            });

            // add 'line number' column if needed
            if (showLineNumber) {
                $sublist.addField({
                    id: `custpage_${id}_line_num`,
                    type: serverWidget.FieldType.INTEGER,
                    label: '#'
                });
            }

            // declare temporary variables
            let line = 0;

            // add sublist fields
            for (const fieldName of fieldNames) {
                if (ignoreFieldNames.includes(fieldName)) {
                    continue;
                }

                $sublist.addField({
                    id: `custpage_${id}_${fieldName.toLowerCase().replace(/ /g, '_')}`,
                    type: fieldTypes[line],
                    label: fieldName,
                });

                line++;
            }

            line = 0;

            // add sublist values
            for (const dataRow of data) {
                if (showLineNumber) {
                    $sublist.setSublistValue({
                        id : `custpage_${id}_line_num`,
                        line : line,
                        value : line + 1
                    });
                }

                for (const fieldName of fieldNames) {
                    if (ignoreFieldNames.includes(fieldName)) {
                        continue;
                    }

                    let value = dataRow[fieldName];
                    if (!isNullOrEmpty(customFieldHandlers[fieldName])) {
                        value = customFieldHandlers[fieldName](value, dataRow);
                    }

                    $sublist.setSublistValue({
                        id : `custpage_${id}_${fieldName.toLowerCase().replace(/ /g, '_')}`,
                        line,
                        value,
                    });
                }

                line++;
            }

            // return sublist object
            return $sublist;
        }

        function composeStyleForSublistRowColumn(cellStyle, sublistId, rowNum, columnNum) {
            return `
                    table#custpage_${sublistId}_splits tr:nth-child(${rowNum}) td:nth-child(${columnNum}).uir-list-row-cell {
                        ${cellStyle}
                    }
                `;
        }

        function addStyleToSpecificSublistColumns(options, $form, style = '', rowColumnIds = []) {
            const { sublistId, startRowNum, column } = options;

            // compose css rule
            const cssRule = composeStyleForSublistRowColumn(style, sublistId, `n+${startRowNum}`, column);

            // insert hidden HTML field with styles
            const $inlineHTML = $form.addField({
                id: `custpage_sublist_${sublistId}_custom_styles`,
                type: serverWidget.FieldType.INLINEHTML,
                label: ' '
            });

            $inlineHTML.defaultValue = `<style>${cssRule}</style>`;

            $inlineHTML.updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
            });
        }

        function markSublistRowsInBoldRed(options, $form, rowColumnIds = []) {
            const cellStyle = `
                    color: red !important;
                    font-weight: bold;
                `;

            addStyleToSpecificSublistColumns(options, $form, cellStyle, rowColumnIds)
        }

        return {
            addFormSublist,

            composeStyleForSublistRowColumn,
            addStyleToSpecificSublistColumns,
            markSublistRowsInBoldRed,
        }
    });
