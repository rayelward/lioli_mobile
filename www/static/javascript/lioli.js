// JavaScript Document
//
var baseUrl = "http://lioli.net/init/services/call/json/";

var lioli = {
	//gets entries from their id numbers
	//
	getEntryById: function(id, callback) {
		$.ajax({
			url: baseUrl + "get_entry/" + id,
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
			type: "POST",
			data: "body="+body+"&age="+age+"&gender="+gender,
			success: function(data) {
				callback(data);
			}
		});
	}
};
//Validate submission data then sends it via ajax and responds with the unique_id
//
var entrySubmit = function() {
	$('#errorSubmit').replaceWith('<span id="errorSubmit"></span>');
	var inBody = $('#body').val();
	var inAge = $('#age').val();
	var inGender = $('input:radio:checked').val();
	$('#body').val('');
	//validate:
	if ((isset(inBody) && isset(inAge) && isset(inGender)) && inBody.length != 0){
		lioli.submitEntry(inBody, inAge, inGender, function(data) {
			var id = data.unique_id;
			$('#errorSubmit').replaceWith('<span id="errorSubmit"><p>Thank you.  Your id is '+id+'. Your entry awaits moderator approval.</p></span>');
		});
	} else {
		$('#errorSubmit').replaceWith('<span id="errorSubmit"><p>Please fill out all the forms to submit.</p></span>');
	}
	
}

//gets the entry
//
var getTheEntry = function() {
	$('#entryDetails').replaceWith('<div id="entryDetails"><span id="entry-loves"></span><span id="entry-leaves"></span><span id="entry-age"></span><span id="entry-gender"></span><span id="entry-body"></span></div>');
	var inId = $('#ID').val();
	if (inId.length != 0) {
		lioli.getEntryById(inId, function(data) {
			if (isset(data.wrongid)) {
				$('#entry-body').replaceWith('<span id="entry-body">This entry was not found or has not been approved yet.</span>');
			} else {
				$('#entry-body').replaceWith('<span id="entry-body">'+data.body+'</span>');
				$('#entry-age').replaceWith('<span id="entry-age">Age:'+data.age+'</span>');
				$('#entry-loves').replaceWith('<span id="entry-loves">Loves:'+data.loves+'</span>');
				$('#entry-leaves').replaceWith('<span id="entry-leaves">Leaves:'+data.leaves+'</span>');
				$('#entry-gender').replaceWith('<span id="entry-gender">Gender:'+data.gender+'</span>');
			}
		});
	}else {
		//nothing in the entry. do nothing.
	}
}

//checks if a varible has been set.  JS version of a php function
//
function isset(variable)
{
    return (typeof(variable) != 'undefined');
}