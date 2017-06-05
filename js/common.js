/**
 * @Author: Mohammad M. AlBanna
 * Copyright © 2017 Jungle Scout
 * 
 * Contains the common and pupblic functions to use
 */

//If the file has injected many times
if($(".jsContainer").length >= 1){
   throw new Error("Injected!");
}
//--------------------------------------------------------------------------------//
//Constants
STANDARD_NUM = 1;
STANDARD_STRING = "Standard";
STANDARD_STRING_SHORT = "Stand";

STANDARD_SMALL_NUM = 2;
STANDARD_SMALL_STRING = "Standard (Small)";
STANDARD_SMALL_STRING_SHORT = "S. Stand";

STANDARD_LARGE_NUM = 3;
STANDARD_LARGE_STRING = "Standard (Large)";
STANDARD_LARGE_STRING_SHORT = "L. Stand";

OVERSIZE_NUM = 4;
OVERSIZE_STRING = "Oversize";
OVERSIZE_STRING_SHORT = "Over";

OVERSIZE_SMALL_NUM = 5;
OVERSIZE_SMALL_STRING = "Oversize (Small)";
OVERSIZE_SMALL_STRING_SHORT = "S. Over";

OVERSIZE_MEDIUM_NUM = 6;
OVERSIZE_MEDIUM_STRING = "Oversize (Medium)";
OVERSIZE_MEDIUM_STRING_SHORT = "M. Over";

OVERSIZE_LARGE_NUM = 7;
OVERSIZE_LARGE_STRING = "Oversize (Large)";
OVERSIZE_LARGE_STRING_SHORT = "L. Over";

OVERSIZE_SPECIAL_NUM = 8;
OVERSIZE_SPECIAL_STRING = "Oversize (Special)";
OVERSIZE_SPECIAL_STRING_SHORT = "Special";

OVERSIZE_REGULAR_NUM = 9;
OVERSIZE_REGULAR_STRING = "Oversize (Regular)";
OVERSIZE_REGULAR_STRING_SHORT = "R. Over";

ENVOLPE_NUM = 10;
ENVOLPE_STRING = "Envelope";
ENVOLPE_STRING_SHORT = "Enve";

//Functions
function updateParameter(uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
        return uri + separator + key + "=" + value;
    }
}
//--------------------------------------------------------------------------------//
function escapeHTML(s) {
    return s != null ? s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;').trim() : "";
}
//--------------------------------------------------------------------------------//
function getParameter(name, url) {
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
    return results ? results[1] : null;
}
//--------------------------------------------------------------------------------//
//Convert all paramaters from url to array
function URLParamatersToArray(url) {
    var request = [];
    var pairs = url.substring(url.indexOf('?') + 1).split('&');
    for (var i = 0; i < pairs.length; i++) {
        if(!pairs[i])
            continue;
        var pair = pairs[i].split('=');
        request.push(decodeURIComponent(pair[0]));
    }
    return request;
}
//--------------------------------------------------------------------------------//
//Show no products screen
function showNoProductsScreen() {
    $("section.jsContainer #js-table").css("display", "none");
    $("section.jsContainer #extractResults").css("display", "none");
    $("section.jsContainer .export-section").css("display", "none");
    $("section.jsContainer #filterPopup").css("display", "none");
    $("section.jsContainer #trendPopup").css("display", "none");
    $("section.jsContainer .main-screen").css("display", "block");
}
//--------------------------------------------------------------------------------//
//Show products screen, that will show the tables and footer section in injected JS popup 
function showProductsScreen() {
    //Show next page
    if($("#js-table").attr("data-extractUrl")){
        $("section.jsContainer #extractResults").text("Extract Next Page");
        $("section.jsContainer #extractResults").fadeIn();
    }else{
        $("section.jsContainer #extractResults").css("display","none");
    }

    //Show trend element in the footer
    if($("#js-table").attr("data-searchTerm")){
        $("section.jsContainer #trendPopup").fadeIn();
    }else{
        $("section.jsContainer #trendPopup").css("display","none");
    }

    $("section.jsContainer .main-screen").css("display","none");
    $("section.jsContainer .export-section").fadeIn();
    $("section.jsContainer #filterPopup").fadeIn();
    $("section.jsContainer #js-table").fadeIn();
}
//--------------------------------------------------------------------------------//
//Sort table based on its id
function sortTable(table) {
    var store = [];
    for (var i = 0, len = table.rows.length; i < len; i++) {
        var row = table.rows[i];
        var sortnr = parseInt(row.id);
        if (!isNaN(sortnr)) store.push([sortnr, row]);
    }
    store.sort(function(x, y) {
        return x[0] - y[0];
    });
    for (var i = 0, len = store.length; i < len; i++) {
        $(store[i][1]).find("td:first").text(i + 1);
        $("section.jsContainer #js-table tbody").append($(store[i][1]).get(0));
    }
    store = null;
}
//--------------------------------------------------------------------------------//
//Add comma
function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}
//--------------------------------------------------------------------------------//
//Clean previous data of JS
function cleanJsPopup(){
    $("#js-table tbody tr").remove();
    $(".summary-result.js-avg-sales").html("<i class='none-info'>--</i>");
    $(".summary-result.js-avg-sales-rank").html("<i class='none-info'>--</i>");
    $(".summary-result.js-avg-price").html("<i class='none-info'>--</i>");
    $(".summary-result.js-avg-reviews").html("<i class='none-info'>--</i>");
    $("section.jsContainer #extractResults").html("<i class='none-info'>--</i>");
    reInitializeTableSorter(false);
}
//--------------------------------------------------------------------------------//
//To initial table sorter library
function reInitializeTableSorter(init) {
    $('section.jsContainer #js-table').unbind('appendCache applyWidgetId applyWidgets sorton update updateCell').removeClass('tablesorter').find('thead th').unbind('click mousedown').removeClass('header headerSortDown headerSortUp');
    $('section.jsContainer #js-table').stickyTableHeaders("destroy");
    
    if(init){
        $("section.jsContainer #js-table").tablesorter({
        textExtraction: function (node) {
                var txt = $(node).text();
                txt = txt.replace('N.A.', '');
                txt = txt.replace('hmm...', '');
                return txt;
            }
        });
        $("section.jsContainer #js-table").trigger("updateAll");
        currentScrollPosition = $('section.jsContainer .content-table').scrollTop();
        $('section.jsContainer .content-table').scrollTop(0);
        $('section.jsContainer #js-table').stickyTableHeaders({container: "section.jsContainer .content-table"});
        $('section.jsContainer .content-table').scrollTop(currentScrollPosition);  
        currentScrollPosition = null;
    }
}
//--------------------------------------------------------------------------------//
//Use sync storage
function syncStorage(key, value, callback) {
    var obj = {};
    var key = key;
    obj[key] += key;
    obj[key] = value;
    if(callback){
        chrome.storage.sync.set(obj,function(){
            callback.call(this);
        });
    }else{
        chrome.storage.sync.set(obj);
    }
}
//--------------------------------------------------------------------------------//
//Use local storage
function localStorage(key, value, callback) {
    var obj = {};
    var key = key;
    obj[key] += key;
    obj[key] = value;
    if(callback){
        chrome.storage.local.set(obj,function(){
            callback.call(this);
        });
    }else{
        chrome.storage.local.set(obj);
    }
}
//--------------------------------------------------------------------------------//
//return just any number
function pureNumber(number){
    if(number && typeof number == "string"){
        number = number.match(/[0-9.]/g);
        number = number ? number.join("") : "N.A.";
        return number;
    }else if(typeof number == "number"){
        return number;
    }
    else{
        return "N.A.";
    }
}
//--------------------------------------------------------------------------------//
//Check active/inactive columns based on options page
function areColumnsChanged(table) {
    var columnsChanged = false;
    var brandColumn = $(table).find("th.js-brand").hasClass("hidden") ? false : true;
    var priceColumn = $(table).find("th.js-price").hasClass("hidden") ? false : true;
    var categoryColumn = $(table).find("th.js-category").hasClass("hidden") ? false : true;
    var rankColumn = $(table).find("th.js-rank").hasClass("hidden") ? false : true;
    var estSalesColumn = $(table).find("th.js-est-sales").hasClass("hidden") ? false : true;
    var estRevenueColumn = $(table).find("th.js-est-revenue").hasClass("hidden") ? false : true;
    var reviewsColumn = $(table).find("th.js-reviews").hasClass("hidden") ? false : true;
    var ratingColumn = $(table).find("th.js-rating").hasClass("hidden") ? false : true;
    var bBsellerColumn = $(table).find("th.js-bb-seller").hasClass("hidden") ? false : true;
    var fbaFeeColumn = $(table).find("th.js-fba-fee").hasClass("hidden") ? false : true;
    var tierColumn = $(table).find("th.js-tier").hasClass("hidden") ? false : true;
    var newSellerColumn = $(table).find("th.js-new-sellers").hasClass("hidden") ? false : true;
    var itemLengthColumn = $(table).find("th.js-item-length").hasClass("hidden") ? false : true;
    var itemWidthColumn = $(table).find("th.js-item-width").hasClass("hidden") ? false : true;
    var itemHeightColumn = $(table).find("th.js-item-height").hasClass("hidden") ? false : true;
    var itemWeightColumn = $(table).find("th.js-item-weight").hasClass("hidden") ? false : true;
    var netColumn = $(table).find("th.js-net").hasClass("hidden") ? false : true;

    if (brandColumn != showBrandColumn || priceColumn != showPriceColumn || 
        categoryColumn != showCategoryColumn || rankColumn != showRankColumn || 
        estSalesColumn != showEstSalesColumn || estRevenueColumn != showEstRevenueColumn || 
        reviewsColumn != showReviewsColumn || ratingColumn != showRatingColumn || 
        bBsellerColumn != showBbSellerColumn || fbaFeeColumn != showFbaFeeColumn || 
        tierColumn != showTierColumn || newSellerColumn != showNewSellerColumn ||
        itemWidthColumn != showItemWidthColumn || itemHeightColumn != showItemHeightColumn || 
        itemLengthColumn != showItemLengthColumn || itemWeightColumn != showItemWeightColumn || netColumn != showNetColumn) {
        columnsChanged = true;
    } else {
        columnsChanged = false;
    }
    return columnsChanged;
}
//--------------------------------------------------------------------------------//
//Check active/inactive column to show
function refreshTableHeaders() {
    chrome.storage.sync.get(null, function(result) {
        if (result.columnBrand == "Y") {
            showBrandColumn = true;
        } else {
            $("#js-table th.js-brand").addClass("hidden");
            showBrandColumn = false;
        }
        if (result.columnPrice == "Y") {
            showPriceColumn = true;
        } else {
            $("#js-table th.js-price").addClass("hidden");
            showPriceColumn = false;
        }
        if (result.columnCategory == "Y") {
            showCategoryColumn = true;
        } else {
            $("#js-table th.js-category").addClass("hidden");
            showCategoryColumn = false;
        }
        if (result.columnRank == "Y") {
            showRankColumn = true;
        } else {
            $("#js-table th.js-rank").addClass("hidden");
            showRankColumn = false;
        }
        if (result.columnEstSales == "Y") {
            showEstSalesColumn = true;
        } else {
            $("#js-table th.js-est-sales").addClass("hidden");
            showEstSalesColumn = false;
        }
        if (result.columnEstRevenue == "Y") {
            showEstRevenueColumn = true;
        } else {
            $("#js-table th.js-est-revenue").addClass("hidden");
            showEstRevenueColumn = false;
        }
        if (result.columnNumReviews == "Y") {
            showReviewsColumn = true;
        } else {
            $("#js-table th.js-reviews").addClass("hidden");
            showReviewsColumn = false;
        }
        if (result.columnRating == "Y") {
            showRatingColumn = true;
        } else {
            $("#js-table th.js-rating").addClass("hidden");
            showRatingColumn = false;
        }
        if (result.columnBbSeller == "Y") {
            showBbSellerColumn = true;
        } else {
            $("#js-table th.js-bb-seller").addClass("hidden");
            showBbSellerColumn = false;
        }
        if (result.columnFbaFee == "Y") {
            showFbaFeeColumn = true;
        } else {
            $("#js-table th.js-fba-fee").addClass("hidden");
            showFbaFeeColumn = false;
        }
        if (result.columnTier == "Y") {
            showTierColumn = true;
        } else {
            $("#js-table th.js-tier").addClass("hidden");
            showTierColumn = false;
        }
        if (result.columnNewSeller == "Y") {
            showNewSellerColumn = true;
        } else {
            $("#js-table th.js-new-sellers").addClass("hidden");
            showNewSellerColumn = false;
        }
        if (result.columnItemWidth == "Y") {
            showItemWidthColumn = true;
        } else {
            $("#js-table th.js-item-width").addClass("hidden");
            showItemWidthColumn = false;
        }
        if (result.columnItemHeight == "Y") {
            showItemHeightColumn = true;
        } else {
            $("#js-table th.js-item-height").addClass("hidden");
            showItemHeightColumn = false;
        }
        if (result.columnItemLength == "Y") {
            showItemLengthColumn = true;
        } else {
            $("#js-table th.js-item-length").addClass("hidden");
            showItemLengthColumn = false;
        }
        if (result.columnItemWeight == "Y") {
            showItemWeightColumn = true;
        } else {
            $("#js-table th.js-item-weight").addClass("hidden");
            showItemWeightColumn = false;
        }
        if (result.columnNet == "Y") {
            showNetColumn = true;
        } else {
            $("#js-table th.js-net").addClass("hidden");
            showNetColumn = false;
        }
    });
}

//----------------------------------------------------//
//Render all header boxes
var renderHeaderBoxes = function(){
    //Current results
    var rowsNumber = $("#js-table tbody tr:visible").length;
    $(".summary-result.js-results").text("1-"+rowsNumber);
    
    //Get average variables
    var sales = 0;
    var salesAvg = 0;
    var salesCounter = 0;

    var rank = 0;
    var rankAvg = 0;
    var rankCounter = 0;

    var price = 0;
    var priceAvg = 0;
    var priceCounter = 0;

    var reviews = 0;
    var reviewsAvg = 0;
    var reviewsCounter = 0;

    //Get average Sales
    if(rowsNumber > 0){
        $("#js-table tbody tr:visible").each(function(index, val) {
            //Sales average
            if(showEstSalesColumn){
                sales = $(val).attr("data-estsales");
                if(sales && !isNaN(sales)){
                    sales = parseInt(sales);
                    salesAvg = (salesAvg + sales);
                    ++salesCounter;
                }
            }

            //Rank average
            if(showRankColumn){
                rank = $(val).attr("data-rank");
                if(rank && !isNaN(rank)){
                    rank = parseInt(rank);
                    rankAvg = (rankAvg + rank);
                    ++rankCounter;
                }
            }

            //Price average
            if(showPriceColumn){
                price = $(val).attr("data-price");
                if(price && !isNaN(price)){
                    price = parseFloat(price);
                    priceAvg = (priceAvg + price);
                    ++priceCounter;
                }
            }

            //Reviews average
            if(showReviewsColumn){
                reviews = $(val).attr("data-reviews");
                if(reviews && !isNaN(reviews)){
                    reviews = parseInt(reviews);
                    reviewsAvg = (reviewsAvg + reviews);
                    ++reviewsCounter;
                }
            }
        }); //End for loop

        //Avg est. sales
        if(showEstSalesColumn){
            var salesAvg = salesAvg/salesCounter;
            salesAvg = Math.round(salesAvg.toFixed(2));
            salesAvg = numberWithCommas(salesAvg);
            $(".summary-result.js-avg-sales").text(salesAvg);
            $(".summary-result.js-avg-sales").attr("title", salesAvg);
        }

        //Avg Rank
        if(showRankColumn){
            var rankAvg = rankAvg/rankCounter;
            rankAvg = Math.round(rankAvg.toFixed(2));
            rankAvg = numberWithCommas(rankAvg);
            $(".summary-result.js-avg-sales-rank").text(rankAvg);
        }

        //Avg Prices
        if(showPriceColumn){
            var priceAvg = priceAvg/priceCounter;
            priceAvg = numberWithCommas(priceAvg.toFixed(2));
            $(".summary-result.js-avg-price").text(currentCurrency+priceAvg);
        }

        //Avg Reviews
        if(showReviewsColumn){
            var reviewsAvg = reviewsAvg/reviewsCounter;
            reviewsAvg = Math.round(reviewsAvg.toFixed(2));
            reviewsAvg = numberWithCommas(reviewsAvg);
            $(".summary-result.js-avg-reviews").text(reviewsAvg);
        }
    } else{
        $(".summary-result.js-avg-sales").html("<i class='none-info'>--</i>");
        $(".summary-result.js-avg-sales-rank").html("<i class='none-info'>--</i>");
        $(".summary-result.js-avg-reviews").html("<i class='none-info'>--</i>");
        $(".summary-result.js-avg-price").html("<i class='none-info'>--</i>");
    }
}
//--------------------------------------------------------------------------------//
//Responsible to get next pages of Amazon
function Pagination(resultsRow){
    var allResultsNumber = 0;
    var currentPage = 1;
    var nextResult = "N.A.";

    if(resultsRow){
        //All results number
        allResultsNumber = $(resultsRow).find(".pagnDisabled:last").text();
        if(allResultsNumber.length === 0){
            allResultsNumber = $(resultsRow).find(".pagnLink:last").text();
        }

        //Current page
        currentPage = $(resultsRow).find(".pagnCur:last").text();

        //Nect Result
        nextResult = $(resultsRow).find(".pagnCur:last").next().text();
    }

    var getAllResultsNumber = function (){
        return allResultsNumber;
    }
    var getCurrentPage = function(){
        return currentPage;
    }
    var getNextResult = function(){
        return nextResult;
    }

    return{
        getAllResultsNumber:getAllResultsNumber,
        getCurrentPage:getCurrentPage,
        getNextResult:getNextResult
    }
}
//--------------------------------------------------------------------------------//
//Hide all opened popups, either true or selector string
function hidePopups(hideAll){
    if(typeof hideAll == "boolean" && hideAll){
        $(".js-options-section, .js-filter-section, .js-trend-chart-section, .js-product-history-section, .js-profit-calc-section").css("display","none");
    }else if(typeof hideAll == "string"){
        $(hideAll).css("display","none");
    }
}

//----------------------------------------------------//
//return FBA fee and tier for US
function USFbaFeeAndTier(category, price, length, width, height, weight){
    var theCategory = category;
    var thePrice = pureNumber(price); //I need just the number

    var firstMethodCategories = ["Books", "Music", "Videos", "Albums", "Video Games", "Movies & TV" ,"Software"];
    var theFbaFee = "N.A.";
    var theTotalFbaFee = "N.A.";
    var theTier = "N.A.";
    var theFullTierDescription = "N.A.";
    var theTierNumber = 0;
    var referralFee = 0.00;
    var closingFee = 0.00;
    var dimensionArrayAsc = [length, width, height];
    dimensionArrayAsc = dimensionArrayAsc.sort(function(a, b){return a-b});//Sort in ASC
    
    var smallestValue = parseFloat(dimensionArrayAsc[0]);
    var mediumValue = parseFloat(dimensionArrayAsc[1]);
    var largestValue = parseFloat(dimensionArrayAsc[2]);
    var weight = parseFloat(weight);
    var tierWeight = null;
    var UW = weight;

    var completeProcess = !isNaN(weight) && !isNaN(smallestValue) && !isNaN(mediumValue) && !isNaN(largestValue) ? true : false;
    thePrice = parseFloat(thePrice);

    //Round all values
    if(completeProcess){
        smallestValue = Math.round(smallestValue);
        mediumValue = Math.round(mediumValue);
        largestValue = Math.round(largestValue);
    } //End if complete process

    //Complete the proccess to get the tier
    if(completeProcess && $.inArray(theCategory, firstMethodCategories) != -1){
        //Get the tier value
        if(largestValue <= 15 && mediumValue <= 12 && smallestValue <= 0.75 && weight <= 0.875){
            theTier = STANDARD_SMALL_STRING_SHORT;
            theFullTierDescription = STANDARD_SMALL_STRING;
            theTierNumber = STANDARD_SMALL_NUM;
        }
        else if(largestValue <= 18 && mediumValue <= 14 && smallestValue <= 8 && weight <= 20){
            theTier = STANDARD_LARGE_STRING_SHORT;
            theFullTierDescription = STANDARD_LARGE_STRING;
            theTierNumber = STANDARD_LARGE_NUM;
        }
        else if(largestValue <= 60 && mediumValue <= 30 && ( largestValue + (2 * mediumValue) + (2 * largestValue)) <= 130 && tierWeight <= 70){
            theTier = OVERSIZE_SMALL_STRING_SHORT;
            theFullTierDescription = OVERSIZE_SMALL_STRING;
            theTierNumber = OVERSIZE_SMALL_NUM;
        }
        else if(largestValue <= 108 && ( largestValue + (2 * mediumValue) + (2 * smallestValue)) <= 130 && tierWeight <= 150){
            theTier = OVERSIZE_MEDIUM_STRING_SHORT;
            theFullTierDescription = OVERSIZE_MEDIUM_STRING;
            theTierNumber = OVERSIZE_MEDIUM_NUM;
        }
        else if(largestValue <= 108 && ( largestValue + (2 * mediumValue) + (2 * smallestValue)) <= 165 && tierWeight <= 150){
            theTier = OVERSIZE_LARGE_STRING_SHORT;
            theFullTierDescription = OVERSIZE_LARGE_STRING;
            theTierNumber = OVERSIZE_LARGE_NUM;
        }
        else{
            theTier = OVERSIZE_SPECIAL_STRING_SHORT;
            theFullTierDescription = OVERSIZE_SPECIAL_STRING;
            theTierNumber = OVERSIZE_SPECIAL_NUM;
        }
                    
        //Get the FBA fees
        if(!isNaN(thePrice)){
            //STANDARD_SMALL_STRING
            if(theTierNumber == STANDARD_SMALL_NUM){
                theFbaFee = 2.41;
            }
            //STANDARD_LARGE_STRING
            else if(theTierNumber == STANDARD_LARGE_NUM){
                if(UW <= 1){
                    theFbaFee = 2.99;
                } else if(UW > 1 && UW < 2){
                    theFbaFee = 4.18;
                } else {
                    theFbaFee = 4.18 + (0.39 * (UW - 2));
                }
            }
            //OVERSIZE_SMALL_STRING
            else if(theTierNumber == OVERSIZE_SMALL_NUM){
                theFbaFee = 6.85 + (0.39 * (UW - 2));
            }
            //OVERSIZE_MEDIUM_STRING
            else if(theTierNumber == OVERSIZE_MEDIUM_NUM){
                theFbaFee = 9.2 + (0.39 * (UW - 2));
            }
            //OVERSIZE_LARGE_STRING
            else if(theTierNumber == OVERSIZE_LARGE_NUM){
                theFbaFee = 75.06 + (0.8 * (UW - 90));
            }
            //OVERSIZE_SPECIAL_STRING
            else if(theTierNumber == OVERSIZE_SPECIAL_NUM){
                theFbaFee = 138.08 + (0.92 * (UW - 90));
            } else{
                theFbaFee = 0.00;
            }

            //Get the final FBA Fee
            referralFee = (thePrice * 0.15);

            //Closing Fee
            theClosingFee = 1.8;

            theTotalFbaFee = theFbaFee + referralFee + theClosingFee;
            theTotalFbaFee = theTotalFbaFee.toFixed(2);
        }//End if we have a price
    }//End if the category is listed and start method two
    else if(completeProcess){
        //Get the tier value
        if(largestValue <= 15 && mediumValue <= 12 && smallestValue <= 0.75 && weight <= 0.75){
            theTier = STANDARD_SMALL_STRING_SHORT;
            theFullTierDescription = STANDARD_SMALL_STRING;
            theTierNumber = STANDARD_SMALL_NUM;
        }
        else if(largestValue <= 18 && mediumValue <= 14 && smallestValue <= 8 && weight <= 20){
            theTier = STANDARD_LARGE_STRING_SHORT;
            theFullTierDescription = STANDARD_LARGE_STRING;
            theTierNumber = STANDARD_LARGE_NUM;
        }
        else if(largestValue <= 60 && mediumValue <= 30 && ( largestValue + (2 * mediumValue) + (2 * largestValue)) <= 130 && tierWeight <= 70){
            theTier = OVERSIZE_SMALL_STRING_SHORT;
            theFullTierDescription = OVERSIZE_SMALL_STRING;
            theTierNumber = OVERSIZE_SMALL_NUM;
        }
        else if(largestValue <= 108 && ( largestValue + (2 * mediumValue) + (2 * smallestValue)) <= 130 && tierWeight <= 150){
            theTier = OVERSIZE_MEDIUM_STRING_SHORT;
            theFullTierDescription = OVERSIZE_MEDIUM_STRING;
            theTierNumber = OVERSIZE_MEDIUM_NUM;
        }
        else if(largestValue <= 108 && ( largestValue + (2 * mediumValue) + (2 * smallestValue)) <= 165 && tierWeight <= 150){
            theTier = OVERSIZE_LARGE_STRING_SHORT;
            theFullTierDescription = OVERSIZE_LARGE_STRING;
            theTierNumber = OVERSIZE_LARGE_NUM;
        }
        else {
            theTier = OVERSIZE_SPECIAL_STRING_SHORT;
            theFullTierDescription = OVERSIZE_SPECIAL_STRING;
            theTierNumber = OVERSIZE_SPECIAL_NUM;
        }

        //Get the FBA fees
        if(!isNaN(thePrice)){
            //STANDARD_SMALL_STRING
            if(theTierNumber == STANDARD_SMALL_NUM){
                theFbaFee = 2.41;
            }
            //STANDARD_LARGE_STRING
            else if(theTierNumber == STANDARD_LARGE_NUM){
                if (UW <= 1){
                    theFbaFee = 2.99;
                } else if(UW > 1 && UW < 2){
                    theFbaFee = 4.18;
                } else{
                    theFbaFee = 4.18 + (0.39 * (UW - 2));
                }
            }
            //OVERSIZE_SMALL_STRING
            else if(theTierNumber == OVERSIZE_SMALL_NUM){
                theFbaFee = 6.85 + (0.39 * (UW - 2));
            }
            //OVERSIZE_MEDIUM_STRING
            else if(theTierNumber == OVERSIZE_MEDIUM_NUM){
                theFbaFee = 9.2 + (0.39 * (UW - 2));
            }
            //OVERSIZE_LARGE_STRING
            else if(theTierNumber == OVERSIZE_LARGE_NUM){
                theFbaFee = 75.06 + (0.8 * (UW - 90));
            }
            //OVERSIZE_SPECIAL_STRING
            else if(theTierNumber == OVERSIZE_SPECIAL_NUM){
                theFbaFee = 138.08 + (0.92 * (UW - 90));
            } else {
                theFbaFee = 0.00;
            }

            //Get the final FBA Fee
            if(theCategory == "Camera & Photo"){
                referralFee = thePrice * 0.08;
                if( referralFee < 1.00){
                    referralFee = 1.00;
                }
            } else if(theCategory == "Automotive" || theCategory == "Industrial & Scientific"){
                referralFee = thePrice * 0.12;
                if(referralFee < 1.00){
                    referralFee = 1.00;
                }
            } else if(theCategory == "Grocery & Gourmet Food"){
                referralFee = thePrice * 0.15;
            } else if(theCategory == "Jewelry"){
                referralFee = thePrice * 0.20;
                if(referralFee < 2.00){
                    referralFee = 2.00;
                }
            } else if(theCategory == "Watches"){
                referralFee = thePrice * 0.16;
                if(referralFee < 2.00){
                    referralFee = 2.00;
                }
            } else {
                referralFee = thePrice * 0.15;
                if( referralFee < 1.00){
                    referralFee = 1.00;
                }
            }
            theTotalFbaFee = theFbaFee + referralFee;
            theTotalFbaFee = theTotalFbaFee.toFixed(2);
            theFbaFee = theFbaFee.toFixed(2);
        }//End if we have a price
    }//End if other categories

    return {theTier: theTier, theFullTierDescription:theFullTierDescription, theTotalFbaFee:theTotalFbaFee, theFbaFee:theFbaFee, theReferralFee: referralFee, theClosingFee:closingFee}
}
//----------------------------------------------------//
//return FBA fee and tier for UK
function UKFbaFeeAndTier(category, price, length, width, height, weight){
    var theCategory = category;
    var thePrice = pureNumber(price); //I need just the number

    var firstMethodCategories = ["Books", "Music", "PC & Video Games", "DVD", "DVD & Blu-ray", "Video Games", "Software"];
    var theFbaFee = "N.A.";
    var theTotalFbaFee = "N.A.";
    var theTier = "N.A.";
    var theFullTierDescription = "N.A.";
    var theTierNumber = 0;
    var referralFee = 0.00;
    var closingFee = 0.00;
    var dimensionArrayAsc = [length, width, height];
    dimensionArrayAsc = dimensionArrayAsc.sort(function(a, b){return a-b});//Sort in ASC
    
    //Convert from inch to cm
    var smallestValue = parseFloat(dimensionArrayAsc[0] * 2.54);
    var mediumValue = parseFloat(dimensionArrayAsc[1] * 2.54);
    var largestValue = parseFloat(dimensionArrayAsc[2] * 2.54);
    
    //Conver pound to gram
    var weight = parseFloat(weight * 453.592);
    var tierWeight = null;

    var completeProcess = !isNaN(weight) && !isNaN(smallestValue) && !isNaN(mediumValue) && !isNaN(largestValue) ? true : false;
    thePrice = parseFloat(thePrice);
    
    //Round all values
    if(completeProcess){
        smallestValue = Math.round(smallestValue);
        mediumValue = Math.round(mediumValue);
        largestValue = Math.round(largestValue);
    }//End of complete process

    //Complete the proccess to get the tier
    if(completeProcess && $.inArray( theCategory, firstMethodCategories) != -1){
        //Get the tier value
        if(largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900){
            theTier = STANDARD_STRING_SHORT;
            theFullTierDescription = STANDARD_STRING;
            theTierNumber = STANDARD_NUM;
        }
        else{
            theTier = OVERSIZE_STRING_SHORT;
            theFullTierDescription = OVERSIZE_STRING;
            theTierNumber = OVERSIZE_NUM;
        }
                    
        //Get the FBA fees
        if(!isNaN(thePrice)){
            //S. Stand
            if(theTierNumber == STANDARD_NUM){
                if(thePrice <= 300){
                    if(largestValue <= 20 && mediumValue <= 15 && smallestValue <= 1 && weight <= 80){
                        theFbaFee = 0.66;
                    }else if(largestValue <= 33 && mediumValue <= 23 && smallestValue <= 2.5 && weight <= 460){
                        if(weight <= 60){
                            theFbaFee = 0.71;
                        }else if(weight <= 210){
                            theFbaFee = 0.75;
                        }else if(weight <= 460){
                            theFbaFee = 0.97;
                        } else {
                            theFbaFee = 0.00;
                        }
                    }else if(largestValue <= 33 && mediumValue <= 23 && smallestValue <= 5 && weight <= 960){ 
                        theFbaFee = 1.41;
                    }else if(largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900){
                        if(weight <= 150){
                            theFbaFee = 1.36;
                        }else if(weight <= 400){
                            theFbaFee = 1.39;
                        }else if(weight <= 900){
                            theFbaFee = 1.43;
                        }else if(weight <= 1400){
                            theFbaFee = 1.71;
                        }else if(weight <= 1900){
                            theFbaFee = 1.88;
                        }else if(weight <= 2900){
                            theFbaFee = 2.94;
                        }else if(weight <= 4900){
                            theFbaFee = 2.99;
                        }else if(weight <= 11900){
                            theFbaFee = 3.33;
                        } else {
                            theFbaFee = 0.00;
                        }
                    }
                } else {
                    theFbaFee = 0.00;
                }
                theTier = STANDARD_STRING_SHORT;
                theFullTierDescription = STANDARD_STRING;
            } 
            //Oversize
            else if(theTierNumber == OVERSIZE_NUM){
                //S. Over
                if(largestValue <= 61 && mediumValue <= 46 && smallestValue <= 46 && weight <= 1760){
                    if(weight <= 760){
                        theFbaFee = 2.97;
                    }else if(weight <= 1010){
                        theFbaFee = 3.32;
                    }else if(weight <= 1260){
                        theFbaFee = 3.58;
                    }else if(weight <= 1510){
                        theFbaFee = 3.65;
                    }else if(weight <= 1760){
                        theFbaFee = 3.70;
                    }else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_SMALL_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_SMALL_STRING;
                } 
                //R. Over
                else if(largestValue <= 120 && mediumValue <= 60 && smallestValue <= 60 && weight <= 29760){
                    if(weight <= 760){
                        theFbaFee = 3.79;
                    }else if(weight <= 1760){
                        theFbaFee = 4.05;
                    }else if(weight <= 2760){
                        theFbaFee = 4.14;
                    }else if(weight <= 3760){
                        theFbaFee = 4.17;
                    }else if(weight <= 4760){
                        theFbaFee = 4.20;
                    }else if(weight <= 5760){
                        theFbaFee = 4.96;
                    }else if(weight <= 6760){
                        theFbaFee = 5.01;
                    }else if(weight <= 8760){
                        theFbaFee = 5.04;
                    }else if(weight <= 9760){
                        theFbaFee = 5.06;
                    }else if(weight <= 14760){
                        theFbaFee = 5.39;
                    }else if(weight <= 19760){
                        theFbaFee = 5.66;
                    }else if(weight <= 29760){
                        theFbaFee = 6.27;
                    }else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_REGULAR_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_REGULAR_STRING;
                } 
                //L. Over
                else if(largestValue > 120 || mediumValue > 60 || smallestValue > 60){
                    if(weight <= 4760){
                        theFbaFee = 4.69;
                    }else if(weight <= 9760){
                        theFbaFee = 5.66;
                    }else if(weight <= 14760){
                        theFbaFee = 5.98;
                    }else if(weight <= 19760){
                        theFbaFee = 6.27;
                    }else if(weight <= 24760){
                        theFbaFee = 6.84;
                    }else if(weight <= 29760){
                        theFbaFee = 6.85;
                    }else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_LARGE_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_LARGE_STRING;
                } else {
                    theFbaFee = 0.00;
                }
            }

            //Get the referral fee
            if (theCategory == "Books" || theCategory == "Music" || theCategory == "DVD" || theCategory == "DVD & Blu-ray" 
                || theCategory == "PC & Video Games" || theCategory == "Software"){
                referralFee = (thePrice * 0.15);
            } else {
                referralFee = (thePrice * 0.15);
                if(referralFee < 0.40){
                    referralFee = 0.40;
                }
            }

            //Calculate Variable Closing Fee
            if (theCategory == "Books"){
                closingFee = 0.43;
            }else if(theCategory == "Music"){
                closingFee = 0.24;
            }else if(theCategory == "DVD" || theCategory == "DVD & Blu-ray"){
                closingFee = 0.14;
            }

            //Final FBA Fees
            theTotalFbaFee = theFbaFee + referralFee + closingFee;
            theTotalFbaFee = theTotalFbaFee.toFixed(2);
        }//End if we have a price
    }//End if the category is listed and start method two
    else if(completeProcess){
        //Get the tier value
        if(largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900){
            theTier = STANDARD_STRING_SHORT;
            theFullTierDescription = STANDARD_STRING;
            theTierNumber = STANDARD_NUM;
        }
        else {
            theTier = OVERSIZE_STRING_SHORT;
            theFullTierDescription = OVERSIZE_STRING;
            theTierNumber = OVERSIZE_NUM;
        }

        //Get the FBA fees
        if(!isNaN(thePrice)){
            //Stand
            if(theTierNumber == STANDARD_NUM){
                if(thePrice <= 300){
                    if(largestValue <= 23 && mediumValue <= 15.5 && smallestValue <= 0.4 && weight <= 92){
                        theFbaFee = 0.60;
                    }else if(largestValue <= 30 && mediumValue <= 22 && smallestValue <= 2.4 && weight <= 225){
                        theFbaFee = 1.05;
                    }else if(largestValue <= 20 && mediumValue <= 15 && smallestValue <= 1 && weight <= 80 ){ 
                        theFbaFee = 1.07;
                    }else if(largestValue <= 33 && mediumValue <= 23 && smallestValue <= 2.5 && weight <= 460){
                        if(weight <= 60){
                            theFbaFee = 1.19;
                        } else if(weight <= 210){
                            theFbaFee = 1.31;
                        } else if(weight <= 460){
                            theFbaFee = 1.51;
                        } else {
                            theFbaFee = 0.00;
                        }
                    }else if(largestValue <= 33 && mediumValue <= 23 && smallestValue <= 5 && weight <= 960 ){ 
                        theFbaFee = 1.70;
                    }else if(largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900){
                        if(weight <= 150){
                            theFbaFee = 1.66;
                        } else if(weight <= 400){
                            theFbaFee = 1.72;
                        } else if(weight <= 900){
                            theFbaFee = 1.77;
                        } else if(weight <= 1400){
                            theFbaFee = 2.19;
                        } else if(weight <= 1900){
                            theFbaFee = 2.41;
                        } else if(weight <= 2900){
                            theFbaFee = 3.30;
                        } else if(weight <= 4900){
                            theFbaFee = 3.40;
                        } else if(weight <= 6900){
                            theFbaFee = 3.45;
                        } else if(weight <= 10900){
                            theFbaFee = 3.53;
                        } else if(weight <= 11900){
                            theFbaFee = 3.54;
                        } else {
                            theFbaFee = 0.00;
                        }
                    }
                }else{
                    theFbaFee = 0.00;
                }
                theTier = STANDARD_STRING_SHORT;
                theFullTierDescription = STANDARD_STRING;
            } 
            //Oversize
            else if(theTierNumber == OVERSIZE_NUM){
                if(largestValue <= 61 && mediumValue <= 46 && smallestValue <= 46 && weight <= 1760){
                    if(weight <= 760){
                        theFbaFee = 2.97;
                    }else if(weight <= 1010){
                        theFbaFee = 3.32;
                    }else if(weight <= 1260){
                        theFbaFee = 3.58;
                    }else if(weight <= 1510){
                        theFbaFee = 3.65;
                    }else if(weight <= 1760){
                        theFbaFee = 3.70;
                    } else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_SMALL_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_SMALL_STRING;
                }else if(largestValue <= 120 && mediumValue <= 60 && smallestValue <= 60 && weight <= 29760){
                    if(weight <= 760){
                        theFbaFee = 3.79;
                    }else if(weight <= 1760){
                        theFbaFee = 4.05;
                    }else if(weight <= 2760){
                        theFbaFee = 4.14;
                    }else if(weight <= 3760){
                        theFbaFee = 4.17;
                    }else if(weight <= 4760){
                        theFbaFee = 4.20;
                    }else if(weight <= 5760){
                        theFbaFee = 4.96;
                    }else if(weight <= 6760){
                        theFbaFee = 5.01;
                    }else if(weight <= 8760){
                        theFbaFee = 5.04;
                    }else if(weight <= 9760){
                        theFbaFee = 5.06;
                    }else if(weight <= 14760){
                        theFbaFee = 5.39;
                    }else if(weight <= 19760){
                        theFbaFee = 5.66;
                    }else if(weight <= 29760){
                        theFbaFee = 6.27;
                    }else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_REGULAR_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_REGULAR_STRING;
                }
                //L. Over
                else if(largestValue > 120 || mediumValue > 60 || smallestValue > 60){
                    if(weight <= 4760){
                        theFbaFee = 4.69;
                    }else if(weight <= 9760){
                        theFbaFee = 5.66;
                    }else if(weight <= 14760){
                        theFbaFee = 5.98;
                    }else if(weight <= 19760){
                        theFbaFee = 6.27;
                    }else if(weight <= 24760){
                        theFbaFee = 6.84;
                    }else if(weight <= 29760){
                        theFbaFee = 6.85;
                    } else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_LARGE_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_LARGE_STRING;
                } else {
                    theFbaFee = 0.00;
                }
            }

            //Get the referral fee
            if(theCategory == "DIY & Tools" || theCategory == "Musical Instruments"){
                referralFee = (thePrice * 0.12);
                if(referralFee < 0.40){
                    referralFee = 0.40;
                }
            } else if(theCategory == "Computers" || theCategory == "Electronics" || theCategory == "Large Appliances"){
                referralFee = (thePrice * 0.07);
                if(referralFee < 0.40){
                    referralFee = 0.40;
                }
            } else if(theCategory == "PC & Video Games"){
                referralFee = (thePrice * 0.08);
            } else{
                referralFee = (thePrice * 0.15);
                if(referralFee < 0.40){
                    referralFee = 0.40;
                }
            }

            //Final FBA Fees
            theTotalFbaFee = theFbaFee + referralFee + closingFee;
            theTotalFbaFee = theTotalFbaFee.toFixed(2);
            theFbaFee = theFbaFee.toFixed(2);
        }//End if we have a price
    }//Other categories
    
    return {theTier: theTier, theFullTierDescription:theFullTierDescription, theTotalFbaFee:theTotalFbaFee, theFbaFee:theFbaFee, theReferralFee: referralFee, theClosingFee:closingFee}
}

//----------------------------------------------------//
//return FBA fee and tier for CA
function CAFbaFeeAndTier(category, price, length, width, height, weight){
    var theCategory = category;
    var thePrice = pureNumber(price); //I need just the number

    var firstMethodCategories = ["Books", "Music", "Video Games", "DVD", "DVD & Blu-ray", "Software"];
    var theFbaFee = "N.A.";
    var theTotalFbaFee = "N.A.";
    var theTier = "N.A.";
    var theFullTierDescription = "N.A.";
    var theTierNumber = 0;
    var referralFee = 0.00;
    var closingFee = 0.00;
    var dimensionArrayAsc = [length, width, height];
    dimensionArrayAsc = dimensionArrayAsc.sort(function(a, b){return a-b});//Sort in ASC
    
    //Convert from inch to cm
    var smallestValue = parseFloat(dimensionArrayAsc[0] * 2.54);
    var mediumValue = parseFloat(dimensionArrayAsc[1] * 2.54);
    var largestValue = parseFloat(dimensionArrayAsc[2] * 2.54);
    
    //Conver pound to gram
    var weight = parseFloat(weight * 453.592);
    var tierWeight = null;
    var UW = weight;
    var DW = ((largestValue * mediumValue * smallestValue)/6);
    DW = parseFloat(DW);
    if(UW > DW){
        tierWeight = UW;
    }else{
        tierWeight = DW;
    }

    var completeProcess = !isNaN(weight) && !isNaN(smallestValue) && !isNaN(mediumValue) && !isNaN(largestValue) ? true : false;
    thePrice = parseFloat(thePrice);
    
    //Round all values
    if(completeProcess){
        smallestValue = Math.round(smallestValue);
        mediumValue = Math.round(mediumValue);
        largestValue = Math.round(largestValue);
    }

    //Complete the proccess to get the tier
    if(completeProcess && $.inArray( theCategory, firstMethodCategories) != -1){
        //Get the tier value
        if(largestValue <= 38 && mediumValue <= 27 && smallestValue <= 2 && weight <= 460) {
            theTier = ENVOLPE_STRING_SHORT;
            theFullTierDescription = ENVOLPE_STRING;
            theTierNumber = ENVOLPE_NUM;
        }
        else if(largestValue <= 45 && mediumValue <= 35 && smallestValue <= 20 && weight <= 8900) {
            theTier = STANDARD_STRING_SHORT;
            theFullTierDescription = STANDARD_STRING;
            theTierNumber = STANDARD_NUM;
        }
        else if(largestValue > 270 || (largestValue + (2 * mediumValue) + (2 * smallestValue)) > 419 || weight > 68760) {
            theTier = OVERSIZE_SPECIAL_STRING_SHORT;
            theFullTierDescription = OVERSIZE_SPECIAL_STRING;
            theTierNumber = OVERSIZE_SPECIAL_NUM;
        } 
        else {
            theTier = OVERSIZE_STRING_SHORT;
            theFullTierDescription = OVERSIZE_STRING;
            theTierNumber = OVERSIZE_NUM;
        }
        
        //Get the FBA fees
        if(!isNaN(thePrice)){
            if(theTierNumber == ENVOLPE_NUM){
                var outboundweight = (weight + 40);
                if(outboundweight <= 100){
                    theFbaFee = 1.90;
                } else {
                    theFbaFee = 1.90 + (0.25 * (Math.round((outboundweight - 100)/100)));
                }
            } else if(theTierNumber == STANDARD_NUM){ 
                var outboundweight = (weight + 100);
                if(outboundweight <= 500){
                    theFbaFee = 3.75;
                } else {
                    theFbaFee = 3.75 + (0.37 * (Math.round((outboundweight - 500)/500)));
                }
            } else if(theTierNumber == OVERSIZE_SPECIAL_NUM){ 
                    theFbaFee = 125;
            } else if(theTierNumber == OVERSIZE_NUM){ 
                var outboundweight = (weight + 240);
                if(outboundweight <= 500){
                    theFbaFee = 3.75;
                } else {
                    theFbaFee = 3.75 + (0.37 * (Math.round((outboundweight - 500)/500)));
                }
            }

            //Get the referral fee
            referralFee = (thePrice * 0.15);

            //Calculate Variable Closing Fee
            if (theCategory == "Books"){
                closingFee = 0.24;
            }else if(theCategory == "Music" || theCategory == "DVD" || theCategory == "DVD & Blu-ray"){
                closingFee = 1.09;
            }else if(theCategory == "Video Games" || theCategory == "Software"){
                closingFee = 1.35;
            }

            //Final FBA Fees
            theTotalFbaFee = theFbaFee + referralFee + closingFee;
            theTotalFbaFee = theTotalFbaFee.toFixed(2);
        }//End if we have a price
    }//End if the category is listed and start method two
    else if(completeProcess){
        //Get the tier value
        if(largestValue <= 38 && mediumValue <= 27 && smallestValue <= 2 && weight <= 460){
            theTier = ENVOLPE_STRING_SHORT;
            theFullTierDescription = ENVOLPE_STRING;
            theTierNumber = ENVOLPE_NUM;
        }
        else if(largestValue <= 45 && mediumValue <= 35 && smallestValue <= 20 && weight <= 8900) {
            theTier = STANDARD_STRING_SHORT;
            theFullTierDescription = STANDARD_STRING;
            theTierNumber = STANDARD_NUM;
        } 
        else if(largestValue > 270 || (largestValue + (2*mediumValue) + (2*smallestValue)) > 419 || weight > 68760) {
            theTier = OVERSIZE_SPECIAL_STRING_SHORT;
            theFullTierDescription = OVERSIZE_SPECIAL_STRING;
            theTierNumber = OVERSIZE_SPECIAL_NUM;
        } 
        else {
            theTier = OVERSIZE_STRING_SHORT;
            theFullTierDescription = OVERSIZE_STRING;
            theTierNumber = OVERSIZE_NUM;
        }

        //Get the FBA fees
        if(!isNaN(thePrice)){
            if(theTierNumber == ENVOLPE_NUM){
                var outboundweight = (weight + 40);
                if(outboundweight <= 100){
                    theFbaFee = 1.90;
                } else {
                    theFbaFee = 1.90 + (0.25 * (Math.round((outboundweight - 100)/100)));
                }
            } else if(theTierNumber == STANDARD_NUM){ 
                var outboundweight = (weight + 100);
                if(outboundweight <= 500){
                    theFbaFee = 3.75;
                } else {
                    theFbaFee = 3.75 + (0.37 * (Math.round((outboundweight - 500)/500)));
                }
            } else if(theTierNumber == OVERSIZE_SPECIAL_NUM){ 
                    theFbaFee = 125;
            } else if(theTierNumber == OVERSIZE_NUM){ 
                var outboundweight = (weight + 240);
                if(outboundweight <= 500){
                    theFbaFee = 3.75;
                } else {
                    theFbaFee = 3.75 + (0.37 * (Math.round((outboundweight - 500)/500)));
                }
            }

            //Get the referral fee & closing fee
            if(theCategory == "Computers"){
                closingFee = 0.30 + 0.12 * (weight/1000);
                referralFee = (thePrice * 0.06);
                if(referralFee < 1.00){
                    referralFee = 1.00;
                }
            } else if(theCategory == "Automotive" || theCategory == "Tools & Home Improvement"){
                closingFee = 0.60 + 0.24 * (weight/1000);
                referralFee = (thePrice * 0.12);
                if(referralFee < 1.00){
                    referralFee = 1.00;
                }
            } else if(theCategory == "Electronics"){
                closingFee = 0.40 + 0.16 * (weight/1000);
                if(thePrice <= 100){
                    referralFee = (thePrice * 0.15);
                    if(referralFee < 1.00){
                        referralFee = 1.00;
                    }
                } else {
                    referralFee = 15 + (thePrice * 0.08);
                }
            } else if(theCategory == "Grocery & Gourmet Food"){
                referralFee = thePrice * 0.15;
            } else if(theCategory == "Jewelry"){
                closingFee = 1.00 + 0.40 * (weight/1000);
                referralFee = (thePrice * 0.20);
                if(referralFee < 2){
                    referralFee = 2;
                }
            } else if(theCategory == "Watches"){
                closingFee = 0.00
                referralFee = (thePrice * 0.15);
                if(referralFee < 2.00){
                    referralFee = 2.00;
                }
            } else{
                closingFee = 0.75 + 0.30 * (weight/1000);
                referralFee = (thePrice * 0.15);
                if(referralFee < 1.00){
                    referralFee = 1.00;
                }
            }

            //Final FBA Fees
            theTotalFbaFee = theFbaFee + referralFee + closingFee;
            theTotalFbaFee = theTotalFbaFee.toFixed(2);
            theFbaFee = theFbaFee.toFixed(2);
        }//End if we have a price
    }//Other categories
    
    return {theTier: theTier, theFullTierDescription:theFullTierDescription, theTotalFbaFee:theTotalFbaFee, theFbaFee:theFbaFee, theReferralFee: referralFee, theClosingFee:closingFee}
}

//----------------------------------------------------//
//return FBA fee and tier for FR
function FRFbaFeeAndTier(category, price, length, width, height, weight){
    var theCategory = category;
    var thePrice = pureNumber(price); //I need just the number

    var firstMethodCategories = ["Livres", "CD", "Video", "DVD", "DVD & Blu-ray", "Music", "Jeux video", "Software", "Logiciels et CD-ROM"];
    var theFbaFee = "N.A.";
    var theTotalFbaFee = "N.A.";
    var theTier = "N.A.";
    var theFullTierDescription = "N.A.";
    var theTierNumber = 0;
    var referralFee = 0.00;
    var closingFee = 0.00;
    var dimensionArrayAsc = [length, width, height];
    dimensionArrayAsc = dimensionArrayAsc.sort(function(a, b){return a-b});//Sort in ASC
    
    //Convert from inch to cm
    var smallestValue = parseFloat(dimensionArrayAsc[0] * 2.54);
    var mediumValue = parseFloat(dimensionArrayAsc[1] * 2.54);
    var largestValue = parseFloat(dimensionArrayAsc[2] * 2.54);
    
    //Conver pound to gram
    var weight = parseFloat(weight * 453.592);
    var tierWeight = null;

    var completeProcess = !isNaN(weight) && !isNaN(smallestValue) && !isNaN(mediumValue) && !isNaN(largestValue) ? true : false;
    thePrice = parseFloat(thePrice);
    
    //Round all values
    if(completeProcess){
        smallestValue = Math.round(smallestValue);
        mediumValue = Math.round(mediumValue);
        largestValue = Math.round(largestValue);
    }

    //Complete the proccess to get the tier
    if(completeProcess && $.inArray( theCategory, firstMethodCategories) != -1){
        //Get the tier value
        if(largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900){
            theTier = STANDARD_STRING_SHORT;
            theFullTierDescription = STANDARD_STRING;
            theTierNumber = STANDARD_NUM;
        }
        else{
            theTier = OVERSIZE_STRING_SHORT;
            theFullTierDescription = OVERSIZE_STRING;
            theTierNumber = OVERSIZE_NUM;
        }
                    
        //Get the FBA fees
        if(!isNaN(thePrice)){
            //S. Stand
            if(theTierNumber == STANDARD_NUM){
                if(thePrice <= 350){
                    if(largestValue <= 20 && mediumValue <= 15 && smallestValue <= 1 && weight <= 80){
                        theFbaFee = 1.24;
                    }else if(largestValue <= 33 && mediumValue <= 23 && smallestValue <= 2.5 && weight <= 460){
                        if(weight <= 60){
                            theFbaFee = 1.51;
                        }else if(weight <= 460){
                            theFbaFee = 1.54;
                        }else {
                            theFbaFee = 0.00;
                        }
                    }else if(largestValue <= 33 && mediumValue <= 23 && smallestValue <= 5 && weight <= 960){ 
                        theFbaFee = 2.08;
                    }else if(largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900){
                        if(weight <= 150){
                            theFbaFee = 2.01;
                        }else if(weight <= 400){
                            theFbaFee = 2.11;
                        }else if(weight <= 900){
                            theFbaFee = 2.84;
                        }else if(weight <= 1900){
                            theFbaFee = 3.40;
                        }else if(weight <= 4900){
                            theFbaFee = 4.97;
                        }else if(weight <= 11900){
                            theFbaFee = 5.02;
                        }else {
                            theFbaFee = 0.00;
                        }
                    }
                } else {
                    theFbaFee = 0.00;
                }
                theTier = STANDARD_STRING_SHORT;
                theFullTierDescription = STANDARD_STRING;
            } 
            //Oversize
            else if(theTierNumber == OVERSIZE_NUM){
                //S. Over
                if(largestValue <= 61 && mediumValue <= 46 && smallestValue <= 46 && weight <= 1760){
                    if(weight <= 760){
                        theFbaFee = 5.22;
                    }else if(weight <= 1010){
                        theFbaFee = 5.41;
                    }else if(weight <= 1510){
                        theFbaFee = 5.48;
                    }else if(weight <= 1760){
                        theFbaFee = 5.85;
                    }else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_SMALL_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_SMALL_STRING;
                } 
                //R. Over
                else if(largestValue <= 120 && mediumValue <= 60 && smallestValue <= 60 && weight <= 29760){
                    if(weight <= 760){
                        theFbaFee = 5.71;
                    }else if(weight <= 1760){
                        theFbaFee = 6.53;
                    }else if(weight <= 2760){
                        theFbaFee = 6.86;
                    }else if(weight <= 3760){
                        theFbaFee = 7.15;
                    }else if(weight <= 4760){
                        theFbaFee = 7.20;
                    }else if(weight <= 5760){
                        theFbaFee = 7.63;
                    }else if(weight <= 6760){
                        theFbaFee = 7.72;
                    }else if(weight <= 8760){
                        theFbaFee = 7.76;
                    }else if(weight <= 9760){
                        theFbaFee = 7.79;
                    }else if(weight <= 14760){
                        theFbaFee = 8.33;
                    }else if(weight <= 24760){
                        theFbaFee = 8.76;
                    }else if(weight <= 29760){
                        theFbaFee = 9.73;
                    }else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_REGULAR_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_REGULAR_STRING;
                } 
                //L. Over
                else if(largestValue > 120 || mediumValue > 60 || smallestValue > 60){
                    if(weight <= 4760){
                        theFbaFee = 7.20;
                    }else if(weight <= 9760){
                        theFbaFee = 8.75;
                    }else if(weight <= 14760){
                        theFbaFee = 9.27;
                    }else if(weight <= 19760){
                        theFbaFee = 9.73;
                    }else if(weight <= 24760){
                        theFbaFee = 10.64;
                    }else if(weight <= 29760){
                        theFbaFee = 10.90;
                    }else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_LARGE_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_LARGE_STRING;
                } else {
                    theFbaFee = 0.00;
                }
            }

            //Get the referral fee
            referralFee = (thePrice * 0.15);

            //Calculate Variable Closing Fee
            closingFee = 0.52;

            //Final FBA Fees
            theTotalFbaFee = theFbaFee + referralFee + closingFee;
            theTotalFbaFee = theTotalFbaFee.toFixed(2);
        }//End if we have a price
    }//End if the category is listed and start method two
    else if(completeProcess){
        //Get the tier value
        if(largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900){
            theTier = STANDARD_STRING_SHORT;
            theFullTierDescription = STANDARD_STRING;
            theTierNumber = STANDARD_NUM;
        }
        else {
            theTier = OVERSIZE_STRING_SHORT;
            theFullTierDescription = OVERSIZE_STRING;
            theTierNumber = OVERSIZE_NUM;
        }

        //Get the FBA fees
        if(!isNaN(thePrice)){
            //Stand
            if(theTierNumber == STANDARD_NUM){
                if(thePrice <= 350){
                    if(largestValue <= 20 && mediumValue <= 15 && smallestValue <= 1 && weight <= 80){
                        theFbaFee = 1.98;
                    }else if(largestValue <= 33 && mediumValue <= 23 && smallestValue <= 2.5 && weight <= 460){
                        if(weight <= 210){
                            theFbaFee = 2.08;
                        } else if(weight <= 460){
                            theFbaFee = 2.24;
                        }else {
                            theFbaFee = 0.00;
                        }
                    }else if(largestValue <= 33 && mediumValue <= 23 && smallestValue <= 5 && weight <= 960){ 
                        theFbaFee = 2.38;
                    }else if(largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900){
                        if(weight <= 150){
                            theFbaFee = 2.55;
                        } else if(weight <= 400){
                            theFbaFee = 2.74;
                        } else if(weight <= 900){
                            theFbaFee = 3.5;
                        } else if(weight <= 1400){
                            theFbaFee = 3.7;
                        } else if(weight <= 1900){
                            theFbaFee = 3.83;
                        } else if(weight <= 2900){
                            theFbaFee = 4.98;
                        } else if(weight <= 4900){
                            theFbaFee = 5.14;
                        } else if(weight <= 6900){
                            theFbaFee = 5.22;
                        } else if(weight <= 10900){
                            theFbaFee = 5.35;
                        } else if(weight <= 11900){
                            theFbaFee = 5.36;
                        } else {
                            theFbaFee = 0.00;
                        }
                    }
                }else{
                    theFbaFee = 0.00;
                }
                theTier = STANDARD_STRING_SHORT;
                theFullTierDescription = STANDARD_STRING;
            } 
            //Oversize
            else if(theTierNumber == OVERSIZE_NUM){
                if(thePrice <= 350){ 
                    if(largestValue <= 61 && mediumValue <= 46 && smallestValue <= 46 && weight <= 1760){
                        if(weight <= 760){
                            theFbaFee = 5.22;
                        }else if(weight <= 1010){
                            theFbaFee = 5.41;
                        }else if(weight <= 1510){
                            theFbaFee = 5.48;
                        }else if(weight <= 1760){
                            theFbaFee = 5.85;
                        } else {
                            theFbaFee = 0.00;
                        }
                        theTier = OVERSIZE_SMALL_STRING_SHORT;
                        theFullTierDescription = OVERSIZE_SMALL_STRING;
                    }else if(largestValue <= 120 && mediumValue <= 60 && smallestValue <= 60 && weight <= 29760){
                        if(weight <= 760){
                            theFbaFee = 5.71;
                        }else if(weight <= 1760){
                            theFbaFee = 6.53;
                        }else if(weight <= 2760){
                            theFbaFee = 6.86;
                        }else if(weight <= 3760){
                            theFbaFee = 7.15;
                        }else if(weight <= 4760){
                            theFbaFee = 7.20;
                        }else if(weight <= 5760){
                            theFbaFee = 7.63;
                        }else if(weight <= 6760){
                            theFbaFee = 7.72;
                        }else if(weight <= 8760){
                            theFbaFee = 7.76;
                        }else if(weight <= 9760){
                            theFbaFee = 7.79;
                        }else if(weight <= 14760){
                            theFbaFee = 8.33;
                        }else if(weight <= 24760){
                            theFbaFee = 8.76;
                        }else if(weight <= 29760){
                            theFbaFee = 9.73;
                        }else {
                            theFbaFee = 0.00;
                        }

                        theTier = OVERSIZE_REGULAR_STRING_SHORT;
                        theFullTierDescription = OVERSIZE_REGULAR_STRING;
                    }
                    //L. Over
                    else if(largestValue > 120 || mediumValue > 60 || smallestValue > 60){
                        if(weight <= 4760){
                            theFbaFee = 7.20;
                        }else if(weight <= 9760){
                            theFbaFee = 8.75;
                        }else if(weight <= 14760){
                            theFbaFee = 9.27;
                        }else if(weight <= 19760){
                            theFbaFee = 9.73;
                        }else if(weight <= 24760){
                            theFbaFee = 10.64;
                        }else if(weight <= 29760){
                            theFbaFee = 10.90;
                        }else {
                            theFbaFee = 0.00;
                        }
                        theTier = OVERSIZE_LARGE_STRING_SHORT;
                        theFullTierDescription = OVERSIZE_LARGE_STRING;
                    }
                }else{ 
                    theFbaFee = 0.00;
                }
            }

            //Get the referral fee
            if(theCategory == "Ordinateurs, Périphériques PC et Téléviseurs"){
                referralFee = (thePrice * 0.05);
                if(referralFee < 0.50){
                    referralFee = 0.50;
                }
            } else if(theCategory == "Ordinateurs" || theCategory == "High-tech" || theCategory == "Gros Électroménager"){
                referralFee = (thePrice * 0.07);
                if(referralFee < 0.50){
                    referralFee = 0.50;
                }
            } else if(theCategory == "Consoles de Jeux-Vidéo"){
                referralFee = (thePrice * 0.08);
            } else if(theCategory == "Pneus"){
                referralFee = (thePrice * 0.10);
                if(referralFee < 0.50){
                    referralFee = 0.50;
                }
            } else if(theCategory == "Accessoires High-Tech" || theCategory == "Bricolage" || theCategory == "Instruments de musique & Sono"){
                referralFee = (thePrice * 0.12);
                if(referralFee < 0.50){
                    referralFee = 0.50;
                }
            } else if(theCategory == "Montres"){
                referralFee = (thePrice * 0.15);
                if(referralFee < 1.50){
                    referralFee = 1.50;
                }
            } else if(theCategory == "Bijoux"){
                referralFee = (thePrice * 0.20);
                if(referralFee < 1.50){
                    referralFee = 1.50;
                }
            } else{
                referralFee = (thePrice * 0.15);
                if(referralFee < 0.50){
                    referralFee = 0.50;
                }
            }

            //Calculate Variable Closing Fee
            if (theCategory == "Image & Son, Micro & Photo" || theCategory == "Accessoires Kindle"){
                closingFee = 0.79;
            }

            //Final FBA Fees
            theTotalFbaFee = theFbaFee + referralFee + closingFee;
            theTotalFbaFee = theTotalFbaFee.toFixed(2);
            theFbaFee = theFbaFee.toFixed(2);
        }//End if we have a price
    }//Other categories
    
    return {theTier: theTier, theFullTierDescription:theFullTierDescription, theTotalFbaFee:theTotalFbaFee, theFbaFee:theFbaFee, theReferralFee: referralFee, theClosingFee:closingFee}
}
//----------------------------------------------------//
//return FBA fee and tier for DE
function DEFbaFeeAndTier(category, price, length, width, height, weight){
    var theCategory = category;
    var thePrice = pureNumber(price); //I need just the number

    var firstMethodCategories = ["Bücher", "Musik", "VHS", "DVD", "DVD & Blu-ray", "Software"];
    var theFbaFee = "N.A.";
    var theTotalFbaFee = "N.A.";
    var theTier = "N.A.";
    var theFullTierDescription = "N.A.";
    var theTierNumber = 0;
    var referralFee = 0.00;
    var closingFee = 0.00;
    var dimensionArrayAsc = [length, width, height];
    dimensionArrayAsc = dimensionArrayAsc.sort(function(a, b){return a-b});//Sort in ASC
    
    //Convert from inch to cm
    var smallestValue = parseFloat(dimensionArrayAsc[0] * 2.54);
    var mediumValue = parseFloat(dimensionArrayAsc[1] * 2.54);
    var largestValue = parseFloat(dimensionArrayAsc[2] * 2.54);
    
    //Conver pound to gram
    var weight = parseFloat(weight * 453.592);
    var tierWeight = null;

    var completeProcess = !isNaN(weight) && !isNaN(smallestValue) && !isNaN(mediumValue) && !isNaN(largestValue) ? true : false;
    thePrice = parseFloat(thePrice);
    
    //Round all values
    if(completeProcess){
        smallestValue = Math.round(smallestValue);
        mediumValue = Math.round(mediumValue);
        largestValue = Math.round(largestValue);
    }

    //Complete the proccess to get the tier
    if(completeProcess && $.inArray( theCategory, firstMethodCategories) != -1){
        //Get the tier value
        if(largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900){
            theTier = STANDARD_STRING_SHORT;
            theFullTierDescription = STANDARD_STRING;
            theTierNumber = STANDARD_NUM;
        }
        else{
            theTier = OVERSIZE_STRING_SHORT;
            theFullTierDescription = OVERSIZE_STRING;
            theTierNumber = OVERSIZE_NUM;
        }
                    
        //Get the FBA fees
        if(!isNaN(thePrice)){
            //S. Stand
            if(theTierNumber == STANDARD_NUM){
                if(thePrice <= 350){
                    if(largestValue <= 20 && mediumValue <= 15 && smallestValue <= 1 && weight <= 80){
                        theFbaFee = 1.09;
                    }else if(largestValue <= 33 && mediumValue <= 23 && smallestValue <= 2.5 && weight <= 460){
                        if(weight <= 210){
                            theFbaFee = 1.24;
                        }else if(weight <= 460){
                            theFbaFee = 1.26;
                        }else {
                            theFbaFee = 0.00;
                        }
                    }else if(largestValue <= 33 && mediumValue <= 23 && smallestValue <= 5 && weight <= 960){ 
                        theFbaFee = 1.72;
                    }else if(largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900){
                        if(weight <= 150){
                            theFbaFee = 1.88;
                        }else if(weight <= 400){
                            theFbaFee = 1.94;
                        }else if(weight <= 900){
                            theFbaFee = 2.62;
                        }else if(weight <= 1400){
                            theFbaFee = 2.63;
                        }else if(weight <= 1900){
                            theFbaFee = 2.65;
                        }else if(weight <= 4900){
                            theFbaFee = 3.87;
                        }else if(weight <= 11900){
                            theFbaFee = 3.92;
                        }else {
                            theFbaFee = 0.00;
                        }
                    }
                } else {
                    theFbaFee = 0.00;
                }
                theTier = STANDARD_STRING_SHORT;
                theFullTierDescription = STANDARD_STRING;
            } 
            //Oversize
            else if(theTierNumber == OVERSIZE_NUM){
                if(thePrice <= 350){ 
                    //S. Over
                    if(largestValue <= 61 && mediumValue <= 46 && smallestValue <= 46 && weight <= 1760){
                        if(weight <= 760){
                            theFbaFee = 4.78;
                        }else if(weight <= 1010){
                            theFbaFee = 4.89;
                        }else if(weight <= 1510){
                            theFbaFee = 4.92;
                        }else if(weight <= 1760){
                            theFbaFee = 4.99;
                        }else {
                            theFbaFee = 0.00;
                        }
                        theTier = OVERSIZE_SMALL_STRING_SHORT;
                        theFullTierDescription = OVERSIZE_SMALL_STRING;
                    } 
                    //R. Over
                    else if(largestValue <= 120 && mediumValue <= 60 && smallestValue <= 60 && weight <= 29760){
                        if(weight <= 760){
                            theFbaFee = 4.8;
                        }else if(weight <= 1760){
                            theFbaFee = 4.99;
                        }else if(weight <= 2760){
                            theFbaFee = 5.89;
                        }else if(weight <= 5760){
                            theFbaFee = 5.93;
                        }else if(weight <= 6760){
                            theFbaFee = 6.02;
                        }else if(weight <= 8760){
                            theFbaFee = 6.06;
                        }else if(weight <= 9760){
                            theFbaFee = 6.09;
                        }else if(weight <= 14760){
                            theFbaFee = 6.63;
                        }else if(weight <= 19760){
                            theFbaFee = 7.06;
                        }else if(weight <= 29760){
                            theFbaFee = 8.03;
                        }else {
                            theFbaFee = 0.00;
                        }
                        theTier = OVERSIZE_REGULAR_STRING_SHORT;
                        theFullTierDescription = OVERSIZE_REGULAR_STRING;
                    } 
                    //L. Over
                    else if(largestValue > 120 || mediumValue > 60 || smallestValue > 60){
                        if(weight <= 4760){
                            theFbaFee = 6.05;
                        }else if(weight <= 9760){
                            theFbaFee = 7.05;
                        }else if(weight <= 14760){
                            theFbaFee = 7.57;
                        }else if(weight <= 19760){
                            theFbaFee = 8.03;
                        }else if(weight <= 24760){
                            theFbaFee = 8.94;
                        }else if(weight <= 29760){
                            theFbaFee = 8.96;
                        }else {
                            theFbaFee = 0.00;
                        }
                        theTier = OVERSIZE_LARGE_STRING_SHORT;
                        theFullTierDescription = OVERSIZE_LARGE_STRING;
                    }
                }else{ 
                    theFbaFee = 0.00;
                }
            }

            //Get the referral fee
            referralFee = (thePrice * 0.15);

            //Calculate Variable Closing Fee
            closingFee = 1.01;

            //Final FBA Fees
            theTotalFbaFee = theFbaFee + referralFee + closingFee;
            theTotalFbaFee = theTotalFbaFee.toFixed(2);
        }//End if we have a price
    }//End if the category is listed and start method two
    else if(completeProcess){
        //Get the tier value
        if(largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900){
            theTier = STANDARD_STRING_SHORT;
            theFullTierDescription = STANDARD_STRING;
            theTierNumber = STANDARD_NUM;
        }
        else {
            theTier = OVERSIZE_STRING_SHORT;
            theFullTierDescription = OVERSIZE_STRING;
            theTierNumber = OVERSIZE_NUM;
        }

        //Get the FBA fees
        if(!isNaN(thePrice)){
            //Stand
            if(theTierNumber == STANDARD_NUM){
                if(thePrice <= 350){
                    if(largestValue <= 20 && mediumValue <= 15 && smallestValue <= 1 && weight <= 80){
                        theFbaFee = 1.60;
                    }else if(largestValue <= 33 && mediumValue <= 23 && smallestValue <= 2.5 && weight <= 460){
                        if(weight <= 60){
                            theFbaFee = 1.72;
                        }else if(weight <= 210){
                            theFbaFee = 1.73;
                        }else if(weight <= 460){
                            theFbaFee = 1.77;
                        }else {
                            theFbaFee = 0.00;
                        }
                    }else if(largestValue <= 33 && mediumValue <= 23 && smallestValue <= 5 && weight <= 960){ 
                        theFbaFee = 2.14;
                    }else if(largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900){
                        if(weight <= 150){
                            theFbaFee = 2.32;
                        } else if(weight <= 400){
                            theFbaFee = 2.41;
                        } else if(weight <= 900){
                            theFbaFee = 2.98;
                        } else if(weight <= 1400){
                            theFbaFee = 3.04;
                        } else if(weight <= 1900){
                            theFbaFee = 3.10;
                        } else if(weight <= 2900){
                            theFbaFee = 4.18;
                        } else if(weight <= 4900){
                            theFbaFee = 4.19;
                        } else if(weight <= 6900){
                            theFbaFee = 4.27;
                        } else if(weight <= 10900){
                            theFbaFee = 4.40;
                        } else if(weight <= 11900){
                            theFbaFee = 4.41;
                        } else {
                            theFbaFee = 0.00;
                        }
                    }
                }else{
                    theFbaFee = 0.00;
                }
                theTier = STANDARD_STRING_SHORT;
                theFullTierDescription = STANDARD_STRING;
            } 
            //Oversize
            else if(theTierNumber == OVERSIZE_NUM){
                if(largestValue <= 61 && mediumValue <= 46 && smallestValue <= 46 && weight <= 1760){
                    if(weight <= 760){
                        theFbaFee = 4.78;
                    }else if(weight <= 1010){
                        theFbaFee = 4.89;
                    }else if(weight <= 1510){
                        theFbaFee = 4.92;
                    }else if(weight <= 1760){
                        theFbaFee = 4.99;
                    }else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_SMALL_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_SMALL_STRING;
                }else if(largestValue <= 120 && mediumValue <= 60 && smallestValue <= 60 && weight <= 29760){
                    if(weight <= 760){
                        theFbaFee = 4.8;
                    }else if(weight <= 1760){
                        theFbaFee = 4.99;
                    }else if(weight <= 2760){
                        theFbaFee = 5.89;
                    }else if(weight <= 5760){
                        theFbaFee = 5.93;
                    }else if(weight <= 6760){
                        theFbaFee = 6.02;
                    }else if(weight <= 8760){
                        theFbaFee = 6.06;
                    }else if(weight <= 9760){
                        theFbaFee = 6.09;
                    }else if(weight <= 14760){
                        theFbaFee = 6.63;
                    }else if(weight <= 19760){
                        theFbaFee = 7.06;
                    }else if(weight <= 29760){
                        theFbaFee = 8.03;
                    }else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_REGULAR_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_REGULAR_STRING;
                }
                //L. Over
                else if(largestValue > 120 || mediumValue > 60 || smallestValue > 60){
                    if(weight <= 4760){
                        theFbaFee = 6.05;
                    }else if(weight <= 9760){
                        theFbaFee = 7.05;
                    }else if(weight <= 14760){
                        theFbaFee = 7.57;
                    }else if(weight <= 19760){
                        theFbaFee = 8.03;
                    }else if(weight <= 24760){
                        theFbaFee = 8.94;
                    }else if(weight <= 29760){
                        theFbaFee = 8.96;
                    }else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_LARGE_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_LARGE_STRING;
                }
            }

            //Get the referral fee
            if(theCategory == "Computer" || theCategory == "Elektro-Großgeräte"){
                referralFee = (thePrice * 0.07);
                if(referralFee < 0.50){
                    referralFee = 0.50;
                }
            } else if(theCategory == "Videospielkonsolen"){
                referralFee = (thePrice * 0.08);
                if(referralFee < 0.50){
                    referralFee = 0.50;
                }
            } else if(theCategory == "Fahrräder" || theCategory == "Reifen"){
                referralFee = (thePrice * 0.10);
                if(referralFee < 0.50){
                    referralFee = 0.50;
                }
            } else if(theCategory == "Additive Fertigung" || theCategory == "Baumarkt" || theCategory == "Computer-Zubehör" || 
                theCategory == "Elektronik-Zubehör" || theCategory == "Industrielle Werkzeuge & Geräte" || 
                theCategory == "Musikinstrumente & DJ-Equipment"){
                referralFee = (thePrice * 0.12);
                if(referralFee < 0.50){
                    referralFee = 0.50;
                }
            } else if(theCategory == "Uhren"){
                referralFee = (thePrice * 0.15);
                if(referralFee < 1.50){
                    referralFee = 1.50;
                }
            } else if(theCategory == "Lebensmittel" || theCategory == "Videospiele" || theCategory == "Spirituosen"){
                referralFee = (thePrice * 0.15);
            } else if(theCategory == "Schmuck"){
                referralFee = (thePrice * 0.20);
                if(referralFee < 1.50){
                    referralFee = 1.50;
                }
            } else{
                referralFee = (thePrice * 0.15);
                if(referralFee < 0.50){
                    referralFee = 0.50;
                }
            }

            //Calculate Variable Closing Fee
            if (theCategory == "PC & Videospiele"){
                closingFee = 1.01;
            } else if(theCategory == "Elektronik & Foto" || theCategory == "Kindle-Zubehör" || 
                theCategory == "Küche, Haus & Garten" || theCategory == "Spielwaren"){
                closingFee = 0.45+0.15*weight/1000;
            } else if(theCategory == "sport"){
                closingFee = 0.8;
            }

            //Final FBA Fees
            theTotalFbaFee = theFbaFee + referralFee + closingFee;
            theTotalFbaFee = theTotalFbaFee.toFixed(2);
            theFbaFee = theFbaFee.toFixed(2);
        }//End if we have a price
    }//Other categories
    
    return {theTier:theTier, theFullTierDescription:theFullTierDescription, theTotalFbaFee:theTotalFbaFee, theFbaFee:theFbaFee, theReferralFee: referralFee, theClosingFee:closingFee}
}
//----------------------------------------------------//
//return FBA fee and tier for IN
function INFbaFeeAndTier(category, price, length, width, height, weight){
    var theCategory = category;
    var thePrice = pureNumber(price); //I need just the number
    var theFbaFee = "N.A.";
    var theTotalFbaFee = "N.A.";
    var theTier = "N.A.";
    var theFullTierDescription = "N.A.";
    var theTierNumber = 0;
    var referralFee = 0.00;
    var closingFee = 0.00;
    var dimensionArrayAsc = [length, width, height];
    dimensionArrayAsc = dimensionArrayAsc.sort(function(a, b){return a-b});//Sort in ASC
    
    //Convert from inch to cm
    var smallestValue = parseFloat(dimensionArrayAsc[0] * 2.54);
    var mediumValue = parseFloat(dimensionArrayAsc[1] * 2.54);
    var largestValue = parseFloat(dimensionArrayAsc[2] * 2.54);
    
    //Conver pound to gram
    var weight = parseFloat(weight * 453.592);
    var tierWeight = null;
    var UW = weight;
    var DW = ((largestValue * mediumValue * smallestValue)/5);
    DW = parseFloat(DW);
    if(UW > DW){
        tierWeight = UW;
    }else{
        tierWeight = DW;
    }

    var completeProcess = !isNaN(weight) && !isNaN(smallestValue) && !isNaN(mediumValue) && !isNaN(largestValue) ? true : false;
    thePrice = parseFloat(thePrice);

    //Complete the proccess to get the tier
    if(completeProcess){
        //Round all values
        smallestValue = Math.round(smallestValue);
        mediumValue = Math.round(mediumValue);
        largestValue = Math.round(largestValue);

        //Get the tier value
        if(largestValue <= 30.48 && mediumValue <= 20.32 && smallestValue <= 10.16 && weight <= 950){
            theTier = STANDARD_SMALL_STRING_SHORT;
            theFullTierDescription = STANDARD_SMALL_STRING;
            theTierNumber = STANDARD_SMALL_NUM;
        }
        else if(largestValue <= 50.80 && mediumValue <= 40.64 && smallestValue <= 25.4 && weight <= 11900){
            theTier = STANDARD_STRING;
            theFullTierDescription = STANDARD_STRING;
            theTierNumber = STANDARD_NUM;
        }
        else if(weight > 29760){
            theTier = OVERSIZE_SPECIAL_STRING_SHORT;
            theFullTierDescription = OVERSIZE_SPECIAL_STRING;
            theTierNumber = OVERSIZE_SPECIAL_NUM;
        }
        else{
            theTier = OVERSIZE_STRING_SHORT;
            theFullTierDescription = OVERSIZE_STRING;
            theTierNumber = OVERSIZE_NUM;
        }
                    
        //Get the FBA fees
        if(!isNaN(thePrice)){
            //S. Stand small
            if(theTierNumber == STANDARD_SMALL_NUM){
                if(thePrice <= 20000){
                    var outboundweight = (weight + 50);
                    if(outboundweight <= 500){
                        theFbaFee = 30 + (thePrice * 0.01);
                    } else {
                        theFbaFee = 60 + (thePrice * 0.01);
                    }
                } else {
                    theFbaFee = 0.00;
                }
            } 
            //S. Stand
            else if(theTierNumber == STANDARD_NUM){
                if(thePrice <= 20000){
                    var outboundweight = (weight + 100);
                    if(outboundweight <= 2000){
                        theFbaFee = 30 * (parseInt((outboundweight/500)+1)) + (thePrice * 0.01);
                    } else {
                        theFbaFee = 120 + 15 * (parseInt((outboundweight-2000/500)+1)) + (thePrice * 0.01);
                    }
                } else{
                    theFbaFee = 0.00;
                }
            }
            //Oversize and Oversize special
            else if(theTierNumber == OVERSIZE_SPECIAL_NUM || theTierNumber == OVERSIZE_NUM){
                var outboundweight = (weight + 240);
                if(outboundweight <= 5000){
                    theFbaFee = 80 + (thePrice * 0.01);
                } else {
                    theFbaFee = 80 + 9 * (parseInt((outboundweight-5000/1000)+1)) + (thePrice * 0.01);
                }
            }

            //Get the referral fee
            if (theCategory == "Car & Motorbike"){
                referralFee = thePrice * 0.02;
            } 
            else if(theCategory == "Electronics"){
                referralFee = thePrice * 0.04;
            }
            else if(theCategory == "Music" || theCategory == "Video"){
                referralFee = thePrice * 0.05;
            }
            else if(theCategory == "Musical Instruments"){
                referralFee = thePrice * 0.06;
            }
            else if(theCategory == "Office Products"){
                referralFee = thePrice * 0.07;
            }
            else if(theCategory == "Industrial & Scientific" || theCategory == "Toys & Games"){
                referralFee = thePrice * 0.08;
            }
            else if(theCategory == "Pet Supplies" || theCategory == "Sports & Outdoors"){
                referralFee = thePrice * 0.1;
            }
            else if(theCategory == "Home & Kitchen" || theCategory == "Watches"){
                referralFee = thePrice * 0.12;
            }
            else if(theCategory == "Bags, Wallets & Luggage" || theCategory == "Shoes & Handbags"){
                referralFee = thePrice * 0.13;
            }
            else if(theCategory == "Clothing & Accessories"){
                referralFee = thePrice * 0.17;
            }
            else if(theCategory == "Jewelry"){
                referralFee = thePrice * 0.18;
            }

            //Calculate Variable Closing Fee
            if (theCategory == "Beauty" || theCategory == "Grocery & Gourmet Food" || 
                theCategory == "Health & Personal Care" || theCategory == "Movies & TV Shows" || 
                theCategory == "Software" || theCategory == "Pet Supplies"){
                if(thePrice <= 250){
                    closingFee = 0.00;
                } else if(thePrice <= 500) {
                    closingFee = 5;
                } else {
                    closingFee = 10;
                }
            }

            //Final FBA Fees
            theTotalFbaFee = theFbaFee + referralFee + closingFee;
            theTotalFbaFee = theTotalFbaFee.toFixed(2);
        }//End if we have a price
    }//End if the category is listed and start method two
    
    return {theTier: theTier, theFullTierDescription:theFullTierDescription, theTotalFbaFee:theTotalFbaFee, theFbaFee:theFbaFee, theReferralFee: referralFee, theClosingFee:closingFee}
}
//----------------------------------------------------//
//return FBA fee and tier for MX
function MXFbaFeeAndTier(category, price, length, width, height, weight){
    var theCategory = category;
    var thePrice = pureNumber(price); //I need just the number

    var firstMethodCategories = ["Libros", "Películas", "Música", "Videojuegos", "Revistas y Software"];
    var theFbaFee = "N.A.";
    var theTotalFbaFee = "N.A.";
    var theTier = "N.A.";
    var theFullTierDescription = "N.A.";
    var theTierNumber = 0;
    var referralFee = 0.00;
    var closingFee = 0.00;
    var dimensionArrayAsc = [length, width, height];
    dimensionArrayAsc = dimensionArrayAsc.sort(function(a, b){return a-b});//Sort in ASC
    
    //Convert from inch to cm
    var smallestValue = parseFloat(dimensionArrayAsc[0] * 2.54);
    var mediumValue = parseFloat(dimensionArrayAsc[1] * 2.54);
    var largestValue = parseFloat(dimensionArrayAsc[2] * 2.54);
    
    //Conver pound to gram
    var weight = parseFloat(weight * 453.592);

    var completeProcess = !isNaN(weight) && !isNaN(smallestValue) && !isNaN(mediumValue) && !isNaN(largestValue) ? true : false;
    thePrice = parseFloat(thePrice);
    
    //Round all values
    if(completeProcess){
        smallestValue = Math.round(smallestValue);
        mediumValue = Math.round(mediumValue);
        largestValue = Math.round(largestValue);
    }

    //Complete the proccess to get the tier
    if(completeProcess && $.inArray(theCategory, firstMethodCategories) != -1){
        //Get the tier value
        if(largestValue <= 45 && mediumValue <= 35 && smallestValue <= 20 && weight <= 8900) {
            theTier = STANDARD_STRING_SHORT;
            theFullTierDescription = STANDARD_STRING;
            theTierNumber = STANDARD_NUM;
        }
        else {
            theTier = OVERSIZE_STRING_SHORT;
            theFullTierDescription = OVERSIZE_STRING;
            theTierNumber = OVERSIZE_NUM;
        }
        
        //Check the price, we need that
        if(!isNaN(thePrice)){
            //Get the FBA fees
            if(theTierNumber == STANDARD_NUM){ 
                var outboundweight = 0.00;
                if(weight <= 500){
                    outboundweight = (weight + 75);
                } else {
                    outboundweight = (weight + 125)
                }
                
                if(outboundweight <= 500){
                    theFbaFee = 31;
                } else if(outboundweight <= 1000){
                    theFbaFee = 32;
                } else if(outboundweight <= 2000){
                    theFbaFee = 34;
                } else if(outboundweight <= 5000){
                    theFbaFee = 37.05;
                } else {
                    theFbaFee = 37.05 + (2.8 * (Math.round((outboundweight - 500)/500)));
                }
            } else if(theTierNumber == OVERSIZE_NUM){ 
                var outboundweight = (weight + 500);
                if(outboundweight <= 500){
                    theFbaFee = 43.3;
                } else if(outboundweight <= 1000){
                    theFbaFee = 44.3;
                } else if(outboundweight <= 2000){
                    theFbaFee = 46.3;
                } else if(outboundweight <= 5000){
                    theFbaFee = 49.35;
                } else {
                    theFbaFee = 49.35 + (2.8 * (Math.round((outboundweight - 500)/500)));
                }
            }

            //Final FBA Fees
            theTotalFbaFee = theFbaFee + referralFee + closingFee;
            theTotalFbaFee = theTotalFbaFee.toFixed(2);
        }
    }//End if the category is listed and start method two
    else if(completeProcess){
        //Get the tier value
        if(largestValue <= 45 && mediumValue <= 35 && smallestValue <= 20 && weight <= 8900) {
            theTier = STANDARD_STRING_SHORT;
            theFullTierDescription = STANDARD_STRING;
            theTierNumber = STANDARD_NUM;
        } else {
            theTier = OVERSIZE_STRING_SHORT;
            theFullTierDescription = OVERSIZE_STRING;
            theTierNumber = OVERSIZE_NUM;
        }

        //Check the price, we need that
        if(!isNaN(thePrice)){
            //Get the FBA fees
            if(theTierNumber == STANDARD_NUM){ 
                var outboundweight = 0.00;
                if(weight <= 500){
                    outboundweight = (weight + 75);
                } else {
                    outboundweight = (weight + 125)
                }
                
                if(outboundweight <= 500){
                    theFbaFee = 31.8;
                } else if(outboundweight <= 1000){
                    theFbaFee = 32.8;
                } else if(outboundweight <= 2000){
                    theFbaFee = 34.8;
                } else if(outboundweight <= 5000){
                    theFbaFee = 37.85;
                } else {
                    theFbaFee = 37.85 + (2.8 * (Math.round((outboundweight - 500)/500)));
                }
            } else if(theTierNumber == OVERSIZE_NUM){ 
                var outboundweight = (weight + 500);
                if(outboundweight <= 500){
                    theFbaFee = 43.3;
                } else if(outboundweight <= 1000){
                    theFbaFee = 44.3;
                } else if(outboundweight <= 2000){
                    theFbaFee = 46.3;
                } else if(outboundweight <= 5000){
                    theFbaFee = 49.35;
                } else {
                    theFbaFee = 49.35 + (2.8 * (Math.round((outboundweight - 500)/500)));
                }
            }

            //Final FBA Fees
            theTotalFbaFee = theFbaFee + referralFee + closingFee;
            theTotalFbaFee = theTotalFbaFee.toFixed(2);
            theFbaFee = theFbaFee.toFixed(2);
        }//End if we have a price
    }//Other categories
    
    return {theTier: theTier, theFullTierDescription:theFullTierDescription, theTotalFbaFee:theTotalFbaFee, theFbaFee:theFbaFee, theReferralFee: referralFee, theClosingFee:closingFee}
}
//----------------------------------------------------//
//return FBA fee and tier for IT
function ITFbaFeeAndTier(category, price, length, width, height, weight){
    var theCategory = category;
    var thePrice = pureNumber(price); //I need just the number

    var firstMethodCategories = ["Libri", "DVD", "VHS", "Video"];
    var theFbaFee = "N.A.";
    var theTotalFbaFee = "N.A.";
    var theTier = "N.A.";
    var theFullTierDescription = "N.A.";
    var theTierNumber = 0;
    var referralFee = 0.00;
    var closingFee = 0.00;
    var dimensionArrayAsc = [length, width, height];
    dimensionArrayAsc = dimensionArrayAsc.sort(function(a, b){return a-b});//Sort in ASC
    
    //Convert from inch to cm
    var smallestValue = parseFloat(dimensionArrayAsc[0] * 2.54);
    var mediumValue = parseFloat(dimensionArrayAsc[1] * 2.54);
    var largestValue = parseFloat(dimensionArrayAsc[2] * 2.54);
    
    //Conver pound to gram
    var weight = parseFloat(weight * 453.592);
    var tierWeight = null;

    var completeProcess = !isNaN(weight) && !isNaN(smallestValue) && !isNaN(mediumValue) && !isNaN(largestValue) ? true : false;
    thePrice = parseFloat(thePrice);
    
    //Round all values
    if(completeProcess){
        smallestValue = Math.round(smallestValue);
        mediumValue = Math.round(mediumValue);
        largestValue = Math.round(largestValue);
    }

    //Complete the proccess to get the tier
    if(completeProcess && $.inArray( theCategory, firstMethodCategories) != -1){
        //Get the tier value
        if(largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900){
            theTier = STANDARD_STRING_SHORT;
            theFullTierDescription = STANDARD_STRING;
            theTierNumber = STANDARD_NUM;
        }else{
            theTier = OVERSIZE_STRING_SHORT;
            theFullTierDescription = OVERSIZE_STRING;
            theTierNumber = OVERSIZE_NUM;
        }
                    
        //Get the FBA fees
        if(!isNaN(thePrice)){
            //S. Stand
            if(theTierNumber == STANDARD_NUM){
                if(largestValue <= 20 && mediumValue <= 15 && smallestValue <= 1 && weight <= 80){
                    theFbaFee = 2.26;
                }else if(largestValue <= 33 && mediumValue <= 23 && smallestValue <= 2.5 && weight <= 460){
                    if(weight <= 60){
                        theFbaFee = 2.33;
                    }else if(weight <= 210){
                        theFbaFee = 2.40;
                    }else if(weight <= 460){
                        theFbaFee = 2.43;
                    } else {
                        theFbaFee = 0.00;
                    }
                }else if(largestValue <= 33 && mediumValue <= 23 && smallestValue <= 5 && weight <= 960){ 
                    theFbaFee = 2.83;
                }else if(largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900){
                    if(weight <= 150){
                        theFbaFee = 3.10;
                    }else if(weight <= 400){
                        theFbaFee = 3.20;
                    }else if(weight <= 900){
                        theFbaFee = 3.30;
                    }else if(weight <= 1400){
                        theFbaFee = 3.40;
                    }else if(weight <= 2900){
                        theFbaFee = 4.80;
                    }else if(weight <= 4900){
                        theFbaFee = 4.97;
                    }else if(weight <= 11900){
                        theFbaFee = 5.02;
                    } else {
                        theFbaFee = 0.00;
                    }
                }
                theTier = STANDARD_STRING_SHORT;
                theFullTierDescription = STANDARD_STRING;
            } 
            //Oversize
            else if(theTierNumber == OVERSIZE_NUM){
                //S. Over
                if(largestValue <= 61 && mediumValue <= 46 && smallestValue <= 46 && weight <= 1760){
                    if(weight <= 760){
                        theFbaFee = 5.77;
                    }else if(weight <= 1010){
                        theFbaFee = 5.90;
                    }else if(weight <= 1260){
                        theFbaFee = 6.11;
                    }else if(weight <= 1510){
                        theFbaFee = 6.15;
                    }else if(weight <= 1760){
                        theFbaFee = 6.19;
                    }else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_SMALL_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_SMALL_STRING;
                } 
                //R. Over
                else if(largestValue <= 120 && mediumValue <= 60 && smallestValue <= 60 && weight <= 29760){
                    if(weight <= 760){
                        theFbaFee = 6.08;
                    }else if(weight <= 1760){
                        theFbaFee = 6.19;
                    }else if(weight <= 2760){
                        theFbaFee = 6.20;
                    }else if(weight <= 3760){
                        theFbaFee = 6.63;
                    }else if(weight <= 4760){
                        theFbaFee = 6.66;
                    }else if(weight <= 6760){
                        theFbaFee = 7.40;
                    }else if(weight <= 7760){
                        theFbaFee = 7.50;
                    }else if(weight <= 9760){
                        theFbaFee = 7.55;
                    }else if(weight <= 14760){
                        theFbaFee = 8.33;
                    }else if(weight <= 19760){
                        theFbaFee = 8.60;
                    }else if(weight <= 24760){
                        theFbaFee = 9.16;
                    }else if(weight <= 29760){
                        theFbaFee = 9.60;
                    }else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_REGULAR_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_REGULAR_STRING;
                } 
                //L. Over
                else if(largestValue > 120 || mediumValue > 60 || smallestValue > 60){
                    if(weight <= 4760){
                        theFbaFee = 6.66;
                    }else if(weight <= 9760){
                        theFbaFee = 7.55;
                    }else if(weight <= 14760){
                        theFbaFee = 8.33;
                    }else if(weight <= 19760){
                        theFbaFee = 8.60;
                    }else if(weight <= 29760){
                        theFbaFee = 9.60;
                    }else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_LARGE_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_LARGE_STRING;
                } else {
                    theFbaFee = 0.00;
                }
            }

            //Get the referral fee
            referralFee = (thePrice * 0.15)

            //Calculate Variable Closing Fee
            closingFee = 0.36;

            //Final FBA Fees
            theTotalFbaFee = theFbaFee + referralFee + closingFee;
            theTotalFbaFee = theTotalFbaFee.toFixed(2);
        }//End if we have a price
    }//End if the category is listed and start method two
    else if(completeProcess){
        //Get the tier value
        if(largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900){
            theTier = STANDARD_STRING_SHORT;
            theFullTierDescription = STANDARD_STRING;
            theTierNumber = STANDARD_NUM;
        } else {
            theTier = OVERSIZE_STRING_SHORT;
            theFullTierDescription = OVERSIZE_STRING;
            theTierNumber = OVERSIZE_NUM;
        }

        //Get the FBA fees
        if(!isNaN(thePrice)){
            //Stand
            if(theTierNumber == STANDARD_NUM){
                if(largestValue <= 20 && mediumValue <= 15 && smallestValue <= 1 && weight <= 80){
                    theFbaFee = 2.26;
                }else if(largestValue <= 33 && mediumValue <= 23 && smallestValue <= 2.5 && weight <= 460){
                    if(weight <= 60){
                        theFbaFee = 2.33;
                    } else if(weight <= 210){
                        theFbaFee = 2.40;
                    } else if(weight <= 460){
                        theFbaFee = 2.66;
                    } else {
                        theFbaFee = 0.00;
                    }
                }else if(largestValue <= 33 && mediumValue <= 23 && smallestValue <= 5 && weight <= 960){ 
                    theFbaFee = 3.01;
                }else if(largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900){
                    if(weight <= 150){
                        theFbaFee = 3.05;
                    } else if(weight <= 400){
                        theFbaFee = 3.18;
                    } else if(weight <= 900){
                        theFbaFee = 3.74;
                    } else if(weight <= 1400){
                        theFbaFee = 4.04;
                    } else if(weight <= 1900){
                        theFbaFee = 4.15;
                    } else if(weight <= 2900){
                        theFbaFee = 4.58;
                    } else if(weight <= 3900){
                        theFbaFee = 4.94;
                    } else if(weight <= 4900){
                        theFbaFee = 5.14;
                    } else if(weight <= 6900){
                        theFbaFee = 5.22;
                    } else if(weight <= 10900){
                        theFbaFee = 5.35;
                    } else if(weight <= 11900){
                        theFbaFee = 5.36;
                    } else {
                        theFbaFee = 0.00;
                    }
                }
                theTier = STANDARD_STRING_SHORT;
                theFullTierDescription = STANDARD_STRING;
            } 
            //Oversize
            else if(theTierNumber == OVERSIZE_NUM){
                if(largestValue <= 61 && mediumValue <= 46 && smallestValue <= 46 && weight <= 1760){
                    if(weight <= 760){
                        theFbaFee = 5.77;
                    }else if(weight <= 1010){
                        theFbaFee = 5.90;
                    }else if(weight <= 1260){
                        theFbaFee = 6.11;
                    }else if(weight <= 1510){
                        theFbaFee = 6.15;
                    }else if(weight <= 1760){
                        theFbaFee = 6.19;
                    } else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_SMALL_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_SMALL_STRING;
                }else if(largestValue <= 120 && mediumValue <= 60 && smallestValue <= 60 && weight <= 29760){
                    if(weight <= 760){
                        theFbaFee = 6.08;
                    }else if(weight <= 1760){
                        theFbaFee = 6.19;
                    }else if(weight <= 2760){
                        theFbaFee = 6.20;
                    }else if(weight <= 3760){
                        theFbaFee = 6.63;
                    }else if(weight <= 4760){
                        theFbaFee = 6.66;
                    }else if(weight <= 6760){
                        theFbaFee = 7.40;
                    }else if(weight <= 7760){
                        theFbaFee = 7.50;
                    }else if(weight <= 9760){
                        theFbaFee = 7.55;
                    }else if(weight <= 14760){
                        theFbaFee = 8.33;
                    }else if(weight <= 19760){
                        theFbaFee = 8.60;
                    }else if(weight <= 24760){
                        theFbaFee = 9.16;
                    }else if(weight <= 29760){
                        theFbaFee = 9.60;
                    }else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_REGULAR_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_REGULAR_STRING;
                }
                //L. Over
                else if(largestValue > 120 || mediumValue > 60 || smallestValue > 60){
                    if(weight <= 4760){
                        theFbaFee = 6.66;
                    }else if(weight <= 9760){
                        theFbaFee = 7.55;
                    }else if(weight <= 14760){
                        theFbaFee = 8.33;
                    }else if(weight <= 19760){
                        theFbaFee = 8.60;
                    }else if(weight <= 29760){
                        theFbaFee = 9.60;
                    } else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_LARGE_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_LARGE_STRING;
                } else {
                    theFbaFee = 0.00;
                }
            }

            //Get the referral fee
            if(theCategory == "Elettronica" || theCategory == "Informatica"){
                referralFee = (thePrice * 0.07);
                if(referralFee < 0.50){
                    referralFee = 0.50;
                }
            } else if(theCategory == "Informatica: Portatili"){
                referralFee = (thePrice * 0.05);
                if(referralFee < 0.50){
                    referralFee = 0.50;
                }
            } else if(theCategory == "Console videogiochi"){
                referralFee = (thePrice * 0.08);
            } else if(theCategory == "Pneumatici"){
                referralFee = (thePrice * 0.10);
                if(referralFee < 0.50){
                    referralFee = 0.50;
                }
            } else if(theCategory == "Fai da te" || theCategory == "Impianti elettrici" || 
                theCategory == "Lavorazione metalli" || theCategory == "Prodotti per il trasporto materiali" || 
                theCategory == "Stampa 3D" || theCategory == "Strumenti musicali e DJ" || 
                theCategory == "Utensili Manuali ed Electrici" || theCategory == "Accessori Elettronica"){
                referralFee = (thePrice * 0.12);
                if(referralFee < 0.50){
                    referralFee = 0.50;
                }
            } else if(theCategory == "Software e Videogiochi"){
                referralFee = (thePrice * 0.15);
            } else if(theCategory == "Gioielli"){
                referralFee = (thePrice * 0.20);
                if(referralFee < 1.50){
                    referralFee = 1.50;
                }
            } else {
                referralFee = (thePrice * 0.15);
                if(referralFee < 0.50){
                    referralFee = 0.50;
                }
            }

            //Final FBA Fees
            theTotalFbaFee = theFbaFee + referralFee + closingFee;
            theTotalFbaFee = theTotalFbaFee.toFixed(2);
            theFbaFee = theFbaFee.toFixed(2);
        }//End if we have a price
    }//Other categories
    
    return {theTier: theTier, theFullTierDescription:theFullTierDescription, theTotalFbaFee:theTotalFbaFee, theFbaFee:theFbaFee, theReferralFee: referralFee, theClosingFee:closingFee}
}
//----------------------------------------------------//
//return FBA fee and tier for ES
function ESFbaFeeAndTier(category, price, length, width, height, weight){
    var theCategory = category;
    var thePrice = pureNumber(price); //I need just the number

    var firstMethodCategories = ["Libros", "Música", "Videojuegos", "DVDs, Blu-ray, VHS", "Software"];
    var theFbaFee = "N.A.";
    var theTotalFbaFee = "N.A.";
    var theTier = "N.A.";
    var theFullTierDescription = "N.A.";
    var theTierNumber = 0;
    var referralFee = 0.00;
    var closingFee = 0.00;
    var dimensionArrayAsc = [length, width, height];
    dimensionArrayAsc = dimensionArrayAsc.sort(function(a, b){return a-b});//Sort in ASC
    
    //Convert from inch to cm
    var smallestValue = parseFloat(dimensionArrayAsc[0] * 2.54);
    var mediumValue = parseFloat(dimensionArrayAsc[1] * 2.54);
    var largestValue = parseFloat(dimensionArrayAsc[2] * 2.54);
    
    //Conver pound to gram
    var weight = parseFloat(weight * 453.592);
    var tierWeight = null;

    var completeProcess = !isNaN(weight) && !isNaN(smallestValue) && !isNaN(mediumValue) && !isNaN(largestValue) ? true : false;
    thePrice = parseFloat(thePrice);
    
    //Round all values
    if(completeProcess){
        smallestValue = Math.round(smallestValue);
        mediumValue = Math.round(mediumValue);
        largestValue = Math.round(largestValue);
    }//End 

    //Complete the proccess to get the tier
    if(completeProcess && $.inArray( theCategory, firstMethodCategories) != -1){
        //Get the tier value
        if(largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900){
            theTier = STANDARD_STRING_SHORT;
            theFullTierDescription = STANDARD_STRING;
            theTierNumber = STANDARD_NUM;
        }else{
            theTier = OVERSIZE_STRING_SHORT;
            theFullTierDescription = OVERSIZE_STRING;
            theTierNumber = OVERSIZE_NUM;
        }
                    
        //Get the FBA fees
        if(!isNaN(thePrice)){
            //S. Stand
            if(theTierNumber == STANDARD_NUM){
                if(largestValue <= 20 && mediumValue <= 15 && smallestValue <= 1 && weight <= 80){
                    theFbaFee = 1.34;
                }else if(largestValue <= 33 && mediumValue <= 23 && smallestValue <= 2.5 && weight <= 460){
                    if(weight <= 460){
                        theFbaFee = 1.38;
                    } else {
                        theFbaFee = 0.00;
                    }
                }else if(largestValue <= 33 && mediumValue <= 23 && smallestValue <= 5 && weight <= 960){ 
                    if(weight <= 960){
                        theFbaFee = 1.84;
                    } else {
                        theFbaFee = 0.00;
                    }
                }else if(largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900){
                    if(weight <= 150){
                        theFbaFee = 1.56;
                    }else if(weight <= 400){
                        theFbaFee = 1.74;
                    }else if(weight <= 900){
                        theFbaFee = 2.56;
                    }else if(weight <= 1400){
                        theFbaFee = 2.71;
                    }else if(weight <= 1900){
                        theFbaFee = 2.78;
                    }else if(weight <= 4900){
                        theFbaFee = 4.16;
                    }else if(weight <= 6900){
                        theFbaFee = 4.54;
                    }else if(weight <= 7900){
                        theFbaFee = 4.80;
                    }else if(weight <= 11900){
                        theFbaFee = 5.02;
                    } else {
                        theFbaFee = 0.00;
                    }
                }
                theTier = STANDARD_STRING_SHORT;
                theFullTierDescription = STANDARD_STRING;
            } 
            //Oversize
            else if(theTierNumber == OVERSIZE_NUM){
                //S. Over
                if(largestValue <= 61 && mediumValue <= 46 && smallestValue <= 46 && weight <= 1760){
                    if(weight <= 1010){
                        theFbaFee = 3.61;
                    }else if(weight <= 1510){
                        theFbaFee = 3.91;
                    }else if(weight <= 1760){
                        theFbaFee = 4.16;
                    }else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_SMALL_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_SMALL_STRING;
                } 
                //R. Over
                else if(largestValue <= 120 && mediumValue <= 60 && smallestValue <= 60 && weight <= 29760){
                    if(weight <= 760){
                        theFbaFee = 3.95;
                    }else if(weight <= 1760){
                        theFbaFee = 4.41;
                    }else if(weight <= 2760){
                        theFbaFee = 4.89;
                    }else if(weight <= 3760){
                        theFbaFee = 4.94;
                    }else if(weight <= 4760){
                        theFbaFee = 5.09;
                    }else if(weight <= 5760){
                        theFbaFee = 6.48;
                    }else if(weight <= 6760){
                        theFbaFee = 6.6;
                    }else if(weight <= 7760){
                        theFbaFee = 6.8;
                    }else if(weight <= 8760){
                        theFbaFee = 7.2;
                    }else if(weight <= 9760){
                        theFbaFee = 7.5;
                    }else if(weight <= 14760){
                        theFbaFee = 8.07;
                    }else if(weight <= 24760){
                        theFbaFee = 8.76;
                    }else if(weight <= 29760){
                        theFbaFee = 9.73;
                    }else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_REGULAR_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_REGULAR_STRING;
                } 
                //L. Over
                else if(largestValue > 120 || mediumValue > 60 || smallestValue > 60){
                    if(weight <= 4760){
                        theFbaFee = 5.09;
                    }else if(weight <= 9760){
                        theFbaFee = 7.5;
                    }else if(weight <= 14760){
                        theFbaFee = 8.11;
                    }else if(weight <= 19760){
                        theFbaFee = 8.76;
                    }else if(weight <= 24760){
                        theFbaFee = 9.5;
                    }else if(weight <= 29760){
                        theFbaFee = 10.9;
                    }else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_LARGE_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_LARGE_STRING;
                } else {
                    theFbaFee = 0.00;
                }
            }

            //Get the referral fee
            referralFee = (thePrice * 0.15)

            //Calculate Variable Closing Fee
            if(theCategory == "Libros" || theCategory == "Video" || theCategory == "DVD & Blu-ray"){
                closingFee = 0.45;
            }

            //Final FBA Fees
            theTotalFbaFee = theFbaFee + referralFee + closingFee;
            theTotalFbaFee = theTotalFbaFee.toFixed(2);
        }//End if we have a price
    }//End if the category is listed and start method two
    else if(completeProcess){
        //Get the tier value
        if(largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900){
            theTier = STANDARD_STRING_SHORT;
            theFullTierDescription = STANDARD_STRING;
            theTierNumber = STANDARD_NUM;
        } else {
            theTier = OVERSIZE_STRING_SHORT;
            theFullTierDescription = OVERSIZE_STRING;
            theTierNumber = OVERSIZE_NUM;
        }

        //Get the FBA fees
        if(!isNaN(thePrice)){
            //Stand
            if(theTierNumber == STANDARD_NUM){
                if(largestValue <= 20 && mediumValue <= 15 && smallestValue <= 1 && weight <= 80){
                    theFbaFee = 1.74;
                }else if(largestValue <= 33 && mediumValue <= 23 && smallestValue <= 2.5 && weight <= 460){
                    if(weight <= 60){
                        theFbaFee = 1.85;
                    } else if(weight <= 210){
                        theFbaFee = 1.90;
                    } else if(weight <= 460){
                        theFbaFee = 1.95;
                    } else {
                        theFbaFee = 0.00;
                    }
                }else if(largestValue <= 33 && mediumValue <= 23 && smallestValue <= 5 && weight <= 960){ 
                    theFbaFee = 1.99;
                }else if(largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900){
                    if(weight <= 150){
                        theFbaFee = 2.17;
                    } else if(weight <= 400){
                        theFbaFee = 2.28;
                    } else if(weight <= 900){
                        theFbaFee = 2.81;
                    } else if(weight <= 1400){
                        theFbaFee = 2.95;
                    } else if(weight <= 1900){
                        theFbaFee = 3.08;
                    } else if(weight <= 2900){
                        theFbaFee = 4.40;
                    } else if(weight <= 3900){
                        theFbaFee = 4.83;
                    } else if(weight <= 4900){
                        theFbaFee = 5.14;
                    } else if(weight <= 6900){
                        theFbaFee = 5.22;
                    } else if(weight <= 10900){
                        theFbaFee = 5.35;
                    } else if(weight <= 11900){
                        theFbaFee = 5.36;
                    } else {
                        theFbaFee = 0.00;
                    }
                }
                theTier = STANDARD_STRING_SHORT;
                theFullTierDescription = STANDARD_STRING;
            } 
            //Oversize
            else if(theTierNumber == OVERSIZE_NUM){
                if(largestValue <= 61 && mediumValue <= 46 && smallestValue <= 46 && weight <= 1760){
                    if(weight <= 1010){
                        theFbaFee = 3.61;
                    }else if(weight <= 1510){
                        theFbaFee = 3.91;
                    }else if(weight <= 1760){
                        theFbaFee = 4.16;
                    } else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_SMALL_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_SMALL_STRING;
                }else if(largestValue <= 120 && mediumValue <= 60 && smallestValue <= 60 && weight <= 29760){
                    if(weight <= 760){
                        theFbaFee = 3.95;
                    }else if(weight <= 1760){
                        theFbaFee = 4.41;
                    }else if(weight <= 2760){
                        theFbaFee = 4.89;
                    }else if(weight <= 3760){
                        theFbaFee = 4.94;
                    }else if(weight <= 4760){
                        theFbaFee = 5.09;
                    }else if(weight <= 5760){
                        theFbaFee = 6.48;
                    }else if(weight <= 6760){
                        theFbaFee = 6.6;
                    }else if(weight <= 7760){
                        theFbaFee = 6.8;
                    }else if(weight <= 8760){
                        theFbaFee = 7.2;
                    }else if(weight <= 9760){
                        theFbaFee = 7.5;
                    }else if(weight <= 14760){
                        theFbaFee = 8.07;
                    }else if(weight <= 24760){
                        theFbaFee = 8.76;
                    }else if(weight <= 29760){
                        theFbaFee = 9.73;
                    }else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_REGULAR_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_REGULAR_STRING;
                }
                //L. Over
                else if(largestValue > 120 || mediumValue > 60 || smallestValue > 60){
                    if(weight <= 4760){
                        theFbaFee = 5.09;
                    }else if(weight <= 9760){
                        theFbaFee = 7.5;
                    }else if(weight <= 14760){
                        theFbaFee = 8.11;
                    }else if(weight <= 19760){
                        theFbaFee = 8.76;
                    }else if(weight <= 24760){
                        theFbaFee = 9.5;
                    }else if(weight <= 29760){
                        theFbaFee = 10.9;
                    }else {
                        theFbaFee = 0.00;
                    }
                    theTier = OVERSIZE_LARGE_STRING_SHORT;
                    theFullTierDescription = OVERSIZE_LARGE_STRING;
                } else {
                    theFbaFee = 0.00;
                }
            }

            //Get the referral fee
            if(theCategory == "Electrónica" || theCategory == "Informática"){
                referralFee = (thePrice * 0.07);
            } else if(theCategory == "Consolas de videojuegos"){
                referralFee = (thePrice * 0.08);
            } else if(theCategory == "Neumáticos"){
                referralFee = (thePrice * 0.10);
            } else if(theCategory == "Trabajo del metal" || theCategory == "Manutención" || 
                theCategory == "Accesorios de informática" || theCategory == "Instrumentos Musicales" || 
                theCategory == "Accesorios de electrónica" || theCategory == "Eléctrica industrial" || 
                theCategory == "Herramientas eléctricas y de mano" || theCategory == "Impresión y escaneo 3D" || theCategory == "Bricolaje y herramientas"){
                referralFee = (thePrice * 0.12);
            } else if(theCategory == "Informática: Ordenadores Portátiles y Tablets"){
                referralFee = (thePrice * 0.05);
            } else if(theCategory == "Joyería"){
                referralFee = (thePrice * 0.20);
            } else {
                referralFee = (thePrice * 0.15);
            }

            //Final FBA Fees
            theTotalFbaFee = theFbaFee + referralFee + closingFee;
            theTotalFbaFee = theTotalFbaFee.toFixed(2);
            theFbaFee = theFbaFee.toFixed(2);
        }//End if we have a price
    }//Other categories
    
    return {theTier: theTier, theFullTierDescription:theFullTierDescription, theTotalFbaFee:theTotalFbaFee, theFbaFee:theFbaFee, theReferralFee: referralFee, theClosingFee:closingFee}
}

//---------------------------------------------------------------//
/*
    Source: http://jsfiddle.net/ruisoftware/ddZfV/7/
    Updated by: Mohammad M. AlBanna
    Copyright © 2017 Jungle Scout
*/

function removeImageBlanks(imageObject) {
    imgWidth = imageObject.width;
    imgHeight = imageObject.height;
    var canvas = document.createElement('canvas');
    canvas.setAttribute("width", imgWidth);
    canvas.setAttribute("height", imgHeight);
    var context = canvas.getContext('2d');
    context.drawImage(imageObject, 0, 0);
    
    var imageData = context.getImageData(0, 0, imgWidth, imgHeight),
        data = imageData.data,
        getRBG = function(x, y) {
            var offset = imgWidth * y + x;
            return {
                red:     data[offset * 4],
                green:   data[offset * 4 + 1],
                blue:    data[offset * 4 + 2],
                opacity: data[offset * 4 + 3]
            };
        },
        isWhite = function (rgb) {
            // many images contain noise, as the white is not a pure #fff white
            return rgb.red > 200 && rgb.green > 200 && rgb.blue > 200;
        },
        scanY = function (fromTop) {
            var offset = fromTop ? 1 : -1;
            
            // loop through each row
            for(var y = fromTop ? 0 : imgHeight - 1; fromTop ? (y < imgHeight) : (y > -1); y += offset) {
                
                // loop through each column
                for(var x = 0; x < imgWidth; x++) {
                    var rgb = getRBG(x, y);
                    if (!isWhite(rgb)) {
                        return y;                        
                    }      
                }
            }
            return null; // all image is white
        },
        scanX = function (fromLeft) {
            var offset = fromLeft? 1 : -1;
            
            // loop through each column
            for(var x = fromLeft ? 0 : imgWidth - 1; fromLeft ? (x < imgWidth) : (x > -1); x += offset) {
                
                // loop through each row
                for(var y = 0; y < imgHeight; y++) {
                    var rgb = getRBG(x, y);
                    if (!isWhite(rgb)) {
                        return x;                        
                    }      
                }
            }
            return null; // all image is white
        };
    
    var cropTop = scanY(true),
        cropBottom = scanY(false),
        cropLeft = scanX(true),
        cropRight = scanX(false),
        cropWidth = cropRight - cropLeft + 5,
        cropHeight = cropBottom - cropTop + 5;
    
    canvas.setAttribute("width", cropWidth);
    canvas.setAttribute("height", cropHeight);
    // finally crop the guy
    canvas.getContext("2d").drawImage(imageObject,
        cropLeft, cropTop, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight);

    return {theCanvas:canvas,canvasData:canvas.toDataURL()};
}

//---------------------------------------------------------------//
//type => Info, success, error
function showPopUpMessage(message, type){
    $(".js-floating-message").removeClass("info success error");   
        $(".js-floating-message p").text(message);    
        $(".js-floating-message").addClass(type);  
        $("#js-table").animate({opacity: 0.2}, 1000);
        //Position the popup to center
        $(".js-floating-message").css({
            "left": ($("section.container").width() - $(".js-floating-message").width())/2, 
            "top": (($("section.container").height() - $(".js-floating-message").height())/2)+20 }).fadeIn("fast");
    
    var timeOutTime = setTimeout(function(){ 
        $(".js-floating-message").fadeOut("slow");
        $("#js-table").animate({opacity: 1}, 1000);
    }, 3000);
}
//---------------------------------------------------------------//
function getASINFromURL(productUrl){
    var asin = "N.A.";
    asin = productUrl.match(asinRegex);
    asin = asin ? asin[0].replace(/(dp\/)|(ASIN\/)|(product\/)|(\/)/,"") : null;
    return asin;
}