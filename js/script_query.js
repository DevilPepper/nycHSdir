//$(document).on('click', '#showResults', function () {
$(document).on('change', 'label :checkbox', function () {
    myFutureHS.parseInit();
    myFutureHS.sodaInit();
    refreshResults();
});

function refreshResults() //these each functions need to be neater
{
    myFutureHS.clearAll();
    com.clear();
    ///////////////////////////////////SOCRATA////////////////////////////////////////////////
    //set up socrata query
    myFutureHS.programs.select(['program_code', 'program_name', 'dbn', 'printed_school_name', 'interest_area', 'selection_method', 'borough', 'urls']);
    //$('.nycITT div, .location div').each(function () {

    $('div.sodaEQ').each(function () {
        queryEqual($(this), myFutureHS.programs);
    });

    $('div.sodaGT').each(function () {
        queryGreaterThan($(this), myFutureHS.programs);
    });
    //////////////////////////////////////////////////////////////////////////////////////////


    /////////////////////////////////////PARSE////////////////////////////////////////////////
    
    $('div.progressEQ').each(function () {
        queryEqual($(this), myFutureHS.doedb);
    });

    $('div.progressGT').each(function () {
        queryGreaterThan($(this), myFutureHS.doedb);
    });

    $('div.progressBET').each(function () {
        queryBetween($(this), myFutureHS.doedb);
    });
    //parseQuery.select(['dbn', 'collegeandcareerreadinessgrade', 'postsecondaryenrollmentrate18months']);
    //parseQuery.greaterThan('postsecondary_enrollment_rate_18months', '85%');
    myFutureHS.doedb.limit(458); //default is 100...
    //////////////////////////////////////////////////////////////////////////////////////////




    ////////////////////////////////////SCHOOL DATA//////////////////////////////////////////
    //myFutureHS.schoolData.containedIn("location_category", ['High school', 'Ungraded', 'K-12 all grades', 'Secondary School']);
    myFutureHS.schoolData.contains("grades_final", "09");

    myFutureHS.schoolData.notContainedIn("dbn", [
        '05M685',
        '29Q496',
        '05M469',
        '23K634',
        '02M625',
        '04M013',
        '19K166',
        '19K302',
        '09X414',
        '29Q494',
        '07X203',
        '11X142',
        '12X050',
        '09X064',
        '23K073',
        '17K167',
        '19K174',
        '09X230',
        '07X385',
        '22K495'
    ]);

    //more filters for parse.com
    $('div.schoolDatEQ').each(function () {
        queryEqual($(this), myFutureHS.schoolData);
    });

    $('div.schoolDatGT').each(function () {
        queryGreaterThan($(this), myFutureHS.schoolData);
    });

    $('div.schoolDatBET').each(function () {
        queryBetween($(this), myFutureHS.schoolData);
    });

    myFutureHS.schoolData.limit(1000);
    ////////////////////////////////////////////////////////////////////////////////////////////




    //////////////////////////////////////DEMOGRAPHICS//////////////////////////////////////////
    myFutureHS.demographics.greaterThan("grade_9", 0, true);
    myFutureHS.demographics.greaterThan("grade_10", 0, true);
    myFutureHS.demographics.greaterThan("grade_11", 0, true);
    myFutureHS.demographics.greaterThan("grade_12", 0, true);
    myFutureHS.demographics.equalTo("school_year", "2011-2012");
    myFutureHS.demographics.limit(470);

    $('div.demoEQ').each(function () {
        queryEqual($(this), myFutureHS.demographics);
    });

    $('div.demoGT').each(function () {
        queryGreaterThan($(this), myFutureHS.demographics);
    });

    $('div.demoBET').each(function () {
        queryBetween($(this), myFutureHS.demographics);
    });
    ////////////////////////////////////////////////////////////////////////////////////////////

    highlighter('#filters', 'selected_criteria', myFutureHS.classes);

    var querying = $.when(myFutureHS.programs.find(), myFutureHS.doedb.find(), myFutureHS.schoolData.find(), myFutureHS.demographics.find());
    

    //////////////////////////////////RESULTS ARE IN/////////////////////////////////////////
    querying.done(function (searchResults, parsedb, schoolDat, demo) {
        //searchResults = searchResults[0];
        //parsedb = parseAND(parsedb);
        //schoolDat = parseAND(schoolDat);
        //demo = parseAND(demo);
        console.log('program data');
        console.log(searchResults);
        console.log('progress report');
        console.log(parsedb);
        console.log('more school data');
        console.log(schoolDat);
        console.log('demographics');
        console.log(demo);
        

        //monster fusion
        //go through each parse object
        $.each(parsedb, function (x, parseEX) {
            var program = []; //a temp array to hold the program objects

            //get all socrata objects that match this parse object's dbn
            var multiple = $.grep(searchResults, function (dietSODA) { return dietSODA.dbn == parseEX.dbn; });
            var parseSchool = $.grep(schoolDat, function (dietSODA) { return dietSODA.dbn == parseEX.dbn; });
            var population = $.grep(demo, function (dietSODA) { return dietSODA.dbn == parseEX.dbn; });

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
            if((liteSODA != null) && parseSchool.length > 0 && population.length > 0)
            {
                //finally, make this object that holds all the data that is necessary
                myFutureHS.parseSODA.push({
                    //from current parse object
                    dbn: parseEX.dbn,
                    principal: parseEX.principal,
                    postsecondary_enrollment: parseEX.postsecondary_enrollment_rate_18months,
                    college_readiness: parseEX.college_and_career_readiness_grade,
                    overall: parseEX.overall_grade,
                    attendance: parseEX.attendance_rate,
                    average_completion_rate_for_remaining_regents: parseEX.average_completion_rate_for_remaining_regents,

                    //from school data
                    latitude: parseSchool[0].latitude,
                    longitude: parseSchool[0].longitude,

                    //from demographics data
                    total_enrollment: population[0].total_enrollment,

                    //from the last socrata object that match this parse object's dbn
                    //(these are all the same if they have the same dbn)
                    printed_school_name: liteSODA.printed_school_name,
                    borough: liteSODA.borough,
                    urls: liteSODA.urls,
                    //the temp array goes here. Each program the school offers has it's own object.
                    programs: program
                });
            }
            //else console.log(parseEX);
            liteSODA = null;
            
            //nullify these temp arrays and object to clear memory
            multiple = null;
            program = null;
        });

        console.log('merged data');
        console.log(myFutureHS.parseSODA); //for debugging
        com.results = myFutureHS.parseSODA;
        //calculate the last page of results
        myFutureHS.lastPage = Math.ceil(myFutureHS.parseSODA.length / myFutureHS.perPage);

        //show results
        renderTemplates($('.result_wrapper'), 'search_results_tmpl.html', myFutureHS.parseSODA, myFutureHS.currPage, myFutureHS.perPage);
        renderTemplates($('.mapPins'), 'map_pin_tmpl.html', myFutureHS.parseSODA, 1, myFutureHS.parseSODA.length);
        $('.mapPins').hide();
        //$('.mapPins div').each(function () { $(this).addClass('mapPin'); });
        //drop pins for each result
        //if only I could unnest this
        var centerLat = 0, centerLng = 0;

        $.each(myFutureHS.parseSODA, function (i, entry) {
           
                    //map.setCenter(results[0].geometry.location);

            myFutureHS.map.makeMarker(new google.maps.LatLng(entry.latitude, entry.longitude), entry.printed_school_name, entry.dbn, '.mapPins');
                    
                    centerLat += entry.latitude;
                    centerLng += entry.longitude;
        });
        if (myFutureHS.parseSODA.length > 0) {
            centerLat /= myFutureHS.parseSODA.length;
            centerLng /= myFutureHS.parseSODA.length;
            myFutureHS.map.setCenter(new google.maps.LatLng(centerLat, centerLng));
        }

        $('#showResults span').text(myFutureHS.parseSODA.length);

    });
    //////////////////////////////////////////////////////////////////////////////////////////

    nycITTurl = null;
}

function queryEqual($this, q) {
    var elemID = $this.attr('id');
    var er = "";
    $this.find('input:text').each(function () {
        er = $(this).val();
        if (!isNaN(+er)) er = +er;
        q.equalTo(elemID, er, elemID);
        pushClass($this, myFutureHS.classes);
    });
    $this.find('input:checked').each(function () {
        er = $(this).val();
        if (!isNaN(+er)) er = +er;
        q.equalTo(elemID, er, elemID);
        pushClass($this, myFutureHS.classes);
    });
    //if user entered a filter, use it.
    //if (er.length > 0) parseQuery.equalTo(filt, er);
}

function queryGreaterThan($this, q) {
    var elemID = $this.attr('id');
    var er = "";
    $this.find('input:text').each(function () {
        er = $(this).val();
        if (!isNaN(+er)) er = +er;
        q.greaterThan(elemID, er, elemID);
        pushClass($this, myFutureHS.classes);
    });
    $this.find('input:checked').each(function () {
        er = $(this).val();
        if (!isNaN(+er)) er = +er;
        q.greaterThan(elemID, er, elemID);
        pushClass($this, myFutureHS.classes);
    });
    //if user entered a filter, use it.
    //if (er.length > 0) parseQuery.equalTo(filt, er);
}

function queryBetween($this, q) {
    var elemID = $this.attr('id');
    var er = "";
    $this.find('input:text').each(function () {
        er = $.parseJSON($(this).val());
        if (!isNaN(+er.greaterThan) && er.greaterThan != null) er.greaterThan = +er.greaterThan;
        if (!isNaN(+er.lessThan) && er.lessThan != null) er.lessThan = +er.lessThan;
        q.between(elemID, er.greaterThan, er.lessThan, elemID);
        pushClass($this, myFutureHS.classes);
    });
    $this.find('input:checked').each(function () {
        er = $.parseJSON($(this).val());
        if (!isNaN(+er.greaterThan) && er.greaterThan != null) er.greaterThan = +er.greaterThan;
        if (!isNaN(+er.lessThan) && er.lessThan != null) er.lessThan = +er.lessThan;
        q.between(elemID, er.greaterThan, er.lessThan, elemID);
        pushClass($this, myFutureHS.classes);
    });
    //if user entered a filter, use it.
    //if (er.length > 0) parseQuery.equalTo(filt, er);
}