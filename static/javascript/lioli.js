// 	lioli.js
//  Created by Raymond Elward
//  February 2012
/*
 *needed for all connections 
 */
var baseUrl = "http://lioli.net/init/services/call/json/";

var lioli = {
	//gets entries from their id numbers
	//
	getEntryById: function(id, callback) {
		$.ajax({
			url: baseUrl + "get_entry/" + escape(id),
			cache: false,
			dataType: "json",
			success: function(data) {
				var obj = (typeof(data) == 'string') ? jQuery.parseJSON(data) : data;
				callback(obj);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				alert('There was an error reaching the server.');
			}
		});
	},
	//gets the 10 most recent entries
	//
	getRecents: function(page, callback) {
		$.ajax({
			url: baseUrl + "recents/" + page,
			cache: false,
			dataType: "json",
			success: function(data) {
				var obj = (typeof(data) == 'string') ? jQuery.parseJSON(data) : data;
				callback(obj);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				alert('There was an error reaching the server.');
			}
		});
	},
	//adds love count and gets the current count for an id
	//
	addLoves: function(id, callback) {
		$.ajax({
			url: baseUrl + "add_loves/" + id,
			cache: false,
			dataType: "json",
			success: function(data) {
				var obj = (typeof(data) == 'string') ? jQuery.parseJSON(data) : data;
				callback(obj);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				alert('There was an error reaching the server.');
			}
		});
	},
	//adds leave count and get the current count for an id
	//
	addLeaves: function(id, callback) {
		$.ajax({
			url: baseUrl + "add_leaves/" + id,
			cache: false,
			dataType: "json",
			success: function(data) {
				var obj = (typeof(data) == 'string') ? jQuery.parseJSON(data) : data;
				callback(obj);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				alert('There was an error reaching the server.');
			}
		});
	},
	//gets 10 random entry to be displayed
	//
	randomTen: function(callback) {
		$.ajax({
			url: baseUrl + "random_ten/",
			cache: false,
			dataType: "json",
			success: function(data) {
				var obj = (typeof(data) == 'string') ? jQuery.parseJSON(data) : data;
				callback(obj);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				alert('There was an error reaching the server.');
			}
		});
	},
	//submits and entry and returns the unique id for the user to look up later
	//
	submitEntry: function(body, age, gender, callback) {
		$.ajax({
			url: baseUrl + "submit/",
			cache: false,
			dataType: "json",
			type: "GET",
			data: "body="+escape(body)+"&age="+age+"&gender="+gender,
			success: function(data) {
				var obj = (typeof(data) == 'string') ? jQuery.parseJSON(data) : data;
				callback(obj);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				alert('There was an error reaching the server.');
			}
		});
	}
};
/*
 *needed for submitPage
 */
//Validate submission data then sends it via ajax and responds with the unique_id
//
var entrySubmit = function() {
	//hide submit button until request is done
	$('#entry-submit').button('disable');
	$('#submitResponse').text('');
	var inBody = $('#body').val();
	var inAge = $('#age').val();
	var inGender = $('input:radio:checked').val();
	if (inBody.length > 1200) {
		$('#submitResponse').text('Your entry is too long, please keep it under 1200 characters.');
		$('#entry-submit').button('enable');
		return;
	}
	
	//validate
	if ((isset(inBody) && isset(inAge) && isset(inGender)) && inBody.length != 0){
		lioli.submitEntry(inBody, inAge, inGender, function(data) {
			var id = data.unique_id;
			$('#submitResponse').text('Thank you.  Your id is '+id+'. Your entry awaits moderator approval.');
		});
	} else {
		$('#submitResponse').text('Please fill out all the forms to submit.');
	}
	$('#entry-submit').button('enable');
}
/*
 *needed for searchPage
 */
//gets the entry
//
var getTheEntry = function() {
	$('#get-entry').button('disable');
	$('#entry-body').text("");
	$('#entry-age').text("");
	$('#entry-loves').text("");
	$('#entry-leaves').text("");
	$('#entry-gender').text("");
	var inId = $('#ID').val();
	if (inId.length != 0) {
		lioli.getEntryById(inId, function(data) {
			if (isset(data.wrongid)) {
				$('#entry-body').text('This entry was not found or has not been approved yet.');
			} else {
				$('#entry-body').text(data.body);
				$('#entry-age').text("Age: "+data.age);
				$('#entry-loves').text("Loves: "+data.loves);
				$('#entry-leaves').text("Leaves: "+data.leaves);
				$('#entry-gender').text("Gender: "+data.gender);
			}
		});
	} else {
		//nothing in the entry. do nothing.
	}
	$('#get-entry').button('enable');
}
/*
 *needed for recentsPage
 */
var recentEntries;
var recentPageCount;
//sets up the list of most recent entries.
//
var injectMostRecents = function(entries, callback) {
	recentEntries = recentEntries.concat(entries);
	$.each(entries, function(index, entry) {
		entryNumber = (recentPageCount * 10) + index;
		var extra = (entry.body.length > 100) ? "..." : "";
		$('#recentsList').append('<li><a href="singleEntryPage.html?number=' + entryNumber + 
				'" data-transition="pop" style="white-space:normal" ' +
				'<p><strong>'+entry.body.substring(0, 100)+extra+'</strong></p>' +
				'<br />' +
				'<p><em>Age:' + entry.age + ' Gender:' + entry.gender + '</em></p>' +
				'<p><strong>ID:' + entry.unique_id + '</strong></p>' +
				'</a></li>');
	});
	recentPageCount += 1;
	$('#recentsList').append('<li><a onclick="updateRecents(function(){});"><h2>Load more...</h2></a></li>');
	$('#recentsList').listview('refresh');
	callback
}
//called when user asks to load more recent entries
//
var updateRecents = function(callback) {
	$('ul#recentsList li:last-child').remove();
	lioli.getRecents(recentPageCount, function(data){
		injectMostRecents(data, callback);
	});
}


//init the recents page and we need to load it up with some data.
//
$("#recentsPage").live('pageinit', function(event) {
	//$.mobile.touchOverflowEnabled = true;
	$.support.cors = true;
	recentEntries = new Array();
	recentPageCount = 0;
	lioli.getRecents(recentPageCount, injectMostRecents);
});
//init with the individual pages.
//
$('#singleEntryPage').live('pageshow', function(event) {
	var number = getUrlVars()["number"];
	entry = recentEntries[number];
	$('#voteForLeave').hide();
	$('#voteForLove').hide();
	
	$("div#singleEntryPage").unbind('swiperight');
	$("div#singleEntryPage").unbind('swipeleft');
	$("div#singleEntryPage").bind('swiperight',function(event, ui){
		var newPageNumber = parseInt(number) - 1;
		if ( isset(recentEntries[newPageNumber]) ){
			$.mobile.changePage("singleEntryPage.html?number="+newPageNumber, { transition: "slide", reverse: true});
		}
	});
	$("div#singleEntryPage").bind('swipeleft',function(event, ui){
		var newPageNumber = parseInt(number) + 1;
		if ( isset(recentEntries[newPageNumber]) ){
			$.mobile.changePage("singleEntryPage.html?number="+newPageNumber, { transition: "slide"});
		} else {
			updateRecents(function(){
				$.mobile.changePage("singleEntryPage.html?number="+newPageNumber, { transition: "slide"});
			});
			
		}
	});
	setUpDetails(entry);
});

//set up individual page
//
var setUpDetails = function(entry) {
	$('#voteId').text('ID: '+entry.unique_id);
	$('#voteAge').text("Age: "+entry.age);
	$('#voteGender').text("Gender: "+entry.gender);
	$('#voteLoves').text("Loves: "+entry.loves);
	$('#voteBody').text(entry.body);
	$('#voteLeaves').text("Leaves: " + entry.leaves);
	$('#voteForLeave').show();
	$('#voteForLove').show();
	
	$('#voteLoves').hide();
	$('#voteLeaves').hide();
	
	$('#voteForLeave').click(function() {
		$('#voteForLeave').hide();
		$('#voteForLove').hide();
		$('#voteLeaves').show();
		$('#voteLoves').show();
		lioli.addLeaves(entry.unique_id, function(data){$('#voteLeaves').text("Leaves: "+ data.newleaves);});
	});
	$('#voteForLove').click(function() {
		$('#voteForLeave').hide();
		$('#voteForLove').hide();
		$('#voteLeaves').show();
		$('#voteLoves').show();
		lioli.addLoves(entry.unique_id, function(data){$('#voteLoves').text("Loves: "+ data.newloves);});
	});
}
/*
 * Needed for randomPage
 */
var randomEntries = Array();
//initializes random entry page
//
$('#randomPage').live('pageshow', function(event) {
	$("div#randomPage").unbind('swipeleft');
	$("div#randomPage").bind('swipeleft',function(event, ui){
		$.mobile.changePage( "randomPage.html", {reloadPage: true, allowSamePageTranstion: true, transition: 'slide'});
	});
	
	if (randomEntries.length == 0){
		lioli.randomTen(function(data){
			randomEntries = data;
			setupRandomPage(randomEntries.shift());
		});
	} else {
		setupRandomPage(randomEntries.shift());
	}
});
//Sets up the random page.
//
var setupRandomPage = function(entry) {
	$('#randomID').text('ID: '+entry.unique_id);
	$('#randomAge').text("Age: "+entry.age);
	$('#randomGender').text("Gender: "+entry.gender);
	$('#randomLoves').text("Loves: "+entry.loves);
	$('#randomBody').text(entry.body);
	$('#randomLeaves').text("Leaves: " + entry.leaves);
	$('#randomForLove').show();
	$('#randomForLeave').show();
	$('#nextButton').show();
	
	$('#randomLoves').hide();
	$('#randomLeaves').hide();
	
	$('#randomForLeave').click(function() {
		$('#randomForLeave').hide();
		$('#randomForLove').hide();
		$('#randomLeaves').show();
		$('#randomLoves').show();
		lioli.addLeaves(entry.unique_id, function(data){$('#randomLeaves').text("Leaves: "+ data.newleaves);});
	});
	$('#randomForLove').click(function() {
		$('#randomForLeave').hide();
		$('#randomForLove').hide();
		$('#randomLeaves').show();
		$('#randomLoves').show();
		lioli.addLoves(entry.unique_id, function(data){$('#randomLoves').text("Loves: "+ data.newloves);});
	});
}
//function called onCick on the next button from random.
//
var nextButtonClick = function() {
		$.mobile.changePage( "randomPage.html", {reloadPage: true, allowSamePageTranstion: true, transition: 'slide'});
}
/*
 * Helpers for all pages.
 */
//checks if a varible has been set.  JS version of a php function
//
function isset(variable) {
    return (typeof(variable) != 'undefined');
}
//helper to grab url varibles
//
function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}


/*
 * Helpers for having content fill the entire page.
 */
var fixgeometry = function() {
	/* Some orientation changes leave the scroll position at something
	 * that isn't 0,0. This is annoying for user experience. */
	scroll(0, 0);

	/* Calculate the geometry that our content area should take */
	var header = $(".header:visible");
	var footer = $(".footer:visible");
	var content = $(".ui-content");
	var viewport_height = $(window).height();

	var content_height = viewport_height - header.outerHeight() - footer.outerHeight();

	/* Trim margin/border/padding height */
	content_height -= (content.outerHeight() - content.height());
	content.css('min-height',content_height);
}; /* fixgeometry */

$(document).ready(function() {
	$(window).bind("orientationchange pageshow", fixgeometry);
});

/*
 * analytics.
 */
 $('[data-role=page]').live('pageshow', function (event, ui) {
    try {
        _gaq.push(['_setAccount', 'UA-26980302-1']);

        hash = location.hash;

        if (hash) {
            _gaq.push(['_trackPageview', hash.substr(1)]);
        } else {
            _gaq.push(['_trackPageview']);
        }
    } catch(err) {

    }

});
 
/*
 * TODO: advertising.
 */