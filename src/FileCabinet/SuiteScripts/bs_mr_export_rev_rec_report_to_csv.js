/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 *@NModuleScope SameAccount
 */
define(['N/search', 'N/file', 'N/error', 'N/runtime', 'N/format', 'N/email', 'N/record'],
    /**
     * @param {search} search
     * @param {file} file
    */
    function(search, file, error, runtime, format, email, record){
        var period = parseInt( runtime.getCurrentScript().getParameter({name: 'custscript_bs_mr_accounting_period'}) || '0' );
        function getInputData(){
            try {
                //period = parseInt( period );
                log.debug('period', period);
                if( period ) {
                    return search.create({
                        type: 'revenueplan',
                        filters: [
                            search.createFilter({name: 'postingperiod', operator: search.Operator.ANYOF, values: period}),
                            search.createFilter({name: 'quantity', join: 'revenueelement', operator: search.Operator.NOTEQUALTO, values: 0}),/*
                        search.createFilter({ name: 'recordnumber', operator: search.Operator.IS, values: 3582 }),
                        search.createFilter({ name: 'trandate', join: 'journal', operator: search.Operator.ON, values: '3/31/2021' }),
                        search.createFilter({ name: 'formulatext', formula: '{creationtriggeredby}', operator: search.Operator.STARTSWITH, values: 'Cash Sale' }),*/
                        ],
                        columns: [
                            search.createColumn({name: 'trandate', join: 'journal'}),
                            search.createColumn({name: 'postingperiod'}),
                            search.createColumn({name: 'plannedperiod'}),
                            search.createColumn({name: 'holdrevenuerecognition'}),
                            search.createColumn({name: 'item', join: 'revenueelement'}),
                            search.createColumn({name: 'parentbomelement', join: 'revenueelement'}),
                            search.createColumn({name: 'class', join: 'revenueelement'}),
                            search.createColumn({name: 'quantity', join: 'revenueelement'}),
                            search.createColumn({name: 'tranid', join: 'appliedtotransaction'}),
                            search.createColumn({name: 'lineamount'}),
                            search.createColumn({name: 'formulacurrency', formula: '{lineamount}/{revenueelement.quantity}'}),

                            search.createColumn({name: 'totalrecognized'}),
                            search.createColumn({name: 'salesamount', join: 'revenueelement'}),
                            search.createColumn({name: 'entity', join: 'revenueelement'}),
                            search.createColumn({name: 'creationtriggeredby'}),
                            search.createColumn({name: 'journal'}),
                            search.createColumn({name: 'tranid', join: 'appliedtotransaction'}),
                            search.createColumn({name: 'revenuearrangement', join: 'revenueelement'}),
                            search.createColumn({name: 'createdfrom'}),
                            search.createColumn({name: 'recordnumber'}),
                            search.createColumn({name: 'status'}),
                            search.createColumn({name: 'isrecognized'}),
                            search.createColumn({name: 'deferralaccount'}),
                            search.createColumn({name: 'recognitionaccount'}),
                        ]
                    });
                } else {
                    return [];
                }
            } catch (ex) { log.error({ title: 'getInputData: error getInputData data', details: ex }); }
        }
        /**
         * Creates a RevenueForecastPriceData for further processing.
         * @param {Object} args customer
         */
        function RevRecData(args){
            this.postingDate = args.postingDate;
            this.postingPeriod = args.postingPeriod;
            this.plannedPeriod = args.plannedPeriod;
            this.holdRevRec = args.holdRevRec;
            this.item = args.item;
            this.itemName = args.itemName;
            this.itemType = args.itemType;
            this.parentKit = args.parentKit;
            this.class = args.class;
            this.quantity = args.quantity;
            this.lineAmount = args.lineAmount;
            this.unitPrice = args.unitPrice;
            this.totalRecognized = args.totalRecognized;
            this.salesAmount = args.salesAmount;
            this.entity = args.entity;
            this.creationTriggeredBy = args.creationTriggeredBy;
            this.journal = args.journal;
            this.appliedTo = args.appliedTo;
            this.revenueArrangement = args.revenueArrangement;
            this.createdFrom = args.createdFrom;
            this.recordNumber = args.recordNumber;
            this.status = args.status;
            this.isRecognized = args.isRecognized;
            this.deferrAlaccount = args.deferrAlaccount;
            this.recognitionAccount = args.recognitionAccount;
            this.triggeredById = '';
            this.triggeredByType = '';
            this.cogs = 0;
            this.priceLevel = '';
            this.memo = '';
            this.memoMain = '';
            this.replacement = '';
        }
        function map(context){
            try {
                var data = JSON.parse(context.value);
                log.debug('test', JSON.stringify(data));

                var itemType = '';
                if( data.values["item.revenueelement"] ){
                    var itemTypeLookup = search.lookupFields({type: 'item', id: parseInt(data.values["item.revenueelement"].value), columns: 'type'});
                    itemType = itemTypeLookup.type[0].value;
                }

                var itemName = data.values["item.revenueelement"].text || '';
                var entity = data.values["entity.revenueelement"].text || '';

                var revrec = new RevRecData({
                    postingDate: data.values["trandate.journal"],
                    postingPeriod: data.values.postingperiod,
                    plannedPeriod: data.values.plannedperiod,
                    holdRevRec: data.values.holdrevenuerecognition,
                    item: data.values["item.revenueelement"].value || '',
                    itemName: itemName.replace(/,/g,''),
                    itemType: itemType,
                    parentKit: data.values["parentbomelement.revenueelement"],
                    class: data.values["class.revenueelement"].text || '',
                    quantity: data.values["quantity.revenueelement"],
                    lineAmount: data.values.lineamount,
                    unitPrice: data.values.formulacurrency,
                    totalRecognized: data.values.totalrecognized,
                    salesAmount: data.values["salesamount.revenueelement"],
                    entity: entity.replace(/,/g,''),
                    creationTriggeredBy: data.values.creationtriggeredby,
                    journal: data.values.journal,
                    appliedTo: data.values["tranid.appliedtotransaction"],
                    revenueArrangement: data.values["revenuearrangement.revenueelement"],
                    createdFrom: data.values.createdfrom.text || '',
                    planNumber: data.values.recordnumber,
                    status: data.values.status,
                    isRecognized: data.values.isrecognized,
                    deferrAlaccount: data.values.deferralaccount,
                    recognitionAccount: data.values.recognitionaccount,
                });
                context.write(data.id, revrec);
                log.debug(context.key, JSON.stringify(revrec));
            }
            catch (ex) { log.error({ title: 'map: error mapping data', details: ex }); }
        }
        function reduce(context){
            try {
                var total = 0;
                var parsedValues = [];
                for( var i in context.values ) {
                    //total += parseFloat(context.values[i]);
                    var dataValue = JSON.parse(context.values[i]);
                    var itemID = dataValue.item;
                    var tranId = dataValue.creationTriggeredBy;
                    log.debug('itemID', itemID);
                    log.debug('tranId', tranId);
                    if (itemID && tranId) {
                        var tranIdSplit = tranId.split('#');
                        if (tranIdSplit[1]) {


                            var tranMainBody = search.create({
                                type: 'transaction',
                                filters: [
                                    search.createFilter({name: 'formulanumeric', formula: "CASE {tranid} WHEN '" + tranIdSplit[1] + "' THEN 1 ELSE 0 END", operator: search.Operator.EQUALTO, values: 1}),
                                    search.createFilter({name: 'mainline', operator: search.Operator.IS, values: true}),
                                ],
                                columns: [
                                    search.createColumn({name: 'tranid'}),
                                    search.createColumn({name: 'memomain'}),
                                    search.createColumn({name: 'custbody_bs_replacement'}),
                                ]
                            });

                            var tranmainsearchresults = tranMainBody.run().getRange(0,999);
                            //log.debug("tranmainsearchresults", JSON.stringify(tranmainsearchresults));

                            if( tranmainsearchresults && tranmainsearchresults.length ) {
                                var memoMain = tranmainsearchresults[0].getValue({name: 'memomain'}) || '';
                                memoMain = memoMain.replace(/,/g, '');
                                memoMain = memoMain.replace(/\n/g, ' ');
                                dataValue.triggeredById = tranmainsearchresults[0].id;
                                dataValue.triggeredByType = tranmainsearchresults[0].recordType;
                                dataValue.memoMain = memoMain;
                                dataValue.replacement = tranmainsearchresults[0].getText({name: 'custbody_bs_replacement'});
/*
                                if( isNullorEmpty( dataValue.parentKit ) && dataValue.memoMain.substr(0, 4) != 'VOID' ) {
                                    var tranSearch = search.create({
                                        type: 'transaction',
                                        filters: [
                                            search.createFilter({name: 'internalid', operator: search.Operator.IS, values: tranmainsearchresults[0].id}),
                                            search.createFilter({name: 'item', operator: search.Operator.IS, values: itemID}),
                                            search.createFilter({name: 'quantity', operator: search.Operator.EQUALTO, values: dataValue.quantity})
                                        ],
                                        columns: [
                                            search.createColumn({name: 'tranid'}),
                                            search.createColumn({name: 'costestimate'}),
                                            search.createColumn({name: 'pricelevel'}),
                                            search.createColumn({name: 'memo'}),
                                        ]
                                    });

                                    var transearchresults = tranSearch.run().getRange(0, 999);
                                    //log.debug("transearchresults", JSON.stringify(transearchresults));
                                    if (transearchresults && transearchresults.length) {
                                        var resTranId = transearchresults[0].id;
                                        var resTranType = transearchresults[0].recordType;
                                        //log.debug('resTranId', resTranId);
                                        //log.debug('resTranType', resTranType);
                                        if (resTranId) {
                                            var memo = transearchresults[0].getValue({name: 'memo'}) || '';
                                            memo = memo.replace(/,/g, '');
                                            memo = memo.replace(/\n/g, ' ');
                                            dataValue.cogs = transearchresults[0].getValue({name: 'costestimate'});
                                            dataValue.priceLevel = transearchresults[0].getText({name: 'pricelevel'});
                                            dataValue.memo = memo;
                                        }
                                        //log.debug('context.values[i]', JSON.stringify(context.values[i]));
                                    }
                                }
                                */
                            }
                        }
                    }
                    parsedValues.push(dataValue);
                    //log.debug('reduce ' + context.key, JSON.stringify(dataValue));
                }

                //log.debug('reduce ' + context.key, JSON.stringify(context.values));
                //log.debug('reduce parsed ' + context.key, JSON.stringify(parsedValues));

                context.write({
                    key: context.key,
                    value: parsedValues
                });
            }
            catch (ex) { log.error({ title: 'reduce: error reducing data', details: ex }); }
        }

        function summarize(summary){
            //handleErrorIfAny(summary);

            var values = [];
            var rowsCount = 0;

            summary.output.iterator().each(function (key, value) {
                //log.debug({ title: 'Output for key ' + key, details: value });
                rowsCount++;
                values.push(JSON.parse(value));
                return true;
            });

            var csvArray = [];
            for( var i in values ){
                for( var k in values[i] ){
                    //log.debug('summary values[' + i + '][' + k + ']', JSON.stringify(values[i][k]));
                    csvArray.push( values[i][k] );
                }
            }
            //var csvString = convertArrayOfObjectsToCSV({data:csvArray});

            //log.debug('summary csvArray', JSON.stringify(csvArray));
            //log.debug('summary csvString', csvString);

            //log.debug({ title: 'Summary', details: values });

            var customerEmail = runtime.getCurrentScript().getParameter({name: 'custscript_bs_mr_email'});
            var fileID = revrecGenerateCSV( csvArray );
            log.debug({ title: 'fileID', details: fileID });

            var fileObj = file.load({id: fileID});

            if( !isNullorEmpty( customerEmail ) ) {
                if (!isNullorEmpty(fileID)) {
                    email.send({
                        author: -5,
                        recipients: customerEmail,
                        subject: "RevRec report finished",
                        body: "RevRec report successfully generated:\n\n<a href='" + fileObj.url + "'>" + fileObj.name + "</a>"
                    });
                } else {
                    email.send({
                        author: -5,
                        recipients: customerEmail,
                        subject: "RevRec report problem",
                        body: "RevRec report generation finished, but file was not created.\n"
                    });
                }
            }

            var type = summary.toString();

            log.audit(type + ' Summary ', JSON.stringify(summary));
            log.audit(type + ' Usage Consumed ', summary.usage);
            log.audit(type + ' Number of Queues ', summary.concurrency);
            log.audit(type + ' Number of Yields ', summary.yields);
            log.audit(type + ' Number of Rows ', rowsCount);
        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        }

        function revrecGenerateCSV( objArray, filename ){
            var data;
            var csv = convertArrayOfObjectsToCSV({
                data: objArray
            });
            if (csv == null) return;
/*
            if (!csv.match(/^data:text\/csv/i)) {
                csv = 'data:text/csv;charset=utf-8,' + csv;
            }
*/
            var today = format.format( { value: new Date(), type: format.Type.DATETIME } );
            log.debug({ title: 'today', details: today });
            var periodName = '';
            var periodRec = record.load( { type: record.Type.ACCOUNTING_PERIOD, id: period } );
            if( !isNullorEmpty( periodRec ) ){
                periodName = periodRec.getValue({ fieldId: 'periodname' });
            }
            log.debug({ title: 'periodName', details: periodName });
            var fileObj = file.create({
                name: filename || 'RevRecWithCOGS (' + periodName + ') ' + today + '.csv',
                fileType: file.Type.CSV,
                contents: csv
            });
            fileObj.folder = 145475;
            var id = fileObj.save();
            //fileObj = file.load({id: id});

            return id;
        }

        function handleErrorIfAny(summary)
        {
            var inputSummary = summary.inputSummary;
            var mapSummary = summary.mapSummary;
            var reduceSummary = summary.reduceSummary;
            if (inputSummary.error) {
                var e = error.create({
                    name: 'INPUT_STAGE_FAILED',
                    message: inputSummary.error
                });
                log.error('Stage: getInputData failed', e);
            }
            handleErrorInStage('map', mapSummary);
            handleErrorInStage('reduce', reduceSummary);
        }
        function handleErrorInStage(stage, summary)
        {
            var errorMsg = [];
            summary.errors.iterator().each(function(key, value) {
                var msg = 'Failed ID: ' + key + '. Error was: ' + JSON.parse(value).message + '\n';
                errorMsg.push(msg);
                return true;
            });
            if (errorMsg.length > 0) {
                var e = error.create({
                    name: 'FAILURE',
                    message: JSON.stringify(errorMsg)
                });
                log.error('Stage: ' + stage + ' failed', e);
            }
        }
    }
);


function convertArrayOfObjectsToCSV(args) {
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;

    data = args.data || null;
    if (data == null || !data.length) {
        return null;
    }

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    keys = Object.keys(data[0]);

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function(item) {
        ctr = 0;
        keys.forEach(function(key) {
            if (ctr > 0) result += columnDelimiter;

            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });

    return result;
}

function isNullorEmpty(strVal){
    return (strVal == null || strVal == '');
}