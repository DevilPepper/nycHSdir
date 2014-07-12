$(document).ready(function () {
    // Construct the catalog query string
    url = 'http://data.cityofnewyork.us/resource/mreg-rk5p.json?$select=interest_area,selection_method,borough,program_name&$$app_token=CGxaHQoQlgQSev4zyUh5aR5J3';
	
	$.getJSON(url, function (data, textstatus) {
        //console.log(data);
		var interest = [];
        var selector = [];
		var program = [];
		var borough = [];
		$.each(data, function (i, entry) {
			if ($.inArray(entry.interest_area, interest)==-1) {
				interest.push(entry.interest_area);
			}
			if ($.inArray(entry.selection_method, selector)==-1) {
				selector.push(entry.selection_method);
			}
			if ($.inArray(entry.program_name, program)==-1) {
				program.push(entry.program_name);
			}
			if ($.inArray(entry.borough, borough)==-1) {
				borough.push(entry.borough);
			}
		});
		interest.sort();
		selector.sort();
		program.sort();
		borough.sort();
		console.log(interest);
		console.log(selector);
		console.log(program);
		console.log(borough);
		$.each(interest, function(j, stuff){
			$('.search_result').append('<input type="checkbox" /> ' + stuff + '<br />');
		});
	});
});
/*
$('.btnGo).click(function(){
$('.search_criteria').each(function() {
	filter=$(this).attr('id');
	$(this).find('input').is(':checked').each(function() {
		select += "+" +$(this).attr('id');
		});
	});
});
*/