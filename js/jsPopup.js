/*
 * @Author: Mohammad M. AlBanna
 * Copyright © 2017 Jungle Scout
 * 
 * Contains the core of JS
*/

/** 
* Supported JS API stores:
* -----------------
* FR
* US
* UK
* CA
* IN
* MX
* IT
* ES
* DE
*/

//review-junglescout.herokuapp.com
//junglescoutpro.herokuapp.com

$(function(){
	//If the file has injected many times
	if($(".jsContainer").length >= 1){
		return;
	}

	//None info messages
	noneCategoryInfo = "<i data-tooltip='This listing does not have a parent category' class='none-info'>--i</i>";
	noneRankInto = "<i data-tooltip='Amazon does not rank this listing in a parent category, only sub-categories. In order to compare apples to apples, sub-category ranks are not displayed in this window' class='none-info'>--i</i>";
	noneBrandInfo = "<i data-tooltip='Amazon does not display a brand for this listing' class='none-info'>--i</i>";
	nonePriceInfo = "<i data-tooltip='This listing does not have a seller who controls the buy box' class='none-info'>--i</i>";
	noneReviewsInfo = "<i data-tooltip='Amazon does not display the number of reviews for this product' class='none-info'>--i</i>";
	noneRatingInfo = "<i data-tooltip='Amazon does not display the star rating for this product' class='none-info'>--i</i>";
	noneBBSellerInfo = "<i data-tooltip='No sellers currently control the buy box, therefore a seller type cannot be displayed' class='none-info'>--i</i>";
	noneEstSalesInfo = "<i data-tooltip='Monthly sales cannot be estimated for this product because Amazon does not rank it in a parent category. Unfortunately, sub-category ranks cannot provide accurate sales estimates, therefore should not be used by sellers to predict sales and are not used by Jungle Scout' class='none-info'>--i</i>";
	noneEstRevenueInfo = "<i data-tooltip='Monthly revenue cannot be estimated for this product because it either does not have a monthly sales estimate or a buy box price' class='none-info'>--i</i>";
	noneWeightInfo = "<i data-tooltip='Amazon does not list the weight of this product, therefore, cannot be displayed' class='none-info'>--i</i>";
	noneDimensionsInfo = "<i data-tooltip='Amazon does not list the dimensions of this product, therefore, cannot be displayed' class='none-info'>--i</i>";
	noneNewSellersInfo = "<i data-tooltip='Amazon does not list the number of sellers for this listing' class='none-info'>--i</i>";
	noneTierInfo = "<i data-tooltip='Amazon does not list the dimensions and weight of this product, therefore, the sizing tier cannot be displayed' class='none-info'>--i</i>";
	noneFBAInfo = "<i data-tooltip='Amazon must give Jungle Scout the buy box price, dimensions and weight of this product in order to calculate FBA fees. One or more of these items are missing from Amazon' class='none-info'>--i</i>";
	noneNetInfo = "<i data-tooltip='Amazon does not list all of the necessary information (buy box price, dimensions and weight) to calculate the Net' class='none-info'>--i</i>";
	salesFromAPI = "<i data-tooltip='Jungle Scout uses rank to calculate estimated sales/revenue. The best sellers rank for the parent category is not shown on this product&#39;s listing page, only through Amazon&#39;s API. Historically, in this particular scenario, ranks seem to fluctuate greatly and therefore the estimated sales/revenue should be used with caution. We recommend tracking this product in our Product Tracker to get more accurate monthly sales' class='none-info'>i</i>";
	
	//Globals
	tabUrl = window.location.href;
	mwsAPIPort = chrome.runtime.connect({name: "mwsAPIPort"});
	amazonProductsPort = chrome.runtime.connect({name: "amazonProductsPort"}); //Makes request to Amazon
	listenerMwsAPIPort = false;
	imagesPath = chrome.extension.getURL("images");
	dailyToken = null;
	var mainJsPopupPath = chrome.extension.getURL("jsPopup.html");
	var filterPopupPath = chrome.extension.getURL("filter.html");
	var profitCalcPopupPath = chrome.extension.getURL("profit.html");
	var optionsPopupPath = chrome.extension.getURL("options.html");
	var jsContainer = $("<section class='jsContainer'></section>");
	var getProductsData = new GetProductsData();
	var state = null;
	var showProductImageTimeout = null;
	var currentScrollPosition = null;

	//Show columns
	showBrandColumn = true;
	showPriceColumn = true;
	showCategoryColumn = true;
	showRankColumn = true;
	showEstSalesColumn = true;
	showEstRevenueColumn = true;
	showReviewsColumn = true;
	showRatingColumn = true;
	showBbSellerColumn = true;
	showFbaFeeColumn = true;
	showTierColumn = true;
	showNewSellerColumn = true;
	showItemWidthColumn = true;
	showItemHeightColumn = true;
	showItemLengthColumn = true;
	showItemWeightColumn = true;
	showNetColumn = true;
	
	//Current website details
	currentProtocol = location.protocol;
	currentBaseUrl = currentProtocol + "//"+location.hostname;
	currentTld = location.hostname.split('.').reverse()[0] ? location.hostname.split('.').reverse()[0] : "com";
	fullCurrentTld = currentTld == "uk" ? "co.uk" : currentTld == "mx" ? "com.mx" : currentTld; //For keepa API
	currentCurrency = "$";
	currentWeightUnit = "lbs";
	currentLWHUnit = "Inches";

	bestSellerRankText = "Best Sellers Rank";
	bestSellerRankTextDe = "Amazon Bestseller-Rang";
	bestSellerRankTextFr = "Classement des meilleures ventes d'Amazon";
	bestSellerRankTextMx = "Clasificación en los más vendidos de Amazon";
	bestSellerRankTextEs = "Clasificación en los más vendidos de Amazon";
	bestSellerRankTextIt = "Posizione nella classifica Bestseller di Amazon";

	//NA
	if(currentTld == "com"){
		marketPlaceID = "ATVPDKIKX0DER";
		mwsHost = "mws.amazonservices.com";
	}
	else if(currentTld == "ca"){
		marketPlaceID = "A2EUQ1WTGCTBG2";
		mwsHost = "mws.amazonservices.ca";
	}
	else if(currentTld == "mx"){
		bestSellerRankText = bestSellerRankTextMx;
		marketPlaceID = "A1AM78C64UM0Y8";
		mwsHost = "mws.amazonservices.com";
	}
	//EU
	else if(currentTld == "uk"){
		currentCurrency = "£";
		currentWeightUnit = "kgs";
		currentLWHUnit = "Centimeter";
		marketPlaceID = "A1F83G8C2ARO7P";
		mwsHost = "mws-eu.amazonservices.com";
	}else if(currentTld == "de"){
		currentCurrency = "€";
		currentWeightUnit = "kgs";
		currentLWHUnit = "Centimeter";
		bestSellerRankText = bestSellerRankTextDe;
		marketPlaceID = "A1PA6795UKMFR9";
		mwsHost = "mws-eu.amazonservices.com";
	}else if(currentTld == "fr"){
		currentCurrency = "€";
		currentWeightUnit = "kgs";
		currentLWHUnit = "Centimeter";
		bestSellerRankText = bestSellerRankTextFr;
		marketPlaceID = "A13V1IB3VIYZZH";
		mwsHost = "mws-eu.amazonservices.com";
	}else if(currentTld == "es"){
		currentCurrency = "€";
		currentWeightUnit = "kgs";
		currentLWHUnit = "Centimeter";
		bestSellerRankText = bestSellerRankTextEs;
		marketPlaceID = "A1RKKUPIHCS9HS";
		mwsHost = "mws-eu.amazonservices.com";
	}else if(currentTld == "it"){
		currentCurrency = "€";
		currentWeightUnit = "kgs";
		currentLWHUnit = "Centimeter";
		bestSellerRankText = bestSellerRankTextIt;
		marketPlaceID = "APJ6JRA9NG5V4";
		mwsHost = "mws-eu.amazonservices.com";
	}
	//IN
	else if(currentTld == "in"){
		currentCurrency = "₹";
		marketPlaceID = "A21TJRUUN4KGV";
		mwsHost = "mws.amazonservices.in";
	}

	//Convert weight to KG if:
	convertWeightToKG = (currentTld == "uk" || currentTld == "de" || currentTld == "fr" || currentTld == "it" || currentTld == "es") ? true : false;

	// Tooltip effect
	$("body").on("mouseenter mouseleave mousemove", "[data-tooltip]", function(e){
		if(e.type == "mouseenter"){
			// Hover over code
		    var theToolTip = $(this).attr('data-tooltip');
		    if(theToolTip.length > 0){
		    	$('<p class="jsToolTip"></p>')
			    .text(theToolTip)
			    .appendTo('.jsContainer')
			    .fadeIn('slow');
		    }
		} else if(e.type == "mousemove"){
	        $('.jsToolTip').css({ top: $(this).position().top + 30, left: $(this).position().left });
		} else if(e.type == "mouseleave"){
			$('.jsToolTip').remove();
		}
	});

	//If the category has changed and got from the API
	$("body").on("myCategoryChanged", function(e, theRowCount, theCategory){
		if(theCategory == "N.A."){
			$("#js-table tr#"+theRowCount+" td.js-category").html(noneCategoryInfo);
		} else{
			$("#js-table tr#"+theRowCount+" td.js-category").text(theCategory);
			$("#js-table tr#"+theRowCount+" td.js-category").attr("title", theCategory);
			//Change the attributes
			$("#js-table tr#"+theRowCount).attr("data-category", theCategory);
			//Check FBA/Tier/Net and render them if needed
			if(showFbaFeeColumn || showTierColumn || showNetColumn){
 				getProductsData.renderFBAFeeOrTierOrNet(theRowCount);
	 		}
		}
	});

	//If the rank has changed and got from the API
	$("body").on("myRankChanged", function(e, theRowCount, theRank){
		if(theRank == "N.A."){
			$("#js-table tr#"+theRowCount+" td.js-rank").html(noneRankInto);
		} else{
			$("#js-table tr#"+theRowCount+" td.js-rank").html("<a href='#' data-chart='https://dyn.keepa.com/pricehistory.png?asin="+asin+"&domain="+fullCurrentTld+"&width=750&height=350&amazon=0&new=0&range=365&salesrank=1' title='"+theRank+"'>"+theRank+"</a>");
			//Change the attributes
			$("#js-table tr#"+theRowCount).attr("data-rank",pureNumber(theRank));
		}
	});

	//Inject popup
	$("body").prepend(jsContainer);
	jsContainer.load(mainJsPopupPath,function(){
		$("#jsLogo").attr("src",imagesPath+"/full-logo.png");
		$("#jsFbImage").attr("src",imagesPath+"/fb.png");
		$("#jsScreenshotImage").attr("src",imagesPath+"/screenshot.png");

		//Change Weight unit
		$("#js-table th.js-item-weight").text(currentWeightUnit);

		//Scroll
		$('section.jsContainer .content-table').enscroll({
	    	verticalScrolling: true,
	    	horizontalScrolling: true,
	        verticalTrackClass: 'track4',
	        verticalHandleClass: 'handle4',
	        horizontalTrackClass: 'horizontal-track2',
	        horizontalHandleClass: 'horizontal-handle2',
	        showOnHover: false,
	        propagateWheelEvent: false
	    });

		//Load Filter popup
		$(".js-filter-section").load(filterPopupPath,function(){
			//Scroll for popup section
			$('.js-filter-section .js-filter-table-container').enscroll({
		    	verticalScrolling: true,
		        verticalTrackClass: 'track4',
		        verticalHandleClass: 'handle4',
		        showOnHover: false,
	        	propagateWheelEvent: false
		    });
		});

		//Loading options popup
		$(".js-options-section").load(optionsPopupPath);

		//Loading profit popup
		$(".js-profit-calc-content").load(profitCalcPopupPath);
		//--------------------------------------------------------------------------------//
		//Resize JS popup
		$("section.jsContainer").resizable({
			handles: "n, e, s, w, se, sw, nw",
			minWidth: 1000,
			minHeight: 560,
			maxWidth: (window.innerWidth - 50),
			maxHeight: (window.innerHeight - 50),
			alsoResize:"section.jsContainer .container, section.jsContainer .content-table",
			start:function(event,ui){
				currentScrollTopPosition = $('section.jsContainer .content-table').scrollTop();
				currentScrollLeftPosition = $('section.jsContainer .content-table').scrollLeft();
				$('section.jsContainer .content-table').scrollTop(0);
				$('section.jsContainer .content-table').scrollLeft(0);
				//Close other popup
				$(".js-filter-section").css("display","none");
				$(".js-options-section").css("display","none");
				$(".js-product-history-section").css("display","none");
				$(".js-trend-chart-section").css("display","none");
			},
			stop:function(event,ui){
				$('section.jsContainer .content-table').scrollTop(currentScrollTopPosition);
				$('section.jsContainer .content-table').scrollLeft(currentScrollLeftPosition);

				currentScrollTopPosition = null;
				currentScrollLeftPosition = null;

				//Save the new position
				var currentContainerPosition = ui.element[0].getBoundingClientRect();
				localStorage("currentPosition",{left:currentContainerPosition.left,top:currentContainerPosition.top});

				//Save the dimension
				localStorage("currentDimension",{width:ui.size.width,height:ui.size.height});
			}
		});
		//--------------------------------------------------------------------------------//
		//Move JS popup
		$("section.jsContainer").draggable({
			cursor: 'move',  
			handle: '.header,.footer',
			cancel: ".footer a",
			start:function(event,ui){
				//Because of fixed table header
				currentScrollTopPosition = $('section.jsContainer .content-table').scrollTop();
				currentScrollLeftPosition = $('section.jsContainer .content-table').scrollLeft();
				$('section.jsContainer .content-table').scrollTop(0);
				$('section.jsContainer .content-table').scrollLeft(0);
			},
			stop:function(event,ui){ 
				$('section.jsContainer .content-table').scrollTop(currentScrollTopPosition);
				$('section.jsContainer .content-table').scrollLeft(currentScrollLeftPosition);
				currentScrollTopPosition = null;
				currentScrollLeftPosition = null;
				//If the user move the popup too much in the borders
				var theContainerPosition = $("section.jsContainer .container")[0].getBoundingClientRect();
				var windowHeight = $(window).height();
				var windowWidth = $(window).width();
				var containerWidth = $(".jsContainer").width();
				if( theContainerPosition.top >= windowHeight - 50 || theContainerPosition.top < 0|| theContainerPosition.left >= windowWidth - 50 || theContainerPosition.left < -containerWidth + 100 ){
					$("section.jsContainer").css({"top":"30px","right":"20px","left":"auto"});
					localStorage("currentPosition",$("section.jsContainer").position());
				}else{
					localStorage("currentPosition",{left:theContainerPosition.left,top:theContainerPosition.top});
				}
			}
		});
	});
	
	//--------------------------------------------------------------------------------//
	//when the user chagne the columns, run JS again.
	chrome.storage.local.get(["auth", "runJS", "currentPosition", "currentDimension"],function(result){
		if(typeof result.runJS != "undefined" && result.runJS == tabUrl){
			//Get the daily token
			dailyToken = JSON.parse(result.auth).daily_token;

			//Check current state			
			state = new currentState(tabUrl);
			checkCurrentState(tabUrl);

			//View container			
			$("section.jsContainer").fadeIn("fast");
			
			//Load JS postion
			if(typeof result.currentPosition != "undefined"){
				$("section.jsContainer").css({"top":result.currentPosition.top+"px","left":result.currentPosition.left+"px"});
			}

			//Load JS dimension
			if(typeof result.currentDimension != "undefined"){
				$("section.jsContainer").css({"width":result.currentDimension.width+"px","height":result.currentDimension.height+"px"});
				$("section.jsContainer .container").css({"width":result.currentDimension.width+"px","height":result.currentDimension.height+"px"});
				$("section .content-table").css({"width": (result.currentDimension.width-12)+"px","height":(result.currentDimension.height-110)+"px"});
			}
			
			//Send google analytics
	        chrome.runtime.sendMessage({
	            action: "googleAnalyticsAction",
	            page: "jsPopup.js"
	        });
	        chrome.storage.local.remove("runJS");
		}
	});

	//Refresh table headers
	refreshTableHeaders();

	//----------------------------------------------------//
	//Listener just once to MWS API port
	if( (showNetColumn || showFbaFeeColumn || showTierColumn || showItemWidthColumn || showItemHeightColumn || showItemLengthColumn || showItemWeightColumn || showNewSellerColumn) ){
		mwsAPIPort.onMessage.addListener(function(response) {
			//Get product dimensions: width, height, length , Weight
		 	if(response.action == "GetMatchingProduct" && response.operation == "mwsAPI"){
		 		var xmlObject = $.parseXML( response.productData );
		 		var productDimensions = $(xmlObject).find("AttributeSets PackageDimensions");
		 		
		 		var productLength = productDimensions.children("ns2\\:length").text() ? productDimensions.children("ns2\\:length").text() : noneDimensionsInfo;
	 			var productWidth = productDimensions.children("ns2\\:width").text() ? productDimensions.children("ns2\\:width").text() : noneDimensionsInfo;
	 			var productHeight = productDimensions.children("ns2\\:height").text() ? productDimensions.children("ns2\\:height").text() : noneDimensionsInfo;
	 			var productWeight = productDimensions.children("ns2\\:weight").text() ? productDimensions.children("ns2\\:weight").text() : noneWeightInfo;
	 			
		 		//Fill them to the table if the the columns are active
		 		if(productDimensions){
		 			if(convertWeightToKG){
		 				//Convert units to cm
		 				var productWidthValue = !isNaN(productWidth) ? (productWidth * 2.54).toFixed(2) : productWidth;
						var productHeightValue = !isNaN(productHeight) ? (productHeight * 2.54).toFixed(2) : productHeight;
						var productLengthValue = !isNaN(productLength) ? (productLength * 2.54).toFixed(2) : productLength;
						//Convert to kgs (All pounds to kgs)
						var productWeightValue = !isNaN(productWeight) ? (productWeight * 0.453592).toFixed(2) : productWeight;
			 			//Render them to table
			 			$("#js-table tr#"+response.rowCounter+" td.js-item-width").html(productWidthValue);
			 			$("#js-table tr#"+response.rowCounter+" td.js-item-height").html(productHeightValue);
			 			$("#js-table tr#"+response.rowCounter+" td.js-item-length").html(productLengthValue);
			 			$("#js-table tr#"+response.rowCounter+" td.js-item-weight").html(productWeightValue);
			 			//Add these values to attributes
			 			$("#js-table tr#"+response.rowCounter).attr({"data-width":productWidth, "data-height":productHeight, "data-length":productLength, "data-weight":productWeightValue});
		 			}else{
		 				$("#js-table tr#"+response.rowCounter+" td.js-item-width").html(productWidth);
			 			$("#js-table tr#"+response.rowCounter+" td.js-item-height").html(productHeight);
			 			$("#js-table tr#"+response.rowCounter+" td.js-item-length").html(productLength);
			 			$("#js-table tr#"+response.rowCounter+" td.js-item-weight").html(productWeight);
			 			//Add these values to attributes
			 			$("#js-table tr#"+response.rowCounter).attr({"data-width":productWidth, "data-height":productHeight, "data-length":productLength, "data-weight":productWeight});
		 			}
		 		}

		 		//Call render FBA fee or Tiers
		 		if(showFbaFeeColumn || showTierColumn || showNetColumn){
	 				getProductsData.renderFBAFeeOrTierOrNet(response.rowCounter);
		 		}
		 	}
		 	//Get new sellers
		 	else if(response.action == "GetCompetitivePricingForASIN" && response.operation == "mwsAPI"){
		 		var xmlObject = $.parseXML( response.productData );
		 		var productCompetitive = $(xmlObject).find("CompetitivePricing NumberOfOfferListings");
		 		if(productCompetitive){ 
		 			var newSellers = productCompetitive.children("OfferListingCount[condition='New']").text() ? productCompetitive.children("OfferListingCount[condition='New']").text() : "N.A.";
		 			//Fill them from the table
		 			if(newSellers != "N.A."){
		 				$("#js-table tr#"+response.rowCounter+" td.js-new-sellers").text(newSellers);
		 			} else{
		 				$("#js-table tr#"+response.rowCounter+" td.js-new-sellers").html(noneNewSellersInfo);
		 			}
		 		}else{
		 			$("#js-table tr#"+response.rowCounter+" td.js-new-sellers").html(noneNewSellersInfo);
		 		}
		 	}
		});
	}

	//Waiting messages from browser action
	chrome.runtime.onConnect.addListener(function(port) {
 		if(port.name == "jsPopupChannel"){
			port.onMessage.addListener(function(response) {
				if(response.url == window.location.href){
					//Check auth
					chrome.storage.local.get(["auth", "currentPosition", "currentDimension"],function(result){ 
						if(typeof result.auth != "undefined"){
					 		if (response.action == "openCloseJsPopup"){
								if($(".jsContainer").is(":visible")){
									$(".jsContainer .closeJsPopup").click();
								}else{
									//Get the daily token
									dailyToken = JSON.parse(result.auth).daily_token;
									
									//Get the current URL
									tabUrl = window.location.href;

									//Refresh table headers
									refreshTableHeaders();
									
									state = new currentState(tabUrl);
									checkCurrentState(tabUrl);
									$("section.jsContainer").fadeIn("fast");
									//Because of left in first time is auto
									$("section.jsContainer").css("left",$("section.jsContainer")[0].getBoundingClientRect().left);
									
									//Send google analytics
							        chrome.runtime.sendMessage({
							            action: "googleAnalyticsAction",
							            page: "jsPopup.js"
							        });

									//Load JS postion
									if(typeof result.currentPosition != "undefined"){
										$("section.jsContainer").css({"top":result.currentPosition.top+"px","left":result.currentPosition.left+"px"});
									}

									//Load JS dimension
									if(typeof result.currentDimension != "undefined"){
										$("section.jsContainer").css({"width":result.currentDimension.width+"px","height":result.currentDimension.height+"px"});
										$("section.jsContainer .container").css({"width":result.currentDimension.width+"px","height":result.currentDimension.height+"px"});
										$("section .content-table").css({"width": (result.currentDimension.width-12)+"px","height":(result.currentDimension.height-110)+"px"});
									}
								}
							}//End if openCloseJsPopup
					 	}
					});
				}
			});	
		}
	});
	
	//--------------------------------------------------------------------------------//
	//Close jsPopup button
	$("body").on("click",".jsContainer .closeJsPopup",function(){
		//Close other popup
		hidePopups(true);
		//Close JS popup
		$(".jsContainer").fadeOut("fast");
		//Remove content table to save Amazon pages!
		$("#js-table tbody").html("");
	    chrome.runtime.sendMessage({ action: "stopAllAjaxRequests" });
	});

	//--------------------------------------------------------------------------------//
	//Refresh jsPopup button
	$("body").on("click",".jsContainer .reFreshJsPopup",function(){
		//Close other popup
		hidePopups(true);
		//Remove all requests
		chrome.runtime.sendMessage({ action: "stopAllAjaxRequests" });
		//Start clear the current state
		chrome.storage.local.remove("current_state");
		tabUrl = window.location.href;
		state = new currentState(tabUrl);
		checkCurrentState(tabUrl);
	});

	//--------------------------------------------------------------------------------//
	//After the ajax requests have been stopped
	amazonProductsPort.onMessage.addListener(function(response) { 
		if(response.action == "ajaxStopped"){ 
			var currentRowsNumber = $("#js-table tbody tr").length;
			if(state && currentRowsNumber > 0){
				//In products page and children products
				var currentChildrenProducts = $("#js-table .child-product").length;
				//On has children, active est. sales or est. revenue
				var firstVariationRank = $("#js-table tbody tr:first").attr("data-rank");
				if( (showEstSalesColumn || showEstRevenueColumn) && currentChildrenProducts >= 1 && firstVariationRank != "N.A."){
					var firstVariationPrice = $("#js-table tbody tr:first").attr("data-price");
					var isAllRankMatch = true;
					var isAllPriceMatch = true;
					//Check rank match compared to the main product
					$("#js-table .child-product").each(function(index,row){
						var currentRank = $(this).attr("data-rank");
						if(currentRank != firstVariationRank){
							isAllRankMatch = false;
							return false;
						}
					});
					//Check price match compared to the main product
					$("#js-table .child-product").each(function(index,row){
						var currentPrice = $(this).attr("data-price");
						if(currentPrice != firstVariationPrice){
							isAllPriceMatch = false;
							return false;
						}
					});

					//All variations have the same rank and change the current est. sales and revenue
					if(isAllRankMatch){
						var firstVariationEstSales = $("#js-table tbody tr:first").attr("data-estSales");
						firstVariationEstSales = pureNumber(firstVariationEstSales);
						if(!isNaN(firstVariationEstSales)){
							firstVariationEstSales = firstVariationEstSales/(currentChildrenProducts+1);
							firstVariationEstSales = Math.round(parseFloat(firstVariationEstSales));
						}
						
						var firstVariationPrice = $("#js-table tbody tr:first").attr("data-price");
						firstVariationPrice = parseFloat(firstVariationPrice);

						if(!isNaN(firstVariationPrice)){
							var finalRevenue = Math.round(firstVariationEstSales * firstVariationPrice);
						}else{
							var finalRevenue = $("#js-table tbody tr:first").attr("data-estRevenue");
							finalRevenue = Math.round(parseFloat(pureNumber(finalRevenue)));
						}

						//First row
						$("#js-table tbody tr:first .js-est-sales").text(numberWithCommas(firstVariationEstSales));
						$("#js-table tbody tr:first .js-est-revenue").text(currentCurrency+numberWithCommas(finalRevenue));

						//Other children
						$("#js-table .child-product .js-est-sales").text(firstVariationEstSales);
						if(!isAllPriceMatch){
							$("#js-table .child-product").each(function(index,row){
								var currentPrice = $(this).attr("data-price");
								var variationNewRevenue = (firstVariationEstSales * currentPrice);
								variationNewRevenue = Math.round(parseFloat(variationNewRevenue));
								variationNewRevenue = !isNaN(variationNewRevenue) ? currentCurrency+numberWithCommas(variationNewRevenue) : "N.A.";
								$(this).find(".js-est-revenue").text(variationNewRevenue);
							});
						}else{
							$("#js-table .child-product .js-est-revenue").text(currentCurrency+numberWithCommas(finalRevenue));
						}
					}else{
						$("#js-table .child-product").each(function(index, row){
						    $(this).find("td.js-est-sales").text(numberWithCommas($(this).attr("data-estSales")));
						    $(this).find("td.js-est-revenue").text($(this).attr("data-estRevenue"));
						});
					}
				}//end if there are children

				//Get all avg boxes
				renderHeaderBoxes();
				
				//Remove the loader and save the current state after 5 seconds (To make sure)
				setTimeout(function(){
					reInitializeTableSorter(true);
					state.saveCurrentState();
				}, 5000);
			}
		}
	});

	//--------------------------------------------------------------------------------//
	//Add X button besides results
	var currentTdNumber = null;
	$("body").on("mouseenter mouseleave","#js-table td.js-number",function(ev){
		if($("#js-table tbody tr").length >=2 ){
			if(ev.type === 'mouseenter'){
				currentTdNumber = $(this).text();
				$(this).html("<img id='removeCurrentRow' src='"+imagesPath+"/jsRemoveRowButton.png' width='15' height='15' />");
			}else{
				$(this).text(currentTdNumber);
				currentTdNumber = null;
			}
		}
	});

	//On X button is clicked to remove current row
	$("body").on("click","#removeCurrentRow",function(e){ 
		e.preventDefault();
		$(this).parents("tr").remove();
		renderHeaderBoxes();
		if(state){
			reInitializeTableSorter(true);
			state.saveCurrentState();
		}
	});
	
	//--------------------------------------------------------------------------------//
    //Image Preview for products
    $("body").on("mouseenter mouseleave","section.jsContainer .product-image-cell",function(ev){ 
        var theProductImage = $(this).attr("data-image");
        if(ev.type === 'mouseenter' && ( theProductImage.indexOf("http") == 0 || theProductImage.indexOf("data:image") == 0) ){
            showProductImageTimeout = setTimeout(function(){
            	productImageObject = new Image();
				productImageObject.src = theProductImage;
				productImageObject.addEventListener('load', productImageListener, true);
				var productImageContainer = $("section.jsContainer .product-image");
				productImageContainer.fadeIn("fast");
				//Position the popup to center
		        $("section.jsContainer .product-image").css({
		            "left": ($("section.container").width() - productImageContainer.width())/2, 
		            "top": (($("section.container").height() - productImageContainer.height())/2)+10});
			},500);
        }else if(ev.type === 'mouseleave'){
        	if(showProductImageTimeout){
        		clearTimeout(showProductImageTimeout);
        		$("section.jsContainer .product-image img").attr("src","");
        		$("section.jsContainer .product-image").fadeOut("fast");
        		if(typeof productImageObject != "undefined" && productImageObject){
	        		productImageObject.removeEventListener('load', productImageListener, true);
	    			productImageObject = null;
    			}
        	}
        }
    });

    //Hide product image viewer anyway when the mouse leaves JS
    $("body").on("mouseleave","section.jsContainer .content-table",function(ev){  
    	$("section.jsContainer .product-image").fadeOut("fast");
    	if(typeof productImageObject != "undefined" && productImageObject){
    		productImageObject.removeEventListener('load', productImageListener, true);
			productImageObject = null;
		}
    });

    //Center the image popup
    function productImageListener(){
	    var width = productImageObject.width;
	    var height = productImageObject.height;
	    $("section.jsContainer .product-image img").attr("src",productImageObject.src);
	    //Position the popup to center
        $("section.jsContainer .product-image").css({
            "left": ($("section.container").width() - $("section.jsContainer .product-image").width())/2, 
            "top": (($("section.container").height() - $("section.jsContainer .product-image").height())/2)+10});
	}

    //--------------------------------------------------------------------------------//
    //Show price/rank history from Keepa.com
    $("body").on("click",".js-price a, .js-rank a",function(e){
    	e.preventDefault();
    	
    	//Remove the previous price/rank history
    	$(".js-product-history-section img").attr("src","");

    	//Hide other popups
        hidePopups(true);

    	var chartURL = $(this).attr("data-chart");
    	chartImage = new Image();
    	chartImage.crossOrigin = "Anonymous";
		chartImage.src = chartURL;
		chartImage.addEventListener('load', charImageListener, true);
		$(".js-product-history-section").fadeIn();
    });
    
    //Hide product history (Price and Rank)
    $("body").on("click",".jsContainer .closeProductHistory",function(){
    	$("section.jsContainer .js-product-history-section").fadeOut("fast",function(){
    		$(".js-product-history-section img").attr("src","");
    		chartImage.removeEventListener('load', charImageListener, true);
    		chartImage = null;
    	});
    });
    //Detect if respond image was no data image
    function charImageListener () {
		var croppedCanvas = removeImageBlanks(chartImage);
		var canvasDetails = croppedCanvas.theCanvas;
		var theWidth = $(canvasDetails).attr("width");
		var theHeight = $(canvasDetails).attr("height");
		//Position the popup to center
		$(".js-product-history-section").css({
            "left": ($("section.container").width() - $(".js-product-history-section").width())/2, 
            "top": (($("section.container").height() - theHeight)/2)+20});

		$(".js-product-history-section img").attr("src",croppedCanvas.canvasData);  	    
	}
    //--------------------------------------------------------------------------------//
    //Show Google trend chart
    $("body").on("click","section.jsContainer #trendPopup",function(e){ 
    	e.preventDefault();

    	//Hide other popups
        hidePopups(".js-filter-section, .js-options-section, .js-product-history-section, .js-profit-calc-section");

    	var searchKeyWork = $("#js-table").attr("data-searchTerm");
    	var iframeURL = currentProtocol + "//www.google.com/trends/fetchComponent?q="+searchKeyWork+"&cid=TIMESERIES_GRAPH_0&export=5&w=500&h=300";
    	$(".js-trend-chart-section iframe").attr("src",iframeURL);

    	//Position the popup to center
        $(".js-trend-chart-section").css({
            "left": ($("section.container").width() - $(".js-trend-chart-section").width())/2, 
            "top": (($("section.container").height() - $(".js-trend-chart-section").height())/2)+30 });

    	$("section.jsContainer .js-trend-chart-section").fadeIn("fast",function(){
    		$(".js-trend-chart-section iframe").on("load",function(){
    			//Hide the loader
    			$(".js-trend-chart-section").css("background-image","none");
    		});
    	});
    });

    //Hide Google Trend chart
    $("body").on("click",".jsContainer .closeTrendChart",function(){
    	$(".js-trend-chart-section iframe").off("load");
    	$(".js-trend-chart-section").css("background-image","url("+imagesPath+"/loader.gif)");
    	$("section.jsContainer .js-trend-chart-section").fadeOut("fast",function(){
    		$(".js-trend-chart-section iframe").attr("src","");
    	});
    });

    //--------------------------------------------------------------------------------//
    //Download to CSV
    $("body").on("click",".footer #csvExport",function(e){
    	e.preventDefault();
    	if($('#js-table tr').length > 1){
    		$("#js-table .hiddenable").removeClass('hidden');
    		$("#js-table .csv-hiddenable").addClass('hidden');

    		//The file name
    		var fileName = $('#js-table').attr("data-firstRow");
    		fileName = fileName.replace(":"," of");

    		var firstRow = $('#js-table').attr("data-firstRow");
    		firstRow = firstRow.replace(/\,/g,"");

    		//Print averages
			var avgSales = "Average Sales: "+ $(".summary-result.js-avg-sales").text();
    		var avgSalesRank = "Average Sales Rank: "+$(".summary-result.js-avg-sales-rank").text();
    		var avgPrice = "Average Price: "+$(".summary-result.js-avg-price").text();
    		var avgReviews = "Average Reviews: "+$(".summary-result.js-avg-reviews").text();

    		//Print date and time
    		var today = new Date();
			var day = today.getDate();
			var month = today.getMonth()+1;
			var year = today.getFullYear();
			var hours = today.getHours();
			var mins = today.getMinutes() < 10 ? "0"+today.getMinutes() : today.getMinutes();
			var exportDate = "Export date: "+month+"/"+day+"/"+year+" | Export time: "+hours+":"+mins;

		 	$('#js-table').table2CSV({fileName:fileName,firstRows:[exportDate,firstRow,avgSales,avgSalesRank,avgPrice,avgReviews]});
		 	$("#js-table .hiddenable").addClass('hidden');
		 	$("#js-table .csv-hiddenable").removeClass('hidden');
    	}
	});

	//--------------------------------------------------------------------------------//
    //Print Screen button
    $("body").on("click",".footer #screenshotPage",function(e){ 
    	e.preventDefault();
    	if($('#js-table tr').length > 1){
    		$('section.jsContainer .content-table').scrollTop(0);
    		$('section.jsContainer .content-table').scrollLeft(0);
	    	//Hide un-needed columns
	    	$("#js-table .screenshot-hiddenable").addClass('screenshot-hide');
	    	//Just show first 25 row
	    	$("#js-table tr:gt(26)").hide();
	    	//Hide all popups
	    	hidePopups(true);
	    	html2canvas($("section.jsContainer #js-table").get(0), {
				onrendered: function(canvas) {
					localStorage("last_screenshot",canvas.toDataURL(),function(){
						window.open(chrome.extension.getURL("screenshot.html"),'_blank');
						//Back un-needed columns
						$("#js-table .screenshot-hiddenable").removeClass('screenshot-hide');
						//Back all rows
						$("#js-table tr:gt(26)").show();
					});
				}
			});
	    }
    });
	//--------------------------------------------------------------------------------//
    //Extract results 
	$("body").on("click","section.jsContainer #extractResults",function(e){
		e.preventDefault();
		var currentExtractURL = $("#js-table").attr("data-extractUrl");
		if($('#js-table tr').length > 1){
			if($(this).attr("data-section") == "SearchPage"){
				getProductsData.searchResultsData(currentExtractURL);
			}
			else if($(this).attr("data-section") == "MostPopular"){
				getProductsData.mostPopularData(currentExtractURL);
			}
			else if($(this).attr("data-section") == "SellerPage"){
				getSellerProductOtherPage(function(result){
					getProductsData.sellerPageData(result);
				});
			}else if($(this).attr("data-section") == "StoreFrontPage"){
				getStoreFrontProductOtherPage(function(result){
					getProductsData.storeFrontPageData(result);
				});
			}
		}
	});
	//--------------------------------------------------------------------------------//
    //Add the product to the js web app
    $("body").on("click",".js-more .js-more-pt",function(e){
    	e.preventDefault();
    	//Hide other popups
        hidePopups(true);
        var productASIN = $(this).parents("tr").attr("data-asin");
    	chrome.storage.local.get("auth",function(result){
    		if(typeof result.auth != "undefined"){ 
    			result = JSON.parse(result.auth);
    			var theCountry = currentTld;
    			theCountry = theCountry == "com" ? "us" : theCountry;

    			$.ajax({
    				url: "https://junglescoutpro.herokuapp.com/api/v1/product_tracks",
			        type: "POST",
			        crossDomain: true,
			        data: {username:result.username,asin:productASIN,country: theCountry},
			        dataType: "json",
			        success:function(result){ 
			        	if(result != null && typeof result.status != "undefined"){
			        		if(result.status){
			        			showPopUpMessage(result.message,"success");
				        	}else{
				        		showPopUpMessage(result.message,"info");
				        	}
				        }
			        },
			        error:function(xhr,status,error){ 
			        	showPopUpMessage(error,"error");
			        }
    			});
    		}
    	});
    });
    //--------------------------------------------------------------------------------//
    //Show price/rank history from Keepa.com
    $("body").on("click","button.close",function(e){ 
    	$(".js-floating-message").fadeOut("slow");
    	$("#js-table").css("opacity","1");
    });
	//--------------------------------------------------------------------------------//
	//Check previous state from local storage
	function checkCurrentState(tabUrl){
		chrome.storage.local.get(["current_state"],function(result){ 
			result = Object.keys(result).length > 0 ? JSON.parse(result.current_state) : null;

			if( result && tabUrl == result.currentUrl && !areColumnsChanged(result.currentTable)){
				$("section.jsContainer #js-table").html(result.currentTable);
				$("section.jsContainer #js-table").attr("data-firstRow",result.currentFirstRow);
				//Change Weight unit
				$("#js-table th.js-item-weight").text(currentWeightUnit);
				
				$("section.jsContainer #js-table").fadeIn();
				reInitializeTableSorter(true);

				$(".summary-result.js-avg-sales").text(result.currentAvgSales);
				$(".summary-result.js-avg-sales-rank").text(result.currentAvgSalesRank);
				$(".summary-result.js-avg-price").text(result.currentAvgPrice);
				$(".summary-result.js-avg-reviews").text(result.currentAvgReviwes);

				//Extract next page button
				if(typeof result.currentExtractUrl != "undefined" && result.currentExtractUrl && typeof result.currentExtractElement != "undefined"){
					$("section.jsContainer #extractResults").attr("data-section",result.currentExtractElement.dataSection);
					$("section.jsContainer #js-table").attr("data-extracturl",result.currentExtractUrl);
					$("section.jsContainer #extractResults").text("Extract Next Page");
					$("section.jsContainer #extractResults").fadeIn();
				}else{
					$("section.jsContainer #extractResults").css("display","none");
				}

				//View trend button
				if(typeof result.currentSearchTerm != "undefined" && result.currentSearchTerm){
					$("section.jsContainer #js-table").attr("data-searchTerm",result.currentSearchTerm);
					$("section.jsContainer #trendPopup").fadeIn();
				}else{
					$("section.jsContainer #trendPopup").css("display","none");
				}
			}else{
				//Clean previous data
				cleanJsPopup();

				//Scraping these kind of most popular sections:
				//Best sellers, New Releases, Mover and Shaker, Top Rated, Most Wished, Gifts
				if(mostPopularRegex.test(tabUrl)){
					getProductsData.mostPopularData(tabUrl);
				}
				//One product page
				else if(asinRegex.test(tabUrl)){
					//Render current product
					getProductsData.getInternalProduct(tabUrl, {currentProductPage:""});
					//Get other products from the page
					getProductsData.productPageData(tabUrl);
				}
				//Store Front
				else if($(URLParamatersToArray(tabUrl)).filter(["merchant", "marketplaceID"]).length == 2 || getParameter("merchant",tabUrl) || getParameter("me",tabUrl)){
				    getProductsData.storeFrontPageData(getStoreFrontProductFirstPage());
				}
				//Seller Page
				else if ($(URLParamatersToArray(tabUrl)).filter(["seller", "marketplaceID"]).length == 2 || getParameter("seller",tabUrl)){
				    getProductsData.sellerPageData(getSellerProductFirstPage());
				}
				//Search page
				else if(generalSearchRegex.test(tabUrl) || $(URLParamatersToArray(tabUrl)).filter(["url","field-keywords","keywords","field-brandtextbin","rh", "rnid", "node"]).length > 0){
					getProductsData.searchResultsData(tabUrl);
				}
				else{
					showNoProductsScreen();
				}
			}
		});
	}
	//--------------------------------------------------------------------------------//
	// Scrapping Module
	function GetProductsData(){
		var searchResultsData = function(searchUrl){
			if(searchUrl){
			 	var pageNumber = getParameter("page",searchUrl) ? getParameter("page",searchUrl) : 1;
			 	var currentExtractURL = updateParameter(searchUrl,"page",parseInt(pageNumber)+1);
			 	$("#js-table").attr("data-extractUrl",currentExtractURL);
			 	$("#extractResults").attr("data-section","SearchPage");
				
				if(searchUrl == window.location.href){
					searchResultsInternalData($("body"));
				}else{
					chrome.runtime.sendMessage({
				        action: "makeRequest",
				        link: searchUrl
				    }, function(response){
					    //Some times it respond with undefined
				    	if(typeof response == "undefined" || typeof response.data == "undefined"){
				    		searchResultsData(searchUrl);
				    	} else{
				    		searchResultsInternalData(response.data);
				    	}
				    });
				}
			}
		}

		var searchResultsInternalData = function(data){
	        products = $(data, "body").find(".s-result-list li[data-asin], #mainResults .prod.celwidget");

			//First Row
			var searchedText = $(data, "body").find("#twotabsearchtextbox[name='field-keywords']").val();
			$("#js-table").attr("data-firstRow","Search Term: "+escapeHTML(searchedText));
			$("#js-table").attr("data-searchTerm",escapeHTML(searchedText));

			if(products.length <= 0){
        		showNoProductsScreen();
				return;
        	}

        	//Extract results
        	var resultsRow = $(data, "body").find("#pagn");
   			var pagination = new Pagination(resultsRow);
        	var pagesNumber = pagination.getAllResultsNumber();
        	var pageNumber = pagination.getCurrentPage();
        	if(parseInt(pageNumber) < parseInt(pagesNumber) ){
        		showProductsScreen();
        	}else{
        		//Don't show extract next page
        		$("#js-table").attr("data-extractUrl","");
        		showProductsScreen();
        	}
        	
        	var productsCounter = 0;
	        $.each(products, function(index, val) {
	        	if($(val).find(".multiImageTopCategories, .acs-carousel-header").length || $(val).find(":header").text().match(/(sponsored)|(sponsorisé)|(gesponsert)/i) || $(val).find("h2").text().match(/amazon(.*?)page/i)){
	        		return true;
	        	}
	        	//Used for ordered table
    			var currentCounter = productsCounter + ($("#js-table tbody tr").length) + 1;

    			//Get the price "exception case"
		       	var price;
          		price = $(val).find("span.a-color-price.a-text-bold:last").text();
          		price = price.match(priceRegex) ? price.match(priceRegex)[0] : null;
          		if(price){
          			price = price.replace(currencyRegex,""); //Take it just a number
		        	price = price.replace(thousandSeparatorRegex,"$1"); //remove any thousand separator
			        price = price.replace(",","."); //Because of Germany and French stores
          		} else {
          			price = "N.A.";
          		}
	        	
	        	//Get the brand "exception case"
	        	var brand = $(val).find(".a-row.a-spacing-none:has(.a-color-secondary:nth-of-type(2)):first").text();
	        	brand = brand ? brand.match(brandRegex) : null; 
	        	brand = brand ? brand[0] : null; 

		        //Internal requests 
		        var link = $(val).find(".s-access-detail-page, h3 a").attr("href");
		        if(link && link.indexOf("http") == -1 && link.indexOf("https") == -1){
		        	link = currentBaseUrl+link;
		        }

		        if(link){
		        	link = link.trim();
		       		getInternalProduct(link,{price:price, currentCounter:currentCounter, brand:brand});
		        }

		        //Increase products counter +1
		        ++productsCounter;
	       	});
		}
		//-----------------------------------------------------//
		var mostPopularData = function(searchUrl){
			if(searchUrl){
				//Because pagination happened in the user side, I need to replace it with page number
				if(searchUrl.match(/#[0-9]+/)){
					var currectPage = searchUrl.match(/#[0-9]+/)[0];
					currectPage = currectPage.replace(/\#/,"");
					searchUrl = searchUrl.replace(/#[0-9]+/,"");
					searchUrl = updateParameter(searchUrl,"pg",parseInt(currectPage));
				}

				$("#extractResults").attr("data-section","MostPopular");
				$("#js-table").attr("data-searchTerm","");

				//First Row
			 	if(searchUrl.match(newReleasesRegx)){
			 		$("#js-table").attr("data-firstRow","Amazon Hot New Releases");
				}else if(searchUrl.match(moversAndShakersRegx)){
					$("#js-table").attr("data-firstRow","Amazon Movers and Shakers");
				}else if(searchUrl.match(topRatedRegx)){
					$("#js-table").attr("data-firstRow","Amazon Top Rated");
				}else if(searchUrl.match(mostWishesRegx)){
					$("#js-table").attr("data-firstRow","Amazon Most Wished For");
				}else if(searchUrl.match(mostGiftedRegx)){
					$("#js-table").attr("data-firstRow","Amazon Gift Ideas");
				}else{
					$("#js-table").attr("data-firstRow","Amazon Best Sellers");
				}

				if(searchUrl == window.location.href){
					mostPopularInternalData($("body"));
				}else{
					chrome.runtime.sendMessage({
				        action: "makeRequest",
				        link: searchUrl
				    }, function(response){
				    	//Some times it respond with undefined
				    	if(typeof response == "undefined" || typeof response.data == "undefined"){
				    		mostPopularData(searchUrl);
				    	} else{
				    		mostPopularInternalData(response.data);
				    	}
				    });
				}
			}
		}

		var mostPopularInternalData = function(data){
			products = $(data, "body").find("#zg_left_col1 .zg_itemImmersion, #zg_left_col1 .zg_item");
			if(products.length <= 0){
        		showNoProductsScreen();
				return;
        	}

        	//Extract results
        	var isPagination = $(data, "body").find("ol.zg_pagination");

        	if(isPagination.get(0)){
        		var nextResult = $(data, "body").find("ol.zg_pagination li.zg_selected").next().text();
        		if(nextResult){
        			var currentExtractURL = $(data, "body").find("li.zg_selected").next().find("a").attr("href");
        			$("#js-table").attr("data-extractUrl",currentExtractURL);
        			showProductsScreen();
        		}else{
        			$("#js-table").attr("data-extractUrl","");
        			showProductsScreen();
        		}
        	}else{
        		$("#js-table").attr("data-extractUrl","");
        		showProductsScreen();
        	}

        	var productsCounter = 0;
	        $.each(products, function(index, val) {
	        	//Used for ordered table
    			var currentCounter = productsCounter + ($("#js-table tbody tr").length) + 1;
				
		        //Internal requests 
		        var link = $(val).find(".zg_title a, .zg_rankInfo a:first-child, .zg_itemWrapper a:first-child").attr("href");
		        if(link && link.indexOf("http") == -1 && link.indexOf("https") == -1){
		        	link = currentBaseUrl+link;
		        }

		        if(link){
		        	link = link.trim();
		       		getInternalProduct(link,{currentCounter:currentCounter});
		        }

		        //Increase products counter +1
		        ++productsCounter;
	       });
		}
		//-----------------------------------------------------//
		var productPageData = function(searchUrl){
			//This to got remote product page data, get current product is injected
			if(searchUrl){
				chrome.runtime.sendMessage({
			        action: "makeRequest",
			        link: searchUrl
			    }, function(response){
			    	//Some times it respond with undefined
			    	if(typeof response == "undefined" || typeof response.data == "undefined"){
			    		productPageData(searchUrl);
			    		return true;
			    	}
					products = $(response.data).find("#fallbacksession-sims-feature li, #session-sims-feature li, #purchase-sims-feature li, #purchaseShvl li.shoveler-cell, #variation_color_name li, #variation_style_name li, #variation_size_name li, #variation_flavor_name li, #variation_scent_name li, #variation_item_package_quantity li, #purchase-similarities_feature_div li, #day0-sims-feature li");
			
					//Don't show extract next page
					$("#js-table").attr("data-extractUrl","");
					//For trend button
        			$("#js-table").attr("data-searchTerm","");
        			showProductsScreen();

        			var productsCounter = 0;
			        $.each(products, function(index, val) {
			        	//Used for ordered table 
		    			var currentCounter = productsCounter + ($("#js-table tbody tr").length) + 1;
				        //Internal requests for products
				        var link = $(val).find("a:first").attr("href") || $(val).attr("data-dp-url");
				        if(link && link.indexOf("http") == -1 && link.indexOf("https") == -1){
				        	link = currentBaseUrl+link;
				        }

				        if(link){
				        	link = link.trim();
				        	if(typeof $(val).attr("id") != "undefined" && 
				        		( $(val).attr("id").indexOf("color_name") == 0 || $(val).attr("id").indexOf("style_name") == 0 
				        			|| $(val).attr("id").indexOf("size_name") == 0 || $(val).attr("id").indexOf("flavor_name") == 0 
				        			|| $(val).attr("id").indexOf("scent_name") == 0 || $(val).attr("id").indexOf("item_package_quantity") == 0)){
					        	getInternalProduct(link,{currentCounter:currentCounter, child:true});
					        }else{
					        	getInternalProduct(link,{currentCounter:currentCounter});
					        }
				        }

				        //Increase products counter +1
				        ++productsCounter;
			        });
			    });
			}
		}

		//-----------------------------------------------------//
		var sellerPageData = function(result){
        	products = result.products;

        	//For trend button
        	$("#js-table").attr("data-searchTerm","");

        	if(products.length <= 0 && result.action=="sellerProductFirstPage"){
		    	showNoProductsScreen();
		    	return;
		    }else if(products.length <= 0 && result.action=="sellerProductOtherPage"){
		    	$("section.jsContainer #extractResults").css("display","none");
		    	return;
		    }

        	var sellerName = result.name ? result.name : "N.A.";
        	//First Row
		    $("section.jsContainer #js-table").attr("data-firstRow","Seller: "+escapeHTML(sellerName));
        	$("section.jsContainer #extractResults").attr("data-section","SellerPage");
			
			var currentPage = parseInt(result.currentPage);
			var pages = parseInt(result.pages);

			if(!isNaN(currentPage) && !isNaN(pages)){
				var nextPage = (currentPage+1);
				if(nextPage <= pages){
					$("#js-table").attr("data-extractUrl","true"); //Because it happenes in user side
					showProductsScreen();
				}else{
					$("#js-table").attr("data-extractUrl",""); //Because it happenes in user side
					showProductsScreen();
				}
			}else{
				$("#js-table").attr("data-extractUrl",""); //Because it happenes in user side
				showProductsScreen();
			}
			
			var productsCounter = 0;
        	$.each(products, function(index, val) {
	        	//Used for ordered table
	        	var currentCounter = productsCounter + ($("#js-table tbody tr").length) + 1;

	        	var price = "N.A.";
          		price = $(val).find(".product-price").text();
          		price = price.match(priceRegex) ? price.match(priceRegex)[0] : "N.A.";
	        	price = price.replace(currencyRegex,""); //Take it just a number
	        	price = price.replace(thousandSeparatorRegex,"$1"); //remove any thousand separator
		        price = price.replace(",","."); //Because of Germany and French stores
		        
		        //Internal requests 
		        var link = $(val).find(".product-title a").attr("href") || $(val).find(".AAG_ProductTitle a").attr("href");
		        if(link && link.indexOf("http") == -1 && link.indexOf("https") == -1){
		        	link = currentBaseUrl+link;
		        }

		        if(link){
		        	link = link.trim();
					getInternalProduct(link,{price:price, currentCounter:currentCounter});
		        }

		        //Increase products counter +1
		        ++productsCounter;
        	});//End for each products
		}

		//-----------------------------------------------------//
		var storeFrontPageData = function(result){
        	products = $(result.products);

        	if(products.length <= 0 && result.action == "storeFrontProductFirstPage"){
		    	showNoProductsScreen();
		    	return;
		    }else if(products.length <= 0 && result.action == "storeFrontProductsOtherPage"){
		    	showProductsScreen();
		    	return;
		    }

        	var sellerName = result.name ? result.name : "N.A.";
        	//First Row
		    $("#js-table").attr("data-firstRow","Seller: "+escapeHTML(sellerName));
        	$("#extractResults").attr("data-section","StoreFrontPage");
        	//For trend button
        	$("#js-table").attr("data-searchTerm","");
			
        	//Extract results
   			var pagination = new Pagination(result.resultsRow);
        	var pagesNumber = pagination.getAllResultsNumber();
        	var pageNumber = pagination.getCurrentPage();

        	if(parseInt(pageNumber) < parseInt(pagesNumber) ){
        		$("#js-table").attr("data-extractUrl","true"); //Because it happenes in user side
        		showProductsScreen();
        	}else{
        		$("#js-table").attr("data-extractUrl",""); //Because it happenes in user side
        		showProductsScreen();
        	}
        	
        	var productsCounter = 0;
        	$.each(products, function(index, val) {
	        	//Used for ordered table
    			var currentCounter = productsCounter + ($("section.jsContainer #js-table tbody tr").length) + 1;
				
				//Internal requests 
		        var link = $(val).find(".s-access-detail-page").attr("href");

 				if(link && link.indexOf("http") == -1 && link.indexOf("https") == -1){
		        	link = currentBaseUrl+link;
		        }

		        if(link){
		        	link = link.trim();
		       		getInternalProduct(link,{currentCounter:currentCounter});
				}

				//Increase products counter +1
	       		++productsCounter;
	       	});
		}
		
		//-----------------------------------------------------//
		//To get parse product from background
		var getInternalProduct = function(link, data){
			var messageObj = null;
			if(typeof data.currentProductPage != "undefined"){
				//First Row
    			$("section.jsContainer #js-table").attr("data-firstRow", "Product Page: " + escapeHTML($("#productTitle").text()));
				messageObj = {action: "makeDataParse", htmlPage: $("body").html(), bestSellerRankText:bestSellerRankText, passingData: data};
			} else{
				messageObj = {action: "makeRequest", link: link, bestSellerRankText:bestSellerRankText, passingData: data};
			}

			chrome.runtime.sendMessage(messageObj, function(bgParser){
		    	//Some times it respond with undefined
		    	if(typeof bgParser == "undefined"){
		    		getInternalProduct(link, data);
		    		return true;
		    	}

	          	//Global to reach from parser
	          	currentCounter = typeof data.currentCounter != "undefined" ? data.currentCounter : 0;
	          	asin = getASINFromURL(link);
	          	productTitle = bgParser.getProductTitle;
	          	productImage = bgParser.getProductImage;

	          	if(showBrandColumn){
		          	brand = bgParser.getBrand;
		        }
	          	
	          	//I need it all times
	          	price = bgParser.getPrice;
	          	finalPrice = price != "N.A." ? currentCurrency + parseFloat(price).toFixed(2) : "N.A.";
		       
	          	//I need it all times
		        category = bgParser.getRankAndCategory.category;

	          	if(showBbSellerColumn){
		          	bbSeller = bgParser.getBbSeller;
		        }
	          	
	          	//I need it all times
	          	rank = bgParser.getRankAndCategory.rank;
	          	finalRank = rank != "N.A." ? "#" + rank : rank;
	          	finalRank = numberWithCommas(finalRank);

	          	reviews = "N.A.";
	            if(showReviewsColumn){
		          	reviews = bgParser.getReviews;
		        }
	          	
	          	rating = "N.A.";
	          	if(showRatingColumn){
		          	rating = bgParser.getRating;
		        }
	          	
	          	if(showEstSalesColumn || showEstRevenueColumn || category == "N.A."){
          			renderEstSalesOrRevenueOrCategoryOrRank(currentCounter, asin, category, rank, price, data);
	          	}
	          	
	          	if(showNetColumn || showFbaFeeColumn || showTierColumn || showItemWidthColumn || showItemHeightColumn || showItemLengthColumn || showItemWeightColumn){
		            renderProductDimensions(currentCounter,asin);
		        }

		        if(showNewSellerColumn){
		            renderNewSellers(currentCounter,asin);
		        }

	          	//Start render rows on tables
	          	renderRow(data);

	          	//resort table
	          	sortTable($("section.jsContainer #js-table").get(0));
		    });
		}
		//----------------------------- Private Methods -----------------------------------//
		//Get estimated sales
		var renderEstSalesOrRevenueOrCategoryOrRank = function(theCounter, theAsin, theCategory, theRank, thePrice, passingData){
			var store = currentTld == "com" ? "us" : currentTld;
			var requestURL = null;
			//To get just the estimated sales
			if(theCategory != "N.A." && theRank != "N.A."){
				requestURL = "https://junglescoutpro.herokuapp.com/api/v1/est_sales?store="+store+"&rank="+theRank+"&category="+encodeURIComponent(theCategory)+"&dailyToken="+dailyToken;
			} 
			//To get the category/rank/estimated sales
			else{
				requestURL = "https://junglescoutpro.herokuapp.com/api/v1/est_sales?store="+store+"&asin="+theAsin+"&dailyToken="+dailyToken;
			}
			
			//Make request to get estimated sales results
			lastXMLRequest = $.ajax({
				url: requestURL,
				type: "GET",
				crossDomain: true,
				success: function(responseJson){ 
					var estSales = "N.A.";
					var isSalesFromAPI = false;
					if(responseJson && responseJson.status){
						estSales = responseJson.estSalesResult;

						//Get the category from the API
						if(theCategory == "N.A."){
							var respondCategory = typeof responseJson.category != "undefined" ? responseJson.category : "N.A.";
							$("body").trigger("myCategoryChanged", [theCounter, respondCategory]);
						}

						//Get the rank from the API
						if(theRank == "N.A."){
							var respondRank = typeof responseJson.rank != "undefined" ? responseJson.rank : "N.A.";
							respondRank = respondRank != "N.A." ? "#" + respondRank : respondRank;
		          			respondRank = numberWithCommas(respondRank);
		          			$("body").trigger("myRankChanged", [theCounter, respondRank]);
		          			if(respondRank != "N.A."){
		          				isSalesFromAPI = true;
		          			}
						}
					}

		        	if(showEstRevenueColumn){ 
		        		var estRevenu = getEstimatedRevenue(estSales, thePrice);
		        		$("#js-table tr#"+theCounter).attr("data-estRevenue", estRevenu);
		        	}

		        	$("#js-table tr#"+theCounter).attr("data-estSales", estSales);

		        	//For a child product, don't add estimated sales or revenue
		        	if(typeof passingData == "undefined" || (typeof passingData != "undefined" && typeof passingData.child == "undefined") ){
		        		//Estimated sales render row
		        		if(showEstSalesColumn){
		        			if(estSales == "N.A."){
		        				$("#js-table tr#"+theCounter+" td.js-est-sales").html(noneEstSalesInfo);
		        			} else{
		        				if(isSalesFromAPI){
		        					$("#js-table tr#"+theCounter+" td.js-est-sales").html(numberWithCommas(estSales)+" "+salesFromAPI);
		        					$("#js-table tr#"+theCounter+" td.js-est-sales").addClass("gray-cell");
		        				} else {
		        					$("#js-table tr#"+theCounter+" td.js-est-sales").text(numberWithCommas(estSales));
		        					isSalesFromAPI = false;
		        				}
		        				// $("#js-table tr#"+theCounter+" td.js-est-sales").attr("title", numberWithCommas(estSales));
		        			}
			        	}

			        	//Estimated revenue render row
			        	if(showEstRevenueColumn){
			        		if(estRevenu == "N.A."){
			        			$("#js-table tr#"+theCounter+" td.js-est-revenue").html(noneEstRevenueInfo);
			        		} else{
			        			if(isSalesFromAPI){
	        					$("#js-table tr#"+theCounter+" td.js-est-revenue").html(numberWithCommas(estRevenu)+" "+salesFromAPI);
	        					$("#js-table tr#"+theCounter+" td.js-est-revenue").addClass("gray-cell");
	        				} else {
	        					$("#js-table tr#"+theCounter+" td.js-est-revenue").text(numberWithCommas(estRevenu));
	        					isSalesFromAPI = false;
	        				}

			        			// $("#js-table tr#"+theCounter+" td.js-est-revenue").attr("title", estRevenu);
			        		}
			        	}
		        	}
				}, 
				error: function(xhr, status, error){
					console.error("Could not reach to the estimated sales! ASIN: "+theAsin);

					//If something went wrong with Rail app
					if(showEstSalesColumn){
						$("#js-table tr#"+theCounter+" td.js-est-sales").html(noneEstSalesInfo);
					}

					if(showEstRevenueColumn){
						$("#js-table tr#"+theCounter+" td.js-est-revenue").html(noneEstRevenueInfo);
					}
				}
			});
		}
		//----------------------------------------------------//
		//Get estimated Revenue
		var getEstimatedRevenue = function (salesEq, thePrice){
			var finalEq = null;
			thePrice = thePrice.replace("," ,"");
			if(isNaN(thePrice) || salesEq == "N.A."){
				return "N.A.";
			}else if(salesEq == "< 5"){
				finalEq = "< " + currentCurrency+Math.round(thePrice * 5);
				return finalEq;
			}else if(!isNaN(salesEq)){
				finalEq = Math.round(salesEq * thePrice);
				finalEq = currentCurrency + numberWithCommas(finalEq);
				return finalEq;
			}else{
				return "N.A.";
			}
		}

		//-----------------------------------------------------//
		var renderRow = function(passingData){
			var currentRowNumber = $("section.jsContainer #js-table tr").length;

			//Global variables | 0 in current product page
			currentCounter = typeof currentCounter != "undefined" ? currentCounter : "0";
			
			if(typeof passingData != "undefined" && typeof passingData.child != "undefined"){
				var currentRow = "<tr class='child-product' id='"+currentCounter+"'><td class='js-number'>"+(currentRowNumber)+"</td>";
				currentRow += "<td class='js-more csv-hiddenable screenshot-hiddenable'><a href='#' class='js-more-pt'><img width='15' src='"+imagesPath+"/add_icon.png' /></a></td>";
				currentRow += "<td class='js-product-name screenshot-hiddenable product-image-cell' data-image='"+productImage+"'><a href='"+currentBaseUrl+"/dp/"+asin+"' target='_blank'>&#x27a5; &nbsp;"+productTitle+"</a></td>";
			}else{
				var currentRow = "<tr id='"+currentCounter+"'><td class='js-number'>"+(currentRowNumber)+"</td>";
				currentRow += "<td class='js-more csv-hiddenable screenshot-hiddenable'><a href='#' class='js-more-pt'><img width='15' height='15' src='"+imagesPath+"/add_icon.png' /></a></td>";
				currentRow += "<td class='js-product-name screenshot-hiddenable product-image-cell' data-image='"+productImage+"'><a href='"+currentBaseUrl+"/dp/"+asin+"' target='_blank'>"+productTitle+"</a></td>";
			}

			if(showBrandColumn){
				if(brand == "N.A."){
					currentRow += "<td class='js-brand screenshot-hiddenable'>"+noneBrandInfo+"</td>";
				} else{
					currentRow += "<td class='js-brand screenshot-hiddenable' title='"+escapeHTML(brand)+"'>"+brand+"</td>";
				}
			}else{
				currentRow += "<td class='js-brand hidden'></td>";
			}

			//Using Keepa.com API to get price history
			//Details: https://keepa.com/#!historyapi
			if(showPriceColumn){
				if(finalPrice == "N.A."){
					currentRow += "<td class='js-price'>"+nonePriceInfo+"</td>";
				} else {
					currentRow += "<td class='js-price'><a href='#' data-chart='https://dyn.keepa.com/pricehistory.png?asin="+asin+"&domain="+fullCurrentTld+"&width=750&height=350&amazon=1&new=1&range=365' title='"+finalPrice+"'>"+finalPrice+"</a></td>";
				}
			}else{
				currentRow += "<td class='js-price hidden'></td>";
			}

			if(showCategoryColumn){
				if(category == "N.A."){
					currentRow += "<td class='js-category screenshot-hiddenable'>"+noneCategoryInfo+"</td>";
				} else {
					currentRow += "<td class='js-category screenshot-hiddenable' title='"+category+"'>"+category+"</td>";
				}
			}else{
				currentRow += "<td class='js-category hidden'></td>";
			}

			//Using Keepa.com API to get rank history
			//Details: https://keepa.com/#!historyapi
			if(showRankColumn){
				if(finalRank == "N.A."){
					currentRow += "<td class='js-rank'>"+noneRankInto+"</td>";
				}else{
					currentRow += "<td class='js-rank'><a href='#' data-chart='https://dyn.keepa.com/pricehistory.png?asin="+asin+"&domain="+fullCurrentTld+"&width=750&height=350&amazon=0&new=0&range=365&salesrank=1' title='"+finalRank+"'>"+finalRank+"</a></td>";
				}
			}else{
				currentRow += "<td class='js-rank hidden'></td>";
			}

			if(showEstSalesColumn){
				currentRow += "<td class='js-est-sales'>hmm...</td>";
			}else if(!showEstSalesColumn){
				currentRow += "<td class='js-est-sales hidden'></td>";
			}

			if(showEstRevenueColumn){
				currentRow += "<td class='js-est-revenue'>hmm...</td>";
			}else if(!showEstRevenueColumn){
				currentRow += "<td class='js-est-revenue hidden'></td>";
			}

			if(showReviewsColumn){
				if(reviews == "N.A."){
					currentRow += "<td class='js-reviews'>"+noneReviewsInfo+"</td>";
				} else{
					currentRow += "<td class='js-reviews' title='"+reviews+"'>"+reviews+"</td>";
				}
			}else{
				currentRow += "<td class='js-reviews hidden'></td>";
			}

			if(showRatingColumn){
				if(rating == "N.A."){
					currentRow += "<td class='js-rating'>"+noneRatingInfo+"</td>";
				} else{
					currentRow += "<td class='js-rating' title='"+rating+"'>"+rating+"</td>";
				}
			}else{
				currentRow += "<td class='js-rating hidden'></td>";
			}

			if(showBbSellerColumn){
				if(bbSeller == "N.A."){
					currentRow += "<td class='js-bb-seller'>"+noneBBSellerInfo+"</td>";
				} else {
					currentRow += "<td class='js-bb-seller' title='"+bbSeller+"'>"+bbSeller+"</td>";
				}
			}else{
				currentRow += "<td class='js-bb-seller hidden'></td>";
			}

			if(showFbaFeeColumn){
				currentRow += "<td class='js-fba-fee'>hmm...</td>";
			}else{
				currentRow += "<td class='js-fba-fee hidden'></td>";
			}

			if(showTierColumn){
				currentRow += "<td class='js-tier'>hmm...</td>";
			}else{
				currentRow += "<td class='js-tier hidden'></td>";
			}

			if(showNewSellerColumn){
				currentRow += "<td class='js-new-sellers'>hmm...</td>";
			}else{
				currentRow += "<td class='js-new-sellers hidden'></td>";
			}

			if(showItemLengthColumn){
				currentRow += "<td class='js-item-length'>hmm...</td>";
			}else{
				currentRow += "<td class='js-item-length hidden'></td>";
			}
			
			//Item Dimensions
			if(showItemWidthColumn){
				currentRow += "<td class='js-item-width'>hmm...</td>";
			}else{
				currentRow += "<td class='js-item-width hidden'></td>";
			}

			if(showItemHeightColumn){
				currentRow += "<td class='js-item-height'>hmm...</td>";
			}else{
				currentRow += "<td class='js-item-height hidden'></td>";
			}

			if(showItemWeightColumn){
				currentRow += "<td class='js-item-weight'>hmm...</td>";
			}else{
				currentRow += "<td class='js-item-weight hidden'></td>";
			}

			if(showNetColumn){
				currentRow += "<td class='js-net'>hmm...</td>";
			}else{
				currentRow += "<td class='js-net hidden'></td>";
			}

			currentRow += "<td class='js-asin hidden hiddenable'>"+asin+"</td>";
			currentRow += "<td class='js-link hidden hiddenable'>"+currentBaseUrl+"/dp/"+asin+"</td>";
			
			currentRow += "</tr>";
			currentRow = $(currentRow);

			//Attributes
			currentRow.attr({
				"data-asin":asin,
				"data-title":productTitle,
				"data-price":pureNumber(finalPrice),
				"data-category":category,
				"data-reviews":reviews,
				"data-estSales":"N.A.",
				"data-estRevenue":"N.A.",
				"data-rank": pureNumber(finalRank)
			});

			//Render the row
			currentRow.appendTo("#js-table tbody");
		}
		//----------------------------------------------------//
		//Get product Diemnsions
		var renderProductDimensions = function(rowCounter,asin){
			mwsAPIPort.postMessage({operation:"mwsAPI", rowCounter:rowCounter, action: "GetMatchingProduct", asin:asin, marketPlaceID:marketPlaceID, mwsHost:mwsHost});
		}
		//----------------------------------------------------//
		//Get New Sellers
		var renderNewSellers = function(rowCounter,asin){
			mwsAPIPort.postMessage({operation:"mwsAPI", rowCounter:rowCounter, action: "GetCompetitivePricingForASIN", asin:asin, marketPlaceID:marketPlaceID, mwsHost:mwsHost});
		}
		//----------------------------------------------------//
		//Render the values of FBA Fee or Tier for US store
		var renderFBAFeeOrTierOrNet = function(rowCounter){
			var theCategory = $("#js-table tr#"+rowCounter).attr("data-category");
			var thePrice = $("#js-table tr#"+rowCounter).attr("data-price");
			var theWidth = $("#js-table tr#"+rowCounter).attr("data-width");
			var theLength = $("#js-table tr#"+rowCounter).attr("data-length");
			var theHeight = $("#js-table tr#"+rowCounter).attr("data-height");
			var theWeight = $("#js-table tr#"+rowCounter).attr("data-weight");

			thePrice = pureNumber(thePrice); //I need just the number

			var theFBAFeeAndTier = null;
			if(currentTld == "com"){
				theFBAFeeAndTier = USFbaFeeAndTier(theCategory, thePrice, theLength, theWidth, theHeight, theWeight);
			}else if(currentTld == "uk"){
				theFBAFeeAndTier = UKFbaFeeAndTier(theCategory, thePrice, theLength, theWidth, theHeight, theWeight);
			}else if (currentTld == "ca"){
				theFBAFeeAndTier = CAFbaFeeAndTier(theCategory, thePrice, theLength, theWidth, theHeight, theWeight);
			}else if (currentTld == "fr"){
				theFBAFeeAndTier = FRFbaFeeAndTier(theCategory, thePrice, theLength, theWidth, theHeight, theWeight);
			}else if (currentTld == "de"){
				theFBAFeeAndTier = DEFbaFeeAndTier(theCategory, thePrice, theLength, theWidth, theHeight, theWeight);
			}else if (currentTld == "in"){
				theFBAFeeAndTier = INFbaFeeAndTier(theCategory, thePrice, theLength, theWidth, theHeight, theWeight);
			}else if (currentTld == "mx"){
				theFBAFeeAndTier = MXFbaFeeAndTier(theCategory, thePrice, theLength, theWidth, theHeight, theWeight);
			}else if (currentTld == "it"){
				theFBAFeeAndTier = ITFbaFeeAndTier(theCategory, thePrice, theLength, theWidth, theHeight, theWeight);
			}else if (currentTld == "es"){
				theFBAFeeAndTier = ESFbaFeeAndTier(theCategory, thePrice, theLength, theWidth, theHeight, theWeight);
			}
			
			var theTier = theFBAFeeAndTier.theTier;
			var theFullTierDescription = theFBAFeeAndTier.theFullTierDescription;
			var theFbaFee = theFBAFeeAndTier.theFbaFee;
			var theTotalFbaFee = theFBAFeeAndTier.theTotalFbaFee;
			var theClosingFee = theFBAFeeAndTier.theClosingFee;
			var theReferralFee = theFBAFeeAndTier.theReferralFee;

			//Render the value of tier column if active
			if(showTierColumn){
				if(theTier == "N.A."){
					$("#js-table tr#"+rowCounter+" td.js-tier").html(noneTierInfo);
				} else {
					$("#js-table tr#"+rowCounter+" td.js-tier").text(theTier);
					$("#js-table tr#"+rowCounter+" td.js-tier").attr("title",theFullTierDescription);
				}
			}
			
			//Render the value of FBA fee column if active
			if(showFbaFeeColumn){
				if(theTotalFbaFee == "N.A."){
					$("#js-table tr#"+rowCounter+" td.js-fba-fee").html(noneFBAInfo);
				} else{
					theTotalFbaFee = currentCurrency + theTotalFbaFee;
					$("#js-table tr#"+rowCounter+" td.js-fba-fee").text(theTotalFbaFee);
				}	
			}

			//Render the value of net column if active
			if(showNetColumn){
				theTotalFbaFee = pureNumber(theTotalFbaFee);
				theTotalFbaFee = parseFloat(theTotalFbaFee);
				thePrice = parseFloat(thePrice);

				if(!isNaN(theTotalFbaFee) && !isNaN(thePrice)){
					var theNetValue = (thePrice - theTotalFbaFee).toFixed(2);
					theNetValue = currentCurrency + theNetValue;
					$("#js-table tr#"+rowCounter+" td.js-net").html("<a href='#' title='"+theNetValue+"'>"+theNetValue+"</a>");
				}else{
					$("#js-table tr#"+rowCounter+" td.js-net").html(noneNetInfo);
					theTotalFbaFee = "N.A.";
				}

				$("#js-table tr#"+rowCounter).attr({
					"data-tier":theFullTierDescription,
					"data-total-fba":theTotalFbaFee,
					"data-fba":theFbaFee,
					"data-net":pureNumber(theNetValue),
					"data-referral":theReferralFee,
					"data-closing":theClosingFee
				});
			}
		}
		//-----------------------------------------------------//
		return {
			getInternalProduct:getInternalProduct,
			searchResultsData: searchResultsData,
			mostPopularData: mostPopularData,
			productPageData: productPageData,
			sellerPageData: sellerPageData,
			storeFrontPageData: storeFrontPageData,
			renderFBAFeeOrTierOrNet:renderFBAFeeOrTierOrNet
		}
	}
});