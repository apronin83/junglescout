/**
 * @Author: Mohammad M. AlBanna
 * Copyright © 2017 Jungle Scout
 *
 * All operations that related to profit calculator
*/

$(function(){
	//If the file has injected many times
	if($(".jsContainer").length >= 1){
		return;
	}

	//--------------------------------------------------------------------------------//
	//Show profit calculator for net value 
	$("body").on("click",".js-net a",function(e){ 
		e.preventDefault();
		
		//Hide other popups
	    hidePopups(true);

	    //Clean previous values
	    $(".profit-result").html("<i class='none-info'>--</i>");
	    $("input[name='productCost']").val("0.00");

	    //Send google analytics
        chrome.runtime.sendMessage({
            action: "googleAnalyticsAction",
            page: "profit.js"
        });

        //Change current currency
		$(".js-profit-calc-section .current-currency").text(currentCurrency);

		//Position the popup to center
	    $(".js-profit-calc-section").css({
	        "left": ($("section.container").width() - $(".js-profit-calc-section").width())/2, 
	        "top": (($("section.container").height() - $(".js-profit-calc-section").height())/2)+30 });

	    //Product Name
	    var productName = $(this).parents("tr").attr("data-title");
	    $(".profit-product-name").text(productName);
	    $(".profit-product-name").attr("title",productName);

	    //Product Weight
	    productWeight = $(this).parents("tr").attr("data-weight");
	    if(productWeight == "N.A."){
	    	$(".profit-product-weight").html("<i class='none-info'>--</i>");
	    } else{
	    	$(".profit-product-weight").text(productWeight + " " + currentWeightUnit);
	    }

	    //Product Dimension
	    productLength = parseFloat($(this).parents("tr").attr("data-length"));
	    productWidth = parseFloat($(this).parents("tr").attr("data-width"));
	    productHeight = parseFloat($(this).parents("tr").attr("data-height"));
	    productDimension = "";
	    if(!isNaN(productLength)){
	    	productDimension +=  productLength.toFixed(1);
	    }
	    if(!isNaN(productWidth)){
	    	productDimension +=  " × " + productWidth.toFixed(1);
	    }
	    if(!isNaN(productWidth)){
	    	productDimension +=  " × " + productHeight.toFixed(1);
	    }

	    productDimension += " "+currentLWHUnit;

	    $(".profit-product-dimensions").text(productDimension);

	    //Product Tier
	    var productTier = $(this).parents("tr").attr("data-tier");
	    $(".profit-product-tier").text(productTier);

	    //Product Price
	    var productPrice = $(this).parents("tr").attr("data-price");
	    productPrice =  isNaN(productPrice) ? 0.00 : productPrice;
	    $("input[name='profitProductPrice']").val(productPrice);

	    //Product FBA
	    var productFBA = $(this).parents("tr").attr("data-fba");
	    productFBA = pureNumber(productFBA);
	    if(isNaN(productFBA)){
	    	$(".profit-product-fba").html("<i class='none-info'>--</i>");
	    } else{
	    	$(".profit-product-fba").text(currentCurrency + parseFloat(productFBA).toFixed(2));
	    }

	    //Product Referral FBA
	    var productReferral = $(this).parents("tr").attr("data-referral");
	    if(isNaN(productReferral)){
	    	$(".profit-product-referral-fee").html("<i class='none-info'>--</i>");
	    } else{
	    	$(".profit-product-referral-fee").text(currentCurrency + parseFloat(productReferral).toFixed(2));
	    }

	    //Product Closing Fee
	    var productClosingFee = $(this).parents("tr").attr("data-closing");
	    if(productClosingFee == "N.A."){
	    	$(".profit-product-closing-fee").html("<i class='none-info'>--</i>");
	    } else{
	    	$(".profit-product-closing-fee").text(currentCurrency + parseFloat(productClosingFee).toFixed(2));
	    }

	    //Product Total FBA
	    var productTotalFBA = $(this).parents("tr").attr("data-total-fba");
	    if(isNaN(productTotalFBA)){
	    	$(".profit-product-total-fba").html("<i class='none-info'>--</i>");
	    } else{
	    	$(".profit-product-total-fba").text(currentCurrency + parseFloat(productTotalFBA).toFixed(2));
	    }

	    //Product Net value
	    var netValue = $(this).parents("tr").attr("data-net");
	    if(netValue == "N.A."){
	    	$(".profit-product-net").html("<i class='none-info'>--</i>");
	    } else{
	    	$(".profit-product-net").text(currentCurrency + parseFloat(netValue).toFixed(2));
	    }

	    //Product Category
	    productCategory = $(this).parents("tr").attr("data-category");

	    //View the popup
	    $(".js-profit-calc-section").fadeIn();
	});

	//--------------------------------------------------------------------------------//
	//Hide profit calculator
	$("body").on("click",".jsContainer .closeProfitCalc",function(){
		$("section.jsContainer .js-profit-calc-section").fadeOut("fast");
	});

	//--------------------------------------------------------------------------------//
	//Calculate Profit button
	$("body").on("click",".jsContainer #jsCalcProfitButton",function(){ 
		var currentNet = $(".profit-product-net").text();
		currentNet = pureNumber(currentNet);
		var currentProductCost = $("input[name='productCost']").val();
		currentProductCost = pureNumber(currentProductCost);
		currentProductCost = isNaN(currentProductCost) ? 0.00 : currentProductCost;

		if(!isNaN(currentNet)){
			var currentProfit = (currentNet - currentProductCost).toFixed(2);
			$(".profit-result").text("Profit: " + currentCurrency + currentProfit);
		}else{
			$(".profit-result").html("<i class='none-info'>--</i>");
		}
	});
	//--------------------------------------------------------------------------------//
	//Calculate Profit on click Enter button
	$("body").on("keypress","input[name='productCost']",function(e){ 
		var key = e.which;
		if(key == 13)  // the enter key code
		{
			$(".jsContainer #jsCalcProfitButton").click();
			return false;  
		}
	});  

	//----------------------------------------------------------------------------------//
    //Calculate fees
    var timer;
    $("body").on("keypress change","input[name='profitProductPrice']", function() {
        clearTimeout(timer);
        timer = setTimeout(function() {
           var thePrice = $("input[name='profitProductPrice']").val();
           if(thePrice && !isNaN(thePrice)){
           		thePrice = parseFloat(thePrice);
           		var theFBAData = null;
           		if(currentTld == "com"){
					theFBAData = USFbaFeeAndTier(productCategory, thePrice, productLength, productWidth, productHeight, productWeight);
				}else if(currentTld == "uk"){
					theFBAData = UKFbaFeeAndTier(productCategory, thePrice, productLength, productWidth, productHeight, productWeight);
				}else if (currentTld == "ca"){
					theFBAData = CAFbaFeeAndTier(productCategory, thePrice, productLength, productWidth, productHeight, productWeight);
				}else if (currentTld == "fr"){
					theFBAData = FRFbaFeeAndTier(productCategory, thePrice, productLength, productWidth, productHeight, productWeight);
				}else if (currentTld == "de"){
					theFBAData = DEFbaFeeAndTier(productCategory, thePrice, productLength, productWidth, productHeight, productWeight);
				}else if (currentTld == "in"){
					theFBAData = INFbaFeeAndTier(productCategory, thePrice, productLength, productWidth, productHeight, productWeight);
				}else if (currentTld == "mx"){
					theFBAData = MXFbaFeeAndTier(productCategory, thePrice, productLength, productWidth, productHeight, productWeight);
				}else if (currentTld == "it"){
					theFBAData = ITFbaFeeAndTier(productCategory, thePrice, productLength, productWidth, productHeight, productWeight);
				}else if (currentTld == "es"){
					theFBAData = ESFbaFeeAndTier(productCategory, thePrice, productLength, productWidth, productHeight, productWeight);
				}

           		//Product FBA
           		var productFBA = theFBAData.theFbaFee;
           		if(isNaN(productFBA)){
			    	$(".profit-product-fba").html("<i class='none-info'>--</i>");
			    } else{
			    	$(".profit-product-fba").text(currentCurrency + parseFloat(productFBA).toFixed(2));
			    }

			    //Product Referral FBA
			    var productReferral = theFBAData.theReferralFee;
			    if(isNaN(productReferral)){
			    	$(".profit-product-referral-fee").html("<i class='none-info'>--</i>");
			    } else{
			    	$(".profit-product-referral-fee").text(currentCurrency + parseFloat(productReferral).toFixed(2));
			    }

			    //Product Closing Fee
			    var productClosingFee = theFBAData.theClosingFee;
			    if(productClosingFee == "N.A."){
			    	$(".profit-product-closing-fee").html("<i class='none-info'>--</i>");
			    } else{
			    	$(".profit-product-closing-fee").text(currentCurrency + parseFloat(productClosingFee).toFixed(2));
			    }

			    //Product Total FBA
			    var productTotalFBA = theFBAData.theTotalFbaFee;

			    if(isNaN(productTotalFBA)){
			    	$(".profit-product-total-fba").html("<i class='none-info'>--</i>");
			    } else{
			    	$(".profit-product-total-fba").text(currentCurrency + parseFloat(productTotalFBA).toFixed(2));
			    }

			    //Product Net value
			    productTotalFBA = theFBAData.theTotalFbaFee;
			    if(isNaN(productTotalFBA)){
			    	$(".profit-product-net").html("<i class='none-info'>--</i>");
			    } else{
			    	$(".profit-product-net").text(currentCurrency + parseFloat(thePrice - productTotalFBA).toFixed(2));
			    }
           }
        }, 500);
    });
});