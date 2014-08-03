var stuff = {
    //Parse db
    doedb: null,
    
    schoolData: null,

    //KML data for districts
    doeDistrictsKML: 'https://data.cityofnewyork.us/api/geospatial/r8nu-ymqj?method=export&format=KML',

    //Socrata db
    nycITTdb: 'http://data.cityofnewyork.us/resource/mreg-rk5p.json?',
    nycITTkey: '&$$app_token=CWamrEJN7KPGKA51TxJ4k9StU',
    nycITTsel: '&$select=program_code,program_name,dbn,printed_school_name,interest_area,selection_method,borough,urls',

    //map pins array
    overlays: [],
    //final array of objects
    parseSODA: [],

    currPage: 1,
    currPage2: 1,
    lastPage: 1,
    perPage: 4,

    map: null,

    mapOptions: null,

    center: null,

    //new geocoder
    geocoder: null,

    myPlace: null,

    circle: null,

    genesis: function () {

        //not sure when this is needed //never
        //var parsekey = 'QHI0Fuo5IJolPoTAJOw8EqMCjrS6Srk7wSJzwDOC';

        //map pins array
        stuff.overlays = [];
        //final array of objects
        stuff.parseSODA = [];

        //initialize current and last page and declare how many results should display at a time
        stuff.currPage = 1;
        stuff.currPage2 = 1;
        stuff.lastPage = 1;
        stuff.perPage = 4;

        // Intialize our map
        stuff.center = new google.maps.LatLng(40.7127, -74.0059);//NY latitute, longitude coordinates
        stuff.mapOptions = {
            zoom: 10,
            center: stuff.center //??
        };
        stuff.map = new google.maps.Map($('#map').get(0), stuff.mapOptions); //puts a new map in #map, applies some options, and also stores it in a variable

        //Add KML boundaries
        /*
        var doeBoundaries = new google.maps.KmlLayer({
            url: doeDistrictsKML,
            map: map
        });
        */
        //console.log(doeBoundaries);


        //new geocoder
        stuff.geocoder = new google.maps.Geocoder();




        //now hide the stuff that shouldn't be on the screen yet
        $('.search_results').hide();
        $('.more_info').hide();
        $('.search_criteria').hide();

        stuff.circle = new google.maps.Circle({
            strokeColor: "#00FF00",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#0000FF",
            fillOpacity: 0.35,
            map: stuff.map,
            radius: 500
        });

        //make these things special
        $('#sidebar').accordion({ collapsible: true });
        $('#filters').selectable();
        $('#myRadius').slider({
            range: "min",
            max: 10000,
            min: 500,
            value: 500,
            step: 0.5,
            orientation: "horizontal",
            slide: function (event, ui) {
                updateRadius(circle, ui.value);
            }
        });


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
            if (stuff.currPage > 1) renderTemplates($('.result_wrapper'), 'search_results_tmpl.html', stuff.parseSODA, --stuff.currPage, stuff.perPage);
        });
        $('#nextPage').click(function () {
            if (stuff.currPage < stuff.lastPage) renderTemplates($('.result_wrapper'), 'search_results_tmpl.html', stuff.parseSODA, ++stuff.currPage, stuff.perPage);
        });
        //these were rushed. I don't really want to rename them, though
        $('#previous2').click(function () {
            if (stuff.currPage2 > 1) renderTemplates($('.print_wrapper'), 'print_tmpl.html', stuff.parseSODA, --stuff.currPage2, 1);
        });
        $('#next2').click(function () {
            if (stuff.currPage2 < stuff.parseSODA.length) renderTemplates($('.print_wrapper'), 'print_tmpl.html', stuff.parseSODA, ++stuff.currPage2, 1);
        });
        $('.printIT').click(function () {
            renderTemplates($('.print_wrapper'), 'print_tmpl.html', stuff.parseSODA, stuff.currPage2, 1);
            $('.more_info').show();
        });
    },

    parseInit: function () {
        if (stuff.doedb == null || stuff.schoolData == null) {
            //initialize Parse db
            Parse.initialize("MtPQsRRglfpClARD9Gskmv7rdkvUaMCHHJ2G90Ri", "QHI0Fuo5IJolPoTAJOw8EqMCjrS6Srk7wSJzwDOC");
            stuff.doedb = Parse.Object.extend("HSProgress");
            stuff.schoolData = Parse.Object.extend("schoolData");
        }
    }
};

$(document).ready(stuff.genesis);