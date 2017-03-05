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
            }
            var data = _.unzip(aggregate_data);

            _.each(series, function (s) {
                s.data = _.map(data, function (d, i) {
                    return [string_keys[i], d[s.yIdx], d[s.sizeIdx], d[s.colorIdx]];
                });
                s.sizeMax = _.max(data, function (d) {
                    return d[s.sizeIdx];
                })[s.sizeIdx];
                s.colorMax = _.max(data, function (d) {
                    return d[s.colorIdx];
                })[s.colorIdx];
            });

            echartOption = {
                legend: {
                    data: _.map(series, function (v) {
                        return v.name;
                    })
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
                            return data[2] / v.sizeMax * 10
                        },
                        itemStyle: {
                            normal: {
                                opacity: data[3] / v.colorMax * 1.0
                            }
                        }
                    };
                })
            };
        });
        return echartOption;
    };
});