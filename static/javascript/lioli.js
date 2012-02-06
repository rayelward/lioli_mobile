// JavaScript Document
//
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
	}else {
		//nothing in the entry. do nothing.
	}
	$('#get-entry').button('enable');
}

//checks if a varible has been set.  JS version of a php function
//
function isset(variable)
{
    return (typeof(variable) != 'undefined');
}


$(document).bind("mobileinit", function(){
	//allowing cross site access to lioli.net!
	$.support.cors = true;
	//turn of back button.
	$.mobile.page.prototype.options.addBackBtn= false;

});
