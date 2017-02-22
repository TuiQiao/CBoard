/**
 * Created by Fine on 2016/12/13.
 */
cBoard.service('chartMapService', function (dataService) {
    this.render = function (containerDom, option, scope, persist) {
        var height;
        scope ? height = scope.myheight - 20 : null;
        return new CBoardMapRender(containerDom, option).do(height, persist);
    };

    this.parseOption = function (chartData, chartConfig) {
        var mapOption = null;
        dataService.castRawData2Series(chartData, chartConfig, function (casted_keys, casted_values, aggregate_data, newValuesConfig) {
            mapOption = chartDataProcess(chartConfig,casted_keys, casted_values, aggregate_data,newValuesConfig);
        });
        return mapOption;
    };
});