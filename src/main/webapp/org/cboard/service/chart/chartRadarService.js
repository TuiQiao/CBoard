/**
 * Created by yfyuan on 2016/10/28.
 */
'use strict';
cBoard.service('chartRadarService', function (dataService) {

    this.render = function (containerDom, option, scope) {
        new CBoardEChartRender(containerDom, option).chart();
    };

    this.parseOption = function (chartData, chartConfig) {
        var echartOption = null;
        dataService.castRawData2Series(chartData, chartConfig, function (casted_keys, casted_values, aggregate_data, newValuesConfig) {
            var string_keys = _.map(casted_keys, function (key) {
                return key.join('-');
            });
            var string_values = _.map(casted_values, function (value) {
                return value.join('-');
            });
            var data = [];
            var max;
            for (var i = 0; i < string_values.length; i++) {
                var d = {value: [], name: string_values[i]};
                for (var j = 0; j < string_keys.length; j++) {
                    d.value[j] = aggregate_data[i][j];
                    var n = Number(aggregate_data[i][j]);
                    if (_.isUndefined(max) || n > max) {
                        max = n;
                    }
                }
                data.push(d);
            }
            var indicator = [];
            for (var j = 0; j < string_keys.length; j++) {
                indicator.push({name: string_keys[j], max: max * 1.05});
            }
            echartOption = {
                tooltip: {
                    trigger: 'item'
                },
                toolbox: false,
                legend: {
                    data: string_values
                },
                radar: {
                    indicator: indicator
                },
                series: [{
                    name: 'radar',
                    type: 'radar',
                    itemStyle: {
                        emphasis: {
                            areaStyle: {color: 'rgba(0,250,0,0.3)'}
                        }
                    },
                    data: data
                }]
            };
        });
        return echartOption;
    };
});