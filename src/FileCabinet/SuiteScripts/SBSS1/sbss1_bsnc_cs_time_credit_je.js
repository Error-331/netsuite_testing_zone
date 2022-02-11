function bsCreateJE(){
    var tcID = nlapiGetRecordId();
    var tc = nlapiLoadRecord('customrecord_bsnc_time_credit', tcID);
    var curJe = tc.getFieldValue('custrecord_bs_tc_journal_entry');
    console.log(curJe);
    if( !curJe ) {
        //alert(timeCredit);
        var customer = tc.getFieldValue('custrecord_bs_tc_customer');
        var network = tc.getFieldValue('custrecord_bs_tc_network_id');
        var amountUSD = tc.getFieldValue('custrecord_bs_tc_amount');
        var amountMON = tc.getFieldValue('custrecord_bs_tc_months');
        var newJE = nlapiCreateRecord('journalentry');
        var today = nlapiDateToString(new Date());
        var endDate = new Date();
        newJE.setFieldValue('subsidiary', 1);
        newJE.setFieldValue('currency', 1); // USD
        newJE.setFieldValue('exchangerate', 1);
        newJE.setFieldValue('trandate', today);
        newJE.setLineItemValue('line', 'account', 1, 127); // Deferred Revenue
        newJE.setLineItemValue('line', 'debit', 1, amountUSD);
        newJE.setLineItemValue('line', 'memo', 1, 'Network ' + network + ' Time Credit');
        newJE.setLineItemValue('line', 'entity', 1, customer);

        newJE.setLineItemValue('line', 'account', 2, 993); // 2530 LT Deferred Time Credit
        newJE.setLineItemValue('line', 'revenuerecognitionrule', 2, 4); //Default Fixed Recurring Fee
        newJE.setLineItemValue('line', 'credit', 2, amountUSD);
        newJE.setLineItemValue('line', 'memo', 2, 'Network ' + network + ' Time Credit');
        newJE.setLineItemValue('line', 'entity', 2, customer);
        newJE.setLineItemValue('line', 'custcolbrsg_rr_term_start_date', 2, today);
        newJE.setLineItemValue('line', 'custcol_brsg_rr_term_end_date', 2, '6/28/2021');
        console.log(newJE);
        var je = nlapiSubmitRecord(newJE);
        tc.setFieldValue('custrecord_bs_tc_journal_entry', je);
        nlapiSubmitRecord(tc);
        console.log(je);
        location.reload();
    }
    //nlapiCreateFile()
}