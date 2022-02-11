/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 */
define([],
    function () {
        return {
            afterSubmit: function(context) {
                const employee = context.newRecord;
                const empCode = employee.getValue('custentity_sdr_employee_code');

                const supervisorName = employee.getText('supervisor');
                const supervisorId = employee.getValue('supervisor');

                employee.setValue('custentity_sdr_employee_code', 'EMP002');

                log.debug('Employee Code', empCode);
                log.debug('Supervisor ID', supervisorId);
                log.debug('Supervisor Name', supervisorName);
            }
        }
    }
)
