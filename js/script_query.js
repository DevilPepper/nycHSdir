//$(document).on('click', '#showResults', function () {
$(document).on('change', 'label :checkbox', function () {
    stuff.parseInit();
    refreshResults();
});

function refreshResults()
{
    var nycITTsql = '';
    stuff.currPage = 1;
    stuff.currPage2 = 1;

    //while there are still pins on the map, remove them from the map and the array
    while (stuff.overlays[0]) {
        stuff.overlays.pop().setMap(null);
    }

    //clear old results, if any
    stuff.parseSODA = [];

    ///////////////////////////////////SOCRATA////////////////////////////////////////////////
    //set up socrata query
    $('.nycITT div, .location div').each(function () {
        //it needs to be this way
        var query = getQuery($(this));
        nycITTsql += query;
        query = null;
    });
    //this is the query url
    var nycITTurl = stuff.nycITTdb;
    //if user selected options
    if (nycITTsql.length > 0) {
        //first, remove the extra AND
        nycITTsql = nycITTsql.slice(0, -5);
        //then prepend with the $where clause and add to the url
        nycITTurl += "$where=" + nycITTsql;
    }
    //we're only interested in some columns
    nycITTurl += stuff.nycITTsel;
    //and last but not least, the application key
    nycITTurl += stuff.nycITTkey;

    console.log(nycITTurl);
    //////////////////////////////////////////////////////////////////////////////////////////


    /////////////////////////////////////PARSE////////////////////////////////////////////////
    //set up the query for parse.com
    var parseQuery = new Parse.Query(stuff.doedb);

    //more filters for parse.com
    $('.nycDOE div').each(function () {
        var filt = $(this).attr('id');
        var er = "";
        $(this).find('input:text').each(function () {
            er = $(this).val();
        });
        $(this).find('input:checked').each(function () {
            er = $(this).val();
        });
        //if user entered a filter, use it.
        if (er.length > 0) parseQuery.equalTo(filt, er);
    });
    //parseQuery.select(['dbn', 'collegeandcareerreadinessgrade', 'postsecondaryenrollmentrate18months']);
    //parseQuery.greaterThan('postsecondary_enrollment_rate_18months', '85%');
    parseQuery.limit(458); //default is 100...
    //////////////////////////////////////////////////////////////////////////////////////////



    var parseQuery2 = new Parse.Query(stuff.schoolData);
    parseQuery2.containedIn("location_category", ['High school', 'Ungraded', 'K-12 all grades']);
    parseQuery2.limit(503);

    var querying = $.when($.getJSON(nycITTurl), parseQuery.find().toJqueryPromise(), parseQuery2.find().toJqueryPromise());
    

    //////////////////////////////////RESULTS ARE IN/////////////////////////////////////////
    querying.done(function (searchResults, parsedb, schoolDat) {
        searchResults = searchResults[0];
        console.log('program data');
        console.log(searchResults);
        console.log('progress report');
        console.log(parsedb);
        console.log('more school data');
        console.log(schoolDat);
        

        //monster fusion
        //go through each parse object
        $.each(parsedb, function (x, parseEX) {
            var program = []; //a temp array to hold the program objects

            //get all socrata objects that match this parse object's dbn
            var multiple = $.grep(searchResults, function (dietSODA) { return dietSODA.dbn == parseEX.attributes.dbn; });
            var parseSchool = $.grep(schoolDat, function (dietSODA) { return dietSODA.attributes.dbn == parseEX.attributes.dbn; });
            
            var liteSODA = null; //for some reason I need this
            if (multiple.length > 0) {
                
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
            }
            if((liteSODA != null) && parseSchool.length > 0)
            {
                //finally, make this object that holds all the data that is necessary
                stuff.parseSODA.push({
                    //from current parse object
                    dbn: parseEX.attributes.dbn,
                    principal: parseEX.attributes.principal,
                    postsecondary_enrollment: parseEX.attributes.postsecondary_enrollment_rate_18months,
                    college_readiness: parseEX.attributes.college_and_career_readiness_grade,
                    overall: parseEX.attributes.overall_grade,
                    attendance: parseEX.attributes.attendance_rate,

                    //from school data
                    latitude: parseSchool[0].attributes.latitude,
                    longitude: parseSchool[0].attributes.longitude,

                    //from the last socrata object that match this parse object's dbn
                    //(these are all the same if they have the same dbn)
                    printed_school_name: liteSODA.printed_school_name,
                    borough: liteSODA.borough,
                    urls: liteSODA.urls,

                    //the temp array goes here. Each program the school offers has it's own object.
                    programs: program
                });
            }
            //else console.log(parseEX.attributes);
            liteSODA = null;
            
            //nullify these temp arrays and object to clear memory
            multiple = null;
            program = null;
        });

        console.log('merged data');
        console.log(stuff.parseSODA); //for debugging

        //calculate the last page of results
        stuff.lastPage = Math.ceil(stuff.parseSODA.length / stuff.perPage);

        //show results
        renderTemplates($('.result_wrapper'), 'search_results_tmpl.html', stuff.parseSODA, stuff.currPage, stuff.perPage);
        
        //drop pins for each result
        //if only I could unnest this
        $.each(stuff.parseSODA, function (i, entry) {
           
                    //map.setCenter(results[0].geometry.location);

                    var marker = new google.maps.Marker({
                        map: stuff.map,
                        position: new google.maps.LatLng(entry.latitude, entry.longitude),
                        //title: location.name
                        title: entry.printed_school_name
                    });
                    stuff.overlays.push(marker); //store marker so it can be deleted later
        });

    });
    //////////////////////////////////////////////////////////////////////////////////////////

    nycITTurl = null;
}