/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Oct 2018     Eugene Karakovsky
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type){
   
}

function blessingsREST(){
	var json = {
			  "licenses": [
			               "AC-3", "disable-packet-capture", "internal-storage-only"
			             ],
			  "netsuiteRecord": {
				  "Sales Order Number": "12345",
				  "Brand Model Number": "XT1143",
				  "Manufacturer Name": "LITE-ON TECHNOLOGY CORPORATION",
				  "Unique Model Number": "XT1143",
				  "Product Category Code (PCC)": "HNC",
				  "Dolby Technology Code ID": "860",
				  "Dolby Technology Code": "5A35D+",
				  "Royalty Units": "5",
				  "Country Made In": "CHI",
				  "Country Sold In": "USA"
             }
			}
	var url = getRESTletURL();

	var headers = new Array();
	headers['Cache-Control'] = 'no-cache';
	headers['x-api-key'] = 'QU090j6ply5q133dsXIiO4MqbIG9Ouir90GZtuxS';
	headers['Content-Type'] = 'application/json';

	var response = nlapiRequestURL( url, json, headers );

	var responsebody = JSON.parse(response.getBody());

	var error = responsebody['error'];
	if (error)
	{
		var code = error.code;
		var message = error.message;
		console.log(error);
		//nlapiLogExecution('DEBUG','failed: code='+code+'; message='+message);
		//nlapiCreateError(code, message, false);
	}

	return console.log(responsebody);
}

function getRESTletURL()
{
   return 'https://2d2xhbxu2f.execute-api.eu-west-1.amazonaws.com/development/players/1234netsuite/blessings';
}
 
function credentials()
{
    this.email='jsmith@abcauto.com';
    this.account=getAccount();
    this.role='3';
    this.password='mysecretpwd';
}