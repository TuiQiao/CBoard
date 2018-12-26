/**
 * Created by yfyuan on 2016/10/28.
 */
'use strict';
cBoard.service('chartFunnelService', function ($state, $window) {

    this.render = function (containerDom, option, scope, persist, drill, relations, chartConfig) {
        var render = new CBoardEChartRender(containerDom, option);
        render.addClick(chartConfig, relations, $state, $window);
        return render.chart(null, persist);
    };

    this.parseOption = function (data) {
        var chartConfig = data.chartConfig;
        var casted_keys = data.keys;
        var casted_values = data.series;
        var aggregate_data = data.data;
        var newValuesConfig = data.seriesConfig;
        var string_keys = _.map(casted_keys, function (key) {
            return key.join('-');
        });
        var string_values = _.map(casted_values, function (value) {
            return value.join('-');
        });

        var series = [];
        var b = 100 / (string_keys.length * 9 + 1);
        var titles = [];
        for (var i = 0; i < string_keys.length; i++) {
            var s = {
                name: string_keys[i],
                type: 'funnel',
                left: b + i * b * 9 + '%',
                width: b * 8 + '%',
                maxSize: '100%',
                minSize: '10%',
                label: {
                    normal: {
                        formatter: function (params) {
                            return params.value + "\n" + params.data.percent + "%";
                        },
                        show: true,
                        position: 'inside'
                    }
                },
                data: []
            };
            titles.push({
                textAlign: 'center', textStyle: {
                    fontSize: 12,
                    fontWeight: 'normal'
                }, text: string_keys[i], left: 5 * b + i * 9 * b + '%', top: '90%'
            });
            var m = _.max(aggregate_data, function (d) {
                return Number(d[i]);
            })[i];
            for (var d = 0; d < string_values.length; d++) {
                s.data.push({
                    name: string_values[d],
                    value: aggregate_data[d][i],
                    percent: (aggregate_data[d][i] / m * 100).toFixed(2)
                });
            }
            series.push(s);
        }

        var echartOption = {
            title: titles,
            legend: {
                data: string_values
            },
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    return params.seriesName + " <br/>" + params.name + " : " + params.value + "<br>" + params.data.percent + "%";
                }
            },
            toolbox: false,
            series: series
        };

        updateEchartOptions(chartConfig.option, echartOption);

        return echartOption;
    };
});