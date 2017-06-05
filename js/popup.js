/**
 * @Author: Mohammad M. AlBanna
 * Copyright © 2017 Jungle Scout
 *
 * JS popup icon beside address bar
 */
 
$(function(){
	var port = null;
	var supportedStores = /(amazon.com$)|(amazon.co.uk$)|(amazon.ca$)|(amazon.de$)|(amazon.fr$)/i;
	var optionalStores = /(amazon.in$)|(amazon.com.mx$)|(amazon.it$)|(amazon.es$)/i;
	var optionalStoresList = ["*://www.amazon.in/*", "*://www.amazon.com.mx/*", "*://www.amazon.it/*", "*://www.amazon.es/*", "*://*.amazonservices.in/*"];
	chrome.storage.local.get("auth",function(result){
 		if(Object.keys(result).length === 0){
 			//Check if the page opened
 			chrome.tabs.query({url:chrome.extension.getURL("login.html")}, function (tabs) {
 				if(tabs.length == 0){
 					chrome.tabs.create({ url: chrome.extension.getURL("login.html") });
 					window.close();
	 				return false;
 				}else{
 					chrome.tabs.update(tabs[0].id, { highlighted: true });
 					window.close();
 					return false;
 				}
			});
	 	}else{
		 	chrome.tabs.query({currentWindow: true, active: true}, function(tabs){ 
				//Check url if it Amazon or not
				var url = tabs[0].url;
				var domainURL = getDomain(url);
				if(supportedStores.test(domainURL)){
					port = chrome.tabs.connect(tabs[0].id,{name: "jsPopupChannel"});
					port.postMessage({url:url,action: "openCloseJsPopup"});
					window.close();
					return false;
				} else if(optionalStores.test(domainURL)){
					chrome.permissions.contains({
			            origins: optionalStoresList
			          }, function(result) {
			            if (!result) {
			            	$("#not_supported_store").css("display","none");
							$("#request_access_store").css("display","inline-block");
			            } else{
			            	port = chrome.tabs.connect(tabs[0].id,{name: "jsPopupChannel"});
							port.postMessage({url:url,action: "openCloseJsPopup"});
							window.close();
							return false;
			            }
			        });
				}
			});
	 	}
	});

	//----------------------------------------------------------------//
	function getDomain(url) {
		url = url.replace(/https?:\/\/(www.)?/i, '');
		if (url.indexOf('/') === -1) {
			return url;
		}
		return url.split('/')[0];
	}
	//----------------------------------------------------------------//
	//Request access to the new store
	$("body").on("click", "#request_access_store", function(){
		//To refresh all amazon pages
		chrome.runtime.connect({name:"newPermissionRequested"});
		//If the user doesn't have the permission, request it
        chrome.permissions.request({origins: optionalStoresList});
	});
});