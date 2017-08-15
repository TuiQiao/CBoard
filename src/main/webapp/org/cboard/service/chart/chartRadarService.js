/**
 * Created by yfyuan on 2016/10/28.
 */
'use strict';
cBoard.service('chartRadarService', function ($state, $window) {

    this.render = function (containerDom, option, scope, persist, drill, relations, chartConfig) {
        var render = new CBoardEChartRender(containerDom, option);
        render.addClick(chartConfig, relations, $state, $window);
        return render.chart(null, persist);
    };

    this.parseOption = function (_data) {
        var chartConfig = _data.chartConfig;
        var casted_keys = _data.keys;
        var casted_values = _data.series;
        var aggregate_data = _data.data;

        var string_keys = _.map(casted_keys, function (key) {
            return key.join('-');
        });
        var string_values = _.map(casted_values, function (value) {
            return value.join('-');
        });
        var data = [];
        var max;
        var indicator = [];
        if (chartConfig.drawBy === 'row') {
            for (var i = 0; i < string_keys.length; i++) {
                var d = {value: [], name: string_keys[i]};
                for (var j = 0; j < casted_values.length; j++) {
                    d.value[j] = aggregate_data[j][i];
                    var n = Number(aggregate_data[j][i]);
                    if (_.isUndefined(max) || n > max) {
                        max = n;
                    }
                }
                data.push(d);
            }
            for (var j = 0; j < casted_values.length; j++) {
                indicator.push({name: casted_values[j], max: max * 1.05});
            }
        } else {
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
            for (var j = 0; j < string_keys.length; j++) {
                indicator.push({name: string_keys[j], max: max * 1.05});
            }
        }


        var echartOption = {
            tooltip: {
                trigger: 'item'
            },
            toolbox: false,
            legend: {
                orient: 'vertical',
                left: 'left',
                data: chartConfig.drawBy === 'row' ? string_keys : string_values
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

        updateEchartOptions(chartConfig.option, echartOption);

        return echartOption;
    };
});