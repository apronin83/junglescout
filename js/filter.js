/**
 * @Author: Mohammad M. AlBanna
 * Copyright © 2017 Jungle Scout
 *
 * Filter popup window operations
*/

$(function(){
	//If the file has injected many times
	if($(".jsContainer").length >= 1){
		return;
	}

	//Show filter popup
	$("body").on("click","section.jsContainer #filterPopup",function(e){
		e.preventDefault();
		//Hide other popups
		hidePopups(".js-options-section, .js-product-history-section, .js-trend-chart-section");

		if($(".js-filter-section").is(":visible")){
			$(".js-filter-section").fadeOut();
		}else{
			//Send google analytics
	        chrome.runtime.sendMessage({
	            action: "googleAnalyticsAction",
	            page: "filter.js"
	        });

			$(".js-filter-table .current-currency").text(currentCurrency);

			//Hide/show filter rows
			if(!showPriceColumn){
				$(".js-filter-table .price-column").css("display","none");
			}

			if(!showReviewsColumn){
				$(".js-filter-table .reviews-column").css("display","none");
			}

			if(!showRankColumn){
				$(".js-filter-table .rank-column").css("display","none");
			}

			if(!showEstSalesColumn){
				$(".js-filter-table .est-sales-column").css("display","none");
			}

			if(!showEstRevenueColumn){
				$(".js-filter-table .est-revenue-column").css("display","none");
			}

			if(!showRatingColumn){
				$(".js-filter-table .rating-column").css("display","none");
			}

			if(!showBbSellerColumn){
				$(".js-filter-table .bb-seller-column").css("display","none");
			}

			if(!showItemWeightColumn){
				$(".js-filter-table .weight-column").css("display","none");
			}

			if(!showNewSellerColumn){
				$(".js-filter-table .sellers-column").css("display","none");
			}

			if(!showTierColumn){
				$(".js-filter-table .tier-column").css("display","none");
			}

			if(!showNetColumn){
				$(".js-filter-table .net-column").css("display","none");
			}

			//Show error message if all rows are hidden
			if(!showPriceColumn && !showReviewsColumn && !showRankColumn && 
				!showEstSalesColumn && !showEstRevenueColumn && !showRatingColumn 
				&& !showBbSellerColumn && !showItemWeightColumn && !showNewSellerColumn && !showTierColumn){
				$(".js-filter-section .js-filter-table").remove();
				$(".js-filter-section .filter-message").fadeIn();
			}

			//Change the height of the popup
			var containerHeight = $("section.jsContainer .content-table").height();
			if(containerHeight >= 470){
				$(".js-filter-table-container").css("max-height","none");
			}else{
				$(".js-filter-table-container").css("max-height","220px");
			}
			//Position the popup to center
            $(".js-filter-section").css({
                "left": ($("section.container").width() - $(".js-filter-section").width())/2, 
                "top": (($("section.container").height() - $(".js-filter-section").height())/2)+30});

			//View the popup
			$(".js-filter-section").fadeIn();
		}
		
		//Change colors of the rows to be easy to read in filter section
		$(".js-filter-table tr:visible:odd").css("background-color","white");
		$(".js-filter-table tr:visible:even").css("background-color","#F5F5F5");
	});
	
	//On click on close button
	$("body").on("click",".btn-container #jsFilterCloseButton",function(e){
		e.preventDefault();
		$(".js-filter-table input").val("");
		$(".js-filter-table input[type='checkbox']").prop("checked",true);
		$(".js-filter-section").fadeOut();
	});

	//On click on clear button
	$("body").on("click",".btn-container #jsFilterClearButton",function(e){
		e.preventDefault();
		$("#js-table tbody").find("tr").show();
		//Change colors of the rows to be easy to read
		$("#js-table tr:visible:odd").css("background-color","#F5F5F5");
		$("#js-table tr:visible:even").css("background-color","white");

		$(".js-filter-table input").val("");
		$(".js-filter-table input[type='checkbox']").prop("checked",true);

		//Recalculate avg. boxes
		renderHeaderBoxes();
	});


	//Start filter the results
	$("body").on("click",".btn-container #jsFilterButton",function(e){
		e.preventDefault();
		//Show all rows
		$("#js-table tbody").find("tr").show();
		//Price Columns
		if(showPriceColumn){
			var priceHeader = $("#js-table th.js-price").index();
			var price1 = $(".js-filter-table input[name='minPrice']").val();
			var price2 = $(".js-filter-table input[name='maxPrice']").val();
			
			if(price1 || price2){
				var rows = $("#js-table tbody").find("tr:visible").hide();
				price1 = price1 ? parseFloat(price1) : 0;
				price2 = price2 ? parseFloat(price2) : 1000000;

				$.each(rows,function(index, row) {
					var thePrice = $(row).find("td").eq(priceHeader).text();
					thePrice = thePrice.replace(/[\$\€\£\₹\,]|(--i)/g,"");
					thePrice = parseFloat(thePrice);
					if(!isNaN(thePrice) && thePrice >= price1 && thePrice <= price2){
						$(row).show();
					}
				});
			}
		}

		//Reviews
		if(showReviewsColumn){
			var reviewsHeader = $("#js-table th.js-reviews").index();
			var reviews1 = $(".js-filter-table input[name='minReviews']").val();
			var reviews2 = $(".js-filter-table input[name='maxReviews']").val();
			
			if(reviews1 || reviews2){
				var rows = $("#js-table tbody").find("tr:visible").hide();
				reviews1 = reviews1 ? parseInt(reviews1) : 0;
				reviews2 = reviews2 ? parseInt(reviews2) : 1000000;
				$.each(rows,function(index, row) {
					var theReviews = $(row).find("td").eq(reviewsHeader).text();
					theReviews = theReviews.replace(/(--i)/,"");
					theReviews = parseInt(theReviews);
					if(!isNaN(theReviews) && theReviews >= reviews1 && theReviews <= reviews2){
						$(row).show();
					}
				});
			}
		}

		//Rank
		if(showRankColumn){
			var rankHeader = $("#js-table th.js-rank").index();
			var rank1 = $(".js-filter-table input[name='minRank']").val();
			var rank2 = $(".js-filter-table input[name='maxRank']").val();
			
			if(rank1 || rank2){
				var rows = $("#js-table tbody").find("tr:visible").hide();
				rank1 = rank1 ? parseInt(rank1) : 0;
				rank2 = rank2 ? parseInt(rank2) : 1000000;

				$.each(rows,function(index, row) {
					var theRank = $(row).find("td").eq(rankHeader).text();
					theRank = theRank.replace(/(--i)|[\,\#]/g,"");
					theRank = parseInt(theRank);
					if(!isNaN(theRank) && theRank >= rank1 && theRank <= rank2){
						$(row).show();
					}
				});
			}
		}

		//Estimated Sales
		if(showEstSalesColumn){
			var estSalesHeader = $("#js-table th.js-est-sales").index();
			var estSales1 = $(".js-filter-table input[name='minEstSales']").val();
			var estSales2 = $(".js-filter-table input[name='maxEstSales']").val();
			if(estSales1 || estSales2){
				var rows = $("#js-table tbody").find("tr:visible").hide();
				estSales1 = estSales1 ? parseFloat(estSales1) : 0;
				estSales2 = estSales2 ? parseFloat(estSales2) : 1000000;
				$.each(rows,function(index, row) {
					var theEstSales = $(row).find("td").eq(estSalesHeader).text();
					theEstSales = theEstSales.replace(/[\,]|(--i)/g,"");
					theEstSales = theEstSales.replace(/(< 5)/g,"0.00");
					theEstSales = parseFloat(theEstSales);
					if(!isNaN(theEstSales) && theEstSales >= estSales1 && theEstSales <= estSales2){
						$(row).show();
					}
				});
			}
		}

		//Estimated Revenue
		if(showEstRevenueColumn){
			var estRevenueHeader = $("#js-table th.js-est-revenue").index();
			var estRevenue1 = $(".js-filter-table input[name='minEstRevenue']").val();
			var estRevenue2 = $(".js-filter-table input[name='maxEstRevenue']").val();
			if(estRevenue1 || estRevenue2){
				var rows = $("#js-table tbody").find("tr:visible").hide();
				estRevenue1 = estRevenue1 ? parseFloat(estRevenue1) : 0;
				estRevenue2 = estRevenue2 ? parseFloat(estRevenue2) : 1000000;

				$.each(rows,function(index, row) {
					var theEstRevenue = $(row).find("td").eq(estRevenueHeader).text();
					theEstRevenue = theEstRevenue.replace(/[\$\€\£\₹\,]|(\<\s)|(--i)/g,"");
					theEstRevenue = parseFloat(theEstRevenue);
					if(!isNaN(theEstRevenue) && theEstRevenue >= estRevenue1 && theEstRevenue <= estRevenue2){
						$(row).show();
					}
				});
			}
		}
		
		//Rating
		if(showRatingColumn){
			var ratingHeader = $("#js-table th.js-rating").index();
			var rate1 = $(".js-filter-table input[name='minRate']").val();
			var rate2 = $(".js-filter-table input[name='maxRate']").val();
			
			if(rate1 || rate2){
				var rows = $("#js-table tbody").find("tr:visible").hide();
				rate1 = rate1 ? parseFloat(rate1) : 0;
				rate2 = rate2 ? parseFloat(rate2) : 1000000;

				$.each(rows,function(index, row) {
					var theRate = $(row).find("td").eq(ratingHeader).text();
					theRate = theRate.replace(/(--i)/,"");
					theRate = parseFloat(theRate);
					if(!isNaN(theRate) && theRate >= rate1 && theRate <= rate2){
						$(row).show();
					}
				});
			}
		}

		//BB Seller
		if(showBbSellerColumn){
			var bbSellerHeader = $("#js-table th.js-bb-seller").index();
			var amz = $(".js-filter-table input[name='amz']:checked").length > 0 ? true : false;
			var fba = $(".js-filter-table input[name='fba']:checked").length > 0 ? true : false;
			var merch = $(".js-filter-table input[name='merch']:checked").length > 0 ? true : false;
			
			if(amz && fba && merch){
				//Do nothing
			}else if(amz || fba || merch){
				var rows = $("#js-table tbody").find("tr:visible").hide();
				$.each(rows,function(index, row) {
					var theBBSeller = $(row).find("td").eq(bbSellerHeader).text();
					theBBSeller = theBBSeller.replace(/(--i)/,"");
					if((amz && theBBSeller == "AMZ") || (fba && theBBSeller == "FBA") || (merch && theBBSeller == "Merch")){
						$(row).show();
					}
				});
			}
		}

		//Weight
		if(showItemWeightColumn){
			var weightHeader = $("#js-table th.js-item-weight").index();
			var weight1 = $(".js-filter-table input[name='minWeight']").val();
			var weight2 = $(".js-filter-table input[name='maxWeight']").val();
			
			if(weight1 || weight2){
				var rows = $("#js-table tbody").find("tr:visible").hide();
				weight1 = weight1 ? parseFloat(weight1) : 0;
				weight2 = weight2 ? parseFloat(weight2) : 1000000;
				$.each(rows,function(index, row) {
					var theWeight = $(row).find("td").eq(weightHeader).text();
					theWeight = theWeight.replace(/(--i)/,"");
					theWeight = parseFloat(theWeight);
					if(!isNaN(theWeight) && theWeight >= weight1 && theWeight <= weight2){
						$(row).show();
					}
				});
			}
		}

		//Sellers
		if(showNewSellerColumn){
			var sellersHeader = $("#js-table th.js-new-sellers").index();
			var seller1 = $(".js-filter-table input[name='minSeller']").val();
			var seller2 = $(".js-filter-table input[name='maxSeller']").val();
			
			if(seller1 || seller2){
				var rows = $("#js-table tbody").find("tr:visible").hide();
				seller1 = seller1 ? parseInt(seller1) : 0;
				seller2 = seller2 ? parseInt(seller2) : 1000000;

				$.each(rows,function(index, row) {
					var theSellers = $(row).find("td").eq(sellersHeader).text();
					theSellers = theSellers.replace(/(--i)/,"");
					theSellers = parseInt(theSellers);
					if(!isNaN(theSellers) && theSellers >= seller1 && theSellers <= seller2){
						$(row).show();
					}
				});
			}
		}

		//Tier
		if(showTierColumn){
			var tierHeader = $("#js-table th.js-tier").index();
			var standard = $(".js-filter-table input[name='tierStandard']:checked").length > 0 ? true : false;
			var oversize = $(".js-filter-table input[name='tierOversize']:checked").length > 0 ? true : false;
			if(standard && oversize){
				//Do nothing
			}else if(standard || oversize){
				var rows = $("#js-table tbody").find("tr:visible").hide();

				$.each(rows,function(index, row) {
					var theTier = $(row).find("td").eq(tierHeader).text();
					theTier = theTier.replace(/(--i)/,"");
					
					if((standard && (theTier == "S. Stand" || theTier == "L. Stand")  ) || (oversize && (theTier == "S. Over" || theTier == "M. Over" || theTier == "L. Over" || theTier == "Special") ) ){
						$(row).show();
					}
				});
			}
		}

		//Net
		if(showNetColumn){
			var netHeader = $("#js-table th.js-net").index();
			var net1 = $(".js-filter-table input[name='minNet']").val();
			var net2 = $(".js-filter-table input[name='maxNet']").val();
			if(net1 || net2){
				var rows = $("#js-table tbody").find("tr:visible").hide();
				net1 = net1 ? parseFloat(net1) : 0;
				net2 = net2 ? parseFloat(net2) : 1000000;
				$.each(rows,function(index, row) {
					var theNet = $(row).find("td").eq(netHeader).text();
					theNet = theNet.replace(/[\$\€\£\₹\,]|(--i)/g,"");
					theNet = theNet.replace(/(< 5)/g,"0");
					theNet = parseFloat(theNet);
					if(!isNaN(theNet) && theNet >= net1 && theNet <= net2){
						$(row).show();
					}
				});
			}
		}

		//Change colors of the rows to be easy to read
		$("#js-table tr:visible:odd").css("background-color","#F5F5F5");
		$("#js-table tr:visible:even").css("background-color","white");

		//Recalculate avg. boxes
		renderHeaderBoxes();

	});//End filter button
	
	//If the user input a text
	$("body").on("keyup",".js-filter-section input",function(e){ 
		if( $(this).val().length == 0 || isNaN($(this).val())){
			$(this).val("");
		}
	});
});
