/**
 * Created by Junjie.M on 2017/07/20.
 */
'use strict';
cBoard.service('chartWordCloudService', function ($state, $window) {

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
        var names = data.keys;
        var values = data.data;

        var datas = [];
        for (var i in names) {
            datas.push({
                name: names[i].join("-"),
                value: values[0][i]
            })
        }

        var option = {
            tooltip: {
                formatter: "{b} : {c}"
            },
            toolbox: {
                show : true,
                feature : {
                    mark : {show: false},
                    dataView : {show: true, readOnly: true},
                    //magicType : {show: true, type: ['line', 'bar']},
                    restore : {show: false},
                    saveAsImage : {show: true}
                }
            },
            series: [{
                type: 'wordCloud',
                gridSize: 5,
                sizeRange: [12, 50],
                rotationRange: [-90, 90],
                rotationStep: 45,
                shape: 'circle',
                textStyle: {
                    normal: {
                        color: function() {
                            return 'rgb(' + [
                                    Math.round(Math.random() * 160),
                                    Math.round(Math.random() * 160),
                                    Math.round(Math.random() * 160)
                                ].join(',') + ')';
                        }
                    },
                    emphasis: {
                        shadowBlur: 10,
                        shadowColor: '#333'
                    }
                },
                data: datas
            }]
        };

        return option;
    };

});
