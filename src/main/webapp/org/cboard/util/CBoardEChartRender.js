/**
 * Created by zyong on 2016/7/25.
 */
var CBoardEChartRender = function (jqContainer, options, isDeepSpec) {
    this.container = jqContainer; // jquery object
    this.ecc = echarts.init(jqContainer.get(0), this.theme);
    this.isDeppSpec = isDeepSpec;
    this.basicOption = {
        title: {},
        grid: {
            left: '50',
            right: '20',
            bottom: '15%',
            top: '20%',
            containLabel: false
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            x: 'left',
            itemWidth: 15,
            itemHeight: 10
        }
    };
    this.options = options;
};

CBoardEChartRender.prototype.theme = "theme-fin1"; // 主题

CBoardEChartRender.prototype.chart = function (group, persist) {
    var self = this;
    var options = this.isDeppSpec == true ? self.options : $.extend(true, {}, self.basicOption, self.options);
    if(persist){
        options.animation = false;
    }
    self.ecc.setOption(options);
    self.changeSize(self.ecc);
    self.container.resize(function (e) {
        self.ecc.resize();
        self.changeSize(self.ecc);
    }); // 图表大小自适应
    if (group) {
        self.ecc.group = group;
        echarts.connect(group);
    }
    if (persist) {
        setTimeout(function () {
            self.container.css('background', '#fff');
            html2canvas(self.container[0], {
                onrendered: function (canvas) {
                    persist.data = canvas.toDataURL("image/jpeg");
                    persist.type = "jpg"
                }
            });
        }, 1000);
    }
    return function (o) {
        o = $.extend(true, {}, self.basicOption, o)
        self.ecc.setOption(o, true);
    }
};

CBoardEChartRender.prototype.changeSize = function (instance) {
    var o = instance.getOption();
    var seriesType = o.series[0] ? o.series[0].type : null;
    if (seriesType == 'pie') {
        var l = o.series.length;
        var b = instance.getWidth() / (l + 1 + l * 8)
        for (var i = 0; i < l; i++) {
            if ((b * 8) < (instance.getHeight() * 0.75)) {
                o.series[i].radius = [0, b * 4];
            } else {
                o.series[i].radius = [0, '75%'];
            }
        }
        instance.setOption(o);
    }

};

CBoardEChartRender.prototype.addClick = function (chartConfig, relation) {
    if(!chartConfig || !relation){
        return;
    }
    var self = this;
    self.ecc.on('click', function (param){
        var sourceField = relation.sourceField;
        var targetField = relation.targetField;
        //[{"targetId":relation.targetId, params:[{"targetField":targetField,"value":param.name},{}]}]
        var relations = JSON.parse($("#relations").val());
        relations = _.filter(relations, function (e) {
            return e.targetId != relation.targetId; //删除已存在的
        });

        var groups = _.map(chartConfig.groups, function(group, index){
            return {"index":index, "name":group.col};
        });
        var keys = _.map(chartConfig.keys, function(key, index){
           return {"index":index, "name":key.col};
        });
        //todo values未处理
        var values = _.map(chartConfig.values[0].cols, function(value, index){
            return {"index":index, "name":value.col};
        });

        var paramValues = [];

        switch (chartConfig.chart_type) {
            case 'line':
            case 'scatter':
            case 'pie':
                _.each(sourceField, function (field) {
                    if ($.inArray(field, _.map(groups, function (group) {
                            return group.name
                        })) != -1
                        || $.inArray(field, _.map(keys, function (key) {
                            return key.name
                        })) != -1
                    //|| $.inArray(e, _.map(values,function(value){return value.name})) != -1
                    ) {
                        _.each(groups, function (group) {
                            if (group.name == field) {
                                paramValues.push(param.seriesName.split("-")[group.index]);
                            }
                        });
                        _.each(keys, function (key) {
                            if (key.name == field) {
                                paramValues.push(param.name.split("-")[key.index]);
                            }
                        });
                        //_.each(values, function (value) {
                        //    if(value.name == e){
                        //        if(e == param.seriesName.split("-").pop()){
                        //            paramValues.push(param.value);
                        //        }else{
                        //            paramValues.push("noMatch");
                        //        }
                        //    }
                        //});
                    } else {
                        paramValues.push("noMatch");
                    }
                });
                break;

            case 'funnel':
                _.each(sourceField, function(field){
                    if($.inArray(field, _.map(keys, function(key){return key.name;}))!=-1 ){
                        _.each(keys,function(key){
                            if(key.name == field){
                                paramValues.push(param.seriesName.split("-")[key.index]);
                            }
                        });
                    }else{
                        paramValues.push("no");
                    }
                });
                break;

            case 'sankey':
                if(param.dataType=='edge') {
                    _.each(sourceField, function (field) {
                        if ($.inArray(field, _.map(keys, function (key) {
                                return key.name;
                            })) != -1
                            || $.inArray(field, _.map(groups, function (group) {
                                return group.name;
                            })) != -1) {
                            _.each(keys, function (key) {
                                if (key.name == field) {
                                    paramValues.push(param.data.source.split("-")[key.index]);
                                }
                            });
                            _.each(groups, function (group) {
                                if (group.name == field) {
                                    paramValues.push(param.data.target.split("-")[group.index]);
                                }
                            });
                        } else {
                            paramValues.push("no");
                        }
                    });
                }
                break;

            case 'radar':
                if(chartConfig.asRow){//雷达行维
                    _.each(sourceField, function(field){
                        if($.inArray(field, _.map(keys, function(key){return key.name;}))!=-1){
                            _.each(keys,function(key){
                                if(key.name == field){
                                    paramValues.push(param.name.split("-")[key.index]);
                                }
                            });
                        }else{
                            paramValues.push("no");
                        }
                    });
                }else{
                    _.each(sourceField, function(field){
                        if($.inArray(field, _.map(groups, function(group){return group.name;}))!=-1){
                            _.each(groups,function(group){
                                if(group.name == field){
                                    paramValues.push(param.name.split("-")[group.index]);
                                }
                            });
                        }else{
                            paramValues.push("no");
                        }
                    });
                }
                break;

            case 'wordCloud':
                _.each(sourceField, function(field){
                    if($.inArray(field, _.map(keys, function(key){return key.name;}))!=-1){
                        _.each(keys,function(key){
                            if(key.name == field){
                                paramValues.push(param.name.split("-")[key.index]);
                            }
                        });
                    }else{
                        paramValues.push("no");
                    }
                });
                break;

            case 'treeMap':
                _.each(sourceField, function(field){
                    if($.inArray(field, _.map(keys, function(key){return key.name.toUpperCase();}))!=-1){
                        _.each(keys,function(key){
                            if(key.name.toUpperCase() == field && param.treePathInfo[key.index+1]){
                                paramValues.push(param.treePathInfo[key.index+1].name);
                            }
                        });
                    }else{
                        paramValues.push("no");
                    }
                });
                break;

            default:
                break;
        }

        var record = {};
        record.targetId = relation.targetId;
        record.params = [];
        for(var i=0;i<targetField.length;i++){
            var e = {};
            e.targetField = targetField[i];
            e.value = paramValues[i];
            record.params.push(e);
        }
        record.params = _.filter(record.params, function(e){
            return e.value != "noMatch";
        });
        relations.push(record);

        $("#relations").val(JSON.stringify(relations));
        //触发关联图表刷新
        var button = document.getElementsByName("reload_"+relation.targetId);
        if(button){
            button[button.length-1].click();
        }
    });
};