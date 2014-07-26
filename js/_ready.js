$(document).ready(function () {

    //initialize Parse db. class="doe"
    Parse.initialize("MtPQsRRglfpClARD9Gskmv7rdkvUaMCHHJ2G90Ri", "QHI0Fuo5IJolPoTAJOw8EqMCjrS6Srk7wSJzwDOC");
    doedb = Parse.Object.extend("doe");

    //not sure when this is needed //never
    //var parsekey = 'QHI0Fuo5IJolPoTAJOw8EqMCjrS6Srk7wSJzwDOC';

    //KML data for districts
    doeDistrictsKML = "https://data.cityofnewyork.us/api/geospatial/r8nu-ymqj?method=export&format=KML";

    //Socrata db
    nycITTdb = 'http://data.cityofnewyork.us/resource/mreg-rk5p.json?';
    nycITTkey = '&$$app_token=CWamrEJN7KPGKA51TxJ4k9StU';
    nycITTsel = '&$select=program_code,program_name,dbn,printed_school_name,interest_area,selection_method,borough,urls';

    //map pins array
    overlays = [];
    //final array of objects
    parseSODA = [];

    //initialize current and last page and declare how many results should display at a time
    currPage = 1;
    currPage2 = 1;
    lastPage = 1;
    perPage = 4;

    // Intialize our map
    var center = new google.maps.LatLng(40.7127, -74.0059);//NY latitute, longitude coordinates
    var mapOptions = {
        zoom: 10,
        center: center //??
    };
    map = new google.maps.Map($('#map').get(0), mapOptions); //puts a new map in #map, applies some options, and also stores it in a variable

    //Add KML boundaries
    var doeBoundaries = new google.maps.KmlLayer({
        url: doeDistrictsKML,
        map: map
    });


    //new geocoder
    geocoder = new google.maps.Geocoder();




    //now hide the stuff that shouldn't be on the screen yet
    $('.search_results').hide();
    $('.more_info').hide();
    $('.search_criteria').hide();

    //make these things special
    $('#sidebar').accordion({ collapsible: true });
    $('#filters').selectable();



    //these are for jquery-loadTemplate.js
    $.addTemplateFormatter("Program", function (value, options) {
        return "Program name: " + value;
    });
    $.addTemplateFormatter("Interest", function (value, options) {
        return "Interest area: " + value;
    });
    $.addTemplateFormatter("Admission", function (value, options) {
        return "Admission method: " + value;
    });
    $.addTemplateFormatter("Overall", function (value, options) {
        return "Overall ranking: " + value;
    });
    $.addTemplateFormatter("College", function (value, options) {
        return "College-Readiness ranking: " + value;
    });
    $.addTemplateFormatter("Principal", function (value, options) {
        return "Principal " + value;
    });
    $.addTemplateFormatter("Attend", function (value, options) {
        return "Attendance rate: " + value;
    });
    $.addTemplateFormatter("Post2nd", function (value, options) {
        return "Post secondary enrollment rate: " + value;
    });
    $.addTemplateFormatter("Bold", function (value, options) {
        return "<b>" + value + "</b>";
    });
	

    

    //click events for next and previous buttons. They load next page of results
    $('#prevPage').click(function () {
        if (currPage > 1) renderTemplates($('.result_wrapper'), 'search_results_tmpl.html', parseSODA, --currPage, perPage);
    });
    $('#nextPage').click(function () {
        if (currPage < lastPage) renderTemplates($('.result_wrapper'), 'search_results_tmpl.html', parseSODA, ++currPage, perPage);
    });
    //these were rushed. I don't really want to rename them, though
    $('#previous2').click(function () {
        if (currPage2 > 1) renderTemplates($('.print_wrapper'), 'print_tmpl.html', parseSODA, --currPage2, 1);
    });
    $('#next2').click(function () {
        if (currPage2 < parseSODA.length) renderTemplates($('.print_wrapper'), 'print_tmpl.html', parseSODA, ++currPage2, 1);
    });
    $('.printIT').click(function () {
        renderTemplates($('.print_wrapper'), 'print_tmpl.html', parseSODA, currPage2, 1);
        $('.more_info').show();
    });
    
});