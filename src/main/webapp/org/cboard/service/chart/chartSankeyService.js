/**
 * Created by yfyuan on 2016/10/28.
 */
'use strict';
cBoard.service('chartSankeyService', function ($state, $window) {

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

        var nodes = [];
        var string_keys = _.map(casted_keys, function (key) {
            var s = key.join('-');
            if (!_.find(nodes, function (e) {return e.name == s;})) {
                nodes.push({name: s});
            }
            return s;
        });
        _.each(casted_values, function (values) {
            if (values.length > 1) {
                values.splice(-1, 1);
            }
            var s = values.join('-');
            if (!_.find(nodes, function (e) {return e.name == s;})) {
                nodes.push({name: s});
            }
        });
        var links = [];
        for (var i = 0; i < aggregate_data.length; i++) {
            for (var j = 0; j < aggregate_data[i].length; j++) {
                if (!_.isUndefined(aggregate_data[i][j])) {
                    links.push({
                        source: string_keys[j],
                        target: casted_values[i].join('-'),
                        value: aggregate_data[i][j]
                    });
                }
            }
        }
        var echartOption = {
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

        var tunningOpt = chartConfig.option;
        if (tunningOpt) {
            if (tunningOpt.legendShow == false) {
                echartOption.grid = echartsBasicOption.grid;
                echartOption.grid.top = '5%';
                echartOption.legend.show =false;
            }
        }

        return echartOption;
    };
});