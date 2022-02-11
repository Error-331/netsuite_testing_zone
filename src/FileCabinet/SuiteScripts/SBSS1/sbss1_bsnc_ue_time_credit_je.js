/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       26 Sep 2020     Eugene Karakovsky
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 *
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function beforeLoadTimeCredit(type, form, request){
    form.setScript('customscript_sb_bsnc_cs_time_credit_je');

    if( type == "view" ) {
        var alertField = form.addField('custpage_typefield', 'inlinehtml', 'Alert');
        //alertField.setDefaultValue("<script type='text/javascript'>showAlertBox('alert_type', 'Record Type', '" + nlapiGetRecordType() + "', NLAlertDialog.TYPE_MEDIUM_PRIORITY);</script>");
        var selectField = form.addField('custpage_selectfield', 'inlinehtml', 'Network');
        selectField.setDefaultValue('<style type="text/css">' +
            '.pgBntR .bntBgR,.pgBntR_sel .bntBgR,button.pgBntR{border-color: #b21212 !important;}' +
            '.pgBntR,.pgBntR_sel{color: white !important;}' +
            '.pgBntR /* NORMAL */{' +
            'background: #ff4c4c !important;' +
            'background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDEgMSIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+CiAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkLXVjZ2ctZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPgogICAgPHN0b3Agb2Zmc2V0PSIyJSIgc3RvcC1jb2xvcj0iIzRjOWRmZiIgc3RvcC1vcGFjaXR5PSIxIi8+CiAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxODdiZjIiIHN0b3Atb3BhY2l0eT0iMSIvPgogIDwvbGluZWFyR3JhZGllbnQ+CiAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0idXJsKCNncmFkLXVjZ2ctZ2VuZXJhdGVkKSIgLz4KPC9zdmc+) !important;' +
            'background: -moz-linear-gradient(top, #ff4c4c 2%, #f21818 100%) !important;' +
            'background: -webkit-gradient(linear, left top, left bottom, color-stop(2%,#ff4c4c), color-stop(100%,#f21818)) !important;' +
            'background: -webkit-linear-gradient(top, #ff4c4c 2%,#f21818 100%) !important;' +
            'background: -o-linear-gradient(top, #ff4c4c 2%,#f21818 100%) !important;' +
            'background: -ms-linear-gradient(top, #ff4c4c 2%,#f21818 100%) !important;' +
            'background: linear-gradient(to bottom, #ff4c4c 2%,#f21818 100%) !important;' +
            '}' +
            '.pgBntR:hover, /* HOVER */.pgBntR_sel,.pgBntR_sel:hover{background: #cc1414 !important;}' +
            '.pgBntR_sel:active,.pgBntR:active  /* HOVER */{background: #990000 !important;}' +
            '.pgBntGn .bntBgGn,.pgBntGn_sel .bntBgGn,button.pgBntGn{border-color: #126823 !important;}' +
            '.pgBntGn,.pgBntGn_sel{color: white !important;}' +
            '.pgBntGn /* NORMAL */{' +
            'background: #3cbc4f !important;' +
            'background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDEgMSIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+CiAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkLXVjZ2ctZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPgogICAgPHN0b3Agb2Zmc2V0PSIyJSIgc3RvcC1jb2xvcj0iIzRjOWRmZiIgc3RvcC1vcGFjaXR5PSIxIi8+CiAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxODdiZjIiIHN0b3Atb3BhY2l0eT0iMSIvPgogIDwvbGluZWFyR3JhZGllbnQ+CiAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0idXJsKCNncmFkLXVjZ2ctZ2VuZXJhdGVkKSIgLz4KPC9zdmc+) !important;' +
            'background: -moz-linear-gradient(top, #3cbc4f 2%, #0fa531 100%) !important;' +
            'background: -webkit-gradient(linear, left top, left bottom, color-stop(2%,#3cbc4f), color-stop(100%,#0fa531)) !important;' +
            'background: -webkit-linear-gradient(top, #3cbc4f 2%,#0fa531 100%) !important;' +
            'background: -o-linear-gradient(top, #3cbc4f 2%,#0fa531 100%) !important;' +
            'background: -ms-linear-gradient(top, #3cbc4f 2%,#0fa531 100%) !important;' +
            'background: linear-gradient(to bottom, #3cbc4f 2%,#0fa531 100%) !important;' +
            '}' +
            '.pgBntGn:hover, /* HOVER */.pgBntGn_sel,.pgBntGn_sel:hover{background: #009917 !important;}' +
            '.pgBntGn_sel:active,.pgBntGn:active  /* HOVER */{background: #009917 !important;}' +
            '</style>' +
            '<script type="text/javascript">' +
            //'jQuery("#custpage_bs_pricing_approve").parent().addClass("bntBgGn").parent().addClass("pgBntGn");' +
            //'jQuery("#custpage_bs_pricing_reject").parent().addClass("bntBgR").parent().addClass("pgBntR");' +
            '</script>'
        );
        form.addButton('custpage_bs_pricing_approve', 'Create JE', "bsCreateJE();");
    }
}