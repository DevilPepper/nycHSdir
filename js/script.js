$(document).ready(function () {
    // Construct the catalog query string
    var nycITTdb = 'http://data.cityofnewyork.us/resource/mreg-rk5p.json';
    var nycITTkey = '$$app_token=CWamrEJN7KPGKA51TxJ4k9StU';
    var overlays = [];
    var resultsStore = [];
    var currPage = 1;
    var lastPage = 1;
    var perPage = 5;

    var parsekey = 'QHI0Fuo5IJolPoTAJOw8EqMCjrS6Srk7wSJzwDOC';

    $('.search_results').hide();

    // Intialize our map
    var center = new google.maps.LatLng(40.7127, -74.0059);
    var mapOptions = {
        zoom: 10,
        center: center
    };
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    
    // Retrieve our data and plot it
    var geocoder = new google.maps.Geocoder();
    
    $.addTemplateFormatter("Program", function (value, options) {
        return "Program name: " + value;
    });
    $.addTemplateFormatter("Interest", function (value, options) {
        return "Interest area: " + value;
    });
    $.addTemplateFormatter("Admission", function (value, options) {
        return "Admission method: " + value;
    });
    $.addTemplateFormatter("Bold", function (value, options) {
        return "<b>" + value + "</b>";
    });
	
    $('.btnGo').click(function () {
        collapseIT($('#search_collapse'));
        var nycITTsql = '?';
        while (overlays[0]) {
            overlays.pop().setMap(null);
        }
        while (resultsStore[0]) {
            resultsStore.pop();
        }

        $('.nycITT div').each(function () {
            var query = getQuery($(this));
            nycITTsql += query;
        });
        var nycITTurl = nycITTdb;
        if (nycITTsql.length > 1) nycITTurl += nycITTsql;
        else nycITTurl += "&";
        nycITTurl += nycITTkey
        $.getJSON(nycITTurl, function (searchResults, textstatus) {
            console.log(nycITTurl);
            console.log(searchResults);
            resultsStore = searchResults;
            currPage = 1;
            lastPage = Math.ceil(searchResults.length / perPage);
            renderTemplates($('.result_wrapper'), 'search_results_tmpl.html', searchResults, currPage, perPage);
            //$('.search_results').loadTemplate('search_results_tmpl.html', searchResults, { isFile: true, paged: true, pageNo: currPage, elemPerPage: 5 });
            $('.search_results').show();
            $.each(searchResults, function (i, entry) {
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



    $('#prevPage').click(function () {
        if (currPage > 1) renderTemplates($('.result_wrapper'), 'search_results_tmpl.html', resultsStore, --currPage, perPage);
    });
    $('#nextPage').click(function () {
        if (currPage < lastPage) renderTemplates($('.result_wrapper'), 'search_results_tmpl.html', resultsStore, ++currPage, perPage);
    });
    
});

$(document).on('click', '.result_name', function () {
    console.log($(this).parent().attr('id'));
});

$(document).on('click', '.collapsable button', function () {
    collapseIT($(this).parent());
});

function collapseIT($this){
    $this.children('button').toggle(function () {
        $(this).text('+');
    }, function () {
        $(this).text('-');
    });
    $this.children('div').slideToggle('slow');
}

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

function renderTemplates($dest, $tmpl, data, pageNo, perPage) {
    $dest.loadTemplate($tmpl, data, { isFile: true, paged: true, pageNo: pageNo, elemPerPage: perPage });
}