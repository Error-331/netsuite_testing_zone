/**
 * @NApiVersion 2.1
 */
define([
        'N/ui/serverWidget',
        './../bs_cm_string_utils',
        './../bs_cm_general_utils',
    ],

    (
        serverWidget,
        { LOWERCASE_LETTERS_EN, generateRandomString },
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

        return { addStylesField, addFormSelectBox }
    });
