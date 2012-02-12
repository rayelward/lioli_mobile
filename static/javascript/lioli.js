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
			success: function(data) {
				callback(data);
			}
		});
	},
	//gets the 10 most recent entries
	//
	getRecents: function(page, callback) {
		$.ajax({
			url: baseUrl + "recents/" + page,
			cache: false,
			success: function(data) {
				callback(data);
			}
		});
	},
	//adds love count and gets the current count for an id
	//
	addLoves: function(id, callback) {
		$.ajax({
			url: baseUrl + "add_loves/" + id,
			cache: false,
			success: function(data) {
				callback(data);
			}
		});
	},
	//adds leave count and get the current count for an id
	//
	addLeaves: function(id, callback) {
		$.ajax({
			url: baseUrl + "add_leaves/" + id,
			cache: false,
			success: function(data) {
				callback(data);
			}
		});
	},
	//gets 10 random entry to be displayed
	//
	randomTen: function(callback) {
		$.ajax({
			url: baseUrl + "random_ten/",
			cache: false,
			success: function(data) {
				callback(data);
			}
		});
	},
	//submits and entry and returns the unique id for the user to look up later
	//
	submitEntry: function(body, age, gender, callback) {
		$.ajax({
			url: baseUrl + "submit/",
			cache: false,
			type: "GET",
			data: "body="+escape(body)+"&age="+age+"&gender="+gender,
			success: function(data) {
				callback(data);
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
var injectMostRecents = function(entries) {
	recentEntries = recentEntries.concat(entries);
	$.each(entries, function(index, entry) {
		entryNumber = (recentPageCount * 10) + index;
		$('#recentsList').append('<li><a href="singleEntryPage.html?number=' + entryNumber + '" data-transition="pop"' +
				'<p><strong>' + entry.body + '</strong></p>' +
				'<p><em>Age:' + entry.age + ' Gender:' + entry.gender + '</em></p>' +
				'<p><strong>ID:' + entry.unique_id + '</strong></p>' +
				'</a></li>');
	});
	recentPageCount += 1;
	$('#recentsList').append('<li><a onclick="updateRecents();"><h2>Load more</h2></a></li>');
	$('#recentsList').listview('refresh');
}
//called when user asks to load more recent entries
//
var updateRecents = function() {
	$('ul#recentsList li:last-child').remove();
	lioli.getRecents(recentPageCount, injectMostRecents);
}


//init the recents page and we need to load it up with some data.
//
$("#recentsPage").live('pageinit', function(event) {
	recentEntries = new Array();
	recentPageCount = 0;
	lioli.getRecents(recentPageCount, injectMostRecents);
});
//init with the individual pages.
//
$('#singleEntryPage').live('pageshow', function(event) {
	var number = getUrlVars()["number"];
	entry = recentEntries[number];
	
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
	
	$('#voteLoves').hide();
	$('#voteLeaves').hide();
	
	$('#voteForLeave').click(function() {
		$('#voteForLeave').fadeOut('slow', function(){$('#voteLeaves').fadeIn('fast');});
		$('#voteForLove').fadeOut('slow', function(){$('#voteLoves').fadeIn('fast');});
		lioli.addLeaves(entry.unique_id, function(data){$('#voteLeaves').text("Leaves: "+ data.newleaves);});
	});
	$('#voteForLove').click(function() {
		$('#voteForLeave').fadeOut('slow', function(){$('#voteLeaves').fadeIn('fast');});
		$('#voteForLove').fadeOut('slow', function(){$('#voteLoves').fadeIn('fast');});
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
		$.mobile.changePage( "randomPage.html", {reloadPage: true, allowSamePageTranstion: true, transition: 'flip', reverse: true});
	});
	$("div#randomPage").unbind('swiperight');
	$("div#randomPage").bind('swiperight',function(event, ui){
		$.mobile.changePage( "randomPage.html", {reloadPage: true, allowSamePageTranstion: true, transition: 'flip'});

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
	
	$('#randomLoves').hide();
	$('#randomLeaves').hide();
	
	$('#randomForLeave').click(function() {
		$('#randomForLeave').fadeOut('slow', function(){$('#randomLeaves').fadeIn('fast');});
		$('#randomForLove').fadeOut('slow', function(){$('#randomLoves').fadeIn('fast');});
		lioli.addLeaves(entry.unique_id, function(data){$('#randomLeaves').text("Leaves: "+ data.newleaves);});
	});
	$('#randomForLove').click(function() {
		$('#randomForLeave').fadeOut('slow', function(){$('#randomLeaves').fadeIn('fast');});
		$('#randomForLove').fadeOut('slow', function(){$('#randomLoves').fadeIn('fast');});
		lioli.addLoves(entry.unique_id, function(data){$('#randomLoves').text("Loves: "+ data.newloves);});
	});
	$('#nextButton').click(function() {
		$.mobile.changePage( "randomPage.html", {reloadPage: true, allowSamePageTranstion: true, transition: 'flip'});
	});
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
//called when mobile is set up and ready to go.  Kinda like a $(document).ready(function(){});
//
$(document).bind("mobileinit", function() {
	//allowing cross site access to lioli.net!
	$.support.cors = true;
	$.mobile.touchOverflowEnabled = true;
});
