/**
 * @Author: Mohammad M. AlBanna
 * Copyright © 2017 Jungle Scout
 *
 * Contains Jungle Scout Settings
 */

$(function() { 
	//---------------------------------------------------------------------------------//
	//Google Analytics
	var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-52913301-9']);
	_gaq.push(['_trackPageview','settings.js']);

	(function() {
	  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	  ga.src = 'https://ssl.google-analytics.com/ga.js';
	  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();
	//---------------------------------------------------------------------------------//
	//Select all / unselect all
	$("body").on("click","#selectAllSettings",function(e){
		e.preventDefault();
		$("input[type='checkbox']").prop("checked",true);
	});
	$("body").on("click","#unSelectAllSettings",function(e){
		e.preventDefault();
		$("input[type='checkbox']").prop("checked",false);
	});
	//---------------------------------------------------------------------------------//
	$("body").on("click","#clear",function(e){ 
		//Check the selected settings
		if($("input[type='checkbox']:checked").length == 0){
			$(".message").removeClass("error success");
			$(".message").addClass("error");
			$(".message").text("Please select something to clear!");
			$(".message").fadeIn();
		}else{
			if($("input[name='clearAPIKeys']").is(":checked")){
				chrome.storage.local.remove(["mws_keys","us_mws_keys","uk_mws_keys"]);
				//Remove columns that depend on the keys
				syncStorage("columnFbaFee", "N");
		        syncStorage("columnTier", "N");
		        syncStorage("columnNewSeller", "N");
		        syncStorage("columnItemWeight", "N");
		        syncStorage("columnItemWidth", "N");
		        syncStorage("columnItemHeight", "N");
		        syncStorage("columnItemLength", "N");
		        syncStorage("columnNet", "N");
			}

			if($("input[name='clearCache']").is(":checked")){
				chrome.storage.local.remove("current_state");
				chrome.storage.local.remove("mws_auth_error");
			}

			if($("input[name='resetPopupDimensions']").is(":checked")){
				chrome.storage.local.remove("currentDimension");
			}

			if($("input[name='resetPopupPosition']").is(":checked")){
				chrome.storage.local.remove("currentPosition");
			}

			if($("input[name='resetActiveColumns']").is(":checked")){
				resetColumnsSettings();
			}

			if($("input[name='clearLastScreenshot']").is(":checked")){
				chrome.storage.local.remove("last_screenshot");
			}

			if($("input[name='clearLoginCredential']").is(":checked")){
				chrome.storage.local.remove("auth");
			}

			$(".message").removeClass("error success");
			$(".message").addClass("success");
			$(".message").text("Settings have been reset successfully!");
			$(".message").fadeIn();

			$("input[type='checkbox']").prop("checked",false);
			//Send message to refresh Amazon pages
	        chrome.runtime.sendMessage({
	            action: "refreshAmazonPages"
	        });

	        setTimeout(function(){
	        	$(".message").removeClass("error success");
	        	$(".message").fadeOut();
	        },5000);
		}
	});
	
	//----------------------------------------------------------------------------------//
	function resetColumnsSettings(){
        syncStorage("columnBrand", "Y");
        syncStorage("columnPrice", "Y");
        syncStorage("columnCategory", "Y");
        syncStorage("columnRank", "Y");
        syncStorage("columnEstSales", "Y");
        syncStorage("columnEstRevenue", "Y");
        syncStorage("columnNumReviews", "Y");
        syncStorage("columnRating", "Y");
        syncStorage("columnBbSeller", "Y");
        syncStorage("columnFbaFee", "N");
        syncStorage("columnTier", "N");
        syncStorage("columnNewSeller", "N");
        syncStorage("columnItemWeight", "N");
        syncStorage("columnItemWidth", "N");
        syncStorage("columnItemHeight", "N");
        syncStorage("columnItemLength", "N");
        syncStorage("columnNet", "N");
	}
	//----------------------------------------------------------------------------------//
	//Sync Storage
	function syncStorage(key, value) {
	    var obj = {};
	    var key = key;
	    obj[key] += key;
	    obj[key] = value;
	    chrome.storage.sync.set(obj);
	}
	//---------------------------------------------------------------------------------//
	//Report a problem link
	$("body").on("click",".report-problem", function(e){ 
		e.preventDefault();
		var clientInfoObject = getClientInfo();
		var searchTerm = "";
		var amazonURL = "";
		var lastMWSAuthError = "";
		var manifest = chrome.runtime.getManifest();
		var JSName = manifest.name;
		var JSVersion = manifest.version;
		chrome.storage.local.get(["current_state","mws_auth_error"],function(result){ 
			if(typeof result.current_state != "undefined"){
				var currentState = Object.keys(result).length > 0 ? JSON.parse(result.current_state) : null;
				if(currentState){
					searchTerm = currentState.currentSearchTerm;
					amazonURL = currentState.currentUrl;
				}
			}
			//Get the last MWS authentication errors
			if(typeof result.mws_auth_error != "undefined" && result.mws_auth_error.length > 0){
				lastMWSAuthError = result.mws_auth_error;
			}

			var jsBug = JSON.stringify({clientInfoObject:clientInfoObject,searchTerm:searchTerm,amazonURL:amazonURL,JSName:JSName,JSVersion:JSVersion, lastAmazonMWSError:lastMWSAuthError});
			goToUrl("https://www.junglescout.com/bugs-report/",{jsBug:jsBug},"POST");
		});
	});
	//---------------------------------------------------------------------------------//
	//Close current page
	$("body").on("click","#close", function(e){ 
		e.preventDefault();
		window.close();
	});

	//---------------------------------------------------------------------------------//
	//Go to URL with form data
	function goToUrl(path, params, method) {
	    //Null check
	    method = method || "post"; // Set method to post by default if not specified.
	    var form = document.createElement("form");
	    form.setAttribute("method", method);
	    form.setAttribute("action", path);

	    //Fill the hidden form
	    if (typeof params === 'string') {
	        var hiddenField = document.createElement("input");
	        hiddenField.setAttribute("type", "hidden");
	        hiddenField.setAttribute("name", 'data');
	        hiddenField.setAttribute("value", params);
	        form.appendChild(hiddenField);
	    }
	    else {
	        for (var key in params) {
	            if (params.hasOwnProperty(key)) {
	                var hiddenField = document.createElement("input");
	                hiddenField.setAttribute("type", "hidden");
	                hiddenField.setAttribute("name", key);
	                if(typeof params[key] === 'object'){
	                    hiddenField.setAttribute("value", JSON.stringify(params[key]));
	                }
	                else{
	                    hiddenField.setAttribute("value", params[key]);
	                }
	                form.appendChild(hiddenField);
	            }
	        }
	    }

	    document.body.appendChild(form);
	    form.submit();
	}
});
