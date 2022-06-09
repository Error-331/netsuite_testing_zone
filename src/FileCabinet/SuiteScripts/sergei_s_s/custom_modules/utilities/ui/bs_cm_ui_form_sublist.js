/**
 * @NApiVersion 2.1
 */
define([
        'N/ui/serverWidget',
        './bs_cm_ui_form',
        './../bs_cm_array_utils',
        './../bs_cm_general_utils',
    ],
    
    (
        serverWidget,
        { addStylesField },
        { difference },
        { isString, isArray,  isObject, isFunction, isNullOrEmpty }
    ) => {
        function composeStyleForSublistCell(cellStyle, className, sublistId, columnNum, rowNum) {
            return `
                    table#${sublistId}_splits tr:nth-child(${rowNum}) td:nth-child(${columnNum}).uir-list-row-cell${ isNullOrEmpty(className) ? ' ' : (className[0] === ':' ? className : ` ${className}`) }
                        ${typeof cellStyle === 'object' ? JSON.stringify(cellStyle) : '{' + cellStyle + '}'}
                    
                `;
        }

        function composeStyleForSublistColumn(cellStyle, className, sublistId, columnNum) {
            return `
                    table#${sublistId}_splits tr td:nth-child(${columnNum}).uir-list-row-cell ${ isNullOrEmpty(className) ? ' ' : (className[0] === ':' ? className : ` ${className}`) }
                        ${typeof cellStyle === 'object' ? JSON.stringify(cellStyle) : '{' + cellStyle + '}'}
                    
                `;
        }

        function composeStyle(styleComposeFunc, id, computedStyles, ...params) {
            if (isNullOrEmpty(computedStyles)) {
                return '';
            } else if (isString(computedStyles)) {
                return styleComposeFunc(computedStyles, null, id, ...params);
            } else if (isObject(computedStyles)) {
                const { className, style } = computedStyles;
                return styleComposeFunc(style, className, id, ...params);
            } else if (isArray(computedStyles)) {
                let cssRules = '';

                for (const columnSubStyles of computedStyles) {
                    const { className, style } = columnSubStyles;
                    cssRules += styleComposeFunc(style, className, id, ...params);
                }

                return cssRules;
            }

            return '';
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
                `, null, id, `${colDimCnt + 1}`);
            }

            // add custom styles to columns
            const dataFieldNames = difference(fieldNames, ignoreFieldNames);

            for (let colStyleCnt = 0; colStyleCnt < columnStyles.length; colStyleCnt++) {
                const columnStyle = columnStyles[colStyleCnt];

                if (isFunction(columnStyle)) {
                    for (let rowCounter = 1; rowCounter <= data.length; rowCounter++) {
                        const dataRow = data[rowCounter - 1];
                        const fieldName = dataFieldNames[colStyleCnt - 1];

                        const computedStyles = columnStyle(dataRow[fieldName], dataRow);
                        cssRules += composeStyle(composeStyleForSublistCell, id, computedStyles,`${colStyleCnt + 1}`, `${rowCounter + 1}`);
                    }
                } else {
                    cssRules += composeStyle(composeStyleForSublistColumn, id, columnStyle,`${colStyleCnt + 1}`);
                }
            }

            addStylesField($form, `sublist_${rawId}`, cssRules);

            // return sublist object
            return $sublist;
        }

        return {
            addFormSublist,
        }
    });
