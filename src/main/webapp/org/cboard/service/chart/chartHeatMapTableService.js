/**
 * Created by Junjie.M on 2017/07/26.
 */
'use strict';
cBoard.service('chartHeatMapTableService', function () {

    this.render = function (containerDom, option, scope, persist) {
        if (option == null) {
            containerDom.html("<div class=\"alert alert-danger\" role=\"alert\">No Data!</div>");
            return;
        }
        var height;
        scope ? height = scope.myheight - 20 : null;
        return new CBoardEChartRender(containerDom, option).chart(height, persist);
    };

    this.parseOption = function (data) {
        var preferredLanguage = settings.preferredLanguage;

        var config = data.chartConfig;
        var xAxisName = "";
        for (var i in config.keys) {
            xAxisName += i == 0 ? config.keys[i].col : "-" + config.keys[i].col;
        }
        var yAxisName = "";
        for (var i in config.groups) {
            yAxisName += i == 0 ? config.groups[i].col : "-" + config.groups[i].col;
        }

        var xAxisData = data.keys.map(function (item) {
            return item.join('-');
        });
        var yAxisData = data.series.map(function (item) {
            var newItem = [];
            for (var i in item) {
                if (i != item.length - 1) {
                    newItem.push(item[i]);
                }
            }
            return newItem.join('-');
        });

        var min = 0;
        var max = 0;
        var datas = [];
        for (var i in data.data) {
            for (var j in data.data[i]) {
                var value = isNaN(data.data[i][j]) ? 0 : parseFloat(data.data[i][j]);
                min = value < min ? value : min;
                max = value > max ? value : max;
                datas.push([parseInt(j), parseInt(i), value]);
            }
        }

        var style = config.values[0].style ? config.values[0].style : "blue";

        var option = {
            tooltip: {
                //position: 'top',
                /*axisPointer: { // 坐标轴指示器，坐标轴触发有效
                 type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                 },*/
                trigger: 'item',
                axisPointer: {
                    show: false,
                    type: 'shadow'
                },
                formatter: function (params) {
                    return 'x ' + cboardTranslate("CONFIG.WIDGET.VALUE_AXIS") + ': ' + xAxisData[params.value[0]] +
                        '<br/>y ' + cboardTranslate("CONFIG.WIDGET.VALUE_AXIS") + ': ' + yAxisData[params.value[1]] +
                        '<br/>' + cboardTranslate("COMMON.VALUE") + ': ' + params.value[2];
                }
            },
            animation: false,
            toolbox: {
                show: true,
                feature: {
                    mark: {show: false},
                    dataView: {show: true, readOnly: true},
                    restore: {show: false},
                    saveAsImage: {show: true}
                }
            },
            xAxis: {
                name: xAxisName,
                type: 'category',
                data: xAxisData,
                splitArea: {
                    show: true
                }
            },
            yAxis: {
                name: yAxisName,
                type: 'category',
                data: yAxisData,
                splitArea: {
                    show: true
                }
            },
            dataZoom: [
                {
                    type: 'slider',
                    show: true,
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }
            ],
            visualMap: {
                min: min,
                max: max,
                calculable: true,
                orient: 'horizontal',
                left: 'left',
                bottom: '90%',
                inRange: {
                    color: ['#eee', style]
                }
            },
            series: [{
                type: 'heatmap',
                data: datas
            }]
        };

        return option;
    };

});