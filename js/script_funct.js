function showMenu($this) {
    $('.search_criteria').show();
    $('#filter_sections div').each(function () {
        $(this).hide();
    });
    $('#filters li').each(function () {
        $(this).removeClass('ui-selected');
    });
    $this.addClass('ui-selected');
    var display = 'div.' + $this.attr('id');
    $(display).show();
    $(display + " *").show();
}


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

function pushClass($this, array)
{
    //make this a function
    var thisClass = $this.parent().attr("class");
    var a = thisClass.split(" ");
    $.each(a, function (i, c) {
        if ($.inArray(c, array) == -1) array.push(c);
    });
    //another function takes master, removes the class from all <li>s, and re adds them to the ids in master while removing them from the array
}

function highlighter(ol, liClass, array)
{
    $(ol + " li").each(function () {
        $(this).removeClass(liClass);
    });
    while (array[0]) {
        $('#' + array.pop()).addClass(liClass);
    }
}
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
    $this.find('input:checked').each(function () {
        //create a filter for it and append with OR for next filter in this section
        select += filter + "='" + $(this).attr('value').replace("&", "%26") + "' OR ";
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

function displayXML($XMLement) {
    var XMLement = $($XMLement);

    XMLement.children().each(function () {
        displayXML($(this));
    });
    //console.log(XMLement);
    var elemID = XMLement.attr('id');
    if (elemID!=null)
    {
        $("#" + elemID).each(function () {
            if ($(this).is('input')) $(this).text(XMLement.text());
            $(this).text(XMLement.text());
        });
    }
}

function langChange(xml) {
    $.get(xml, function (XEmL, e) {
        displayXML(XEmL);
    });
}

/*
function parseAND(andables) {
    if ($.isArray(andables[0])) {
        while (andables[1]) {
            $.each(andables.pop(), function (a, arr) {
                andables.push($.grep(andables.pop(), function (and1) { return and1.dbn == arr.dbn; }));
            });
        }
        andables = andables[0];
    }
    return andables;
}
*/