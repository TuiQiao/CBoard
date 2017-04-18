/**
 * Created by yfyuan on 2017/4/14.
 */
$(function () {
    $(document).on('click', '.tree li.parent_li > span', function (e) {
        var children = $(this).parent('li.parent_li').find(' > ul > li');
        if (children.is(":visible")) {
            children.hide('fast');
            $(this).attr('title', 'Expand this branch').find(' > i').removeClass('fa-minus-circle').addClass('fa-plus-circle');
        } else {
            children.show('fast');
            $(this).attr('title', 'Collapse this branch').find(' > i').addClass('fa-minus-circle').removeClass('fa-plus-circle');
        }
        e.stopPropagation();
    });
});