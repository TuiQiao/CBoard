/**
 * Created by Fine on 2017/2/12.
 */

'user strict';
cBoard.service('freeLayoutService', function ($http) {
    var service = {};

    service.setHeight = function () {
        var height = $(window).height() + 'px';

        $('.layoutPanel').css({
            height: height
        });
    };

    return service;
});

