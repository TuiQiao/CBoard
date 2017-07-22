/**
 * Created by Junjie.M on 2017/07/18.
 */
'use strict';
cBoard.service('chartGaugeService', function () {

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
        var option = {
            tooltip: {
                formatter: "{a} <br/>{b} : {c}"
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
            series: [
                {
                    type: 'gauge',
                    min: 0,                // 最小值
                    max: 100,              // 最大值
                    splitNumber: 10,       // 分割段数，默认为5
                    axisLine: {            // 坐标轴线
                        lineStyle: {       // 属性lineStyle控制线条样式
                            color: [
                                [0.2, '#228b22'],
                                [0.8, '#48b'],
                                [1, '#ff4500']
                            ],
                            width: 8
                        }
                    },
                    axisTick: {            // 坐标轴小标记
                        splitNumber: 10,   // 每份split细分多少段
                        length: 12,        // 属性length控制线长
                        lineStyle: {       // 属性lineStyle控制线条样式
                            color: 'auto'
                        }
                    },
                    axisLabel: {           // 坐标轴文本标签，详见axis.axisLabel
                        textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            color: 'auto'
                        }
                    },
                    splitLine: {           // 分隔线
                        show: true,        // 默认显示，属性show控制显示与否
                        length: 20,         // 属性length控制线长
                        lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                            color: 'auto'
                        }
                    },
                    pointer: {
                        width: 5
                    },
                    title: {
                        show: true,
                        offsetCenter: [0, '-40%'],       // x, y，单位px
                        textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            fontWeight: 'bolder'
                        }
                    },
                    detail: {
                        formatter: '{value}',
                        textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            color: 'auto',
                            fontWeight: 'bolder',
                            fontSize: 20
                        }
                    },
                    data: []
                }
            ]
        };

        var config = data.chartConfig;
        var aggregate_data = data.data;

        var name = config.values[0].name ? config.values[0].name : "";

        var minValue = config.values[0].minValue ? config.values[0].minValue : 0;
        var maxValue = config.values[0].maxValue ? config.values[0].maxValue : 100;
        if (isNaN(minValue) || isNaN(maxValue) || parseFloat(minValue) >= parseFloat(maxValue)) {
            minValue = 0;
            maxValue = 100;
        }
        option.series[0].min = minValue;
        option.series[0].max = maxValue;

        var colors = [];
        for (var i in config.styles) {
            var proportion = config.styles[i].proportion;
            var color = config.styles[i].color;
            if (proportion != undefined && proportion != "")
                colors.push([proportion, color]);
        }
        if (colors.length > 0) {
            option.series[0].axisLine.lineStyle.color = colors;
        }

        var value = aggregate_data.length > 0 ? aggregate_data[0][0] : 'N/A';
        if (config.values[0].format) {
            value = numbro(value).format(config.values[0].format);
        }

        var index = value.lastIndexOf("%");
        if (index != -1) {
            value = value.substring(0, index);
            option.tooltip.formatter = "{a} <br/>{b} : {c}%";
            option.series[0].detail.formatter = "{value}%";
        }

        option.series[0].data = [{name: name, value: value}];

        return option;
    };
});