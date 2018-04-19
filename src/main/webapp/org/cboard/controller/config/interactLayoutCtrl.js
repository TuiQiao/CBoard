/**
 * Created by sileiH on 2016/8/2.
 */
'use strict';
cBoard.controller('interactLayoutCtrl', function ($rootScope, $scope, $stateParams, $http, $state, chartService, $q) {
    //初始化样式
    $("body").addClass("sidebar-collapse")
    var window_height = $(window).height();
    var header = $(".main-header").height();
    var footer = $(".main-footer").height();
    $("#app").css('height', window_height - header - footer + "px");

    var interactConf = initInteractConf();
    var interactChartDataJSON = {};
    //数据视图图表配置
    var interactChartData = {interactConfChartCSS: {}, jsonData: {label: "", value: ""}};
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
            components: hexInteract.component,
            componentsIcon: hexInteract.componentICON,
            activeIndex: '1',
            pageCssItem: '1',
            //画布大小
            dragWidth: '',
            dragHeight: '',
            //数据视图配置
            interactConf: interactConf,
            //可视化数据预览
            viewDataCharts: [],
            //画板可视化组件
            interactComponents: [],
            //边框组件样式
            borderStyle: hexInteract.getBorderStyle(),
            //装饰组件样式
            ornamentStyle: hexInteract.getOrnamentStyle(),
            //字体粗细
            fontWeight: hexInteract.getFontWeight(),
            //文本对齐方式
            textAlign: hexInteract.textAlign(),
            //主要用于给element-ui.js的标签页取名用
            tabActiveName: 'one',
            //预览画布大小
            viewDragWidth: '',
            viewDragHeight: '',
            //图表数据
            interactChartData: interactChartData,
            categoryList: [],
            boardId: '',
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
                hexInteract.componentDom = componentDom;
                this.drop();
            },
            //监控大屏尺寸大小设置
            screenSizeChange: function () {
                //画布父层大小
                var dragWidth = $('#interact-drag').parent().css('width');
                dragWidth = Number(dragWidth.substr(0, dragWidth.length - 2));
                var dragHeight = $('#interact-drag').parent().css('height');
                dragHeight = Number(dragHeight.substr(0, dragHeight.length - 2));
                //屏幕配置大小
                var screenWidth = screen.width * vm._data.interactConf.screenWidth / 100;
                var screenHeight = screen.height * vm._data.interactConf.screenHeight / 100;
                //屏幕比例
                var prop = (screenHeight / screenWidth).toFixed(4);
                dragWidth = dragWidth.toFixed();
                dragHeight = (dragWidth * prop).toFixed();
                //绘制画布大小
                dragInteractDrag(dragWidth + 'px', dragHeight + 'px');
            },
            //用于保存视图数据
            saveInteractConf: function (callback) {
                var hexInteractInfo = buildHexInteractInfo();
                saveInteractConf(hexInteractInfo, callback);
            },
            //用于预览视图
            viewInteract: function () {
                var callback = function () {
                    var boardId = vm._data.boardId
                    if (!boardId) {
                        var href = window.location.href;
                        boardId = href.substr(href.lastIndexOf("/") + 1);
                    }
                    var winInfo = "toolbar=no,menubar=no,status=yes,scrollbars=no,resizable=no,titlebar=no,location=no,width=" + (window.screen.availWidth - 10) + ",height=" + (window.screen.availHeight - 30) + ",top=0,left=0,fullscreen=no";
                    window.open('render.html#?id=' + boardId, '', winInfo)
                }
                vm.saveInteractConf(callback);
            },
            //设置数据视图可移动
            allowDrop: function (event) {
                event.preventDefault();
            },
            //移动数据视图
            drop: function (event) {
                var dom = hexInteract.componentDom;
                if (!dom) {
                    return;
                }
                var domId;
                //新增组件
                if (dom.domId) {
                    domId = dom.domId;
                } else {
                    domId = dom.type + '_' + new Date().getTime();
                }
                var interactChartData = initInteractChartData();
                interactChartData.chartType = dom.type;
                interactChartData.widgetId = dom.widgetId;
                interactChartData.domId = domId;
                interactChartData.name = dom.name;
                if (dom.type == 'label') {
                    //标题组件默认值
                    interactChartData.interactConfChartCSS.chartTitle = hexInteract.defaultTitle;
                } else if (dom.type == 'rlabel') {
                    //滚动文本默认值
                    interactChartData.jsonData = hexInteract.defaultRLabelData();
                } else if (dom.type == 'kpi') {
                    //指标卡默认值
                    interactChartData.jsonData = hexInteract.defaultKpiData();
                    interactChartData.interactConfChartCSS = hexInteract.defaultKpiStyle();
                } else if (dom.type == 'border') {
                    //边框默认样式
                    interactChartData.chartStyle = vm._data.borderStyle[0].value;
                } else if (dom.type == 'ornament') {
                    //装饰默认样式
                    interactChartData.chartStyle = vm._data.ornamentStyle[0].value;
                } else if (dom.type == 'clock') {
                    //时钟组件默认格式化
                    interactChartData.interactConfChartCSS = hexInteract.defaultClockStyle();
                } else if (dom.type == 'table') {
                    //表格组件默认值
                    interactChartData.jsonData.value = hexInteract.defaultTableData();
                    interactChartData.interactConfChartCSS = hexInteract.defaultTableStyle();
                }
                if (!jQuery.isEmptyObject(hexInteract.componentDom.interactConfChartCSS)) {
                    interactChartData.interactConfChartCSS = hexInteract.componentDom.interactConfChartCSS;
                }
                if (!jQuery.isEmptyObject(hexInteract.componentDom.chartStyle)) {
                    interactChartData.chartStyle = hexInteract.componentDom.chartStyle;
                }
                var xprop = xMultiple(vm._data.interactConf.screenWidth);
                var yprop = yMultiple(vm._data.interactConf.screenHeight);
                interactChartData.xprop = xprop;
                interactChartData.yprop = yprop;

                if (dom.jsonData) {
                    interactChartData.jsonData = dom.jsonData;
                }

                if (dom.chartHeight) {
                    interactChartData.chartWidth = dom.chartWidth;
                    interactChartData.chartHeight = dom.chartHeight;
                    interactChartData.positionX = dom.positionX;
                    interactChartData.positionY = dom.positionY;
                } else {
                    interactChartData.chartWidth = (207 / xprop).toFixed();
                    interactChartData.chartHeight = (105 / yprop).toFixed();
                }

                if (dom.bgColor) {
                    interactChartData.bgColor = dom.bgColor;
                } else {
                    interactChartData.bgColor = hexInteract.defaultBgColor;
                }
                vm._data.interactChartData = interactChartData;
                interactChartDataJSON[domId] = interactChartData;
                var interactComponent = {
                    domId: domId,
                    componentName: dom.componentName,
                    componentType: dom.type,
                    chartData: interactChartData,
                    widgetId: dom.widgetId
                };

                if (!vm._data.viewType) {
                    var array = vm._data.interactComponents;
                    array.push(interactComponent);
                    vm._data.interactComponents = array;
                    //初始化组件可拖拽、伸缩
                    initDrag(domId);
                } else {
                    var array = vm._data.viewDataCharts;
                    interactComponent.chartData.positionY *= screen.height / 100;
                    interactComponent.chartData.positionX *= screen.width / 100;
                    interactComponent.chartData.chartHeight *= screen.height / 100;
                    interactComponent.chartData.chartWidth *= screen.width / 100;
                    array.push(interactComponent);
                    vm._data.viewDataCharts = array;
                }
            },
            //点击数据视图
            interactBlockClick: function (e) {
                //若定位在全局样式,切换到图表样式;
                vm._data.pageCssItem = '2';
                var domId = e;
                var select = '#' + domId;
                $(select).addClass('interact-block-select');
                $(select + ' div.interact-view-close').show();
                $(select).siblings('.interact-block').removeClass('interact-block-select');
                $(select).siblings('.interact-block').children('.interact-view-close').hide();
                //绑定数据可视化图层基本信息
                bindInteractChartData(domId);
            },
            //关闭数据视图
            closeInteractWin: function (e) {
                var domId = e;
                $('#' + domId).remove();
                interactChartDataJSON[domId] = '';
            },
            //下载上传
            dropUpload: function (event) {
                event.preventDefault();
                var fileList = event.dataTransfer.files; //获取文件对象
                var xhr = new XMLHttpRequest();
                var url = 'dashboard/uploadImage.do';
                xhr.open('post', url, true);
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        vm._data.interactConf.background = xhr.responseText;
                    }
                };
                var formData = new FormData();
                formData.append('file', fileList[0]);
                xhr.send(formData);
            },
            //加载监控视图配置
            loadInteractConf: function () {
                var boardId = $stateParams.boardId;
                if (boardId === undefined) {
                    var href = window.location.href;
                    boardId = href.substr(href.lastIndexOf("?id=") + 4);
                    vm._data.viewType = true;
                }
                if (boardId) {
                    $http.get("dashboard/getBoardData.do", {params: {id: boardId}}).then(function (res) {
                        if (!res.data.layout.interactConf) {
                            return;
                        }
                        vm._data.interactConf = res.data.layout.interactConf;
                        vm.screenSizeChange();
                        vm._data.viewDragWidth = res.data.layout.interactConf.screenWidth * screen.width / 100 + "px";
                        vm._data.viewDragHeight = res.data.layout.interactConf.screenHeight * screen.height / 100 + "px";
                        var layout = res.data.layout;
                        for (var i = 0; i < layout.rows.length; i++) {
                            if (layout.rows[i].type == 'widget') {
                                var widgets = layout.rows[i].widgets;
                                for (var j = 0; j < widgets.length; j++) {
                                    var componentDom = {
                                        type: "chart",
                                        componentName: "hex-interact-chart",
                                        widgetId: widgets[j].widgetId,
                                        chartWidth: widgets[j].chartWidth,
                                        chartHeight: widgets[j].chartHeight,
                                        bgColor: widgets[j].bgColor,
                                        positionX: widgets[j].positionX,
                                        positionY: widgets[j].positionY,
                                        domId: widgets[j].domId
                                    };
                                    hexInteract.componentDom = componentDom;
                                    vm.drop();
                                }
                            } else {
                                var others = layout.rows[i].others;
                                for (var j = 0; j < others.length; j++) {
                                    var componentDom = {
                                        type: others[j].type,
                                        componentName: "hex-interact-" + others[j].type,
                                        chartWidth: others[j].chartWidth,
                                        chartHeight: others[j].chartHeight,
                                        positionX: others[j].positionX,
                                        positionY: others[j].positionY,
                                        chartStyle: others[j].chartStyle,
                                        interactConfChartCSS: others[j].interactConfChartCSS,
                                        jsonData: others[j].jsonData,
                                        domId: others[j].domId
                                    };
                                    hexInteract.componentDom = componentDom;
                                    vm.drop();
                                }
                            }
                        }
                    })
                }
            }
        }
    })

    //找不到如何使导航栏动画结束后再执行页面大小计算的方法，不得已做一个延时装置
    setTimeout(function () {
        //初始化视图大小
        vm.screenSizeChange();
        //加载监控视图配置
        vm.loadInteractConf();
    }, 500)

    //加载图表列表
    getWidgetList();

    //加载分类列表
    getCategoryList();

    //保存视图监控配置
    function saveInteractConf(hexInteractInfo, callback) {

        if (!hexInteractInfo.interactConf.viewName) {
            vm.$alert("监控主题名字不能为空", "警告");
            return;
        }

        //数据封装
        var json = {
            name: hexInteractInfo.interactConf.viewName,
            layout: {rows: [], type: "interact"},
            categoryId: hexInteractInfo.interactConf.categoryId,
            id: $stateParams.boardId ? $stateParams.boardId : ""
        };
        json.layout.interactConf = hexInteractInfo.interactConf;
        json.layout.rows.push({
            type: "widget",
            widgets: []
        })
        json.layout.rows.push({
            type: "other",
            others: []
        })
        for (var i = 0; i < hexInteractInfo.interactConfChartDataList.length; i++) {
            if (hexInteractInfo.interactConfChartDataList[i].chartType == 'chart') {
                json.layout.rows[0].widgets.push({
                    widgetId: hexInteractInfo.interactConfChartDataList[i].widgetId,
                    name: hexInteractInfo.interactConfChartDataList[i].name,
                    chartHeight: hexInteractInfo.interactConfChartDataList[i].chartHeight,
                    chartWidth: hexInteractInfo.interactConfChartDataList[i].chartWidth,
                    bgColor: hexInteractInfo.interactConfChartDataList[i].bgColor,
                    positionX: hexInteractInfo.interactConfChartDataList[i].positionX,
                    positionY: hexInteractInfo.interactConfChartDataList[i].positionY,
                    domId: hexInteractInfo.interactConfChartDataList[i].domId
                })
            } else {
                json.layout.rows[1].others.push({
                    type: hexInteractInfo.interactConfChartDataList[i].chartType,
                    chartWidth: hexInteractInfo.interactConfChartDataList[i].chartWidth,
                    chartHeight: hexInteractInfo.interactConfChartDataList[i].chartHeight,
                    positionX: hexInteractInfo.interactConfChartDataList[i].positionX,
                    positionY: hexInteractInfo.interactConfChartDataList[i].positionY,
                    chartStyle: hexInteractInfo.interactConfChartDataList[i].chartStyle,
                    interactConfChartCSS: hexInteractInfo.interactConfChartDataList[i].interactConfChartCSS,
                    jsonData: hexInteractInfo.interactConfChartDataList[i].jsonData,
                    domId: hexInteractInfo.interactConfChartDataList[i].domId
                })
            }

        }
        //数据封装结束
        if ($stateParams.boardId) {
            $http.post("dashboard/updateBoard.do", {json: angular.toJson(json)}).then(function (res) {
                if (res.status == "200") {
                    closeMessage("提示", "更新成功", function () {
                        interactChartDataJSON = {};
                        $state.go("config.board")
                        getBoardList();
                        boardChange();
                    })
                    if (callback.index != '4-1') {
                        callback();
                    }
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
                        interactChartDataJSON = {};
                        $state.go("config.board")
                        getBoardList();
                        boardChange();
                    })
                    vm._data.boardId = res.data.id;
                    if (callback.index != '4-1') {
                        callback();
                    }
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
    function buildHexInteractInfo() {
        var hexInteractInfo = {};
        var interactChartData = vm._data.interactChartData;
        if (document.getElementById(interactChartData.domId)) {
            interactChartDataJSON[interactChartData.domId] = interactChartData;
        }
        hexInteractInfo.interactConf = vm._data.interactConf;
        var keys = _.keys(interactChartDataJSON);
        var interactConfChartDataList = new Array();
        for (var i = 0; i < keys.length; i++) {
            var interactConfChartData = interactChartDataJSON[keys[i]];
            if (!interactConfChartData) {
                continue;
            }
            interactConfChartDataList.push(interactChartDataJSON[keys[i]]);
        }
        hexInteractInfo.interactConfChartDataList = angular.copy(interactConfChartDataList);
        return hexInteractInfo;
    }

    //绑定数据可视化图层基本信息
    function bindInteractChartData(domId) {
        if (!document.getElementById(domId)) {
            interactChartDataJSON[domId] = '';
            return;
        }
        //数据视图图表配置
        var interactChartData = interactChartDataJSON[domId];
        //画板上的图表等比缩放后的宽度、高度
        var chartWidth = $('#' + domId).css('width');
        var chartHeight = $('#' + domId).css('height');
        chartWidth = chartWidth.substr(0, chartWidth.length - 2);
        chartHeight = chartHeight.substr(0, chartHeight.length - 2);
        //画布大小缩放比例
        var xprop = xMultiple(vm._data.interactConf.screenWidth);
        var yprop = yMultiple(vm._data.interactConf.screenHeight);
        chartWidth = (chartWidth / xprop).toFixed();
        chartHeight = (chartHeight / yprop).toFixed();
        interactChartData.chartWidth = chartWidth;
        interactChartData.chartHeight = chartHeight;
        var positionX = $('#' + domId).attr('x') ? $('#' + domId).attr('x') : 0;
        var positionY = $('#' + domId).attr('y') ? $('#' + domId).attr('y') : 0;
        positionX = (positionX / xprop).toFixed();
        positionY = (positionY / yprop).toFixed();
        interactChartData.positionX = positionX;
        interactChartData.positionY = positionY;
        vm._data.interactChartData = interactChartData;
        //数据视图图表配置放到全局变量
        interactChartDataJSON[domId] = interactChartData;
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
        var dragOffset = $('#interact-drag').offset();
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
    function initInteractConf() {
        return {
            screenWidth: 100,
            screenHeight: 100,
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
    function initInteractChartData() {
        return {
            //图表基础信息
            chartType: '', domId: '', chartWidth: '', chartHeight: '', positionX: 0, positionY: 0,
            chartStyle: '', bgColor: '',
            //图表数据配置
            xField: '', yField: '', gField: '',
            dataSource: '01', url: '', jsonData: {},
            //图表样式
            interactConfChartCSS: {}
        };
    }

    //绘制画布大小
    function dragInteractDrag(width, height) {
        vm._data.dragWidth = width;
        vm._data.dragHeight = height;
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
                    id: response[i].id,
                    iconUrl: "content:url(imgs/" + response[i].data.config.chart_type + "-active.png)"
                })
            }
            vm._data.widgetList = map;
        })
    }

    var getBoardList = function () {
        return $http.get("dashboard/getBoardList.do").success(function (response) {
            $scope.boardList = response;
        });
    };

    var boardChange = function () {
        $scope.verify = {boardName: true};
        $scope.$emit("boardChange");
    };

    Vue.component('hex-interact-chart', {
        props: {
            chartdata: Object
        },
        template: '<div class="interact-line" v-bind:style=" {background:chartdata.bgColor} "><div :id="chartdata.domId + \'_01\'" style="width: 100%;height: 100%;"></div></div>',
        methods: {
            init: function () {
                var domId = this.chartdata.domId;
                var widgetId = this.chartdata.widgetId;
                $http.get("dashboard/dashboardWidget.do", {
                    params: {
                        "id": widgetId
                    }
                }).success(function (res) {
                    getDatasetList().then(function (dsres) {
                        var dataset = _.find(dsres, function (e) {
                            return e.id == res.data.datasetId;
                        });
                        loadWidget($("#" + domId + "_01"), res.data, null, null, false);
                        if(vm._data.viewType){
                            if (dataset.data.interval || dataset.data.interval > 0){
                                //real time load task
                                setInterval(function () {
                                    loadWidget($("#" + domId + "_01"), res.data, null, null, false);
                                },dataset.data.interval * 1000);
                            }
                        }
                    })
                })
            }
        },
        mounted: function () {
            //渲染柱状图表
            this.init();
        }
    })

    var loadWidget = function (containerDom, widget, optionFilter, scope, reload, persist, relations) {
        chartService.render(containerDom, widget, optionFilter, scope, reload, persist, relations);
    }

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

    var getDatasetList = function () {
        var deferred = $q.defer();
        $http.get("dashboard/getDatasetList.do").success(function (data) {
            deferred.resolve(data);
        });
        return deferred.promise;
    };

})