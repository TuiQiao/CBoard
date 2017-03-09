/**
 * Created by yfyuan on 2017/03/03.
 */
'use strict';
cBoard.service('chartScatterService', function (dataService) {

    this.render = function (containerDom, option, scope, persist) {
        return new CBoardEChartRender(containerDom, option).chart(null, persist);
    };

    this.parseOption = function (chartData, chartConfig) {
        var echartOption = null;
        dataService.castRawData2Series(chartData, chartConfig, function (casted_keys, casted_values, aggregate_data, newValuesConfig) {
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
                    return [string_keys[i], d[s.yIdx], d[s.sizeIdx], d[s.colorIdx]];
                });
                s.sizeMax = _.max(data, function (d) {
                    return Number(d[s.sizeIdx]);
                })[s.sizeIdx];
                s.colorMax = _.max(data, function (d) {
                    return Number(d[s.colorIdx]);
                })[s.colorIdx];
            });
            var sizeMax = _.max(series, function (s) {
                return Number(s.sizeMax);
            }).sizeMax;
            var colorMax = _.max(series, function (s) {
                return Number(s.colorMax);
            }).colorMax;
            echartOption = {
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
                series: _.map(series, function (v) {
                    return {
                        name: v.name,
                        data: v.data,
                        type: 'scatter',
                        symbolSize: function (data) {
                            if (data[2]) {
                                return data[2] / sizeMax * 50;
                            } else {
                                return 0;
                            }
                        },
                        itemStyle: {
                            normal: {
                                opacity: data[3] / colorMax * 1.0
                            }
                        }
                    };
                })
            };
        });
        return echartOption;
    };
});