/**
 * @Author: Mohammad M. AlBanna
 * Copyright © 2017 Jungle Scout
 *
 * Save the current state of JS
 */

//If the file has injected many times
if($(".jsContainer").length >= 1){
   throw new Error("Injected!");
}

var currentState = function(url){

	var getCurrentAvgSales = function(){
		return $(".summary-result.js-avg-sales").text();
	}

	var getCurrentAvgSalesRank = function(){
		return $(".summary-result.js-avg-sales-rank").text();
	}

	var getCurrentAvgPrice = function(){
		return $(".summary-result.js-avg-price").text();
	}

	var getCurrentAvgReviwes = function(){
		return $(".summary-result.js-avg-reviews").text();
	}

	var getCurrentTable = function(){
		return $("section.jsContainer #js-table").html();
	}

	var getCurrentFirstRow = function(){
		return $("#js-table").attr("data-firstRow");
	}

	var getCurrentExtractElement = function(){
		return {
			dataSection: $("section.jsContainer #extractResults").attr("data-section")
		}
	}

	var getCurrentSearchTerm = function(){
		return $("#js-table").attr("data-searchTerm");
	}

	var getExtractUrl = function(){
		return $("#js-table").attr("data-extractUrl");
	}

	var saveCurrentState = function(){
		var obj = {};
	    var key = "current_state";
	    obj[key] += "current_state";
	    obj[key] = JSON.stringify({
	    			currentUrl: url,
	    			currentAvgSales:getCurrentAvgSales(),
			    	currentAvgSalesRank:getCurrentAvgSalesRank(),
			    	currentAvgPrice:getCurrentAvgPrice(),
			    	currentAvgReviwes:getCurrentAvgReviwes(),
			    	currentTable:getCurrentTable(),
			    	currentExtractElement:getCurrentExtractElement(),
			    	currentExtractUrl:getExtractUrl(),
			    	currentFirstRow:getCurrentFirstRow(),
			    	currentSearchTerm:getCurrentSearchTerm(),
			    	lastScraped:Date.now()
			    });
	    chrome.storage.local.set(obj);
	}

	return {
		saveCurrentState:saveCurrentState
	}
}// End currentState Module