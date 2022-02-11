/*

 */


var tableResults = {};
function doSearch(searchId, label, aggregate) {

    var total = parseFloat(0);
    var search = nlapiLoadSearch('transaction', searchId);

    if (searchId == 'customsearch_brightsign_sales')
        search.addFilter(new nlobjSearchFilter('trandate', null, 'within', 'thisfiscalquarter'));
    
    if (searchId == 'customsearch933')
        search.addFilter(new nlobjSearchFilter('expectedclosedate', null, 'within', 'thisfiscalquarter'));

    var resultSet = search.runSearch();
    var start = 0;
    var end = 999;
    var i, r;
    do {
        r = resultSet.getResults(start, end);
        start = end + 1;
        end = start + 999;
        if (r && r.length > 0) {
            total = r[0].getValue(aggregate, null, 'SUM');
            break;
        }
    } while (r && r.length > 0);

    tableResults[label + ' Total'] = total;
}

function almostRevPortlet(portlet, column) {

    var content = '<div class="gridview" name="ns-portlet-kpi-grid" style="margin:-0.5em -0.7em"><table class="gridview" style="width: 100%; float: left"><thead class="header"> <tr class="uir-list-headerrow noprint"> <td class="gridview-sortable-header-cell"><div><div class="grid_header_cell_header"><span class="grid_header_cell_title">INDICATOR</span></div></div></td> <td class="gridview-sortable-header-cell"><div><div class="grid_header_cell_header" align="right"><span class="grid_header_cell_title">THIS FISCAL QTR</span></div></div></td></tr></thead> <tbody class="body"><tr class="uir-list-row-tr uir-list-row-odd"> <td>Brightsign Revenue</td> <td>[Brightsign Revenue Total]</td> </tr> <tr class="uir-list-row-tr uir-list-row-even"> <td>BS Backlog by Quarter (KPI)</td> <td>[BS Backlog by Quarter (KPI) Total]</td> </tr> <tr class="uir-list-row-tr uir-list-row-odd"> <td>Orders shipped, pending billing</td> <td>[Orders shipped, pending billing Total]</td> </tr> <tr class="uir-list-row-tr uir-list-row-even"> <td>Billings Sitting in Deferred, Coming to P&L in Next 6 Hrs</td> <td>[Billings Sitting in Deferred, Coming to P&L in Next 6 Hrs Total]</td> </tr> <tr class="uir-list-row-tr uir-list-row-odd"> <td>Current quarter opportunities @ > 90% probability</td> <td>[Current quarter opportunities @ > 90% probability Total]</td> </tr> <tr class="uir-list-row-tr uir-list-row-even"> <td><b>Total estimated revenue</b></td> <td><b>[Total estimated revenue]</b></td> </tr></tbody> </table><br style="clear:left"></div>';

    doSearch('customsearch_brightsign_sales', 'Brightsign Revenue', 'amount');
    doSearch('customsearch_alltimebacklog_3_2', 'BS Backlog by Quarter (KPI)', 'formulanumeric');
    doSearch('customsearch_orders_shipped_pending_bil', 'Orders shipped, pending billing', 'formulacurrency');
    doSearch('customsearch933', 'Current quarter opportunities @ > 90% probability', 'amount');
    doSearch('customsearch_brightsign_sales_3', 'Billings Sitting in Deferred, Coming to P&L in Next 6 Hrs', 'amount');

    nlapiLogExecution('DEBUG', 'tableResults', JSON.stringify(tableResults));

    var value;
    for (var result in tableResults) {
        value = tableResults[result];
        if (!value) value = parseFloat(0);
        content = content.replace('[' + result + ']', numeral(value).format('$0,0.00'));
    }

    var total = parseFloat(0);
    for (var result in tableResults) {
        value = tableResults[result];
        if (!value) value = parseFloat(0);
        total += parseFloat(value);
    }

    total = numeral(total).format('$0,0.00');

    content = content.replace('[Total estimated revenue]', total);

    portlet.setTitle('Almost Revenue With Opportunities');
    portlet.setHtml(content);
}