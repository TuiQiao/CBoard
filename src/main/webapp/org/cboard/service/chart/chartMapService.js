/**
 * Created by Fine on 2016/12/13.
 */
cBoard.service('chartMapService', function (dataService) {
    this.render = function (containerDom, option, scope, persist) {
        if (option == null) {
            containerDom.html("<div class=\"alert alert-danger\" role=\"alert\">No Data!</div>");
            return;
        }
        var height;
        scope ? height = scope.myheight - 20 : null;
        return new CBoardMapRender(containerDom, option).do(height, persist);
    };

    this.parseOption = function (chartData, chartConfig) {
        var mapOption = null;
        if (chartData.data.length == 0) {
            return null;
        }
        dataService.castRawData2Series(chartData, chartConfig, function (casted_keys, casted_values, aggregate_data, newValuesConfig) {
            mapOption = chartDataProcess(chartConfig,casted_keys, casted_values, aggregate_data,newValuesConfig);
        });
        return mapOption;
    };
});