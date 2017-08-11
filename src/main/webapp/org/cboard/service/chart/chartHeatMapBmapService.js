/**
 * Created by jintian on 2017/8/8.
 */
cBoard.service('chartHeatMapBmapService', function () {
    this.render = function (containerDom, option, scope, persist) {
        if (option == null) {
            containerDom.html("<div class=\"alert alert-danger\" role=\"alert\">No Data!</div>");
            return;
        }
        var height;
        scope ? height = scope.myheight - 20 : null;
        return new CBoardBMapRender(containerDom, option).chart(height, persist);
    };

    this.parseOption = function (data) {
        var max = 0;
        var min = 0;
        var seriesData = [];
        var addressN;
        var addressL;
        for(var j = 0; data.keys[0] && j < data.keys.length; j++){
            if(data.keys[j].length > 1){
                addressN = parseFloat(data.keys[j][0]);
                addressL = parseFloat(data.keys[j][1]);
            }else if(data.keys[j].length = 1){
                addressN = parseFloat(data.keys[j][0].split(",")[0]);
                addressL = parseFloat(data.keys[j][0].split(",")[1]);
            }else{
                addressN = null;
                addressL = null;
            }

            seriesData[j] = [addressN,addressL,parseFloat(data.data[0][j])];
            if (max < parseFloat(data.data[0][j])) {
                max = parseFloat(data.data[0][j]);
            }
            if (min > parseFloat(data.data[0][j])) {
                min = parseFloat(data.data[0][j]);
            }
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
            visualMap: {
                min: min,
                max: max,
                left: 'right',
                top: 'bottom',
                //text: ['High', 'Low'],
                inRange: {
                    color: ['#d94e5d', '#eac736', '#50a3ba'].reverse()
                },
                calculable: true,
                textStyle: {
                    color: '#d94e5d'
                }
            },
            series: [{
                type: 'heatmap',
                coordinateSystem: 'bmap',
                //blurSize:10,
                data: seriesData
            }]
        };

        return mapOption;
    };
});
