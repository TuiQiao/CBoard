/**
 * Created by sileiH on 2016/8/2.
 */
'use strict';
cBoard.controller('datavCtrl', function ($rootScope, $scope, $stateParams, $http, dataService, updateService, $q, chartPieService,
                                         chartLineService, chartFunnelService, chartSankeyService, chartTableService, chartKpiService,
                                         chartRadarService, chartMapService, chartScatterService, chartGaugeService, chartWordCloudService,
                                         chartTreeMapService, chartAreaMapService, chartHeatMapCalendarService, chartHeatMapTableService,
                                         chartLiquidFillService, chartContrastService, chartChinaMapService, chartChinaMapBmapService,
                                         chartRelationService, $state) {
    $("body").addClass("sidebar-collapse")
    var dataVConf = initDataVConf();
    var dataVChartDataJSON = {};
    //数据视图图表配置
    var dataVChartData = {dataVConfChartCSS: {}};
    var vm = new Vue({
        el: '#app',
        data: {
            viewType: false,
            widgetList: "",
            //视图ID
            viewId: '',
            //基础路径
            basePath: '',
            //组件
            components: hexDataV.component,
            componentsIcon: hexDataV.componentICON,
            activeIndex: '1',
            pageCssItem: '1',
            //画布大小
            dragWidth: '',
            dragHeight: '',
            //数据视图配置
            dataVConf: dataVConf,
            //可视化数据预览
            viewDataCharts: [],
            //画板可视化组件
            dataVComponents: [],
            //边框组件样式
            borderStyle: hexDataV.getBorderStyle(),
            //装饰组件样式
            ornamentStyle:hexDataV.getOrnamentStyle(),
            //字体粗细
            fontWeight: hexDataV.getFontWeight(),
            //文本对齐方式
            textAlign: hexDataV.textAlign(),
            //数据源
            dataSource: hexDataV.dataSource(),
            dataSourceList: [],
            //主要用于给element-ui.js的标签页取名用
            tabActiveName: 'one',
            //预览画布大小
            viewDragWidth: '',
            viewDragHeight: '',
            //未知用处的属性
            dataVChartData: dataVChartData,
            curBoard: {layout: {rows: []}},
            categoryList: []
        },
        methods: {
            //测试使用按钮来获取图表
            drag: function (event) {
                var current = event.$attrs;
                var type = current.type;
                var name = current.name;
                var componentName = current.componentname;
                var widgetId = event.$vnode.key;
                //若组件类型以及组件名称为空
                if (!type || !componentName) {
                    return;
                }
                var componentDom = {type: type, componentName: componentName, widgetId: widgetId, name: name};
                hexDataV.componentDom = componentDom;
                this.drop();
            },
            //监控大屏尺寸大小设置
            screenSizeChange: function () {
                //画布父层大小
                var dragWidth = $('#datav-drag').parent().css('width');
                dragWidth = Number(dragWidth.substr(0, dragWidth.length - 2));
                var dragHeight = $('#datav-drag').parent().css('height');
                dragHeight = Number(dragHeight.substr(0, dragHeight.length - 2));
                //屏幕配置大小
                var screenWidth = vm._data.dataVConf.screenWidth;
                var screenHeight = vm._data.dataVConf.screenHeight;
                //屏幕比例
                var prop = (screenHeight / screenWidth).toFixed(4);
                dragWidth = (dragWidth * 0.9).toFixed();
                dragHeight = (dragWidth * prop).toFixed();
                //绘制画布大小
                dragDataVDrag(dragWidth + 'px', dragHeight + 'px');
            },
            //用于保存视图数据
            saveDataVConf: function () {
                var hexDataVInfo = buildHexDataVInfo();
                saveDataVConf(hexDataVInfo);
            },
            //用于预览视图
            viewDataV: function () {
                vm.saveDataVConf()
                var href = window.location.href;
                var boardId = href.substr(href.lastIndexOf("/") + 1);
                var winInfo = "toolbar=no,menubar=no,status=yes,scrollbars=no,resizable=no,titlebar=no,location=no,width=" + (window.screen.availWidth - 10) + ",height=" + (window.screen.availHeight - 30) + ",top=0,left=0,fullscreen=no";
                window.open('render.html#?id=' + boardId, '', winInfo)
            },
            //设置数据视图可移动
            allowDrop: function (event) {
                event.preventDefault();
            },
            //移动数据视图
            drop: function (event) {
                var dom = hexDataV.componentDom;
                if (!dom) {
                    return;
                }
                //新增组件
                var domId = dom.type + '_' + dom.widgetId;
                var dataVChartData = initDataVChartData();
                dataVChartData.chartType = dom.type;
                dataVChartData.widgetId = dom.widgetId;
                dataVChartData.domId = domId;
                dataVChartData.name = dom.name;
                if (dom.type == 'label') {
                    //标题组件默认值
                    dataVChartData.dataVConfChartCSS.chartTitle = hexDataV.defaultTitle;
                } else if (dom.type == 'kpi') {
                    //指标卡默认值
                    dataVChartData.jsonData = hexDataV.defaultKpiData();
                    dataVChartData.dataVConfChartCSS = hexDataV.defaultKpiStyle();
                } else if (dom.type == 'border') {
                    //边框默认样式
                    dataVChartData.chartStyle = vm._data.borderStyle[0].value;
                } else if (dom.type == 'ornament'){
                    //装饰默认样式
                    dataVChartData.chartStyle = vm._data.ornamentStyle[0].value;
                } else if (dom.type == 'table') {
                    //表格组件默认值
                    dataVChartData.jsonData = hexDataV.defaultTableData();
                    dataVChartData.dataVConfChartCSS = hexDataV.defaultTableStyle();
                } else if (dom.type == 'clock') {
                    //时钟组件默认格式化
                    dataVChartData.dataVConfChartCSS = hexDataV.defaultClockStyle();
                }
                if(!jQuery.isEmptyObject(hexDataV.componentDom.dataVConfChartCSS)){
                    dataVChartData.dataVConfChartCSS = hexDataV.componentDom.dataVConfChartCSS;
                }
                if(!jQuery.isEmptyObject(hexDataV.componentDom.chartStyle)){
                    dataVChartData.chartStyle = hexDataV.componentDom.chartStyle;
                }
                var xprop = xMultiple(vm._data.dataVConf.screenWidth);
                var yprop = yMultiple(vm._data.dataVConf.screenHeight);
                dataVChartData.xprop = xprop;
                dataVChartData.yprop = yprop;

                if (dom.chartHeight) {
                    dataVChartData.chartWidth = dom.chartWidth;
                    dataVChartData.chartHeight = dom.chartHeight;
                    dataVChartData.positionX = dom.positionX;
                    dataVChartData.positionY = dom.positionY;
                } else {
                    dataVChartData.chartWidth = (207 / xprop).toFixed();
                    dataVChartData.chartHeight = (105 / yprop).toFixed();
                }

                if (dom.bgColor) {
                    dataVChartData.bgColor = dom.bgColor;
                } else {
                    dataVChartData.bgColor = hexDataV.defaultBgColor;
                }
                vm._data.dataVChartData = dataVChartData;
                dataVChartDataJSON[domId] = dataVChartData;
                var dataVComponent = {
                    domId: domId,
                    componentName: dom.componentName,
                    componentType: dom.type,
                    chartData: dataVChartData,
                    widgetId: dom.widgetId
                };

                if (!vm._data.viewType) {
                    var array = vm._data.dataVComponents;
                    array.push(dataVComponent);
                    vm._data.dataVComponents = array;
                    //初始化组件可拖拽、伸缩
                    initDrag(domId);
                } else {
                    var array = vm._data.viewDataCharts;
                    array.push(dataVComponent);
                    vm._data.viewDataCharts = array;
                }
            },
            //点击数据视图
            dataVBlockClick: function (e) {
                //若定位在全局样式,切换到图表样式;
                vm._data.pageCssItem = '2';
                var domId = e;
                var select = '#' + domId;
                $(select).addClass('datav-block-select');
                $(select + ' div.datav-view-close').show();
                $(select).siblings('.datav-block').removeClass('datav-block-select');
                $(select).siblings('.datav-block').children('.datav-view-close').hide();
                //绑定数据可视化图层基本信息
                bindDataVChartData(domId);
            },
            //关闭数据视图
            closeDataVWin: function (e) {
                var domId = e;
                $('#' + domId).remove();
                dataVChartDataJSON[domId] = '';
            },
            //下载上传
            dropUpload: function (event) {
                event.preventDefault();
                var fileList = event.dataTransfer.files; //获取文件对象
                var xhr = new XMLHttpRequest();
                var url = 'dashboard/uploadImage.do';
                xhr.open('post', url, true);
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                xhr.onreadystatechange = function(){
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        vm._data.dataVConf.background = xhr.responseText;
                    }
                };
                var formData = new FormData();
                formData.append('file', fileList[0]);
                xhr.send(formData);
            },
            //加载监控视图配置
            loadDataVConf: function () {
                var boardId = $stateParams.boardId;
                if (boardId === undefined) {
                    var href = window.location.href;
                    boardId = href.substr(href.lastIndexOf("?id=") + 4);
                    vm._data.viewType = true;
                }
                if (boardId) {
                    $http.get("dashboard/getBoardData.do", {params: {id: boardId}}).then(function (res) {
                        if (!res.data.layout.dataVConf) {
                            return;
                        }
                        vm._data.dataVConf = res.data.layout.dataVConf;
                        vm.screenSizeChange();
                        vm._data.viewDragWidth = res.data.layout.dataVConf.screenWidth + "px";
                        vm._data.viewDragHeight = res.data.layout.dataVConf.screenHeight + "px";
                        var layout = res.data.layout;
                        for (var i = 0; i < layout.rows.length; i++) {
                            if (layout.rows[i].type == 'widget') {
                                var widgets = layout.rows[i].widgets;
                                for (var j = 0; j < widgets.length; j++) {
                                    var componentDom = {
                                        type: "chart",
                                        componentName: "hex-datav-chart",
                                        widgetId: widgets[j].widgetId,
                                        chartWidth: widgets[j].chartWidth,
                                        chartHeight: widgets[j].chartHeight,
                                        bgColor: widgets[j].bgColor,
                                        positionX: widgets[j].positionX,
                                        positionY: widgets[j].positionY
                                    };
                                    hexDataV.componentDom = componentDom;
                                    vm.drop();
                                }
                            } else {
                                var others = layout.rows[i].others;
                                for (var j = 0; j < others.length; j++) {
                                    var componentDom = {
                                        type: others[j].type,
                                        componentName: "hex-datav-" + others[j].type,
                                        chartWidth: others[j].chartWidth,
                                        chartHeight: others[j].chartHeight,
                                        positionX: others[j].positionX,
                                        positionY: others[j].positionY,
                                        chartStyle: others[j].chartStyle,
                                        dataVConfChartCSS: others[j].dataVConfChartCSS
                                    };
                                    hexDataV.componentDom = componentDom;
                                    vm.drop();
                                }
                            }
                        }
                    })
                }
            }
        }
    })
    //初始化视图大小
    vm.screenSizeChange();

    //加载监控视图配置
    vm.loadDataVConf();

    //加载图表列表
    getWidgetList();

    //加载分类列表
    getCategoryList();

    //保存视图监控配置
    function saveDataVConf(hexDataVInfo) {

        if (!hexDataVInfo.dataVConf.viewName) {
            vm.$alert("监控主题名字不能为空", "警告");
            return;
        }

        //数据封装
        var json = {
            name: hexDataVInfo.dataVConf.viewName,
            layout: {rows: [], type: "datav"},
            categoryId: hexDataVInfo.dataVConf.categoryId,
            id: $stateParams.boardId ? $stateParams.boardId : ""
        };
        json.layout.dataVConf = hexDataVInfo.dataVConf;
        json.layout.rows.push({
            type: "widget",
            widgets: []
        })
        json.layout.rows.push({
            type: "other",
            others: []
        })
        for (var i = 0; i < hexDataVInfo.dataVConfChartDataList.length; i++) {
            if (hexDataVInfo.dataVConfChartDataList[i].chartType == 'chart') {
                json.layout.rows[0].widgets.push({
                    widgetId: hexDataVInfo.dataVConfChartDataList[i].widgetId,
                    name: hexDataVInfo.dataVConfChartDataList[i].name,
                    chartHeight: hexDataVInfo.dataVConfChartDataList[i].chartHeight,
                    chartWidth: hexDataVInfo.dataVConfChartDataList[i].chartWidth,
                    bgColor: hexDataVInfo.dataVConfChartDataList[i].bgColor,
                    positionX: hexDataVInfo.dataVConfChartDataList[i].positionX,
                    positionY: hexDataVInfo.dataVConfChartDataList[i].positionY
                })
            } else {
                json.layout.rows[1].others.push({
                    type: hexDataVInfo.dataVConfChartDataList[i].chartType,
                    chartWidth: hexDataVInfo.dataVConfChartDataList[i].chartWidth,
                    chartHeight: hexDataVInfo.dataVConfChartDataList[i].chartHeight,
                    positionX: hexDataVInfo.dataVConfChartDataList[i].positionX,
                    positionY: hexDataVInfo.dataVConfChartDataList[i].positionY,
                    chartStyle: hexDataVInfo.dataVConfChartDataList[i].chartStyle,
                    dataVConfChartCSS: hexDataVInfo.dataVConfChartDataList[i].dataVConfChartCSS,
                })
            }

        }
        //数据封装结束
        if ($stateParams.boardId) {
            $http.post("dashboard/updateBoard.do", {json: angular.toJson(json)}).then(function (res) {
                if (res.status == "200") {
                    closeMessage("提示", "更新成功", function () {
                        dataVChartDataJSON = {};
                        $state.go("config.board")
                    })
                } else {
                    if (res.data.message) {
                        closeMessage('错误', res.data.message);
                    } else {
                        closeMessage('错误', '更新失败');
                    }
                }
            });
        } else {
            $http.post("dashboard/saveNewBoard.do", {json: angular.toJson(json)}).then(function (res) {
                if (res.status == "200") {
                    closeMessage("提示", "保存成功", function () {
                        dataVChartDataJSON = {};1
                        $state.go("config.board")
                    })
                } else {
                    if (res.data.message) {
                        closeMessage('错误', res.data.message);
                    } else {
                        closeMessage('错误', '保存失败');
                    }
                }
            });
        }
    }

//提示信息
    function closeMessage(title, message, callFunc) {
        vm.$alert(message, title, {
            confirmButtonText: '关闭',
            callback: function (action) {
                if (callFunc) {
                    callFunc(action);
                }
            }
        });
    }

//构建监控视图配置数据
    function buildHexDataVInfo() {
        var hexDataVInfo = {};
        var dataVChartData = vm._data.dataVChartData;
        if (document.getElementById(dataVChartData.domId)) {
            dataVChartDataJSON[dataVChartData.domId] = dataVChartData;
        }
        hexDataVInfo.dataVConf = vm._data.dataVConf;
        var keys = _.keys(dataVChartDataJSON);
        var dataVConfChartDataList = new Array();
        for (var i = 0; i < keys.length; i++) {
            var dataVConfChartData = dataVChartDataJSON[keys[i]];
            if (!dataVConfChartData) {
                continue;
            }
            dataVConfChartDataList.push(dataVChartDataJSON[keys[i]]);
        }
        hexDataVInfo.dataVConfChartDataList = angular.copy(dataVConfChartDataList);
        return hexDataVInfo;
    }

//绑定数据可视化图层基本信息
    function bindDataVChartData(domId) {
        if (!document.getElementById(domId)) {
            dataVChartDataJSON[domId] = '';
            return;
        }
        //数据视图图表配置
        var dataVChartData = dataVChartDataJSON[domId];
        //画板上的图表等比缩放后的宽度、高度
        var chartWidth = $('#' + domId).css('width');
        var chartHeight = $('#' + domId).css('height');
        chartWidth = chartWidth.substr(0, chartWidth.length - 2);
        chartHeight = chartHeight.substr(0, chartHeight.length - 2);
        //画布大小缩放比例
        var xprop = xMultiple(vm._data.dataVConf.screenWidth);
        var yprop = yMultiple(vm._data.dataVConf.screenHeight);
        chartWidth = (chartWidth / xprop).toFixed();
        chartHeight = (chartHeight / yprop).toFixed();
        dataVChartData.chartWidth = chartWidth;
        dataVChartData.chartHeight = chartHeight;
        var positionX = $('#' + domId).attr('x') ? $('#' + domId).attr('x') : 0;
        var positionY = $('#' + domId).attr('y') ? $('#' + domId).attr('y') : 0;
        positionX = (positionX / xprop).toFixed();
        positionY = (positionY / yprop).toFixed();
        dataVChartData.positionX = positionX;
        dataVChartData.positionY = positionY;
        vm._data.dataVChartData = dataVChartData;
        //数据视图图表配置放到全局变量
        dataVChartDataJSON[domId] = dataVChartData;
    }

//初始化拖拽
    function initDrag(domId) {
        interact('#' + domId)
            .draggable({
                onmove: dragMoveListener,
                restrict: {
                    restriction: 'parent',
                    elementRect: {top: 0, left: 0, bottom: 1, right: 1}
                },
            })
            .resizable({
                edges: {left: true, right: true, bottom: true, top: true},
                restrictEdges: {outer: 'parent', endOnly: true},
                restrictSize: {
                    min: {width: 0, height: 0}
                },
                inertia: true,
            })
            .on('resizemove', function (event) {
                var target = event.target,
                    x = (parseFloat(target.getAttribute('data-x')) || 0),
                    y = (parseFloat(target.getAttribute('data-y')) || 0);

                target.style.width = event.rect.width + 'px';
                target.style.height = event.rect.height + 'px';
                x += event.deltaRect.left;
                y += event.deltaRect.top;
                target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px,' + y + 'px)';
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
                var domId = target.getAttribute('id');
                domPosition(domId);
            });

        function dragMoveListener(event) {
            var target = event.target,
                x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            target.style.webkitTransform =
                target.style.transform =
                    'translate(' + x + 'px, ' + y + 'px)';

            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
            var domId = target.getAttribute('id');
            domPosition(domId);
        }
    }

//设置图形拖拽
    function domPosition(domId) {
        var domOffset = $('#' + domId).offset();
        var dragOffset = $('#datav-drag').offset();
        var x = domOffset.left - dragOffset.left;
        var y = domOffset.top - dragOffset.top;
        document.getElementById(domId).setAttribute('x', x);
        document.getElementById(domId).setAttribute('y', y);
    }

//宽倍数
    function xMultiple(screenWidth) {
        var dragWidth = vm._data.dragWidth;
        dragWidth = dragWidth.substr(0, dragWidth.length - 2);
        return (Number(dragWidth) / screenWidth).toFixed(4);
    }

//高倍数
    function yMultiple(screenHeight) {
        var dragHeight = vm._data.dragHeight;
        dragHeight = dragHeight.substr(0, dragHeight.length - 2);
        return (Number(dragHeight) / screenHeight).toFixed(4);
    }

//初始化数据视图配置
    function initDataVConf() {
        return {
            screenWidth: screen.width,
            screenHeight: screen.height,
            viewName: '',
            fontColor: '#FFFFFF',
            background: 'canvas.png',
            categoryId: ''
        };
    }

    /**
     * 初始化数据视图图表配置
     *
     * @returns {}
     */
    function initDataVChartData() {
        return {
            //图表基础信息
            chartType: '', domId: '', chartWidth: '', chartHeight: '', positionX: 0, positionY: 0,
            chartStyle: '', bgColor: '',
            //图表数据配置
            xField: '', yField: '', gField: '',
            dataSource: '01', url: '', jsonData: '',
            //图表样式
            dataVConfChartCSS: {}
        };
    }

//初始化数据视图图表样式配置
    function initDataVChartCSS() {
        return {
            labelFontSize: '',
            labelFontWeight: '',
            labelColor: '#FFFFFF',
            labelBgColor: '',
            labelPadding: '',
            labelFormat: '',
            labelAlign: '',
            textFontSize: '',
            textFontWeight: '',
            textColor: '#FFFFFF',
            textBgColor: '',
            textPadding: '',
            textFormat: '',
            textAlign: '',
            rowBorderWidth: '',
            rowBorderColor: '',
            oddRowBgColor: '',
            evenRowBgColor: '',
            colBorderWidth: '',
            colBorderColor: '',
            headFontSize: '',
            headColor: '#FFFFFF',
            headFontWeight: '',
            headBgColor: ''
        };
    }

//绘制画布大小
    function dragDataVDrag(width, height) {
        vm._data.dragWidth = width;
        vm._data.dragHeight = height;
    }

    var getDimensionConfig = function (array) {
        var result = [];
        if (array) {
            _.each(array, function (e) {
                if (_.isUndefined(e.group)) {
                    result.push({columnName: e.col, filterType: e.type, values: e.values, id: e.id});
                } else {
                    _.each(e.filters, function (f) {
                        result.push({columnName: f.col, filterType: f.type, values: f.values});
                    });
                }
            });
        }
        return result;
    };

    var getDataSeries = function (chartConfig) {
        var result = [];
        _.each(chartConfig.values, function (v) {
            _.each(v.cols, function (c) {
                var series = configToDataSeries(c);
                _.each(series, function (s) {
                    if (!_.find(result, function (e) {
                            return JSON.stringify(e) == JSON.stringify(s);
                        })) {
                        result.push(s);
                    }
                });
            });
        });
        return result;
    };

    var configToDataSeries = function (config) {
        switch (config.type) {
            case 'exp':
                return getExpSeries(config.exp);
                break;
            default:
                return [{
                    name: config.col,
                    aggregate: config.aggregate_type
                }];
                break;
        }
    };

    var getExpSeries = function (exp) {
        return parserExp(exp).aggs;
    };

    function parserExp(rawExp) {
        var evalExp = rawExp;
        var _temp = [];
        var aggs = [];
        evalExp = evalExp.trim().replace(/[\n|\r|\r\n]/g, '');

        _.each(evalExp.match(/".*?"/g), function (qutaText) {
            evalExp = evalExp.replace(qutaText, '_#' + _temp.length);
            _temp.push(qutaText);
        });

        var names = []; // expression text in aggreagtion function, could be a columnName or script
        _.each(evalExp.match(/(sum|avg|count|max|min|distinct)\("?.*?"?\)/g), function (aggUnit) {
            var aggregate = aggUnit.substring(0, aggUnit.indexOf('('));
            var name = aggUnit.substring(aggUnit.indexOf('(') + 1, aggUnit.indexOf(')'));
            if (name.match("_#")) {
                name = _temp[name.replace("_#", "")].replace(/\"/g, "");
            }
            evalExp = evalExp.replace(aggUnit, "groupData[_names[" + names.length + "]]['" + aggregate + "'][key]");
            names.push(name);
            aggs.push({
                name: name,
                aggregate: aggregate
            });
        });
        return {evalExp: evalExp, aggs: aggs, names: names};
    }

    function getWidgetList() {
        $http.get("dashboard/getWidgetList.do").success(function (response) {
            var map = {};
            for (var i = 0; i < response.length; i++) {
                map[response[i].categoryName] = [];
            }
            for (var i = 0; i < response.length; i++) {
                map[response[i].categoryName].push({
                    name: response[i].name,
                    id: response[i].id
                })
            }
            vm._data.widgetList = map;
        })
    }

    Vue.component('hex-datav-chart', {
        props: {
            chartdata: Object
        },
        template: '<div class="datav-line" v-bind:style=" {background:chartdata.bgColor} "><div :id="chartdata.domId + \'_01\'" style="width: 100%;height: 100%;"></div></div>',
        methods: {
            init: function () {
                var domId = this.chartdata.domId;
                var widget = this.chartdata.widgetId;
                $http.get("dashboard/dashboardWidget.do", {
                    params: {
                        "id": widget
                    }
                }).success(function (res) {
                    //获取数据
                    var chartConfig = res.data.config;
                    var datasetId = res.data.datasetId;
                    getDatavSeries(datasetId, chartConfig, domId);
                })
            }
        },
        mounted: function () {
            //渲染柱状图表
            this.init();
        }
    })

    function getDatavSeries(datasetId, chartConfig, domId) {
        var chartConfig = angular.copy(chartConfig);
        updateService.updateConfig(chartConfig);
        dataService.linkDataset(datasetId, chartConfig).then(function () {
            var dataSeries = getDataSeries(chartConfig);
            var cfg = {rows: [], columns: [], filters: []};
            cfg.rows = getDimensionConfig(chartConfig.keys);
            cfg.columns = getDimensionConfig(chartConfig.groups);
            cfg.filters = getDimensionConfig(chartConfig.filters);
            cfg.filters = cfg.filters.concat(getDimensionConfig(chartConfig.boardFilters));
            cfg.filters = cfg.filters.concat(getDimensionConfig(chartConfig.boardWidgetFilters));
            cfg.values = _.map(dataSeries, function (s) {
                return {column: s.name, aggType: s.aggregate};
            });
            $http.post("dashboard/getAggregateData.do", {
                datasetId: datasetId,
                cfg: JSON.stringify(cfg),
                reload: false
            }).success(function (data) {
                var result = castRawData2Series(data, chartConfig);
                result.chartConfig = chartConfig;
                if (!_.isUndefined(datasetId)) {
                    getDrillConfig(datasetId, chartConfig).then(function (c) {
                        result.drill = {config: c};
                        //数据封装
                        var chart = getChartServices(chartConfig);
                        var option = chart.parseOption(result);
                        //图表展示
                        if(chartConfig.chart_type == 'table'){
                            var render = new CBoardTableRender($('#' + domId + "_01"), option);
                            return render.do();
                        }else{
                            var render = new CBoardEChartRender($('#' + domId + "_01"), option);
                            return render.chart(null);
                        }
                    });
                } else {
                    //callback(result);
                    //数据封装
                    var chart = getChartServices(chartConfig);
                    var option = chart.parseOption(result);
                    //图表展示
                    var render = new CBoardEChartRender($('#' + domId + "_01"), option);
                    return render.chart(null);
                }
            });
        })
    }

    var castRawData2Series = function (aggData, chartConfig) {
        var castedKeys = new Array();
        var castedGroups = new Array();
        var joinedKeys = {};
        var joinedGroups = {};
        var newData = {};

        var getIndex = function (columnList, col) {
            var result = new Array();
            if (col) {
                for (var j = 0; j < col.length; j++) {
                    var idx = _.find(columnList, function (e) {
                        return e.name == col[j];
                    });
                    result.push(idx.index);
                }
            }
            return result;
        };

        var keysIdx = getIndex(aggData.columnList, _.map(chartConfig.keys, function (e) {
            return e.col;
        }));
        var keysSort = _.map(chartConfig.keys, function (e) {
            return e.sort;
        });
        var groupsIdx = getIndex(aggData.columnList, _.map(chartConfig.groups, function (e) {
            return e.col;
        }));
        var groupsSort = _.map(chartConfig.groups, function (e) {
            return e.sort;
        });

        var valueSeries = _.filter(aggData.columnList, function (e) {
            return e.aggType;
        });
        for (var i = 0; i < aggData.data.length; i++) {
            //组合keys
            var newKey = getRowElements(aggData.data[i], keysIdx);
            var jk = newKey.join('-');
            if (_.isUndefined(joinedKeys[jk])) {
                castedKeys.push(newKey);
                joinedKeys[jk] = true;
            }
            //组合groups
            var group = getRowElements(aggData.data[i], groupsIdx);
            var newGroup = group.join('-');
            if (_.isUndefined(joinedGroups[newGroup])) {
                castedGroups.push(group);
                joinedGroups[newGroup] = true;
            }
            // pick the raw values into coordinate cell and then use aggregate function to do calculate
            _.each(valueSeries, function (dSeries) {
                if (_.isUndefined(newData[newGroup])) {
                    newData[newGroup] = {};
                }
                if (_.isUndefined(newData[newGroup][dSeries.name])) {
                    newData[newGroup][dSeries.name] = {};
                }
                if (_.isUndefined(newData[newGroup][dSeries.name][dSeries.aggType])) {
                    newData[newGroup][dSeries.name][dSeries.aggType] = {};
                }
                // if (_.isUndefined(newData[newGroup][dSeries.name][dSeries.aggType][jk])) {
                //     newData[newGroup][dSeries.name][dSeries.aggType][jk] = [];
                // }
                newData[newGroup][dSeries.name][dSeries.aggType][jk] = parseFloat(aggData.data[i][dSeries.index]);
            });
        }
        //sort dimension
        var getSort = function (sort) {
            return function (a, b) {
                var r = 0;
                var j = 0;
                for (; j < a.length; j++) {
                    if (!sort[j]) {
                        continue;
                    }
                    if (a[j] == b[j]) {
                        r = 0;
                        continue;
                    }
                    var params = dataService.toNumber(a[j], b[j]);
                    r = (params[0] > params[1]) ? 1 : -1;
                    if (sort[j] == 'desc') r = r * -1;
                    break;
                }
                return r;
            }
        };
        castedKeys.sort(getSort(keysSort));
        castedGroups.sort(getSort(groupsSort));
        //
        var castedAliasSeriesName = new Array();
        var aliasSeriesConfig = {};
        var aliasData = new Array();

        var valueSort = undefined;
        var valueSortArr = [];

        _.each(castedGroups, function (group) {
            _.each(chartConfig.values, function (value) {
                _.each(value.cols, function (series) {
                    if (_.isUndefined(valueSort) && series.sort) {
                        valueSort = series.sort;
                        castSeriesData(series, group.join('-'), castedKeys, newData, function (castedData, keyIdx) {
                            valueSortArr[keyIdx] = {v: castedData, i: keyIdx};
                        });
                    }
                });
            });
        });

        if (!_.isUndefined(valueSort)) {
            valueSortArr.sort(function (a, b) {
                if (a.v == b.v) return 0;
                var p = dataService.toNumber(a.v, b.v)
                if ((p[0] < p[1]) ^ valueSort == 'asc') {
                    return 1;
                }
                else {
                    return -1;
                }
            });
            var tk = angular.copy(castedKeys);
            _.each(valueSortArr, function (e, i) {
                castedKeys[i] = tk[e.i];
            });
        }

        _.each(castedGroups, function (group) {
            _.each(chartConfig.values, function (value, vIdx) {
                _.each(value.cols, function (series) {
                    var seriesName = series.alias ? series.alias : series.col;
                    var newSeriesName = seriesName;
                    if (group && group.length > 0) {
                        var a = [].concat(group);
                        a.push(seriesName);
                        newSeriesName = a.join('-');
                        castedAliasSeriesName.push(a);
                    } else {
                        castedAliasSeriesName.push([seriesName]);
                    }
                    //castedAliasSeriesName.push(newSeriesName);
                    aliasSeriesConfig[newSeriesName] = {
                        type: value.series_type,
                        valueAxisIndex: vIdx,
                        formatter: series.formatter
                    };
                    castSeriesData(series, group.join('-'), castedKeys, newData, function (castedData, keyIdx) {
                        if (!aliasData[castedAliasSeriesName.length - 1]) {
                            aliasData[castedAliasSeriesName.length - 1] = new Array();
                        }
                        // Only format decimal
                        aliasData[castedAliasSeriesName.length - 1][keyIdx] = castedData;
                    });
                });
            });
        });
        for (var i = 0; i < castedKeys.length; i++) {
            var s = 0;
            var f = true;
            _.each(castedGroups, function (group) {
                _.each(chartConfig.values, function (value) {
                    _.each(value.cols, function (series) {
                        if (!f) {
                            return;
                        }
                        if (series.f_top && series.f_top <= i) {
                            f = false;
                        }
                        if (!filter(series, aliasData[s][i])) {
                            f = false;
                        }
                        if (f) {
                            aliasData[s][i] = dataFormat(aliasData[s][i]);
                        }
                        s++;
                    });
                });
            });
            if (!f) {
                castedKeys.splice(i, 1);
                _.each(aliasData, function (_series) {
                    _series.splice(i, 1);
                });
                i--;
            }
        }
        return {
            keys: castedKeys,
            series: castedAliasSeriesName,
            data: aliasData,
            seriesConfig: aliasSeriesConfig
        };
    };

    var getDrillConfig = function (datasetId, chartConfig) {
        var deferred = $q.defer();
        getDatasetList().then(function (dsList) {
                var drillConfig = {};
                var dataset = _.find(dsList, function (e) {
                    return e.id == datasetId;
                });
                if (!dataset.data.schema || dataset.data.schema.dimension.length == 0) {
                    deferred.resolve(drillConfig);
                    return deferred.promise;
                }
                var _f = function (array) {
                    _.each(array, function (c, i_array) {
                        var level;
                        var i_level;
                        _.find(dataset.data.schema.dimension, function (_e) {
                            if (_e.type == 'level') {
                                return _.find(_e.columns, function (_c, _i) {
                                    if (_c.id == c.id) {
                                        level = _e;
                                        i_level = _i;
                                        return true;
                                    }
                                });
                            }
                        });
                        if (!level) {
                            return;
                        }
                        var prevIsInLevel = false;
                        if (i_array > 0 && i_level > 0) {
                            prevIsInLevel = array[i_array - 1].id == level.columns[i_level - 1].id;
                        }
                        var prevDrilled = i_array > 0 && array[i_array - 1].values.length == 1 && array[i_array - 1].type == '=';
                        var nextIsInLevel = false;
                        if (i_array < array.length - 1 && i_level < level.columns.length - 1) {
                            nextIsInLevel = array[i_array + 1].id == level.columns[i_level + 1].id;
                        }
                        var isLastLevel = i_level == level.columns.length - 1;
                        var drillDownExistIdx = 0;
                        var drillDownExist = _.find(array, function (e, i) {
                            if (i_level < level.columns.length - 1 && level.columns[i_level + 1].id == e.id) {
                                drillDownExistIdx = i;
                                return true;
                            }
                        });
                        //if next level exist in array,the level must be the next of current
                        var drillDown = drillDownExist ? drillDownExistIdx == i_array + 1 : true;
                        var up = i_level > 0 && i_array > 0 && prevIsInLevel && (i_array == array.length - 1 || !nextIsInLevel) && prevDrilled;
                        var down = (nextIsInLevel || !isLastLevel) && drillDown && (!prevIsInLevel || (array[i_array - 1].type == '=' && array[i_array - 1].values.length == 1));
                        drillConfig[c.id] = {
                            up: up,
                            down: down
                        };
                    });
                };
                _f(chartConfig.keys);
                _f(chartConfig.groups);
                deferred.resolve(drillConfig);
            }
        );
        return deferred.promise;
    };

    var getRowElements = function (row, elmIdxs) {
        var arr = new Array();
        for (var j = 0; j < elmIdxs.length; j++) {
            var elm = row[elmIdxs[j]];
            arr.push(elm);
        }
        return arr;
    };

    var castSeriesData = function (series, group, castedKeys, newData, iterator) {
        switch (series.type) {
            case 'exp':
                var runExp = compileExp(series.exp);
                for (var i = 0; i < castedKeys.length; i++) {
                    iterator(runExp(newData[group], castedKeys[i].join('-')), i);
                }
                break;
            default:
                for (var i = 0; i < castedKeys.length; i++) {
                    iterator(newData[group][series.col][series.aggregate_type][castedKeys[i].join('-')], i)
                }
                break;
        }
    };

    var filter = function (cfg, iv) {
        switch (cfg.f_type) {
            case '=':
            case 'eq':
                for (var i = 0; i < cfg.f_values.length; i++) {
                    if (iv == cfg.f_values[i]) {
                        return true;
                    }
                }
                return cfg.f_values.length == 0;
            case '≠':
            case 'ne':
                for (var i = 0; i < cfg.f_values.length; i++) {
                    if (iv == cfg.f_values[i]) {
                        return false;
                    }
                }
                return true;
            case '>':
                var v = cfg.f_values[0];
                var params = toNumber(iv, v);
                if (!_.isUndefined(v) && params[0] <= params[1]) {
                    return false;
                }
                return true;
            case '<':
                var v = cfg.f_values[0];
                var params = toNumber(iv, v);
                if (!_.isUndefined(v) && params[0] >= params[1]) {
                    return false;
                }
                return true;
            case '≥':
                var v = cfg.f_values[0];
                var params = toNumber(iv, v);
                if (!_.isUndefined(v) && params[0] < params[1]) {
                    return false;
                }
                return true;
            case '≤':
                var v = cfg.f_values[0];
                var params = toNumber(iv, v);
                if (!_.isUndefined(v) && params[0] > params[1]) {
                    return false;
                }
                return true;
            case '(a,b]':
                var a = cfg.f_values[0];
                var b = cfg.f_values[1];
                var params = toNumber(iv, a, b);
                if (!_.isUndefined(a) && !_.isUndefined(b) && (params[0] <= params[1] || params[0] > params[2])) {
                    return false;
                }
                return true;
            case '[a,b)':
                var a = cfg.f_values[0];
                var b = cfg.f_values[1];
                var params = toNumber(iv, a, b);
                if (!_.isUndefined(a) && !_.isUndefined(b) && (params[0] < params[1] || params[0] >= params[2])) {
                    return false;
                }
                return true;
            case '(a,b)':
                var a = cfg.f_values[0];
                var b = cfg.f_values[1];
                var params = toNumber(iv, a, b);
                if (!_.isUndefined(a) && !_.isUndefined(b) && (params[0] <= params[1] || params[0] >= params[2])) {
                    return false;
                }
                return true;
            case '[a,b]':
                var a = cfg.f_values[0];
                var b = cfg.f_values[1];
                var params = toNumber(iv, a, b);
                if (!_.isUndefined(a) && !_.isUndefined(b) && (params[0] < params[1] || params[0] > params[2])) {
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    var getDatasetList = function () {
        var deferred = $q.defer();
        if (datasetList) {
            deferred.resolve(angular.copy(datasetList));
        } else {
            $http.get("dashboard/getDatasetList.do").success(function (data) {
                deferred.resolve(data);
            });
        }
        return deferred.promise;
    };

    var datasetList;

    var getChartServices = function (chartConfig) {
        var chart;
        switch (chartConfig.chart_type) {
            case 'line':
                chart = chartLineService;
                break;
            case 'pie':
                chart = chartPieService;
                break;
            case 'kpi':
                chart = chartKpiService;
                break;
            case 'table':
                chart = chartTableService;
                break;
            case 'funnel':
                chart = chartFunnelService;
                break;
            case 'sankey':
                chart = chartSankeyService;
                break;
            case 'radar':
                chart = chartRadarService;
                break;
            case 'map':
                chart = chartMapService;
                break;
            case 'scatter':
                chart = chartScatterService;
                break;
            case 'gauge':
                chart = chartGaugeService;
                break;
            case 'wordCloud':
                chart = chartWordCloudService;
                break;
            case 'treeMap':
                chart = chartTreeMapService;
                break;
            case 'areaMap':
                chart = chartAreaMapService;
                break;
            case 'heatMapCalendar':
                chart = chartHeatMapCalendarService;
                break;
            case 'heatMapTable':
                chart = chartHeatMapTableService;
                break;
            case 'liquidFill':
                chart = chartLiquidFillService;
                break;
            case 'contrast':
                chart = chartContrastService;
                break;
            case 'chinaMap':
                chart = chartChinaMapService;
                break;
            case 'chinaMapBmap':
                chart = chartChinaMapBmapService;
                break;
            case 'relation':
                chart = chartRelationService;
                break;
        }
        return chart;
    };

    function getCategoryList() {
        $http.get("dashboard/getCategoryList.do").success(function (response) {
            vm._data.categoryList.push({
                name: "Private DashBoard",
                id: ""
            })
            for (var i = 0; i < response.length; i++) {
                vm._data.categoryList.push({
                    name: response[i].name,
                    id: response[i].id
                })
            }
        });
    };
})