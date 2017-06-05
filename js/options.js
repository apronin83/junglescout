/**
 * @Author: Mohammad M. AlBanna
 * Copyright © 2017 Jungle Scout
 *
 * Contains user options functions and events
 */

//All UK now is EU, and so on!
$(function() {
    //If the file has injected many times
    if($(".jsContainer").length >= 1){
        return;
    }

    var arrayOfAllMWSKeys = ["mws_keys", "us_mws_keys", "uk_mws_keys", "in_mws_keys"];

    //On click on close button
    $("body").on("click", ".js-options-section #jsOptionsCloseButton", function(e) {
        e.preventDefault();
        $(".js-options-section").fadeOut();
    });
    //----------------------------------------------------------------------------------//
    //Updates Setting
    $("body").on("change", ".js-options-section input[type='checkbox']", function() {

        var checkedElement = $(this);
        //Check columns that need keys to be stored
        chrome.storage.local.get(arrayOfAllMWSKeys, function(result){ 
            if(typeof result.mws_keys == "undefined" && typeof result.us_mws_keys == "undefined" && typeof result.uk_mws_keys == "undefined" && typeof result.in_mws_keys == "undefined"){
                if(checkedElement.parent().index() >= 9 &&  checkedElement.parent().index() <= 16){
                    alert("This column needs MWS API Keys, please go to API Keys page and insert your keys.");
                    checkedElement.prop("checked", false);
                    return false;
                }
            }

            if (checkedElement.is(":checked")) {
                syncStorage(checkedElement.attr("name"), "Y");
            } else {
                syncStorage(checkedElement.attr("name"), "N");
            }
        });
    });
    //----------------------------------------------------------------------------------//
    //Close and Refresh button
    $("body").on("click", ".js-options-section #jsOptionsCloseAndRefresh", function(e) {
        e.preventDefault();
        localStorage("runJS", tabUrl);
        //Send message to refresh Amazon pages
        chrome.runtime.sendMessage({
            action: "refreshAmazonPages"
        });
        //Fade it out.
        $(".js-options-section").fadeOut();
    });

    //Show options popup
    $("body").on("click", "section.jsContainer #optionsPage",function(e){
        e.preventDefault();

        //Hide other popups
        hidePopups(".js-filter-section, .js-product-history-section, .js-trend-chart-section");

        if($(".js-options-section").is(":visible")){
            $(".js-options-section").fadeOut();
        }else{
            //Position the popup to center
            $(".js-options-section").css({
                "left": ($("section.container").width() - $(".js-options-section").width())/2, 
                "top": (($("section.container").height() - $(".js-options-section").height())/2)+30});

            //View the popup
            $(".js-options-section").fadeIn();
            //Send google analytics
            chrome.runtime.sendMessage({
                action: "googleAnalyticsAction",
                page: "options.js"
            });

            //Check the keys
            checkKeysFromStorage();

            //Load Setting/Columns
            chrome.storage.sync.get(null,function(result){
                if( result.columnBrand == "Y"){
                    $(".js-options-section input[type='checkbox']#columnBrand").prop("checked", true);
                }else{
                    $(".js-options-section input[type='checkbox']#columnBrand").prop("checked", false);
                }

                if(result.columnPrice == "Y"){
                    $(".js-options-section input[type='checkbox']#columnPrice").prop("checked", true);
                }else{
                    $(".js-options-section input[type='checkbox']#columnPrice").prop("checked", false);
                }

                if(result.columnCategory == "Y"){
                    $(".js-options-section input[type='checkbox']#columnCategory").prop("checked", true);
                }else{
                    $(".js-options-section input[type='checkbox']#columnCategory").prop("checked", false);
                }

                if(result.columnRank == "Y"){
                    $(".js-options-section input[type='checkbox']#columnRank").prop("checked", true);
                }else{
                    $(".js-options-section input[type='checkbox']#columnRank").prop("checked", false);
                }

                if(result.columnEstSales == "Y"){
                    $(".js-options-section input[type='checkbox']#columnEstSales").prop("checked", true);
                }else{
                    $(".js-options-section input[type='checkbox']#columnEstSales").prop("checked", false);
                }

                if(result.columnEstRevenue == "Y"){
                    $(".js-options-section input[type='checkbox']#columnEstRevenue").prop("checked", true);
                }else{
                    $(".js-options-section input[type='checkbox']#columnEstRevenue").prop("checked", false);
                }

                if(result.columnNumReviews == "Y"){
                    $(".js-options-section input[type='checkbox']#columnNumReviews").prop("checked", true);
                }else{
                    $(".js-options-section input[type='checkbox']#columnNumReviews").prop("checked", false);
                }

                if(result.columnRating == "Y"){
                    $(".js-options-section input[type='checkbox']#columnRating").prop("checked", true);
                }else{
                    $(".js-options-section input[type='checkbox']#columnRating").prop("checked", false);
                }

                if(result.columnBbSeller == "Y"){
                    $(".js-options-section input[type='checkbox']#columnBbSeller").prop("checked", true);
                }else{
                    $(".js-options-section input[type='checkbox']#columnBbSeller").prop("checked", false);
                }

                //Check columns that need mws keys
                chrome.storage.local.get(arrayOfAllMWSKeys, function(mwsResult){ 
                    //I need just one of stores API keys to be OK 
                    var oneOfKeysIsOK = typeof mwsResult.mws_keys != "undefined" || typeof mwsResult.us_mws_keys != "undefined" || typeof mwsResult.uk_mws_keys != "undefined" || typeof mwsResult.in_mws_keys != "undefined" ? true : false;
                   
                    if(oneOfKeysIsOK && result.columnFbaFee == "Y"){
                        $(".js-options-section input[type='checkbox']#columnFbaFee").prop("checked", true);
                    }else{
                        $(".js-options-section input[type='checkbox']#columnFbaFee").prop("checked", false);
                    }

                    if(oneOfKeysIsOK && result.columnTier == "Y"){
                        $(".js-options-section input[type='checkbox']#columnTier").prop("checked", true);
                    }else{
                        $(".js-options-section input[type='checkbox']#columnTier").prop("checked", false);
                    }

                    if(oneOfKeysIsOK && result.columnNewSeller == "Y"){
                        $(".js-options-section input[type='checkbox']#columnNewSeller").prop("checked", true);
                    }else{
                        $(".js-options-section input[type='checkbox']#columnNewSeller").prop("checked", false);
                    }

                    if(oneOfKeysIsOK && result.columnItemWidth == "Y"){
                        $(".js-options-section input[type='checkbox']#columnItemWidth").prop("checked", true);
                    }else{
                        $(".js-options-section input[type='checkbox']#columnItemWidth").prop("checked", false);
                    }

                    if(oneOfKeysIsOK && result.columnItemHeight == "Y"){
                        $(".js-options-section input[type='checkbox']#columnItemHeight").prop("checked", true);
                    }else{
                        $(".js-options-section input[type='checkbox']#columnItemHeight").prop("checked", false);
                    }

                    if(oneOfKeysIsOK && result.columnItemLength == "Y"){
                        $(".js-options-section input[type='checkbox']#columnItemLength").prop("checked", true);
                    }else{
                        $(".js-options-section input[type='checkbox']#columnItemLength").prop("checked", false);
                    }

                    if(oneOfKeysIsOK && result.columnItemWeight == "Y"){
                        $(".js-options-section input[type='checkbox']#columnItemWeight").prop("checked", true);
                    }else{
                        $(".js-options-section input[type='checkbox']#columnItemWeight").prop("checked", false);
                    }

                    if(oneOfKeysIsOK && result.columnNet == "Y"){
                        $(".js-options-section input[type='checkbox']#columnNet").prop("checked", true);
                    }else{
                        $(".js-options-section input[type='checkbox']#columnNet").prop("checked", false);
                    }
                });
            });//Check columns that needed MWS Keys
        }
    });
    
    //---------------------------------------------------------------------//
    //Check keys from the storage
    function checkKeysFromStorage(){
        chrome.storage.local.get(arrayOfAllMWSKeys, function(result){ 
            var mwsPopupPath = chrome.extension.getURL("mwsAPI.html");
            if(typeof result.us_mws_keys != "undefined" || typeof result.uk_mws_keys != "undefined" || typeof result.in_mws_keys != "undefined"){
                $(".js-options-section #jsMWSKeysStatus").html("High Five! One or more of supported stores have API Keys! <a class=\"orange-btn\" target=\"_bank\" id=\"jsMWSKeysRefresh\" href='"+mwsPopupPath+"'>API Keys Page</a>");
            }else{
                $(".js-options-section #jsMWSKeysStatus").html("Aw Shucks...Jungle Scout can't find your API Keys. <a class=\"orange-btn\" target=\"_bank\" id=\"jsMWSKeysPage\" href='"+mwsPopupPath+"'>Enter API Keys</a>");
            }
        });
    }
});
