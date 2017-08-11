/**
 * Created by jintian on 2017/7/26.
 */
cBoard.service('chartMarkLineMapService', function () {
    this.render = function (containerDom, option, scope, persist) {
        return new CBoardEChartRender(containerDom, option).chart(null, persist);
    }

    this.parseOption = function (data) {
        var data_keys = data.keys;
        var data_series = data.series;
        var geoKey;
        var geoCoordMap = {};
        var seriesData = [];
        var optionData = [];

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

        var max = 0;
        for (var j = 0; data_keys[0] && j < data_keys.length; j++) {
            if(data_keys[j].length > 2){
                geoKey = data_keys[j][2];
                geoCoordMap[geoKey] = [data_keys[j][0], data_keys[j][1]];
            }else if(data_keys[j].length = 2){
                geoKey = data_keys[j][1];
                geoCoordMap[geoKey] = [data_keys[j][0].split(",")[0],data_keys[j][0].split(",")[1]];
            }
        }
        for (var j = 0; data_series[0] && j < data_series.length; j++) {
            if(data_series[j].length > 3){
                geoKey = data_series[j][2];
                geoCoordMap[geoKey] = [data_series[j][0], data_series[j][1]];
                optionData[j] = data_series[j][2];
            }else if(data_series[j].length = 3){
                geoKey = data_series[j][1];
                geoCoordMap[geoKey] = [data_series[j][0].split(",")[0],data_series[j][0].split(",")[1]];
                optionData[j] = data_series[j][1];
            }

            var serieData = [];
            for (var i = 0, n = 0; data_keys[0] && i < data_keys.length; i++) {
                if (data.data[j][i] && data.data[j][i] != 0) {
                    if(data_keys[i].length > 2){
                        serieData[n] = [{name: geoKey}, {name: data_keys[i][2], value: data.data[j][i]}];
                    }else if(data_keys[i].length = 2){
                        serieData[n] = [{name: geoKey}, {name: data_keys[i][1], value: data.data[j][i]}];
                    }
                    n++;
                    if (max < parseFloat(data.data[j][i])) {
                        max = parseFloat(data.data[j][i]);
                    }
                }
            }
            seriesData[j] = [geoKey, serieData]
        }
        var convertData = function (data) {
            var res = [];
            for (var i = 0; i < data.length; i++) {
                var dataItem = data[i];
                var fromCoord = geoCoordMap[dataItem[0].name];
                var toCoord = geoCoordMap[dataItem[1].name];
                if (fromCoord && toCoord) {
                    res.push({
                        fromName: dataItem[0].name,
                        toName: dataItem[1].name,
                        coords: [fromCoord, toCoord]
                    });
                }
            }
            return res;
        };

        var series = [];
        seriesData.forEach(function (item, i) {
            series.push({
                    name: item[0],
                    type: 'lines',
                    zlevel: 2,
                    symbol: ['none', 'arrow'],
                    symbolSize: 10,
                    effect: {
                        show: true,
                        period: 6,
                        trailLength: 0,
                        symbol: 'arrow',
                        symbolSize: 4
                    },
                    lineStyle: {
                        normal: {
                            width: 1,
                            opacity: 0.6,
                            curveness: 0.2
                        }
                    },
                    data: convertData(item[1])
                },
                {
                    name: item[0],
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    zlevel: 2,
                    rippleEffect: {
                        brushType: 'stroke'
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            formatter: '{b}'
                        }
                    },
                    symbolSize: function (val) {
                        if (max == 0) {
                            return 0;
                        }
                        return val[2] * 20 / max;
                    },
                    itemStyle: {
                        normal: {
                            color: function(val){
                                return ['#d94e5d','#eac736','#50a3ba'].reverse();
                            }
                        }
                    },
                    data: item[1].map(function (dataItem) {
                        return {
                            name: dataItem[1].name,
                            value: geoCoordMap[dataItem[1].name].concat([dataItem[1].value])
                        };
                    })
                });
        });
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
                        //text: ['High', 'Low'],
                        selectedMode: 'multiple',
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
