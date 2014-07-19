$(document).ready(function () {
    // Construct the catalog query string
    Parse.initialize("MtPQsRRglfpClARD9Gskmv7rdkvUaMCHHJ2G90Ri", "QHI0Fuo5IJolPoTAJOw8EqMCjrS6Srk7wSJzwDOC");
    var doedb = Parse.Object.extend("doe");

    var nycITTdb = 'http://data.cityofnewyork.us/resource/mreg-rk5p.json?';
    var nycITTkey = '&$$app_token=CWamrEJN7KPGKA51TxJ4k9StU';
    var nycITTsel = '$select=program_code,program_name,dbn,printed_school_name,interest_area,selection_method,borough,urls&'
    var overlays = [];
    var resultsStore = [];
    var currPage = 1;
    var currPage2 = 1;
    var lastPage = 1;
    var perPage = 4;

    var parsekey = 'QHI0Fuo5IJolPoTAJOw8EqMCjrS6Srk7wSJzwDOC';

    $('.search_results').hide();
    $('.more_info').hide();

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
	
    $('.btnGo').click(function () {
        collapse_search();
        var nycITTsql = '';
        currPage = 1;
        currPage2 = 1;
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
        if (nycITTsql.length > 1)
        {
            nycITTsql = nycITTsql.slice(0, -5);
            nycITTurl += "$where="+ nycITTsql;
        }
        else nycITTurl += "&";
        //nycITTurl += nycITTsel;
        nycITTurl += nycITTkey;
        $.getJSON(nycITTurl, function (searchResults, textstatus) {
            console.log(nycITTurl);
            console.log(searchResults);

            var dbns = [];
            $.each(searchResults, function (i, socrata) { if ($.inArray(socrata.dbn, dbns) == -1) dbns.push(socrata.dbn); });
            var parseQuery = new Parse.Query(doedb);
            console.log(dbns);
            parseQuery.containedIn("dbn", dbns);
            //get stuff
            $('.nycDOE div').each(function () {
                var filt = $(this).attr('id');
                var er = "";
                $(this).find('input').each(function () {
                    er = $(this).attr('value');
                });
                if(er != null) parseQuery.equalTo(filt, er);
            });

            var dbnp = [];
            parseQuery.find({
                success: function (parsedb) {
                    $.each(parsedb, function (i, parse) { if ($.inArray(parse.dbn, dbnp) == -1) dbnp.push(parse.dbn); });
                    console.log(parsedb);
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
                    var parseSODA = [{}];
                    $.each(parsedb, function (x, parseEX) {
                        var program = [{}];
                        var multiple = $.grep(searchResults, function (dietSODA) { return dietSODA.dbn == parseEX.attributes.dbn; });
                        //console.log(multiple);
                        var liteSODA;
                        $.each(multiple, function (y, dietSODA) {
                            liteSODA = dietSODA;
                            program[y] = {
                                program_code: dietSODA.program_code,
                                program_name: dietSODA.program_name,
                                interest_area: dietSODA.interest_area,
                                selection_method: dietSODA.selection_method
                            };
                        });
                        parseSODA[x] = {
                            dbn: parseEX.attributes.dbn,
                            printed_school_name: liteSODA.printed_school_name,
                            borough: liteSODA.borough,
                            urls: liteSODA.urls,
                            principal: parseEX.attributes.principal,
                            postsecondary_enrollment: parseEX.attributes.postsecondaryenrollmentrate18months,
                            college_readiness: parseEX.attributes.collegeandcareerreadinessgrade,
                            overall: parseEX.attributes.overallgrade,
                            attendance: parseEX.attributes.attendancerate,
                            programs: program
                        };
                        multiple = null;
                        program = null;
                    });
                    //
                    console.log(parseSODA);
                    resultsStore = parseSODA;
                    lastPage = Math.ceil(parseSODA.length / perPage);
                    renderTemplates($('.result_wrapper'), 'search_results_tmpl.html', parseSODA, currPage, perPage);
                    $('.search_results').show();
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
                                overlays.push(marker);
                            }
                        });
                    });
                }
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
    $('#previous2').click(function () {
        if (currPage2 > 1) renderTemplates($('.print_wrapper'), 'print_tmpl.html', resultsStore, --currPage2, 1);
    });
    $('#next2').click(function () {
        if (currPage2 < resultsStore.length) renderTemplates($('.print_wrapper'), 'print_tmpl.html', resultsStore, ++currPage2, 1);
    });
    $('.printIT').click(function () {
        renderTemplates($('.print_wrapper'), 'print_tmpl.html', resultsStore, currPage2, 1);
        $('.more_info').show();
    });
    
});

$(document).on('click', '.result_name', function () {
    console.log($(this).parent().attr('id'));
    $("#map").fadeTo('slow',0.1);
});

$(document).on('click', '.collapsable button', function () {
    collapse_search();
});

$(document).on('click', '.xplode', function () {
    $(this).parent().toggle("explode", { pieces: 36 });
});

function collapse_search() {
    $('.collapsable button').text(function () {
        return $(this).text() == '+' ? '-' : '+';
    });

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

function getQuery($this)
{
    //?interest_area=Engineering
    var filter = $this.attr('id');
    var select = "(";
    var query = "";
    $this.find('option:selected').each(function () {
        select += filter + "='" + $(this).attr('value') + "' OR ";
    });
    select = select.slice(0, -4);
    if (select.length > 0) query += select + ")" + " AND ";
    return query;
}

function renderTemplates($dest, $tmpl, data, pageNo, perPage) {
    $dest.loadTemplate($tmpl, data, { isFile: true, paged: true, pageNo: pageNo, elemPerPage: perPage });
}