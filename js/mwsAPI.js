/**
 * @Author: Mohammad M. AlBanna
 * Copyright © 2017 Jungle Scout
 * 
 * check MWS API keys and save them
 */

$(function(){
	//---------------------------------------------------------------------------------//
	//Google Analytics
	var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-52913301-9']);
	_gaq.push(['_trackPageview','mwsAPI.js']);

	(function() {
	  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	  ga.src = 'https://ssl.google-analytics.com/ga.js';
	  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();
	//---------------------------------------------------------------------------------//
	//Tabs
	$('ul.tabs li').click(function(){
		var tab_id = $(this).attr('data-tab');

		$('ul.tabs li').removeClass('current');
		$('.tab-content').removeClass('current');

		$(this).addClass('current');
		$("#"+tab_id).addClass('current');
	})
	//---------------------------------------------------------------------------------//
	var mwsAPIPort = chrome.runtime.connect({name: "mwsAPIPort"});

	// Waiting the response of the status of sent API keys to mwsAPIRequest.js
	mwsAPIPort.onMessage.addListener(function(request){
		if(request.operation == "checkMWSAPIKeysStatus"){
			if(request.status){
				var storeForm = null;
				//NA
				if(request.marketPlaceId == "A2EUQ1WTGCTBG2" || request.marketPlaceId == "A1AM78C64UM0Y8" || request.marketPlaceId == "ATVPDKIKX0DER"){
					storeForm = $("#us-mws-keys");
				}
				//EU
				else if(request.marketPlaceId == "A1F83G8C2ARO7P" || request.marketPlaceId == "A1PA6795UKMFR9" || request.marketPlaceId == "A13V1IB3VIYZZH" || request.marketPlaceId == "A1RKKUPIHCS9HS" || request.marketPlaceId == "APJ6JRA9NG5V4"){
					storeForm = $("#uk-mws-keys");
				}
				//IN
				else if(request.marketPlaceId == "A21TJRUUN4KGV"){
					storeForm = $("#in-mws-keys");
				}

				$(storeForm).find(".message").removeClass("error success info");
				$(storeForm).find(".message").addClass("success");
				$(storeForm).find(".message").text("High Five! Your API Keys Look Beautiful!");
				$(storeForm).find(".message").fadeIn("fast");
				//Send message to refresh Amazon pages
		        chrome.runtime.sendMessage({
		            action: "refreshAmazonPages"
		        });
			}else{
				var storeForm = null;
				//NA
				if(request.marketPlaceId == "A2EUQ1WTGCTBG2" || request.marketPlaceId == "A1AM78C64UM0Y8" || request.marketPlaceId == "ATVPDKIKX0DER"){
					storeForm = $("#us-mws-keys");
				}
				//EU
				else if(request.marketPlaceId == "A1F83G8C2ARO7P" || request.marketPlaceId == "A1PA6795UKMFR9" || request.marketPlaceId == "A13V1IB3VIYZZH" || request.marketPlaceId == "A1RKKUPIHCS9HS" || request.marketPlaceId == "APJ6JRA9NG5V4"){
					storeForm = $("#uk-mws-keys");
				}
				//IN
				else if(request.marketPlaceId == "A21TJRUUN4KGV"){
					storeForm = $("#in-mws-keys");
				}

				$(storeForm).find(".message").removeClass("error success info");
				$(storeForm).find(".message").addClass("error");
				$(storeForm).find(".message").text("Aw Shucks...We can't seem to validate your API keys. Please double check you entered them correctly and try again!");
				$(storeForm).find(".message").fadeIn();
			}
		}
	});

	//---------------------------------------------------------------------------------//
	//Check the keys
	chrome.storage.local.get(["mws_keys", "us_mws_keys", "uk_mws_keys", "in_mws_keys"], function(result){
		if(typeof result.mws_keys != "undefined" || typeof result.us_mws_keys != "undefined"){
			$("#us-mws-keys").find(".message").removeClass("error success info");
			$("#us-mws-keys").find(".message").addClass("info");
			$("#us-mws-keys").find(".message").text("High Five! Your API Keys Look Beautiful!");
			$("#us-mws-keys").find(".message").fadeIn();
		}

		if(typeof result.uk_mws_keys != "undefined"){
			$("#uk-mws-keys").find(".message").removeClass("error success info");
			$("#uk-mws-keys").find(".message").addClass("info");
			$("#uk-mws-keys").find(".message").text("High Five! Your API Keys Look Beautiful!");
			$("#uk-mws-keys").find(".message").fadeIn();
		}

		if(typeof result.in_mws_keys != "undefined"){
			$("#in-mws-keys").find(".message").removeClass("error success info");
			$("#in-mws-keys").find(".message").addClass("info");
			$("#in-mws-keys").find(".message").text("High Five! Your API Keys Look Beautiful!");
			$("#in-mws-keys").find(".message").fadeIn();
		}
	});

	//---------------------------------------------------------------------------------//
	//Check and save mws keys for first time
	$("body").on("click","#us-form-submit, #uk-form-submit, #in-form-submit", function(e){
		e.preventDefault();
		var parentForm = $(this).parents("form");
		$(parentForm).find(".message").removeClass("error success info");
		$(parentForm).find(".message").addClass("info");
		$(parentForm).find(".message").text("Checking...");
		$(parentForm).find(".message").fadeIn("fast");

		var AWSAccessKeyId = $(parentForm).find("input[name='AWSAccessKeyId']").val();
		var secretAccess = $(parentForm).find("input[name='secretAccess']").val();
		var sellerId = $(parentForm).find("input[name='sellerId']").val();
		var marketPlaceId = $(parentForm).find("input[name='marketPlaceId']").val();

		sellerId = sellerId ? sellerId.trim() : null;
		marketPlaceId = marketPlaceId ? marketPlaceId.trim() : null;
		
		//Set default market places
		if(marketPlaceId == null){
			if($(parentForm).attr("id") == "us-mws-keys"){
				marketPlaceId = "ATVPDKIKX0DER";
			} else if($(parentForm).attr("id") == "uk-mws-keys"){
				marketPlaceId = "A1F83G8C2ARO7P";
			} else if($(parentForm).attr("id") == "in-mws-keys"){
				marketPlaceId = "A21TJRUUN4KGV";
			}
		}
		
		AWSAccessKeyId = AWSAccessKeyId ? AWSAccessKeyId.trim() : null;
		secretAccess = secretAccess ? secretAccess.trim() : null;

		if(!AWSAccessKeyId || !secretAccess || !sellerId){
			$(parentForm).find(".message").removeClass("error success info");
			$(parentForm).find(".message").addClass("error");
			$(parentForm).find(".message").text("All fields are required!");
			$(parentForm).find(".message").fadeIn();
			return false;
		}

		//Send the request
		mwsAPIPort.postMessage({operation:"checkMWSAPIKeys",accessKeyId:AWSAccessKeyId, secretAccess:secretAccess, sellerId:sellerId, marketPlaceId: marketPlaceId});
	});
	
	//---------------------------------------------------------------------------------//
	//Close current page
	$("body").on("click",".closeBtn", function(e){ 
		window.close();
	});
});