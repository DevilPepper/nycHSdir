$(document).ready(function () {
    // Construct the catalog query string
    url = 'http://data.cityofnewyork.us/resource/mreg-rk5p.json?$select=interest_area,selection_method,borough,program_name&$$app_token=CGxaHQoQlgQSev4zyUh5aR5J3';

    $.getJSON(url, function (data, textstatus) {
        //console.log(data);
        var interest = [];
        var admissionrq = [];
        var program = [];
        var borough = [];
        $.each(data, function (i, entry) {
            if ($.inArray(entry.interest_area, interest) == -1) {
                interest.push(entry.interest_area);
            }
            if ($.inArray(entry.selection_method, admissionrq) == -1) {
                admissionrq.push(entry.selection_method);
            }
            if ($.inArray(entry.program_name, program) == -1) {
                program.push(entry.program_name);
            }
            if ($.inArray(entry.borough, borough) == -1) {
                borough.push(entry.borough);
            }
        });
        interest.sort();
        admissionrq.sort();
        program.sort();
        borough.sort();
        console.log(interest);
        console.log(admissionrq);
        console.log(program);
        console.log(borough);
        $.each(interest, function (j, stuff) {
            $('.inputinterest').append('<option style="font-size:1em;" value="' + stuff + '">' + stuff + '</option>');
            //$('.inputinterest').append('&lt;option value="' + stuff + '"&gt;' + stuff + '&lt;/option&gt;</br>');
        });
        $.each(admissionrq, function (j, stuff) {
            $('.inputadmissionrq').append('<option style="font-size:1em;" value="' + stuff + '">' + stuff + '</option>');
            //$('.inputadmissionrq').append('&lt;option value="' + stuff + '"&gt;' + stuff + '&lt;/option&gt;<br/>');
        });
        $.each(borough, function (j, stuff) {
            $('.inputborough').append('<option style="font-size:1em;" value="' + stuff + '">' + stuff + '</option>');
            //$('.inputborough').append('&lt;option value="' + stuff + '"&gt;' + stuff + '&lt;/option&gt;<br/>');
        });

    });
    $('.one').click(function () {
        $(this).effect('explode');
        $(this).effect('fadein');

    });
    $('.btnGo').click(function () {

        console.log('Hadouken!');
        $('.search_criteria div').each(function () {
            filter = $(this).attr('id');
            console.log(filter);
            $(this).find('option:selected').each(function () {
                select = "+" + $(this).attr('value');
                console.log(filter + ': ' + select);
            });
        });
    });
});
/*
$('.search_criteria').each(function() {
	filter=$(this).attr('id');
	$(this).find('input').is(':checked').each(function() {
		select += "+" +$(this).attr('id');
	});
});
*/

