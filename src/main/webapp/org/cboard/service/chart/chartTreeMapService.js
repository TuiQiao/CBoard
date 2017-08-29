/**
 * Created by Junjie.M on 2017/07/21.
 */
'use strict';
cBoard.service('chartTreeMapService', function ($state, $window) {

    this.render = function (containerDom, option, scope, persist, drill, relations, chartConfig) {
        if (option == null) {
            containerDom.html("<div class=\"alert alert-danger\" role=\"alert\">No Data!</div>");
            return;
        }
        var height;
        scope ? height = scope.myheight - 20 : null;
        var render = new CBoardEChartRender(containerDom, option);
        render.addClick(chartConfig, relations, $state, $window);
        return render.chart(height, persist);
    };

    this.parseOption = function (data) {

        var option = {
            tooltip: {
                formatter: '{b} : {c}'
            },
            series: [{
                type: 'treemap',
                visibleMin: 1,
                label: {
                    normal: {
                        show: true,
                        position: 'insideTopLeft',
                        formatter: function (a) {
                            return a.name + "\n\nvalue : " + a.value;
                        },
                        textStyle: {
                            fontSize: '14',
                            fontWeight: 'bold'
                        }
                    }
                }
            }]
        };

        var config = data.chartConfig;

        var name = config.values[0].name ? config.values[0].name : "Main";
        option.series[0].name = name;

        var leafDepth = config.values[0].leafDepth ? config.values[0].leafDepth : 1;
        option.series[0].leafDepth = leafDepth;

        var style = config.values[0].style ? config.values[0].style : "random";
        if (style != "random" && style != "multi") option.color = [style];

        var depth = data.chartConfig.keys.length;
        var keys = data.keys;
        var values = data.data;
        for (var i in keys) keys[i].reverse();
        var datas = recursion(depth, depth, "", keys, values, style);
        if (style != "random" && style != "multi") {
            option.series[0].data = [
                {
                    value: 1000,
                    children: datas
                }
            ];
        } else {
            option.series[0].data = datas;
        }

        var levels = [];
        for (var i = depth; i > 0; i--) {
            levels.push({
                colorSaturation: [0.2, 0.6],
                itemStyle: {
                    normal: {
                        borderColorSaturation: 0.7,
                        gapWidth: i
                    }
                }
            });
        }
        option.series[0].levels = levels;

        return option;
    };

    /**
     * 递归
     */
    function recursion(depth, totalDepth, prefix, keys, values, style) {
        var map = getMap(depth, totalDepth, prefix, keys, values);
        var data = [];
        if (depth == totalDepth) {
            for (var k in map) {
                var obj = {
                    name: map[k].arr[depth - 1],
                    value: map[k].val,
                    children: recursion(depth - 1, totalDepth, map[k].key, keys, values)
                };
                if (style == "random") obj.itemStyle = createRandomItemStyle();
                data.push(obj);
            }
        } else if (depth > 1) {
            for (var k in map) {
                data.push({
                    name: map[k].arr[depth - 1],
                    value: map[k].val,
                    children: recursion(depth - 1, totalDepth, map[k].key, keys, values)
                });
            }
        } else if (depth == 1) {
            for (var k in map) {
                data.push({
                    name: map[k].arr[depth - 1],
                    value: map[k].val
                });
            }
        }
        return data;
    }

    function getMap(depth, totalDepth, prefix, keys, values) {
        var map = {};
        for (var i in keys) {
            var key = keys[i][depth - 1];
            if (totalDepth > depth) {
                var prefixs = "";
                for (var j = totalDepth; j > depth; j--) {
                    if (j == totalDepth)
                        prefixs = keys[i][j - 1];
                    else
                        prefixs = prefixs + "-" + keys[i][j - 1];
                }
                if (prefix != prefixs) continue;
                key = prefix + "-" + key;
            }
            var val = isNaN(values[0][i]) ? 0 : parseFloat(values[0][i]);
            if (map[key] == undefined) {
                map[key] = {key: key, val: val, arr: keys[i]};
            } else {
                map[key] = {key: key, val: map[key].val + val, arr: keys[i]};
            }
        }
        return map;
    }


    function createRandomItemStyle() {
        return {
            normal: {
                color: 'rgb(' + [
                    Math.round(Math.random() * 160),
                    Math.round(Math.random() * 160),
                    Math.round(Math.random() * 160)
                ].join(',') + ')'
            }
        };
    }

});
