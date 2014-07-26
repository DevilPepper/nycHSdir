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