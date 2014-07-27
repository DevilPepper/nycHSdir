//mouse events for the silly numbers
$(document).on('mouseenter', '.image', function () {
    $(this).height("64px");
    $(this).width("64px");
});
$(document).on('mouseleave', '.image', function () {
    $(this).height("32px");
    $(this).width("32px");
});

$(document).on('click', '#sidebar h3', function () {
    //collapse_search();
    $('.search_criteria').hide("explode");
    //$('.search_results').show();
});

$(document).on('mouseenter', '#filters li', function () {
    showMenu($(this));
});
$(document).on('click', '#filters li', function () {
    showMenu($(this));
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