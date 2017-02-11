/**
 * Created by yfyuan on 2016/10/28.
 */
'use strict';
cBoard.service('chartTableService', function (dataService) {

    this.render = function (containerDom, option, scope) {
        var height;
        scope ? height = scope.myheight - 20 : null;
        return new CBoardTableRender(containerDom, option).do(height);
    };

    this.parseOption = function (chartData, chartConfig) {
        var tableOption = null;
        dataService.castRawData2Series(chartData, chartConfig, function (casted_keys, casted_values, aggregate_data, newValuesConfig) {
            tableOption = chartDataProcess(chartConfig,casted_keys, casted_values, aggregate_data);
        });
        return tableOption;
    };
});