/**
 * Created by yfyuan on 2017/4/14.
 */
$(function () {
    $(document).on('click', '.tree li.parent_li > span', function (e) {
        var children = $(this).parent('li.parent_li').find(' > ul > li');
        if (children.is(":visible")) {
            children.hide('fast');
            $(this).attr('title', 'Expand this branch').find(' > i').addClass('fa-caret-right').removeClass('fa-caret-down');
        } else {
            children.show('fast');
            $(this).attr('title', 'Collapse this branch').find(' > i').addClass('fa-caret-down').removeClass('fa-caret-right');
        }
        e.stopPropagation();
    });
});