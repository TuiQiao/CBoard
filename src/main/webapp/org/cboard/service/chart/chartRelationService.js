/**
 * Created by huijun on 2017/07/23.
 */
'use strict';
cBoard.service('chartRelationService', function () {

    this.render = function (containerDom, option, scope, persist) {
        return new CBoardEChartRender(containerDom, option).chart(null, persist);
    };

    this.parseOption = function (result) {
        //参数不全 向前补齐
        var chartConfig = result.chartConfig;
        var sources = chartConfig.sources;
        var targets = chartConfig.links;
        var links = chartConfig.links;
        var datas = result.keys;

        switch (sources.length){
            case 1:
                _.each(datas, function (v) {
                    v.splice(1,0,"","");
                });
                break;
            case 2:
                _.each(datas, function (v) {
                    v.splice(2,0,"");
                });
                break;
            default:
                break;
        }
        switch (targets.length){
            case 1:
                _.each(datas, function (v) {
                    v.splice(4,0,"","");
                });
                break;
            case 2:
                _.each(datas, function (v) {
                    v.splice(5,0,"");
                });
                break;
            default:
                break;
        }
        switch (links.length){
            case 1:
                _.each(datas, function (v) {
                    v.splice(7,0,"","");
                });
                break;
            case 2:
                _.each(datas, function (v) {
                    v.splice(8,0,"");
                });
                break;
            default:
                break;
        }
        var names = [];
        var optionNodes = [];
        var optionLinks = [];
        var optionData = []; //关系类型
        var categories = []; //节点类型
        for(var e in datas){
            var data = datas[e];
            if($.inArray(data[0], names)==-1) {
                var snode = {};
                snode.category = data[2];
                snode.name = data[0];
                snode.value = data[1];
                optionNodes.push(snode);
                names.push(data[0]);
            }

            if($.inArray(data[3], names)==-1) {
                var tnode = {};
                tnode.category = data[5];
                tnode.name = data[3];
                tnode.value = data[4];
                optionNodes.push(tnode);
                names.push(data[3]);
            }

            var link = {};
            link.source = data[0];
            link.target = data[3];
            link.weight = data[4];
            link.name = data[6];
            link.lineStyle={};
            link.lineStyle.normal={};
            link.lineStyle.normal.show = true;
            link.lineStyle.normal.type = 'solid';
            link.lineStyle.normal.width = data[7] && data[7]!=0 ? data[7] : 1;
            link.lineStyle.normal.color = data[8] ? data[8]:'black';
            optionLinks.push(link);

            //关系类型
            if($.inArray(data[6], optionData)==-1){
                optionData.push(datas[e][6]);
            }

            //节点类型
            if($.inArray(data[2], categories)==-1){
                categories.push(data[2]);
            }
            if($.inArray(data[5], categories)==-1){
                categories.push(data[5]);
            }
        }
        var categoriesObj = [];
        $.each(categories, function(i, val){
            categoriesObj.push({"name":val});
        });

        var option = {
            title : {
                text: '力导向图',
                subtext: '关系图',
                x:'right',
                y:'bottom'
            },
            tooltip : {
                trigger: 'item',
                formatter: function(params){
                    var data = params.data;
                    var res;
                    if(data.source != null && data.target!=null){
                        res = "关系："+data.name;
                        res += "<br/>方向："+data.source+"->"+data.target;
                    }else{
                        res = "节点";
                        res += "<br/>ID:"+data.name;
                        if(data.label){
                            res += "<br/>名称:"+data.label;
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
                    saveAsImage : {show: true}
                }
            },
            legend: [{
                data: categories, //["预警客户", name:"普通客户"]
                x: 'left',
                y:'top'
            }],
            series : [
                {
                    type: 'graph',
                    layout: 'force',
                    name: "关系",
                    symbol:'circle',
                    symbolSize:15,
                    focusNodeAdjacency: true,
                    edgeSymbol : [ 'none', 'arrow' ],
                    edgeSymbolSize : 10,
                    categories: categoriesObj, //[{name:"预警客户"}, {name:"普通客户"}],
                    force: {
                        initLayout: 'circular',
                        edgeLength: 80,  // 长度
                        repulsion: 100, // 排斥
                        gravity: 0.03, // 收缩
                        steps: 10
                    },
                    //edgeLabel: {
                    //    normal: {
                    //        show: true,
                    //        textStyle: {
                    //            fontSize: 10
                    //        },
                    //        formatter: function(x){return x.data.name;}
                    //    }
                    //},
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                position: 'right',
                                textStyle: {
                                    color: '#333'
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
        console.log(JSON.stringify(option));
        return option;
    };
});