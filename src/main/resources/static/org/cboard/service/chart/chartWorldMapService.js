/**
 * Created by yalishizhude on 2018/3/14.
 */
cBoard.service('chartWorldMapService', function ($state, $window) {
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
        var tunningOpt = chartConfig.option;

        var code = 'world';
        var mapData;
        if (chartConfig.option.lang) {
            mapData = code + '-' + chartConfig.option.lang + '.json';
        } else {
            mapData = code + '-' + settings.preferredLanguage + '.json';
        }
        var url = 'plugins/FineMap/mapdata/' + mapData;
        var mapOption = null;
        var groups = _.map(casted_values, function (val) {
            return val.join("-")
        });
        var series = [];
        for (var i = 0; i < groups.length; i++) {
            var data = [];
            for (var j = 0; j < aggregate_data[i].length; j++) {
                var rawName = casted_keys[j][chartConfig.keys.length - 1];
                var e = {
                    "name": rawName,
                    "value": aggregate_data[i][j] ? aggregate_data[i][j] : 0
                };
                data.push(e);
            }
            var e = {
                name: groups[i],
                type: 'map',
                map: code,
                roam: true,
                tooltip: {
                    trigger: 'item'
                },
                itemStyle: {
                    emphasis: {
                        label: {
                            show: true
                        }
                    }
                },
                data: data
            };
            series.push(e);
        }
        var totals = [];
        for (var i = 0; i < casted_values.length; i++) {
            var total = 0;
            for (var j = 0; j < aggregate_data[i].length; j++) {
                total += parseFloat(!isNaN(aggregate_data[i][j]) ? aggregate_data[i][j] : 0);
            }
            totals.push(total);
        }
        totals.sort(function (a, b) {
            return a - b;
        });
        var max = totals[totals.length - 1];
        $.ajax({
            type: "get",
            url: url,
            async: false,
            success: function (worldJson) {
                echarts.registerMap(code, worldJson);
                mapOption = {
                    toolbox: {
                        show: false,
                        orient: 'vertical',
                        left: 'right',
                        top: 'center',
                        feature: {
                            dataView: {
                                readOnly: false
                            },
                            restore: {},
                            saveAsImage: {}
                        }
                    },
                    visualMap: {
                        min: 0,
                        max: max,
                        realtime: false,
                        calculable: true,
                        inRange: {
                            color: ['lightskyblue', 'yellow', 'orangered']
                        }
                    },
                    series: series
                };
            }
        });
        return mapOption;
    };
});