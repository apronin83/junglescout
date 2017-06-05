/**
 * @Author: Mohammad M. AlBanna
 * Copyright © 2017 Jungle Scout
 * 
 * check username and password
 */

//review-junglescout.herokuapp.com
//members.junglescout.com


$(function(){
	//---------------------------------------------------------------------------------//
	//Google Analytics
	var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-52913301-9']);
	_gaq.push(['_trackPageview','login.js']);

	(function() {
	  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	  ga.src = 'https://ssl.google-analytics.com/ga.js';
	  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();
	//---------------------------------------------------------------------------------//
	$("body").on("click","#submit", function(e){
		e.preventDefault();
		$(".message").removeClass("error success info");
		$(".message").addClass("info");
		$(".message").text("Checking...");
		$(".message").fadeIn("fast");

		var username = $("#username").val();
		var password = $("#password").val();
		username = username ? username.trim() : null;
		password = password ? password.trim() : null;

		if(!username || !password){
			$(".message").removeClass("error success info");
			$(".message").addClass("error");
			$(".message").text("Please check username and password!");
			$(".message").fadeIn();
			return false;
		}

		//Contact to API
		$.ajax({
	        url: "https://members.junglescout.com/api/v1/users/initial_authentication",
	        type: "POST",
	        crossDomain: true,
	        data: {username:username, password:password, app:"jsp"},
	        dataType: "json",
	        success:function(result){
	        	$(".message").removeClass("error success info");
	            if(result && result.status){
					$(".message").addClass("success");
					$(".message").text(result.message);
					var obj = {};
				    var key = "auth";
				    obj[key] += "auth";
				    var dailyToken = typeof result.daily_token == "undefined" ? "" : $.trim(result.daily_token);
				    obj[key] = JSON.stringify({username:result.username, last_checked:Date.now(), daily_token:dailyToken});
				    chrome.storage.local.set(obj);
					//Close current page 
					setTimeout(function(){
						window.close();
					}, 3000);
	            }else if (result && !result.status){
	            	$(".message").addClass("error");
					$(".message").text(result.message);
	            }
	            $(".message").fadeIn();
	        },
	        error:function(xhr,status,error){
	        	$(".message").removeClass("error success info");
	            $(".message").addClass("error");
				$(".message").text("Something went wrong, please try again later!");
				$(".message").fadeIn();
	        }
	    });
	});
	//---------------------------------------------------------------------------------//
	$("body").on("keypress","input[name='username'], input[name='password']",function(e){ 
		var key = e.which;
		if(key == 13) { //Entery key code
			$("#submit").click();
			return false;  
		}
	}); 
});