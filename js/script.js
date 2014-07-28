$(document).ready(function () {

    //initialize Parse db. class="doe"
    Parse.initialize("MtPQsRRglfpClARD9Gskmv7rdkvUaMCHHJ2G90Ri", "QHI0Fuo5IJolPoTAJOw8EqMCjrS6Srk7wSJzwDOC");
    var doedb = Parse.Object.extend("doe");

    //not sure when this is needed //never
    //var parsekey = 'QHI0Fuo5IJolPoTAJOw8EqMCjrS6Srk7wSJzwDOC';

    //KML data for districts
    var doeDistrictsKML = "https://data.cityofnewyork.us/api/geospatial/r8nu-ymqj?method=export&format=KML";

    //Socrata db
    var nycITTdb = 'http://data.cityofnewyork.us/resource/mreg-rk5p.json?';
    var nycITTkey = '&$$app_token=CWamrEJN7KPGKA51TxJ4k9StU';
    var nycITTsel = '&$select=program_code,program_name,dbn,printed_school_name,interest_area,selection_method,borough,urls';

    //map pins array
    var overlays = [];
    //final array of objects
    var parseSODA = [];

    //initialize current and last page and declare how many rests should display at a time
    var currPage = 1;
    var currPage2 = 1;
    var lastPage = 1;
    var perPage = 4;

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

    //now hide the stuff that shouldn't be on the screen yet
    $('.search_results').hide();
    $('.more_info').hide();
    $('.search_criteria').hide();

    //make these things special
    $('#sidebar').accordion({ collapsible: true });
    $('#filters').selectable();

    // Intialize our map
    var center = new google.maps.LatLng(40.7127, -74.0059);//NY latitute, longitude coordinates
    var mapOptions = {
        zoom: 10,
        center: center //??
    };
    var map = new google.maps.Map($('#map').get(0), mapOptions); //puts a new map in #map, applies some options, and also stores it in a variable
    
    //Add KML boundaries
    var doeBoundaries = new google.maps.KmlLayer({
        url: doeDistrictsKML,
        map: map
    });


    //new geocoder
    var geocoder = new google.maps.Geocoder();
	
    $('#showResults').click(function () {
        //collapse_search();
        $('.search_criteria').hide("explode");
        var nycITTsql = '';
        currPage = 1;
        currPage2 = 1;

        //while there are still pins on the map, remove them from the map and the array
        while (overlays[0]) {
            overlays.pop().setMap(null);
        }

        parseSODA = []; //clear old results, if any

        ///////////////////////////////////SOCRATA////////////////////////////////////////////////
        //set up the query
        $('.nycITT div').each(function () {
            //it needs to be this way
            var query = getQuery($(this));
            nycITTsql += query;
            query = null;
        });
        //this is the query url
        var nycITTurl = nycITTdb;
        //if user selected options
        if (nycITTsql.length > 0)
        {
            //first, remove the extra AND
            nycITTsql = nycITTsql.slice(0, -5);
            //then prepend with the $where clause and add to the url
            nycITTurl += "$where="+ nycITTsql;
        }
        //otherwise, add an &
        else nycITTurl += "&";
        //we're only interested in some columns
        nycITTurl += nycITTsel;
        //and last but not least, the application key
        nycITTurl += nycITTkey;
        //////////////////////////////////////////////////////////////////////////////////////////

        //this nested nonsense...
        $.getJSON(nycITTurl, function (searchResults, textstatus) {
            
            //store all unique dbns found in searchResults in a seperate array
            var dbns = [];
            $.each(searchResults, function (i, socrata) { if ($.inArray(socrata.dbn, dbns) == -1) dbns.push(socrata.dbn); });

            //set up the query for parse.com
            var parseQuery = new Parse.Query(doedb);
            parseQuery.containedIn("dbn", dbns); //get only results with dbns from socrata's results
            
            //more filters for parse.com
            $('.nycDOE div').each(function () {
                var filt = $(this).attr('id');
                var er = "";
                $(this).find('input:text').each(function () {
                    er = $(this).val();
                });
                //if user entered a filter, use it.
                if (er.length>0) parseQuery.equalTo(filt, er);
            });

            //var dbnp = []; //is this array even needed?

            //do the query
            //...second level of this nested nonsense
            parseQuery.find({
                success: function (parsedb) {
                    //$.each(parsedb, function (i, parse) { if ($.inArray(parse.dbn, dbnp) == -1) dbnp.push(parse.dbn); });
                    //console.log(parsedb);
                    //$.each(searchResults, function (i, socrata) { if ($.inArray(socrata.dbn, dbnp) == -1) searchResults[i--].pop(); });

                    /*
                    var nycITTnew = nycITTdb;
                    if (nycITTsql.length > 1) {
                        nycITTnew += "$where=" + nycITTsql;
                    }
                    else nycITTnew += "&";
                    nycITTnew += nycITTsel;
                    nycITTnew += nycITTkey; 
                    */


                    //monster fusion
                    //go through each parse object
                    //...third level of this nested nonsense
                    $.each(parsedb, function (x, parseEX) {
                        var program = []; //a temp array to hold the program objects

                        //get all socrata objects that match this parse object's dbn
                        var multiple = $.grep(searchResults, function (dietSODA) { return dietSODA.dbn == parseEX.attributes.dbn; });
                        var liteSODA; //for some reason I need this

                        //go through each socrata object that was gotten
                        $.each(multiple, function (y, dietSODA) {
                            liteSODA = dietSODA; //hold one of these socrata objects for later use (very soon)

                            //make each object in the temp array have these properties from the socrata objects
                            program[y] = {
                                program_code: dietSODA.program_code,
                                program_name: dietSODA.program_name,
                                interest_area: dietSODA.interest_area,
                                selection_method: dietSODA.selection_method
                            };
                        });

                        //finally, make this object that holds all the data that is necessary
                        parseSODA[x] = {
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
                        };
                        //nullify these temp arrays and object to clear memory
                        multiple = null;
                        program = null;
                        liteSODA = null;
                    });

                    console.log(parseSODA); //for debugging

                    //calculate the last page of results
                    lastPage = Math.ceil(parseSODA.length / perPage);

                    //show results
                    renderTemplates($('.result_wrapper'), 'search_results_tmpl.html', parseSODA, currPage, perPage);
                    $('.search_results').show();

                    //drop pins for each result
                    //...fourth level of this nested nonsense
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
                }
            });
            

            
        });
        nycITTurl = null;
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

//mouse events for the silly numbers
$(document).on('mouseenter', '.image', function () {
    $(this).height("64px");
    $(this).width("64px");
});
$(document).on('mouseleave', '.image', function () {
    $(this).height("32px");
    $(this).width("32px");
});


$(document).on('mouseenter', '#filters li', function () {
    $('.search_criteria').show();
    $('#filter_sections div').each(function () {
        $(this).hide();
    });
    $('#filters li').each(function () {
        $(this).removeClass('ui-selected');
    });
    $(this).addClass('ui-selected');
    var display = '.' + $(this).attr('id');
    $(display).show();
    $(display + " *").show();
});

//when you click on the name text in the results, this happens
$(document).on('click', '.result_name', function () {
    console.log($(this).parent().attr('id')); //logs the parent div's id in the console
    $("#map").fadeTo('slow',0.1); //fades the map for no really good reason
});

//collapsable button click event
$(document).on('click', '.collapsable button', function () {
    collapse_search(); //calls collapse_search(). this function might get used somewhere else too.
});

//classic x button with a twist
$(document).on('click', '.xplode', function () {
    $(this).parent().toggle("explode", { pieces: 36 });
});

function collapse_search() {
    //alternates the +/- button text
    $('.collapsable button').text(function () {
        return $(this).text() == '+' ? '-' : '+';
    });

    //slide toggles these 2 divs. Pretty silly.
    $('.search_results').slideToggle();
    $('.search_criteria').slideToggle('slow');
}
/*
function collapseIT($this){
    $this.children('button').toggle(function () {
        $(this).text('+');
    }, function () {
        $(this).text('-');
    });
    $this.children('div').slideToggle('slow');
}
*/

//the query function for socrata's db
//this is one section(column in the db) at a time
function getQuery($this)
{
    //element ids must match the column names on the db
    var filter = $this.attr('id');
    //parantheses for AND/ORing properly
    var select = "(";
    var query = "";
    //each option that was selected
    $this.find('option:selected').each(function () {
        //create a filter for it and append with OR for next filter in this section
        select += filter + "='" + $(this).attr('value') + "' OR ";
    });
    //remove the extra OR
    select = select.slice(0, -4);
    //if there were options selected, store the query string in a return variable and append with a close parantheses and an AND
    //else the return is an empty string
    if (select.length > 0) query += select + ")" + " AND ";
    return query;
}

//the template function
//accepts a jQuery object for destination, a string for the template file, the data array, start page, and how many per page
function renderTemplates($dest, tmpl, data, pageNo, perPage) {
    //it then sets the data in place very nicely.
    $dest.loadTemplate(tmpl, data, { isFile: true, paged: true, pageNo: pageNo, elemPerPage: perPage });
}