/*

 */

function onAfterSubmit(type) {

    if (type == 'create'
        || type == 'edit'
        || type == 'copy'
        || type == 'xedit') {

        var id = nlapiGetRecordId();
        var oldRecord = nlapiGetOldRecord();
        var newRecord = nlapiGetNewRecord();

        var campaigncategory = newRecord.getFieldValue('campaigncategory');
        var leadsource = newRecord.getFieldValue('leadsource');

        if (!oldRecord ||
            ((campaigncategory != oldRecord.getFieldValue('campaigncategory'))
            || (leadsource != oldRecord.getFieldValue('leadsource')))) {

            if (leadsource || campaigncategory) {
                //nlapiLogExecution('DEBUG', 'Creating new customrecord_bs_lead_source_history');
                var leadSourceRec = nlapiCreateRecord('customrecord_bs_lead_source_history');


                var isLeadInactive = nlapiLookupField('lead', id, 'isinactive');
                if (isLeadInactive == 'T')
                    nlapiSubmitField('lead', id, 'isinactive', 'F');

                leadSourceRec.setFieldValue('custrecord_bs_lsh_customer', id);
                var idatetime = moment().format('MM/DD/YYYY h:m:ss A').toString();
                //nlapiLogExecution('DEBUG', 'idatetime', idatetime)
                leadSourceRec.setFieldValue('custrecordbs_lead_source_date_time', idatetime);
                leadSourceRec.setFieldValue('custrecord_bs_lead_source', newRecord.getFieldValue('leadsource'));
                leadSourceRec.setFieldValue('custrecordbs_lsh_campaign_category', newRecord.getFieldValue('campaigncategory'));
                var newId = nlapiSubmitRecord(leadSourceRec);

                if (isLeadInactive == 'T')
                    nlapiSubmitField('lead', id, 'isinactive', 'T');

                //nlapiLogExecution('DEBUG', 'new customrecord_bs_lead_source_history Id', newId);
            }
        }
      
        if( type == 'create' && leadsource == 1217 ){
        	nlapiSubmitField('lead', id, 'custentity_bs_subscribe_to_newsletter', 'T');

    		
    		var records = new Object();
    		records['lead'] = id;
    		
    		var message = "<html><head></head>" +
						"<body style='font-family: Verdana,Arial,Helvetica,sans-serif; font-size: 12pt; background-color: #f2f2f2;'>" +
						"<center style='width:100%;'>" +
						"<table width='800' align='center' border='0' cellspacing='0' cellpadding='0' bgcolor='ffffff' style='background-color:#FFFFFF;margin:0 auto;max-width:800px;width:inherit;'>" +
						"<tr>" +
							"<td><a href='https://www.brightsign.biz'><img src='https://system.na1.netsuite.com/c.3293628/site/v2/img/thumbnail_email-top-finance.png' /></a></td>" +
						"</tr>" +
						"<tr>" +
							"<td style='background-color: #ffffff; padding: 20px 10px;' class='table_content'>" +
								"<br><br>BrightSign would like to thank you for signing up to receive our newsletters!<br>" +
								"We will never sell our list, and you’ll only receive updates relevant to company news and product introductions.<br><br><br>" +
								"Please use the link below to go to our website.<br>" +
								"<a href='http://www.brightsign.biz'>www.brightsign.biz</a><br><br><br>" +
							"</td>" +
						"</tr>" +
						"<tr>" +
							"<td>" +
								"<table width='800' cellpadding='10' bgcolor='3d3d3d' style='color:#fff; font-size: 10px; width:100%;  font-family: Helvetica;'>" +
									"<tr>" +
										"<td bgcolor='#3d3d3d'><h3>Contact Us:</h3>" +
										"<br />" +
										"BrightSign, LLC<br />" +
										"983 University Ave, Bldg. A<br />" +
										"Los Gatos, CA 95032<br />" +
										"1-408-852-9263<br />" +
										"<a href='mailto:sales@brightsign.biz' style='color:#ffffff'>sales@brightsign.biz</a></td>" +
									"</tr>" +
									"<tr>" +
										"<td bgcolor='3d3d3d' align='center'>Copyright © 2018 BrightSign LLC, All rights reserved.</td>" +
									"</tr>" +
								"</table>" +
							"</td>" +
						"</tr>" +
						"</table>" +
						"</center>" +
						"</body></html>";
    		
    		nlapiSendEmail(69739/* Sales */, id, "You've been Subscribed!", message, null, null, records);
        }

        var oldPriceLevel = oldRecord ? oldRecord.getFieldValue('pricelevel') : "";
        var newPriceLevel = newRecord.getFieldValue('pricelevel');
        var tiers345 = ['11','13','15'];
        if( newPriceLevel != oldPriceLevel && tiers345.indexOf( newPriceLevel ) != -1 ){
        	var priceLevelName = ( newPriceLevel == '11' ) ? 'Tier 3' : ( ( newPriceLevel == '13' ) ? 'Tier 4' : 'Tier 5' );
        	var customerName = nlapiLookupField('customer', id, 'entityid');
        	var curEmployee = nlapiGetUser();
        	var curEmployeeName = nlapiLookupField( 'employee', curEmployee, 'firstname' ) + " " + nlapiLookupField( 'employee', curEmployee, 'lastname' );

            var records = new Object();
            records['entity'] = id;

            var message = "<html><head></head>" +
                "<body style='font-family: Verdana,Arial,Helvetica,sans-serif; font-size: 12pt; background-color: #f2f2f2;'>" +
                "<center style='width:100%;'>" +
                "<table width='800' align='center' border='0' cellspacing='0' cellpadding='0' bgcolor='ffffff' style='background-color:#FFFFFF;margin:0 auto;max-width:800px;width:inherit;'>" +
                "<tr>" +
                "<td><a href='https://www.brightsign.biz'><img src='https://system.na1.netsuite.com/c.3293628/site/v2/img/thumbnail_email-top-finance.png' /></a></td>" +
                "</tr>" +
                "<tr>" +
                "<td style='background-color: #ffffff; padding: 20px 10px;' class='table_content'>" +
                "<br><br>Dear Sarah,<br>" +
                curEmployeeName + " has assigned <b>" + priceLevelName + "</b> Price Level to this Customer:<br><br><br>" +
                "<a href='https://system.na1.netsuite.com/app/common/entity/custjob.nl?id=" + id + "'>" + customerName + "</a><br><br><br>" +
                "</td>" +
                "</tr>" +
                "<tr>" +
                "<td>" +
                "<table width='800' cellpadding='10' bgcolor='3d3d3d' style='color:#fff; font-size: 10px; width:100%;  font-family: Helvetica;'>" +
                "<tr>" +
                "<td bgcolor='#3d3d3d'><h3>Contact Us:</h3>" +
                "<br />" +
                "BrightSign, LLC<br />" +
                "983 University Ave, Bldg. A<br />" +
                "Los Gatos, CA 95032<br />" +
                "1-408-852-9263<br />" +
                "<a href='mailto:sales@brightsign.biz' style='color:#ffffff'>sales@brightsign.biz</a></td>" +
                "</tr>" +
                "<tr>" +
                "<td bgcolor='3d3d3d' align='center'>Copyright © 2019 BrightSign LLC, All rights reserved.</td>" +
                "</tr>" +
                "</table>" +
                "</td>" +
                "</tr>" +
                "</table>" +
                "</center>" +
                "</body></html>";

            nlapiSendEmail(69739/* Sales */, 19580/* Sarah Dryden */, "Customer " + customerName + " was given " + priceLevelName + " Price Level!", message, "kbyres@brightsign.biz", null, records);
		}
    }
}