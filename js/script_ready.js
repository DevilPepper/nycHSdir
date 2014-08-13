var myFutureHS = {
    //Parse db
    doedb: null,
    
    schoolData: null,

    demographics: null,

    soda: null,

    programs:null,

    //KML data for districts
    //doeDistrictsKML: 'https://data.cityofnewyork.us/api/geospatial/r8nu-ymqj?method=export&format=KML',

    //Socrata db
    //nycITTdb: 'http://data.cityofnewyork.us/resource/mreg-rk5p.json?',
    //nycITTkey: '&$$app_token=CWamrEJN7KPGKA51TxJ4k9StU',
    //nycITTsel: '&$select=program_code,program_name,dbn,printed_school_name,interest_area,selection_method,borough,urls',

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

    infoWindow: null,
    
    myPlace: null,

    circle: null,

    genesis: function () {
        //langChange('xml/test.xml');

        //not sure when this is needed //never
        //var parsekey = 'QHI0Fuo5IJolPoTAJOw8EqMCjrS6Srk7wSJzwDOC';

        //map pins array
        myFutureHS.overlays = [];
        //final array of objects
        myFutureHS.parseSODA = [];

        //initialize current and last page and declare how many results should display at a time
        myFutureHS.currPage = 1;
        myFutureHS.currPage2 = 1;
        myFutureHS.lastPage = 1;
        myFutureHS.perPage = 4;

        // Intialize our map
        myFutureHS.center = new google.maps.LatLng(40.7127, -74.0059);//NY latitute, longitude coordinates
        myFutureHS.mapOptions = {
            zoom: 10,
            center: myFutureHS.center //??
        };
        myFutureHS.map = new google.maps.Map($('#map').get(0), myFutureHS.mapOptions); //puts a new map in #map, applies some options, and also stores it in a variable
        
        //Add KML boundaries
        /*
        var doeBoundaries = new google.maps.KmlLayer({
            url: doeDistrictsKML,
            map: map
        });
        */
        //console.log(doeBoundaries);


        //new geocoder
        myFutureHS.geocoder = new google.maps.Geocoder();

        myFutureHS.infoWindow = new google.maps.InfoWindow({maxWidth: '20em'});

        google.maps.event.addListener(myFutureHS.map, 'click', function () {
            myFutureHS.infoWindow.close();
        });
        //now hide the stuff that shouldn't be on the screen yet
        $('.search_results').hide();
        $('.more_info').hide();
        $('.search_criteria').hide();

        myFutureHS.circle = new google.maps.Circle({
            strokeColor: "#00FF00",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#0000FF",
            fillOpacity: 0.35,
            map: myFutureHS.map,
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
                updateRadius(myFutureHS.circle, ui.value);
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
            if (myFutureHS.currPage > 1) renderTemplates($('.result_wrapper'), 'search_results_tmpl.html', myFutureHS.parseSODA, --myFutureHS.currPage, myFutureHS.perPage);
        });
        $('#nextPage').click(function () {
            if (myFutureHS.currPage < myFutureHS.lastPage) renderTemplates($('.result_wrapper'), 'search_results_tmpl.html', myFutureHS.parseSODA, ++myFutureHS.currPage, myFutureHS.perPage);
        });
        //these were rushed. I don't really want to rename them, though
        $('#previous2').click(function () {
            if (myFutureHS.currPage2 > 1) renderTemplates($('.print_wrapper'), 'print_tmpl.html', myFutureHS.parseSODA, --myFutureHS.currPage2, 1);
        });
        $('#next2').click(function () {
            if (myFutureHS.currPage2 < myFutureHS.parseSODA.length) renderTemplates($('.print_wrapper'), 'print_tmpl.html', myFutureHS.parseSODA, ++myFutureHS.currPage2, 1);
        });
        $('.printIT').click(function () {
            renderTemplates($('.print_wrapper'), 'print_tmpl.html', myFutureHS.parseSODA, myFutureHS.currPage2, 1);
            $('.more_info').show();
        });
    },

    parseInit: function () {
        if (myFutureHS.doedb == null || myFutureHS.schoolData == null) {
            //initialize Parse db
            Parse.initialize("MtPQsRRglfpClARD9Gskmv7rdkvUaMCHHJ2G90Ri", "QHI0Fuo5IJolPoTAJOw8EqMCjrS6Srk7wSJzwDOC");
            myFutureHS.doedb = new parseWrapper("HSProgress");
            myFutureHS.schoolData = new parseWrapper("schoolData");
            myFutureHS.demographics = new parseWrapper("demographics");
        }
    },

    sodaInit: function () {
        if (myFutureHS.soda == null) {
            myFutureHS.soda = SODA.init("CWamrEJN7KPGKA51TxJ4k9StU");
            myFutureHS.programs = myFutureHS.soda.extend("data.cityofnewyork.us", "mreg-rk5p");
        }
    },

    clearAll: function () {
        //var nycITTsql = '';
        myFutureHS.currPage = 1;
        myFutureHS.currPage2 = 1;

        //while there are still pins on the map, remove them from the map and the array
        while (myFutureHS.overlays[0]) {
            myFutureHS.overlays.pop().setMap(null);
        }

        //clear old results, if any
        myFutureHS.parseSODA = [];
        myFutureHS.programs.clearAll();
        myFutureHS.doedb.clearAll();
        myFutureHS.schoolData.clearAll();
        myFutureHS.demographics.clearAll();
    }
};

$(document).ready(myFutureHS.genesis);