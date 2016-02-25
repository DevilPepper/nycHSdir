var myFutureHS = {
    //Parse db
    doedb: null,
    
    schoolData: null,

    demographics: null,

    soda: null,

    map: null,

    programs:null,
    //'https://data.cityofnewyork.us/api/geospatial/r8nu-ymqj?method=export&format=KML'
    //Socrata db
    //nycITTdb: 'http://data.cityofnewyork.us/resource/mreg-rk5p.json?',
    //nycITTkey: '&$$app_token=CWamrEJN7KPGKA51TxJ4k9StU',
    //nycITTsel: '&$select=program_code,program_name,dbn,printed_school_name,interest_area,selection_method,borough,urls',
    //myFutureHS.center = new google.maps.LatLng(40.7127, -74.0059);//NY latitute, longitude coordinates

    querying: null,

    //final array of objects
    parseSODA: [],

    classes: [],

    currPage: 1,
    //currPage2: 1,
    lastPage: 1,
    perPage: 7,

    genesis: function () {
        //langChange('xml/test.xml');

        //not sure when this is needed //never
        //var parsekey = 'QHI0Fuo5IJolPoTAJOw8EqMCjrS6Srk7wSJzwDOC';


        myFutureHS.map = new googleMapsWrapper($('#map'), 40.7127, -74.0059-0.1);//NY latitute, longitude coordinates

        //final array of objects
        myFutureHS.parseSODA = [];

        //initialize current and last page and declare how many results should display at a time
        myFutureHS.currPage = 1;
        //myFutureHS.currPage2 = 1;
        myFutureHS.lastPage = 1;

        //click events for next and previous buttons. They load next page of results
        /*Buttons are obsolete
        $('#prevPage').click(function () {
            if (myFutureHS.currPage > 1) renderTemplates($('.result_wrapper'), 'search_results_tmpl.html', myFutureHS.parseSODA, --myFutureHS.currPage, myFutureHS.perPage);
        });


        $('#nextPage').click(function () {
            if (myFutureHS.currPage < myFutureHS.lastPage) appendTemplates($('.result_wrapper'), 'search_results_tmpl.html', myFutureHS.parseSODA, ++myFutureHS.currPage, myFutureHS.perPage);
        });
        //these were rushed. I don't really want to rename them, though
        $('#previous2').click(function () {
            if (myFutureHS.currPage2 > 1) renderTemplates($('.print_wrapper'), 'print_tmpl.html', myFutureHS.parseSODA, --myFutureHS.currPage2, 1);
        });
        $('#next2').click(function () {
            if (myFutureHS.currPage2 < myFutureHS.parseSODA.length) renderTemplates($('.print_wrapper'), 'print_tmpl.html', myFutureHS.parseSODA, ++myFutureHS.currPage2, 1);
        });
        */
        //possibly the only thing that doesn't need to move to index.html
        $('.printIT').click(function () {
            //renderTemplates($('.print_wrapper'), 'print_tmpl.html', myFutureHS.parseSODA, myFutureHS.currPage2, 1);
            //$('.more_info').show();
            //var com = myFutureHS.parseSODA;
            window.open("print.html");
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
            myFutureHS.programs = myFutureHS.soda.extend("data.cityofnewyork.us", "n3p6-zve2");
        }
    },

    clearAll: function () {
        //var nycITTsql = '';
        myFutureHS.currPage = 1;
        //myFutureHS.currPage2 = 1;

        myFutureHS.map.clearPins();

        if (myFutureHS.querying != null)
            myFutureHS.querying.reject();

        //clear old results, if any
        myFutureHS.parseSODA = [];
        myFutureHS.classes = [];
        myFutureHS.programs.clearAll();
        myFutureHS.doedb.clearAll();
        myFutureHS.schoolData.clearAll();
        myFutureHS.demographics.clearAll();
    }
};

var com = {
    queries: null,
    results: [],
    clear: function () {
        com.queries = null;
        com.results = [];
    }
};
