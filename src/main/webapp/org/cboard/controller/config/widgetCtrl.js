/**
 * Created by yfyuan on 2016/8/12.
 */

cBoard.controller('widgetCtrl', function ($scope, $stateParams, $http, $uibModal, dataService, ModalUtils) {
    //图表类型初始化
    $scope.chart_types = [
        {name: '折线/柱状图', value: 'line'},
        {name: '饼图', value: 'pie'},
        {name: 'kpi', value: 'kpi'},
        {name: '表格', value: 'table'}
    ];

    $scope.value_series_types = [
        {name: '折线', value: 'line'},
        {name: '柱状', value: 'bar'},
        {name: '堆叠柱状', value: 'stackbar'}
    ];

    $scope.value_aggregate_types = [
        {name: 'sum', value: 'sum'},
        {name: 'count', value: 'count'},
        {name: 'avg', value: 'avg'},
        {name: 'max', value: 'max'},
        {name: 'min', value: 'min'}
    ];

    $scope.kpi_styles = [
        {name: '蓝色', value: 'bg-aqua'},
        {name: '红色', value: 'bg-red'},
        {name: '绿色', value: 'bg-green'},
        {name: '黄色', value: 'bg-yellow'}
    ];

    //界面控制
    $scope.loading = false;
    $scope.toChartDisabled = true;
    $scope.optFlag = '';
    $scope.alerts = [];

    $scope.datasource;
    $scope.widgetName;
    $scope.widgetCategory;
    $scope.widgetId;
    $scope.curWidget = {};
    $scope.previewDivWidth = 12;
    $scope.expressions = [];
    $scope.customDs = false;

    $http.get("/dashboard/getDatasetList.do").success(function (response) {
        $scope.datasetList = response;
    });

    $http.get("/dashboard/getDatasetCategoryList.do").success(function (response) {
        $scope.datasetCategoryList = response;
    });

    $http.get("/dashboard/getDatasourceList.do").success(function (response) {
        $scope.datasourceList = response;
        getCategoryList();
        getWidgetList(function () {
            if ($stateParams.id) {
                $scope.editWgt(_.find($scope.widgetList, function (w) {
                    return w.id == $stateParams.id;
                }));
            }
        });
    });

    $scope.datasetGroup = function (item) {
        return item.categoryName;
    };

    var getWidgetList = function (callback) {
        $http.get("/dashboard/getWidgetList.do").success(function (response) {
            $scope.widgetList = response;
            if (callback) {
                callback();
            }
        });
    };

    var getCategoryList = function () {
        $http.get("/dashboard/getWidgetCategoryList.do").success(function (response) {
            $scope.categoryList = response;
        });
    };

    $scope.editExp = function (col) {
        var selects = angular.copy($scope.widgetData[0]);
        var aggregate = $scope.value_aggregate_types;
        var curWidget = $scope.curWidget;
        var ok;
        var expression;
        var alias;
        if (!col) {
            expression = '';
            alias = '';
            ok = function (exp, alias) {
                $scope.expressions.push({
                    type: 'exp',
                    exp: exp,
                    alias: alias
                });
            }
        } else {
            expression = col.exp;
            alias = col.alias;
            ok = function (exp, alias) {
                col.exp = exp;
                col.alias = alias;
            }
        }

        $uibModal.open({
            templateUrl: 'org/cboard/view/config/modal/exp.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            controller: function ($scope, $uibModalInstance) {
                $scope.expression = expression;
                $scope.alias = alias;
                $scope.curWidget = curWidget;
                $scope.selects = selects;
                $scope.aggregate = aggregate;
                $scope.alerts = [];
                $scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.addToken = function (str, agg) {
                    var tc = document.getElementById("expression_area");
                    var tclen = $scope.expression.length;
                    tc.focus();
                    var selectionIdx = 0;
                    if (typeof document.selection != "undefined") {
                        document.selection.createRange().text = str;
                        selectionIdx = str.length - 1;
                    }
                    else {
                        var a = $scope.expression.substr(0, tc.selectionStart);
                        var b = $scope.expression.substring(tc.selectionStart, tclen);
                        $scope.expression = a + str;
                        selectionIdx = $scope.expression.length - 1;
                        $scope.expression += b;
                    }
                    if (!agg) {
                        selectionIdx++;
                    }
                    tc.selectionStart = selectionIdx;
                    tc.selectionEnd = selectionIdx;
                };
                $scope.verify = function () {
                    $scope.alerts = [];
                    var v = verifyAggExpRegx($scope.expression);
                    $scope.alerts = [{msg: v.isValid ? '正确' : v.msg, type: v.isValid ? 'success' : 'danger'}];
                };
                $scope.ok = function () {
                    ok($scope.expression, $scope.alias);
                    $uibModalInstance.close();
                };
            }
        });
    };

    $scope.loadData = function () {
        $scope.loading = true;
        dataService.getData($scope.datasource ? $scope.datasource.id : null, $scope.curWidget.query, $scope.curWidget.datasetId, function (widgetData) {
            $scope.loading = false;
            $scope.toChartDisabled = false;
            if (widgetData.msg == '1') {
                $scope.alerts = [];
                $scope.widgetData = widgetData.data;
                $scope.newConfig();
            } else {
                $scope.alerts = [{msg: widgetData.msg, type: 'danger'}];
            }
        });
    };

    $scope.newWgt = function () {
        $scope.curWidget = {};
        $scope.curWidget.config = {};
        $scope.curWidget.query = {};
        $scope.datasource = null;
        $scope.widgetName = null;
        $scope.widgetCategory = null;
        $scope.widgetId = null;
        $scope.optFlag = 'new';
        $scope.customDs = false;
    };

    var loadExpressions = function () {
        if ($scope.customDs) {
            $scope.expressions = [];
        } else {
            $scope.expressions = angular.copy(_.find($scope.datasetList, function (ds) {
                return ds.id == $scope.curWidget.datasetId;
            }).data.expressions);
        }
    };

    $scope.newConfig = function () {
        var config = $scope.curWidget.config.chart_type;
        $scope.curWidget.config = {};
        if (!config) {
            config = $scope.chart_types[0].value;
        }
        $scope.curWidget.config.chart_type = config;
        loadExpressions();
        switch ($scope.curWidget.config.chart_type) {
            case 'line':
                $scope.curWidget.config.selects = angular.copy($scope.widgetData[0]);
                $scope.curWidget.config.keys = new Array();
                $scope.curWidget.config.groups = new Array();
                $scope.curWidget.config.values = new Array();
                $scope.add_value();
                break;
            case 'pie':
                $scope.curWidget.config.selects = angular.copy($scope.widgetData[0]);
                $scope.curWidget.config.keys = new Array();
                $scope.curWidget.config.values = [{
                    name: '',
                    cols: []
                }];
                break;
            case 'kpi':
                $scope.curWidget.config.selects = angular.copy($scope.widgetData[0]);
                $scope.curWidget.config.values = [{
                    name: '',
                    cols: [],
                    style: 'bg-aqua'
                }];
                break;
            case 'table':
                $scope.curWidget.config.selects = angular.copy($scope.widgetData[0]);
                $scope.curWidget.config.keys = new Array();
                $scope.curWidget.config.groups = new Array();
                $scope.curWidget.config.values = [{
                    name: '',
                    cols: []
                }];
                break;
        }
    };


    $scope.preview = function () {
        switch ($scope.curWidget.config.chart_type) {
            case 'line':
                $scope.previewDivWidth = 12;
                var echartOption = dataService.parseEchartOption($scope.widgetData, $scope.curWidget.config);
                new CBoardEChartRender($('#preview_widget'), echartOption).chart();
                break;
            case 'pie':
                $scope.previewDivWidth = 12;
                var echartOption = dataService.parseEchartOption($scope.widgetData, $scope.curWidget.config);
                new CBoardEChartRender($('#preview_widget'), echartOption).chart();
                break;
            case 'kpi':
                $scope.previewDivWidth = 6;
                var option = dataService.parseKpiOption($scope.widgetData, $scope.curWidget.config);
                new CBoardKpiRender($('#preview_widget'), option).do();
                break;
            case 'table':
                $scope.previewDivWidth = 12;
                var option = dataService.parseTableOption($scope.widgetData, $scope.curWidget.config);
                new CBoardTableRender($('#preview_widget'), option).do();
                break;
        }

    };

    // $scope.saveChart = function () {
    //     dashboardService.saveWidget('123', $scope.datasource, $scope.config);
    // };

    $scope.add_value = function () {
        $scope.curWidget.config.values.push({
            name: '',
            series_type: 'line',
            type: 'value',
            cols: []
        });
    };

    var saveWgtCallBack = function (serviceStatus) {
        if (serviceStatus.status == '1') {
            getWidgetList();
            getCategoryList();
            ModalUtils.alert("成功", "modal-success", "sm");
        } else {
            ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
        }
    }

    $scope.saveWgt = function () {
        var o = {};
        o.name = $scope.widgetName;
        o.categoryName = $scope.widgetCategory;
        o.data = {};
        o.data.config = $scope.curWidget.config;
        if ($scope.customDs) {
            o.data.query = $scope.curWidget.query;
            o.data.datasource = $scope.datasource.id;
        } else {
            o.data.datasetId = $scope.curWidget.datasetId;
        }
        if ($scope.optFlag == 'new') {
            $http.post("/dashboard/saveNewWidget.do", {json: angular.toJson(o)}).success(function (serviceStatus) {
                if (serviceStatus.status == '1') {
                    getWidgetList();
                    getCategoryList();
                    ModalUtils.alert("成功", "modal-success", "sm");
                } else {
                    ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                }
            });
        } else if ($scope.optFlag == 'edit') {
            o.id = $scope.widgetId;
            $http.post("/dashboard/updateWidget.do", {json: angular.toJson(o)}).success(function (serviceStatus) {
                if (serviceStatus.status == '1') {
                    getWidgetList();
                    getCategoryList();
                    ModalUtils.alert("成功", "modal-success", "sm");
                } else {
                    ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                }
            });
        }
    };

    $scope.editWgt = function (widget) {
        $('#preview_widget').html('');
        $scope.curWidget = angular.copy(widget.data);
        $scope.datasource = _.find($scope.datasourceList, function (ds) {
            return ds.id == widget.data.datasource;
        });
        $scope.widgetName = angular.copy(widget.name);
        $scope.widgetCategory = angular.copy(widget.categoryName);
        $scope.widgetId = widget.id;
        $scope.optFlag = 'edit';
        $scope.loading = true;
        $scope.customDs = _.isUndefined($scope.curWidget.datasetId);
        loadExpressions();

        dataService.getData($scope.datasource ? $scope.datasource.id : null, $scope.curWidget.query, $scope.curWidget.datasetId, function (widgetData) {
            $scope.loading = false;
            if (widgetData.msg == '1') {
                $scope.widgetData = widgetData.data;
            } else {
                ModalUtils.alert(widgetData.msg, "modal-danger", "lg");
            }
        });
    };

    $scope.deleteWgt = function (widget) {
        ModalUtils.confirm("确认删除吗？", "modal-warning", "lg", function () {
            $http.post("/dashboard/deleteWidget.do", {id: widget.id}).success(function () {
                getWidgetList();
                $scope.optFlag == 'none';
            });
        });
    };

    $scope.getQueryView = function () {
        if ($scope.datasource && $scope.datasource.name) {
            return '/dashboard/getConfigView.do?type=' + $scope.datasource.type;
        }
    };

    $scope.getChartView = function () {
        if ($scope.curWidget.config && $scope.curWidget.config.chart_type) {
            return 'org/cboard/view/config/chart/' + $scope.curWidget.config.chart_type + '.html';
        }
    };

    $scope.deleteValue = function (cols) {
        _.each(cols, function (e) {
            if (e.type == 'exp') {
                $scope.expressions.push(e);
            } else {
                $scope.curWidget.config.selects.push(e.col);
            }
        });
    };

    $scope.cellToValue = function (list, index, item, type) {
        if (type != 'col' && type != 'exp') {
            list[index] = {col: item, aggregate_type: 'sum'};
        }
    };

    $scope.valueToCell = function (list, index, item, type) {
        if (type == 'col') {
            list[index] = item.col;
        }
    };
});