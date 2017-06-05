/*
 * @Author: Mohammad M. AlBanna
 * Copyright © 2017 Jungle Scout
 *
 * Get data from store front pages
*/

//If the file has injected many times
if($(".jsContainer").length >= 1){
   throw new Error("Injected!");
}

getStoreFrontProductFirstPage = function (){
	var products = $(".s-result-list li[data-asin]");
	var storeFrontName =$("#s-result-count span.a-text-bold:last").text();
	var resultsRow = $("#pagn");
  	return {name:storeFrontName, resultsRow:resultsRow, products:products, action:"storeFrontProductFirstPage"};
}

getStoreFrontProductOtherPage = function(callback){
	$("#pagnNextLink").get(0).click();
	setTimeout(function(){
		var checkProductsInterval = setInterval(function(){
			if($(".loadingSpinner").length == 0){
				var products = $(".s-result-list li[data-asin]");
				var storeFrontName = $("#s-result-count span.a-text-bold:last").text();
				var resultsRow = $("#pagn");
			  	var results = {name:storeFrontName, resultsRow:resultsRow, products:products, action:"storeFrontProductOtherPage"};
				callback.call(this,results);
				clearInterval(checkProductsInterval);
			}
		},10);
	},500);
}