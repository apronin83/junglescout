/*
 * @Author: Mohammad M. AlBanna
 * Copyright © 2017 Jungle Scout
 *
 * Get data of seller pages
*/

//If the file has injected many times
if($(".jsContainer").length >= 1){
   throw new Error("Injected!");
}

getSellerProductFirstPage = function (){
	var products = $("#products-list .product-column").length != 0 ? $("#products-list .product-column") : $("#shoveler-content .AAG_itemDetails");
	var sellerName = $("#sellerName").text() || $("#aag_header h1").first().text();
	var currentPage = $(".a-pagination .products-pagination-button.a-selected").text() || $(".shoveler-pagination .page-number").text();
	var pages = $(".a-pagination .products-pagination-button").last().prev().text() || $(".shoveler-pagination .num-pages").text();
  	return {name:sellerName, products:products, currentPage:currentPage, pages:pages, action:"sellerProductFirstPage"};
}

getSellerProductOtherPage = function(callback){
	if($(".a-pagination .products-pagination-button").length != 0){
		$(".a-pagination .products-pagination-button").last().get(0).click();
	} else if($(".shoveler-pagination .next-button-link").length != 0){
		$(".shoveler-pagination .next-button-link").get(0).click();
	}
	setTimeout(function(){
		var checkProductsInterval = setInterval(function(){
			var pages = $(".a-pagination .products-pagination-button").last().prev().text() || $(".shoveler-pagination .num-pages").text();
			if(pages.length > 0 && ($(".products-list .spinner").length == 0 && $("#products-list .product-column").length >= 1) || (!$("#searchLoadingDiv").is(":visible") && $("#shoveler-content .AAG_itemDetails").length >= 1) ){
				var products = $("#products-list .product-column").length != 0 ? $("#products-list .product-column") : $("#shoveler-content .AAG_itemDetails");
				var sellerName = $("#sellerName").text() || $("#aag_header h1").first().text();
				var currentPage = $(".a-pagination .products-pagination-button.a-selected").text() || $(".shoveler-pagination .page-number").text();
			  	var results =  {name:sellerName, products:products, currentPage:currentPage, pages:pages, action:"sellerProductOtherPage"};
				clearInterval(checkProductsInterval);
				callback.call(this,results);
			}
		},10);
	}, 500);
}
