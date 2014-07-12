$(document).ready(function () {
    // Construct the catalog query string
    url = 'http://data.cityofnewyork.us/resource/mreg-rk5p.json?interest_area=Engineering&$$app_token=CGxaHQoQlgQSev4zyUh5aR5J3';

    // Intialize our map
    var center = new google.maps.LatLng(40.7127, -74.0059);
    var mapOptions = {
        zoom: 10,
        center: center
    };
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);

    // Retrieve our data and plot it
    var geocoder = new google.maps.Geocoder();
    $.getJSON(url, function (data, textstatus) {
        console.log(data);
        $.each(data, function (i, entry) {
		setTimeout(function(){
            geocoder.geocode({
                'address': entry.printed_school_name
            }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    //map.setCenter(results[0].geometry.location);
                    var marker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location,
                        //title: location.name
                        title: entry.printed_school_name
                    });
                }
				}), 1000});
        });
    });
	
$('.btnGo').click(function(){
$.each($('.search_criteria'), function(i, entry) {
	filter=entry.attr('id');
	entry.find('input').is(':checked').each(function(j, test) {
		select = "+" +test.attr('id');
		console.log(filter+': '+select);
		});
	});
});
});