/**
 * Created by yfyuan on 2016/8/12.
 */
'use strict';
cBoard.controller('widgetCtrl', function ($scope, $stateParams, $http, $uibModal, dataService, ModalUtils, updateService, $filter, chartService) {

    var translate = $filter('translate');
    //图表类型初始化
    $scope.chart_types = [
        {name: translate('CONFIG.WIDGET.LINE_BAR'), value: 'line'},
        {name: translate('CONFIG.WIDGET.PIE'), value: 'pie'},
        {name: translate('CONFIG.WIDGET.KPI'), value: 'kpi'},
        {name: translate('CONFIG.WIDGET.TABLE'), value: 'table'},
        {name: translate('CONFIG.WIDGET.FUNNEL'), value: 'funnel'},
        {name: translate('CONFIG.WIDGET.SANKEY'), value: 'sankey'},
        {name: translate('CONFIG.WIDGET.RADAR'), value: 'radar'}
    ];

    $scope.value_series_types = [
        {name: translate('CONFIG.WIDGET.LINE'), value: 'line'},
        {name: translate('CONFIG.WIDGET.BAR'), value: 'bar'},
        {name: translate('CONFIG.WIDGET.STACKED_BAR'), value: 'stackbar'}
    ];

    $scope.value_aggregate_types = [
        {name: 'sum', value: 'sum'},
        {name: 'count', value: 'count'},
        {name: 'avg', value: 'avg'},
        {name: 'max', value: 'max'},
        {name: 'min', value: 'min'}
    ];

    $scope.kpi_styles = [
        {name: translate('CONFIG.WIDGET.AQUA'), value: 'bg-aqua'},
        {name: translate('CONFIG.WIDGET.RED'), value: 'bg-red'},
        {name: translate('CONFIG.WIDGET.GREEN'), value: 'bg-green'},
        {name: translate('CONFIG.WIDGET.YELLOW'), value: 'bg-yellow'}
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
    $scope.filterSelect = {};

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
                    $scope.alerts = [{
                        msg: v.isValid ? translate("COMMON.SUCCESS") : v.msg,
                        type: v.isValid ? 'success' : 'danger'
                    }];
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
        dataService.getData($scope.datasource ? $scope.datasource.id : null, $scope.curWidget.query, $scope.customDs ? null : $scope.curWidget.datasetId, function (widgetData) {
            $scope.loading = false;
            $scope.toChartDisabled = false;
            if (widgetData.msg == '1') {
                $scope.alerts = [];
                $scope.widgetData = widgetData.data;
                $scope.newConfig();
                $scope.filterSelect = {};
            } else {
                widgetData.msg ? null : widgetData.msg = 'There is something wrong.';
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

    var loadDsExpressions = function () {
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
        loadDsExpressions();
        cleanPreview();
        switch ($scope.curWidget.config.chart_type) {
            case 'line':
                $scope.curWidget.config.selects = angular.copy($scope.widgetData[0]);
                $scope.curWidget.config.keys = new Array();
                $scope.curWidget.config.groups = new Array();
                $scope.curWidget.config.values = new Array();
                $scope.curWidget.config.filters = new Array();
                $scope.curWidget.config.valueAxis = 'vertical';
                $scope.add_value();
                break;
            case 'pie':
                $scope.curWidget.config.selects = angular.copy($scope.widgetData[0]);
                $scope.curWidget.config.keys = new Array();
                $scope.curWidget.config.groups = new Array();
                $scope.curWidget.config.values = [{
                    name: '',
                    cols: []
                }];
                $scope.curWidget.config.filters = new Array();
                break;
            case 'kpi':
                $scope.curWidget.config.selects = angular.copy($scope.widgetData[0]);
                $scope.curWidget.config.values = [{
                    name: '',
                    cols: [],
                    style: 'bg-aqua'
                }];
                $scope.curWidget.config.filters = new Array();
                break;
            case 'table':
                $scope.curWidget.config.selects = angular.copy($scope.widgetData[0]);
                $scope.curWidget.config.keys = new Array();
                $scope.curWidget.config.groups = new Array();
                $scope.curWidget.config.values = [{
                    name: '',
                    cols: []
                }];
                $scope.curWidget.config.filters = new Array();
                break;
            case 'funnel':
                $scope.curWidget.config.selects = angular.copy($scope.widgetData[0]);
                $scope.curWidget.config.keys = new Array();
                $scope.curWidget.config.values = [{
                    name: '',
                    cols: []
                }];
                $scope.curWidget.config.filters = new Array();
                break;
            case 'sankey':
                $scope.curWidget.config.selects = angular.copy($scope.widgetData[0]);
                $scope.curWidget.config.keys = new Array();
                $scope.curWidget.config.groups = new Array();
                $scope.curWidget.config.values = [{
                    name: '',
                    cols: []
                }];
                $scope.curWidget.config.filters = new Array();
                break;
            case 'radar':
                $scope.curWidget.config.selects = angular.copy($scope.widgetData[0]);
                $scope.curWidget.config.keys = new Array();
                $scope.curWidget.config.groups = new Array();
                $scope.curWidget.config.values = [{
                    name: '',
                    cols: []
                }];
                $scope.curWidget.config.filters = new Array();
                break;
        }
    };

    var cleanPreview = function () {
        $('#preview_widget').html("");
    };

    $scope.preview = function () {
        chartService.render($('#preview_widget'), $scope.widgetData, $scope.curWidget.config, function (option) {
            switch ($scope.curWidget.config.chart_type) {
                case 'line':
                    $scope.previewDivWidth = 12;
                    option.toolbox = {
                        feature: {
                            dataView: {
                                show: true,
                                readOnly: true
                            }
                        }
                    };
                    break;
                case 'pie':
                    $scope.previewDivWidth = 12;
                    option.toolbox = {
                        feature: {
                            dataView: {
                                show: true,
                                readOnly: true
                            }
                        }
                    };
                    break;
                case 'kpi':
                    $scope.previewDivWidth = 6;
                    break;
                case 'table':
                    $scope.previewDivWidth = 12;
                    break;
                case 'funnel':
                    $scope.previewDivWidth = 12;
                    option.toolbox = {
                        feature: {
                            dataView: {
                                show: true,
                                readOnly: true
                            }
                        }
                    };
                    break;
                case 'sankey':
                    $scope.previewDivWidth = 12;
                    option.toolbox = {
                        feature: {
                            dataView: {
                                show: true,
                                readOnly: true
                            }
                        }
                    };
                    break;
            }
        });


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
            ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
        } else {
            ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
        }
    };

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
            if (o.name == null || o.data.datasetId == undefined) {
                ModalUtils.alert('Please fill out the complete information.', "modal-warning", "md");
            } else {
                $http.post("/dashboard/saveNewWidget.do", {json: angular.toJson(o)}).success(function (serviceStatus) {
                    if (serviceStatus.status == '1') {
                        getWidgetList();
                        getCategoryList();
                        ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                    } else {
                        ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                    }
                });
            }
        } else if ($scope.optFlag == 'edit') {
            o.id = $scope.widgetId;
            $http.post("/dashboard/updateWidget.do", {json: angular.toJson(o)}).success(function (serviceStatus) {
                if (serviceStatus.status == '1') {
                    getWidgetList();
                    getCategoryList();
                    ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                } else {
                    ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                }
            });
        }
    };

    $scope.editWgt = function (widget) {
        $('#preview_widget').html('');
        $scope.curWidget = angular.copy(widget.data);
        updateService.updateConfig($scope.curWidget.config);
        $scope.datasource = _.find($scope.datasourceList, function (ds) {
            return ds.id == widget.data.datasource;
        });
        $scope.widgetName = angular.copy(widget.name);
        $scope.widgetCategory = angular.copy(widget.categoryName);
        $scope.widgetId = widget.id;
        $scope.optFlag = 'edit';
        $scope.loading = true;
        $scope.customDs = _.isUndefined($scope.curWidget.datasetId);
        loadDsExpressions();

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
        ModalUtils.confirm(translate("COMMON.CONFIRM_DELETE"), "modal-info", "lg", function () {
            $http.post("/dashboard/deleteWidget.do", {id: widget.id}).success(function () {
                getWidgetList();
                $scope.optFlag == 'none';
            });
        });
    };

    $scope.copyWgt = function (widget) {
        var o = angular.copy(widget);
        o.name = o.name + "_copy";
        $http.post("/dashboard/saveNewWidget.do", {json: angular.toJson(o)}).success(function (serviceStatus) {
            if (serviceStatus.status == '1') {
                getWidgetList();
                ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
            } else {
                ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
            }
            $scope.optFlag == 'none';
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

    $scope.dndTransfer = {
        toCol: function (list, index, item, type) {
            if (type == 'key' || type == 'group' || type == 'filter') {
                list[index] = {col: item.col, aggregate_type: 'sum'};
            } else if (type == 'select') {
                list[index] = {col: item, aggregate_type: 'sum'};
            }
        },
        toSelect: function (list, index, item, type) {
            if (type == 'col') {
                list[index] = item.col;
            } else if (type == 'key' || type == 'group' || type == 'filter') {
                list[index] = item.col;
            }
        },
        toKeysGroups: function (list, index, item, type) {
            if (type == 'col') {
                list[index] = {col: item.col, type: 'eq', values: []};
            } else if (type == 'select') {
                list[index] = {col: item, type: 'eq', values: []};
            }
        }
    };

    $scope.editFilter = function (setbackArr, setbackIdx) {
        var item = setbackArr[setbackIdx];
        var col;
        if (item.col) {
            col = angular.copy(item);
        } else {
            col = {col: item, type: 'eq', values: []}
        }

        var selects = [];
        if ($scope.filterSelect[col.col]) {
            selects = $scope.filterSelect[col.col];
        } else {
            var idx = _.indexOf($scope.widgetData[0], col.col);
            for (var i = 1; i < $scope.widgetData.length; i++) {
                var v = $scope.widgetData[i][idx];
                if (_.indexOf(selects, v) < 0) {
                    selects.push(v);
                }
            }
            selects = _.sortBy(dataService.toNumber(selects));
            $scope.filterSelect[col.col] = selects;
        }

        $uibModal.open({
            templateUrl: 'org/cboard/view/config/modal/filter.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            size: 'lg',
            controller: function ($scope, $uibModalInstance) {
                $scope.selects = selects;
                $scope.col = col;
                $scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.selected = function (v) {
                    return _.indexOf($scope.col.values, v) == -1
                };
                $scope.ok = function () {
                    if ($scope.col.values.length > 100) {
                        $scope.alerts = [{msg: '条件数量过多>100', type: 'danger'}];
                    }
                    setbackArr[setbackIdx] = $scope.col;
                    $uibModalInstance.close();
                };
            }
        });
    };

    $scope.editSort = function (o) {
        switch (o.sort) {
            case 'asc':
                o.sort = 'desc';
                break;
            case 'desc':
                o.sort = undefined;
                break;
            default:
                o.sort = 'asc';
                break;
        }
    };
});