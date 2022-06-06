/**
 * @NApiVersion 2.1
 */
define([
        'N/ui/serverWidget',
        './../bs_cm_array_utils',
        './../bs_cm_general_utils',
    ],
    
    (serverWidget, { difference }, { isString, isArray,  isObject, isFunction, isNullOrEmpty }) => {
        function composeStyleForSublistCell(cellStyle, sublistId, rowNum, columnNum, className = null) {
            return `
                    table#${sublistId}_splits tr:nth-child(${rowNum}) td:nth-child(${columnNum}).uir-list-row-cell${ isNullOrEmpty(className) ? ' ' : (className[0] === ':' ? className : ` ${className}`) }
                        ${typeof cellStyle === 'object' ? JSON.stringify(cellStyle) : '{' + cellStyle + '}'}
                    
                `;
        }

        function composeStyleForSublistColumn(cellStyle, sublistId, columnNum, className = null) {
            return `
                    table#${sublistId}_splits tr td:nth-child(${columnNum}).uir-list-row-cell ${ isNullOrEmpty(className) ? ' ' : className }
                        ${typeof cellStyle === 'object' ? JSON.stringify(cellStyle) : '{' + cellStyle + '}'}
                    
                `;
        }

        function composeStyleForSublistRowColumn(cellStyle, sublistId, rowNum, columnNum) {
            return `
                    table#custpage_${sublistId}_splits tr:nth-child(${rowNum}) td:nth-child(${columnNum}).uir-list-row-cell {
                        ${cellStyle}
                    }
                `;
        }

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
                columnDimensions = [],
                columnStyles = [],
                customFieldHandlers = {},
                container,
            } = options;

            const rawId = id;
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
                    id: `${id}_line_num`,
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

                const currentField = $sublist.addField({
                    id: `${id}_${fieldName.toLowerCase().replace(/ /g, '_')}`,
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
                        id : `${id}_line_num`,
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
                        id : `${id}_${fieldName.toLowerCase().replace(/ /g, '_')}`,
                        line,
                        value,
                    });
                }

                line++;
            }

            // add styles that controls column dimensions
            let cssRules = '';

            for (let colDimCnt = 0; colDimCnt < columnDimensions.length; colDimCnt++) {
                const [ width, height ] = columnDimensions[colDimCnt];

                let preparedWidth = isNullOrEmpty(width) ? 'inherit' : width;
                let preparedHeight = isNullOrEmpty(height) ? 'inherit' : height;

                preparedWidth = typeof preparedWidth === 'string' ? width : `${width}px`;
                preparedHeight = typeof preparedHeight === 'string' ? height : `${height}px`;

                cssRules += composeStyleForSublistColumn(`
                    width: ${preparedWidth} !important;
                    height: ${preparedHeight} !important;
                `, id, `${colDimCnt + 1}`);
            }

            let $inlineHTML = $form.addField({
                id: `custpage_sublist_${rawId}_custom_styles345`,
                type: serverWidget.FieldType.INLINEHTML,
                label: ' '
            });

            $inlineHTML.defaultValue = `<style>${cssRules}</style>`;

            $inlineHTML.updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
            });

            // add custom styles to columns
            cssRules = '';

            const dataFieldNames = difference(fieldNames, ignoreFieldNames);

            for (let colStyleCnt = 0; colStyleCnt < columnStyles.length; colStyleCnt++) {
                const columnStyle = columnStyles[colStyleCnt];

                if (isNullOrEmpty(columnStyle)) {
                    continue;
                } else if (isFunction(columnStyle)) {
                    for (let rowCounter = 1; rowCounter <= data.length; rowCounter++) {
                        const dataRow = data[rowCounter - 1];
                        const fieldName = dataFieldNames[colStyleCnt - 1];

                        const computedStyles = columnStyle(dataRow[fieldName], dataRow);

                        if (isNullOrEmpty(computedStyles)) {
                            continue;
                        } else if (isString(computedStyles)) {
                            cssRules += composeStyleForSublistCell(computedStyles , id,  `${rowCounter + 1}`, `${colStyleCnt + 1}`);
                        } else if (isObject(computedStyles)) {
                            const { className, style } = computedStyles;
                            cssRules += composeStyleForSublistCell(style , id,  `${rowCounter + 1}`, `${colStyleCnt + 1}`, className);
                        } else if (isArray(computedStyles)) {
                            for (const columnSubStyles of computedStyles) {
                                const { className, style } = columnSubStyles;
                                cssRules += composeStyleForSublistCell(style , id,  `${rowCounter + 1}`, `${colStyleCnt + 1}`, className);
                            }
                        }
                    }
                } else if (isString(columnStyle)) {
                    cssRules += composeStyleForSublistColumn(columnStyle , id, `${colStyleCnt + 1}`);
                } else if (isObject(columnStyle)) {
                    const { className, style } = columnStyle;
                    cssRules += composeStyleForSublistColumn(style, id, `${colStyleCnt + 1}`, className);
                } else if (isArray(columnStyle)) {
                    for (const columnSubStyles of columnStyle) {
                        const { className, style } = columnSubStyles;
                        cssRules += composeStyleForSublistColumn(style, id, `${colStyleCnt + 1}`, className);
                    }
                }
            }

            $inlineHTML = $form.addField({
                id: `custpage_sublist_${rawId}_custom_styles345yrty`,
                type: serverWidget.FieldType.INLINEHTML,
                label: ' '
            });

            $inlineHTML.defaultValue = `<style>${cssRules}</style>`;

            $inlineHTML.updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
            });


            // return sublist object
            return $sublist;
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
