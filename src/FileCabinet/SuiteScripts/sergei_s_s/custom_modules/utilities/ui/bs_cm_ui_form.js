/**
 * @NApiVersion 2.1
 */
define([
        'N/ui/serverWidget',
        './../bs_cm_string_utils',
        './../bs_cm_math_utils',
        './../bs_cm_runtime_utils',
        './../bs_cm_general_utils',
    ],

    (
        serverWidget,
        { LOWERCASE_LETTERS_EN, generateRandomString },
        { calcPagesCount },
        { getScriptCurrentURLPathQuery },
        { isNullOrEmpty },
    ) => {
        function addStylesField($form, name, cssRules) {
            const $inlineHTML = $form.addField({
                id: `custpage_${name}_custom_styles_${generateRandomString(5, LOWERCASE_LETTERS_EN)}`,
                type: serverWidget.FieldType.INLINEHTML,
                label: ' '
            });

            $inlineHTML.defaultValue = `<style>${cssRules}</style>`;

            $inlineHTML.updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
            });
        }

        function addFormSelectBox(options, data, $form) {
            // check options
            if (isNullOrEmpty(data)) {
                throw new Error('Data is not set - cannot create selectbox');
            }

            if (isNullOrEmpty($form)) {
                throw new Error('Form is not set - cannot create selectbox');
            }

            // extract options
            if (isNullOrEmpty(options)) {
                options = {};
            }

            let {
                id,
                label = '',
                disabled = false,
                defaultValue,
            } = options;

            id = `custpage_${id}`;

            // add selectbox itself
            const $selectBox = $form.addField({ id, label, type: serverWidget.FieldType.SELECT });

            if (disabled) {
                $selectBox.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
            }

            if (!isNullOrEmpty(defaultValue)) {
                $form.updateDefaultValues({
                    [id]: defaultValue,
                });
            }

            for (const dataRow of data) {
                $selectBox.addSelectOption(dataRow);
            }

            return $selectBox;
        }

        function createPagination(options, $form) {
            let {
                page = 0,
                pageSize,
                totalElements,
                container,
                forceShow = false,
            } = options;

            if (isNullOrEmpty(pageSize)) {
                throw new Error('Page size is not set - cannot create pagination')
            }

            if (isNullOrEmpty(pageSize)) {
                throw new Error('Total elements count is undefined - cannot create pagination')
            }

            const pageCount = calcPagesCount(totalElements, pageSize);
            let linksContent = '';

            for (let pageCounter = 0; pageCounter < pageCount; pageCounter++) {
                if (pageCounter === page) {
                    linksContent += `<span>${pageCounter + 1}</span>`;
                } else {
                    linksContent += `<a href='${getScriptCurrentURLPathQuery()}&page=${pageCounter}&pagesize=${pageSize}'>${pageCounter + 1}</a>`;
                }
            }

            let pagesContent = `
                <div class="paginationContainer">
                   <span>Page:</span>${linksContent}
                </div>
            `;


            let fieldContents = `
                <style>
                    div.paginationContainer {
                        display: flex;
                        position: relative;
                        
                        flex-flow: row nowrap;
                        justify-content: flex-start;
                        align-items: flex-start;
                        align-content: flex-start;
                        
                        padding: 3px;
                        
                        background-color: #c3d1de;
                    }
                    
                    div.paginationContainerSticky {
                          position: fixed;
                          
                          left: 0px;
                          width: 100%;
                          z-index: 100;
                          
                          box-shadow: 0 8px 8px rgb(0 0 0 / 25%);
                    }
                    
                    div.paginationContainer a {
                        flex-grow: 0;
                        flex-shrink: 0;
                        flex-basis: auto;
                        
                        margin-right: 5px;
                        font-size: 14px;
                        
                        color: #24385B;
                    }
                    
                    div.paginationContainer span {
                        flex-grow: 0;
                        flex-shrink: 0;
                        flex-basis: auto;
                        
                        margin-right: 5px;
                        font-size: 14px;
                        font-weight: bold;
                        
                        color: #24385B;
                    }
                </style>

                ${ (pageCount <= 1 && !forceShow) ? ' ' : pagesContent }
            `;

            const $field = $form.addField(
                {
                    id: `custpage_pagination_${generateRandomString(5, LOWERCASE_LETTERS_EN)}`,
                    label: 'Pagination container',
                    type: serverWidget.FieldType.INLINEHTML,
                    container,
                });

            $field.defaultValue = fieldContents;

            $field.updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.OUTSIDEABOVE
            });
        }

        return {
            addStylesField,
            addFormSelectBox,
            createPagination,
        }
    });
