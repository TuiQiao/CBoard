/**
 * Created by yfyuan on 2016/10/28.
 */
'use strict';
cBoard.service('chartLineService', function (dataService) {

    this.render = function (containerDom, option, scope, persist) {
        return new CBoardEChartRender(containerDom, option).chart(null, persist);
    };

    this.parseOption = function (chartData, chartConfig) {
        var echartOption = null;
        dataService.castRawData2Series(chartData, chartConfig, function (casted_keys, casted_values, aggregate_data, newValuesConfig) {
            var series_data = new Array();
            var string_keys = _.map(casted_keys, function (key) {
                return key.join('-');
            });

            for (var i = 0; i < aggregate_data.length; i++) {
                var joined_values = casted_values[i].join('-');
                var s = angular.copy(newValuesConfig[joined_values]);
                s.name = joined_values;
                s.data = aggregate_data[i];
                if (s.type == 'stackbar') {
                    s.type = 'bar';
                    s.stack = s.valueAxisIndex.toString();
                }
                if (chartConfig.valueAxis == 'horizontal') {
                    s.xAxisIndex = s.valueAxisIndex;
                } else {
                    s.yAxisIndex = s.valueAxisIndex;
                }
                series_data.push(s);
            }

            var valueAxis = angular.copy(chartConfig.values);
            _.each(valueAxis, function (e, i) {
                e.axisLabel = {
                    formatter: function (value) {
                        return numbro(value).format("0a.[0000]");
                    }
                };
                if (i > 0) {
                    e.splitLine = false;
                }
                e.scale = true;
            });
            var categoryAxis = {
                type: 'category',
                data: string_keys
            };
            echartOption = {
                legend: {
                    data: _.map(casted_values, function (v) {
                        return v.join('-');
                    })
                },
                xAxis: chartConfig.valueAxis == 'horizontal' ? valueAxis : categoryAxis,
                yAxis: chartConfig.valueAxis == 'horizontal' ? categoryAxis : valueAxis,
                series: series_data
            };
        });
        return echartOption;
    };
});