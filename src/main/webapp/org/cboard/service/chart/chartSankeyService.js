/**
 * Created by yfyuan on 2016/10/28.
 */
'use strict';
cBoard.service('chartSankeyService', function (dataService) {

    this.render = function (containerDom, option, scope) {
        return new CBoardEChartRender(containerDom, option).chart();
    };

    this.parseOption = function (chartData, chartConfig) {
        var echartOption = null;
        dataService.castRawData2Series(chartData, chartConfig, function (casted_keys, casted_values, aggregate_data, newValuesConfig) {
            var nodes = [];
            var string_keys = _.map(casted_keys, function (key) {
                var s = key.join('-')
                nodes.push({name: s});
                return s;
            });
            var links = [];
            for (var i = 0; i < aggregate_data.length; i++) {
                for (var j = 0; j < aggregate_data[i].length; j++) {
                    if (!_.isUndefined(aggregate_data[i][j])) {
                        if (casted_values[i].length > 1) {
                            casted_values[i].splice(-1, 1);
                        }
                        links.push({
                            source: string_keys[j],
                            target: casted_values[i].join('-'),
                            value: aggregate_data[i][j]
                        });
                    }
                }
            }
            echartOption = {
                tooltip: {
                    trigger: 'item',
                    triggerOn: 'mousemove'
                },
                toolbox: false,
                series: [{
                    type: 'sankey',
                    layout: 'none',
                    data: nodes,
                    links: links,
                    itemStyle: {
                        normal: {
                            borderWidth: 1,
                            borderColor: '#aaa'
                        }
                    },
                    lineStyle: {
                        normal: {
                            color: 'source',
                            curveness: 0.5
                        }
                    }
                }]
            };
        });
        return echartOption;
    };
});