/**
 * @Author: Mohammad M. AlBanna
 * Copyright © 2017 Jungle Scout
 * 
 * show/share/save the last screenshot
 */

$(function(){
	//----------------------------------------------------------------------------//
	//Get current saved screenshot
	chrome.storage.local.get(["last_screenshot"],function(result){ 
		if(typeof result.last_screenshot != "undefined"){
			var finalCanvasScreen = document.createElement("canvas");
			var finalCanvasScreenContext = finalCanvasScreen.getContext("2d");

			//Drow screenshot
			var finalScreenshot = new Image();
			finalScreenshot.onload = function(){
				finalCanvasScreen.width = finalScreenshot.width - 10;
				finalCanvasScreen.height = finalScreenshot.height + 30;
				finalCanvasScreenContext.fillStyle = "#FAFAFA";
				finalCanvasScreenContext.fillRect(0,0,finalScreenshot.width - 10,finalScreenshot.height + 30);
				finalCanvasScreenContext.drawImage(finalScreenshot, 0, 0);

				//Drow stroke
				finalCanvasScreenContext.strokeStyle = "#CFCFCF";
			    finalCanvasScreenContext.lineWidth   = 1;
			    finalCanvasScreenContext.strokeRect(0,0, finalScreenshot.width - 10,finalScreenshot.height);
			    finalCanvasScreenContext.strokeRect(0,0, finalScreenshot.width - 10,finalScreenshot.height+30);

			    wmark.init({
					"position": "center",
					"opacity": 20,
					"className": "watermark",
					"path": "../images/js-logo-full.png"
				});
				
			    //Underneath text
				finalCanvasScreenContext.fillStyle="#595959";
				finalCanvasScreenContext.font="bold 13px sans-serif";
				finalCanvasScreenContext.fillText("Data Collected with Jungle Scout. Ready to make Amazon product research easy? Find out more at www.JungleScout.com", (finalScreenshot.width-800)/2, finalScreenshot.height + 20);

				$(".screenshot-image img").attr("src",finalCanvasScreen.toDataURL());
			}//If image loaded
			finalScreenshot.src = result.last_screenshot;
		}else{
			window.close();
		}
	});
	//----------------------------------------------------------------------------//
	//Download btn event
	$("body").on("click","#jsScreenshotDownloadBtn",function(e){
		var downloadedImage = $(".screenshot-image img").attr("src");
		if(downloadedImage){
			var downloadedImage = downloadedImage.replace("image/png","image/octet-stream");
			$(this).attr("download", "JungleScout-screenshot.png");
			$(this).attr("href",downloadedImage);
		}
	});
	//----------------------------------------------------------------------------//
	//Close btn event
	$("body").on("click","#jsScreenshotCloseBtn",function(e){
		e.preventDefault();
		chrome.storage.local.remove("last_screenshot");
		window.close();
	});
	//----------------------------------------------------------------------------//
	//Facebook share buttons
	$("#facebookShare").on("click",function(e){
		e.preventDefault();
		window.open("https://www.facebook.com/dialog/feed?app_id=414409295414333&ref=adcounter&link=http://www.junglescout.com&name=I found this private label product on www.junglescout.com . What do you think?&redirect_uri=https://www.facebook.com&actions=%5B%7B%22name%22%3A%22Get%20It%20Now%22%2C%22link%22%3A%22http%3A%2F%2Fwww.junglescout.com%22%7D%5D");
    });
	//Twitter share buttons
	$("#twitterShare").on("click",function(e){
		e.preventDefault();
        window.open("https://twitter.com/share?via=junglescout&text=I just found the perfect product to private label using http://www.junglescout.com");
    });
	//Google+ share buttons
	$("#googlePlusShare").on("click",function(e){
		e.preventDefault();
        window.open("https://plus.google.com/share?url=http://www.junglescout.com");
    });
});
 