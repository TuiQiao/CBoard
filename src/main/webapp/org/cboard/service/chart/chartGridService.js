/**
 * Created by Hemendra on 2017/11/28.
 */
'use strict';
cBoard.service('chartGridService', function () {

    this.render = function (containerDom, option, scope, persist, drill) {
        if (option == null) {
            containerDom.html("<div class=\"alert alert-danger\" role=\"alert\">No Data!</div>");
            return;
        }
        var height;
        scope ? height = scope.myheight - 20 : null;
        return new CBoardTableRender(containerDom, option, drill).do(height, persist);
    };

    this.parseOption = function (data) {
        var tableOption = chartDataProcess(data.chartConfig, data.keys, data.series, data.data, data.seriesConfig);
        return tableOption;
    };
});