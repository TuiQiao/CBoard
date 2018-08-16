/**
 * Created by yfyuan on 2017/03/03.
 */
'use strict';
cBoard.service('chartScatterService', function (dataService) {

    this.render = function (containerDom, option, scope, persist, drill, relations, chartConfig) {
        var render = new CBoardEChartRender(containerDom, option);
        render.addClick(chartConfig, relations);
        return render.chart(null, persist);
    };

    this.parseOption = function (data) {
        var chartConfig = data.chartConfig;
        var casted_keys = data.keys;
        var casted_values = data.series;
        var aggregate_data = data.data;
        var newValuesConfig = data.seriesConfig;
        var tunningOpt = chartConfig.option;

        var string_keys = _.map(casted_keys, function (key) {
            return key.join('-');
        });
        var series = [];
        var valueName = [];

        for (var i = 0; i < casted_values.length; i++) {
            var joined_values = casted_values[i].join('-');
            var valueAxisIndex = newValuesConfig[joined_values].valueAxisIndex;
            var name = casted_values[i].slice(0, -1).join('-');

            var s = _.find(series, function (_s) {
                return _s.name == name;
            });
            if (!s) {
                s = {name: name};
                series.push(s);
            }
            if (valueAxisIndex == 0) {
                s.yIdx = i;
            }
            if (valueAxisIndex == 1) {
                s.sizeIdx = i;
            }
            if (valueAxisIndex == 2) {
                s.colorIdx = i;
            }
            valueName[valueAxisIndex] = casted_values[i][casted_values[i].length - 1];
        }
        var data = _.unzip(aggregate_data);

        _.each(series, function (s) {
            s.data = _.map(data, function (d, i) {
                return [string_keys[i], d[s.yIdx], d[s.sizeIdx] ? d[s.sizeIdx] : 1, d[s.colorIdx] ? d[s.colorIdx] : 1];
            });
            s.sizeMax = _.max(s.data, function (d) {
                return Number(d[2]);
            })[2];
            s.sizeMin = _.min(s.data, function (d) {
                return Number(d[2]);
            })[2];
            s.colorMax = _.max(s.data, function (d) {
                return Number(d[3]);
            })[3];
            s.colorMin = _.min(s.data, function (d) {
                return Number(d[3]);
            })[3];
        });
        var sizeMax = _.max(series, function (s) {
            return Number(s.sizeMax);
        }).sizeMax;
        var sizeMin = _.min(series, function (s) {
            return Number(s.sizeMin);
        }).sizeMin;
        var colorMax = _.max(series, function (s) {
            return Number(s.colorMax);
        }).colorMax;
        var colorMin = _.max(series, function (s) {
            return Number(s.colorMin);
        }).colorMin;

        if (tunningOpt) {
            var labelInterval, labelRotate;
            tunningOpt.ctgLabelInterval ? labelInterval = tunningOpt.ctgLabelInterval : 'auto';
            tunningOpt.ctgLabelRotate ? labelRotate = tunningOpt.ctgLabelRotate : 0;
        }

        var echartOption = {
            legend: {
                data: _.map(series, function (v) {
                    return v.name;
                })
            },
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    var s = params.seriesName + " " + params.value[0] + "</br>";
                    for (var i = 1; i < params.value.length; i++) {
                        if (valueName[i - 1] == undefined) continue;
                        s += valueName[i - 1] + " : " + params.value[i] + "<br>"
                    }
                    return s;
                }
            },
            xAxis: {
                data: string_keys,
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                axisLabel: {
                    interval: labelInterval,
                    rotate: labelRotate
                }
            },
            yAxis: {
                axisLabel: {
                    formatter: function (value) {
                        return numbro(value).format("0a.[0000]");
                    }
                },
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                scale: true
            },
            visualMap: [
                {
                    dimension: 2,
                    show: false,
                    min: sizeMin * 0.8,
                    max: sizeMax * 1.5,
                    calculable: true,
                    precision: 0.1,
                    textStyle: {
                        color: 'white'
                    },
                    inRange: {
                        symbolSize: [5, 70]
                    }
                },
                {
                    dimension: 3,
                    show: false,
                    min: colorMin,
                    max: colorMax,
                    inRange: {
                        opacity: [0.2, 1]
                    }

                }],
            series: _.map(series, function (v) {
                var length = -1;
                return {
                    name: v.name,
                    data: _.map(v.data, function (u) {
                        length ++;
                        return {
                            name: string_keys[length],
                            value: u
                        }
                    }),
                    type: 'scatter'
                };
            })
        };

        updateEchartOptions(chartConfig.option, echartOption);

        return echartOption;
    };
});