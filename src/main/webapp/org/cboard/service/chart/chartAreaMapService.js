/**
 * Created by hj on 2017/07/26.
 */
cBoard.service('chartAreaMapService', function () {
    this.render = function (containerDom, option, scope, persist) {
        return new CBoardEChartRender(containerDom, option).chart(null, persist);
    };

    this.parseOption = function (data) {
        var chartConfig = data.chartConfig;
        var casted_keys = data.keys;
        var casted_values = data.series;
        var aggregate_data = data.data;
        var code = 'china';
        if(chartConfig.city && chartConfig.city.code){
            code = chartConfig.city.code;
        }else if(chartConfig.province && chartConfig.province.code){
            code = chartConfig.province.code;
        }
        var url;
        if(code == 'china') {
            url = 'plugins/FineMap/mapdata/china.json'
        }else if(code.length > 2){
            url = 'plugins/FineMap/mapdata/geometryCouties/'+code+'.json';
        }else{
            url = 'plugins/FineMap/mapdata/geometryProvince/'+code+'.json';
        }
        var mapOption = null;
        var groups = _.map(casted_values, function(val){return val.join("-")});
        var series = []
        for(var i=0;i<groups.length;i++){
            var data = [];
            for(var j=0;j<aggregate_data[i].length;j++){
                var e = {"name":casted_keys[j][chartConfig.keys.length-1], "value": aggregate_data[i][j]?aggregate_data[i][j]:0};
                data.push(e);
            }
            var e = {
                name: groups[i],
                type: 'map',
                map: code,
                roam: true,
                tooltip : {
                    trigger: 'item'
                },
                label: {
                    normal: {
                        show: false
                    },
                    emphasis: {
                        show: true
                    }
                },
                itemStyle :{
                    normal: {
                        areaColor: '#EFF0F0',
                        borderColor: '#B5B5B5',
                        borderWidth: 1
                    }
                },
                data:data
            };
            series.push(e);
        }
        var totals = [];
        for(var i=0;i<casted_values.length;i++){
            var total = 0;
            for(var j=0;j<aggregate_data.length;j++){
                total += parseFloat(!isNaN(aggregate_data[j][i]) ? aggregate_data[j][i]:0);
            }
            totals.push(total);
        }
        totals.sort(function(a,b){return a-b;});
        var max = totals[totals.length-1];
        $.ajax({
            type : "get",
            url : url,
            async : false,
            success : function(cityJson){
                echarts.registerMap(code, cityJson);
                mapOption = {
                    legend: {
                        orient: 'vertical',
                        left: 'left',
                        data: groups
                    },
                    visualMap: {
                        min: 0,
                        max: max,
                        left: 'right',
                        top: 'bottom',
                        text: ['High','Low'],
                        inRange: {
                            color: ['#e0ffff', '#006edd']
                        },
                        calculable : true
                    },
                    series: series
                };
            }
        });
        return mapOption;
    };
});
