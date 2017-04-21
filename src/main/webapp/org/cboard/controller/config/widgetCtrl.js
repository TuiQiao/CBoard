/**
 * Created by yfyuan on 2016/8/12.
 */
'use strict';
cBoard.controller('widgetCtrl', function ($scope, $stateParams, $http, $uibModal, dataService, ModalUtils, updateService, $filter, chartService, $timeout) {

        var translate = $filter('translate');
        var updateUrl = "dashboard/updateWidget.do";
        //图表类型初始化
        $scope.chart_types = [
            {
                name: translate('CONFIG.WIDGET.TABLE'), value: 'table', class: 'cTable',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0_MORE'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE')
            },
            {
                name: translate('CONFIG.WIDGET.LINE_BAR'), value: 'line', class: 'cLine',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0_MORE'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE')
            },
            {
                name: translate('CONFIG.WIDGET.SCATTER'), value: 'scatter', class: 'cScatter',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0_MORE'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE')
            },
            {
                name: translate('CONFIG.WIDGET.PIE'), value: 'pie', class: 'cPie',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0_MORE'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE')
            },
            {
                name: translate('CONFIG.WIDGET.KPI'), value: 'kpi', class: 'cKpi',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1')
            },
            {
                name: translate('CONFIG.WIDGET.FUNNEL'), value: 'funnel', class: 'cFunnel',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE')
            },
            {
                name: translate('CONFIG.WIDGET.SANKEY'), value: 'sankey', class: 'cSankey',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0_MORE'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1')
            },
            {
                name: translate('CONFIG.WIDGET.RADAR'), value: 'radar', class: 'cRadar',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0_MORE'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE')
            },
            {
                name: translate('CONFIG.WIDGET.MAP'), value: 'map', class: 'cMap',
                row: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE'),
                column: translate('CONFIG.WIDGET.TIPS_DIM_NUM_0_MORE'),
                measure: translate('CONFIG.WIDGET.TIPS_DIM_NUM_1_MORE')
            }
        ];

        $scope.chart_types_status = {
            "line": true, "pie": true, "kpi": true, "table": true,
            "funnel": true, "sankey": true, "radar": true, "map": true, "scatter": true
        };

        $scope.value_series_types = [
            {name: translate('CONFIG.WIDGET.LINE'), value: 'line'},
            {name: translate('CONFIG.WIDGET.BAR'), value: 'bar'},
            {name: translate('CONFIG.WIDGET.STACKED_BAR'), value: 'stackbar'},
            {name: translate('CONFIG.WIDGET.PERCENT_BAR'), value: 'percentbar'}
        ];

        $scope.value_aggregate_types = [
            {name: 'sum', value: 'sum'},
            {name: 'count', value: 'count'},
            {name: 'avg', value: 'avg'},
            {name: 'max', value: 'max'},
            {name: 'min', value: 'min'},
            {name: 'distinct', value: 'distinct'}
        ];

        $scope.kpi_styles = [
            {name: translate('CONFIG.WIDGET.AQUA'), value: 'bg-aqua'},
            {name: translate('CONFIG.WIDGET.RED'), value: 'bg-red'},
            {name: translate('CONFIG.WIDGET.GREEN'), value: 'bg-green'},
            {name: translate('CONFIG.WIDGET.YELLOW'), value: 'bg-yellow'}
        ];

        $scope.configRule = {
            line: {keys: 0, groups: 0, filters: 0, values: 0},
            pie: {keys: 0, groups: 0, filters: 0, values: 0},
            kpi: {keys: -1, groups: -1, filters: 0, values: 1},
            table: {keys: 0, groups: 0, filters: 0, values: 0},
            funnel: {keys: 0, groups: -1, filters: 0, values: 0},
            sankey: {keys: 0, groups: 0, filters: 0, values: 1},
            radar: {keys: 0, groups: 0, filters: 0, values: 0},
            map: {keys: 0, groups: 0, filters: 0, values: 0},
            scatter: {keys: 0, groups: 0, filters: 0, values: 0},
        };

        //界面控制
        $scope.loading = false;
        $scope.toChartDisabled = true;
        $scope.optFlag = '';
        $scope.alerts = [];
        $scope.treeData = [];
        var originalData = [];
        var treeID = 'widgetTreeID'; // Set to a same value with treeDom

        $scope.datasource;
        $scope.widgetName;
        $scope.widgetCategory;
        $scope.widgetId;
        $scope.curWidget = {};
        $scope.previewDivWidth = 12;
        $scope.expressions = [];
        $scope.customDs = false;
        $scope.loadFromCache = true;
        $scope.filterSelect = {};
        $scope.verify = {widgetName: true};

        $http.get("dashboard/getDatasetList.do").success(function (response) {
            $scope.datasetList = response;
        });

        $http.get("dashboard/getDatasetCategoryList.do").success(function (response) {
            $scope.datasetCategoryList = response;
        });

        $http.get("dashboard/getDatasourceList.do").success(function (response) {
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
            $http.get("dashboard/getWidgetList.do").success(function (response) {
                $scope.widgetList = response;
                if (callback) {
                    callback();
                }
                $scope.searchNode();
            });
        };

        var getCategoryList = function () {
            $http.get("dashboard/getWidgetCategoryList.do").success(function (response) {
                $scope.categoryList = response;
                $("#widgetName").autocomplete({
                    source: $scope.categoryList
                });
            });
        };

        $scope.editExp = function (col) {
            var selects = schemaToSelect($scope.schema);
            var aggregate = $scope.value_aggregate_types;
            var curWidget = $scope.curWidget;
            var ok;
            var data = {expression: ''};
            if (!col) {
                ok = function (data) {
                    $scope.expressions.push({
                        type: 'exp',
                        exp: data.expression,
                        alias: data.alias
                    });
                }
            } else {
                data.expression = col.exp;
                data.alias = col.alias;
                ok = function (data) {
                    col.exp = data.expression;
                    col.alias = data.alias;
                }
            }

            $uibModal.open({
                templateUrl: 'org/cboard/view/config/modal/exp.html',
                windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
                backdrop: false,
                size: 'lg',
                controller: function ($scope, $uibModalInstance) {
                    $scope.data = data;
                    $scope.curWidget = curWidget;
                    $scope.selects = selects;
                    $scope.aggregate = aggregate;
                    $scope.alerts = [];
                    $scope.close = function () {
                        $uibModalInstance.close();
                    };
                    $scope.expAceOpt = expEditorOptions(selects, aggregate);
                    $scope.addToken = function (str, agg) {
                        var tc = document.getElementById("expression_area");
                        var tclen = $scope.data.expression.length;
                        tc.focus();
                        var selectionIdx = 0;
                        if (typeof document.selection != "undefined") {
                            document.selection.createRange().text = str;
                            selectionIdx = str.length - 1;
                        }
                        else {
                            var a = $scope.data.expression.substr(0, tc.selectionStart);
                            var b = $scope.data.expression.substring(tc.selectionStart, tclen);
                            $scope.data.expression = a + str;
                            selectionIdx = $scope.data.expression.length - 1;
                            $scope.data.expression += b;
                        }
                        if (!agg) {
                            selectionIdx++;
                        }
                        tc.selectionStart = selectionIdx;
                        tc.selectionEnd = selectionIdx;
                    };
                    $scope.verify = function () {
                        $scope.alerts = [];
                        var v = verifyAggExpRegx($scope.data.expression);
                        $scope.alerts = [{
                            msg: v.isValid ? translate("COMMON.SUCCESS") : v.msg,
                            type: v.isValid ? 'success' : 'danger'
                        }];
                    };
                    $scope.ok = function () {
                        if (!$scope.data.alias) {
                            ModalUtils.alert(translate('CONFIG.WIDGET.ALIAS') + translate('COMMON.NOT_EMPTY'), "modal-warning", "lg");
                            return;
                        }
                        ok($scope.data);
                        $uibModalInstance.close();
                    };
                }
            });
        };

        $scope.loadData = function () {
            $scope.toChartDisabled = false;
            $scope.newConfig();
            $scope.filterSelect = {};
            loadDsExpressions();
            loadDsFilterGroups();
            buildSchema();
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
            $scope.schema = null;
            addValidateWatch();
        };

        var loadDsFilterGroups = function () {
            $scope.filterGroups = [];
            if (!$scope.customDs) {
                var fg = angular.copy(_.find($scope.datasetList, function (ds) {
                    return ds.id == $scope.curWidget.datasetId;
                }).data.filters);
                _.each(fg, function (e) {
                    delete e.filters;
                });
                if (fg) {
                    $scope.filterGroups = fg.filter(function (g) {
                        var dupDefine = _.find($scope.curWidget.config.filters, function (f) {
                            return g.group == f.group;
                        });
                        return _.isUndefined(dupDefine);
                    });
                }
            }
        };

        var loadDsExpressions = function () {
            if ($scope.customDs) {
                $scope.expressions = [];
            } else {
                var dsExp = angular.copy(_.find($scope.datasetList, function (ds) {
                    return ds.id == $scope.curWidget.datasetId;
                }).data.expressions);
                _.each(dsExp, function (e) {
                    e.type = 'exp_link';
                    delete e.exp;
                });
                if (dsExp) {
                    $scope.expressions = dsExp.filter(function (g) {
                        var dupDefine = true;
                        _.each($scope.curWidget.config.values, function (v) {
                            if (!dupDefine) {
                                return;
                            }
                            dupDefine = _.isUndefined(_.find(v.cols, function (f) {
                                return g.alias == f.alias && f.type == 'exp_link';
                            }));
                        });
                        return dupDefine;
                    });
                }

            }
        };

        var addWatch = function () {
            $scope.$watch('curWidget.config.keys', changeChartStatus, true);
            $scope.$watch('curWidget.config.groups', changeChartStatus, true);
            $scope.$watch('curWidget.config.values', changeChartStatus, true);
            $scope.$watch('curWidget.config.filters', changeChartStatus, true);
            addValidateWatch();
        };

        var addValidateWatch = function () {
            $scope.$watch('widgetName', clearAlert, true);
            $scope.$watch('curWidget.datasetId', clearAlert, true);
        };
        var clearAlert = function () {
            $scope.alerts = [];
            $scope.verify = {widgetName: true};
        };
        var validation = function () {
            $scope.alerts = [];
            $scope.verify = {widgetName: true};
            if (!$scope.widgetName) {
                $scope.alerts = [{
                    msg: translate('CONFIG.WIDGET.WIDGET_NAME') + translate('COMMON.NOT_EMPTY'),
                    type: 'danger'
                }];
                $scope.verify = {widgetName: false};
                $("#widgetName").focus();
                return false;
            }
            if ($scope.customDs == false && $scope.curWidget.datasetId == undefined) {
                $scope.alerts = [{
                    msg: translate('CONFIG.WIDGET.DATASET') + translate('COMMON.NOT_EMPTY'),
                    type: 'danger'
                }];
                return false;
            }
            return true;
        };
        var changeChartStatus = function () {
            for (var type in $scope.chart_types_status) {
                var rule = $scope.configRule[type];
                var config = $scope.curWidget.config;
                for (var k in rule) {
                    var r = true;
                    if (k == 'values') {
                        if (rule[k] == -1) {
                            r = config[k].length == 1 && config[k][0].cols.length <= 1;
                        } else if (rule[k] > 0) {
                            var l = 0;
                            _.each(config[k], function (c) {
                                l += c.cols.length;
                            });
                            r = l <= rule[k];
                        }
                    } else {
                        if (rule[k] == -1 && config[k] != undefined) {
                            r = config[k].length == 0
                        } else if (rule[k] > 0) {
                            r = config[k].length <= rule[k];
                        }
                    }
                    if (!r) {
                        $scope.chart_types_status[type] = r;
                        break;
                    }
                }
                $scope.chart_types_status[type] = r;
            }
        };

        $scope.changeChart = function (chart_type) {
            if (!$scope.chart_types_status[chart_type]) {
                return;
            }
            var oldConfig = angular.copy($scope.curWidget.config);
            $scope.curWidget.config = {};
            $scope.curWidget.config.chart_type = chart_type;
            //loadDsExpressions();
            cleanPreview();

            $scope.curWidget.config.selects = oldConfig.selects;
            $scope.curWidget.config.keys = oldConfig.keys;
            $scope.curWidget.config.groups = oldConfig.groups;
            $scope.curWidget.config.values = [];

            $scope.curWidget.config.filters = oldConfig.filters;
            switch ($scope.curWidget.config.chart_type) {
                case 'line':
                    _.each(oldConfig.values, function (v) {
                        $scope.curWidget.config.values.push({name: v.name, cols: v.cols});
                    });
                    $scope.curWidget.config.valueAxis = 'vertical';
                    _.each($scope.curWidget.config.values, function (v) {
                        v.series_type = 'line';
                        v.type = 'value';
                    });
                    break;
                case 'kpi':
                    $scope.curWidget.config.values.push({name: '', cols: []});
                    _.each(oldConfig.values, function (v) {
                        _.each(v.cols, function (c) {
                            $scope.curWidget.config.values[0].cols.push(c);
                        });
                    });
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    _.each($scope.curWidget.config.values, function (v) {
                        v.style = 'bg-aqua';
                    });
                    break;
                case 'scatter':
                    var i = 0;
                    _.each(oldConfig.values, function (v) {
                        _.each(v.cols, function (c) {
                            if (i >= 3) {
                                $scope.curWidget.config.selects.push(c.col);
                                return;
                            }
                            if (!$scope.curWidget.config.values[i]) {
                                $scope.curWidget.config.values[i] = {name: '', cols: []};
                            }
                            $scope.curWidget.config.values[i].cols.push(c);
                            i++
                        });
                    });
                    for (var i = 0; i < 3; i++) {
                        if (!$scope.curWidget.config.values[i]) {
                            $scope.curWidget.config.values[i] = {name: '', cols: []};
                        }
                    }
                    break;
                default:
                    $scope.curWidget.config.values.push({name: '', cols: []});
                    _.each(oldConfig.values, function (v) {
                        _.each(v.cols, function (c) {
                            $scope.curWidget.config.values[0].cols.push(c);
                        });
                    });
                    break;
            }
            _.each($scope.curWidget.config.values, function (v) {
                _.each(v.cols, function (c) {
                    delete c.formatter;
                });
            });
            $scope.preview();
        };

        $scope.newConfig = function () {
            $scope.curWidget.config = {};
            $scope.curWidget.config.chart_type = 'table';
            cleanPreview();
            switch ($scope.curWidget.config.chart_type) {
                case 'line':
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.keys = new Array();
                    $scope.curWidget.config.groups = new Array();
                    $scope.curWidget.config.values = new Array();
                    $scope.curWidget.config.filters = new Array();
                    $scope.curWidget.config.valueAxis = 'vertical';
                    $scope.add_value();
                    break;
                case 'pie':
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.keys = new Array();
                    $scope.curWidget.config.groups = new Array();
                    $scope.curWidget.config.values = [{
                        name: '',
                        cols: []
                    }];
                    $scope.curWidget.config.filters = new Array();
                    break;
                case 'kpi':
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.values = [{
                        name: '',
                        cols: [],
                        style: 'bg-aqua'
                    }];
                    $scope.curWidget.config.filters = new Array();
                    break;
                case 'table':
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.keys = new Array();
                    $scope.curWidget.config.groups = new Array();
                    $scope.curWidget.config.values = [{
                        name: '',
                        cols: []
                    }];
                    $scope.curWidget.config.filters = new Array();
                    break;
                case 'funnel':
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.keys = new Array();
                    $scope.curWidget.config.values = [{
                        name: '',
                        cols: []
                    }];
                    $scope.curWidget.config.filters = new Array();
                    break;
                case 'sankey':
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.keys = new Array();
                    $scope.curWidget.config.groups = new Array();
                    $scope.curWidget.config.values = [{
                        name: '',
                        cols: []
                    }];
                    $scope.curWidget.config.filters = new Array();
                    break;
                case 'radar':
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.keys = new Array();
                    $scope.curWidget.config.groups = new Array();
                    $scope.curWidget.config.values = [{
                        name: '',
                        cols: []
                    }];
                    $scope.curWidget.config.filters = new Array();
                    break;
                case 'map':
                    $scope.curWidget.config.selects = angular.copy($scope.columns);
                    $scope.curWidget.config.keys = new Array();
                    $scope.curWidget.config.groups = new Array();
                    $scope.curWidget.config.values = [{
                        name: '',
                        cols: []
                    }];
                    $scope.curWidget.config.filters = new Array();
                    break;
            }
            addWatch();
        };

        var cleanPreview = function () {
            $('#preview_widget').html("");
            $('#viewQuery_widget').html("");
            $scope.viewQueryMoal = false;
        };

        $scope.previewQuery = function () {
            cleanPreview();
            $scope.loadingPre = true;
            dataService.viewQuery({
                config: $scope.curWidget.config,
                datasource: $scope.datasource ? $scope.datasource.id : null,
                query: $scope.curWidget.query,
                datasetId: $scope.customDs ? null : $scope.curWidget.datasetId
            }, function (query) {
                var querybr = query.trim().replace(/\n/g, '<br/>').replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
                $('#viewQuery_widget').html("<div class='alert alert-info' role='alert' style='text-align: left;'>" + querybr + "</div>");
                $scope.loadingPre = false;
                $scope.viewQueryMoal = true;
            });
        };

        $scope.preview = function () {
            cleanPreview();
            $scope.loadingPre = true;
            chartService.render($('#preview_widget'), {
                config: $scope.curWidget.config,
                datasource: $scope.datasource ? $scope.datasource.id : null,
                query: $scope.curWidget.query,
                datasetId: $scope.customDs ? null : $scope.curWidget.datasetId
            }, function (option) {
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
                    case 'map':
                        $scope.previewDivWidth = 12;
                        break;
                }
                $scope.loadingPre = false;
            }, null, !$scope.loadFromCache);
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
            if (!validation()) {
                return;
            }

            var o = {};
            o.name = $scope.widgetName.slice($scope.widgetName.lastIndexOf("/") + 1).trim();
            o.categoryName = $scope.widgetName.substring(0, $scope.widgetName.lastIndexOf("/")).trim();
            if (o.categoryName == '') {
                o.categoryName = translate("COMMON.DEFAULT_CATEGORY");
            }
            o.data = {};
            o.data.config = $scope.curWidget.config;
            if ($scope.customDs) {
                o.data.query = $scope.curWidget.query;
                o.data.datasource = $scope.datasource.id;
            } else {
                o.data.datasetId = $scope.curWidget.datasetId;
            }
            $scope.alerts = [];
            $scope.verify = {widgetName: true};

            if (o.name == null || o.name == "") {
                $scope.alerts = [{
                    msg: translate('CONFIG.WIDGET.WIDGET_NAME') + translate('COMMON.NOT_EMPTY'),
                    type: 'danger'
                }];
                $scope.verify = {widgetName: false};
                $("#widgetName").focus();
                return;
            } else if (o.data.datasetId == undefined && $scope.customDs == false) {
                $scope.alerts = [{
                    msg: translate('CONFIG.WIDGET.DATASET') + translate('COMMON.NOT_EMPTY'),
                    type: 'danger'
                }];
                return;
            }

            if ($scope.optFlag == 'new') {
                $http.post("dashboard/saveNewWidget.do", {json: angular.toJson(o)}).success(function (serviceStatus) {
                    if (serviceStatus.status == '1') {
                        getWidgetList();
                        getCategoryList();
                        ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                    } else {
                        $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
                    }
                });
            } else if ($scope.optFlag == 'edit') {
                o.id = $scope.widgetId;
                $http.post(updateUrl, {json: angular.toJson(o)}).success(function (serviceStatus) {
                    if (serviceStatus.status == '1') {
                        getWidgetList();
                        getCategoryList();
                        ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                    } else {
                        $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
                    }
                });
            }
        };

        $scope.editWgt = function (widget) {
            $http.post("dashboard/checkWidget.do", {id: widget.id}).success(function (response) {
                if (response.status == '1') {
                    doEditWgt(widget);
                } else {
                    var d = widget.data.datasetId ? 'CONFIG.WIDGET.DATASET' : 'CONFIG.WIDGET.DATA_SOURCE';
                    ModalUtils.alert(translate("ADMIN.CONTACT_ADMIN") + "：" + translate(d) + '/' + response.msg, "modal-danger", "lg");
                }
            });
        };

        var doEditWgt = function (widget) {
            cleanPreview();
            $timeout(function () {
                switchNode(widget.id)
            }, 500);
            switchNode(widget.id);
            $('#preview_widget').html('');
            $scope.curWidget = angular.copy(widget.data);
            updateService.updateConfig($scope.curWidget.config);
            $scope.datasource = _.find($scope.datasourceList, function (ds) {
                return ds.id == widget.data.datasource;
            });

            $scope.widgetName = angular.copy(widget.categoryName + "/" + widget.name);

            $scope.widgetId = widget.id;
            $scope.optFlag = 'edit';
            $scope.customDs = _.isUndefined($scope.curWidget.datasetId);
            loadDsExpressions();
            loadDsFilterGroups();
            addWatch();
            buildSchema();
        };

        $scope.filterDimension = function (e) {
            if (e.type == 'level') {
                return true;
            }
            var keys = _.find($scope.curWidget.config.keys, function (k) {
                return k.col == e.column;
            });
            var groups = _.find($scope.curWidget.config.groups, function (k) {
                return k.col == e.column;
            });
            return !(keys || groups);
        };

        var buildSchema = function () {
            var loadFromDataset = false;
            if (!$scope.customDs) {
                $scope.dataset = _.find($scope.datasetList, function (ds) {
                    return ds.id == $scope.curWidget.datasetId;
                });
                if ($scope.dataset.data.schema) {
                    loadFromDataset = true;
                }
            }
            if (loadFromDataset) {
                $scope.schema = $scope.dataset.data.schema;
                $scope.alerts = [];
            } else {
                $scope.loading = true;
                dataService.getColumns({
                    datasource: $scope.datasource ? $scope.datasource.id : null,
                    query: $scope.curWidget.query,
                    datasetId: $scope.customDs ? null : $scope.curWidget.datasetId,
                    reload: !$scope.loadFromCache,
                    callback: function (dps) {
                        $scope.loading = false;
                        $scope.alerts = [];
                        if (dps.msg == "1") {
                            $scope.schema = {selects: []};
                            _.each(dps.columns, function (e) {
                                $scope.schema.selects.push({column: e});
                            });
                        } else {
                            $scope.alerts = [{msg: dps.msg, type: 'danger'}];
                        }
                    }
                });
            }
        };

        $scope.deleteWgt = function (widget) {
            ModalUtils.confirm(translate("COMMON.CONFIRM_DELETE"), "modal-info", "lg", function () {
                $http.post("dashboard/deleteWidget.do", {id: widget.id}).success(function (serviceStatus) {
                    if (serviceStatus.status == '1') {
                        getWidgetList();
                    } else {
                        ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                    }
                    $scope.optFlag == 'none';
                });
            });
        };

        $scope.copyWgt = function (widget) {
            var o = angular.copy(widget);
            o.name = o.name + "_copy";
            $http.post("dashboard/saveNewWidget.do", {json: angular.toJson(o)}).success(function (serviceStatus) {
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
                return 'dashboard/getConfigView.do?type=' + $scope.datasource.type;
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
                } else if (type == 'select' || type == 'measure') {
                    list[index] = {col: item.column, aggregate_type: 'sum'};
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
                    list[index] = {col: item.col, type: 'eq', values: [], sort: 'asc'};
                } else if (type == 'dimension' || type == 'select') {
                    list[index] = {
                        alias: item.alias,
                        col: item.column,
                        type: 'eq',
                        values: [],
                        sort: 'asc'
                    };
                }
            }
        };

        $scope.selectsByFilter = [];
        $scope.selects = [];
        $scope.editFilter = function (setbackArr, setbackIdx) {
            var status = {i: 1};

            var item = setbackArr[setbackIdx];
            var col;
            if (item.col) {
                col = angular.copy(item);
            } else {
                col = {col: item, type: 'eq', values: []}
            }

            var config = angular.copy($scope.curWidget.config);
            var arr = _.findKey($scope.curWidget.config, function (o) {
                return o == setbackArr;
            });
            config[arr].splice(setbackIdx, 1);
            dataService.getDimensionValues($scope.datasource ? $scope.datasource.id : null, $scope.curWidget.query, $scope.customDs ? null : $scope.curWidget.datasetId, col.col, config, function (filtered, nofilter) {
                $scope.selectsByFilter = filtered;
                $scope.selects = nofilter;
                status.i--;
            });
            $uibModal.open({
                templateUrl: 'org/cboard/view/config/modal/filter.html',
                windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
                backdrop: false,
                size: 'lg',
                scope: $scope,
                controller: function ($scope, $uibModalInstance) {
                    $scope.status = status;
                    $scope.type = ['=', '≠', '>', '<', '≥', '≤', '(a,b]', '[a,b)', '(a,b)', '[a,b]'];
                    $scope.byFilter = true;
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

        $scope.editVFilter = function (o) {
            $uibModal.open({
                templateUrl: 'org/cboard/view/config/modal/vfilter.html',
                windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
                backdrop: false,
                size: 'lg',
                controller: function ($scope, $uibModalInstance) {
                    $scope.type = ['=', '≠', '>', '<', '≥', '≤', '(a,b]', '[a,b)', '(a,b)', '[a,b]'];
                    $scope.f_type = o.f_type ? o.f_type : '>';
                    $scope.f_values = o.f_values ? o.f_values : [];
                    $scope.f_top = o.f_top ? o.f_top : '';
                    $scope.close = function () {
                        $uibModalInstance.close();
                    };
                    $scope.ok = function () {
                        o.f_type = $scope.f_type;
                        o.f_values = $scope.f_values;
                        o.f_top = $scope.f_top;
                        $uibModalInstance.close();
                    };
                }
            });
        };

        var schemaToSelect = function (schema) {
            if (schema.selects) {
                return angular.copy(schema.selects);
            } else {
                var selects = [];
                selects = selects.concat($scope.schema.measure);
                _.each($scope.schema.dimension, function (e) {
                    if (e.type == 'level') {
                        _.each(e.columns, function (c) {
                            selects.push(c);
                        });
                    } else {
                        selects.push(e);
                    }
                });
                return angular.copy(selects);
            }
        };

        $scope.editFilterGroup = function (col) {
            var selects = schemaToSelect($scope.schema);
            $uibModal.open({
                templateUrl: 'org/cboard/view/config/modal/filterGroup.html',
                windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
                backdrop: false,
                scope: $scope,
                controller: function ($scope, $uibModalInstance) {
                    $scope.data = angular.copy(col);
                    $scope.selects = selects;
                    $scope.close = function () {
                        $uibModalInstance.close();
                    };
                    $scope.addColumn = function (str) {
                        $scope.data.filters.push({col: str, type: '=', values: []})
                    };
                    $scope.ok = function () {
                        col.group = $scope.data.group;
                        col.filters = $scope.data.filters;
                        $uibModalInstance.close();
                    };
                    $scope.editFilter = function (filter) {
                        $uibModal.open({
                            templateUrl: 'org/cboard/view/config/modal/dsFilter.html',
                            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
                            backdrop: false,
                            size: 'lg',
                            controller: function ($scope, $uibModalInstance) {
                                $scope.filter = angular.copy(filter);
                                $scope.type = ['=', '≠', '>', '<', '≥', '≤', '(a,b]', '[a,b)', '(a,b)', '[a,b]'];
                                $scope.close = function () {
                                    $uibModalInstance.close();
                                };
                                $scope.selected = function (v) {
                                    return _.indexOf($scope.col.values, v) == -1
                                };
                                $scope.ok = function () {
                                    filter.type = $scope.filter.type;
                                    filter.values = $scope.filter.values;
                                    $uibModalInstance.close();
                                };
                            }
                        });
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

        $scope.cleanVSort = function () {
            _.each($scope.curWidget.config.values, function (v) {
                _.each(v.cols, function (c) {
                    c.sort = undefined;
                });
            });
        };

        $scope.cleanRowSort = function (o) {
            var sort = o.sort;
            _.each($scope.curWidget.config.keys, function (k) {
                k.sort = undefined;
            });
            $scope.cleanVSort();
            o.sort = sort;
        };

        $scope.showTooltip = function (chart, e) {
            if (chart.isDisabled) {
                return;
            }
            var $curTarget = $(e.currentTarget),
                _tooltip = $curTarget.find(".chart-tip");
            _tooltip.show();
        };
        $scope.hideTooltip = function (chart, e) {
            if (chart.isDisabled) {
                return;
            }
            var $curTarget = $(e.currentTarget),
                _tooltip = $curTarget.find(".chart-tip");
            _tooltip.hide();
        };

        /** js tree related start... **/
        $scope.treeConfig = jsTreeConfig1;

        $("#" + treeID).keyup(function (e) {
            if (e.keyCode == 46) {
                $scope.deleteNode();
            }
        });

        var getSelectedWidget = function () {
            var selectedNode = jstree_GetSelectedNodes(treeID)[0];
            return _.find($scope.widgetList, function (w) {
                return w.id == selectedNode.id;
            });
        };

        var checkTreeNode = function (actionType) {
            return jstree_CheckTreeNode(actionType, treeID, ModalUtils.alert);
        };

        var switchNode = function (id) {
            $scope.ignoreChanges = false;
            var widgetTree = jstree_GetWholeTree(treeID);
            widgetTree.deselect_all();
            widgetTree.select_node(id);
        };

        $scope.applyModelChanges = function () {
            return !$scope.ignoreChanges;
        };

        $scope.copyNode = function () {
            if (!checkTreeNode("copy")) return;
            $scope.copyWgt(getSelectedWidget());
        };

        $scope.editNode = function () {
            if (!checkTreeNode("edit")) return;
            $scope.editWgt(getSelectedWidget());
        };

        $scope.deleteNode = function () {
            if (!checkTreeNode("delete")) return;
            $scope.deleteWgt(getSelectedWidget());
        };
        $scope.searchNode = function () {
            var para = {wgtName: '', dsName: '', dsrName: ''};

            //map widgetList to list (add datasetName and datasourceName)
            var list = $scope.widgetList.map(function (w) {
                var ds = _.find($scope.datasetList, function (obj) {
                    return obj.id == w.data.datasetId
                });
                var dsrName = '';
                if (ds) {
                    dsrName = _.find($scope.datasourceList, function (obj) {
                        return obj.id == ds.data.datasource
                    }).name;
                } else if (w.data.datasource) {
                    _.find($scope.datasourceList, function (obj) {
                        return obj.id == w.data.datasource
                    }).name
                }
                return {
                    "id": w.id,
                    "name": w.name,
                    "categoryName": w.categoryName,
                    "datasetName": ds ? ds.name : '',
                    "datasourceName": dsrName
                };
            });

            //split search keywords
            if ($scope.keywords) {
                if ($scope.keywords.indexOf(' ') == -1 && $scope.keywords.indexOf(':') == -1) {
                    para.wgtName = $scope.keywords;
                } else {
                    var keys = $scope.keywords.split(' ');
                    for (var i = 0; i < keys.length; i++) {
                        var w = keys[i].trim();
                        if (w.split(':')[0] == 'wg') {
                            para["wgtName"] = w.split(':')[1];
                        }
                        if (w.split(':')[0] == 'ds') {
                            para["dsName"] = w.split(':')[1];
                        }
                        if (w.split(':')[0] == 'dsr') {
                            para["dsrName"] = w.split(':')[1];
                        }
                    }
                }
            }
            //filter data by keywords
            originalData = jstree_CvtVPath2TreeData(
                $filter('filter')(list, {name: para.wgtName, datasetName: para.dsName, datasourceName: para.dsrName})
            );

            jstree_ReloadTree(treeID, originalData);
        };
        $scope.treeEventsObj = function () {
            var baseEventObj = jstree_baseTreeEventsObj({
                ngScope: $scope, ngHttp: $http, ngTimeout: $timeout,
                treeID: treeID, listName: "widgetList", updateUrl: updateUrl
            });
            return baseEventObj;
        }();
        /** js tree related End... **/


        /** Ace Editor Starer... **/
        $scope.queryAceOpt = datasetEditorOptions();
    }
)
;