$(document).on('click', 'label', function () {
    var nycITTsql = '';
    currPage = 1;
    currPage2 = 1;

    //while there are still pins on the map, remove them from the map and the array
    while (overlays[0]) {
        overlays.pop().setMap(null);
    }

    //clear old results, if any
    parseSODA = [];

    ///////////////////////////////////SOCRATA////////////////////////////////////////////////
    //set up socrata query
    $('.nycITT div, .location div').each(function () {
        //it needs to be this way
        var query = getQuery($(this));
        nycITTsql += query;
        query = null;
    });
    //this is the query url
    var nycITTurl = nycITTdb;
    //if user selected options
    if (nycITTsql.length > 0) {
        //first, remove the extra AND
        nycITTsql = nycITTsql.slice(0, -5);
        //then prepend with the $where clause and add to the url
        nycITTurl += "$where=" + nycITTsql;
    }
    //we're only interested in some columns
    nycITTurl += nycITTsel;
    //and last but not least, the application key
    nycITTurl += nycITTkey;

    console.log(nycITTurl);
    //////////////////////////////////////////////////////////////////////////////////////////


    /////////////////////////////////////PARSE////////////////////////////////////////////////
    //set up the query for parse.com
    var parseQuery = new Parse.Query(doedb);

    //more filters for parse.com
    $('.nycDOE div').each(function () {
        var filt = $(this).attr('id');
        var er = "";
        $(this).find('input:text').each(function () {
            er = $(this).val();
        });
        //if user entered a filter, use it.
        if (er.length > 0) parseQuery.equalTo(filt, er);
    });
    parseQuery.limit(458); //default is 100...
    //////////////////////////////////////////////////////////////////////////////////////////

    var querying = $.when($.getJSON(nycITTurl), parseQuery.find().toJqueryPromise());
    

    //////////////////////////////////RESULTS ARE IN/////////////////////////////////////////
    querying.done(function (searchResults, parsedb) {
        searchResults = searchResults[0];
        console.log(searchResults);
        console.log(parsedb);
        

        //monster fusion
        //go through each parse object
        $.each(parsedb, function (x, parseEX) {
            var program = []; //a temp array to hold the program objects

            //get all socrata objects that match this parse object's dbn
            var multiple = $.grep(searchResults, function (dietSODA) { return dietSODA.dbn == parseEX.attributes.dbn; });
            if (multiple.length > 0) {
                var liteSODA; //for some reason I need this

                //go through each socrata object that was gotten
                $.each(multiple, function (y, dietSODA) {
                    liteSODA = dietSODA; //hold one of these socrata objects for later use (very soon)

                    //make each object in the temp array have these properties from the socrata objects
                    program.push({
                        program_code: dietSODA.program_code,
                        program_name: dietSODA.program_name,
                        interest_area: dietSODA.interest_area,
                        selection_method: dietSODA.selection_method
                    });
                });

                //finally, make this object that holds all the data that is necessary
                parseSODA.push({
                    //from current parse object
                    dbn: parseEX.attributes.dbn,
                    principal: parseEX.attributes.principal,
                    postsecondary_enrollment: parseEX.attributes.postsecondaryenrollmentrate18months,
                    college_readiness: parseEX.attributes.collegeandcareerreadinessgrade,
                    overall: parseEX.attributes.overallgrade,
                    attendance: parseEX.attributes.attendancerate,

                    //from the last socrata object that match this parse object's dbn
                    //(these are all the same if they have the same dbn)
                    printed_school_name: liteSODA.printed_school_name,
                    borough: liteSODA.borough,
                    urls: liteSODA.urls,

                    //the temp array goes here. Each program the school offers has it's own object.
                    programs: program
                });

                liteSODA = null;
            }
            //nullify these temp arrays and object to clear memory
            multiple = null;
            program = null;
        });

        console.log(parseSODA); //for debugging

        //calculate the last page of results
        lastPage = Math.ceil(parseSODA.length / perPage);

        //show results
        renderTemplates($('.result_wrapper'), 'search_results_tmpl.html', parseSODA, currPage, perPage);
        
        //drop pins for each result
        //if only I could unnest this
        $.each(parseSODA, function (i, entry) {
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
                    overlays.push(marker); //store marker so it can be deleted later
                }
            });
        });

    });
    //////////////////////////////////////////////////////////////////////////////////////////

    nycITTurl = null;
});