function showMenu($this) {
    $('.search_criteria').show();
    $('#filter_sections div').each(function () {
        $(this).hide();
    });
    $('#filters li').each(function () {
        $(this).removeClass('ui-selected');
    });
    $this.addClass('ui-selected');
    var display = '.' + $this.attr('id');
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

function updateRadius(circle, rad) {
    circle.setRadius(rad);
}

function displayXML(XMLement) {
    if (elemID = XMLement.attr('id'))
    {
        $("#" + elemID).each(function () {
            if ($(this).is('input')) $(this).text(XMLement.text());
            $(this).text(XMLement.text());
        });
    }
    XMLement.children().each(displayXML)
}