/**
 * @Author: Mohammad M. AlBanna
 * Copyright © 2017 Jungle Scout
 *
 * All Operations that needed to connect to MWS API
*/

/** 
* NA:
* -----------------
* ATVPDKIKX0DER (US)
* A2EUQ1WTGCTBG2 (CA)
* A1AM78C64UM0Y8 (MX)

* EU:
* -----------------
* A1PA6795UKMFR9 (DE)
* A1RKKUPIHCS9HS (ES)
* A13V1IB3VIYZZH (FR)
* APJ6JRA9NG5V4 (IT)
* A1F83G8C2ARO7P (UK)
*
* IN:
* -----------------
* A21TJRUUN4KGV (IN)
*/

var protocol = "https";
var method = "POST";
var host = "mws.amazonservices.com";
var uri = "/Products/2011-10-01";
var marketPlaceId = "ATVPDKIKX0DER";
//NA
var US_AWSAccessKeyId = "";
var US_secretAccess = "";
var US_sellerId = "";
//EU
var UK_AWSAccessKeyId = "";
var UK_secretAccess = "";
var UK_sellerId = "";
//IN
var IN_AWSAccessKeyId = "";
var IN_secretAccess = "";
var IN_sellerId = "";

//Used Keys
var AWSAccessKeyId = "";
var secretAccess = "";
var sellerId = "";

var counterRequests = 0;
//----------------------------------------------------------------------------------//
//Load keys if not founded
getMWSAPIKeys();
//----------------------------------------------------------------------------------//
// Waiting a message to make request to MWS or get keys
chrome.runtime.onConnect.addListener(function(port) {
	if(port && port.name == "mwsAPIPort"){
		port.onMessage.addListener(function(request){
			if (request.marketPlaceId != "undefined" && request.operation == "mwsAPI" && typeof request.action != "undefined" && typeof request.asin != "undefined"){
				host = request.mwsHost;
				marketPlaceId = request.marketPlaceID;
				//NA
				if(marketPlaceId == "A2EUQ1WTGCTBG2" || marketPlaceId == "A1AM78C64UM0Y8" || marketPlaceId == "ATVPDKIKX0DER"){
					AWSAccessKeyId = US_AWSAccessKeyId;
					secretAccess = US_secretAccess;
					sellerId = US_sellerId;
				}
				//EU
				else if(marketPlaceId == "A1F83G8C2ARO7P" || marketPlaceId == "A1PA6795UKMFR9" || marketPlaceId == "A13V1IB3VIYZZH" || marketPlaceId == "A1RKKUPIHCS9HS" || marketPlaceId == "APJ6JRA9NG5V4"){
					AWSAccessKeyId = UK_AWSAccessKeyId;
					secretAccess = UK_secretAccess;
					sellerId = UK_sellerId;
				}
				//IN 
				else if(marketPlaceId == "A21TJRUUN4KGV"){
					AWSAccessKeyId = IN_AWSAccessKeyId;
					secretAccess = IN_secretAccess;
					sellerId = IN_sellerId;
				}

				var mwsRequest = generateRequest(request.asin, request.action);
				//Send the request
				requestToMWS(mwsRequest,port,request);
			}else if(request.operation == "checkMWSAPIKeys" && typeof request.accessKeyId != "undefined" && typeof request.sellerId != "undefined" && typeof request.secretAccess != "undefined"  && typeof request.marketPlaceId != "undefined" ){
				marketPlaceId = request.marketPlaceId;
				//NA
				if(marketPlaceId == "ATVPDKIKX0DER" || marketPlaceId == "A2EUQ1WTGCTBG2" || marketPlaceId == "A1AM78C64UM0Y8"){
					host = "mws.amazonservices.com";
				}
				//EU
				else if(marketPlaceId == "A1F83G8C2ARO7P" || marketPlaceId == "A1PA6795UKMFR9" || marketPlaceId == "A13V1IB3VIYZZH" || marketPlaceId == "A1RKKUPIHCS9HS" || marketPlaceId == "APJ6JRA9NG5V4"){
					host = "mws-eu.amazonservices.com";
				} 
				//IN
				else if(marketPlaceId == "A21TJRUUN4KGV"){
					host = "mws.amazonservices.in";
				}

				AWSAccessKeyId = request.accessKeyId;
				sellerId = request.sellerId;
				secretAccess = request.secretAccess;

				var mwsRequest = generateRequest("B002KT3XRQ", "GetMatchingProduct");
				//Check the mws keys
				checkMWSAPIKeys(mwsRequest, port, marketPlaceId, function(success){
					if(success){
						//NA
						if(marketPlaceId == "ATVPDKIKX0DER" || marketPlaceId == "A2EUQ1WTGCTBG2" || marketPlaceId == "A1AM78C64UM0Y8"){
							localStorage("us_mws_keys", JSON.stringify({awsAccessKeyId:request.accessKeyId,secretAccess:request.secretAccess,sellerId:request.sellerId}));
							US_AWSAccessKeyId = AWSAccessKeyId;
							US_secretAccess = secretAccess;
							US_sellerId = sellerId;
						}
						//EU
						else if(marketPlaceId == "A1F83G8C2ARO7P" || marketPlaceId == "A1PA6795UKMFR9" || marketPlaceId == "A13V1IB3VIYZZH" || marketPlaceId == "A1RKKUPIHCS9HS" || marketPlaceId == "APJ6JRA9NG5V4"){
							localStorage("uk_mws_keys", JSON.stringify({awsAccessKeyId:request.accessKeyId,secretAccess:request.secretAccess,sellerId:request.sellerId}));
							UK_AWSAccessKeyId = AWSAccessKeyId;
							UK_secretAccess = secretAccess;
							UK_sellerId = sellerId;
						} 
						//IN
						else if(marketPlaceId == "A21TJRUUN4KGV"){
							localStorage("in_mws_keys", JSON.stringify({awsAccessKeyId:request.accessKeyId,secretAccess:request.secretAccess,sellerId:request.sellerId}));
							IN_AWSAccessKeyId = AWSAccessKeyId;
							IN_secretAccess = secretAccess;
							IN_sellerId = sellerId;
						}
					}else{
						AWSAccessKeyId = "";
						sellerId = "";
						secretAccess = "";
					}
				});
			}
		});
	}//End if the port of mwsAPI
});
//----------------------------------------------------------------------------------//
//Make a request to MWS to get products details
function requestToMWS(mwsRequest, port, request){
	$.ajax({
		url:mwsRequest,
		method: "POST",
		success: function(data){
			//Convert XML to string
			var xmlText = new XMLSerializer()
			data = xmlText.serializeToString(data);
		 	port.postMessage({operation:request.operation, rowCounter:request.rowCounter, action:request.action, productData: data});
			counterRequests = 0;
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if(errorThrown == "Unauthorized"){
				port.postMessage({operation:request.operation, rowCounter:request.rowCounter, action:request.action, productData: null});
			}else{
				++counterRequests;
				if(counterRequests <= 20){
					setTimeout(function(){
			    		requestToMWS(mwsRequest,port,request);
			    	}, 2000);
				}else if(counterRequests > 20){
					port.postMessage({operation:request.operation, rowCounter:request.rowCounter, action:request.action, productData: null});
				}
			}
	    }
	});
}
//----------------------------------------------------------------------------------//
//Get MWS keys from storage and load them
function getMWSAPIKeys(){
	chrome.storage.local.get(["mws_keys", "us_mws_keys", "uk_mws_keys", "in_mws_keys"], function(result){
		//Load US
		if(typeof result.us_mws_keys != "undefined"){
			var theKeys = JSON.parse(result.us_mws_keys);
			//Write the values
		    US_AWSAccessKeyId = theKeys.awsAccessKeyId;
			US_secretAccess = theKeys.secretAccess;
			US_sellerId = theKeys.sellerId;
		}

		//Load UK
		if(typeof result.uk_mws_keys != "undefined"){
			var theKeys = JSON.parse(result.uk_mws_keys);
			//Write the values
		    UK_AWSAccessKeyId = theKeys.awsAccessKeyId;
			UK_secretAccess = theKeys.secretAccess;
			UK_sellerId = theKeys.sellerId;
		}

		//Load IN
		if(typeof result.in_mws_keys != "undefined"){
			var theKeys = JSON.parse(result.in_mws_keys);
			//Write the values
		    IN_AWSAccessKeyId = theKeys.awsAccessKeyId;
			IN_secretAccess = theKeys.secretAccess;
			IN_sellerId = theKeys.sellerId;
		}
	});
}
//----------------------------------------------------------------------------------//
//Generate the request to send to mws API
function generateRequest(asin, action){
	var today = new Date();
	time = today.toISOString();
	var parameters = {
   		"ASINList.ASIN.1":asin,
   		"AWSAccessKeyId":AWSAccessKeyId,
   		"Action": action,
   		"MarketplaceId":marketPlaceId,
   		"SellerId": sellerId,
   		"SignatureMethod":"HmacSHA256",
   		"SignatureVersion":"2",
   		"Timestamp":time,
   		"Version":"2011-10-01"
   	}

   	//Convert to Query
   	parameters = $.param( parameters );

   	//Signature
   	var messageToEncrypt =  method+"\n"+host+"\n"+uri+"\n"+parameters;
	var sig = CryptoJS.HmacSHA256(messageToEncrypt, secretAccess);
	sig = sig.toString(CryptoJS.enc.Base64);
 	sig = encodeURIComponent(sig);

 	//Final request
 	parameters = parameters+"&Signature="+sig;
	var mwsRequest = protocol+"://"+host+uri+"?"+parameters;
	return mwsRequest;
}
//----------------------------------------------------------------------------------//
//Check if the API keys the entered from user side are right and waiting the response of MWS API
function checkMWSAPIKeys(mwsRequest, port, marketPlaceId, callback){
	$.ajax({
		url:mwsRequest,
		method: "POST",
		success: function(data){
		 	port.postMessage({operation:"checkMWSAPIKeysStatus", marketPlaceId:marketPlaceId, status:true});
		 	callback.call(this,true);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			saveLastMWSAuthError(jqXHR);
			port.postMessage({operation:"checkMWSAPIKeysStatus", marketPlaceId:marketPlaceId, status:false});
			callback.call(this,false);
	    }
	});
}
//----------------------------------------------------------------------------------//
//Local Storage
function localStorage(key, value) {
    var obj = {};
    var key = key;
    obj[key] += key;
    obj[key] = value;
    chrome.storage.local.set(obj);
}

//----------------------------------------------------------------------------------//
function saveLastMWSAuthError(response){
	if(typeof response != "undefined" && typeof response.responseText != "undefined"){
		var xmlObject = $.parseXML( response.responseText );
		var errorCode = $(xmlObject).find("Code");
		var errorMessage = $(xmlObject).find("Message");
		var finalMessage = "Error code: " + $(errorCode).text() + ". Error Message: " + $(errorMessage).text();
		localStorage("mws_auth_error", finalMessage);
	}
}