//$(document).on('click', '#showResults', function () {
$(document).on('change', 'label :checkbox', function () {
    myFutureHS.parseInit();
    myFutureHS.sodaInit();
    refreshResults();
});

function refreshResults()
{
    //var nycITTsql = '';
    myFutureHS.currPage = 1;
    myFutureHS.currPage2 = 1;

    //while there are still pins on the map, remove them from the map and the array
    while (myFutureHS.overlays[0]) {
        myFutureHS.overlays.pop().setMap(null);
    }

    //clear old results, if any
    myFutureHS.parseSODA = [];

    ///////////////////////////////////SOCRATA////////////////////////////////////////////////
    //set up socrata query
    myFutureHS.programs.clearAll();
    myFutureHS.programs.select(['program_code', 'program_name', 'dbn', 'printed_school_name', 'interest_area', 'selection_method', 'borough', 'urls']);
    //$('.nycITT div, .location div').each(function () {
    $('div.sodaEQ').each(function () {
        var elemID = $(this).attr('id');
        $(this).find('input:checked').each(function () {
            myFutureHS.programs.equalTo(elemID, $(this).attr('value'));
        });
        //it needs to be this way
        //var query = getQuery($(this));
        //nycITTsql += query;
        //query = null;

    });

    $('div.sodaGT').each(function () {
        var elemID = $(this).attr('id');
        $(this).find('input:checked').each(function () {
            myFutureHS.programs.greaterThan(elemID, $(this).attr('value'));
        });
        //it needs to be this way
        //var query = getQuery($(this));
        //nycITTsql += query;
        //query = null;

    });
    //this is the query url
    //var nycITTurl = myFutureHS.nycITTdb;
    //if user selected options
    //if (nycITTsql.length > 0) {
        //first, remove the extra AND
        //nycITTsql = nycITTsql.slice(0, -5);
        //then prepend with the $where clause and add to the url
        //nycITTurl += "$where=" + nycITTsql;
    //}
    //we're only interested in some columns
    //nycITTurl += myFutureHS.nycITTsel;
    //and last but not least, the application key
    //nycITTurl += myFutureHS.nycITTkey;

    //console.log(nycITTurl);
    //////////////////////////////////////////////////////////////////////////////////////////


    /////////////////////////////////////PARSE////////////////////////////////////////////////
    //set up the query for parse.com
    var parseQuery = new Parse.Query(myFutureHS.doedb);

    //more filters for parse.com
    $('div.progressEQ').each(function () {
        var filt = $(this).attr('id');
        var er = "";
        $(this).find('input:text').each(function () {
            er = $(this).val();
            if (!isNaN(+er)) er = +er;
            parseQuery.equalTo(filt, $(this).val());
        });
        $(this).find('input:checked').each(function () {
            er = $(this).val();
            if (!isNaN(+er)) er = +er;
            parseQuery.equalTo(filt, $(this).val());
        });
        //if user entered a filter, use it.
        //if (er.length > 0) parseQuery.equalTo(filt, er);
    });

    $('div.progressGT').each(function () {
        var filt = $(this).attr('id');
        var er = "";
        $(this).find('input:text').each(function () {
            er = $(this).val();
            if (!isNaN(+er)) er = +er;
            parseQuery.greaterThan(filt, er);
        });
        $(this).find('input:checked').each(function () {
            er = $(this).val();
            if (!isNaN(+er)) er = +er;
            parseQuery.greaterThan(filt, er);
        });
        //if user entered a filter, use it.
        //if (er.length > 0) parseQuery.equalTo(filt, er);
    });

    //parseQuery.select(['dbn', 'collegeandcareerreadinessgrade', 'postsecondaryenrollmentrate18months']);
    //parseQuery.greaterThan('postsecondary_enrollment_rate_18months', '85%');
    parseQuery.limit(458); //default is 100...
    //////////////////////////////////////////////////////////////////////////////////////////



    var parseQuery2 = new Parse.Query(myFutureHS.schoolData);
    parseQuery2.containedIn("location_category", ['High school', 'Ungraded', 'K-12 all grades']);

    //more filters for parse.com
    $('div.schoolDatEQ').each(function () {
        var filt = $(this).attr('id');
        var er = "";
        $(this).find('input:text').each(function () {
            er = $(this).val();
            if (!isNaN(+er)) er = +er;
            parseQuery2.equalTo(filt, er);
        });
        $(this).find('input:checked').each(function () {
            er = $(this).val();
            if (!isNaN(+er)) er = +er;
            parseQuery2.equalTo(filt, er);
        });
        //if user entered a filter, use it.
        //if (er.length > 0) parseQuery.equalTo(filt, er);
    });

    $('div.schoolDatGT').each(function () {
        var filt = $(this).attr('id');
        var er = "";
        $(this).find('input:text').each(function () {
            er = $(this).val();
            if (!isNaN(+er)) er = +er;
            parseQuery2.greaterThan(filt, er);
        });
        $(this).find('input:checked').each(function () {
            er = $(this).val();
            if (!isNaN(+er)) er = +er;
            parseQuery2.greaterThan(filt, er);
        });
        //if user entered a filter, use it.
        //if (er.length > 0) parseQuery.equalTo(filt, er);
    });

    parseQuery2.limit(503);
    //$.getJSON(nycITTurl)
    var querying = $.when(myFutureHS.programs.find(), parseQuery.find().toJqueryPromise(), parseQuery2.find().toJqueryPromise());
    

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
                myFutureHS.parseSODA.push({
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
        console.log(myFutureHS.parseSODA); //for debugging

        //calculate the last page of results
        myFutureHS.lastPage = Math.ceil(myFutureHS.parseSODA.length / myFutureHS.perPage);

        //show results
        renderTemplates($('.result_wrapper'), 'search_results_tmpl.html', myFutureHS.parseSODA, myFutureHS.currPage, myFutureHS.perPage);
        
        //drop pins for each result
        //if only I could unnest this
        $.each(myFutureHS.parseSODA, function (i, entry) {
           
                    //map.setCenter(results[0].geometry.location);

                    var marker = new google.maps.Marker({
                        map: myFutureHS.map,
                        position: new google.maps.LatLng(entry.latitude, entry.longitude),
                        //title: location.name
                        title: entry.printed_school_name
                    });
                    myFutureHS.overlays.push(marker); //store marker so it can be deleted later
        });

    });
    //////////////////////////////////////////////////////////////////////////////////////////

    nycITTurl = null;
}