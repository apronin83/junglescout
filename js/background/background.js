/**
 * @Author: Mohammad M. AlBanna
 * Copyright © 2017 Jungle Scout
 *
 * The background of the extension
 */

 //review-junglescout.herokuapp.com
 //junglescoutpro.herokuapp.com

//Constants
CHECK_SCRAPED_DATA_EACH_MS = 600000; //In milliseconds = 10 mins
CLEAR_SCRAPED_DATA_EACH_M = 20; //In minutes = 20 mins
CHECK_USER_EXISTENCE_EACH_MS = 10800000; //In hours = 3 hours

//General
lastXMLRequests = [];
documentsList = [];
successAjaxRequests = 0;
numberOfAjaxRequests = 0;

$.ajaxSetup({
    timeout: 60000,
    error: function(jqXHR, textStatus, errorThrown) {
        stopAllAjaxRequests();
    }
});

//All supported stores
var supportedStoresList = ["*://www.amazon.com/*", "*://www.amazon.co.uk/*", "*://www.amazon.ca/*", "*://www.amazon.fr/*", "*://www.amazon.de/*", "*://www.amazon.in/*", "*://www.amazon.com.mx/*", "*://www.amazon.it/*", "*://www.amazon.es/*"];
//Optional stores to inject needed files
var optionalStores = /(amazon.in$)|(amazon.com.mx$)|(amazon.it$)|(amazon.es$)/i;
var optionalStoresList = ["*://www.amazon.in/*", "*://www.amazon.com.mx/*", "*://www.amazon.it/*", "*://www.amazon.es/*"];

//----------------------------------------------------------------------------------//
//Connection between injected scripts and background to make requests to Amazon
amazonProductsPorts = [];
chrome.runtime.onConnect.addListener(function(port) { 
    if(port && port.name == "amazonProductsPort"){
        amazonProductsPorts.push(port);
        port.onDisconnect.addListener(function(port) {  
            $.each(amazonProductsPorts, function(index, deletePort) {
                if(port && port == deletePort){
                    amazonProductsPorts.splice(index, 1);
                }
            });
        });
    } else if(port.name == "newPermissionRequested"){
        //On the popup is closed, refresh amazon pages
        port.onDisconnect.addListener(function(port) { 
            refreshAmazonPages();
        });
    }
});
//----------------------------------------------------------------------------------//
//When the ajax is stopped, let injected scripts know about that
$(document).ajaxStop(function() {
    setTimeout(function(){
        if(amazonProductsPorts.length > 0 && successAjaxRequests == numberOfAjaxRequests){
            $.each(amazonProductsPorts, function(index, port){
                if(port){
                    port.postMessage({action: "ajaxStopped"});
                }
            });

            $.each(documentsList, function(index, neededDocument){
                neededDocument.remove();
            });

            lastXMLRequests = [];
            documentsList = [];
            successAjaxRequests = 0;
            numberOfAjaxRequests = 0;
        }
    }, 1500);
});

//----------------------------------------------------------------------------------//
checkExistence();
//Auto check existense every 3 hours
setInterval(checkExistence, CHECK_USER_EXISTENCE_EACH_MS);
//----------------------------------------------------------------------------------//
//Auto check the lastScraped URL
setInterval(checkLastScraped, CHECK_SCRAPED_DATA_EACH_MS);
//---------------------------------------------------------------------------------//
//Google Analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-52913301-9']);
_gaq.push(['_trackPageview','background.js']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
//----------------------------------------------------------------------------------//
// Check settings for first time/update time
chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "update" || details.reason == "install"){
        checkSettings();
        //Refresh Amazon pages
   		refreshAmazonPages();
    }
});
//----------------------------------------------------------------------------------//
// Refresh Amazon pages, Google Analytics, make requests to amazon pages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Waiting a message to refresh all Amazon pages
	if (request.action == "refreshAmazonPages"){
	  	//Refresh Amazon pages
	   	refreshAmazonPages();
	}else if(request.action == "googleAnalyticsAction" && typeof request.page != "undefined"){
        _gaq.push(['_trackPageview',request.page]);
    } else if(request.action == "makeRequest" && typeof request.link != "undefined"){
        ++numberOfAjaxRequests;
        var XMLRequest = $.ajax({
            type: "GET",
            dataType: "text",
            url: request.link,
            success: function(data, textStatus) {
                //Product data
                ++successAjaxRequests;
                var myHTML = insertDocument(data);
                var parser = new Parser(myHTML);
                sendResponse({
                    data: data,
                    getProductTitle: parser.getProductTitle(), 
                    getProductImage: parser.getProductImage(),
                    getBrand: parser.getBrand(request.passingData),
                    getPrice: parser.getPrice(request.passingData),
                    getRankAndCategory: parser.getRankAndCategory(request.bestSellerRankText),
                    getBbSeller: parser.getBbSeller(),
                    getReviews: parser.getReviews(),
                    getRating: parser.getRating()
                });
            }, 
            error: function(jqXHR, textStatus, errorThrown){
                if(numberOfAjaxRequests > 0){
                    --numberOfAjaxRequests;
                }
            }
        });
        lastXMLRequests.push(XMLRequest);
        //Async
        return true;
    } else if(request.action == "stopAllAjaxRequests"){
        stopAllAjaxRequests();
    } 
    //If I really have the html data
    else if(request.action == "makeDataParse" && typeof request.htmlPage != "undefined"){ 
        var myHTML = request.htmlPage;
        myHTML = insertDocument(myHTML);
        var parser = new Parser(myHTML);
        sendResponse({
            getProductTitle: parser.getProductTitle(), 
            getProductImage: parser.getProductImage(),
            getBrand: parser.getBrand(request.passingData),
            getPrice: parser.getPrice(request.passingData),
            getRankAndCategory: parser.getRankAndCategory(request.bestSellerRankText),
            getBbSeller: parser.getBbSeller(),
            getReviews: parser.getReviews(),
            getRating: parser.getRating()
        });
    }
});

//----------------------------------------------------------------------------------//
//Check if the user exist
function checkExistence(){
	chrome.storage.local.get("auth",function(result){
	 	if(Object.keys(result).length === 0){
	 		return false;
	 	}

	 	//Auto check existense
	 	result = JSON.parse(result.auth);
        $.get("https://junglescoutpro.herokuapp.com/api/v1/users/authenticate?username="+encodeURIComponent(result.username),function(response){
            if(response && !response.status){
                chrome.storage.local.remove("auth");
                return false;
            }else{
                //Save last checked date
                result.last_checked = Date.now();
                console.log("Renewed: "+ result.last_checked);
                result.daily_token = typeof response.daily_token != "undefined" ? $.trim(response.daily_token) : "";
                result = JSON.stringify(result);
                var obj = {};
                var key = "auth";
                obj[key] += "auth";
                obj[key] = result;
                chrome.storage.local.set(obj);
            }
        }, "json");
	});
}//end checkExistence 

//----------------------------------------------------------------------------------//
//Remove last scraped data
function checkLastScraped(){
    chrome.storage.local.get(["current_state"],function(result){ 
        if(Object.keys(result).length > 0){
            var lastScraped = JSON.parse(result.current_state).lastScraped;
            var timeDiff = new TimeDiff(lastScraped);
            if(timeDiff.getDiffMins() >= CLEAR_SCRAPED_DATA_EACH_M){
                chrome.storage.local.remove("current_state");
            }
        }
    });
}
//----------------------------------------------------------------------------------//
//Get the time of last scraped data
function TimeDiff(lastScraped) {
    var now = new Date();    
    var lastScrapedTime = new Date(lastScraped);

    var getDiffInMins = function() {
        return (now - lastScrapedTime) / 1000 / 60;
    };

	var getDiffMins = function() {
	    return Math.round(getDiffInMins() % 60);
	};

    var getDiffInHrs = function() {
        return Math.floor(getDiffInMins() / 60);
    };

    return {
        getDiffMins:getDiffMins,
        getDiffInHrs:getDiffInHrs
    };
}
//----------------------------------------------------------------------------------//
//Get extension's settings/options like columns for first time
function checkSettings(){
	chrome.storage.sync.get(null,function(result){
        if(typeof result.columnBrand == "undefined"){
            syncStorage("columnBrand", "Y");
        }

        if(typeof result.columnPrice == "undefined"){
            syncStorage("columnPrice", "Y");
        }

        if(typeof result.columnCategory == "undefined"){
            syncStorage("columnCategory", "Y");
        }

        if(typeof result.columnRank == "undefined"){
            syncStorage("columnRank", "Y");
        }

		if(typeof result.columnEstSales == "undefined"){
            syncStorage("columnEstSales", "Y");
        }

        if(typeof result.columnEstRevenue == "undefined"){
            syncStorage("columnEstRevenue", "Y");
        }

        if(typeof result.columnNumReviews == "undefined"){
            syncStorage("columnNumReviews", "Y");
        }

        if(typeof result.columnRating == "undefined"){
            syncStorage("columnRating", "Y");
        }

        if(typeof result.columnBbSeller == "undefined"){
            syncStorage("columnBbSeller", "Y");
        }

        if(typeof result.columnFbaFee == "undefined"){
            syncStorage("columnFbaFee", "N");
        }

        if(typeof result.columnTier == "undefined"){
            syncStorage("columnTier", "N");
        }

        if(typeof result.columnNewSeller == "undefined"){
            syncStorage("columnNewSeller", "N");
        }

        if(typeof result.columnItemWeight == "undefined"){
            syncStorage("columnItemWeight", "N");
        }

        if(typeof result.columnItemWidth == "undefined"){
            syncStorage("columnItemWidth", "N");
        }

        if(typeof result.columnItemHeight == "undefined"){
            syncStorage("columnItemHeight", "N");
        }

        if(typeof result.columnItemLength == "undefined"){
            syncStorage("columnItemLength", "N");
        }

        if(typeof result.columnNet == "undefined"){
            syncStorage("columnNet", "N");
        }
    });
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
//----------------------------------------------------------------------------------//
//Refresh All Amazon Pages
function refreshAmazonPages(){
    chrome.tabs.query({ url: supportedStoresList }, function(tabs){ 
        for(var i = 0; i < tabs.length; i++)
        {   
            chrome.tabs.reload(tabs[i].id);
        }
    });
}
//----------------------------------------------------------------------------------//
//Stop all AjaxRequests that generated to Amazon products pages
function stopAllAjaxRequests(){
    if(lastXMLRequests.length > 0){
        $(lastXMLRequests).each(function(index, ajax) {
            ajax.abort();
            lastXMLRequests.splice(index, 1);
        });
        lastXMLRequests = [];
        successAjaxRequests = 0;
        numberOfAjaxRequests = 0;
    }
}
//----------------------------------------------------------------------------------//
function insertDocument (myHTML) {
    var newHTMLDocument = document.implementation.createHTMLDocument().body;
    newHTMLDocument.innerHTML = myHTML;
    [].forEach.call(newHTMLDocument.querySelectorAll("script, style, img:not(#landingImage):not(#imgBlkFront):not(#main-image)"), function(el) {el.remove(); });
    documentsList.push(newHTMLDocument);
    return $(newHTMLDocument.innerHTML);
}
//----------------------------------------------------------------//
//When the tab is changed, check if the user has a permission to optional stores and inject needed files
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab){
    var domainURL = getDomain(tab.url);
    if(optionalStores.test(domainURL) && changeInfo.status == "loading"){
        chrome.permissions.contains({
            origins: optionalStoresList
        }, function(result) {
            if (result) {
                //Inject files
                injectFiles(tab);
            }
        });
    }
});
//---------------------------------------------------------------------------------//
//Inject needed files for optional stores
function injectFiles(tab){
    //CSS
    chrome.tabs.insertCSS(tab.id, {file: "css/jsPopup.css"});
    chrome.tabs.insertCSS(tab.id, {file: "css/jquery-ui.css"});
    chrome.tabs.insertCSS(tab.id, {file: "css/filter.css"});
    chrome.tabs.insertCSS(tab.id, {file: "css/options.css"});
    chrome.tabs.insertCSS(tab.id, {file: "css/profit.css"});

    //JS
    chrome.tabs.executeScript(tab.id, {file: "js/libraries/jquery.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/libraries/jquery-ui.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/libraries/enscroll.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/libraries/jquery.tablesorter.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/libraries/jquery.stickytableheaders.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/libraries/table2csv.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/regexer.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/common.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/options.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/filter.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/profit.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/currentState.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/sellerPage.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/storefront.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/jsPopup.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/libraries/html2canvas.js"});
}
//----------------------------------------------------------------------------------//
function getDomain(url) {
    url = url.replace(/https?:\/\/(www.)?/i, '');
    if (url.indexOf('/') === -1) {
        return url;
    }
    return url.split('/')[0];
}