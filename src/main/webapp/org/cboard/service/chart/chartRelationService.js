/**
 * Created by hjtoday on 2017/08/17.
 */
'use strict';
cBoard.service('chartRelationService', function () {

    this.render = function (containerDom, option, scope, persist) {
        return new CBoardEChartRender(containerDom, option).chart(null, persist);
    };

    this.parseOption = function (data) {
        var chartConfig = data.chartConfig;
        var casted_keys = data.keys;
        var casted_values = data.series;
        var aggregate_data = data.data;
        var newValuesConfig = data.seriesConfig;
        var tunningOpt = chartConfig.option;
        var names = [];
        var optionNodes = [];
        var optionLinks = [];
        var nodeProportion = parseFloat(tunningOpt.nodeProportion);
        if(isNaN(nodeProportion) || nodeProportion <= 0){
            nodeProportion = 1;
        }
        _.each(casted_keys, function(e){
            if($.inArray(e[0], names) == -1){
                var node = {};
                node.name = e[0];
                if(e[1]) {
                    node.value = e[1];
                    node.symbolSize = e[1] * nodeProportion;
                }
                optionNodes.push(node);
                names.push(e[0]);
            }
        });
        _.each(casted_values, function(e){
            if($.inArray(e[0], names) == -1){
                var node = {};
                node.name = e[0];
                if(e[1]){
                    node.value = e[1];
                    node.symbolSize = e[1]*nodeProportion;
                }
                optionNodes.push(node);
                names.push(e[0]);
            }
        });
        for(var i=0;i<casted_values.length;i++){
            for(var j=0;j<casted_keys.length;j++){
                if(!_.isUndefined(aggregate_data[i][j])){
                     var link = {};
                     link.source = casted_values[i][0];
                     link.target = casted_keys[j][0];
                     link.weight = aggregate_data[i][j];
                     optionLinks.push(link);
                }
            }
        }
        var option = {
            tooltip : {
                trigger: 'item',
                formatter: function(params){
                    var data = params.data;
                    var res;
                    if(data.source != null && data.target!=null){
                        res = "<br/>LINK："+data.source+"->"+data.target;
                        res += "<br/>VALUE："+data.weight;
                    }else{
                        res = "<br/>NODE:"+data.name;
                        if(data.value){
                            res += "<br/>VALUE:"+data.value;
                        }
                    }
                    return res;
                }
            },
            toolbox: {
                show : true,
                feature : {
                    restore : {show: true},
                    magicType: {show: true, type: ['force', 'chord']},
                    saveAsImage : {show: false}
                }
            },
            series : [
                {
                    type: 'graph',
                    layout: 'force',
                    name: "关系",
                    symbol:'circle',
                    symbolSize:15,
                    edgeSymbol : [ 'none', 'arrow' ],
                    edgeSymbolSize : 10,
                    force: {
                        initLayout: 'circular',
                        edgeLength: 80,  // 长度
                        repulsion: 100, // 排斥
                        gravity: 0.03, // 收缩
                        steps: 10
                    },
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                position: 'right',
                                textStyle: {
                                    //color: '#333'
                                },
                                formatter: function(params){
                                    var data = params.data;
                                    var name = data.name;
                                    if(name && name.length>10){
                                        name = name.substring(0,10)+"...";
                                    }
                                    return name;
                                }
                            },
                            nodeStyle : {
                                brushType : 'both',
                                borderColor : 'rgba(255,215,0,0.4)',
                                borderWidth : 1
                            }
                        }
                    },
                    lineStyle : {
                        normal : {
                            //color : 'rgba(255,0,255,0.4)',
                            width : '1',
                            type : 'solid', //'solid'（实线）'dashed'（虚线）'dotted'（点线）
                            curveness : 0.2, //线条的曲线程度，从0到1
                            opacity : 1,  // 图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。默认0.5
                        }
                    },
                    data: optionNodes, //[{category:'预警客户', name: '*剑荣', value : 0},{category:'普通客户', name: '*静礼', value : 0}],
                    links: optionLinks //[{source : '*剑荣', target : '*静礼', weight : 0, name: '客户担保关系'}]
                }
            ]
        };
        return option;
    };
});