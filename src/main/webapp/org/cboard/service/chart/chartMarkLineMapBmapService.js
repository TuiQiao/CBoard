/**
 * Created by jintian on 2017/8/7.
 */
cBoard.service('chartMarkLineMapBmapService', function () {
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

        var max = 0;
        for (var j = 0; data_keys[0] && j < data_keys.length; j++) {
            if (data_keys[j].length > 2) {
                geoKey = data_keys[j][2];
                geoCoordMap[geoKey] = [data_keys[j][0], data_keys[j][1]];
            } else if (data_keys[j].length = 2) {
                geoKey = data_keys[j][1];
                geoCoordMap[geoKey] = [data_keys[j][0].split(",")[0], data_keys[j][0].split(",")[1]];
            }
        }
        for (var j = 0; data_series[0] && j < data_series.length; j++) {
            if (data_series[j].length > 3) {
                geoKey = data_series[j][2];
                geoCoordMap[geoKey] = [data_series[j][0], data_series[j][1]];
                optionData[j] = data_series[j][2];
            } else if (data_series[j].length = 3) {
                geoKey = data_series[j][1];
                geoCoordMap[geoKey] = [data_series[j][0].split(",")[0], data_series[j][0].split(",")[1]];
                optionData[j] = data_series[j][1];
            }

            var serieData = [];
            for (var i = 0, n = 0; data_keys[0] && i < data_keys.length; i++) {
                if (data.data[j][i] && data.data[j][i] != 0) {
                    if (data_keys[i].length > 2) {
                        serieData[n] = [{name: geoKey}, {name: data_keys[i][2], value: data.data[j][i]}];
                    } else if (data_keys[i].length = 2) {
                        serieData[n] = [{name: geoKey}, {name: data_keys[i][1], value: data.data[j][i]}];
                    }
                    n++;
                    if (max < parseInt(data.data[j][i])) {
                        max = parseInt(data.data[j][i]);
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

        var startPoint = {
            x: 104.114129,
            y: 37.550339
        };
        // 地图自定义样式
        var bmap = {
            center: [startPoint.x, startPoint.y],
            zoom: 5,
            roam: true,
            mapStyle: {
                styleJson: [{
                    "featureType": "water",
                    "elementType": "all",
                    "stylers": {
                        "color": "#044161"
                    }
                }, {
                    "featureType": "land",
                    "elementType": "all",
                    "stylers": {
                        "color": "#004981"
                    }
                }, {
                    "featureType": "boundary",
                    "elementType": "geometry",
                    "stylers": {
                        "color": "#064f85"
                    }
                }, {
                    "featureType": "railway",
                    "elementType": "all",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "highway",
                    "elementType": "geometry",
                    "stylers": {
                        "color": "#004981"
                    }
                }, {
                    "featureType": "highway",
                    "elementType": "geometry.fill",
                    "stylers": {
                        "color": "#005b96",
                        "lightness": 1
                    }
                }, {
                    "featureType": "highway",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "arterial",
                    "elementType": "geometry",
                    "stylers": {
                        "color": "#004981"
                    }
                }, {
                    "featureType": "arterial",
                    "elementType": "geometry.fill",
                    "stylers": {
                        "color": "#00508b"
                    }
                }, {
                    "featureType": "poi",
                    "elementType": "all",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "green",
                    "elementType": "all",
                    "stylers": {
                        "color": "#056197",
                        "visibility": "off"
                    }
                }, {
                    "featureType": "subway",
                    "elementType": "all",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "manmade",
                    "elementType": "all",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "local",
                    "elementType": "all",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "arterial",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "boundary",
                    "elementType": "geometry.fill",
                    "stylers": {
                        "color": "#029fd4"
                    }
                }, {
                    "featureType": "building",
                    "elementType": "all",
                    "stylers": {
                        "color": "#1a5787"
                    }
                }, {
                    "featureType": "label",
                    "elementType": "all",
                    "stylers": {
                        "visibility": "off"
                    }
                }]
            }
        };

        var series = [];
        seriesData.forEach(function (item, i) {
            series.push({
                    name: item[0],
                    type: 'lines',
                    coordinateSystem: 'bmap',
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
                    coordinateSystem: 'bmap',
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
                            color: 'gold'
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

        var mapOption = {
            bmap: bmap,
            color: ['gold', 'aqua', 'lime'],
            legend: {
                orient: 'vertical',
                top: 'bottom',
                left: 'right',
                data: optionData,
                selectedMode: 'multiple'
            },
            tooltip: {
                trigger: 'item'
            },
            series: series
        };
        return mapOption;
    }
});
