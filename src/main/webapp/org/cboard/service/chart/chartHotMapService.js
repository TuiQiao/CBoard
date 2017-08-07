/**
 * Created by jintian on 2017/8/3.
 */
cBoard.service('chartHotMapService', function () {
    this.render = function (containerDom, option, scope, persist) {
        if (option == null) {
            containerDom.html("<div class=\"alert alert-danger\" role=\"alert\">No Data!</div>");
            return;
        }
        var height;
        scope ? height = scope.myheight - 20 : null;
        return new CboardHotMapRender(containerDom, option).chart(height, persist);
    };

    this.parseOption = function (data) {
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
        var min = 0;
        var seriesData = [];
        var seriesName = data.series[0][0];
        for(var j = 0; data.keys[0] && j < data.keys.length; j++){
            seriesData[j] = [data.keys[j][0],data.keys[j][1],data.data[0][j]];
            if(max < parseInt(data.data[0][j])){
                max = parseInt(data.data[0][j]);
            }
            if(min > parseInt(data.data[0][j])){
                min = parseInt(data.data[0][j]);
            }
        }
        var mapOption;
        $.ajax({
            type: "get",
            url: url,
            async: false,
            //type:'json',
            success: function (cityJson) {
                echarts.registerMap(code, cityJson);
                mapOption = {
                    visualMap: {
                        min: min,
                        max: max,
                        left: 'left',
                        top: 'bottom',
                        text: ['High','Low'],
                        inRange: {
                            color: ['#d94e5d','#eac736','#50a3ba'].reverse()
                        },
                        calculable : true,
                        textStyle: {
                            color: '#d94e5d'
                        }
                    },
                    geo: {
                        map: code,
                        label: {
                            emphasis: {
                                show: false
                            }
                        },
                        roam: true,
                        itemStyle: {
                            normal: {
                                areaColor: '#EFF0F0',
                                borderColor: '#B5B5B5',
                                borderWidth: 1
                            }
                        }
                    },
                    series:[{
                        type: 'heatmap',
                        mapType:code,
                        coordinateSystem: 'geo',
                        blurSize:10,
                        data: seriesData
                    }]
                };
            }
        });
        return mapOption;
    };
});
