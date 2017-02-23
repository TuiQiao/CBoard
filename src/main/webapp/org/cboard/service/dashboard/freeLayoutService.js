/**
 * Created by Fine on 2017/2/12.
 */

'user strict';
cBoard.service('freeLayoutService', function ($http) {

    this.setHeight = function () {
        var height = $(window).height() + 'px';

        $('.layoutPanel').css({
            height: height
        });
    };

    this.widget = function () {
        var random = new Date().getTime();
        var template = '<div class="widget_'+ random +'"></div>';

        $('.layoutPanel').append(template);
        return random;
    };
});

