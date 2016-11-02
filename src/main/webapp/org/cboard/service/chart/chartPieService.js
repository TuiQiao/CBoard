/**
 * Created by yfyuan on 2016/10/28.
 */
'use strict';
cBoard.service('chartPieService', function (dataService) {

    this.render = function (containerDom, option, scope) {
        return new CBoardEChartRender(containerDom, option).chart();
    };

    this.parseOption = function (chartData, chartConfig) {
        var echartOption = null;
        dataService.castRawData2Series(chartData, chartConfig, function (casted_keys, casted_values, aggregate_data, newValuesConfig) {
            var series = new Array();
            var string_keys = _.map(casted_keys, function (key) {
                return key.join('-');
            });
            var string_value = _.map(casted_values, function (value) {
                return value.join('-');
            });
            var b = 100 / (casted_values.length * 9 + 1);
            var titles = [];
            for (var i = 0; i < aggregate_data.length; i++) {
                var s = {
                    name: string_value[i],
                    type: 'pie',
                    center: [5 * b + i * 9 * b + '%', '50%'],
                    data: [],
                    roseType: 'angle'
                };
                titles.push({
                    textAlign: 'center', textStyle: {
                        fontSize: 12,
                        fontWeight: 'normal'
                    }, text: string_value[i], left: 5 * b + i * 9 * b + '%', top: '90%'
                })
                for (var j = 0; j < aggregate_data[i].length; j++) {
                    s.data.push({name: string_keys[j], value: aggregate_data[i][j]})
                }
                series.push(s);
            }
            echartOption = {
                title: titles,
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    data: string_keys
                },
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                toolbox: false,
                series: series
            };
        });
        return echartOption;
    };
});