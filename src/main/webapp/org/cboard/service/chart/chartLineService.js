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

        //主要用于判断是否要将折线起始点和x轴紧贴
        var line_type;
        for (var i = 0; i < aggregate_data.length; i++) {
            var joined_values = casted_values[i].join('-');
            var s = angular.copy(newValuesConfig[joined_values]);
            s.name = joined_values;
            s.data = aggregate_data[i];
            s.barMaxWidth = 40;
            line_type = s.type;
            if (s.type == 'stackbar') {
                s.type = 'bar';
                s.stack = s.valueAxisIndex.toString();
            } else if(s.type == 'polarbar'){
                s.type = 'bar';
                s.stack = s.valueAxisIndex.toString();
                s.coordinateSystem = 'polar';
            } else if (s.type == 'percentbar') {
                if (chartConfig.valueAxis == 'horizontal'){
                    s.data = _.map(aggregate_data[i], function (e, i) {
                        return (e / sum_data[i] * 100).toFixed(2);
                    })
                } else {
                    s.data = _.map(aggregate_data[i], function (e, i) {
                        return [i, (e / sum_data[i] * 100).toFixed(2), e];
                    });
                }
                s.type = 'bar';
                s.stack = s.valueAxisIndex.toString();
            } else if (s.type == "arealine") {
                s.type = "line";
                s.areaStyle = {normal: {}};
            } else if (s.type == "stackline") {
                s.type = "line";
                s.stack = s.valueAxisIndex.toString();
                s.areaStyle = {normal: {}};
            } else if (s.type == 'percentline') {
                if (chartConfig.valueAxis == 'horizontal'){
                    s.data = _.map(aggregate_data[i], function (e, i) {
                        return (e / sum_data[i] * 100).toFixed(2);
                    })
                } else {
                    s.data = _.map(aggregate_data[i], function (e, i) {
                        return [i, (e / sum_data[i] * 100).toFixed(2), e];
                    });
                }
                s.type = "line";
                s.stack = s.valueAxisIndex.toString();
                s.areaStyle = {normal: {}};
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
            if (axis.series_type == "percentbar" || axis.series_type == "percentline") {
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
        if(line_type == 'line' || line_type == 'arealine'
            || line_type == 'stackline' || line_type == 'percentline'){
            categoryAxis.boundaryGap = false;
        }

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
                },
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            series: series_data
        };

        if(line_type == 'polarbar'){
            echartOption.angleAxis = chartConfig.valueAxis == 'horizontal' ? valueAxis : categoryAxis;
            echartOption.radiusAxis = chartConfig.valueAxis == 'horizontal' ? categoryAxis : valueAxis;
            echartOption.polar = {};
        }else {
            echartOption.xAxis = chartConfig.valueAxis == 'horizontal' ? valueAxis : categoryAxis;
            echartOption.yAxis = chartConfig.valueAxis == 'horizontal' ? categoryAxis : valueAxis;
        }

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
