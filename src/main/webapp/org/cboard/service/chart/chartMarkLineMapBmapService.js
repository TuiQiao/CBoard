/**
 * Created by jintian on 2017/8/7.
 */
cBoard.service('chartMarkLineMapBmapService', function () {
    this.render = function (containerDom, option, scope, persist) {
        return new CBoardBMapRender(containerDom, option).chart(null, persist);
    };

    this.parseOption = function (data) {
        var data_keys = data.keys;
        var data_series = data.series;
        var seriesData = [];
        var optionData = [];
        var fromName;
        var fromN;
        var fromL;
        var toName;
        var toN;
        var toL;
        var effectScatterValue;
        var max = null;

        for(var j = 0; data_series[0] && j < data_series.length; j++){
            //重置为null，防止脏数据
            fromName = null;
            fromN = null;
            fromL = null;
            if(data_series[j].length > 3){
                fromName = data_series[j][2];
                fromN = parseFloat(data_series[j][0]);
                fromL = parseFloat(data_series[j][1]);
            }else if(data_series[j].length == 3){
                fromName = data_series[j][1];
                fromN = parseFloat(data_series[j][0].split(",")[0]);
                fromL = parseFloat(data_series[j][0].split(",")[1]);
            }
            optionData.push(fromName);
            var lineData = [];
            var effectScatterData = [];
            for(var i = 0; data_keys[0] && i < data_keys.length; i++){
                toName = null;
                toN = null;
                toL = null;
                effectScatterValue = null;
                if(data_keys[i].length > 2){
                    toName = data_keys[i][2];
                    toN = parseFloat(data_keys[i][0]);
                    toL = parseFloat(data_keys[i][1]);
                }else if(data_keys[i].length == 2){
                    toName = data_keys[i][1];
                    toN = parseFloat(data_keys[j][0].split(",")[0]);
                    toL = parseFloat(data_keys[j][0].split(",")[1]);
                };
                if(data.data[j][i]){
                    lineData.push({fromName: fromName,
                        toName: toName,
                        coords: [[fromN,fromL],
                            [toN, toL]]
                    });

                    effectScatterData.push({name:toName,value:[toN, toL,parseFloat(data.data[j][i])]});

                    if(max == null || max < parseFloat(data.data[j][i])){
                        max = parseFloat(data.data[j][i]);
                    }
                }
            }
            seriesData.push(
                {
                    name:fromName,
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
                    data: lineData
                },{
                    name: fromName,
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
                    //使用动态大小圈有bug
                    symbolSize: function (val) {
                        if (max == 0) {
                            return 0;
                        }
                        return val[2] * 20 / max;
                    },
                    //symbolSize:10,
                    showEffectOn: 'render',
                    itemStyle: {
                        normal: {
                            color: function(val){
                                return ['#d94e5d','#eac736','#50a3ba'].reverse();
                            }
                        }
                    },
                    data: effectScatterData
                }
            )
        }



        var startPoint = {
            x: 104.114129,
            y: 37.550339
        };
        // 地图自定义样式
        var bmap = {
            center: [startPoint.x, startPoint.y],
           // zoom: 5,
            roam: true,
            mapStyle: {
                styleJson: [{
                    'featureType': 'water',
                    'elementType': 'all',
                    'stylers': {
                        'color': '#d1d1d1'
                    }
                }, {
                    'featureType': 'land',
                    'elementType': 'all',
                    'stylers': {
                        'color': '#f3f3f3'
                    }
                }, {
                    'featureType': 'railway',
                    'elementType': 'all',
                    'stylers': {
                        'visibility': 'off'
                    }
                }, {
                    'featureType': 'highway',
                    'elementType': 'all',
                    'stylers': {
                        'color': '#fdfdfd'
                    }
                }, {
                    'featureType': 'highway',
                    'elementType': 'labels',
                    'stylers': {
                        'visibility': 'off'
                    }
                }, {
                    'featureType': 'arterial',
                    'elementType': 'geometry',
                    'stylers': {
                        'color': '#fefefe'
                    }
                }, {
                    'featureType': 'arterial',
                    'elementType': 'geometry.fill',
                    'stylers': {
                        'color': '#fefefe'
                    }
                }, {
                    'featureType': 'poi',
                    'elementType': 'all',
                    'stylers': {
                        'visibility': 'off'
                    }
                }, {
                    'featureType': 'green',
                    'elementType': 'all',
                    'stylers': {
                        'visibility': 'off'
                    }
                }, {
                    'featureType': 'subway',
                    'elementType': 'all',
                    'stylers': {
                        'visibility': 'off'
                    }
                }, {
                    'featureType': 'manmade',
                    'elementType': 'all',
                    'stylers': {
                        'color': '#d1d1d1'
                    }
                }, {
                    'featureType': 'local',
                    'elementType': 'all',
                    'stylers': {
                        'color': '#d1d1d1'
                    }
                }, {
                    'featureType': 'arterial',
                    'elementType': 'labels',
                    'stylers': {
                        'visibility': 'off'
                    }
                }, {
                    'featureType': 'boundary',
                    'elementType': 'all',
                    'stylers': {
                        'color': '#fefefe'
                    }
                }, {
                    'featureType': 'building',
                    'elementType': 'all',
                    'stylers': {
                        'color': '#d1d1d1'
                    }
                }, {
                    'featureType': 'label',
                    'elementType': 'all',
                    'stylers': {
                        'visibility': 'off'
                    }
                }]
            }
        };


        var mapOption = {
            bmap: bmap,
            color: ['gold', 'aqua', 'lime'],
            legend: {
                orient: 'vertical',
                top: 'bottom',
                left: 'right',
                //text: ['High', 'Low'],
                data: optionData,
                selectedMode: 'multiple'
            },
            tooltip: {
                trigger: 'item'
            },
            series: seriesData
        };
        return mapOption;
    }
});
