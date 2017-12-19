/**
 * Created by yfyuan on 2016/10/28.
 */
'use strict';
cBoard.service('chartContrastService', function () {

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

        var max = aggregate_data[0][0];
        _.each(aggregate_data, function(arr){
            _.each(arr, function(e){
                if(parseFloat(e) > parseFloat(max)){
                    max = e;
                }
            });
        });

        var Axis = [
            {
                type : 'value',
                min:-max,
                max:max
            }
        ];
        var valueAxis = [
            {
                type : 'category',
                axisTick : {show: false},
                data : string_keys
            }
        ];
        var echartOption = {
            tooltip: {
                formatter: function (params) {
                    var name = params[0].name;
                    var s = name + "</br>";
                    for (var i = 0; i < params.length; i++) {
                        s += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + params[i].color + '"></span>';
                        if (params[i].value instanceof Array) {
                            s += params[i].seriesName + " : " + params[i].value[1] + "% (" + params[i].value[2] + ")<br>";
                        } else {
                            s += params[i].seriesName + " : " + params[i].value + "<br>";
                        }
                    }
                    return s;
                }
            },
            legend: {
                data: [casted_values[0][0],casted_values[1][0]]
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis : chartConfig.valueAxis == "horizontal" ? valueAxis:Axis,
            yAxis : chartConfig.valueAxis == "horizontal" ? Axis:valueAxis,
            series : [
                {
                    name:casted_values[0],
                    type:'bar',
                    stack: '总量',
                    barWidth: 20,
                    label: {
                        normal: {
                            show: false
                        }
                    },
                    itemStyle:{
                        normal: {
                            color : '#C23531'
                        }
                    },
                    data:_.map(aggregate_data[0],function(e){return -e})
                },
                {
                    name:casted_values[1],
                    type:'bar',
                    stack: '总量',
                    barWidth: 20,
                    label: {
                        normal: {
                            show: false
                        }
                    },
                    itemStyle:{
                        normal: {
                            color : '#3C8DBC'
                        }
                    },
                    data:aggregate_data[1]
                }
            ]
        };

        updateEchartOptions(tunningOpt, echartOption);
        return echartOption;
    };
});
