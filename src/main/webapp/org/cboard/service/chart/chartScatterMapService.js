/**
 * Created by jintian on 2017/8/10.
 */
cBoard.service('chartScatterMapService', function () {
    this.render = function (containerDom, option, scope, persist) {
        return new CBoardEChartRender(containerDom, option).chart(null, persist);
    }

    this.parseOption = function (data) {
        var optionData = [];
        var series =[];
        var serieData = [];
        var max = 0;
        var addressN;
        var addressL;
        var addressName;
        // map setting
        var chartConfig = data.chartConfig;
        var code = 'china';
        if (chartConfig.city && chartConfig.city.code) {
            code = chartConfig.city.code;
        } else if (chartConfig.province && chartConfig.province.code) {
            code = chartConfig.province.code;
        }
        var url;
        if (code == 'china') {
            url = 'plugins/FineMap/mapdata/china.json'
        } else if (code.length > 2) {
            url = 'plugins/FineMap/mapdata/geometryCouties/' + code + '.json';
        } else {
            url = 'plugins/FineMap/mapdata/geometryProvince/' + code + '.json';
        }

        // series setting
        for(var j = 0 ; j < data.series.length ; j++){
            //max = 0;
            serieData = [];
            for(var i = 0 ; i < data.keys.length ; i++){
                if(data.keys[i].length > 2){
                    addressN = parseFloat(data.keys[i][0]);
                    addressL = parseFloat(data.keys[i][1]);
                    addressName = data.keys[i][2];
                }else if(data.keys[i].length == 2){
                    addressN = parseFloat(data.keys[i][0].split(",")[0]);
                    addressL = parseFloat(data.keys[i][0].split(",")[1]);
                    addressName = data.keys[i][1];
                }else{
                    addressName = null;
                    addressN = null;
                    addressL = null;
                }
                if(max < parseFloat(data.data[j][i])){
                    max = parseFloat(data.data[j][i]);
                }
                serieData.push({
                    name:addressName,
                    value:[addressN,addressL,parseFloat(data.data[j][i])]
                })

            }
            optionData.push(data.series[j][0]);
            series.push(
                {
                    name: data.series[j][0],
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    data: serieData,
                    symbolSize : function (val) {
                        return val[2] * 30 / max;
                    },
                    label: {
                        normal: {
                            formatter: '{b}',
                                position: 'right',
                                show: false
                        },
                        emphasis: {
                            show: true
                        }
                    }
                }
            );
        }

        var mapOption;

        $.ajax({
            type: "get",
            url: url,
            async: false,
            success: function (cityJson) {
                echarts.registerMap(code, cityJson);
                mapOption = {
                    legend: {
                        orient: 'vertical',
                        top: 'top',
                        left: 'left',
                        selectedMode: 'single',
                        data: optionData
                    },
                    geo: {
                        map: code,
                        roam: true,
                        itemStyle: {
                            normal: {
                                areaColor: '#EFF0F0',
                                borderColor: '#B5B5B5',
                                borderWidth: 1
                            }
                        }
                    },
                    tooltip: {
                        trigger: 'item'
                    },
                    series: series
                };
            }
        });
        return mapOption;
    };
});
