/**
 * Created by jintian on 2017/8/10.
 */
cBoard.service('chartScatterMapBmapService', function () {
    this.render = function (containerDom, option, scope, persist,drill) {
        return new CBoardBMapRender(containerDom, option).chart(null, persist);
    }

    this.parseOption = function (data) {
        var optionData = [];
        var series =[];
        var serieData = [];
        var max = 0;
        var addressN;
        var addressL;
        var addressName;

        // series setting
        for(var j = 0 ; j < data.series.length ; j++){
            max = 0;
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
                    coordinateSystem: 'bmap',
                    data: serieData,
                    symbolSize: function (val) {
                        return val[2] * 20 / max;
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
            legend: {
                orient: 'vertical',
                top: 'top',
                left: 'left',
                selectedMode: 'single',
                data: optionData
            },
            tooltip: {
                trigger: 'item'
            },
            series: series
        };
        return mapOption;
    };
});
