/**
 * Created by yfyuan on 2016/10/28.
 */
'use strict';
cBoard.service('chartLineService', function ($state, $window) {

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
        var series_data = new Array();
        var string_keys = _.map(casted_keys, function (key) {
            return key.join('-');
        });
        var tunningOpt = chartConfig.option;

        var sum_data = [];
        for (var j = 0; aggregate_data[0] && j < aggregate_data[0].length; j++) {
            var sum = 0;
            for (var i = 0; i < aggregate_data.length; i++) {
                sum += aggregate_data[i][j] ? Number(aggregate_data[i][j]) : 0;
                // change undefined to 0
                aggregate_data[i][j] = aggregate_data[i][j] ? Number(aggregate_data[i][j]) : 0;
            }
            sum_data[j] = sum;
        }

        for (var i = 0; i < aggregate_data.length; i++) {
            var joined_values = casted_values[i].join('-');
            var s = angular.copy(newValuesConfig[joined_values]);
            s.name = joined_values;
            s.data = aggregate_data[i];
            s.barMaxWidth = 40;
            if (s.type == 'stackbar') {
                s.type = 'bar';
                s.stack = s.valueAxisIndex.toString();
            } else if (s.type == 'percentbar') {
                s.data = _.map(aggregate_data[i], function (e, i) {
                    return [i, (e / sum_data[i] * 100).toFixed(2), e];
                });
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
        _.each(valueAxis, function (axis, index) {
            axis.axisLabel = {
                formatter: function (value) {
                    return numbro(value).format("0a.[0000]");
                }
            };
            if (axis.series_type == "percentbar") {
                axis.min = 0;
                axis.max = 100;
            } else {
                axis.min = axis.min ? axis.min : null;
                axis.max = axis.max ? axis.max : null;
            }
            if (index > 0) {
                axis.splitLine = false;
            }
            axis.scale = true;
        });

        if (tunningOpt) {
            var labelInterval, labelRotate;
            tunningOpt.ctgLabelInterval ? labelInterval = tunningOpt.ctgLabelInterval : 'auto';
            tunningOpt.ctgLabelRotate ? labelRotate = tunningOpt.ctgLabelRotate : 0;
        }

        var categoryAxis = {
            type: 'category',
            data: string_keys,
            axisLabel: {
                interval: labelInterval,
                rotate: labelRotate
            }
        };

        var echartOption = {
            grid: angular.copy(echartsBasicOption.grid),
            legend: {
                data: _.map(casted_values, function (v) {
                    return v.join('-');
                })
            },
            tooltip: {
                formatter: function (params) {
                    var name = params[0].name;
                    var s = name + "</br>";
                    for (var i = 0; i < params.length; i++) {
                        s += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + params[i].color + '"></span>';
                        if (params[i].value instanceof Array) {
                            s += params[i].seriesName + " : " + params[i].value[1] + "% (" + params[i].value[2] + ")<br>";
                        } else {
                            s += params[i].seriesName + " : " + params[i].value + "<br>";
                        }
                    }
                    return s;
                }
            },
            xAxis: chartConfig.valueAxis == 'horizontal' ? valueAxis : categoryAxis,
            yAxis: chartConfig.valueAxis == 'horizontal' ? categoryAxis : valueAxis,
            series: series_data
        };

        if (chartConfig.valueAxis === 'horizontal') {
            echartOption.grid.left = 'left';
            echartOption.grid.containLabel = true;
            echartOption.grid.bottom = '5%';
        }
        if (chartConfig.valueAxis === 'vertical' && chartConfig.values.length > 1) {
            echartOption.grid.right = 40;
        }

        // Apply tunning options
        updateEchartOptions(tunningOpt, echartOption);

        return echartOption;
    };
});
