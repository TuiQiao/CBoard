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
        var seriesName = data.series[0][0];
        for(var j = 0; data.keys[0] && j < data.keys.length; j++){
            seriesData[j] = [parseFloat(data.keys[j][0]),parseFloat(data.keys[j][1]),parseFloat(data.data[0][j])];
            if(max < parseInt(data.data[0][j])){
                max = parseInt(data.data[0][j]);
            }
            if(min > parseInt(data.data[0][j])){
                min = parseInt(data.data[0][j]);
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
        var mapOption = {
            bmap: bmap,
            visualMap: {
                min: min,
                max: max,
                left: 'right',
                top: 'bottom',
                //text: ['High', 'Low'],
                inRange: {
                    color: ['#d94e5d','#eac736','#50a3ba'].reverse()
                },
                calculable : true,
                textStyle: {
                    color: '#d94e5d'
                }
            },
            series:[{
                type: 'heatmap',
                coordinateSystem: 'bmap',
                //blurSize:10,
                data: seriesData
            }]
        }

        return mapOption;
    };
});
