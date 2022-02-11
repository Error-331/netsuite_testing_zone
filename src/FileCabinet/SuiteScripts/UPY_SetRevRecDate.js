/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* @ FILENAME      : UPY_SetRevRecDate.js 
* @ AUTHOR        : diane@upaya
* @ DATE          : 9 Oct 2015
*
* Copyright (c) 2015 Upaya - The Solution Inc.
* 4300 Stevens Creek Blvd Suite # 218, San Jose, CA 95129
* All Rights Reserved.
*
* This software is the confidential and proprietary information of 
* Upaya - The Solution Inc. ("Confidential Information"). You shall not
* disclose such Confidential Information and shall use it only in
* accordance with the terms of the license agreement you entered into
* with Upaya.
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

//before submit - userevent
function setRevRecDateOnAfterSave(type)
{
	if(type!='create' && type!='edit')
	{
		return true;
	}
	
	var recInv = nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId());//nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId());	
	var stSOId = recInv.getFieldValue('createdfrom');
	
	if(!stSOId) return;
	
	//var recSO = nlapiLoadRecord('salesorder',stSOId);
	var intCount = recInv.getLineItemCount('item');
	var stTranDt = recInv.getFieldValue('trandate');
		
	var objOneYear = nlapiAddMonths(nlapiStringToDate(stTranDt),11);
		objOneYear = nlapiAddDays(objOneYear,-1);
		
	var objTwoYears = nlapiAddMonths(nlapiStringToDate(stTranDt),23);
	    objTwoYears = nlapiAddDays(objTwoYears,-1);
		
	var objThreeYears = nlapiAddMonths(nlapiStringToDate(stTranDt),35);
	    objThreeYears = nlapiAddDays(objThreeYears,-1); 
		
	var objOneMonth = nlapiAddMonths(nlapiStringToDate(stTranDt),1);
		objOneMonth = nlapiAddDays(objOneMonth,-1); 
		
	var objQuartMonth = nlapiAddMonths(nlapiStringToDate(stTranDt),2);
	    objQuartMonth = nlapiAddDays(objQuartMonth,-1); 
	
	var stStartDt = stTranDt;
	var stEndDt = nlapiDateToString(objOneYear);
	var stEndDtTwoYrs = nlapiDateToString(objTwoYears);
	var stEndDtThreeYrs = nlapiDateToString(objThreeYears);
	var stEndDtOneMonth = nlapiDateToString(objOneMonth);
	var stEndDtQuartMonth = nlapiDateToString(objQuartMonth);
	nlapiLogExecution('DEBUG','setRevRecDateOnAfterSave','stStartDt:' + stStartDt + ' stEndDt:' + stEndDt);
	
	for(var i=1; i<=intCount; i++)
	{
		var stInvRevRecStartDt = recInv.getLineItemValue('item','revrecstartdate',i);
		var stInvRevRecEndDt = recInv.getLineItemValue('item','revrecenddate',i);
		var stRevRec = recInv.getLineItemValue('item','revrecschedule',i);
		nlapiLogExecution('debug','stRevRec',stRevRec);
		
		if(!stInvRevRecStartDt || !stInvRevRecEndDt)
		{
			continue;
		}
			if(stRevRec==1||stRevRec==125)
			{			
			recInv.setLineItemValue('item','revrecstartdate',i,stStartDt);
			recInv.setLineItemValue('item','revrecenddate',i,stEndDt);
			}
			else if(stRevRec==2||stRevRec==126)
			{
			recInv.setLineItemValue('item','revrecstartdate',i,stStartDt);
			recInv.setLineItemValue('item','revrecenddate',i,stEndDtTwoYrs);	
			}
			else if(stRevRec==79||stRevRec==127||stRevRec==4)
			{
			recInv.setLineItemValue('item','revrecstartdate',i,stStartDt);
			recInv.setLineItemValue('item','revrecenddate',i,stEndDtThreeYrs);	
			}
			else if(stRevRec==123)
			{
			recInv.setLineItemValue('item','revrecstartdate',i,stStartDt);
			recInv.setLineItemValue('item','revrecenddate',i,stEndDtOneMonth);	
			}
			else if(stRevRec==124)
			{
			recInv.setLineItemValue('item','revrecstartdate',i,stStartDt);
			recInv.setLineItemValue('item','revrecenddate',i,stEndDtQuartMonth);	
			}
	}
	
	var stSOId = nlapiSubmitRecord(recInv, false ,true);
	nlapiLogExecution('DEBUG','setRevRecDateOnAfterSave','stSOId:' + stSOId);
}


