$(document).ready(function () {
    // Construct the catalog query string
    var nycITTdb = 'http://data.cityofnewyork.us/resource/mreg-rk5p.json';
    var nycITTkey = '$$app_token=CWamrEJN7KPGKA51TxJ4k9StU';
    var overlays = [];

    var parsekey = 'QHI0Fuo5IJolPoTAJOw8EqMCjrS6Srk7wSJzwDOC';

    // Intialize our map
    var center = new google.maps.LatLng(40.7127, -74.0059);
    var mapOptions = {
        zoom: 10,
        center: center
    };
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    
    // Retrieve our data and plot it
    var geocoder = new google.maps.Geocoder();
    
	
    $('.btnGo').click(function () {
        var nycITTsql = '?';
        while (overlays[0]) {
            overlays.pop().setMap(null);
        }

        $('.nycITT div').each(function () {
            var query = getQuery($(this));
            nycITTsql += query;
        });
        var nycITTurl = nycITTdb;
        if (nycITTsql.length > 1) nycITTurl += nycITTsql;
        else nycITTurl += "&";
        nycITTurl += nycITTkey
        $.getJSON(nycITTurl, function (data, textstatus) {
            console.log(nycITTurl);
            console.log(data);
            $('.search_results').loadTemplate('search_results_tmpl.html', data, { isFile: true });
            $.each(data, function (i, entry) {
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
                        overlays.push(marker);
                    }
                });
            });
        });
    });

    $('.image').mouseenter(function () {
        $(this).height("64px");
        $(this).width("64px");
    });
    $('.image').mouseleave(function () {
        $(this).height("32px");
        $(this).width("32px");
    });
});

function getQuery($this)
{
    //?interest_area=Engineering
    var filter = $this.attr('id');
    var select = "";
    var query = "";
    $this.find('option:selected').each(function () {
        select += filter + "='" + $(this).attr('value') + "' OR ";
    });
    select = select.slice(0, -4);
    if (select.length > 0) query += select + "&";
    return query;
}