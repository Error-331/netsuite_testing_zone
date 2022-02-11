/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       8 Apr 2019     Eugene Karakovsky
 *
 */

/**
 * Prints AC3 Applied Label
 *
 */
function printAC3Label(){
    var zpl = "^XA\n" +
        "^FXTest ZPL^FS\n" +
        "^FO50,100\n" +
        "^A0N,89^FDHello ZPL^FS\n" +
        "^XZ";
    var printWindow = window.open();
    printWindow.document.open('text/plain')
    printWindow.document.write(zpl);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}


function isNullorEmpty(strVal){
    return (strVal == null || strVal == '');
}
