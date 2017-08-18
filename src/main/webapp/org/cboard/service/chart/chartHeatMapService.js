/**
 * Created by jintian on 2017/8/3.
 */
cBoard.service('chartHeatMapService', function () {
    this.render = function (containerDom, option, scope, persist) {
        if (option == null) {
            containerDom.html("<div class=\"alert alert-danger\" role=\"alert\">No Data!</div>");
            return;
        }
        var height;
        scope ? height = scope.myheight - 20 : null;
        return new CBoardHeatMapRender(containerDom, option).chart(height, persist);
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
            if(max < parseFloat(data.data[0][j])){
                max = parseFloat(data.data[0][j]);
            }
            if(min > parseFloat(data.data[0][j])){
                min = parseFloat(data.data[0][j]);
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
                        //blurSize:20,
                        data: seriesData
                    }]
                };
            }
        });
        return mapOption;
    };
});
