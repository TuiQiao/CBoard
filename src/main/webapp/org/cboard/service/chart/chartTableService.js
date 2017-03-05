/**
 * Created by yfyuan on 2016/10/28.
 */
'use strict';
cBoard.service('chartTableService', function (dataService) {

    this.render = function (containerDom, option, scope, persist) {
        if (option == null) {
            containerDom.html("<div class=\"alert alert-danger\" role=\"alert\">No Data!</div>");
            return;
        }
        var height;
        scope ? height = scope.myheight - 20 : null;
        return new CBoardTableRender(containerDom, option).do(height, persist);
    };

    this.parseOption = function (chartData, chartConfig) {
        var tableOption = null;
        if (chartData.data.length == 0) {
            return null;
        }
        dataService.castRawData2Series(chartData, chartConfig, function (casted_keys, casted_values, aggregate_data, newValuesConfig) {
            tableOption = chartDataProcess(chartConfig,casted_keys, casted_values, aggregate_data,newValuesConfig);
        });
        return tableOption;
    };
});