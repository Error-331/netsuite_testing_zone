/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
        'N/ui/serverWidget',
    ],
    /**
 * @param{query} query
 */
    (
        serverWidget,
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            function render() {
                const { request, response } = scriptContext;

                const currentForm = serverWidget.createForm({
                    title: 'Test'
                });


                const $inlineHTML = currentForm.addField({
                    id: `custpage_sublist_zz_custom_styles`,
                    type: serverWidget.FieldType.INLINEHTML,
                    label: ' '
                });

                $inlineHTML.defaultValue = `
                <script>
         
                
Ext.create('Ext.form.Panel', {
    renderTo: document.body,
    title: 'User Form',
    height: 350,
    width: 300,
    bodyPadding: 10,
    defaultType: 'textfield',
    items: [
        {
            fieldLabel: 'First Name',
            name: 'firstName'
        },
        {
            fieldLabel: 'Last Name',
            name: 'lastName'
        },
        {
            xtype: 'datefield',
            fieldLabel: 'Date of Birth',
            name: 'birthDate'
        }
    ]
});




                                </script>
                `;

                response.writePage(currentForm);




            }

            // main
            render();
        }

        return {onRequest}

    });
